import React, { useState, useEffect, Component } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Table, Button, Popconfirm, message } from "antd";
import NationForm from "../../components/forms/NationForm";

import {
  fetchNations,
  addNation,
  editNation,
  deleteNation,
} from "../../store/nationSlice";
import "antd/dist/reset.css"; // Ensure AntD styles are imported

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong.
            </h2>
            <p className="text-gray-600 mb-4">
              Error: {this.state.error.message}
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
              type="primary"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function NationManagementPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const {
    nations,
    loading,
    error: fetchError,
  } = useSelector(
    (state) => state.nations || { nations: [], loading: false, error: null }
  );

  useEffect(() => {
    console.log("useEffect triggered, dispatching fetchNations");
    dispatch(fetchNations()).then(() =>
      console.log("fetchNations completed:", nations)
    );
  }, [dispatch]);

  const handleAdd = () => {
    console.log("handleAdd triggered");
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (nation) => {
    console.log("handleEdit triggered for nation:", nation);
    setEditData(nation);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    console.log("handleDelete triggered for nation id:", id);
    dispatch(deleteNation(id)).then(() => {
      dispatch(fetchNations()); // Refresh data after delete
    });
  };

  const handleSubmit = async (data) => {
    console.log("Submitting nation data:", data);
    try {
      if (editData) {
        await dispatch(editNation({ id: editData.id, ...data })).unwrap();
        message.success("Nation updated successfully!");
      } else {
        await dispatch(addNation(data)).unwrap();
        message.success("Nation added successfully!");
      }
      setShowForm(false);
      setEditData(null);
      await dispatch(fetchNations()); // Refresh data after add/edit
    } catch (err) {
      message.error(
        `Failed to ${editData ? "update" : "add"} nation: ${
          err.message || "Server error"
        }`
      );
    }
  };

  const columns = [
    { title: "Nation Name", dataIndex: "nationName", key: "nationName" },
    {
      title: "Actions",
      key: "actions",
      render: (_, nation) => (
        <div className="flex space-x-2">
          <Button
            type="link"
            onClick={() => handleEdit(nation)}
            className="text-pink-600 hover:text-yellow-700"
            disabled={!nation.id}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this nation?"
            onConfirm={() => handleDelete(nation.id)}
            okText="Yes"
            cancelText="No"
            disabled={!nation.id}
          >
            <Button
              type="link"
              className="text-red-600 hover:text-red-700 color-red-600"
              disabled={!nation.id}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  console.log("Rendering NationManagementPage:", {
    loading,
    fetchError,
    nationsLength: nations.length,
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-600">
        Loading...
      </div>
    );
  if (fetchError)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600">
        Error: {fetchError}
      </div>
    );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Nation Management
          </h2>
        </header>
        <main className="p-6 max-w-7xl mx-auto">
          <p className="text-gray-600 mb-6 text-lg">
            Manage nations and their settings.
          </p>
          <div className="flex justify-between items-center mb-6">
            <Button
              onClick={() => navigate("/geography")}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back
            </Button>
            <Button
              type="primary"
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Nation
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Table
              columns={columns}
              dataSource={nations.map((n, index) => ({
                ...n,
                key: n.id || `nation-${index}`,
              }))}
              pagination={{ pageSize: 10 }}
              bordered
              className="ant-table-custom"
            />
          </div>
        </main>
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={() => {
                  setShowForm(false);
                  setEditData(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
              <NationForm
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

export default NationManagementPage;
