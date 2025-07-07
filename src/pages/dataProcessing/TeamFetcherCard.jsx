import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTeam } from "../../store/teamSlice";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function TeamFetcherCard() {
  const { team } = useSelector((state) => state.team);
  const { forms } = useSelector((state) => state.form);
  const dispatch = useDispatch();

  const [filteredTeam, setFilteredTeam] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedFormId, setSelectedFormId] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('');
  const [isPopulated, setIsPopulated] = useState(false);

  useEffect(() => setIsPopulated(false), [team, forms]);

  const uniqueProjectIds = [...new Set((forms || []).map(f => f.project_id))].sort((a, b) => a - b);
  const uniqueFormIds = [...new Set((forms || []).map(f => f.form_id))].sort();

  const handlePopulate = () => {
    if (selectedProjectId && selectedFormId) {
      const matching = (team || []).filter(t => t.project_id === Number(selectedProjectId) && t.form_id === selectedFormId);
      setFilteredTeam(matching);
      setIsPopulated(true);
    } else {
      setFilteredTeam([]);
      setIsPopulated(false);
    }
  };

  const columns = [
    { key: 'project_id',      label: 'Project ID' },
    { key: 'form_id',         label: 'Form ID' },
    { key: 'team_id',         label: 'Team ID' },
    { key: 'submissions_id',  label: 'Submissions ID' },
    { key: 'table_name',      label: 'Table Name' },
    { key: 'raw_data',        label: 'Raw Data' },
    { key: 'user_id',         label: 'User ID' },
    { key: 'form_df_main_id', label: 'Form DF Main ID' },
    { key: 'odk_form_id',     label: 'ODK Form ID' },
    { key: 'created_at',      label: 'Created At' },
    { key: 'updated_at',      label: 'Updated At' },
  ];

  const handleDownload = () => {
    const normalized = filteredTeam.map(item => ({
      project_id:      item.project_id      ?? 'N/A',
      form_id:         item.form_id         ?? 'N/A',
      team_id:         item.team_id         ?? 'N/A',
      submissions_id:  item.submissions_id  ?? 'N/A',
      table_name:      item.table_name      ?? 'N/A',
      raw_data:        item.raw_data        ?? 'N/A',
      user_id:         item.user_id         ?? 'N/A',
      form_df_main_id: item.form_df_main_id ?? 'N/A',
      odk_form_id:     item.odk_form_id     ?? 'N/A',
      created_at:      item.created_at      ?? 'N/A',
      updated_at:      item.updated_at      ?? 'N/A',
    }));

    if (downloadFormat === 'excel') {
      const sheetData = normalized.map(row => {
        const obj = {};
        columns.forEach(col => {
          obj[col.label] = row[col.key];
        });
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Team');
      XLSX.writeFile(wb, 'team.xlsx');
    } else if (downloadFormat === 'pdf') {
      try {
        const doc = new jsPDF();
        autoTable(doc, {
          head: [columns.map(col => col.label)],
          body: normalized.map(row => columns.map(col => row[col.key])),
          theme: 'grid',
          styles:     { fillColor: [200, 220, 255], textColor: [0, 0, 0], overflow: 'linebreak' },
          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        });
        doc.save('team.pdf');
      } catch (err) {
        console.error('PDF generation failed:', err);
        alert('Failed to generate PDF. Check console for details.');
      }
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-md border border-gray-100 w-full">
      <div className="flex flex-col sm:flex-row justify-center items-center mb-6 gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Team Analysis
          </h3>
          <p className="text-blue-500 text-xs sm:text-sm mt-1">Display team data.</p>
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
          <select
            value={downloadFormat}
            onChange={e => setDownloadFormat(e.target.value)}
            className="p-1 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm max-w-xs bg-blue-50 text-blue-800"
          >
            <option value="" disabled>Select format</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
          <button
            onClick={handleDownload}
            disabled={!isPopulated || filteredTeam.length === 0 || !downloadFormat}
            className={`px-1.5 py-0.5 rounded-lg text-sm transition-all duration-200 shadow-md
              ${!isPopulated || filteredTeam.length === 0 || !downloadFormat
                ? 'bg-blue-200 cursor-not-allowed text-gray-600'
                : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white hover:from-blue-500 hover:via-blue-600 hover:to-blue-700'
              }`}
          >
            Download
          </button>
        </div>
      </div>

      {isPopulated && filteredTeam.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="p-4 font-semibold text-sm sm:text-base">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTeam.map((item, i) => (
                <tr
                  key={`${item.team_id}-${item.submissions_id}-${i}`}
                  className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'} hover:bg-blue-200 transition-all duration-200`}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className="p-4 text-blue-900 text-sm sm:text-base"
                    >
                      {col.key === 'raw_data' ? JSON.stringify(item[col.key]) : item[col.key] ?? 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isPopulated ? (
        <p className="text-blue-600 text-sm sm:text-base">
          No team data available for selected Project and Form.
        </p>
      ) : null}
    </div>
  );
}

export default TeamFetcherCard;