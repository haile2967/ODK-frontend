import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import errorReducer from "./errorSlice";
import uiReducer from "./uiSlice";
import roleReducer from "./roleSlice";
import coverageReportReducer from "./coverageReportSlice";
import tokenMiddleware from "../pages/tokenMiddleware";
import dfaReducer from './dfaSlice';
import teamReducer from './teamSlice';
import formReducer from './formSlice';
import metadataReducer from "./metadataSlice";
import mergeReducer from './mergeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  error: errorReducer,
  ui: uiReducer,
  roles: roleReducer,
  coverageReport: coverageReportReducer,
  dfa: dfaReducer,
  team: teamReducer,
  form: formReducer,
  metadata: metadataReducer,
  merge: mergeReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(tokenMiddleware),
});
export default store;
