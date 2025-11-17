import { useSelector } from "react-redux";
import "./Form.css";
const Form = ({
  // 🟢 Signin Props
  handleSignEmail, // Handles change in signin email
  handleSignPassword, // Handles change in signin password
  handleSignin, // Handles signin form submission

  // 🔵 Signup Props
  handleSignupName, // Handles change in signup name
  handleSignupEmail, // Handles change in signup email
  handleSignupPassword, // Handles change in signup password
  handleSignupRole, //Handle Role
  handleSignup, // Handles signup form submission

  create,
  update,
  handleUpdate
}) => {
  const { name, email, password, role } = useSelector((store) => store.user);

  return (
    <>
      <form className="form-sign">
        {/* Name input (for Signup only) */}
        {handleSignupName && (
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={handleSignupName}
            required
            auto-complete="off"
          />
        )}
        {/* Email input for Signin */}
        {handleSignEmail && (
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={handleSignEmail}
            required
          />
        )}
        {/* Email input for Signup */}
        {handleSignupEmail && (
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={handleSignupEmail}
            required
            auto-complete="off"
            disabled={update?true:false}
          />
        )}
        {/* Password input for Signin */}
        {handleSignPassword && (
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={handleSignPassword}
            required
          />
        )}
        {/* Password input for Signup */}
        {handleSignupPassword && (
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={handleSignupPassword}
            required
          />
        )}
        {/* Role Select for Signup */}
        {handleSignupPassword && (
          <select value={role} onChange={handleSignupRole}>
            <option value="">Select Role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}
        {/* Submit Button: Either Sign In or Sign Up */}
        {handleSignin && <button onClick={handleSignin}>Sign In</button>}
        {handleSignup && !update && (
          <button onClick={handleSignup}>
            {create ? "Create User" : "Sign Up"}
          </button>
        )}
        {update && (
          <button onClick={handleUpdate}>
            Update User
          </button>
        )}
      </form>
    </>
  );
};

export default Form;
