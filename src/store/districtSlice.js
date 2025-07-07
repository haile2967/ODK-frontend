import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  districts: [],
  loading: false,
  error: null,
};

export const fetchDistricts = createAsyncThunk(
  "districts/fetchDistricts",
  async () => {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/definitions/districts/"
    );
    return response.data;
  }
);

// Send districtName, noOfDFAs, noOfTeams, region_id to backend for add
export const addDistrict = createAsyncThunk(
  "districts/addDistrict",
  async (districtData) => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/definitions/districts/",
      {
        districtName: districtData.districtName,
        noOfDFAs: districtData.noOfDFAs ?? 0,
        noOfTeams: districtData.noOfTeams ?? 0,
        region_id: districtData.region_id,
      }
    );
    return response.data;
  }
);

// Send districtName, noOfDFAs, noOfTeams, region_id to backend for edit
export const editDistrict = createAsyncThunk(
  "districts/editDistrict",
  async ({ id, ...districtData }) => {
    const response = await axios.put(
      `http://127.0.0.1:8000/api/definitions/districts/${id}`,
      {
        districtName: districtData.districtName,
        noOfDFAs: districtData.noOfDFAs ?? 0,
        noOfTeams: districtData.noOfTeams ?? 0,
        region_id: districtData.region_id,
      }
    );
    return response.data;
  }
);

export const deleteDistrict = createAsyncThunk(
  "districts/deleteDistrict",
  async (id) => {
    await axios.delete(`http://127.0.0.1:8000/api/definitions/districts/${id}`);
    return id;
  }
);

const districtSlice = createSlice({
  name: "districts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistricts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.loading = false;
        state.districts = action.payload;
      })
      .addCase(fetchDistricts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addDistrict.fulfilled, (state, action) => {
        state.districts.push(action.payload);
      })
      .addCase(editDistrict.fulfilled, (state, action) => {
        const index = state.districts.findIndex(
          (district) => district.id === action.payload.id
        );
        if (index !== -1) state.districts[index] = action.payload;
      })
      .addCase(deleteDistrict.fulfilled, (state, action) => {
        state.districts = state.districts.filter(
          (district) => district.id !== action.payload
        );
      });
  },
});

export default districtSlice.reducer;
