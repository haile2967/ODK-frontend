import { createSlice } from "@reduxjs/toolkit";
import mockDfaData from "../pages/reports/coverageReportMockData.json";
import { flattenDfaData } from "../pages/reports/flattenDfaData";

const initialState = {
  dfaData: flattenDfaData(mockDfaData),
  loading: false,
  error: null,
};

const coverageReportSlice = createSlice({
  name: "coverageReport",
  initialState,
  reducers: {
    // You can add reducers for fetching real data later
  },
});

export default coverageReportSlice.reducer;