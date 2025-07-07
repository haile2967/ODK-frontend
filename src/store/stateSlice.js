import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  states: [],
  loading: false,
  error: null,
};

export const fetchStates = createAsyncThunk("states/fetchStates", async () => {
  const response = await axios.get(
    "http://127.0.0.1:8000/api/definitions/states/"
  );
  return response.data;
});

// Send stateName and nation_id to backend for add
export const addState = createAsyncThunk(
  "states/addState",
  async (stateData) => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/definitions/states/",
      { stateName: stateData.stateName, nation_id: stateData.nation_id }
    );
    return response.data;
  }
);

// Send stateName and nation_id to backend for edit
export const editState = createAsyncThunk(
  "states/editState",
  async ({ id, ...stateData }) => {
    const response = await axios.put(
      `http://127.0.0.1:8000/api/definitions/states/${id}`,
      { stateName: stateData.stateName, nation_id: stateData.nation_id }
    );
    return response.data;
  }
);

export const deleteState = createAsyncThunk(
  "states/deleteState",
  async (id) => {
    await axios.delete(`http://127.0.0.1:8000/api/definitions/states/${id}`);
    return id;
  }
);

const stateSlice = createSlice({
  name: "states",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addState.fulfilled, (state, action) => {
        state.states.push(action.payload);
      })
      .addCase(editState.fulfilled, (state, action) => {
        const index = state.states.findIndex(
          (state) => state.id === action.payload.id
        );
        if (index !== -1) state.states[index] = action.payload;
      })
      .addCase(deleteState.fulfilled, (state, action) => {
        state.states = state.states.filter(
          (state) => state.id !== action.payload
        );
      });
  },
});

export default stateSlice.reducer;
