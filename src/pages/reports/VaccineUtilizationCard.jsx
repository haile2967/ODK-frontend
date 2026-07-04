import React, { useState } from "react";
import { useSelector } from "react-redux";
import { legendRules4 } from "./legendConfig.jsx";
import { useDose } from "./DoseContext"; // Adjust path

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function VaccineUtilizationCard() {
    const { dosesPerVial } = useDose(); // Access dosesPerVial from context
  
  const [showPopup, setShowPopup] = useState(false);
  const { filteredDfaData, selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);

  console.log("filteredDfaData in ZeroDoseByRegion:", filteredDfaData);
  console.log("selectedProjectId:", selectedProjectId);
  console.log("selectedFormId:", selectedFormId);

  const isFilterSelected = selectedProjectId !== "" && selectedProjectId !== "all" && selectedFormId !== "";

  if (!isFilterSelected) {
    return (
      <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
        <h3 className="text-lg font-semibold text-gray-900">Vaccine Utilization and Wastage Rates (%) by Region</h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID and Form Id in Report Configuration
        </div>
      </div>
    );
  }

  const selectedRules = legendRules4;
  const fallbackColor = { className: "bg-red-50 text-red-600", description: "Negative or unmatched wastage rates" };

  const regionMap = {};
  if (Array.isArray(filteredDfaData)) {
    filteredDfaData.forEach((item) => {
      const regionKey = `${item.state || ''}|${item.region || ''}`;
      if (!regionMap[regionKey]) {
        regionMap[regionKey] = {
          state: item.state || '',
          region: item.region || '',
          totalVaccinated: 0,
          opvVialsUsed: 0,
          NumberOfDosesUsed: 0,
          doses_Per_Vial: dosesPerVial,
        };
      }
      const vaccinated =
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0) +
        (Number(item.vacinated_0_11_multiple_occurence) || 0) +
        (Number(item.vacinated_12_59_multiple_occurence) || 0);
      const opvVialsUsed = Number(item.opv_received_total) || 0;
      const NumberOfDosesUsed = Number(item.opv_usedemp_total) || 0;

      
      regionMap[regionKey].totalVaccinated += vaccinated;
      regionMap[regionKey].opvVialsUsed += opvVialsUsed;
      regionMap[regionKey].dosesPerVial = dosesPerVial;
      regionMap[regionKey].NumberOfDosesUsed += NumberOfDosesUsed * dosesPerVial;
    });
  }
  console.log("regionMap output:", Object.values(regionMap));

  const groupedData = {};
  Object.values(regionMap).forEach((item) => {
    const stateKey = item.state;
    if (!groupedData[stateKey]) {
      groupedData[stateKey] = {
        state: item.state,
        regions: [],
        totalVaccinated: 0,
        opvVialsUsed: 0,
        NumberOfDosesUsed: 0,
        doses_Per_Vial: dosesPerVial,
      };
    }
    groupedData[stateKey].regions.push(item);
    groupedData[stateKey].totalVaccinated += item.totalVaccinated;
    groupedData[stateKey].opvVialsUsed += item.opvVialsUsed;
    groupedData[stateKey].NumberOfDosesUsed += item.NumberOfDosesUsed;
  });

  const calculateWastageRate = (totalVaccinated, NumberOfDosesUsed) => {
    if (totalVaccinated > 0) {
      const rate = ((NumberOfDosesUsed - totalVaccinated) / NumberOfDosesUsed) * 100;
      return isNaN(rate) ? "0" : rate.toFixed(1);
    }
    return "0";
  };

  const getColorClass = (wastageRate) => {
    const numRate = parseFloat(wastageRate) || 0;
    const rule = selectedRules.find((rule) => numRate >= rule.min && numRate <= rule.max);
    return rule ? rule.className : fallbackColor.className;
  };

  const grandTotalVaccinated = Object.values(groupedData).reduce((sum, state) => sum + state.totalVaccinated, 0);
  const grandTotalOpvVials = Object.values(groupedData).reduce((sum, state) => sum + state.opvVialsUsed, 0);
  const grandTotalDoses = Object.values(groupedData).reduce((sum, state) => sum + state.NumberOfDosesUsed, 0);
  const grandWastageRate = calculateWastageRate(grandTotalVaccinated, grandTotalDoses);

  if (!filteredDfaData || filteredDfaData.length === 0 || !Array.isArray(filteredDfaData)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow min-h-[200px] flex items-center justify-center">
        <p className="text-gray-600 text-base">No data available. Please check the data source.</p>
      </div>
    );
  }

  const exportToPDF = () => {
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "portrait" });
    const tableColumn = ["State", "Region", "Total 0-59 M Vaccinated", "OPV Vials Used", "Number of doses used", "Wastage Rate (%)"];
    const tableRows = [];

    Object.values(groupedData).forEach((stateData) => {
      stateData.regions.forEach((region) => {
        tableRows.push([
          stateData.state,
          region.region,
          region.totalVaccinated.toLocaleString(),
          region.opvVialsUsed.toLocaleString(),
          region.NumberOfDosesUsed.toLocaleString(),
          `${calculateWastageRate(region.totalVaccinated, region.NumberOfDosesUsed)}%`,
        ]);
      });
      tableRows.push([
        stateData.state,
        "Total",
        stateData.totalVaccinated.toLocaleString(),
        stateData.opvVialsUsed.toLocaleString(),
        stateData.NumberOfDosesUsed.toLocaleString(),
        `${calculateWastageRate(stateData.totalVaccinated, stateData.NumberOfDosesUsed)}%`,
      ]);
    });
    tableRows.push([
      "Grand Total",
      "",
      grandTotalVaccinated.toLocaleString(),
      grandTotalOpvVials.toLocaleString(),
      grandTotalDoses.toLocaleString(),
      `${grandWastageRate}%`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      columnStyles: {
        5: { cellWidth: 30, fillColor: (data) => getColorClass(data.cell.raw.replace("%", "")) },
      },
      headStyles: { fillColor: "#F3F4F6", textColor: "#1F2937" },
      alternateRowStyles: { fillColor: "#F9FAFB" },
      styles: { cellPadding: 2, fontSize: 10, lineColor: "#D1D5DB", lineWidth: 0.1 },
      margin: { top: 20 },
    });

    doc.text("Vaccine Utilization and Wastage Rates (%) by Region", 14, 15);
    const date = new Date().toISOString().split("T")[0];
    doc.save(`vaccine_utilization_${date}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [];
    const headers = ["State", "Region", "Total 0-59 M Vaccinated", "OPV Vials Used", "Number of doses used", "Wastage Rate (%)"];
    wsData.push(headers);

    Object.values(groupedData).forEach((stateData) => {
      stateData.regions.forEach((region) => {
        wsData.push([
          stateData.state,
          region.region,
          region.totalVaccinated.toLocaleString(),
          region.opvVialsUsed.toLocaleString(),
          region.NumberOfDosesUsed.toLocaleString(),
          `${calculateWastageRate(region.totalVaccinated, region.NumberOfDosesUsed)}%`,
        ]);
      });
      wsData.push([
        stateData.state,
        "Total",
        stateData.totalVaccinated.toLocaleString(),
        stateData.opvVialsUsed.toLocaleString(),
        stateData.NumberOfDosesUsed.toLocaleString(),
        `${calculateWastageRate(stateData.totalVaccinated, stateData.NumberOfDosesUsed)}%`,
      ]);
    });
    wsData.push([
      "Grand Total",
      "",
      grandTotalVaccinated.toLocaleString(),
      grandTotalOpvVials.toLocaleString(),
      grandTotalDoses.toLocaleString(),
      `${grandWastageRate}%`,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "VaccineUtilization");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `vaccine_utilization_${date}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Vaccine Utilization and Wastage Rates (%) by Region</h3>
        <div className="space-x-2">
          <button onClick={exportToPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Export to PDF</button>
          <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Export to Excel</button>
        </div>
      </div>

      <div className="flex justify-start mb-4 space-x-2">
        {selectedRules.map((rule, index) => (
          <div
            key={index}
            className={`w-6 h-6 ${rule.className} rounded cursor-pointer`}
            onClick={() => setShowPopup(true)}
            title={`${rule.range}: ${rule.description}`}
            aria-label={`Legend color for ${rule.range}`}
          ></div>
        ))}
        <div
          className={`w-6 h-6 ${fallbackColor.className} rounded cursor-pointer`}
          onClick={() => setShowPopup(true)}
          title={fallbackColor.description}
          aria-label="Legend color for negative or unmatched rates"
        ></div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4 relative">
            <button
              className="absolute top-2 right-2 text-black text-xl font-bold hover:text-gray-600"
              onClick={() => setShowPopup(false)}
              aria-label="Close legend popup"
            >
              ✖
            </button>
            <h4 className="text-sm font-semibold mb-4 text-black">Wastage Rate Interpretation</h4>
            <ul className="pl-5 space-y-2">
              {selectedRules.map((rule, index) => (
                <li key={index} className="mb-2 text-xs text-black">
                  <span className={`inline-block w-4 h-4 ${rule.className} mr-2`}></span>
                  {`${rule.range}: ${rule.description}`}
                </li>
              ))}
              <li className="mb-2 text-xs text-black">
                <span className={`inline-block w-4 h-4 ${fallbackColor.className} mr-2`}></span>
                {fallbackColor.description}
              </li>
            </ul>
          </div>
        </div>
      )}

      <table className="min-w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-1 px-2 border border-gray-300">Submissions.state</th>
            <th className="py-1 px-2 border border-gray-300">Submissions.region</th>
            <th className="py-1 px-2 border border-gray-300">Total 0-59 M Vaccinated</th>
            <th className="py-1 px-2 border border-gray-300">OPV Vials Used</th>
            <th className="py-1 px-2 border border-gray-300">Number of doses used</th>
            <th className="py-1 px-2 border border-gray-300" title="((dosesUsed - totalVaccinated) / totalVaccinated) * 100%">Wastage Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(groupedData).map((stateData) => [
            ...stateData.regions.map((region, idx) => {
              const wastageRate = calculateWastageRate(region.totalVaccinated, region.NumberOfDosesUsed);
              return (
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
                    {region.NumberOfDosesUsed.toLocaleString()}
                  </td>
                  <td
                    className={`py-1 px-2 border border-gray-300 ${getColorClass(wastageRate)}`}
                  >
                    {wastageRate}%
                  </td>
                </tr>
              );
            }),
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
                {stateData.NumberOfDosesUsed.toLocaleString()}
              </td>
              <td
                className={`py-1 px-2 border border-gray-300 ${getColorClass(
                  calculateWastageRate(stateData.totalVaccinated, stateData.NumberOfDosesUsed)
                )}`}
              >
                {calculateWastageRate(stateData.totalVaccinated, stateData.NumberOfDosesUsed)}%
              </td>
            </tr>,
          ])}
          <tr className="bg-gray-100 font-semibold">
            <td className="py-1 px-2 border border-gray-300" colSpan="2">Grand Total</td>
            <td className="py-1 px-2 border border-gray-300">{grandTotalVaccinated.toLocaleString()}</td>
            <td className="py-1 px-2 border border-gray-300">{grandTotalOpvVials.toLocaleString()}</td>
            <td className="py-1 px-2 border border-gray-300">{grandTotalDoses.toLocaleString()}</td>
            <td
              className={`py-1 px-2 border border-gray-300 ${getColorClass(grandWastageRate)}`}
            >
              {grandWastageRate}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default VaccineUtilizationCard;