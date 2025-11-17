import "./pages.css";
import { useContext, useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { orderRef } from "../../config/firebaseinit";
import { GridLoader } from "react-spinners";

import OrderTable from "../components/orderTable/OrderTable";
import { UserContext } from "../context";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchOrderThunk,
  setUserOrders,
  clearError
} from "../store/reducers/order.reducer";
import { toast } from "react-toastify";

const MyOrders = () => {
  // Access the userId from the context (global state)
  const { userId } = useContext(UserContext);
  const { orders, userOrders, loader, error } = useSelector((store) => store.order);
  const dispatch = useDispatch();

  // Filter orders to get only the ones belonging to the current user
  const getUserOrders = () => {
    const user = orders.filter((order) => order.userId == userId);
    dispatch(setUserOrders(user));
  };

  // Use effect to fetch orders when the component mounts
  useEffect(() => {
    dispatch(fetchOrderThunk());
  }, []);

  // Use effect to update userOrders whenever 'orders' state changes
  useEffect(() => {
    if(error){
      toast.error(error)
      dispatch(clearError())
    }
    getUserOrders();
  }, [orders, error]);

  return (
    <>
      {/* If userOrders has items, display them */}
      {userOrders.length ? (
        <div className="orders-container">
          <h1>Your Orders</h1>
          <div className="order-details">
            {userOrders.map((orders) => (
              <OrderTable key={orders.id} order={orders} /> // Render OrderTable component for each order
            ))}
          </div>
        </div>
      ) : loader ? (
        <div className="product-loader">
          <GridLoader color="#7864e4" size={15} speedMultiplier={1} width={5} />
        </div>
      ) : (
        <h1>No Order Found!</h1>
      )}
    </>
  );
};

export default MyOrders;
