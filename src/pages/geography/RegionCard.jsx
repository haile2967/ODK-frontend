import React, { useState, useEffect, Component } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Button, Popconfirm, message } from "antd";
import RegionForm from "../../components/forms/RegionForm";

import {
  fetchRegions,
  addRegion,
  editRegion,
  deleteRegion,
} from "../../store/regionSlice";
import { fetchStates } from "../../store/stateSlice";
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

function RegionManagementPage({ onBack }) {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const {
    regions,
    loading,
    error: fetchError,
  } = useSelector(
    (state) => state.regions || { regions: [], loading: false, error: null }
  );
  const [states, setStates] = useState([]); // Store states to resolve state_id

  useEffect(() => {
    console.log(
      "useEffect triggered, dispatching fetchRegions and fetchStates"
    );
    const fetchData = async () => {
      try {
        await dispatch(fetchRegions()).unwrap();
        const statesResponse = await dispatch(fetchStates()).unwrap();
        setStates(statesResponse); // Store states for lookup
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

  const handleEdit = (region) => {
    console.log("handleEdit triggered for region:", region);
    setEditData(region);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    console.log("handleDelete triggered for region id:", id);
    dispatch(deleteRegion(id)).then(() => {
      dispatch(fetchRegions()); // Refresh data after delete
    });
  };

  const handleSubmit = async (data) => {
    console.log("Submitting region data:", data);
    try {
      if (editData) {
        await dispatch(editRegion({ id: editData.id, ...data })).unwrap();
        message.success("Region updated successfully!");
      } else {
        await dispatch(addRegion(data)).unwrap();
        message.success("Region added successfully!");
      }
      setShowForm(false);
      setEditData(null);
      await dispatch(fetchRegions()); // Refresh data after add/edit
    } catch (err) {
      message.error(
        `Failed to ${editData ? "update" : "add"} region: ${
          err.message || "Server error"
        }`
      );
    }
  };

  const getStateName = (stateId) => {
    const state = states.find((s) => s.id === stateId);
    return state ? state.stateName : "Unknown";
  };

  const columns = [
    { title: "Region Name", dataIndex: "regionName", key: "regionName" },
    {
      title: "State Name",
      key: "stateName",
      render: (_, region) => getStateName(region.state_id),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, region) => (
        <div className="flex space-x-2">
          <Button
            type="link"
            onClick={() => handleEdit(region)}
            className="text-yellow-600 hover:text-yellow-700"
            disabled={!region.id}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this region?"
            onConfirm={() => handleDelete(region.id)}
            okText="Yes"
            cancelText="No"
            disabled={!region.id}
          >
            <Button
              type="link"
              className="text-red-600 hover:text-red-700"
              disabled={!region.id}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  console.log("Rendering RegionManagementPage:", {
    loading,
    fetchError,
    regionsLength: regions.length,
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
            Region Management
          </h2>
        </header>
        <main className="p-6 max-w-7xl mx-auto">
          <p className="text-gray-600 mb-6 text-lg">
            Manage regions and their settings.
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
              Add Region
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Table
              columns={columns}
              dataSource={regions.map((r, index) => ({
                ...r,
                key: r.id || `region-${index}`,
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
              <RegionForm
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

export default RegionManagementPage;
