import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addDoc, deleteDoc, doc } from "firebase/firestore";
import { cartRef, db } from "../../../config/firebaseinit";
import { toast } from "react-toastify";

export const removeItemThunk = createAsyncThunk(
  "cart/removeItemThunk",
  async (id, thunkAPI) => {
    const removeItem = doc(db, "cart", id);
    const item = await deleteDoc(removeItem);
    toast.success("Item Removed Successfully!");
    return item;
  }
);

// Function to handle adding product to the cart
export const addToCartThunk = createAsyncThunk(
  "cart/addToCartThunk",
  async ({ products, userId }, thunkAPI) => {
    const cartProductDetails = {
      userId,
      productId: products.id,
      title: products.title,
      image: products.image,
      price: products.price,
      quantity: 1,
    };
    const productAdded = await addDoc(cartRef, cartProductDetails);
    toast.success("Product Added Successfully!");
    return productAdded.id;
  }
);

const INITIAl_STATE = {
  cartItems: [],
  totalPrice: 0,
  loader: false,
  error: "",
  success: "",
  showAdding: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: INITIAl_STATE,
  reducers: {
    setLoader: (state) => {
      state.loader = true;
    },
    setCartItems: (state, action) => {
      state.loader = false;
      state.cartItems = action.payload;
    },
    setTotalPrice: (state, action) => {
      state.totalPrice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(removeItemThunk.fulfilled, (state, action) => {
        state.success = "Item Removed Successfully!";
      })
      .addCase(removeItemThunk.rejected, (state) => {
        state.error = "Removing item failed!";
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.success = "Product added successfully.";
      })
      .addCase(addToCartThunk.rejected, (state) => {
        state.error = "Product added to cart failed";
      });
  },
});

export const { setLoader, setCartItems, setTotalPrice } = cartSlice.actions;

export default cartSlice.reducer;
