import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { legendRules } from "./legendConfig";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { exportToExcel, getColorHex } from "../../utils/downloadUtils";

function ReportByDistrict() {
  const [showPopup, setShowPopup] = useState(false);
  const tableRef = useRef(null);
  const { filteredDfaData, selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);

  console.log("filteredDfaData in ReportByDistrict:", filteredDfaData);
  console.log("selectedProjectId:", selectedProjectId);
  console.log("selectedFormId:", selectedFormId);

  const isFilterSelected = selectedProjectId !== "" && selectedFormId !== "";

  if (!isFilterSelected) {
    return (
      <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
        <h3 className="text-center font-semibold text-gray-900">Reporting compliance by district</h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID or Form ID in Report Configuration
        </div>
      </div>
    );
  }

  if (!filteredDfaData || filteredDfaData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
        <h3 className="text-center font-semibold text-gray-900">Reporting compliance by district</h3>
        <p className="text-center text-gray-600">No data available for the selected filters.</p>
      </div>
    );
  }

  const campaignDayKey = "campaign_day";
  const campaignDays = Array.from(new Set(filteredDfaData.map((item) => item[campaignDayKey]))).sort();
  const dayLabels = campaignDays.map((_, idx) => `Day ${idx + 1}`);
  const dayMap = campaignDays.reduce((acc, date, idx) => {
    acc[date] = `Day ${idx + 1}`;
    return acc;
  }, {});

  const getDistrictData = () => {
    const districtMap = new Map();
    filteredDfaData.forEach((item) => {
      const key = `${item.state}|${item.region}|${item.district}`;
      if (!districtMap.has(key)) {
        districtMap.set(key, {
          state: item.state || "Unknown",
          region: item.region || "Unknown",
          district: item.district || "Unknown",
          teams_per_day: {},
          teams_assigned_per_day: {},
        });
      }
      const dayLabel = dayMap[item[campaignDayKey]] || "Unknown Day";
      const participated = Number(item.no_of_team_participated) || 0;
      const assigned = Number(item.no_of_team_assigned) || 0;
      const districtData = districtMap.get(key);
      districtData.teams_per_day[dayLabel] = (districtData.teams_per_day[dayLabel] || 0) + participated;
      districtData.teams_assigned_per_day[dayLabel] = (districtData.teams_assigned_per_day[dayLabel] || 0) + assigned;
    });
    return Array.from(districtMap.values());
  };

  const getColorClass = (percent) => {
    const numPercent = parseFloat(percent) || 0;
    return legendRules.find((r) => numPercent >= r.min && numPercent <= r.max)?.className || "";
  };

  const groupedData = {};
  getDistrictData().forEach((item) => {
    const key = `${item.state}|${item.region}`;
    if (!groupedData[key]) {
      groupedData[key] = { state: item.state, region: item.region, districts: [] };
    }
    groupedData[key].districts.push(item);
  });

  const exportToPDF = async () => {
    const canvas = await html2canvas(tableRef.current, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
    const imgWidth = 280;
    const pageHeight = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Reporting compliance by district", 10, 10);

    doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 20;
      doc.addPage();
      doc.text("Reporting compliance by district", 10, 10);
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const date = new Date().toISOString().split("T")[0];
    doc.save(`report_by_district_${date}.pdf`);
  };

  const exportToExcel = () => {
    const districtData = getDistrictData();
    const grandTotalAssigned = districtData.reduce((sum, item) => sum + (item.teams_assigned_per_day[dayLabels[0]] || 0), 0);
    const grandTotalPerDay = Object.fromEntries(
      dayLabels.map((day) => [day, districtData.reduce((sum, item) => sum + (item.teams_per_day[day] || 0), 0)])
    );
    exportToExcel(districtData, dayLabels, grandTotalAssigned, grandTotalPerDay);
  };

  const getLegendTooltip = (rule) =>
    `${rule.range}: ${
      rule.color === "Green"
        ? "Full compliance — all reports received ✅"
        : rule.color === "Light Green"
        ? "Near full compliance — acceptable"
        : rule.color === "Yellow"
        ? "Needs improvement"
        : rule.color === "Light Yellow"
        ? "Significant gaps — follow-up needed"
        : rule.color === "Red"
        ? "Critical — urgent action required"
        : "Data error — likely over-reporting"
    }`;

  const getPercentTooltip = (participated, assigned) =>
    assigned > 0 ? `((${participated} / ${assigned}) * 100)%` : "(No data)";

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reporting compliance by district</h3>
      </div>
      <div className="flex justify-end mb-4 space-x-2">
        <button onClick={exportToPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          Export to PDF
        </button>
        <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
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
      <div ref={tableRef}>
        <table className="min-w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-1 px-2 border border-gray-300">State</th>
              <th className="py-1 px-2 border border-gray-300">Region</th>
              <th className="py-1 px-2 border border-gray-300">District</th>
              <th className="py-1 px-2 border border-gray-300">Number of Teams</th>
              {dayLabels.map((day) => (
                <React.Fragment key={day}>
                  <th className="py-1 px-2 border border-gray-300">{day}</th>
                  <th className="py-1 px-2 border border-gray-300" title={`(participated / assigned) * 100%`}>% of reported {day}</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedData).map((group, groupIdx) =>
              group.districts.map((item, idx) => (
                <tr
                  key={`${item.state}-${item.region}-${item.district}-${idx}`}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {idx === 0 ? (
                    <>
                      <td className="py-1 px-2 border border-gray-300" rowSpan={group.districts.length}>
                        {item.state}
                      </td>
                      <td className="py-1 px-2 border border-gray-300" rowSpan={group.districts.length}>
                        {item.region}
                      </td>
                    </>
                  ) : null}
                  <td className="py-1 px-2 border border-gray-300">{item.district}</td>
                  <td className="py-1 px-2 border border-gray-300">
                    {item.teams_assigned_per_day[dayLabels[0]] || 0}
                  </td>
                  {dayLabels.map((day) => {
                    const participated = item.teams_per_day[day] || 0;
                    const assigned = item.teams_assigned_per_day[dayLabels[0]] || 0;
                    const percent = assigned > 0 ? ((participated / assigned) * 100).toFixed(1) : "0";
                    const colorClass = getColorClass(parseFloat(percent) || 0);
                    return (
                      <React.Fragment key={`${day}-${idx}`}>
                        <td className="py-1 px-2 border border-gray-300">{participated}</td>
                        <td
                          className={`py-1 px-2 border border-gray-300 ${colorClass}`}
                          title={getPercentTooltip(participated, assigned)}
                        >
                          {`${percent}%`}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              )).concat(
                <tr key={`${group.state}-${group.region}-total`} className="bg-gray-100 font-semibold">
                  <td className="py-1 px-2 border border-gray-300" colSpan={2}>
                    {`${group.region} Total`}
                  </td>
                  <td className="py-1 px-2 border border-gray-300" />
                  <td className="py-1 px-2 border border-gray-300">
                    {group.districts.reduce((sum, d) => sum + (d.teams_assigned_per_day[dayLabels[0]] || 0), 0)}
                  </td>
                  {dayLabels.map((day) => {
                    const participated = group.districts.reduce((sum, d) => sum + (d.teams_per_day[day] || 0), 0);
                    const totalTeams = group.districts.reduce((sum, d) => sum + (d.teams_assigned_per_day[dayLabels[0]] || 0), 0);
                    const percent = totalTeams > 0 ? ((participated / totalTeams) * 100).toFixed(1) : "0";
                    const colorClass = getColorClass(parseFloat(percent) || 0);
                    return (
                      <React.Fragment key={day}>
                        <td className="py-1 px-2 border border-gray-300">{participated}</td>
                        <td
                          className={`py-1 px-2 border border-gray-300 ${colorClass}`}
                          title={getPercentTooltip(participated, totalTeams)}
                        >
                          {`${percent}%`}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportByDistrict;