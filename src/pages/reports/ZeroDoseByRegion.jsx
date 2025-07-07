import React from "react";
import { useSelector } from "react-redux";

function ZeroDoseByRegion() {
  const { dfaData } = useSelector((state) => state.coverageReport);

  // Aggregate by state and region
  const regionMap = {};
  dfaData.forEach((item) => {
    const key = `${item.state}|${item.region}`;
    if (!regionMap[key]) {
      regionMap[key] = {
        state: item.state,
        region: item.region,
        zero_0_11: 0,
        zero_12_59: 0,
        total_0_11: 0,
        total_12_59: 0,
      };
    }
    regionMap[key].zero_0_11 += Number(item.vacinated_0_11_zero_occurence || 0);
    regionMap[key].zero_12_59 += Number(item.vacinated_12_59_zero_occurence || 0);
    regionMap[key].total_0_11 +=
      Number(item.vacinated_0_11_zero_occurence || 0) +
      Number(item.vacinated_0_11_multiple_occurence || 0);
    regionMap[key].total_12_59 +=
      Number(item.vacinated_12_59_zero_occurence || 0) +
      Number(item.vacinated_12_59_multiple_occurence || 0);
  });

  // Prepare rows and grand totals
  let grandZero_0_11 = 0,
    grandZero_12_59 = 0,
    grandZero_0_59 = 0,
    grandTotal_0_11 = 0,
    grandTotal_12_59 = 0;

  const rows = Object.values(regionMap).map((row) => {
    const zero_0_59 = row.zero_0_11 + row.zero_12_59;
    const percent_0_11 =
      row.total_0_11 > 0 ? ((row.zero_0_11 / row.total_0_11) * 100).toFixed(1) + "%" : "0%";
    const percent_12_59 =
      row.total_12_59 > 0 ? ((row.zero_12_59 / row.total_12_59) * 100).toFixed(1) + "%" : "0%";
    const sum_percent_0_59 =
      row.total_0_11 + row.total_12_59 > 0
        ? (
            ((row.zero_0_11 + row.zero_12_59) / (row.total_0_11 + row.total_12_59)) *
            100
          ).toFixed(2) + "%"
        : "0%";

    grandZero_0_11 += row.zero_0_11;
    grandZero_12_59 += row.zero_12_59;
    grandZero_0_59 += zero_0_59;
    grandTotal_0_11 += row.total_0_11;
    grandTotal_12_59 += row.total_12_59;

    return {
      ...row,
      zero_0_59,
      percent_0_11,
      percent_12_59,
      sum_percent_0_59,
    };
  });

  // Grand total row
  const grandPercent_0_11 =
    grandTotal_0_11 > 0 ? ((grandZero_0_11 / grandTotal_0_11) * 100).toFixed(1) + "%" : "0%";
  const grandPercent_12_59 =
    grandTotal_12_59 > 0 ? ((grandZero_12_59 / grandTotal_12_59) * 100).toFixed(1) + "%" : "0%";
  const grandSumPercent_0_59 =
    grandTotal_0_11 + grandTotal_12_59 > 0
      ? (
          ((grandZero_0_11 + grandZero_12_59) / (grandTotal_0_11 + grandTotal_12_59)) *
          100
        ).toFixed(2) + "%"
      : "0%";

  return (
    <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
      <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
        Number and Proportion of Zero-Dose Children by Age Group and Region
      </h3>
      <table className="min-w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border border-gray-300">state</th>
            <th className="py-2 px-4 border border-gray-300">region</th>
            <th className="py-2 px-4 border border-gray-300">zero_doses_0_11 months</th>
            <th className="py-2 px-4 border border-gray-300">zero_doses_12_59 months</th>
            <th className="py-2 px-4 border border-gray-300">Zero doses 0-59 months</th>
            <th className="py-2 px-4 border border-gray-300">% of Zero doses 0-11 months</th>
            <th className="py-2 px-4 border border-gray-300">% of Zero doses 12-59 months</th>
            <th className="py-2 px-4 border border-gray-300">Sum of % of Zero Doses Total 0-59 Months</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.state + row.region}>
              <td className="py-2 px-4 border border-gray-300">{row.state}</td>
              <td className="py-2 px-4 border border-gray-300">{row.region}</td>
              <td className="py-2 px-4 border border-gray-300">{row.zero_0_11}</td>
              <td className="py-2 px-4 border border-gray-300">{row.zero_12_59}</td>
              <td className="py-2 px-4 border border-gray-300">{row.zero_0_59}</td>
              <td className="py-2 px-4 border border-gray-300">{row.percent_0_11}</td>
              <td className="py-2 px-4 border border-gray-300">{row.percent_12_59}</td>
              <td className="py-2 px-4 border border-gray-300">{row.sum_percent_0_59}</td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="py-2 px-4 border border-gray-300" colSpan={2}>
              Grand Total
            </td>
            <td className="py-2 px-4 border border-gray-300">{grandZero_0_11}</td>
            <td className="py-2 px-4 border border-gray-300">{grandZero_12_59}</td>
            <td className="py-2 px-4 border border-gray-300">{grandZero_0_59}</td>
            <td className="py-2 px-4 border border-gray-300">{grandPercent_0_11}</td>
            <td className="py-2 px-4 border border-gray-300">{grandPercent_12_59}</td>
            <td className="py-2 px-4 border border-gray-300">{grandSumPercent_0_59}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ZeroDoseByRegion;