import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getDocs } from "firebase/firestore";
import { orderRef } from "../../../config/firebaseinit";

 // Fetch orders from Firestore and store them in the 'orders' state
export const fetchOrderThunk = createAsyncThunk(
  "order/fetchOrderThunk",
  async (_, thunkAPI) => {
    const getOrders = await getDocs(orderRef); // Get all orders from Firestore
    const allOrders = getOrders.docs.map((order) => ({
      id: order.id,
      ...order.data(), // Map each order document to an object with the document data
    }));
    return allOrders;
  }
);

const INITIAL_STATE = {
  orders: [],
  userOrders: [],
  loader: false,
  error:""
};

const orderSlice = createSlice({
  name: "order",
  initialState: INITIAL_STATE,
  reducers: {
    setLoader: (state) => {
      state.loader = true;
    },
    setOrders: (state, action) => {
      state.loader = false;
      state.orders = action.payload;
    },
    setUserOrders: (state, action) => {
      state.userOrders = action.payload;
    },
    clearError:(state)=>{
      state.error = ""
    }
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchOrderThunk.pending, (state)=>{
      state.loader = true;
    })
    .addCase(fetchOrderThunk.fulfilled, (state, action)=>{
      state.loader = false;
      state.orders = action.payload;
    })
    .addCase(fetchOrderThunk.rejected, (state)=>{
      state.error = "Error occured while fetching orders.";
    })
  }
});

export const { setLoader, setOrders, setUserOrders, clearError } = orderSlice.actions;
export default orderSlice.reducer;
