// useTokenExpiryCheck.js
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice"; // Ensure the import path is correct
import useTokenManager from "./TokenManager"; // Adjust the import path as needed

const TOKEN_EXPIRY_BUFFER = 1.5 * 60 * 1000; // 1.5 minute before expiration

function useTokenExpiryCheck() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false); // UseState for token refresh state
  const { token, expiryTime, requestNewToken, clear } = useTokenManager();

  useEffect(() => {
    const handleTokenExpiry = async () => {
      // Calculate how much time is left until the token expires
      const timeUntilExpiry = expiryTime ? expiryTime - Date.now() : null;
 //     console.log("expiryTime", expiryTime);
      //     console.log("token", token);
 //     console.log("timeUntilExpiry", timeUntilExpiry);
      if (
        timeUntilExpiry !== null &&
        timeUntilExpiry <= TOKEN_EXPIRY_BUFFER &&
        !isRefreshing
      ) {
        setIsRefreshing(true);
        try {
          await requestNewToken(); // Refresh the token
//          console.log("Token refreshed successfully.");
        } catch (error) {
          console.error("Failed to refresh token:", error);
          /*           localStorage.clear();
          clear(); // Clear the token data
          dispatch(logout());
          navigate("/login");
 */
        } finally {
          setIsRefreshing(false); // Reset the flag whether successful or failed
        }
      } else if (timeUntilExpiry < 0) {
        // Token already expired
        console.error("Token already expired");
        /*        localStorage.clear();
        clear(); // Clear the token data
        dispatch(logout());
        navigate("/login");
 */
      } else {
 //       console.log("Token is still valid");
      }
    };

    handleTokenExpiry();
  }, [location, expiryTime, requestNewToken, dispatch, navigate]); // Ensure all dependencies are added

  return null; // Optionally return null or any required values
}

export default useTokenExpiryCheck;
