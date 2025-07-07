import React, { useState } from "react";
import { useSelector } from "react-redux";
import { legendRules } from "./legendConfig";

function ReportByRegion({ onBack }) {
  const { dfaData } = useSelector((state) => state.coverageReport);
  const [showPopup, setShowPopup] = useState(false);

  // Get unique campaign days and assign "Day 1", "Day 2", ...
  const campaignDays = Array.from(
    new Set(dfaData.map((item) => item.compain_day))
  ).sort();
  const dayLabels = campaignDays.map((_, idx) => `Day ${idx + 1}`);

  // Helper to map compain_day to Day N
  const dayMap = {};
  campaignDays.forEach((date, idx) => {
    dayMap[date] = `Day ${idx + 1}`;
  });

  // Aggregate by region and campaign day
  const getRegionData = () => {
    const regionMap = {};
    dfaData.forEach((item) => {
      const key = `${item.state}|${item.region}`;
      if (!regionMap[key]) {
        regionMap[key] = {
          state: item.state,
          region: item.region,
          teams_per_day: {},
          teams_assigned_per_day: {},
        };
      }
      const dayLabel = dayMap[item.compain_day];
      const participated = Number(item.no_of_team_participated) || 0;
      const assigned = Number(item.no_of_team_assigned) || 0;
      regionMap[key].teams_per_day[dayLabel] =
        (regionMap[key].teams_per_day[dayLabel] || 0) + participated;
      regionMap[key].teams_assigned_per_day[dayLabel] =
        (regionMap[key].teams_assigned_per_day[dayLabel] || 0) + assigned;
    });
    return Object.values(regionMap);
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
  const grandTotalPerDay = {};
  dayLabels.forEach((day) => {
    grandTotalPerDay[day] = regionData.reduce(
      (sum, item) => sum + (item.teams_per_day[day] || 0),
      0
    );
  });

  // Legend tooltip content
  const getLegendTooltip = (rule) => `${rule.range}: ${rule.color === "Green" ? "Full compliance — all reports received ✅" : 
    rule.color === "Light Green" ? "Near full compliance — acceptable" : 
    rule.color === "Yellow" ? "Needs improvement" : 
    rule.color === "Amber Tint" ? "Significant gaps — attention needed" : 
    rule.color === "Red" ? "Critical — urgent action required" : 
    "Data error — likely over-reporting"}`;

  return (
    <div className="bg-white p-4 rounded-lg shadow max-w-2xl mx-auto relative">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900 text-center w-full">Reporting compliance by region</h3>
        {onBack && (
          <button
            className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm"
            onClick={onBack}
          >
            Back
          </button>
        )}
      </div>
      {/* Legend Row with Clickable Colors */}
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
      {/* Popup for Legend Details */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4 relative">
            <button
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-gray-600"
              onClick={() => setShowPopup(false)}
            >
              ✖
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
      <table className="min-w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-0.5 px-2 border border-gray-300">State</th>
            <th className="py-0.5 px-2 border border-gray-300">Region</th>
            <th className="py-0.5 px-2 border border-gray-300">Number of Teams</th>
            {dayLabels.map((day) => (
              <React.Fragment key={day}>
                <th className="py-0.5 px-2 border border-gray-300">{day}</th>
                <th className="py-0.5 px-2 border border-gray-300">% of reported {day}</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {regionData.map((item, idx) => (
            <tr key={item.state + item.region + idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
                    <td className={`py-0.5 px-2 border border-gray-300 ${colorClass} rounded`}>{`${percent}%`}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
          <tr className="bg-gray-100 font-semibold">
            <td className="py-0.5 px-2 border border-gray-300" colSpan="2">Grand Total</td>
            <td className="py-0.5 px-2 border border-gray-300">{grandTotalAssigned}</td>
            {dayLabels.map((day) => {
              const participated = grandTotalPerDay[day] || 0;
              const percent = grandTotalAssigned > 0 ? ((participated / grandTotalAssigned) * 100).toFixed(1) : "0";
              const colorClass = getColorClass(parseFloat(percent) || 0);
              return (
                <React.Fragment key={day}>
                  <td className="py-0.5 px-2 border border-gray-300">{participated}</td>
                  <td className={`py-0.5 px-2 border border-gray-300 ${colorClass} rounded`}>{`${percent}%`}</td>
                </React.Fragment>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ReportByRegion;