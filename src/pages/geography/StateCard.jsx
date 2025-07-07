import React, { useState, useEffect, Component } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Button, Popconfirm, message } from "antd";
import StateForm from "../../components/forms/StateForm";

import {
  fetchStates,
  addState,
  editState,
  deleteState,
} from "../../store/stateSlice";
import { fetchNations } from "../../store/nationSlice";
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

function StateManagementPage({ onBack }) {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const {
    states,
    loading,
    error: fetchError,
  } = useSelector(
    (state) => state.states || { states: [], loading: false, error: null }
  );
  const { nations } = useSelector((state) => state.nations || { nations: [] });

  useEffect(() => {
    console.log(
      "useEffect triggered, dispatching fetchStates and fetchNations"
    );
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchStates()).unwrap(),
          dispatch(fetchNations()).unwrap(),
        ]);
        console.log("fetchStates and fetchNations completed:", {
          states,
          nations,
        });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleAdd = () => {
    console.log("handleAdd triggered");
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (state) => {
    console.log("handleEdit triggered for state:", state);
    setEditData(state);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    console.log("handleDelete triggered for state id:", id);
    dispatch(deleteState(id)).then(() => {
      dispatch(fetchStates()); // Refresh data after delete
    });
  };

  const handleSubmit = async (data) => {
    console.log("Submitting state data:", data);
    try {
      if (editData) {
        await dispatch(editState({ id: editData.id, ...data })).unwrap();
        message.success("State updated successfully!");
      } else {
        await dispatch(addState(data)).unwrap();
        message.success("State added successfully!");
      }
      setShowForm(false);
      setEditData(null);
      await dispatch(fetchStates()); // Refresh data after add/edit
    } catch (err) {
      message.error(
        `Failed to ${editData ? "update" : "add"} state: ${
          err.message || "Server error"
        }`
      );
    }
  };

  const getNationName = (nationId) => {
    const nation = nations.find((n) => n.id === nationId);
    return nation ? nation.nationName : "Unknown";
  };

  const columns = [
    { title: "State Name", dataIndex: "stateName", key: "stateName" },
    {
      title: "Nation Name",
      key: "nationName",
      render: (_, state) => getNationName(state.nation_id),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, state) => (
        <div className="flex space-x-2">
          <Button
            type="link"
            onClick={() => handleEdit(state)}
            className="text-yellow-600 hover:text-yellow-700"
            disabled={!state.id}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this state?"
            onConfirm={() => handleDelete(state.id)}
            okText="Yes"
            cancelText="No"
            disabled={!state.id}
          >
            <Button
              type="link"
              className="text-red-600 hover:text-red-700"
              disabled={!state.id}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  console.log("Rendering StateManagementPage:", {
    loading,
    fetchError,
    statesLength: states.length,
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
          <h2 className="text-2xl font-bold text-gray-900">State Management</h2>
        </header>
        <main className="p-6 max-w-7xl mx-auto">
          <p className="text-gray-600 mb-6 text-lg">
            Manage states and their settings.
          </p>
          <div className="flex justify-between items-center mb-6">
            {onBack && (
              <Button
                onClick={onBack}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add State
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Table
              columns={columns}
              dataSource={states.map((s, index) => ({
                ...s,
                key: s.id || `state-${index}`,
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
              <StateForm
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

export default StateManagementPage;
