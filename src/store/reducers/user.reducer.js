// src/store/slices/userSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser as firebaseDeleteUser,
} from "firebase/auth";
import { auth, db } from "../../../config/firebaseinit";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

//  * CREATE USER (signup)

export const createUserThunk = createAsyncThunk(
  "user/createUserThunk",
  async ({ email, password, username, role = "user" }, thunkAPI) => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = credential.user;

      if (username) {
        await updateProfile(user, {
          displayName: username,
        });
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: username ?? null,
        role,
        createdAt: serverTimestamp(),
      });

      return {
        uid: user.uid,
        email: user.email,
        name: username,
        role,
      };
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          return thunkAPI.rejectWithValue("This email is already registered.");
        case "auth/invalid-email":
          return thunkAPI.rejectWithValue("Invalid email format.");
        case "auth/weak-password":
          return thunkAPI.rejectWithValue(
            "Password should be at least 6 characters."
          );
        default:
          return thunkAPI.rejectWithValue("Signup failed: " + error.message);
      }
    }
  }
);

/**
 * SIGN IN
 */
export const signInThunk = createAsyncThunk(
  "user/signInThunk",
  async ({ email, password }, thunkAPI) => {
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredentials.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        return thunkAPI.rejectWithValue("User data not found in database.");
      }

      const userData = userDocSnap.data();

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: userData.role,
        createdAt: userData.createdAt,
      };
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          return thunkAPI.rejectWithValue("Invalid email address.");
        case "auth/invalid-credential":
          return thunkAPI.rejectWithValue("Incorrect email or password.");
        case "auth/user-not-found":
          return thunkAPI.rejectWithValue("No user found with this email.");
        default:
          return thunkAPI.rejectWithValue("Login failed: " + error.message);
      }
    }
  }
);

/**
 * UPDATE USER (no old password required)
 */
