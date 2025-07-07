import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  nations: [],
  states: [],
  regions: [],
  districts: [],
  roles: [], // Added roles to initial state
  loading: false,
  error: null,
};

export const fetchDefinitions = createAsyncThunk(
  "definitions/fetchDefinitions",
  async () => {
    const [nationsResp, statesResp, regionsResp, districtsResp, rolesResp] =
      await Promise.all([
        axios.get("http://127.0.0.1:8000/api/definitions/nations/"),
        axios.get("http://127.0.0.1:8000/api/definitions/states/"),
        axios.get("http://127.0.0.1:8000/api/definitions/roles/"), // Added roles endpoint
      ]);
    return {
      nations: nationsResp.data,
      states: statesResp.data,
      regions: regionsResp.data,
      districts: districtsResp.data,
      roles: rolesResp.data, // Added roles to return object
    };
  }
);

export const addNation = createAsyncThunk(
  "definitions/addNation",
  async (nationData) => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/definitions/nations/",
      { nationName: nationData.nationName }
    );
    return response.data;
  }
);

export const addState = createAsyncThunk(
  "definitions/addState",
  async (stateData) => {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/definitions/states/",
      { stateName: stateData.stateName, nationId: stateData.nationId }
    );
    return response.data;
  }
);

const definitionSlice = createSlice({
  name: "definitions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDefinitions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDefinitions.fulfilled, (state, action) => {
        state.loading = false;
        state.nations = action.payload.nations;
        state.states = action.payload.states;
        state.regions = action.payload.regions;
        state.districts = action.payload.districts;
        state.roles = action.payload.roles; // Added roles to state
      })
      .addCase(fetchDefinitions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addNation.fulfilled, (state, action) => {
        state.nations.push(action.payload);
      })
      .addCase(addNation.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(addState.fulfilled, (state, action) => {
        state.states.push(action.payload);
      })
      .addCase(addState.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default definitionSlice.reducer;
