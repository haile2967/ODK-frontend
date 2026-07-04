import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { legendRules } from "./legendConfig";
import { exportToExcel } from "../../utils/downloadUtils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function ReportByRegion() {
  const [showPopup, setShowPopup] = useState(false);
  const tableRef = useRef(null);
  const { filteredDfaData, selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);

  // Debug: Log filtered data and selections
  console.log("filteredDfaData in ReportByRegion:", filteredDfaData);
  console.log("selectedProjectId:", selectedProjectId);
  console.log("selectedFormId:", selectedFormId);

  // Check if at least one filter is selected
  const isFilterSelected = selectedProjectId !== "" && selectedFormId !== "";

  // Render message if no filters are selected
  if (!isFilterSelected) {
    return (
      <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
        <h3 className="text-center font-semibold text-gray-900">Reporting compliance by region</h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID or Form ID in Report Configuration
        </div>
      </div>
    );
  }

  if (!filteredDfaData || filteredDfaData.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Reporting compliance by region</h3>
        <p className="text-gray-600">No data available for the selected filters.</p>
      </div>
    );
  }

  // Get unique campaign days and assign "Day 1", "Day 2", ...
  const campaignDayKey = "campaign_day"; // Change to 'day' if JSON uses a different field
  const campaignDays = Array.from(
    new Set(filteredDfaData.map((item) => item[campaignDayKey]))
  ).sort();
  console.log("Unique campaign days:", campaignDays); // Debug: Log unique days
  const dayLabels = campaignDays.map((_, idx) => `Day ${idx + 1}`);
  console.log("Day labels:", dayLabels); // Debug: Log day labels

  // Helper to map campaign_day to Day N
  const dayMap = Object.fromEntries(
    campaignDays.map((date, idx) => [date, `Day ${idx + 1}`])
  );

  // Aggregate by region and campaign day
  const getRegionData = () => {
    const regionMap = {};
    filteredDfaData.forEach((item) => {
      const key = `${item.state}|${item.region}`;
      if (!regionMap[key]) {
        regionMap[key] = {
          state: item.state || "Unknown",
          region: item.region || "Unknown",
          teams_per_day: {},
          teams_assigned_per_day: {},
        };
      }
      const dayLabel = dayMap[item[campaignDayKey]] || "Unknown Day";
      const participated = Number(item.no_of_team_participated) || 0;
      const assigned = Number(item.no_of_team_assigned) || 0;
      console.log(`Processing: ${key}, Day: ${dayLabel}, Participated: ${participated}, Assigned: ${assigned}`); // Debug
      regionMap[key].teams_per_day[dayLabel] =
        (regionMap[key].teams_per_day[dayLabel] || 0) + participated;
      regionMap[key].teams_assigned_per_day[dayLabel] =
        (regionMap[key].teams_assigned_per_day[dayLabel] || 0) + assigned;
    });
    const regionData = Object.values(regionMap);
    console.log("Aggregated regionData:", regionData); // Debug
    return regionData;
  };

  // Function to determine color class based on percentage using legendRules
  const getColorClass = (percent) => {
    const numPercent = parseFloat(percent) || 0;
    const rule = legendRules.find((r) => numPercent >= r.min && numPercent <= r.max);
    return rule ? rule.className : "";
  };

  // Calculate grand total using only the first day's assigned teams as reference
  const regionData = getRegionData();
  const grandTotalAssigned = regionData.reduce(
    (sum, item) => sum + (item.teams_assigned_per_day[dayLabels[0]] || 0),
    0
  );
  const grandTotalPerDay = Object.fromEntries(
    dayLabels.map((day) => [
      day,
      regionData.reduce((sum, item) => sum + (item.teams_per_day[day] || 0), 0),
    ])
  );
  console.log("Grand total per day:", grandTotalPerDay); // Debug

  // Export to PDF with image and title
  const exportToPDF = async () => {
    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "portrait" });
      const imgWidth = 190; // Adjust width to fit page
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 20; // Increased to accommodate title

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Reporting compliance by region", 10, 10);

      // Add image
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 10); // Adjust for title space

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 20;
        doc.addPage();
        doc.text("Reporting compliance by region", 10, 10);
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 10);
      }

      const date = new Date().toISOString().split("T")[0];
      doc.save(`report_by_region_${date}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please check the console for details.");
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
    <div className="bg-white p-4 rounded-lg shadow max-w-2xl mx-auto relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900 text-center w-full">
          Reporting compliance by region
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
          onClick={() => exportToExcel(regionData, dayLabels, grandTotalAssigned, grandTotalPerDay)}
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
          ></div>
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
                  <span className={`inline-block w-4 h-4 ${rule.className} mr-2`}></span>
                  {getLegendTooltip(rule)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div ref={tableRef}>
        <table className="min-w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-0.5 px-2 border border-gray-300">State</th>
              <th className="py-0.5 px-2 border border-gray-300">Region</th>
              <th className="py-0.5 px-2 border border-gray-300">Number of Teams</th>
              {dayLabels.map((day) => (
                <React.Fragment key={day}>
                  <th className="py-0.5 px-2 border border-gray-300">{day}</th>
                  <th className="py-0.5 px-2 border border-gray-300" title={`(participated / assigned) * 100%`}>% of reported {day}</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {regionData.map((item, idx) => (
              <tr
                key={`${item.state}-${item.region}-${idx}`}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="py-0.5 px-2 border border-gray-300">{item.state}</td>
                <td className="py-0.5 px-2 border border-gray-300">{item.region}</td>
                <td className="py-0.5 px-2 border border-gray-300">
                  {item.teams_assigned_per_day[dayLabels[0]] || 0}
                </td>
                {dayLabels.map((day) => {
                  const participated = item.teams_per_day[day] || 0;
                  const assigned = item.teams_assigned_per_day[dayLabels[0]] || 0;
                  const percent = assigned > 0 ? ((participated / assigned) * 100).toFixed(1) : "0";
                  const colorClass = getColorClass(parseFloat(percent) || 0);
                  return (
                    <React.Fragment key={day}>
                      <td className="py-0.5 px-2 border border-gray-300">{participated}</td>
                      <td className={`py-0.5 px-2 border border-gray-300 ${colorClass} rounded`}>
                        {`${percent}%`}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-gray-100 font-semibold">
              <td className="py-0.5 px-2 border border-gray-300" colSpan="2">
                Grand Total
              </td>
              <td className="py-0.5 px-2 border border-gray-300">{grandTotalAssigned}</td>
              {dayLabels.map((day) => {
                const participated = grandTotalPerDay[day] || 0;
                const percent = grandTotalAssigned > 0 ? ((participated / grandTotalAssigned) * 100).toFixed(1) : "0";
                const colorClass = getColorClass(parseFloat(percent) || 0);
                return (
                  <React.Fragment key={day}>
                    <td className="py-0.5 px-2 border border-gray-300">{participated}</td>
                    <td className={`py-0.5 px-2 border border-gray-300 ${colorClass} rounded`}>
                      {`${percent}%`}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportByRegion;