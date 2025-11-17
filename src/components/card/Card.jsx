import { useContext, useEffect, useState } from "react";
import "./card.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  addDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { cartRef, db } from "../../../config/firebaseinit";
import {
  removeItemThunk,
  addToCartThunk,
} from "../../store/reducers/cart.reducer";

const Card = ({ products, removeBtn, addCartBtn }) => {
  const navigate = useNavigate();
  const { userId } = useContext(UserContext); //Retrieve userId from context
  const [showAdding, setShowAdding] = useState(false); // State to handle the loading state while adding
  const dispatch = useDispatch();

  // Function to check if a product already exists in the user's cart
  const checkProductInCart = async (id) => {
    try {
      const q = query(
        cartRef,
        where("productId", "==", id),
        where("userId", "==", userId)
      );
      const cartSnap = await getDocs(q);
      const existCartProduct = cartSnap.docs.map((cart) => ({
        id: cart.id,
        ...cart.data(),
      }));
      return existCartProduct;
    } catch (err) {
      console.log("Error while checking product exist: ", err);
    }
  };

  // Function to handle adding product to the cart
  const handleAddTocart = async (products) => {
    try {
      if (!userId) {
        navigate("/signin");
        toast.error("Please Login First!");
        return;
      }

      const checkCart = await checkProductInCart(products.id);
      if (checkCart.length) {
        setShowAdding(true);
        incProductQuantity(checkCart[0]);
        toast.success("Increase Product Count!");
        setShowAdding(false);
        return;
      }
      setShowAdding(true);
      await dispatch(addToCartThunk({ products, userId }));
      setShowAdding(false);
    } catch (error) {
      console.log("Error while add to cart product: ", error);
    }
  };

  // Function to increase the product quantity in the cart
  const incProductQuantity = async (product) => {
    try {
      const { id, ...rest } = products;
      const updatedProductDetails = {
        ...rest,
        quantity: product.quantity + 1,
      };
      const updatedProduct = doc(db, "cart", product.id);
      await updateDoc(updatedProduct, updatedProductDetails);
    } catch (err) {
      console.log("error while increasing quantiy of cart item: ", err);
    }
  };

  // Function to decrease the product quantity in the cart
  const decProductQuantity = async (product) => {
    try {
      const { id, ...rest } = products;
      const updatedProductDetails = {
        ...rest,
        quantity: product.quantity - 1,
      };
      if (updatedProductDetails.quantity == 0) {
        dispatch(removeItemThunk(products.id));
        return;
      }
      const updatedProduct = doc(db, "cart", product.id);
      await updateDoc(updatedProduct, updatedProductDetails);
    } catch (err) {
      console.log("error while increasing quantiy of cart item: ", err);
    }
  };

  const handleProductDash = () => {
    navigate("/Product_Dashboad", { state: products });
  };

  return (
    <>
      <div className="card-box">
        <div className="card-image">
          <img src={products.image} alt={products.title} />
        </div>
        <div className="card-content">
          <p>
            {/* Limit product title to 34 characters */}
            {products.title.length > 34
              ? products.title.slice(0, 34) + "..."
              : products.title}
          </p>
          <div id="price-quantity">
            <h3>₹ {products.price}</h3>
            {removeBtn && (
              // Display quantity manager if remove button is passed
              <div id="quantity-manage">
                <button onClick={() => decProductQuantity(products)}>
                  <i className="fa-solid fa-minus"></i>
                </button>
                <span>{products.quantity}</span>
                <button onClick={() => incProductQuantity(products)}>
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
            )}
          </div>

          <span id="product-dashboard" onClick={handleProductDash}>
            No More
          </span>
          {addCartBtn && (
            // Display add to cart button if addCartBtn prop is passed
            <>
              <button
                id="add-to-cart"
                onClick={() => handleAddTocart(products)}
                // onClick={() => dispatch(addToCartThunk({products, userId}))}
              >
                {showAdding ? "Adding" : "Add To Cart"}
              </button>
            </>
          )}
          {removeBtn && (
            // Display remove button if removeBtn prop is passed
            <button
              id="remove-cart"
              // onClick={() => handleRemoveProduct(products.id)}
              onClick={() => dispatch(removeItemThunk(products.id))}
            >
              Remove From Cart
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Card;
