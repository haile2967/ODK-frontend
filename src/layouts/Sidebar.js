import React from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Account Management", icon: "👤", path: "/accounts-dashboard" },
  { label: "ODK Data Processing", icon: "🔄", path: "/odk-processing" },
  { label: "Geographical Hierarchy", icon: "🗺️", path: "/geography" },
  { label: "Planning", icon: "🗓️", path: "/planning" },
  { label: "Compliance Report", icon: "✅", path: "/compliance_report" },
  { label: "Vaccination Report", icon: "📊", path: "/vacination_report" },
  { label: "Vaccine Utilization", icon: "💉", path: "/vacine_utilization" },
  { label: "Vaccination Coverage ", icon: "📈", path: "/vacination_coverage" },
  { label: "Reports", icon: "📊", path: "/reports" },
  { label: "Report Configuration", icon: "📑", path: "/report-config" },
  { label: "General Configuration", icon: "⚙️", path: "/configuration" },
];

const Sidebar = ({ collapsed }) => {
  return (
    <div className="h-full flex flex-col">
      {/* Logo / Title */}
      <div className="p-4 text-xl font-semibold whitespace-nowrap overflow-hidden">
        {!collapsed && "📚 ODK Data Analysis"}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>

            {/* Label with transition */}
            <span
              className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
                collapsed
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100 w-auto"
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
