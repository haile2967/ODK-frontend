import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { Card, Button } from "antd";
import { UserOutlined, TeamOutlined, KeyOutlined, ReloadOutlined, UnorderedListOutlined, ArrowRightOutlined } from '@ant-design/icons';
// import AccountManagementDashboard from "./AccountDashboard";

function AccountManagement() {
  const navigate = useNavigate();
  // const location = useLocation();
  // const isDashboardRoot = location.pathname === "/accounts-dashboard";

  const cards = [
    {
      name: "User Management",
      icon: <UserOutlined className="text-blue-500 text-2xl" />,
      path: "/accounts-dashboard/user-management",
      description: "Manage user accounts and permissions.",
      action: "Manage users"
    },
    {
      name: "Role Management",
      icon: <TeamOutlined className="text-green-500 text-2xl" />,
      path: "/accounts-dashboard/role-management",
      description: "Configure roles and access levels.",
      action: "Configure roles"
    },
    {
      name: "Change Password",
      icon: <KeyOutlined className="text-yellow-500 text-2xl" />,
      path: "/accounts-dashboard/change-password",
      description: "Update user passwords.",
      action: "Change password"
    },
    {
      name: "Reset Password",
      icon: <ReloadOutlined className="text-purple-500 text-2xl" />,
      path: "/accounts-dashboard/reset-password",
      description: "Reset passwords for users.",
      action: "Reset password"
    },
    {
      name: "Account List",
      icon: <UnorderedListOutlined className="text-pink-500 text-2xl" />,
      path: "/accounts-dashboard/account-list",
      description: "View all user accounts and generated passwords.",
      action: "View accounts"
    },
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto border-b-2 border-gray-200 pl-6 sm:pl-8" style={{height: '100vh'}}>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center">
        Account Management
      </h2>
      {/* Management Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {cards.map((card) => (
          <Card
            key={card.name}
            hoverable
            className="rounded-lg py-0 px-6 flex-1 min-w-[250px] text-center cursor-pointer shadow transition-all border border-gray-100"
            onClick={() => navigate(card.path)}
          >
            <div className="flex flex-col items-start h-full w-full justify-center">
              <div className="mb-4">{card.icon}</div>
              <div className="text-lg font-bold text-gray-900 mb-2">{card.name}</div>
              <div className="text-gray-600 text-sm mb-4 flex-1">{card.description}</div>
              <Button
                type="link"
                className="p-0 text-blue-600 hover:text-blue-800 self-end flex items-center"
                onClick={e => { e.stopPropagation(); navigate(card.path); }}
                icon={<ArrowRightOutlined />}
              >
                <span className="ml-1">{card.action}</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {/* Nested Route Content or Dashboard Section */}
      {/* {isDashboardRoot ? (
        <div className="mt-12">
          <AccountManagementDashboard />
        </div>
      ) : (
        <Outlet />
      )} */}
    </div>
  );
}

export default AccountManagement;