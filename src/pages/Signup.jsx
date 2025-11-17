import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Form from "../components/Form/Form";

import {
  setName,
  setEmail,
  setPassword,
  setRole,
  setClearInputBox,
  createUserThunk,
  setErrorEmpty,
  updateUserThunk,
} from "../store/reducers/user.reducer";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../context";

const Signup = ({ create, update }) => {
  // To navigate programmatically after successful signup
  const navigate = useNavigate();
  const { name, email, password, role, success, error } = useSelector(
    (store) => store.user
  );
  const { userId, setUserId, userDetails, setUserDetails } =
    useContext(UserContext);

  const dispatch = useDispatch();

  // Handling name input change
  const handleSignupName = (e) => {
    dispatch(setName(e.target.value));
  };

  // Handling email input change
  const handleSignupEmail = (e) => {
    dispatch(setEmail(e.target.value));
  };

  // Handling password input change
  const handleSignupPassword = (e) => {
    dispatch(setPassword(e.target.value));
  };
  // Handling role
  const handleSignupRole = (e) => {
    dispatch(setRole(e.target.value));
  };

  useEffect(() => {
    if (update) {
      dispatch(setName(update.name));
      dispatch(setEmail(update.email));
      dispatch(setRole(update.role));
    } else {
      dispatch(setName(""));
      dispatch(setEmail(""));
      dispatch(setRole(""));
      setPassword("");
    }
  }, []);

  // Handle the signup process
  const handleSignup = async (e) => {
    try {
      e.preventDefault();
      // Check if all fields are filled
      if (!name || !email || !password || !role) {
        toast.error(
          "Please enter the all field required: 'Name', 'Email', 'Password', 'Role'."
        );
        return;
      }
      // Clear input fields after successful signup
      const user = await dispatch(
        createUserThunk({ username: name, email, password, role })
      );
      if (user.meta.requestStatus == "rejected") {
        return;
      }
      dispatch(setClearInputBox());
      if (create) {
        return;
      } else {
        navigate("/signin");
      }
    } catch (error) {
      console.log("Error while signup: ", error);
    }
  };

  const handleUpdate = async (e) => {
    try {
      e.preventDefault();
      // Check if all fields are filled
      if (!name || !email || !password || !role) {
        toast.error(
          "Please enter the all field required: 'Name', 'Email', 'Password', 'Role'."
        );
        return;
      }

      // Clear input fields after successful signup
      const user = await dispatch(
        updateUserThunk({
          uid: userId,
          displayName: name,
          email: email,
          password: password,
          role: role,
        })
      );
      console.log("User ", user.payload);

      if (user.meta.requestStatus == "rejected") {
        return;
      }
      const obj = {
        name: user.payload.displayName,
        email: user.payload.email,
        role: user.payload.role,
      };
      setUserDetails(obj);
      localStorage.setItem("userDetails", JSON.stringify(obj));
      dispatch(setClearInputBox());
      if (create) {
        return;
      } else if (update) {
        return;
      } else {
        navigate("/signin");
      }
    } catch (error) {
      console.log("Error while signup: ", error);
    }
  };

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(setErrorEmpty());
    }
    if (error) {
      toast.error(error);
      dispatch(setErrorEmpty());
    }
  }, [error, success]);

  return (
    <>
      <div className="signup-container">
        {!update && <h1>{create ? "Create User" : "Sign Up"}</h1>}
        {update && <h1>Update User</h1>}
        <Form
          handleSignupName={handleSignupName} // Passing handler for name field
          handleSignupEmail={handleSignupEmail} // Passing handler for email field
          handleSignupPassword={handleSignupPassword} // Passing handler for password field
          handleSignupRole={handleSignupRole} // handle Role
          handleSignup={handleSignup} // Passing the submit handler
          create={create}
          update={update}
          handleUpdate={handleUpdate}
        />
      </div>
    </>
  );
};

export default Signup;
