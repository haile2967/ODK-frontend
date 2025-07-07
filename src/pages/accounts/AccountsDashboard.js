import React, { useState } from "react";
import UserManagementCard from "./UserManagementCard";
import RoleManagementCard from "./RoleManagementCard";
import ChangePasswordCard from "./ChangePasswordCard";
import ResetPasswordCard from "./ResetPasswordCard";
import AccountListCard from "./AccountListCard";

function AccountManagement() {
  const [activeCard, setActiveCard] = useState(null);

  // Remove unused variables to fix ESLint errors

  if (activeCard) {
    const cardComponents = {
      "User Management": (props) => (
        <UserManagementCard onBack={() => setActiveCard(null)} {...props} />
      ),
      "Role Management": (props) => (
        <RoleManagementCard onBack={() => setActiveCard(null)} {...props} />
      ),
      "Change Password": (props) => (
        <ChangePasswordCard onBack={() => setActiveCard(null)} {...props} />
      ),
      "Reset Password": (props) => (
        <ResetPasswordCard onBack={() => setActiveCard(null)} {...props} />
      ),
      "Account List": (props) => (
        <AccountListCard onBack={() => setActiveCard(null)} {...props} />
      ),
    };
    const ActiveCard =
      cardComponents[activeCard] ||
      (() => <div className="text-gray-600">Invalid card</div>);
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-blue-700">{activeCard}</h2>
        {activeCard === "Role Management" ? (
          <RoleManagementCard onBack={() => setActiveCard(null)} />
        ) : (
          <ActiveCard />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-0 m-0">
      <div className="w-full max-w-5xl bg-white p-10 rounded-xl shadow-xl mt-10 mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Account Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button
            onClick={() => setActiveCard("User Management")}
            className="bg-white p-8 rounded-lg shadow hover:bg-blue-50 cursor-pointer transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              User Management
            </h3>
            <p className="text-gray-600">
              Manage user accounts and permissions.
            </p>
          </button>
          <button
            onClick={() => setActiveCard("Role Management")}
            className="bg-white p-8 rounded-lg shadow hover:bg-blue-50 cursor-pointer transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Role Management
            </h3>
            <p className="text-gray-600">Configure roles and access levels.</p>
          </button>
          <button
            onClick={() => setActiveCard("Change Password")}
            className="bg-white p-8 rounded-lg shadow hover:bg-blue-50 cursor-pointer transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Change Password
            </h3>
            <p className="text-gray-600">Update user passwords.</p>
          </button>
          <button
            onClick={() => setActiveCard("Reset Password")}
            className="bg-white p-8 rounded-lg shadow hover:bg-blue-50 cursor-pointer transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset Password
            </h3>
            <p className="text-gray-600">Reset passwords for users.</p>
          </button>
          <button
            onClick={() => setActiveCard("Account List")}
            className="bg-white p-8 rounded-lg shadow hover:bg-blue-50 cursor-pointer transition"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Account List
            </h3>
            <p className="text-gray-600">
              View all user accounts and generated passwords.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountManagement;
