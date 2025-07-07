import React, { useState } from "react";
import { useSelector } from "react-redux";
import { legendRules } from "./legendConfig";

function ReportByDistrict({ onBack }) {
  const { dfaData } = useSelector((state) => state.coverageReport);
  const [showPopup, setShowPopup] = useState(false);

  if (!dfaData || dfaData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">
        No data available
      </div>
    );
  }

  const campaignDays = Array.from(new Set(dfaData.map((item) => item.compain_day))).sort();
  const dayLabels = campaignDays.map((_, idx) => `Day ${idx + 1}`);

  const dayMap = campaignDays.reduce((acc, date, idx) => {
    acc[date] = `Day ${idx + 1}`;
    return acc;
  }, {});

  const getDistrictData = () => {
    const districtMap = new Map();
    dfaData.forEach((item) => {
      const key = `${item.state}|${item.region}|${item.district}`;
      if (!districtMap.has(key)) {
        districtMap.set(key, {
          state: item.state,
          region: item.region,
          district: item.district,
          teams_per_day: {},
          teams_assigned_per_day: {},
        });
      }
      const dayLabel = dayMap[item.compain_day];
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
      groupedData[key] = {
        state: item.state,
        region: item.region,
        districts: [],
      };
    }
    groupedData[key].districts.push(item);
  });

  const getLegendTooltip = (rule) => `${rule.range}: ${rule.color === "Green" ? "Full compliance — all reports received ✅" : 
    rule.color === "Light Green" ? "Near full compliance — acceptable" : 
    rule.color === "Yellow" ? "Needs improvement" : 
    rule.color === "Light Yellow" ? "Significant gaps — follow-up needed" : 
    rule.color === "Red" ? "Critical — urgent action required" : 
    "Data error — likely over-reporting"}`;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reporting compliance by district</h3>
        {onBack && (
          <button
            className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300"
            onClick={onBack}
            aria-label="Back to reports"
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
            <th className="py-1 px-2 border border-gray-300">State</th>
            <th className="py-1 px-2 border border-gray-300">Region</th>
            <th className="py-1 px-2 border border-gray-300">District</th>
            <th className="py-1 px-2 border border-gray-300">Number of Teams</th>
            {dayLabels.map((day) => (
              <React.Fragment key={day}>
                <th className="py-1 px-2 border border-gray-300">{day}</th>
                <th className="py-1 px-2 border border-gray-300">% of reported {day}</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedData).map((group, groupIdx) => [
            ...group.districts.map((item, idx) => (
              <tr
                key={`${item.state}-${item.region}-${item.district}-${idx}`}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {idx === 0 ? (
                  <>
                    <td
                      className="py-1 px-2 border border-gray-300"
                      rowSpan={group.districts.length}
                    >
                      {item.state}
                    </td>
                    <td
                      className="py-1 px-2 border border-gray-300"
                      rowSpan={group.districts.length}
                    >
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
                  const percent = assigned > 0
                    ? ((participated / assigned) * 100).toFixed(1)
                    : "0";
                  const colorClass = getColorClass(parseFloat(percent) || 0);
                  return (
                    <React.Fragment key={`${day}-${idx}`}>
                      <td className="py-1 px-2 border border-gray-300">{participated}</td>
                      <td className={`py-1 px-2 border border-gray-300 ${colorClass}`}>
                        {`${percent}%`}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            )),
            <tr
              key={`${group.state}-${group.region}-total`}
              className="bg-gray-100 font-semibold"
            >
              <td className="py-1 px-2 border border-gray-300" colSpan="2">
                {`${group.region} Total`}
              </td>
              <td className="py-1 px-2 border border-gray-300"></td>
              <td className="py-1 px-2 border border-gray-300">
                {group.districts.reduce(
                  (sum, d) => sum + (d.teams_assigned_per_day[dayLabels[0]] || 0),
                  0
                )}
              </td>
              {dayLabels.map((day) => {
                const participated = group.districts.reduce(
                  (sum, d) => sum + (d.teams_per_day[day] || 0),
                  0
                );
                const totalTeams = group.districts.reduce(
                  (sum, d) => sum + (d.teams_assigned_per_day[dayLabels[0]] || 0),
                  0
                );
                const percent = totalTeams > 0
                  ? ((participated / totalTeams) * 100).toFixed(1)
                  : "0";
                const colorClass = getColorClass(parseFloat(percent) || 0);
                return (
                  <React.Fragment key={day}>
                    <td className="py-1 px-2 border border-gray-300">{participated}</td>
                    <td className={`py-1 px-2 border border-gray-300 ${colorClass}`}>
                      {`${percent}%`}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>,
          ])}
        </tbody>
      </table>
    </div>
  );
}

export default ReportByDistrict;