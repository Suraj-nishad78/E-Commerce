import React, { useContext, useEffect, useState } from "react";
import "./pages.css";
import { UserContext } from "../context";
import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebaseinit";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";
import Add_Product from "../components/Product/Add_Product";
import { useDispatch } from "react-redux";
import Signup from "./Signup";
import {
  deleteProduct,
  getProductsByAdmin,
} from "../store/reducers/home.reducer";
import Card from "../components/card/Card";
import { deleteUserThunk } from "../store/reducers/user.reducer";

const Dashboad = () => {
  const [state, setState] = useState({
    dashboad: true,
    updateProfile: false,
    createProfile: false,
    addProduct: false,
    listProduct: false,
  });
  const [listProduct, setListProduct] = useState([]);
  const [proDetails, setProDetails] = useState(false);
  const [show, setShow] = useState(false);

  const { userId, setUserId, userDetails, setUserDetails } =
    useContext(UserContext);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleShow = (pro) => {
    setShow(true);
    setProDetails(pro);
  };

  const hideUpdateForm = () => {
    setShow(false);
    setProDetails(false);
  };

  const handleSideDash = (e) => {
    setState({
      dashboad: true,
      updateProfile: false,
      createProfile: false,
      addProduct: false,
      listProduct: false,
    });
  };
  const handleSideUP = (e) => {
    setState({
      dashboad: false,
      updateProfile: true,
      createProfile: false,
      addProduct: false,
      listProduct: false,
    });
  };
  const handleSideCP = (e) => {
    setState({
      dashboad: false,
      updateProfile: false,
      createProfile: true,
      addProduct: false,
      listProduct: false,
    });
  };
  const handleSidebarAdd = (e) => {
    setState({
      dashboad: false,
      updateProfile: false,
      createProfile: false,
      addProduct: true,
      listProduct: false,
    });
  };
  const handleListProduct = (e) => {
    setState({
      dashboad: false,
      updateProfile: false,
      createProfile: false,
      addProduct: false,
      listProduct: true,
    });
    fetchAdminProduct();
  };

  const fetchAdminProduct = async () => {
    const adminId = userId;
    const pro = await dispatch(getProductsByAdmin(adminId));
    setListProduct(pro.payload);
  };

  // https://img.freepik.com/free-vector/user-panel-dashboard-template_23-2148371011.jpg

  // Logout handler
  const logoutUser = async () => {
    await signOut(auth); // Sign out from Firebase Auth
    localStorage.clear(); // Clear local storage
    setUserId(""); // Clear context userId
    navigate("/signin"); // Redirect to home page
    fetchAdminProduct();
    setUserDetails("");
    toast.success("You have successfully Logout!"); // Show toast
  };

  const handleDelete = (id) => {
    const res = window.confirm("Are you Sure you want to delete the product?");
    if (!res) {
      return;
    }
    const productId = id;
    dispatch(deleteProduct(productId));
    fetchAdminProduct();
    // navigate("/");
    toast.success("Product Deleted Successfully!");
  };

  const handleDeleteUser = () => {
    // confirm then dispatch
    const res = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (res) {
      dispatch(deleteUserThunk({ uid: userId }))
        .unwrap()
        .then(() => {
          // optional: redirect to homepage/login
          navigate("/"); // if using react-router
          localStorage.clear(); // Clear local storage
          setUserId("");
          setUserDetails("");
          toast.success("Account deleted successfully!");
        })
        .catch((err) => {
          toast.error(err || "Account deletion failed.");
        });
    }
  };

  const handleProductDash = (pro) => {
    navigate("/Product_Dashboad", { state: pro });
  };

  return (
    <div className="dashboard-container">
      <div className="dash-sidebar">
        <div className="dash-user-details">
          <img
            src="https://st4.depositphotos.com/11634452/21365/v/450/depositphotos_213659488-stock-illustration-picture-profile-icon-human-people.jpg"
            alt="profile"
          />
          <p>{userDetails.name}</p>
        </div>
        <hr />
        <div className="dash-navigate">
          <div className="dash-home" onClick={handleSideDash}>
            <i class="fa-solid fa-house"></i>
            <p>Dashboard</p>
          </div>
          <div className="dash-home" onClick={handleSideUP}>
            <i class="fa-solid fa-user"></i>
            <p>Update Profile</p>
          </div>
          <div className="dash-home" onClick={handleSideCP}>
            <i class="fa-solid fa-circle-user"></i>
            <p>Create a User</p>
          </div>
          <div className="dash-home" onClick={handleSidebarAdd}>
            <i class="fa-solid fa-plus"></i>
            <p>Add a Products</p>
          </div>
          <div className="dash-home" onClick={handleListProduct}>
            <i class="fa-solid fa-list"></i>
            <p>List Of Products</p>
          </div>
          <div id="logout" onClick={logoutUser}>
            <i class="fa-solid fa-right-from-bracket"></i>
            <p>Logout</p>
          </div>
          <div id="delete" onClick={handleDeleteUser}>
            <i class="fa-solid fa-delete-left"></i>
            <p>Delete Account</p>
          </div>
        </div>
      </div>
      {state.addProduct && (
        <div className="dash-sidebar-content">
          <Add_Product />
        </div>
      )}
      {state.dashboad && (
        <div className="dash-welcome">
          <h1>
            Welcome to the dashboard — manage your products and insights here.
          </h1>
          {/* <p></p> */}
        </div>
      )}
      {state.listProduct && (
        <div className="user-list-product">
          {listProduct.length > 0 ? (
            listProduct.map((item, i) => (
              <div className="product-list">
                <img src={item.image} />
                <h1>
                  {item.title.length > 34
                    ? item.title.slice(0, 34) + "..."
                    : item.title}
                </h1>
                <p>Price: ₹{item.price}</p>
                <span onClick={()=>handleProductDash(item)}>No More</span>
                <div className="list-btn">
                  <button onClick={() => handleShow(item)}>Update</button>
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <h1 id="none">You don't have any product!</h1>
          )}
          {show && (
            <div className="update-form-dash">
              <Add_Product
                product={proDetails}
                hideUpdateForm={hideUpdateForm}
                fetchAdminProduct={fetchAdminProduct}
              />
            </div>
          )}
        </div>
      )}
      {state.createProfile && (
        <div className="cp-side">
          <Signup create={"create"} />
        </div>
      )}
      {state.updateProfile && (
        <div className="cp-side">
          <Signup update={userDetails} />
        </div>
      )}
    </div>
  );
};

export default Dashboad;
