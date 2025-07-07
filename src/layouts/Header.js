import React, { useState } from "react";
import { FiSearch, FiSettings, FiSun, FiMoon, FiMenu } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice"; // Update the path

const Header = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("darkMode") === "true" ||
      (!("darkMode" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  const handleLogout = () => {
    dispatch(logout());
    // Optional: redirect to login
    // window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement your search logic
    console.log("Searching for:", searchTerm);
    // Example: navigate(`/search?q=${searchTerm}`);
  };

  return (
    <div className="flex items-center justify-between relative">
      {/* Always-visible Hamburger */}
      <button className="text-2xl" onClick={toggleSidebar}>
        <FiMenu />
      </button>

      {/* Search - hidden on small screens */}
      <form
        onSubmit={handleSearch}
        className="relative flex-1 max-w-sm mx-4 hidden md:block"
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:text-white"
        />
        <button type="submit">
          <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
        </button>
      </form>

      {/* Right-side icons */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="text-gray-600 dark:text-white text-xl"
          title="Toggle Theme"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
        <div className="relative">
          <button
            className="text-gray-600 dark:text-white text-xl"
            title="Settings"
            onClick={() => setShowSettings(!showSettings)}
          >
            <FiSettings />
          </button>
          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
              <button
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                onClick={() => {
                  // Handle profile settings
                  setShowSettings(false);
                }}
              >
                Profile Settings
              </button>
              <button
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                onClick={() => {
                  // Handle company settings
                  setShowSettings(false);
                }}
              >
                Company Settings
              </button>
              <button
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </div>
    </div>
  );
};

export default Header;
