import { configureStore } from "@reduxjs/toolkit";
import homeReducer from "./reducers/home.reducer";
import cartReducer from "./reducers/cart.reducer";
import orderReducer from "./reducers/order.reducer";
import userReducer from "./reducers/user.reducer";

const store = configureStore({
  reducer: {
    home: homeReducer,
    cart: cartReducer,
    order: orderReducer,
    user: userReducer
  },
});

if(import.meta.env.VITE_FIR_NODE_ENV == "development"){
  console.log();
  window.store = store;
}

export default store;
