import React from "react";
import { useSelector } from "react-redux";

function RegionalSummaryTable({ dataSlice }) {
  const reduxDfaData = useSelector((state) => state.coverageReport.dfaData);
  const dfaData = dataSlice || reduxDfaData;

  // Aggregate by region
  const regionMap = {};
  dfaData.forEach((item) => {
    const key = `${item.state}|${item.region}`;
    if (!regionMap[key]) {
      regionMap[key] = {
        state: item.state,
        region: item.region,
        vac_0_11_repeat: 0,
        vac_12_59_repeat: 0,
        zero_0_11: 0,
        zero_12_59: 0,
        opv_usedemp: 0,
        revisited_not_available: 0,
        revisited_refusals: 0,
        total_vac_0_11: 0,
        total_vac_12_59: 0,
        total_zero_doses: 0,
        total_vaccinated: 0,
      };
    }
    regionMap[key].vac_0_11_repeat += Number(item.vacinated_0_11_multiple_occurence) || 0;
    regionMap[key].vac_12_59_repeat += Number(item.vacinated_12_59_multiple_occurence) || 0;
    regionMap[key].zero_0_11 += Number(item.vacinated_0_11_zero_occurence) || 0;
    regionMap[key].zero_12_59 += Number(item.vacinated_12_59_zero_occurence) || 0;
    regionMap[key].opv_usedemp += Number(item.opv_usedemp_total) || 0;
    regionMap[key].revisited_not_available += Number(item.revisited_unvaccinated_not_available) || 0;
    regionMap[key].revisited_refusals += Number(item.revisited_unvaccinated_refusals) || 0;
    regionMap[key].total_vac_0_11 +=
      (Number(item.vacinated_0_11_zero_occurence) || 0) +
      (Number(item.vacinated_0_11_multiple_occurence) || 0);
    regionMap[key].total_vac_12_59 +=
      (Number(item.vacinated_12_59_zero_occurence) || 0) +
      (Number(item.vacinated_12_59_multiple_occurence) || 0);
    regionMap[key].total_zero_doses +=
      (Number(item.vacinated_0_11_zero_occurence) || 0) +
      (Number(item.vacinated_12_59_zero_occurence) || 0);
    regionMap[key].total_vaccinated +=
      (Number(item.vacinated_0_11_zero_occurence) || 0) +
      (Number(item.vacinated_0_11_multiple_occurence) || 0) +
      (Number(item.vacinated_12_59_zero_occurence) || 0) +
      (Number(item.vacinated_12_59_multiple_occurence) || 0);
  });

  // Group regions by state
  const stateMap = {};
  Object.values(regionMap).forEach((region) => {
    if (!stateMap[region.state]) stateMap[region.state] = [];
    stateMap[region.state].push(region);
  });

  // Helper to calculate totals for a state
  const calcStateTotals = (regions) => {
    return regions.reduce(
      (totals, region) => {
        Object.keys(totals).forEach((key) => {
          if (key !== "state") totals[key] += region[key] || 0;
        });
        return totals;
      },
      {
        state: "Total",
        vac_0_11_repeat: 0,
        vac_12_59_repeat: 0,
        zero_0_11: 0,
        zero_12_59: 0,
        opv_usedemp: 0,
        revisited_not_available: 0,
        revisited_refusals: 0,
        total_vac_0_11: 0,
        total_vac_12_59: 0,
        total_zero_doses: 0,
        total_vaccinated: 0,
      }
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6 max-w-full overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4 text-blue-700">Regional Vaccination Summary</h3>
      <table className="min-w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border border-gray-300">State</th>
            <th className="py-2 px-4 border border-gray-300">Region</th>
            <th className="py-2 px-4 border border-gray-300">0-11 Repeat Vaccinated</th>
            <th className="py-2 px-4 border border-gray-300">12-59 Repeat Vaccinated</th>
            <th className="py-2 px-4 border border-gray-300">0-11 Zero Doses</th>
            <th className="py-2 px-4 border border-gray-300">12-59 Zero Doses</th>
            <th className="py-2 px-4 border border-gray-300">OPV Used/Emptied</th>
            <th className="py-2 px-4 border border-gray-300">Revisited Not Available</th>
            <th className="py-2 px-4 border border-gray-300">Revisited Refusals</th>
            <th className="py-2 px-4 border border-gray-300">0-11 Total Vaccinated</th>
            <th className="py-2 px-4 border border-gray-300">12-59 Total Vaccinated</th>
            <th className="py-2 px-4 border border-gray-300">Total Zero Doses</th>
            <th className="py-2 px-4 border border-gray-300">Total Vaccinated</th>
          </tr>
        </thead>
        
<tbody>
  {Object.entries(stateMap).map(([state, regions]) => (
    <React.Fragment key={state}>
      {regions.map((region, idx) => (
        <tr key={region.state + region.region}>
          {idx === 0 && (
            <td
              className="py-6 px-4 border border-gray-300 align-middle"
              rowSpan={regions.length + 1} // +1 for the total row
            >
              {region.state}
            </td>
          )}
          <td className="py-2 px-4 border border-gray-300">{region.region}</td>
          <td className="py-2 px-4 border border-gray-300">{region.vac_0_11_repeat}</td>
          <td className="py-2 px-4 border border-gray-300">{region.vac_12_59_repeat}</td>
          <td className="py-2 px-4 border border-gray-300">{region.zero_0_11}</td>
          <td className="py-2 px-4 border border-gray-300">{region.zero_12_59}</td>
          <td className="py-2 px-4 border border-gray-300">{region.opv_usedemp}</td>
          <td className="py-2 px-4 border border-gray-300">{region.revisited_not_available}</td>
          <td className="py-2 px-4 border border-gray-300">{region.revisited_refusals}</td>
          <td className="py-2 px-4 border border-gray-300">{region.total_vac_0_11}</td>
          <td className="py-2 px-4 border border-gray-300">{region.total_vac_12_59}</td>
          <td className="py-2 px-4 border border-gray-300">{region.total_zero_doses}</td>
          <td className="py-2 px-4 border border-gray-300">{region.total_vaccinated}</td>
        </tr>
      ))}
      {/* State total row */}
      <tr key={state + "-total"} className="bg-gray-100 font-bold">
        {/* No <td> for state here, since it's merged above */}
        <td className="py-2 px-4 border border-gray-300">Total</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).vac_0_11_repeat}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).vac_12_59_repeat}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).zero_0_11}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).zero_12_59}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).opv_usedemp}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).revisited_not_available}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).revisited_refusals}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).total_vac_0_11}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).total_vac_12_59}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).total_zero_doses}</td>
        <td className="py-2 px-4 border border-gray-300">{calcStateTotals(regions).total_vaccinated}</td>
      </tr>
    </React.Fragment>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default RegionalSummaryTable;