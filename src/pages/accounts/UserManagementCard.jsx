import React, { useState, useEffect, useCallback, Component } from "react";
import { useSelector, useDispatch } from "react-redux";
import UserForm from "../../components/forms/UserForm";
import {
  addUser,
  editUser,
  deleteUser,
  fetchUsers,
} from "../../store/userSlice";
import { fetchRoles } from "../../store/roleSlice"; // Use roleSlice for roles
import { fetchDefinitions } from "../../store/definitionSlice"; // Keep for nations, states, etc.
import { Table, Button, Popconfirm, message } from "antd";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      console.error("ErrorBoundary caught error:", this.state.error);
      return (
        <div>
          <h2>Something went wrong.</h2>
          <p>Error: {this.state.error.message}</p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function UserManagementCard({ onBack }) {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const {
    users,
    loading,
    error: fetchError,
  } = useSelector(
    (state) => state.users || { users: [], loading: false, error: null }
  );
  const roles = useSelector((state) => state.roles.roles || []); // Use roles from roleSlice
  const { nations, states, regions, districts } = useSelector(
    (state) => state.definitions || {}
  );

  useEffect(() => {
    console.log("useEffect triggered, dispatching fetch actions");
    dispatch(fetchUsers()).then(() =>
      console.log("fetchUsers completed:", users)
    );
    dispatch(fetchRoles()).then(() =>
      console.log("fetchRoles completed:", roles)
    ); // Fetch roles
    dispatch(fetchDefinitions()).then(() =>
      console.log("fetchDefinitions completed:", {
        nations,
        states,
        regions,
        districts,
      })
    );
  }, [dispatch]);

  const handleAdd = () => {
    console.log("handleAdd triggered");
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    console.log("handleEdit triggered for user:", user);
    setEditData(user);
    setShowForm(true);
  };

  const handleDelete = (user_id) => {
    console.log("handleDelete triggered for user_id:", user_id);
    dispatch(deleteUser(user_id));
  };

  const handleSubmit = (data) => {
    let dob = data.DateOfBirth;
    if (dob && typeof dob === "object" && dob.format) {
      dob = dob.format("YYYY-MM-DD");
    }
    const userData = {
      ...data,
      DateOfBirth: dob,
    };
    console.log("Submitting user data:", userData);
    if (editData) {
      dispatch(editUser({ user_id: editData.id, ...userData }))
        .unwrap()
        .then(() => {
          message.success("User updated successfully!");
          setShowForm(false);
          setEditData(null);
        })
        .catch((err) => message.error(err.message || "Failed to update user"));
    } else {
      dispatch(addUser(userData))
        .unwrap()
        .then(() => {
          message.success("User added successfully!");
          setShowForm(false);
          setEditData(null);
        })
        .catch((err) => message.error(err.message || "Failed to add user"));
    }
  };

  const renderRole = useCallback(
    (roleId) => {
      const role = roles.find((r) => r.id === roleId);
      return role ? role.name : "-";
    },
    [roles]
  );

  const columns = [
    {
      title: "Full Name",
      dataIndex: "FullName",
      key: "FullName",
    },
    { title: "Email", dataIndex: "Email", key: "Email" },
    { title: "Phone", dataIndex: "Phone", key: "Phone" },
    {
      title: "Role",
      dataIndex: "Role",
      key: "Role",
      render: renderRole,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, user) => (
        <>
          <Button
            type="link"
            onClick={() => handleEdit(user)}
            style={{ color: "#faad14" }}
            disabled={!user.id}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(user.id)}
            okText="Yes"
            cancelText="No"
            disabled={!user.id}
          >
            <Button type="link" danger disabled={!user.id}>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const expandedRowRender = (user) => (
    <div style={{ margin: 0 }}>
      <p>
        <b>Nationality:</b> {user.Nationality || "-"}
      </p>
      <p>
        <b>Gender:</b> {user.Gender || "-"}
      </p>
      <p>
        <b>Date of Birth:</b> {user.DateOfBirth || "-"}
      </p>
    </div>
  );

  console.log("Rendering UserManagementCard:", {
    loading,
    fetchError,
    usersLength: users.length,
    rolesLength: roles.length,
  });

  if (loading) return <div>Loading...</div>;
  if (fetchError) return <div>Error: {fetchError}</div>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-0 m-0">
        <div className="flex-1 bg-white p-24 rounded-3xl shadow-2xl mt-10 mb-10 relative">
          <div className="flex items-center mb-4">
            <h3 className="text-4xl font-extrabold text-gray-900 text-center flex-1">
              User Management
            </h3>
          </div>
          <p className="text-gray-600 mb-10 text-center text-xl">
            Manage user accounts and permissions.
          </p>
          <div className="flex justify-between items-center mb-8">
            {onBack && (
              <Button onClick={onBack} type="default">
                Back
              </Button>
            )}
            <Button type="primary" onClick={handleAdd} size="large">
              Add User
            </Button>
          </div>
          <div className="w-full flex justify-end">
            <Table
              columns={columns}
              dataSource={users.map((u, index) => ({
                ...u,
                key: u.id || `user-${index}`,
              }))}
              pagination={false}
              bordered
              expandable={{ expandedRowRender }}
            />
          </div>
        </div>
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-xl relative animate-fadeIn">
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
              <UserForm
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
    </ErrorBoundary>
  );
}

export default UserManagementCard;
