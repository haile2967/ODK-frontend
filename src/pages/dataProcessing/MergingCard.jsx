import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMergedData } from "../../store/mergeSlice";
import * as XLSX from 'xlsx';

function MergingCard() {
  const { dfa } = useSelector((state) => state.dfa);
  const { team } = useSelector((state) => state.team);
  const { forms } = useSelector((state) => state.form);
  const { mergedData } = useSelector((state) => state.merge);
  const dispatch = useDispatch();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('');
  const [isMerged, setIsMerged] = useState(false);

  useEffect(() => setIsMerged(false), [dfa, team, forms]);

  const uniqueProjectIds = [...new Set((forms || []).map(f => f.project_id))].sort((a, b) => a - b);
  const uniqueFormIds = [...new Set((forms || []).map(f => f.form_id))].sort();

  const handleMerge = () => {
    if (selectedProjectId && selectedFormId && dfa && dfa.length > 0 && team && team.length > 0) {
      const filteredDfa = dfa.filter(d => d.project_id === Number(selectedProjectId) && d.form_id === selectedFormId);
      const filteredTeam = team.filter(t => t.project_id === Number(selectedProjectId) && t.form_id === selectedFormId);

      if (filteredDfa.length > 0 && filteredTeam.length > 0) {
        const merged = filteredDfa.map(dfaItem => {
          const teamItem = filteredTeam.find(t => t.project_id === dfaItem.project_id && t.form_id === dfaItem.form_id);
          return {
            project_id: dfaItem.project_id,
            form_id: dfaItem.form_id,
            submission_start_date: teamItem?.submission_start_date ?? dfaItem.created_at,
            submission_end_date: teamItem?.submission_end_date ?? dfaItem.updated_at,
            table_name: teamItem?.table_name ?? dfaItem.table_name,
            campaign_day: dfaItem.compain_day,
            device_id: teamItem?.device_id ?? 'N/A',
            state: dfaItem.state,
            region: dfaItem.region,
            district: dfaItem.district,
            dfa_code: dfaItem.data_summary_id,
            raw_data: teamItem?.raw_data ?? dfaItem.raw_data,
            user_id: teamItem?.user_id ?? dfaItem.user_id,
            form_df_main_id: teamItem?.form_df_main_id ?? dfaItem.form_df_main_id,
            created_at: dfaItem.created_at,
            updated_at: dfaItem.updated_at,
          };
        });
        dispatch(setMergedData(merged));
        setIsMerged(true);
      } else {
        setIsMerged(true); // Set to true to trigger the message display
      }
    }
  };

  const handleDownload = () => {
    const normalized = mergedData.map(item => ({
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
      form_df_main_id: item.form_df_main_id ?? 'N/A',
      created_at: item.created_at ?? 'N/A',
      updated_at: item.updated_at ?? 'N/A',
    }));
    const ws = XLSX.utils.json_to_sheet(normalized);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Merged Data');
    XLSX.writeFile(wb, 'merged_data.xlsx');
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-md border border-gray-100 w-full">
      <div className="flex flex-col sm:flex-row justify-center items-center mb-6 gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Merging Analysis
          </h3>
          <p className="text-blue-500 text-xs sm:text-sm mt-1">Merge DFA and Team data.</p>
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
            onClick={handleMerge}
            disabled={!dfa || !dfa.length || !team || !team.length}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-1.5 py-0.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm shadow-sm
              ${(!dfa || !dfa.length || !team || !team.length) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Merge
          </button>
          {isMerged && mergedData.length > 0 && (
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white px-1.5 py-0.5 rounded-lg hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-200 text-sm shadow-sm"
            >
              Excel Download
            </button>
          )}
        </div>
      </div>

      {isMerged && mergedData.length > 0 ? (
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
                <th className="p-4 font-semibold text-sm sm:text-base">Form DF Main ID</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Created At</th>
                <th className="p-4 font-semibold text-sm sm:text-base">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {mergedData.map((item, i) => (
                <tr
                  key={`${item.project_id}-${item.form_id}-${i}`}
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
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.form_df_main_id ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.created_at ?? 'N/A'}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{item.updated_at ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isMerged ? (
        <div>
          {selectedProjectId && selectedFormId && (
            <p className="text-blue-600 text-sm sm:text-base">
              {(!dfa || dfa.filter(d => d.project_id === Number(selectedProjectId) && d.form_id === selectedFormId).length === 0) &&
                (!team || team.filter(t => t.project_id === Number(selectedProjectId) && t.form_id === selectedFormId).length === 0)
                ? 'No DFA and Team data available.'
                : (!dfa || dfa.filter(d => d.project_id === Number(selectedProjectId) && d.form_id === selectedFormId).length === 0)
                  ? 'No DFA data available.'
                  : (!team || team.filter(t => t.project_id === Number(selectedProjectId) && t.form_id === selectedFormId).length === 0)
                    ? 'No Team data available.'
                    : 'No merged data available for selected Project and Form.'
              }
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default MergingCard;