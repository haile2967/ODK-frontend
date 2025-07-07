import { logout, refreshToken } from "../store/authSlice";
import axios from "axios";

const tokenMiddleware = (store) => (next) => (action) => {
  // Set up axios interceptors on store initialization
  if (action.type === "@@INIT") {
    setupAxiosInterceptors(store);
  }

  return next(action);
};

let refreshTimeout;

const setupAxiosInterceptors = (store) => {
  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      const { accessToken } = store.getState().auth;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const { dispatch, getState } = store;
      const { refreshToken: currentRefreshToken } = getState().auth;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await dispatch(refreshToken(currentRefreshToken)).unwrap();
          const { accessToken } = getState().auth;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          dispatch(logout());
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Schedule token refresh
  const scheduleTokenRefresh = () => {
    const { expiresAt, refreshToken } = store.getState().auth;

    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    if (expiresAt && refreshToken) {
      const timeUntilRefresh = calculateRefreshTime(expiresAt);
      refreshTimeout = setTimeout(() => {
        store.dispatch(refreshToken(refreshToken));
      }, timeUntilRefresh);
    }
  };

  // Initial schedule
  scheduleTokenRefresh();

  // Subscribe to store changes to reschedule when tokens change
  store.subscribe(() => {
    const { expiresAt, refreshToken } = store.getState().auth;
    if (expiresAt && refreshToken) {
      scheduleTokenRefresh();
    }
  });
};

const calculateRefreshTime = (expiresAt) => {
  const now = Date.now();
  const bufferTime = 60000; // 1 minute before expiry
  return Math.max(expiresAt - now - bufferTime, 0);
};

export default tokenMiddleware;
