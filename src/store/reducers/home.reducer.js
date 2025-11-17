import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productRef } from "../../../config/firebaseinit";
import {
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { dataProducts } from "../../data";

const INITIAL_STATE = {
  loader: false,
  error: "",
  products: [],
  searchProduct: [],
  productByPrice: [],
  productByCategory: [],
};

// --------------------------------------------------------------------
// GET PRODUCTS THUNK
// --------------------------------------------------------------------
export const getProducts = createAsyncThunk(
  "home/getProducts",
  async (_, thunkAPI) => {
    try {
      const fetchProduct = await getDocs(productRef);
      const product = fetchProduct.docs.map((product) => ({
        id: product.id,
        ...product.data(),
      }));
      return product;
    } catch (error) {
      return thunkAPI.fulfillWithValue(dataProducts);
    }
  }
);

// --------------------------------------------------------------------
// CREATE PRODUCT THUNK
// --------------------------------------------------------------------
export const createProduct = createAsyncThunk(
  "home/createProduct",
  async ({ title, description, adminId, stock, price, image, category }, thunkAPI) => {
    try {
      const newProduct = {
        adminId,
        title,
        description,
        stock,
        price,
        image,
        category,
      };

      const docRef = await addDoc(productRef, newProduct);

      return {
        id: docRef.id,
        ...newProduct,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue("Error creating product");
    }
  }
);

export const getProductsByAdmin = createAsyncThunk(
  "home/getProductsByAdmin",
  async (adminId, thunkAPI) => {
    try {
      const q = query(productRef, where("adminId", "==", adminId));

      const snapshot = await getDocs(q);

      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return products;
    } catch (error) {
      console.error("Error fetching admin products:", error);
      return thunkAPI.rejectWithValue("Error fetching products by adminId");
    }
  }
);

export const updateProduct = createAsyncThunk(
  "home/updateProduct",
  async ({ id, changes }, thunkAPI) => {
    try {
      const docRef = doc(productRef, id);
      await updateDoc(docRef, changes);
      // return updated product object for optimistic update in store
      return { id, ...changes };
    } catch (error) {
      console.error("updateProduct error:", error);
      return thunkAPI.rejectWithValue("Error updating product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "home/deleteProduct",
  async (productId, thunkAPI) => {
    try {
      await deleteDoc(doc(productRef, productId)); // adjust collection name if needed
      return productId;
    } catch (error) {
      console.log("error ", error);
      return thunkAPI.rejectWithValue("Error deleting product");
    }
  }
);

// --------------------------------------------------------------------
// SLICE
// --------------------------------------------------------------------
const homeSlice = createSlice({
  name: "home",
  initialState: INITIAL_STATE,
  reducers: {
    loading: (state) => {
      state.loader = true;
    },
    setProducts: (state, action) => {
      state.loader = false;
      state.products = action.payload;
    },
    setSearchProduct: (state, action) => {
      state.searchProduct = action.payload;
    },
    setProductByPrice: (state, action) => {
      state.productByPrice = action.payload;
    },
    setProductByCategory: (state, action) => {
      state.productByCategory = action.payload;
    },
    clearError: (state) => {
      state.error = "";
    },
  },

  extraReducers: (builder) => {
    builder
      // GET PRODUCTS
      .addCase(getProducts.pending, (state) => {
        state.loader = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loader = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state) => {
        state.loader = false;
        state.error = "Error while fetching products";
      })

      // CREATE PRODUCT
      .addCase(createProduct.pending, (state) => {
        state.loader = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loader = false;
        state.products.push(action.payload); // add new product to store
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // DELETE PRODUCT
      .addCase(deleteProduct.pending, (state) => {
        state.loader = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loader = false;
        state.products = state.products.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      // UPDATE PRODUCT
      .addCase(updateProduct.pending, (state) => {
        state.loader = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loader = false;
        const updated = action.payload;
        state.products = state.products.map((p) =>
          p.id === updated.id ? { ...p, ...updated } : p
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      })

      .addCase(getProductsByAdmin.pending, (state) => {
        state.loader = true;
      })
      .addCase(getProductsByAdmin.fulfilled, (state, action) => {
        state.loader = false;
        state.products = action.payload;
      })
      .addCase(getProductsByAdmin.rejected, (state, action) => {
        state.loader = false;
        state.error = action.payload;
      });
  },
});

export const {
  loading,
  setProducts,
  setSearchProduct,
  setProductByPrice,
  setProductByCategory,
  clearError,
} = homeSlice.actions;

export default homeSlice.reducer;

/*
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productRef } from "../../../config/firebaseinit";
import { getDocs } from "firebase/firestore";
import { dataProducts } from "../../data";

const INITIAL_STATE = {
  loader: false,
  error: "",
  products: [],
  searchProduct: [],
  productByPrice: [],
  productByCategory: [],
};

export const getProducts = createAsyncThunk(
  "home/getProducts",
  async (_, thunkAPI) => {
    try{

      const fetchProduct = await getDocs(productRef);
      const product = fetchProduct.docs.map((product) => ({
        id: product.id,
        ...product.data(),
      }));
      return product;
    } catch(error){
      return thunkAPI.fulfillWithValue(dataProducts)
    }
  }
);

const homeSlice = createSlice({
  name: "home",
  initialState: INITIAL_STATE,
  reducers: {
    loading: (state) => {
      state.loader = true;
    },
    setProducts: (state, action) => {
      state.loader = false;
      state.products = action.payload;
    },
    setSearchProduct: (state, action) => {
      state.searchProduct = action.payload;
    },
    setProductByPrice: (state, action) => {
      state.productByPrice = action.payload;
    },
    setProductByCategory: (state, action) => {
      state.productByCategory = action.payload;
    },
    clearError:(state)=>{
      state.error = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.loader = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loader = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loader = false;
        state.error = "Error while fetching products";
      });
  },
});

export const {
  loading,
  setProducts,
  setSearchProduct,
  setProductByPrice,
  setProductByCategory,
  clearError
} = homeSlice.actions;
export default homeSlice.reducer;
*/
