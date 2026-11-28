
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";


export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, thunkAPI) => {
    try {
      let nextUrl = "products/";
      const allProducts = [];

      while (nextUrl) {
        const response = await api.get(nextUrl);
        const data = response.data;

        // Support both paginated and non-paginated responses
        if (Array.isArray(data)) {
          allProducts.push(...data);
          break;
        }

        allProducts.push(...(data.results || []));
        nextUrl = data.next;
      }

      return allProducts;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.detail ||
          "Unable to fetch products."
      );
    }
  }
);


const productsSlice = createSlice({
  name: "products",

  initialState: {
    items: [],
    status: "idle",
    error: null,
  },

  reducers: {
    clearProducts: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearProducts } = productsSlice.actions;

export default productsSlice.reducer;
