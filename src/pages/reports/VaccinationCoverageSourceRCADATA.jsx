import React from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

function VaccinationCoverageSourceRCADATA() {
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Vaccination Coverage Source of RCA Data", 14, 15);
    const date = new Date().toISOString().split("T")[0];
    doc.save(`vaccination_coverage_rca_${date}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["Vaccination Coverage Source of RCA Data"]]);
    XLSX.utils.book_append_sheet(wb, ws, "CoverageRCA");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `vaccination_coverage_rca_${date}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-green-800">Vaccination Coverage Source of RCA Data</h3>
        <div className="space-x-2">
          <button onClick={exportToPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Export to PDF</button>
          <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Export to Excel</button>
        </div>
      </div>
    </div>
  );
}

export default VaccinationCoverageSourceRCADATA;