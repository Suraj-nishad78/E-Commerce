import React, { useContext } from "react";
import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context";
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebaseinit";

const Navbar = () => {
  // Access userId and method to update it from context
  const { userId, setUserId, userDetails, setUserDetails, theme, setTheme } =
    useContext(UserContext);
  const navigate = useNavigate();

  const logoutUser = async () => {
    navigate("/signin"); // Redirect to home page
    await signOut(auth); // Sign out from Firebase Auth
    localStorage.clear(); // Clear local storage
    setUserId(""); // Clear context userId
    setUserDetails("");
    toast.success("You have successfully Logout!"); // Show toast
  };

  const handleTheme = () => {
    setTheme(!theme);
  };

  return (
    <>
      <div className="navbar-container">
        {/* App Title */}
        <div id="nav-title">
          <Link className="nav-link" to="/">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm3nxihNakgVW-ajUlSa55fuOrnhmwPsR4qA&s"
              alt="image"
            />
            <p>Busy Buy</p>
          </Link>
        </div>
        {/* Navigation Items */}
        <div id="nav-items">
          <ul>
            <li>
              <Link className="nav-link" to="/">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm3nxihNakgVW-ajUlSa55fuOrnhmwPsR4qA&s"
                  alt="home-image"
                />
                Home
              </Link>
            </li>
            {/* My Orders (Visible only if logged in) */}
            {userId && (
              <li>
                <Link className="nav-link" to="/myOrders">
                  <img
                    src="https://media.lordicon.com/icons/wired/flat/139-basket.svg"
                    alt="order-image"
                  />
                  My Orders
                </Link>
              </li>
            )}
            {/* Cart (Visible only if logged in) */}
            {userId && (
              <li>
                <Link className="nav-link" to="/cart">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGcyZeWoglMZ4CxywEZrJRq-johB_oGznFEg&s"
                    alt="cart-image"
                  />
                  Cart
                </Link>
              </li>
            )}
            <li>
              {/* Logout if logged in, otherwise Signin */}
              {userId ? (
                userDetails.role == "user" ? (
                  <Link
                    className="nav-link"
                    to="/Dashboard"
                    onClick={logoutUser}
                  >
                    <img
                      src="https://media.lordicon.com/icons/wired/lineal/2185-logout.gif"
                      alt="sign-image"
                    />
                    Logout
                  </Link>
                ) : (
                  <Link className="nav-link" to="/Dashboard">
                    <img
                      src="https://media.lordicon.com/icons/wired/lineal/2185-logout.gif"
                      alt="sign-image"
                    />
                    Dashboard
                  </Link>
                )
              ) : (
                <Link className="nav-link" to="/signin">
                  <img
                    src="https://media.lordicon.com/icons/wired/lineal/2185-logout.gif"
                    alt="sign-image"
                  />
                  Signin
                </Link>
              )}
            </li>
            <div className="theme-nav">
              <img
                className="theme"
                onClick={handleTheme}
                src={
                  theme
                    ? "https://png.pngtree.com/png-vector/20210823/ourmid/pngtree-dark-mode-icon-light-png-clipart-png-image_3811921.jpg"
                    : "https://static.thenounproject.com/png/1664849-200.png"
                }
                alt="theme"
              />
            </div>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
