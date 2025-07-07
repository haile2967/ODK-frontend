import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  nations: [],
  loading: false,
  error: null,
};

export const fetchNations = createAsyncThunk(
  "nations/fetchNations",
  async () => {
    const response = await axios.get(
      "http://127.0.0.1:8000/api/definitions/nations/"
    );
    return response.data;
  }
);

// Make addNation compatible with both { name } and { nationName }
export const addNation = createAsyncThunk(
  "nations/addNation",
  async (nationData) => {
    // Accept both { nationName } and { name }, but always send { nationName } to backend
    const nationName = nationData.nationName || nationData.name;
    const response = await axios.post(
      "http://127.0.0.1:8000/api/definitions/nations/",
      { nationName }
    );
    return response.data;
  }
);

// Make editNation compatible with both { name } and { nationName }
export const editNation = createAsyncThunk(
  "nations/editNation",
  async ({ id, ...nationData }) => {
    // Accept both { nationName } and { name }, but always send { nationName } to backend
    const nationName = nationData.nationName || nationData.name;
    const response = await axios.put(
      `http://127.0.0.1:8000/api/definitions/nations/${id}`,
      { nationName }
    );
    return response.data;
  }
);

export const deleteNation = createAsyncThunk(
  "nations/deleteNation",
  async (id) => {
    await axios.delete(`http://127.0.0.1:8000/api/definitions/nations/${id}`);
    return id;
  }
);

const nationSlice = createSlice({
  name: "nations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNations.fulfilled, (state, action) => {
        state.loading = false;
        state.nations = action.payload;
      })
      .addCase(fetchNations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addNation.fulfilled, (state, action) => {
        state.nations.push(action.payload);
      })
      .addCase(editNation.fulfilled, (state, action) => {
        const index = state.nations.findIndex(
          (nation) => nation.id === action.payload.id
        );
        if (index !== -1) state.nations[index] = action.payload;
      })
      .addCase(deleteNation.fulfilled, (state, action) => {
        state.nations = state.nations.filter(
          (nation) => nation.id !== action.payload
        );
      });
  },
});

export default nationSlice.reducer;
