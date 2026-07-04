import React, { useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setProjectId, setFormId, clearFilters, fetchAllDfaData, fetchDfaDataByProjectAndForm } from "../../store/coverageReportSlice";
import { useDose } from "./DoseContext"; // Import useDose hook

function ReportConfiguration() { // Remove onDosesPerVialChange prop
  const dispatch = useDispatch();
  const { dfaData, selectedProjectId, selectedFormId, loading, error } = useSelector((state) => state.coverageReport);
  const { dosesPerVial, setDosesPerVial } = useDose(); // Access context values
  const [localDosesPerVial, setLocalDosesPerVial] = useState(dosesPerVial); // Sync with context

  useEffect(() => {
    console.log("Dispatching fetchAllDfaData");
    dispatch(fetchAllDfaData());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProjectId && selectedFormId) {
      console.log(`Dispatching fetchDfaDataByProjectAndForm with projectId: ${selectedProjectId}, formId: ${selectedFormId}`);
      dispatch(fetchDfaDataByProjectAndForm({ projectId: selectedProjectId, formId: selectedFormId }));
    }
  }, [dispatch, selectedProjectId, selectedFormId]);

  useEffect(() => {
    // Sync local state with context when dosesPerVial changes
    setLocalDosesPerVial(dosesPerVial);
  }, [dosesPerVial]);

  const projectIds = useMemo(() => {
    const ids = [...new Set(dfaData?.map((item) => item.project_id).filter(Boolean) || [])].sort();
    console.log("projectIds derived from dfaData:", ids);
    return ids;
  }, [dfaData]);

  const formIds = useMemo(() => {
    const ids = [...new Set(
      dfaData
        ?.filter((item) => item.project_id === selectedProjectId)
        .map((item) => item.form_id)
        .filter(Boolean) || []
    )].sort();
    console.log(`formIds for projectId ${selectedProjectId}:`, ids);
    return ids;
  }, [dfaData, selectedProjectId]);

  const handleProjectIdChange = (e) => {
    const value = e.target.value;
    console.log("Selected Project ID:", value);
    dispatch(setProjectId(value));
    dispatch(setFormId(""));
  };

  const handleFormIdChange = (e) => {
    const value = e.target.value;
    console.log("Selected Form ID:", value);
    dispatch(setFormId(value));
  };

  const handleDosesPerVialChange = (e) => {
    const value = e.target.value;
    console.log("Selected Doses Per Vial:", value);
    const newValue = value ? Number(value) : null;
    setLocalDosesPerVial(newValue); // Update local state
    setDosesPerVial(newValue); // Update context state
  };

  const handleClearFilters = () => {
    console.log("Clearing filters");
    dispatch(clearFilters());
    setLocalDosesPerVial(""); // Reset local state
    setDosesPerVial(""); // Reset context state
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Report Configuration</h2>
      {loading && <p className="text-center text-blue-600">Loading data...</p>}
      {error && <p className="text-center text-red-600">Error: {error}</p>}
      {dfaData.length === 0 && !loading && !error && (
        <p className="text-center text-red-600">No data available. Please check data source.</p>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex-1 mb-4 sm:mb-0">
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
          <select
            id="projectId"
            value={selectedProjectId}
            onChange={handleProjectIdChange}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <option value="">Select Project ID</option>
            {projectIds.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 mb-4 sm:mb-0">
          <label htmlFor="formId" className="block text-sm font-medium text-gray-700 mb-1">Form ID</label>
          <select
            id="formId"
            value={selectedFormId}
            onChange={handleFormIdChange}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            disabled={!selectedProjectId}
          >
            <option value="">Select Form ID</option>
            {formIds.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 mb-4 sm:mb-0">
          <label htmlFor="dosesPerVial" className="block text-sm font-medium text-gray-700 mb-1">Doses Per Vial</label>
          <input
            id="dosesPerVial"
            type="number"
            value={localDosesPerVial || ""}
            onChange={handleDosesPerVialChange}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            min="1"
            placeholder="Enter doses per vial"
          />
        </div>
        <div>
          <button
            onClick={handleClearFilters}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportConfiguration;