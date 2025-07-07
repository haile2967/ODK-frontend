import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  regions: [],
  loading: false,
  error: null,
};

export const fetchRegions = createAsyncThunk(
  "regions/fetchRegions",
  async () => {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/definitions/regions/"
    );
    return response.data;
  }
);

// Send regionName and state_id to backend for add
export const addRegion = createAsyncThunk(
  "regions/addRegion",
  async (regionData) => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/definitions/regions/",
      { regionName: regionData.regionName, state_id: regionData.state_id }
    );
    return response.data;
  }
);

// Send regionName and state_id to backend for edit
export const editRegion = createAsyncThunk(
  "regions/editRegion",
  async ({ id, ...regionData }) => {
    const response = await axios.put(
      `http://127.0.0.1:8000/api/definitions/regions/${id}`,
      { regionName: regionData.regionName, state_id: regionData.state_id }
    );
    return response.data;
  }
);

export const deleteRegion = createAsyncThunk(
  "regions/deleteRegion",
  async (id) => {
    await axios.delete(`http://127.0.0.1:8000/api/definitions/regions/${id}`);
    return id;
  }
);

const regionSlice = createSlice({
  name: "regions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.loading = false;
        state.regions = action.payload;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addRegion.fulfilled, (state, action) => {
        state.regions.push(action.payload);
      })
      .addCase(editRegion.fulfilled, (state, action) => {
        const index = state.regions.findIndex(
          (region) => region.id === action.payload.id
        );
        if (index !== -1) state.regions[index] = action.payload;
      })
      .addCase(deleteRegion.fulfilled, (state, action) => {
        state.regions = state.regions.filter(
          (region) => region.id !== action.payload
        );
      });
  },
});

export default regionSlice.reducer;
