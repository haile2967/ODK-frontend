import React from "react";
import { useSelector } from "react-redux";

function DistrictZeroDosesCard({ onBack }) {
  const coverageReport = useSelector((state) => state.coverageReport) || {};
  console.log("coverageReport:", coverageReport); // Debug: Check Redux data
  const { dfaData = [] } = coverageReport;

  // Aggregate data by state, region, and district
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
          totalVaccinated: 0,
          zeroDosesTotal: 0,
          zeroDoses0_11: 0,
          dosesUsed: 0,
          opvVialsUsed: 0,
          dosesPerVial: 0,
        };
      }
      if (!regionMap[regionKey].districts[districtKey]) {
        regionMap[regionKey].districts[districtKey] = {
          district: item.district || '',
          dfa_cod: item.dfa_cod || '',
          totalVaccinated: 0,
          zeroDosesTotal: 0,
          zeroDoses0_11: 0,
          dosesUsed: 0,
          opvVialsUsed: 0,
          dosesPerVial: 0,
        };
      }
      const vaccinated =
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0) +
        (Number(item.vacinated_0_11_multiple_occurence) || 0) +
        (Number(item.vacinated_12_59_multiple_occurence) || 0);
      const itemDosesPerVial = Number(item.doses_per_vial) || 20; // Fallback to 20 if undefined
      const dosesUsed = Number(item.opv_usedemp_total) || 0;
      regionMap[regionKey].districts[districtKey].totalVaccinated += vaccinated;
      regionMap[regionKey].districts[districtKey].zeroDosesTotal +=
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0);
      regionMap[regionKey].districts[districtKey].zeroDoses0_11 += Number(item.vacinated_0_11_zero_occurence) || 0;
      regionMap[regionKey].districts[districtKey].dosesUsed += dosesUsed;
      regionMap[regionKey].districts[districtKey].opvVialsUsed += Number(item.opv_received_total) || 0;
      regionMap[regionKey].districts[districtKey].dosesPerVial = itemDosesPerVial;
      // Update region totals
      regionMap[regionKey].totalVaccinated += vaccinated;
      regionMap[regionKey].zeroDosesTotal +=
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0);
      regionMap[regionKey].zeroDoses0_11 += Number(item.vacinated_0_11_zero_occurence) || 0;
      regionMap[regionKey].dosesUsed += dosesUsed;
      regionMap[regionKey].opvVialsUsed += Number(item.opv_received_total) || 0;
      regionMap[regionKey].dosesPerVial = itemDosesPerVial;
      // Warn on data inconsistency
      if (dosesUsed > 0 && vaccinated === 0) {
        console.warn(`Data inconsistency in ${item.district}: ${dosesUsed} doses used but 0 vaccinations`);
      }
    });
    return Object.values(regionMap).map((region) => ({
      ...region,
      districts: Object.values(region.districts),
    }));
  };

  // Calculate wastage rate using dosesPerVial from aggregated data
  const calculateWastageRate = (vaccinated, opvVialsUsed, dosesPerVial, district, region) => {
    if (opvVialsUsed > 0 && dosesPerVial > 0) {
      const potentialDoses = opvVialsUsed * dosesPerVial;
      const rate = (1 - vaccinated / potentialDoses) * 100;
      if (rate === 100) {
        console.warn(`100% wastage rate in ${district?.district || region?.region}: vaccinated=${vaccinated}, vials=${opvVialsUsed}, dosesUsed=${district?.dosesUsed || region?.dosesUsed}`);
      }
      return isNaN(rate) ? 0 : rate.toFixed(1);
    }
    return 0;
  };

  // Calculate zero dose percentage
  const calculateZeroDosePercent = (zeroOccurrences, totalVaccinated) => {
    if (totalVaccinated > 0) {
      const percent = (zeroOccurrences / totalVaccinated) * 100;
      return isNaN(percent) ? 0 : percent.toFixed(1);
    }
    return 0;
  };

  // Render loading state if data is not available or invalid
  if (!dfaData || dfaData.length === 0 || !Array.isArray(dfaData)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Loading data...</p>
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
        <h3 className="text-lg font-semibold text-gray-900">Zero Doses and Wastage Rates by District</h3>
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
      <table className="min-w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-1 px-2 border border-gray-300">State</th>
            <th className="py-1 px-2 border border-gray-300">Region</th>
            <th className="py-1 px-2 border border-gray-300">District</th>
            <th className="py-1 px-2 border border-gray-300">Sum of % of Zero Doses Total</th>
            <th className="py-1 px-2 border border-gray-300">% of Zero Doses 0-11 Months</th>
            <th className="py-1 px-2 border border-gray-300">Number of Doses Used</th>
            <th className="py-1 px-2 border border-gray-300">Wastage Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          {regionData.map((region) => [
            ...region.districts.map((district, distIdx, arr) => (
              <tr
                key={`${region.state}-${region.region}-${district.district}-${distIdx}`}
                className={`bg-white ${calculateWastageRate(district.totalVaccinated, district.opvVialsUsed, district.dosesPerVial, district, region) >= 90 ? 'bg-red-100' : ''}`}
              >
                {distIdx === 0 ? (
                  <td
                    className="py-1 px-2 border border-gray-300"
                    rowSpan={arr.length + 1}
                  >
                    {region.state}
                  </td>
                ) : null}
                {distIdx === 0 ? (
                  <td
                    className="py-1 px-2 border border-gray-300"
                    rowSpan={arr.length + 1}
                  >
                    {region.region}
                  </td>
                ) : null}
                <td className="py-1 px-2 border border-gray-300">{district.district}</td>
                <td className="py-1 px-2 border border-gray-300">
                  {calculateZeroDosePercent(district.zeroDosesTotal, district.totalVaccinated)}%
                </td>
                <td className="py-1 px-2 border border-gray-300">
                  {calculateZeroDosePercent(district.zeroDoses0_11, district.totalVaccinated)}%
                </td>
                <td className="py-1 px-2 border border-gray-300">{district.dosesUsed.toLocaleString()}</td>
                <td className="py-1 px-2 border border-gray-300">
                  {calculateWastageRate(district.totalVaccinated, district.opvVialsUsed, district.dosesPerVial, district, region)}%
                </td>
              </tr>
            )),
            <tr
              key={`${region.state}-${region.region}-total`}
              className={`bg-gray-100 font-semibold ${calculateWastageRate(region.totalVaccinated, region.opvVialsUsed, region.dosesPerVial, null, region) >= 90 ? 'bg-red-100' : ''}`}
            >
              <td className="py-1 px-2 border border-gray-300">Total</td>
              <td className="py-1 px-2 border border-gray-300">
                {calculateZeroDosePercent(region.zeroDosesTotal, region.totalVaccinated)}%
              </td>
              <td className="py-1 px-2 border border-gray-300">
                {calculateZeroDosePercent(region.zeroDoses0_11, region.totalVaccinated)}%
              </td>
              <td className="py-1 px-2 border border-gray-300">{region.dosesUsed.toLocaleString()}</td>
              <td className="py-1 px-2 border border-gray-300">
                {calculateWastageRate(region.totalVaccinated, region.opvVialsUsed, region.dosesPerVial, null, region)}%
              </td>
            </tr>,
          ])}
        </tbody>
      </table>
    </div>
  );
}

export default DistrictZeroDosesCard;