export const updateUserThunk = createAsyncThunk(
  "user/updateUserThunk",
  async ({ uid, displayName, email, password, role }, thunkAPI) => {
    if (!uid) {
      return thunkAPI.rejectWithValue("Missing user uid for update.");
    }

    try {
      const currentUser = auth.currentUser;

      // Prepare callable
      let functions;
      try {
        functions = getFunctions(); // default app / region
      } catch (err) {
        console.warn("getFunctions() failed:", err);
        functions = null;
      }

      const updateEmailCallable = functions
        ? httpsCallable(functions, "updateUserEmailServer")
        : null;

      // 1) If email provided, call server-side function to update Auth email + Firestore email
      if (typeof email !== "undefined" && email !== null) {
        if (!updateEmailCallable) {
          console.warn("Functions not available in client. Skipping callable and attempting client update (fallback).");
        } else {
          try {
            const resp = await updateEmailCallable({ uid, newEmail: email });
            // resp.data expected: { success: true, uid, email }
            if (!resp || !resp.data || !resp.data.success) {
              // Unexpected response payload
              console.error("updateUserEmailServer unexpected response:", resp);
              // continue to fallback behavior below
              throw new Error("Server returned unexpected response.");
            }
          } catch (err) {
            // Extract useful details from Functions error wrapper
            console.error("updateUserEmailServer callable error (raw):", err);
            const fnCode = err?.code || "";
            const fnMessage = err?.message || "";
            const fnDetails = err?.details || err?.toString?.();

            // If permission denied or already-exists, surface immediately
            if (fnCode && fnCode.includes("permission-denied")) {
              return thunkAPI.rejectWithValue("Not authorized to change this user's email.");
            }
            if (fnCode && (fnCode.includes("already-exists") || fnMessage.toLowerCase().includes("already"))) {
              return thunkAPI.rejectWithValue("This email is already in use.");
            }
            if (fnCode && fnCode.includes("invalid-argument")) {
              return thunkAPI.rejectWithValue("Invalid email address.");
            }

            // For internal or other errors, include function error details in payload for debugging
            const serverErrText = `Server callable error: code=${fnCode} message=${fnMessage} details=${JSON.stringify(fnDetails)}`;
            console.warn(serverErrText);

            // --- FALLBACK: attempt client-side updateEmail if user is signed-in as target ---
            if (currentUser && currentUser.uid === uid) {
              try {
                // Try direct client update as a fallback. This may still fail (requires-recent-login, etc).
                await updateEmail(currentUser, email);
                console.info("Client-side updateEmail succeeded as fallback.");
              } catch (clientErr) {
                console.error("Client-side updateEmail fallback failed:", clientErr);
                // Map known client errors
                if (clientErr?.code === "auth/requires-recent-login") {
                  return thunkAPI.rejectWithValue(
                    "Server email update failed and client update rejected: please re-login to update email (recent sign-in required). " +
                      serverErrText
                  );
                }
                if (clientErr?.code === "auth/invalid-email") {
                  return thunkAPI.rejectWithValue("Invalid email address.");
                }
                if (clientErr?.code === "auth/email-already-in-use") {
                  return thunkAPI.rejectWithValue("This email is already in use.");
                }
                // fallback: send both messages
                return thunkAPI.rejectWithValue(
                  "Server email update failed and client fallback failed: " +
                    (clientErr?.message || clientErr) +
                    " | server: " +
                    serverErrText
                );
              }
            } else {
              // no fallback possible: user not signed in as target
              return thunkAPI.rejectWithValue(
                "Server email update failed: " + serverErrText + " (no client fallback available - user not signed in as target account)."
              );
            }
          }
        }
      }

      // 2) Update displayName in Firebase Auth (client-side) if possible
      if (
        typeof displayName !== "undefined" &&
        currentUser &&
        currentUser.uid === uid
      ) {
        try {
          await updateProfile(currentUser, { displayName });
        } catch (err) {
          console.warn("updateProfile failed:", err);
          // continue
        }
      }

      // 3) Update password in Firebase Auth (client-side) if provided.
      if (
        typeof password !== "undefined" &&
        password !== "" &&
        currentUser &&
        currentUser.uid === uid
      ) {
        try {
          await updatePassword(currentUser, password);
        } catch (err) {
          console.error("updatePassword failed:", err);
          if (err.code === "auth/requires-recent-login") {
            return thunkAPI.rejectWithValue(
              "Please re-login to update your password (recent sign-in required)."
            );
          }
          if (err.code === "auth/weak-password") {
            return thunkAPI.rejectWithValue(
              "Password should be at least 6 characters."
            );
          }
          return thunkAPI.rejectWithValue(
            "Password update failed: " + (err.message || err)
          );
        }
      }

      // 4) Update Firestore document fields
      const userDocRef = doc(db, "users", uid);
      const updates = {};
      if (typeof displayName !== "undefined") updates.displayName = displayName;
      if (typeof role !== "undefined") updates.role = role;
      if (typeof email !== "undefined") updates.email = email; // safe to set after server/client update
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = serverTimestamp();
        await updateDoc(userDocRef, updates);
      }

      // 5) Read back latest Firestore user doc
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        return thunkAPI.rejectWithValue("User document not found in database.");
      }
      const userData = userDocSnap.data();

      return {
        uid,
        email: userData.email ?? (currentUser ? currentUser.email : null),
        displayName:
          userData.displayName ?? (currentUser ? currentUser.displayName : null),
        role: userData.role ?? null,
        updatedAt: userData.updatedAt ?? null,
      };
    } catch (error) {
      console.error("updateUserThunk unexpected error:", error);
      const code = error?.code;
      switch (code) {
        case "auth/invalid-email":
          return thunkAPI.rejectWithValue("Invalid email address.");
        case "auth/email-already-in-use":
          return thunkAPI.rejectWithValue("This email is already in use.");
        case "auth/weak-password":
          return thunkAPI.rejectWithValue(
            "Password should be at least 6 characters."
          );
        default:
          return thunkAPI.rejectWithValue(
            "Update failed: " + (error?.message || error)
          );
      }
    }
  }
);


