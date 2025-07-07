// tokenManager.js
import { API_BASE_URL } from "../pages/config";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { logout } from "../store/authSlice"; // Ensure the import path is correct
import axios from "axios";

const TOKEN_EXPIRY_BUFFER = 60 * 1000; // 1 minute before expiry

const useTokenManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expiryTime, setExpiryTime] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(null);
  const token = localStorage.getItem("token");
  //console.log("token", token);
  const loadFromStorage = () => {
    const storedExpiryTime = localStorage.getItem("tokenExpiration");
    setExpiryTime(storedExpiryTime ? parseInt(storedExpiryTime, 10) : null);

    if (token && storedExpiryTime) {
      setupTimer(storedExpiryTime - Date.now());
    }
  };
  useEffect(() => {
    loadFromStorage();
  }, []);

  const setupTimer = (expiryInMillis) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    const timeBeforeExpiry = expiryInMillis - TOKEN_EXPIRY_BUFFER;
    if (timeBeforeExpiry > 0) {
      const newTimer = setTimeout(requestNewToken, timeBeforeExpiry);
      setRefreshTimer(newTimer);
    }
  };

  const saveToken = (newToken, expiryInMillis) => {
    const newExpiryTime = expiryInMillis;
    setExpiryTime(newExpiryTime);
    setupTimer(expiryInMillis);
    localStorage.setItem("token", newToken);
    localStorage.setItem("tokenExpiration", newExpiryTime);
  };

  const requestNewToken = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/Account/request-new-token`,
        { token }, // This is the expected format for the request body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      const tokenParts = data.token.split(".");
      const tokenPayload = JSON.parse(atob(tokenParts[1]));

      if (tokenPayload.exp) {
        const expirationTime = tokenPayload.exp * 1000;
        saveToken(data.token, expirationTime);
      } else {
        throw new Error(data.message || "Token payload error found");
      }
    } catch (error) {
      console.error("Error while refreshing token:", error);
      localStorage.clear();
      clear(); // Clear the token and timer
      dispatch(logout()); // Dispatch a logout action
      navigate("/login"); // Navigate to login
    }
  };

  const clear = () => {
    setExpiryTime(null);
    clearTimeout(refreshTimer);
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
  };

  return {
    loadFromStorage,
    saveToken,
    expiryTime,
    requestNewToken,
    clear,
  };
};

export default useTokenManager;
