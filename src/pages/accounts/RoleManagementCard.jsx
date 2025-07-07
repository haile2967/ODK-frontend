import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RoleForm from "../../components/forms/RoleForm";

import {
  addRole,
  editRole,
  deleteRole,
  fetchRoles,
} from "../../store/roleSlice";

function RoleManagementCard({ onBack }) {
  const roles = useSelector((state) => state.roles.roles || []);
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const getStatus = (role) => {
    const status = (role.status || "active").toLowerCase();
    if (status === "active") return "Active";
    if (status === "inactive") return "Inactive";
    return "Unknown";
  };

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (role) => {
    setEditData(role);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      dispatch(deleteRole(id));
    }
  };

  const handleSubmit = (data) => {
    if (editData) {
      dispatch(editRole({ id: editData.id, ...data }));
    } else {
      dispatch(addRole(data));
    }
    setShowForm(false);
    setEditData(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-0 m-0">
      <div className="w-full max-w-5xl bg-white p-10 rounded-xl shadow-xl mt-10 mb-10 relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-8 top-8 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
          >
            ← Back
          </button>
        )}
        <h3 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
          Role Management
        </h3>
        <p className="text-gray-600 mb-8 text-center text-lg">
          Configure roles and access levels for your organization.
        </p>
        <div className="flex justify-end mb-6">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow"
            onClick={handleAdd}
          >
            Add Role
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-3 px-6 border-b text-left">Role Name</th>
                <th className="py-3 px-6 border-b text-center">Status</th>
                <th className="py-3 px-6 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-6 border-b">{role.name}</td>{" "}
                  {/* Explicitly use role.name */}
                  <td className="py-3 px-6 border-b text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        getStatus(role) === "Active"
                          ? "bg-green-100 text-green-700"
                          : getStatus(role) === "Inactive"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {getStatus(role)}
                    </span>
                  </td>
                  <td className="py-3 px-6 border-b flex gap-2 justify-center">
                    <button
                      className="bg-yellow-400 text-white px-4 py-1 rounded hover:bg-yellow-500"
                      onClick={() => handleEdit(role)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(role.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => {
                setShowForm(false);
                setEditData(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <RoleForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditData(null);
              }}
              editData={editData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagementCard;