// Delete user thunk: tries server-side callable first, falls back to client-side deletion.
export const deleteUserThunk = createAsyncThunk(
  "user/deleteUserThunk",
  async ({ uid }, thunkAPI) => {
    if (!uid) {
      return thunkAPI.rejectWithValue("User uid is required for deletion.");
    }

    try {
      // Try server-side deletion via callable function (recommended)
      // Make sure you've deployed a functions callable named "deleteUserServer"
      const functions = getFunctions();
      const deleteUserCallable = httpsCallable(functions, "deleteUserServer");

      try {
        const resp = await deleteUserCallable({ uid });
        // expected resp.data: { success: true, uid }
        if (resp && resp.data && resp.data.success) {
          return { uid };
        } else {
          // Unexpected server response, fall through to client attempt
          console.warn("deleteUserServer returned unexpected response:", resp);
        }
      } catch (fnErr) {
        // Map common callable errors to friendly messages
        console.error("deleteUserServer error:", fnErr);
        const code = fnErr?.code || "";
        const message = fnErr?.message || "";
        if (code.includes("permission-denied")) {
          return thunkAPI.rejectWithValue(
            "Not authorized to delete this user."
          );
        }
        if (
          code.includes("not-found") ||
          message.toLowerCase().includes("not found")
        ) {
          // if the server says user not found, still try local cleanup
          console.warn(
            "Server reports user not found, attempting client-side cleanup."
          );
        } else {
          // For other server failures, fall back to client-side deletion below
          console.warn(
            "Falling back to client-side deletion after server error."
          );
        }
      }

      // ---------- Fallback: client-side deletion ----------
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return thunkAPI.rejectWithValue(
          "Cannot delete account from client: user is not signed in as the target account. Try re-login or use the admin console."
        );
      }

      try {
        // Delete auth user
        await firebaseDeleteUser(currentUser);
      } catch (authErr) {
        // Common: requires recent login
        if (authErr && authErr.code === "auth/requires-recent-login") {
          return thunkAPI.rejectWithValue(
            "Recent sign-in required to delete account. Please sign in again and retry."
          );
        }
        // Other auth errors
        return thunkAPI.rejectWithValue(
          "Account deletion failed: " + (authErr?.message || authErr)
        );
      }

      // Delete Firestore user document
      try {
        const userDocRef = doc(db, "users", uid);
        await deleteDoc(userDocRef);
      } catch (fsErr) {
        // Auth user deleted but Firestore cleanup failed — surface a warning
        console.error(
          "Firestore cleanup failed after deleting auth user:",
          fsErr
        );
        return thunkAPI.rejectWithValue(
          "Account deleted from Auth but failed to remove user data from database: " +
            (fsErr?.message || fsErr)
        );
      }

      return { uid };
    } catch (error) {
      console.error("deleteUserThunk unexpected error:", error);
      return thunkAPI.rejectWithValue(
        "Delete failed: " + (error?.message || error)
      );
    }
  }
);

/**
 * INITIAL STATE & SLICE
 */
const INITIAL_STATE = {
  name: "",
  email: "",
  password: "",
  role: "",
  error: "",
  success: "",
};

const userSlice = createSlice({
  name: "user",
  initialState: INITIAL_STATE,
  reducers: {
    setName: (state, action) => {
      state.name = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    setPassword: (state, action) => {
      state.password = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setErrorEmpty: (state) => {
      state.error = "";
      state.success = "";
    },
    setClearInputBox: (state) => {
      state.name = "";
      state.email = "";
      state.password = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // create user
      .addCase(createUserThunk.pending, (state) => {
        state.error = "";
        state.success = "";
      })
      .addCase(createUserThunk.fulfilled, (state) => {
        state.success = "You Have Successfully Created a Account!.";
        state.error = "";
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.success = "";
      })

      // sign in
      .addCase(signInThunk.pending, (state) => {
        state.error = "";
        state.success = "";
      })
      .addCase(signInThunk.fulfilled, (state, action) => {
        state.success = "You have succeefully logged in!";
        state.error = "";
        state.name = action.payload.displayName ?? state.name;
        state.email = action.payload.email ?? state.email;
        state.role = action.payload.role ?? state.role;
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.success = "";
      })

      // update user
      .addCase(updateUserThunk.pending, (state) => {
        state.error = "";
        state.success = "";
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.success = "Profile updated successfully.";
        state.error = "";
        state.name = action.payload.displayName ?? state.name;
        state.email = action.payload.email ?? state.email;
        state.role = action.payload.role ?? state.role;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.success = "";
      })
      // inside extraReducers builder
      .addCase(deleteUserThunk.pending, (state) => {
        state.error = "";
        state.success = "";
      })
      .addCase(deleteUserThunk.fulfilled, (state, action) => {
        state.success = "Account deleted successfully.";
        state.error = "";
        // Optionally clear user fields
        state.name = "";
        state.email = "";
        state.password = "";
        state.role = "";
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        state.success = "";
      });
  },
});

export const {
  setName,
  setEmail,
  setPassword,
  setRole,
  setClearInputBox,
  setErrorEmpty,
} = userSlice.actions;

export default userSlice.reducer;
