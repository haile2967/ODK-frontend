import React, { useState, useEffect, Component } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, Button, Popconfirm, message } from "antd";
import DistrictForm from "../../components/forms/DistrictForm";

import {
  fetchDistricts,
  addDistrict,
  editDistrict,
  deleteDistrict,
} from "../../store/districtSlice";
import { fetchRegions } from "../../store/regionSlice";
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

function DistrictManagementPage({ onBack }) {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const {
    districts,
    loading,
    error: fetchError,
  } = useSelector(
    (state) => state.districts || { districts: [], loading: false, error: null }
  );
  const [regions, setRegions] = useState([]); // Store regions to resolve region_id

  useEffect(() => {
    console.log(
      "useEffect triggered, dispatching fetchDistricts and fetchRegions"
    );
    const fetchData = async () => {
      try {
        await dispatch(fetchDistricts()).unwrap();
        const regionsResponse = await dispatch(fetchRegions()).unwrap();
        setRegions(regionsResponse); // Store regions for lookup
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

  const handleEdit = (district) => {
    console.log("handleEdit triggered for district:", district);
    setEditData(district);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    console.log("handleDelete triggered for district id:", id);
    dispatch(deleteDistrict(id)).then(() => {
      dispatch(fetchDistricts()); // Refresh data after delete
    });
  };

  const handleSubmit = async (data) => {
    console.log("Submitting district data:", data);
    try {
      if (editData) {
        await dispatch(editDistrict({ id: editData.id, ...data })).unwrap();
        message.success("District updated successfully!");
      } else {
        await dispatch(addDistrict(data)).unwrap();
        message.success("District added successfully!");
      }
      setShowForm(false);
      setEditData(null);
      await dispatch(fetchDistricts()); // Refresh data after add/edit
    } catch (err) {
      message.error(
        `Failed to ${editData ? "update" : "add"} district: ${
          err.message || "Server error"
        }`
      );
    }
  };

  const getRegionName = (regionId) => {
    const region = regions.find((r) => r.id === regionId);
    return region ? region.regionName : "Unknown";
  };

  const columns = [
    { title: "District Name", dataIndex: "districtName", key: "districtName" },
    { title: "Number of DFAs", dataIndex: "noOfDFAs", key: "noOfDFAs" },
    { title: "Number of Teams", dataIndex: "noOfTeams", key: "noOfTeams" },
    {
      title: "Region Name",
      key: "regionName",
      render: (_, district) => getRegionName(district.region_id),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, district) => (
        <div className="flex space-x-2">
          <Button
            type="link"
            onClick={() => handleEdit(district)}
            className="text-yellow-600 hover:text-yellow-700"
            disabled={!district.id}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this district?"
            onConfirm={() => handleDelete(district.id)}
            okText="Yes"
            cancelText="No"
            disabled={!district.id}
          >
            <Button
              type="link"
              className="text-red-600 hover:text-red-700"
              disabled={!district.id}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  console.log("Rendering DistrictManagementPage:", {
    loading,
    fetchError,
    districtsLength: districts.length,
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
        Error: Server issue - {fetchError}. Please try again later or contact
        support.
      </div>
    );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            District Management
          </h2>
        </header>
        <main className="p-6 max-w-7xl mx-auto">
          <p className="text-gray-600 mb-6 text-lg">
            Manage districts and their settings.
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
              Add District
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Table
              columns={columns}
              dataSource={districts.map((d, index) => ({
                ...d,
                key: d.id || `district-${index}`,
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
              <DistrictForm
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

export default DistrictManagementPage;
