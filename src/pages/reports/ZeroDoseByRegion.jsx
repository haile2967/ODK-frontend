import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { legendRules3 } from "./legendConfig.jsx";

function ZeroDoseByRegion() {
  const [showPopup, setShowPopup] = useState(false);
  const tableRef = useRef(null);
  const { filteredDfaData, selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);

  console.log("filteredDfaData in ZeroDoseByRegion:", filteredDfaData);
  console.log("selectedProjectId:", selectedProjectId);
  console.log("selectedFormId:", selectedFormId);

  const isFilterSelected = selectedProjectId !== "" && selectedProjectId !== "all" && selectedFormId !== "";

  if (!isFilterSelected) {
    return (
      <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
          Number and Proportion of Zero-Dose Children by Age Group and Region
        </h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID or Form ID in Report Configuration
        </div>
      </div>
    );
  }

  if (!filteredDfaData || filteredDfaData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
          Number and Proportion of Zero-Dose Children by Age Group and Region
        </h3>
        <div className="text-center text-red-600 font-medium">
          No data available for selected filters
        </div>
      </div>
    );
  }

  const regionMap = {};
  filteredDfaData.forEach((item) => {
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

  const getColorClass = (percent) => {
    const numPercent = parseFloat(percent) || 0;
    const rule = legendRules3.find((r) => numPercent >= r.min && numPercent <= r.max);
    return rule ? rule.className : "";
  };

  const getFormulaTooltip = (zero, total) => {
    console.log(`Calculating tooltip: zero=${zero}, total=${total}, result=${total > 0 ? `((${zero} / ${total}) * 100)%` : "(No data)"}`);
    return total > 0 ? `((${zero} / ${total}) * 100)%` : "(No data)";
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
    const tableColumn = ["State", "Region", "Zero Doses 0-11 Months", "Zero Doses 12-59 Months", "Zero Doses 0-59 Months", "% of Zero Doses 0-11 Months", "% of Zero Doses 12-59 Months", "Sum of % of Zero Doses Total 0-59 Months"];
    const tableRows = rows.map((row) => [
      row.state,
      row.region,
      row.zero_0_11,
      row.zero_12_59,
      row.zero_0_59,
      row.percent_0_11,
      row.percent_12_59,
      row.sum_percent_0_59,
    ]);

    tableRows.push([
      "Grand Total",
      "",
      grandZero_0_11,
      grandZero_12_59,
      grandZero_0_59,
      grandPercent_0_11,
      grandPercent_12_59,
      grandSumPercent_0_59,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: "#F3F4F6", textColor: "#1F2937" },
      alternateRowStyles: { fillColor: "#F9FAFB" },
      styles: { cellPadding: 2, fontSize: 8, lineColor: "#D1D5DB", lineWidth: 0.1 },
      margin: { top: 20 },
    });

    doc.text("Number and Proportion of Zero-Dose Children by Age Group and Region", 14, 15);
    const date = new Date().toISOString().split("T")[0];
    doc.save(`zero_dose_by_region_${date}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [];
    const headers = ["State", "Region", "Zero Doses 0-11 Months", "Zero Doses 12-59 Months", "Zero Doses 0-59 Months", "% of Zero Doses 0-11 Months", "% of Zero Doses 12-59 Months", "Sum of % of Zero Doses Total 0-59 Months"];
    wsData.push(headers);

    rows.forEach((row) => {
      wsData.push([
        row.state,
        row.region,
        row.zero_0_11,
        row.zero_12_59,
        row.zero_0_59,
        row.percent_0_11,
        row.percent_12_59,
        row.sum_percent_0_59,
      ]);
    });
    wsData.push([
      "Grand Total",
      "",
      grandZero_0_11,
      grandZero_12_59,
      grandZero_0_59,
      grandPercent_0_11,
      grandPercent_12_59,
      grandSumPercent_0_59,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "ZeroDoseByRegion");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `zero_dose_by_region_${date}.xlsx`);
  };

  const getLegendTooltip = (rule) =>
    `${rule.range}: ${
      rule.color === "Green"
        ? "Vaccine use is efficient with minimal waste."
        : rule.color === "Yellow"
        ? "Acceptable level"
        : rule.color === "Red"
        ? "Too much wastage;"
        : "Negative or unmatched wastage rates"
    }`;

  return (
    <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
          Number and Proportion of Zero-Dose Children by Age Group and Region
        </h3>
        <div className="space-x-2">
          <button onClick={exportToPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Export to PDF</button>
          <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Export to Excel</button>
        </div>
      </div>
      <div className="flex justify-start mb-4 space-x-2">
        {legendRules3.map((rule) => (
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
              {legendRules3.map((rule) => (
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
              <th className="py-2 px-4 border border-gray-300">State</th>
              <th className="py-2 px-4 border border-gray-300">Region</th>
              <th className="py-2 px-4 border border-gray-300">Zero Doses 0-11 Months</th>
              <th className="py-2 px-4 border border-gray-300">Zero Doses 12-59 Months</th>
              <th className="py-2 px-4 border border-gray-300">Zero Doses 0-59 Months</th>
              <th className="py-2 px-4 border border-gray-300" title="(zero_0_11 / total_0_11) * 100%">% of Zero Doses 0-11 Months</th>
              <th className="py-2 px-4 border border-gray-300" title="(zero_12_59 / total_12_59) * 100%">% of Zero Doses 12-59 Months</th>
              <th className="py-2 px-4 border border-gray-300" title="((zero_0_11 + zero_12_59) / (total_0_11 + total_12_59)) * 100%">Sum of % of Zero Doses Total 0-59 Months</th>
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
                <td className={`py-2 px-4 border border-gray-300 ${getColorClass(parseFloat(row.percent_0_11) || 0)}`}
                  title={getFormulaTooltip(row.zero_0_11, row.total_0_11)}>
                  {row.percent_0_11}
                </td>
                <td className={`py-2 px-4 border border-gray-300 ${getColorClass(parseFloat(row.percent_12_59) || 0)}`}
                  title={getFormulaTooltip(row.zero_12_59, row.total_12_59)}>
                  {row.percent_12_59}
                </td>
                <td className={`py-2 px-4 border border-gray-300 ${getColorClass(parseFloat(row.sum_percent_0_59) || 0)}`}
                  title={getFormulaTooltip(row.zero_0_59, row.total_0_11 + row.total_12_59)}>
                  {row.sum_percent_0_59}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="py-2 px-4 border border-gray-300" colSpan={2}>
                Grand Total
              </td>
              <td className="py-2 px-4 border border-gray-300">{grandZero_0_11}</td>
              <td className="py-2 px-4 border border-gray-300">{grandZero_12_59}</td>
              <td className="py-2 px-4 border border-gray-300">{grandZero_0_59}</td>
              <td className={`py-2 px-4 border border-gray-300 ${getColorClass(parseFloat(grandPercent_0_11) || 0)}`}
                title={getFormulaTooltip(grandZero_0_11, grandTotal_0_11)}>
                {grandPercent_0_11}
              </td>
              <td className={`py-2 px-4 border border-gray-300 ${getColorClass(parseFloat(grandPercent_12_59) || 0)}`}
                title={getFormulaTooltip(grandZero_12_59, grandTotal_12_59)}>
                {grandPercent_12_59}
              </td>
              <td className={`py-2 px-4 border border-gray-300 ${getColorClass(parseFloat(grandSumPercent_0_59) || 0)}`}
                title={getFormulaTooltip(grandZero_0_59, grandTotal_0_11 + grandTotal_12_59)}>
                {grandSumPercent_0_59}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ZeroDoseByRegion;