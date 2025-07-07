import React, { useState } from "react";
import { useSelector } from "react-redux";
import { legendRules2 } from "./legendConfig.jsx";

function WastageRatesCard({ onBack }) {
  const coverageReport = useSelector((state) => state.coverageReport) || {};
  console.log("coverageReport:", coverageReport); // Debug: Check Redux data
  const { dfaData = [], dosesPerVial = 20 } = coverageReport; // Fallback to 20 if dosesPerVial is undefined
  const [selectedTable, setSelectedTable] = useState("wastage");
  const [showPopup, setShowPopup] = useState(false);

  // Aggregate flattened data by state, region, and district
  const getRegionData = () => {
    const regionMap = {};
    if (!Array.isArray(dfaData)) return [];
    dfaData.forEach((item) => {
      const regionKey = `${item.state || ''}|${item.region || ''}`;
      const districtKey = `${item.dfa_cod || ''}`;
      if (!regionMap[regionKey]) {
        regionMap[regionKey] = {
          state: item.state || '',
          region: item.region || '',
          districts: {},
        };
      }
      if (!regionMap[regionKey].districts[districtKey]) {
        regionMap[regionKey].districts[districtKey] = {
          district: item.district || '',
          dfa_cod: item.dfa_cod || '',
          totalVaccinated: 0,
          opvVialsUsed: 0,
          dosesUsed: 0,
          zeroOccurrences: 0,
        };
      }
      const vaccinated =
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0) +
        (Number(item.vacinated_0_11_multiple_occurence) || 0) +
        (Number(item.vacinated_12_59_multiple_occurence) || 0);
      regionMap[regionKey].districts[districtKey].totalVaccinated += vaccinated;
      regionMap[regionKey].districts[districtKey].opvVialsUsed += Number(item.opv_received_total) || 0;
      regionMap[regionKey].districts[districtKey].dosesUsed += Number(item.opv_usedemp_total) || 0;
      regionMap[regionKey].districts[districtKey].zeroOccurrences +=
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0);
    });
    return Object.values(regionMap).map((region) => ({
      ...region,
      totalVaccinated: Object.values(region.districts).reduce((sum, d) => sum + d.totalVaccinated, 0),
      opvVialsUsed: Object.values(region.districts).reduce((sum, d) => sum + d.opvVialsUsed, 0),
      dosesUsed: Object.values(region.districts).reduce((sum, d) => sum + d.dosesUsed, 0),
      zeroOccurrences: Object.values(region.districts).reduce((sum, d) => sum + d.zeroOccurrences, 0),
    }));
  };

  // Calculate wastage rate using dosesPerVial from Redux
  const calculateWastageRate = (vaccinated, opvVialsUsed) => {
    if (vaccinated > 0 && opvVialsUsed > 0 && dosesPerVial > 0) {
      const potentialDoses = opvVialsUsed * dosesPerVial;
      const rate = (1 - vaccinated / potentialDoses) * 100;
      return isNaN(rate) ? 0 : rate.toFixed(1);
    }
    return 0;
  };

  // Calculate overall wastage rate
  const calculateOverallWastageRate = () => {
    const totals = getRegionData().reduce(
      (acc, item) => ({
        totalVaccinated: acc.totalVaccinated + item.totalVaccinated,
        opvVialsUsed: acc.opvVialsUsed + item.opvVialsUsed,
      }),
      { totalVaccinated: 0, opvVialsUsed: 0 }
    );
    return calculateWastageRate(totals.totalVaccinated, totals.opvVialsUsed);
  };

  // Calculate percentage of zero doses
  const calculateZeroDosePercent = (zeroOccurrences, totalVaccinated) => {
    if (totalVaccinated > 0) {
      const percent = (zeroOccurrences / totalVaccinated) * 100;
      return isNaN(percent) ? 0 : percent.toFixed(1);
    }
    return 0;
  };

  // Calculate overall zero dose percentage
  const calculateOverallZeroDosePercent = () => {
    const totals = getRegionData().reduce(
      (acc, item) => ({
        zeroOccurrences: acc.zeroOccurrences + item.zeroOccurrences,
        totalVaccinated: acc.totalVaccinated + item.totalVaccinated,
      }),
      { zeroOccurrences: 0, totalVaccinated: 0 }
    );
    return calculateZeroDosePercent(totals.zeroOccurrences, totals.totalVaccinated);
  };

  // Determine class based on percentage
  const getClassByPercentage = (percentage) => {
    const numPercent = parseFloat(percentage) || 0;
    const rule = legendRules2.find((r) => numPercent >= r.min && numPercent <= r.max);
    return rule ? rule.className : "";
  };

  // Legend tooltip content
  const getLegendTooltip = (rule) => `${rule.range}: ${rule.color === "Purple" ? "Negative or zero wastage — potential over-utilization or data issue" : "Positive wastage — normal or excess usage"}`;

  // Define threshold for high zero doses
  const ZERO_DOSE_THRESHOLD = 50;

  // Render loading or error state
  if (!dfaData || dfaData.length === 0 || !Array.isArray(dfaData)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
        <p className="text-gray-600 mt-4">Loading data...</p>
      </div>
    );
  }

  const regionData = getRegionData();
  if (regionData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">No data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">DFAs with High Negative Wastage Rate and High Percentage of Zero Doses</h3>
        {onBack && (
          <button
            className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={onBack}
            aria-label="Back to reports"
          >
            Back
          </button>
        )}
      </div>

      {/* Styled Button Group */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Table:</label>
        <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Table selection">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
              selectedTable === "wastage"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTable("wastage")}
            aria-checked={selectedTable === "wastage"}
            role="radio"
          >
            Wastage Rate (%)
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
              selectedTable === "zeroDoses"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTable("zeroDoses")}
            aria-checked={selectedTable === "zeroDoses"}
            role="radio"
          >
            Zero Doses (%)
          </button>
        </div>
      </div>

      {/* Legend Row with Clickable Colors */}
      <div className="flex justify-start mb-4 space-x-2">
        {legendRules2.map((rule) => (
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
              {legendRules2.map((rule) => (
                <li key={rule.color} className="mb-2 text-xs text-black">
                  <span className={`inline-block w-4 h-4 ${rule.className} mr-2`}></span>
                  {getLegendTooltip(rule)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Conditional Table Rendering */}
      {selectedTable === "wastage" ? (
        <table className="min-w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-0.5 px-2 border border-gray-300">Submissions.state</th>
              <th className="py-0.5 px-2 border border-gray-300">Submissions.region</th>
              <th className="py-0.5 px-2 border border-gray-300">Submissions.district</th>
              <th className="py-0.5 px-2 border border-gray-300">Sum of Wastage Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {regionData.map((region) =>
              Object.values(region.districts).map((district, distIdx, arr) => {
                const wastageRate = calculateWastageRate(district.totalVaccinated, district.opvVialsUsed);
                const zeroPercent = calculateZeroDosePercent(district.zeroOccurrences, district.totalVaccinated);
                const highZeroDoses = parseFloat(zeroPercent) > ZERO_DOSE_THRESHOLD;
                if (wastageRate < 0 || highZeroDoses) {
                  return (
                    <tr
                      key={`${region.state}-${region.region}-${district.district}-${distIdx}`}
                      className={distIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {distIdx === 0 ? (
                        <td
                          className="py-0.5 px-2 border border-gray-300"
                          rowSpan={arr.length}
                        >
                          {region.state}
                        </td>
                      ) : null}
                      {distIdx === 0 ? (
                        <td
                          className="py-0.5 px-2 border border-gray-300"
                          rowSpan={arr.length}
                        >
                          {region.region}
                        </td>
                      ) : null}
                      <td className="py-0.5 px-2 border border-gray-300">{district.district}</td>
                      <td className={`py-0.5 px-2 border border-gray-300 ${getClassByPercentage(wastageRate)}`}>
                        {wastageRate}%
                      </td>
                    </tr>
                  );
                }
                return null;
              })
            ).filter(Boolean).concat(
              <tr key="overall-total" className="bg-gray-100 font-semibold">
                <td className="py-0.5 px-2 border border-gray-300" colSpan="3">Overall Total</td>
                <td className="py-0.5 px-2 border border-gray-300">
                  {calculateOverallWastageRate()}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-0.5 px-2 border border-gray-300">Submissions.state</th>
              <th className="py-0.5 px-2 border border-gray-300">Submissions.region</th>
              <th className="py-0.5 px-2 border border-gray-300">Submissions.district</th>
              <th className="py-0.5 px-2 border border-gray-300">Submissions.dfa_cod</th>
              <th className="py-0.5 px-2 border border-gray-300">Sum of % of Zero Doses Total</th>
            </tr>
          </thead>
          <tbody>
            {regionData.map((region) =>
              Object.values(region.districts).map((district, distIdx, arr) => {
                const zeroPercent = calculateZeroDosePercent(district.zeroOccurrences, district.totalVaccinated);
                if (parseFloat(zeroPercent) > 0) {
                  return (
                    <tr
                      key={`${region.state}-${region.region}-${district.district}-${distIdx}`}
                      className={distIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {distIdx === 0 ? (
                        <td
                          className="py-0.5 px-2 border border-gray-300"
                          rowSpan={arr.length}
                        >
                          {region.state}
                        </td>
                      ) : null}
                      {distIdx === 0 ? (
                        <td
                          className="py-0.5 px-2 border border-gray-300"
                          rowSpan={arr.length}
                        >
                          {region.region}
                        </td>
                      ) : null}
                      <td className="py-0.5 px-2 border border-gray-300">{district.district}</td>
                      <td className="py-0.5 px-2 border border-gray-300">{district.dfa_cod}</td>
                      <td className={`py-0.5 px-2 border border-gray-300 ${getClassByPercentage(zeroPercent)}`}>
                        {zeroPercent}%
                      </td>
                    </tr>
                  );
                }
                return null;
              })
            ).filter(Boolean).concat(
              <tr key="overall-total" className="bg-gray-100 font-semibold">
                <td className="py-0.5 px-2 border border-gray-300" colSpan="4">Overall Total</td>
                <td className="py-0.5 px-2 border border-gray-300">
                  {calculateOverallZeroDosePercent()}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default WastageRatesCard;