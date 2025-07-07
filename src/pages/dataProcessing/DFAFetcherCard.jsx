import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDfa } from '../../store/dfaSlice';
import * as XLSX from 'xlsx';

function DFAFetcherCard() {
  const { dfa } = useSelector((state) => state.dfa);
  const { forms } = useSelector((state) => state.form);
  const dispatch = useDispatch();

  const [filteredDfa, setFilteredDfa] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('');
  const [isPopulated, setIsPopulated] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => setIsPopulated(false), [dfa, forms]);

  const uniqueProjectIds = [...new Set((forms || []).map(f => f.project_id))].sort((a, b) => a - b);
  const uniqueFormIds = [...new Set((forms || []).map(f => f.form_id))].sort();

  const handlePopulate = () => {
    if (selectedProjectId && selectedFormId) {
      const matching = (dfa || []).filter(d => d.project_id === Number(selectedProjectId) && d.form_id === selectedFormId);
      setFilteredDfa(matching);
      setIsPopulated(true);
    } else {
      setFilteredDfa([]);
      setIsPopulated(false);
    }
  };

  const columns = [
    { key: 'project_id',                     label: 'Project ID' },
    { key: 'form_id',                        label: 'Form ID' },
    { key: 'nation',                         label: 'Nation' },
    { key: 'state',                          label: 'State' },
    { key: 'region',                         label: 'Region' },
    { key: 'district',                       label: 'District' },
    { key: 'compain_day',                    label: 'Campaign Day' },
    { key: 'settlement_type',                label: 'Settlement Type' },
    { key: 'no_of_dfa_assigned',             label: 'DFA Assigned' },
    { key: 'no_of_dfa_participated',         label: 'DFA Participated' },
    { key: 'no_of_team_assigned',            label: 'Team Assigned' },
    { key: 'no_of_team_participated',        label: 'Team Participated' },
    { key: 'vacinated_0_11_zero_occurence',  label: 'Vaccinated 0-11 (Zero)' },
    { key: 'vacinated_12_59_zero_occurence', label: 'Vaccinated 12-59 (Zero)' },
    { key: 'vacinated_0_11_multiple_occuren',label: 'Vaccinated 0-11 (Multiple)' },
    { key: 'vacinated_12_59_multiple_occure',label: 'Vaccinated 12-59 (Multiple)' },
    { key: 'opv_received_total',             label: 'OPV Received Total' },
    { key: 'opv_usedemp_total',              label: 'OPV Used/Empty Total' },
    { key: 'revisited_unvaccinated_not_availa', label: 'Revisited Unvaccinated (Not Available)' },
    { key: 'revisited_unvaccinated_refusals', label: 'Revisited Unvaccinated (Refusals)' },
    { key: 'revisited_unvaccinated_total',   label: 'Revisited Unvaccinated Total' },
    { key: 'number_of_houses_visited',       label: 'Houses Visited' },
    { key: 'data_summary_id',                label: 'Data Summary ID' },
    { key: 'created_at',                     label: 'Created At' },
    { key: 'updated_at',                     label: 'Updated At' },
  ];

  const handleDownload = () => {
    const normalized = filteredDfa.map(item => {
      const obj = {};
      columns.forEach(col => {
        obj[col.label] = item[col.key] ?? 'N/A';
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(normalized);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DFA Data');
    XLSX.writeFile(wb, 'dfa_data.xlsx');
  };

  const getStatistics = (data) => {
    if (!data.length) return {};
    return {
      'Total DFA Assigned': data.reduce((sum, item) => sum + (item.no_of_dfa_assigned || 0), 0),
      'Total DFA Participated': data.reduce((sum, item) => sum + (item.no_of_dfa_participated || 0), 0),
      'Total Team Assigned': data.reduce((sum, item) => sum + (item.no_of_team_assigned || 0), 0),
      'Total Team Participated': data.reduce((sum, item) => sum + (item.no_of_team_participated || 0), 0),
      'Total Vaccinated 0-11 (Zero)': data.reduce((sum, item) => sum + (item.vacinated_0_11_zero_occurence || 0), 0),
      'Total Vaccinated 12-59 (Zero)': data.reduce((sum, item) => sum + (item.vacinated_12_59_zero_occurence || 0), 0),
      'Total Vaccinated 0-11 (Multiple)': data.reduce((sum, item) => sum + (item.vacinated_0_11_multiple_occuren || 0), 0),
      'Total Vaccinated 12-59 (Multiple)': data.reduce((sum, item) => sum + (item.vacinated_12_59_multiple_occure || 0), 0),
      'Total OPV Received': data.reduce((sum, item) => sum + (item.opv_received_total || 0), 0),
      'Total OPV Used/Empty': data.reduce((sum, item) => sum + (item.opv_usedemp_total || 0), 0),
      'Total Houses Visited': data.reduce((sum, item) => sum + (item.number_of_houses_visited || 0), 0),
    };
  };

  const groupedData = filteredDfa.reduce((acc, item) => {
    const key = `${item.nation}-${item.state}-${item.region}-${item.district}`;
    if (!acc[key]) acc[key] = { ...item, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {});

  const handleExpand = (district) => {
    setExpandedRow(expandedRow === district ? null : district);
  };

  const districtStatistics = (district) => {
    const data = filteredDfa.filter(item => item.district === district);
    return getStatistics(data);
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-md border border-gray-100 w-full">
      <div className="flex flex-col sm:flex-row justify-center items-center mb-6 gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            DFA Analysis
          </h3>
          <p className="text-blue-500 text-xs sm:text-sm mt-1">Display DFA statistics.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="p-1 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm max-w-xs bg-blue-50 text-blue-800"
          >
            <option value="">Select Project</option>
            {uniqueProjectIds.map(pid => (
              <option key={pid} value={pid}>Project {pid}</option>
            ))}
          </select>
          <select
            value={selectedFormId}
            onChange={e => setSelectedFormId(e.target.value)}
            className="p-1 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm max-w-xs bg-blue-50 text-blue-800"
          >
            <option value="">Select Form</option>
            {uniqueFormIds.map(fid => (
              <option key={fid} value={fid}>{fid}</option>
            ))}
          </select>
          <button
            onClick={handlePopulate}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-1.5 py-0.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm shadow-sm"
          >
            Populate
          </button>
          <button
            onClick={handleDownload}
            disabled={!isPopulated || filteredDfa.length === 0}
            className={`px-1.5 py-0.5 rounded-lg text-sm transition-all duration-200 shadow-md
              ${!isPopulated || filteredDfa.length === 0
                ? 'bg-blue-200 cursor-not-allowed text-gray-600'
                : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white hover:from-blue-500 hover:via-blue-600 hover:to-blue-700'
              }`}
          >
            Excel Download
          </button>
        </div>
      </div>

      {isPopulated && filteredDfa.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <tr>
                <th className="p-4 font-semibold text-sm sm:text-base">Nations</th>
                <th className="p-4 font-semibold text-sm sm:text-base">States</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Regions</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Districts</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedData).map((item, index) => (
                <React.Fragment key={index}>
                  <tr className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'} hover:bg-blue-200 transition-all duration-200`}>
                    <td className="p-4 text-blue-900 text-sm sm:text-base">{item.nation}</td>
                    <td className="p-4 text-blue-900 text-sm sm:text-base">{item.state}</td>
                    <td className="p-4 text-blue-900 text-sm sm:text-base">{item.region}</td>
                    <td className="p-4 text-blue-900 text-sm sm:text-base">{item.district}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleExpand(item.district)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 py-1 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm"
                      >
                        Expand
                      </button>
                    </td>
                  </tr>
                  {expandedRow === item.district && (
                    <tr>
                      <td colSpan="5" className="p-4 bg-blue-50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {Object.entries(districtStatistics(item.district)).map(([key, value]) => (
                            <div key={key} className="p-2 bg-white shadow-md rounded-lg text-center">
                              <h4 className="text-blue-900 font-semibold text-sm">{key}</h4>
                              <p className="text-blue-700 text-lg">{value}</p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : isPopulated ? (
        <p className="text-blue-600 text-sm sm:text-base">
          No DFA data available for selected Project and Form.
        </p>
      ) : null}
    </div>
  );
}

export default DFAFetcherCard;