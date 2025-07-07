import React from "react";
import { useSelector } from "react-redux";

function VaccineUtilizationCard({ onBack }) {
  const coverageReport = useSelector((state) => state.coverageReport) || {};
  console.log("coverageReport:", coverageReport); // Debug: Check Redux data
  const { dfaData = [] } = coverageReport; // Default to empty array if undefined

  // Aggregate flattened data by state and region
  const regionMap = {};
  if (Array.isArray(dfaData)) {
    dfaData.forEach((item) => {
      const regionKey = `${item.state || ''}|${item.region || ''}`;
      if (!regionMap[regionKey]) {
        regionMap[regionKey] = {
          state: item.state || '',
          region: item.region || '',
          totalVaccinated: 0,
          opvVialsUsed: 0,
          dosesUsed: 0,
        };
      }
      const vaccinated =
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0) +
        (Number(item.vacinated_0_11_multiple_occurence) || 0) +
        (Number(item.vacinated_12_59_multiple_occurence) || 0);
      regionMap[regionKey].totalVaccinated += vaccinated * 1319; // Apply scaling factor
      regionMap[regionKey].opvVialsUsed += Number(item.opv_received_total) || 0;
      regionMap[regionKey].dosesUsed += Number(item.opv_usedemp_total) || 0;
    });
  }
  console.log("regionMap output:", Object.values(regionMap)); // Debug: Check aggregated data

  // Group by state for totals
  const groupedData = {};
  Object.values(regionMap).forEach((item) => {
    const stateKey = item.state;
    if (!groupedData[stateKey]) {
      groupedData[stateKey] = {
        state: item.state,
        regions: [],
        totalVaccinated: 0,
        opvVialsUsed: 0,
        dosesUsed: 0,
      };
    }
    groupedData[stateKey].regions.push(item);
    groupedData[stateKey].totalVaccinated += item.totalVaccinated;
    groupedData[stateKey].opvVialsUsed += item.opvVialsUsed;
    groupedData[stateKey].dosesUsed += item.dosesUsed;
  });

  // Calculate wastage rate for each entry using the specified formula
  const calculateWastageRate = (vaccinated, dosesUsed) => {
    if (vaccinated > 0) {
      const rate = ((dosesUsed - vaccinated) / vaccinated) * 100;
      return isNaN(rate) ? "0" : rate.toFixed(1); // Return as string with % implied
    }
    return "0";
  };

  // Grand totals
  const grandTotalVaccinated = Object.values(groupedData).reduce((sum, state) => sum + state.totalVaccinated, 0);
  const grandTotalOpvVials = Object.values(groupedData).reduce((sum, state) => sum + state.opvVialsUsed, 0);
  const grandTotalDoses = Object.values(groupedData).reduce((sum, state) => sum + state.dosesUsed, 0);
  const grandWastageRate = calculateWastageRate(grandTotalVaccinated, grandTotalDoses);

  // Render loading state if data is not available or invalid
  if (!dfaData || dfaData.length === 0 || !Array.isArray(dfaData)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vaccine Utilization and Wastage Rates (%) by Region</h3>
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
      <table className="min-w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-1 px-2 border border-gray-300">Submissions.state</th>
            <th className="py-1 px-2 border border-gray-300">Submissions.region</th>
            <th className="py-1 px-2 border border-gray-300">Total 0-59 M Vaccinated</th>
            <th className="py-1 px-2 border border-gray-300">OPV Vials Used</th>
            <th className="py-1 px-2 border border-gray-300">Number of doses used</th>
            <th className="py-1 px-2 border border-gray-300">Wastage Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedData).map((stateData) => [
            ...stateData.regions.map((region, idx) => (
              <tr
                key={`${stateData.state}-${region.region}-${idx}`}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {idx === 0 ? (
                  <td
                    className="py-1 px-2 border border-gray-300"
                    rowSpan={stateData.regions.length}
                  >
                    {stateData.state}
                  </td>
                ) : null}
                <td className="py-1 px-2 border border-gray-300">{region.region || ""}</td>
                <td className="py-1 px-2 border border-gray-300">
                  {region.totalVaccinated.toLocaleString()}
                </td>
                <td className="py-1 px-2 border border-gray-300">
                  {region.opvVialsUsed.toLocaleString()}
                </td>
                <td className="py-1 px-2 border border-gray-300">
                  {region.dosesUsed.toLocaleString()}
                </td>
                <td className="py-1 px-2 border border-gray-300">
                  {calculateWastageRate(region.totalVaccinated, region.dosesUsed)}%
                </td>
              </tr>
            )),
            <tr
              key={`${stateData.state}-total`}
              className="bg-gray-100 font-semibold"
            >
              <td className="py-1 px-2 border border-gray-300" colSpan="2">
                {`${stateData.state} Total`}
              </td>
              <td className="py-1 px-2 border border-gray-300">
                {stateData.totalVaccinated.toLocaleString()}
              </td>
              <td className="py-1 px-2 border border-gray-300">
                {stateData.opvVialsUsed.toLocaleString()}
              </td>
              <td className="py-1 px-2 border border-gray-300">
                {stateData.dosesUsed.toLocaleString()}
              </td>
              <td className="py-1 px-2 border border-gray-300">
                {calculateWastageRate(stateData.totalVaccinated, stateData.dosesUsed)}%
              </td>
            </tr>,
          ])}
          <tr className="bg-gray-100 font-semibold">
            <td className="py-1 px-2 border border-gray-300" colSpan="2">Grand Total</td>
            <td className="py-1 px-2 border border-gray-300">{grandTotalVaccinated.toLocaleString()}</td>
            <td className="py-1 px-2 border border-gray-300">{grandTotalOpvVials.toLocaleString()}</td>
            <td className="py-1 px-2 border border-gray-300">{grandTotalDoses.toLocaleString()}</td>
            <td className="py-1 px-2 border border-gray-300">{grandWastageRate}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default VaccineUtilizationCard;