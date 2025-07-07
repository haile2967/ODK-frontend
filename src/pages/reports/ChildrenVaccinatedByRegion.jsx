import React from "react";
import { useSelector } from "react-redux";

function ChildrenVaccinatedByRegion() {
  const { dfaData } = useSelector((state) => state.coverageReport);

  // Get unique campaign days, sorted
  const campaignDays = Array.from(
    new Set(dfaData.map((item) => item.compain_day))
  ).sort();

  // Aggregate data: {state, region} => {day_1: {0_11: sum, 12_59: sum}, ...}
  const regionMap = {};
  dfaData.forEach((item) => {
    const key = `${item.state}|${item.region}`;
    if (!regionMap[key]) {
      regionMap[key] = {
        state: item.state,
        region: item.region,
        days: {},
      };
    }
    const dayIdx = campaignDays.indexOf(item.compain_day) + 1;
    const dayLabel = `day_${dayIdx}`;
    if (!regionMap[key].days[dayLabel]) {
      regionMap[key].days[dayLabel] = { "0_11": 0, "12_59": 0 };
    }
    regionMap[key].days[dayLabel]["0_11"] += Number(item.vacinated_0_11_zero_occurence || 0) + Number(item.vacinated_0_11_multiple_occurence || 0);
    regionMap[key].days[dayLabel]["12_59"] += Number(item.vacinated_12_59_zero_occurence || 0) + Number(item.vacinated_12_59_multiple_occurence || 0);
  });

  // Prepare table columns
  const dayAgeColumns = [];
  campaignDays.forEach((_, idx) => {
    const dayLabel = `day_${idx + 1}`;
    dayAgeColumns.push({ day: dayLabel, age: "0_11" });
  });
  campaignDays.forEach((_, idx) => {
    const dayLabel = `day_${idx + 1}`;
    dayAgeColumns.push({ day: dayLabel, age: "12_59" });
  });

  // Grand totals
  const grandTotals = {};
  dayAgeColumns.forEach(({ day, age }) => {
    grandTotals[`${day}_${age}`] = 0;
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow max-w-5xl mx-auto mt-6">
      <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
        Number of Children Vaccinated by Campaign Day per Region
      </h3>
      <table className="min-w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border border-gray-300">Submissions.state</th>
            <th className="py-2 px-4 border border-gray-300">Submissions.region</th>
            {campaignDays.map((_, idx) => (
              <th key={`d1-${idx}`} className="py-2 px-4 border border-gray-300">{`day_${idx + 1} (0-11)`}</th>
            ))}
            {campaignDays.map((_, idx) => (
              <th key={`d2-${idx}`} className="py-2 px-4 border border-gray-300">{`day_${idx + 1} (12-59)`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.values(regionMap).map((row) => (
            <tr key={row.state + row.region}>
              <td className="py-2 px-4 border border-gray-300">{row.state}</td>
              <td className="py-2 px-4 border border-gray-300">{row.region}</td>
              {campaignDays.map((_, idx) => {
                const dayLabel = `day_${idx + 1}`;
                const val = row.days[dayLabel]?.["0_11"] || 0;
                grandTotals[`${dayLabel}_0_11`] += val;
                return (
                  <td key={dayLabel + "_0_11"} className="py-2 px-4 border border-gray-300">{val}</td>
                );
              })}
              {campaignDays.map((_, idx) => {
                const dayLabel = `day_${idx + 1}`;
                const val = row.days[dayLabel]?.["12_59"] || 0;
                grandTotals[`${dayLabel}_12_59`] += val;
                return (
                  <td key={dayLabel + "_12_59"} className="py-2 px-4 border border-gray-300">{val}</td>
                );
              })}
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="py-2 px-4 border border-gray-300" colSpan={2}>Grand Total</td>
            {dayAgeColumns.map(({ day, age }) => (
              <td key={`total_${day}_${age}`} className="py-2 px-4 border border-gray-300">
                {grandTotals[`${day}_${age}`]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ChildrenVaccinatedByRegion;