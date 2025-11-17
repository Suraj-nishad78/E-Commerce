import "./pages.css";
import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context";
import { useDispatch } from "react-redux";
import { deleteProduct } from "../store/reducers/home.reducer";
import { toast } from "react-toastify";
import Add_Product from "../components/Product/Add_Product";

const Product_Dashboad = () => {
  const { state } = useLocation();
  const { userId, setUserId } = useContext(UserContext);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = () => {
    const res = window.confirm("Are you Sure you want to delete the product?");
    if (!res) {
      return;
    }
    const productId = state.id;
    dispatch(deleteProduct(productId));
    navigate("/");
    toast.success("Product Deleted Successfully!");
  };

  const openUpdateForm = () => {
    setShowUpdateForm(true);
  };
  const hideUpdateForm = () => {
    setShowUpdateForm(!showUpdateForm);
  };

  return (
    <>
      <div className="product-dash-container">
        <div className="dash-container">
          <div className="product-image">
            <img src={state.image} alt="product-image" />
          </div>
          <div className="product-dash-content">
            <h1>{state.title}</h1>
            {state.description ? (
              <p>{state.description}</p>
            ) : (
              <p>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatibus dignissimos quas explicabo tempore enim tenetur commodi iure expedita sit in?
              </p>
            )}
            <h3>Price: ₹{state.price}</h3>
            {((userId == state.adminId) && userId) && (
              <div className="dash-btn">
                <button onClick={openUpdateForm}>Update</button>
                <button onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showUpdateForm && (
        <div className="update-container">
          <Add_Product product={state} hideUpdateForm={hideUpdateForm} />
        </div>
      )}
    </>
  );
};

export default Product_Dashboad;
