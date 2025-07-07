import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMergedData } from "../../store/mergeSlice";

import * as XLSX from 'xlsx';

function DataCleaningCard() {
  const { mergedData } = useSelector((state) => state.merge);
  const dispatch = useDispatch();

  const [cleanedData, setCleanedData] = useState([]);
  const [showCleanedData, setShowCleanedData] = useState(false);

  useEffect(() => {
    setShowCleanedData(false);
    if (mergedData && mergedData.length > 0) {
      const uniqueData = Array.from(
        new Map(mergedData.map(item => [JSON.stringify(item), item])).values()
      );
      setCleanedData(uniqueData);
    } else {
      setCleanedData([]);
    }
  }, [mergedData]);

  const handleShowCleanedData = () => {
    setShowCleanedData(true);
  };

  const handleDownload = () => {
    const normalized = cleanedData.map(item => ({
      project_id: item.project_id ?? 'N/A',
      form_id: item.form_id ?? 'N/A',
      submission_start_date: item.submission_start_date ?? 'N/A',
      submission_end_date: item.submission_end_date ?? 'N/A',
      table_name: item.table_name ?? 'N/A',
      campaign_day: item.campaign_day ?? 'N/A',
      device_id: item.device_id ?? 'N/A',
      state: item.state ?? 'N/A',
      region: item.region ?? 'N/A',
      district: item.district ?? 'N/A',
      dfa_code: item.dfa_code ?? 'N/A',
      raw_data: item.raw_data ?? 'N/A',
      user_id: item.user_id ?? 'N/A',
      created_at: item.created_at ?? 'N/A',
      updated_at: item.updated_at ?? 'N/A',
    }));
    const ws = XLSX.utils.json_to_sheet(normalized);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cleaned Data');
    XLSX.writeFile(wb, 'cleaned_data.xlsx');
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-md border border-gray-100 w-full">
      <div className="flex flex-col sm:flex-row justify-center items-center mb-6 gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Data Cleaning
          </h3>
          <p className="text-blue-500 text-xs sm:text-sm mt-1">Clean redundant data from merged table.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!showCleanedData && mergedData && mergedData.length > 0 && (
            <button
              onClick={handleShowCleanedData}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-1.5 py-0.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm shadow-sm"
            >
              Show Cleaned Data
            </button>
          )}
          {showCleanedData && cleanedData.length > 0 && (
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white px-1.5 py-0.5 rounded-lg hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-200 text-sm shadow-sm"
            >
              Excel Download
            </button>
          )}
        </div>
      </div>

      {showCleanedData && cleanedData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <tr>
                <th className="p-4 font-semibold text-sm sm:text-base">Submission Start Date</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Submission End Date</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Table Name</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Campaign Day</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Device ID</th>
                <th className="p-4 font-semibold text-sm sm:text-base">State</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Region</th>
                <th className="p-4 font-semibold text-sm sm:text-base">District</th>
                <th className="p-4 font-semibold text-sm sm:text-base">DFA Code</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Raw Data</th>
                <th className="p-4 font-semibold text-sm sm:text-base">User ID</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Created At</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {cleanedData.map((item, i) => (
                <tr
                  key={`${item.dfa_code}-${item.created_at}-${i}`}
                  className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'} hover:bg-blue-200 transition-all duration-200`}
                >
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.submission_start_date ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.submission_end_date ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.table_name ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.campaign_day ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.device_id ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.state ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.region ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.district ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.dfa_code ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.raw_data ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.user_id ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.created_at ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.updated_at ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : mergedData && mergedData.length > 0 ? (
        <p className="text-blue-600 text-sm sm:text-base">
          Click "Show Cleaned Data" to view the cleaned data.
        </p>
      ) : (
        <p className="text-blue-600 text-sm sm:text-base">
          No merged data available to clean.
        </p>
      )}
    </div>
  );
}

export default DataCleaningCard;