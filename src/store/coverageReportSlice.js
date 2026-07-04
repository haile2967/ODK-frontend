import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { flattenDfaData } from "../pages/reports/flattenDfaData";
import { API_BASE_URL } from "../config";
import { mockDfaData } from "../pages/reports/mockDfaData";

// Utility to create a unique cache key
const generateCacheKey = (projectId, formId) => `${projectId || "none"}_${formId || "none"}`;

// Async thunk to fetch all DFA data (for initial load)
export const fetchAllDfaData = createAsyncThunk(
  "coverageReport/fetchAllDfaData",
  async (_, { rejectWithValue }) => {
    try {
      let rawData;
      // Mock data (uncomment this block and comment the API block below to use mock data)
      console.log("Using mock data for initial load");
      rawData = mockDfaData;

      // Real API data (comment this block to use mock data)
      /*
      console.log("Fetching all real data");
      const response = await fetch(`${API_BASE_URL}/api/data/district_level_data_summary`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      rawData = await response.data;
      */

      if (!rawData || !Array.isArray(rawData)) {
        console.error("Invalid data response: Expected an array");
        throw new Error("Invalid data response: Expected an array");
      }

      const flattened = flattenDfaData(rawData);
      console.log("Flattened all data sample:", flattened.slice(0, 2));
      return flattened;
    } catch (error) {
      console.error("Initial data fetch error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch DFA data based on projectId and formId with caching
export const fetchDfaDataByProjectAndForm = createAsyncThunk(
  "coverageReport/fetchDfaDataByProjectAndForm",
  async ({ projectId, formId }, { getState, rejectWithValue }) => {
    if (!projectId) {
      console.error("fetchDfaDataByProjectAndForm: projectId is required");
      return rejectWithValue("projectId is required");
    }

    const state = getState().coverageReport;
    const cacheKey = generateCacheKey(projectId, formId);

    if (state.cachedData[cacheKey]) {
      console.log(`Using cached data for key: ${cacheKey}`);
      return {
        fromCache: true,
        cacheKey,
        data: state.cachedData[cacheKey],
      };
    }

    try {
      let rawData;
      // Mock data (uncomment this block and comment the API block below to use mock data)
      console.log(`Using mock data for projectId: ${projectId}, formId: ${formId}`);
      rawData = mockDfaData.filter((project) => project.project_id === projectId);

      // Real API data (comment this block to use mock data)
      /*
      console.log(`Fetching real data for projectId: ${projectId}, formId: ${formId}`);
      const response = await fetch(`${API_BASE_URL}/api/data/district_level_data_summary/${projectId}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      rawData = await response.json();
      */

      if (!rawData || !Array.isArray(rawData)) {
        console.error("Invalid API response: Expected an array");
        throw new Error("Invalid API response: Expected an array");
      }

      const flattened = flattenDfaData(rawData);
      console.log("Flattened data sample:", flattened.slice(0, 2));
      const filtered = formId === ""
        ? flattened.filter((item) => item.project_id === projectId)
        : flattened.filter((item) => item.project_id === projectId && item.form_id === formId);
      console.log("Filtered data sample:", filtered.slice(0, 2));

      if (filtered.length === 0) {
        console.warn(`No data found for projectId: ${projectId}, formId: ${formId}`);
      }

      return {
        fromCache: false,
        cacheKey,
        data: filtered,
      };
    } catch (error) {
      console.error("Data fetch error:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  dfaData: [], // Store full dataset
  filteredDfaData: [], // Store filtered dataset
  cachedData: {}, // cacheKey => filteredData[]
  selectedProjectId: "",
  selectedFormId: "",
  loading: false,
  error: null,
};

const coverageReportSlice = createSlice({
  name: "coverageReport",
  initialState,
  reducers: {
    setProjectId(state, action) {
      state.selectedProjectId = action.payload;
      state.selectedFormId = "";
      state.filteredDfaData = [];
      console.log("setProjectId:", action.payload);
    },
    setFormId(state, action) {
      state.selectedFormId = action.payload;
      state.filteredDfaData = [];
      console.log("setFormId:", action.payload);
    },
    clearFilters(state) {
      state.selectedProjectId = "";
      state.selectedFormId = "";
      state.filteredDfaData = [];
      console.log("Filters cleared");
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllDfaData
      .addCase(fetchAllDfaData.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("Fetch all data pending");
      })
      .addCase(fetchAllDfaData.fulfilled, (state, action) => {
        state.loading = false;
        state.dfaData = action.payload;
        console.log("Fetch all data fulfilled, data length:", action.payload.length);
      })
      .addCase(fetchAllDfaData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Initial data fetch failed";
        console.log("Fetch all data rejected:", action.payload);
      })
      // Handle fetchDfaDataByProjectAndForm
      .addCase(fetchDfaDataByProjectAndForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log("Fetch filtered data pending");
      })
      .addCase(fetchDfaDataByProjectAndForm.fulfilled, (state, action) => {
        const { data, cacheKey, fromCache } = action.payload;
        state.loading = false;
        state.filteredDfaData = data;
        if (!fromCache) {
          state.cachedData[cacheKey] = data;
        }
        console.log(`Fetch filtered data fulfilled, fromCache: ${fromCache}, data length: ${data.length}`);
      })
      .addCase(fetchDfaDataByProjectAndForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Filtered data fetch failed";
        console.log("Fetch filtered data rejected:", action.payload);
      });
  },
});

export const { setProjectId, setFormId, clearFilters } = coverageReportSlice.actions;
export default coverageReportSlice.reducer;