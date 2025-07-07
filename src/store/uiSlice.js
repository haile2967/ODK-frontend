import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: true,
  darkMode: false,
  isMobileView: false,
  expandedMenus: {},
  isSearchOpen: false,
  isProfileOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setMobileView: (state, action) => {
      state.isMobileView = action.payload;
      if (action.payload) {
        state.sidebarOpen = false;
      }
    },
    toggleSubmenu: (state, action) => {
      const title = action.payload;
      state.expandedMenus = {
        ...state.expandedMenus,
        [title]: !state.expandedMenus[title],
      };
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    toggleProfile: (state) => {
      state.isProfileOpen = !state.isProfileOpen;
    },
    closeProfile: (state) => {
      state.isProfileOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  toggleDarkMode,
  setMobileView,
  toggleSubmenu,
  toggleSearch,
  toggleProfile,
  closeProfile,
} = uiSlice.actions;

export default uiSlice.reducer;
