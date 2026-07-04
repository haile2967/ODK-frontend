import React, { useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { legendRules } from "./legendConfig";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function VaccinationCoverageRCA() {
  const { filteredDfaData, selectedProjectId, selectedFormId } = useSelector(
    (state) => state.coverageReport
  );
  const [showPopup, setShowPopup] = useState(false);
  const tableRef = useRef(null);

  // Debug logs
  console.log("filteredDfaData in VaccinationCoverageRCA:", filteredDfaData);
  console.log("selectedProjectId:", selectedProjectId);
  console.log("selectedFormId:", selectedFormId);

  // Aggregate data
  const regionData = useMemo(() => {
    const regionMap = {};
    if (filteredDfaData && filteredDfaData.length > 0) {
      filteredDfaData.forEach((item) => {
        const key = `${item.state}|${item.region}`;
        if (!regionMap[key]) {
          regionMap[key] = {
            state: item.state || "Unknown",
            region: item.region || "Unknown",
            seen_0_11: Number(item["Number of 0_11_M Seen"] || 0),
            vaccinated_0_11: Number(item["Vaccinated_0_11 M"] || 0),
            seen_12_59: Number(item["12_59 M Seen"] || 0),
            vaccinated_12_59: Number(item["Vaccinated_12_59 M"] || 0),
            missed_children: Number(item["Number of missed_children"] || 0),
          };
          regionMap[key].percent_0_11 =
            regionMap[key].seen_0_11 > 0
              ? ((regionMap[key].vaccinated_0_11 / regionMap[key].seen_0_11) * 100).toFixed(1)
              : "0";
          regionMap[key].percent_12_59 =
            regionMap[key].seen_12_59 > 0
              ? ((regionMap[key].vaccinated_12_59 / regionMap[key].seen_12_59) * 100).toFixed(1)
              : "0";
          regionMap[key].total_percent = (
            parseFloat(regionMap[key].percent_0_11) + parseFloat(regionMap[key].percent_12_59)
          ).toFixed(1);
        }
      });
    }
    return Object.values(regionMap);
  }, [filteredDfaData]);

  // Calculate grand totals
  const grandTotal = useMemo(() => {
    const totals = {
      seen_0_11: regionData.reduce((sum, item) => sum + item.seen_0_11, 0),
      vaccinated_0_11: regionData.reduce((sum, item) => sum + item.vaccinated_0_11, 0),
      seen_12_59: regionData.reduce((sum, item) => sum + item.seen_12_59, 0),
      vaccinated_12_59: regionData.reduce((sum, item) => sum + item.vaccinated_12_59, 0),
      missed_children: regionData.reduce((sum, item) => sum + item.missed_children, 0),
    };
    totals.percent_0_11 =
      totals.seen_0_11 > 0
        ? ((totals.vaccinated_0_11 / totals.seen_0_11) * 100).toFixed(1)
        : "0";
    totals.percent_12_59 =
      totals.seen_12_59 > 0
        ? ((totals.vaccinated_12_59 / totals.seen_12_59) * 100).toFixed(1)
        : "0";
    totals.total_percent = (
      parseFloat(totals.percent_0_11) + parseFloat(totals.percent_12_59)
    ).toFixed(1);
    return totals;
  }, [regionData]);

  // Check if at least one filter is selected
  const isFilterSelected = selectedProjectId !== "" || selectedFormId !== "";

  // Render message if no filters are selected
  if (!isFilterSelected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
          Vaccination Coverage by Region
        </h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID or Form ID in Report Configuration
        </div>
      </div>
    );
  }

  // Render no data message if filteredDfaData is empty
  if (!filteredDfaData || filteredDfaData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
          Vaccination Coverage by Region
        </h3>
        <div className="text-center text-red-600 font-medium">
          No data available for selected filters
        </div>
      </div>
    );
  }

  // Export to PDF (no color fill)
  const exportToPDF = () => {
    try {
      const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "portrait" });
      doc.setFont("helvetica", "normal");

      const tableColumn = [
        "State",
        "Region",
        "0-11M Seen",
        "0-11M Vaccinated",
        "12-59M Seen",
        "12-59M Vaccinated",
        "Missed Children",
        "% Vaccinated 0-11M",
        "% Vaccinated 12-59M",
        "Sum % Vaccinated",
      ];

      const tableRows = regionData.map((item) => [
        item.state,
        item.region,
        item.seen_0_11,
        item.vaccinated_0_11,
        item.seen_12_59,
        item.vaccinated_12_59,
        item.missed_children,
        `${item.percent_0_11}%`,
        `${item.percent_12_59}%`,
        `${item.total_percent}%`,
      ]);

      // Add grand total row
      tableRows.push([
        "Grand Total",
        "",
        grandTotal.seen_0_11,
        grandTotal.vaccinated_0_11,
        grandTotal.seen_12_59,
        grandTotal.vaccinated_12_59,
        grandTotal.missed_children,
        `${grandTotal.percent_0_11}%`,
        `${grandTotal.percent_12_59}%`,
        `${grandTotal.total_percent}%`,
      ]);

      doc.text("Vaccination Coverage by Region", 14, 15);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: "#F3F4F6", textColor: "#1F2937" },
        alternateRowStyles: { fillColor: "#F9FAFB" },
        styles: { cellPadding: 2, fontSize: 10, lineColor: "#D1D5DB", lineWidth: 0.1 },
        margin: { top: 20 },
      });

      const date = new Date().toISOString().split("T")[0];
      doc.save(`vaccination_coverage_rca_${date}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please check the console for details.");
    }
  };

  // Export to Excel (no color fill)
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const wsData = [
        [
          "State",
          "Region",
          "0-11M Seen",
          "0-11M Vaccinated",
          "12-59M Seen",
          "12-59M Vaccinated",
          "Missed Children",
          "% Vaccinated 0-11M",
          "% Vaccinated 12-59M",
          "Sum % Vaccinated",
        ],
      ];

      regionData.forEach((item) => {
        wsData.push([
          item.state,
          item.region,
          item.seen_0_11,
          item.vaccinated_0_11,
          item.seen_12_59,
          item.vaccinated_12_59,
          item.missed_children,
          `${item.percent_0_11}%`,
          `${item.percent_12_59}%`,
          `${item.total_percent}%`,
        ]);
      });

      // Add grand total row
      wsData.push([
        "Grand Total",
        "",
        grandTotal.seen_0_11,
        grandTotal.vaccinated_0_11,
        grandTotal.seen_12_59,
        grandTotal.vaccinated_12_59,
        grandTotal.missed_children,
        `${grandTotal.percent_0_11}%`,
        `${grandTotal.percent_12_59}%`,
        `${grandTotal.total_percent}%`,
      ]);

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = wsData[0].map((_, idx) => ({ wch: idx < 2 ? 20 : 15 }));

      XLSX.utils.book_append_sheet(wb, ws, "VaccinationCoverage");
      const date = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `vaccination_coverage_rca_${date}.xlsx`);
    } catch (error) {
      console.error("Excel export failed:", error);
      alert("Failed to export Excel. Please check the console for details.");
    }
  };

  // Legend tooltip content
  const getLegendTooltip = (rule) =>
    `${rule.range}: ${
      rule.color === "Green"
        ? "Full compliance — all reports received ✅"
        : rule.color === "Light Green"
        ? "Near full compliance — acceptable"
        : rule.color === "Yellow"
        ? "Needs improvement"
        : rule.color === "Light Yellow"
        ? "Significant gaps — attention needed"
        : rule.color === "Red"
        ? "Critical — urgent action required"
        : "Data error — likely over-reporting"
    }`;

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-700 text-center w-full">
          Vaccination Coverage by Region
        </h3>
      </div>
      <div className="flex justify-end mb-4 space-x-2">
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Export to PDF
        </button>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Export to Excel
        </button>
      </div>
      <div className="flex justify-start mb-4 space-x-2">
        {legendRules.map((rule) => (
          <div
            key={rule.color}
            className={`w-6 h-6 ${rule.className} rounded cursor-pointer`}
            onClick={() => setShowPopup(true)}
            title={getLegendTooltip(rule)}
          />
        ))}
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4 relative">
            <button
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-gray-600"
              onClick={() => setShowPopup(false)}
            >
              ✕
            </button>
            <h4 className="text-sm font-semibold mb-4 text-black">Legend Details</h4>
            <ul className="pl-5 space-y-2">
              {legendRules.map((rule) => (
                <li key={rule.color} className="mb-2 text-xs text-black">
                  <span className={`inline-block w-4 h-4 ${rule.className} mr-2`} />
                  {getLegendTooltip(rule)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div ref={tableRef} className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700">State</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700">Region</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700">0-11M Seen</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700">0-11M Vaccinated</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700">12-59M Seen</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700">12-59M Vaccinated</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700">Missed Children</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700" title="(vaccinated_0_11 / seen_0_11) * 100">% Vaccinated 0-11M</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700" title="(vaccinated_12_59 / seen_12_59) * 100">% Vaccinated 12-59M</th>
              <th className="py-3 px-4 border border-gray-300 font-semibold text-gray-700" title="(percent_0_11 + percent_12_59)">Sum % Vaccinated</th>
            </tr>
          </thead>
          <tbody>
            {regionData.map((item, idx) => (
              <tr
                key={`${item.state}-${item.region}-${idx}`}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="py-3 px-4 border border-gray-300">{item.state}</td>
                <td className="py-3 px-4 border border-gray-300">{item.region}</td>
                <td className="py-3 px-4 border border-gray-300">{item.seen_0_11}</td>
                <td className="py-3 px-4 border border-gray-300">{item.vaccinated_0_11}</td>
                <td className="py-3 px-4 border border-gray-300">{item.seen_12_59}</td>
                <td className="py-3 px-4 border border-gray-300">{item.vaccinated_12_59}</td>
                <td className="py-3 px-4 border border-gray-300">{item.missed_children}</td>
                <td className="py-3 px-4 border border-gray-300">{`${item.percent_0_11}%`}</td>
                <td className="py-3 px-4 border border-gray-300">{`${item.percent_12_59}%`}</td>
                <td className="py-3 px-4 border border-gray-300">{`${item.total_percent}%`}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-semibold">
              <td className="py-3 px-4 border border-gray-300" colSpan={2}>
                GRAND TOTAL
              </td>
              <td className="py-3 px-4 border border-gray-300">{grandTotal.seen_0_11}</td>
              <td className="py-3 px-4 border border-gray-300">{grandTotal.vaccinated_0_11}</td>
              <td className="py-3 px-4 border border-gray-300">{grandTotal.seen_12_59}</td>
              <td className="py-3 px-4 border border-gray-300">{grandTotal.vaccinated_12_59}</td>
              <td className="py-3 px-4 border border-gray-300">{grandTotal.missed_children}</td>
              <td className="py-3 px-4 border border-gray-300">{`${grandTotal.percent_0_11}%`}</td>
              <td className="py-3 px-4 border border-gray-300">{`${grandTotal.percent_12_59}%`}</td>
              <td className="py-3 px-4 border border-gray-300">{`${grandTotal.total_percent}%`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VaccinationCoverageRCA;