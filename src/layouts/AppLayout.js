import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";

const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === "/home"; // Only exact /home

  // On first load: use saved state or fallback to screen width
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsSidebarCollapsed(saved === "true");
    } else {
      const isMobile = window.innerWidth < 768;
      setIsSidebarCollapsed(isMobile); // Collapse by default on mobile
    }
  }, []);

  // Sync to localStorage when changed
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarCollapsed", newState.toString());
      return newState;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white-200">
      {/* Header */}
      <header className="w-full bg-white shadow px-4 py-3 border-b z-10">
        <Header toggleSidebar={toggleSidebar} />
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? "w-20" : "w-64"}
            bg-white border-r shadow-sm h-screen overflow-hidden`}
        >
          <Sidebar collapsed={isSidebarCollapsed} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
          {isHome ? (
            <div className="text-center mt-10">
              <img
                src="/Default_icon.ico"
                alt="Welcome"
                className="mx-auto w-80 h-80"
              />
              <h1 className="text-2xl font-semibold mt-4">
                Welcome to the Dashboard
              </h1>
              <p className="text-gray-500 mt-2">
                Select a menu item to get started.
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
