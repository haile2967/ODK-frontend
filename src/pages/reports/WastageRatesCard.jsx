import React, { useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { useDose } from "./DoseContext"; // Adjust path
import { legendRules4, legendRules3 } from "./legendConfig.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { exportToExcel, getColorHex } from "../../utils/downloadUtils";

function WastageRatesCard() {
  const { dosesPerVial } = useDose(); // Access dosesPerVial from context
  const { filteredDfaData, selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);
  const [selectedTable, setSelectedTable] = useState("wastage");
  const [showPopup, setShowPopup] = useState(false);
  const tableRef = useRef(null);

  const currentDateTime = new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi", hour12: true });
  console.log("filteredDfaData in ZeroDoseByRegion:", filteredDfaData);
  console.log("selectedProjectId:", selectedProjectId);
  console.log("selectedFormId:", selectedFormId);
  console.log("dosesPerVial from context:", dosesPerVial); // Log the received value

  const isFilterSelected = selectedProjectId !== "" && selectedProjectId !== "all" && selectedFormId !== "";

  if (!isFilterSelected) {
    return (
      <div className="bg-white p-4 rounded-lg shadow max-w-full overflow-x-auto mx-auto mt-6">
        <h3 className="text-lg font-semibold text-gray-900">DFAs with High Negative Wastage Rate and High Percentage of Zero Doses</h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID or Form ID in Report Configuration
        </div>
      </div>
    );
  }

  const getRegionData = () => {
    const regionMap = {};
    if (!Array.isArray(filteredDfaData)) {
      console.log("dfaData is not an array:", filteredDfaData);
      return [];
    }
    console.log("Raw dfaData:", filteredDfaData);

    filteredDfaData.forEach((item) => {
      const regionKey = `${item.state || ''}|${item.region || ''}`;
      const districtKey = `${item.dfa_cod || ''}`;
      if (!regionMap[regionKey]) {
        regionMap[regionKey] = {
          state: item.state || '',
          region: item.region || '',
          districts: [],
        };
      }
      if (!regionMap[regionKey].districts[districtKey]) {
        regionMap[regionKey].districts[districtKey] = {
          district: item.district || '',
          dfa_cod: item.dfa_cod || '',
          totalVaccinated: 0,
          opvVialsUsed: 0,
          NumberOfdosesUsed: 0,
          zeroOccurrences: 0,
          dosesPerVial: dosesPerVial, // Use context value with fallback
        };
      }
      const vaccinated =
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0) +
        (Number(item.vacinated_0_11_multiple_occurence) || 0) +
        (Number(item.vacinated_12_59_multiple_occurence) || 0);
        
      regionMap[regionKey].districts[districtKey].totalVaccinated += vaccinated;
      regionMap[regionKey].districts[districtKey].opvVialsUsed += Number(item.opv_received_total) || 0;
      regionMap[regionKey].districts[districtKey].NumberOfdosesUsed += Number(item.opv_usedemp_total) || 0;
      regionMap[regionKey].districts[districtKey].zeroOccurrences +=
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0);
    });

    const result = Object.values(regionMap).map((region) => ({
      ...region,
      totalVaccinated: Object.values(region.districts).reduce((sum, d) => sum + d.totalVaccinated, 0),
      opvVialsUsed: Object.values(region.districts).reduce((sum, d) => sum + d.opvVialsUsed, 0),
      NumberOfdosesUsed: Object.values(region.districts).reduce((sum, d) => sum + d.NumberOfdosesUsed, 0),
      zeroOccurrences: Object.values(region.districts).reduce((sum, d) => sum + d.zeroOccurrences, 0),
      dosesPerVial: dosesPerVial, // Use context value with fallback
    }));
    console.log("Region Data:", result);
    return result;
  };

  const calculateWastageRate = (vaccinated, NumberOfdosesUsed) => {
    const vaccinatedNum = Number(vaccinated) || 0;
    const NumberOfdosesUsedNum = Number(NumberOfdosesUsed) || 0;
    const totalDoses = NumberOfdosesUsedNum * (dosesPerVial || 20); // Use context value with fallback
    console.log("Wastage Calc Inputs:", { vaccinatedNum, NumberOfdosesUsedNum, totalDoses });

    if (totalDoses > 0) {
      const difference = totalDoses - vaccinatedNum;
      const rate = (difference / totalDoses) * 100;
      console.log("Wastage Calc Steps:", { difference, rate });
      if (isNaN(rate) || !isFinite(rate)) {
        console.log("Invalid wastage calculation");
        return { rate: 0, isNegative: false, error: "Invalid calculation" };
      }
      return { rate: rate.toFixed(1), isNegative: rate < 0, error: null };
    }
    console.log("Wastage Calc: Invalid input data, defaulting to 0%");
    return { rate: 0, isNegative: false, error: "Invalid input data" };
  };

  const calculateOverallWastageRate = () => {
    const totals = getRegionData().reduce(
      (acc, item) => ({
        totalVaccinated: acc.totalVaccinated + item.totalVaccinated,
        NumberOfdosesUsed: acc.NumberOfdosesUsed + item.NumberOfdosesUsed,
      }),
      { totalVaccinated: 0, NumberOfdosesUsed: 0 }
    );
    const result = calculateWastageRate(totals.totalVaccinated, totals.NumberOfdosesUsed);
    console.log("Overall Wastage Rate Calc:", { totals, result });
    return result.rate;
  };

  const calculateZeroDosePercent = (zeroOccurrences, totalVaccinated) => {
    const zeroNum = Number(zeroOccurrences) || 0;
    const vaccinatedNum = Number(totalVaccinated) || 0;
    console.log("Zero Dose Calc Inputs:", { zeroNum, vaccinatedNum });
    if (vaccinatedNum > 0) {
      const percent = (zeroNum / vaccinatedNum) * 100;
      console.log("Zero Dose Calc:", { percent });
      return isNaN(percent) ? 0 : percent.toFixed(1);
    }
    console.log("Zero Dose Calc: No vaccinated data");
    return 0;
  };

  const calculateOverallZeroDosePercent = () => {
    const totals = getRegionData().reduce(
      (acc, item) => ({
        zeroOccurrences: acc.zeroOccurrences + item.zeroOccurrences,
        totalVaccinated: acc.totalVaccinated + item.totalVaccinated,
      }),
      { zeroOccurrences: 0, totalVaccinated: 0 }
    );
    const result = calculateZeroDosePercent(totals.zeroOccurrences, totals.totalVaccinated);
    console.log("Overall Zero Dose % Calc:", { totals, result });
    return result;
  };

  const getClassByPercentage = (percentage, isNegative = false) => {
    const numPercent = parseFloat(percentage) || 0;
    const rules = selectedTable === "wastage" ? legendRules4 : legendRules3;
    if (selectedTable === "wastage" && isNegative) {
      return "bg-red-50 text-red-600";
    }
    const rule = rules.find((r) => numPercent >= r.min && numPercent <= r.max);
    return rule ? rule.className : "";
  };

  const getLegendTooltip = (rule) => {
    if (selectedTable === "wastage") {
      return `${rule.range}: ${rule.description}`;
    } else {
      return `${rule.range}: ${
        rule.color === "Green" ? "Very low zero-dose rate — good coverage" :
        rule.color === "Yellow" ? "Moderate zero-dose rate — needs improvement" :
        rule.color === "Red" ? "High zero-dose rate — action needed" :
        "Critical zero-dose rate — very poor coverage"
      }`;
    }
  };

  if (!filteredDfaData || filteredDfaData.length === 0 || !Array.isArray(filteredDfaData)) {
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

  const exportToPDF = async () => {
    try {
      const canvas = await html2canvas(tableRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
      const imgWidth = 280;
      const pageHeight = 200;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 20;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("DFAs with High Negative Wastage Rate and High Percentage of Zero Doses", 10, 10);

      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 20;
        doc.addPage();
        doc.text("DFAs with High Negative Wastage Rate and High Percentage of Zero Doses", 10, 10);
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const date = new Date().toISOString().split("T")[0];
      doc.save(`wastage_rates_${selectedTable}_${date}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please check the console for details.");
    }
  };

  const exportToExcel = () => {
    try {
      const districtData = regionData.flatMap((region) =>
        Object.values(region.districts).map((district) => ({
          state: region.state,
          region: region.region,
          district: district.district,
          dfa_cod: district.dfa_cod,
          ...(selectedTable === "wastage"
            ? {
                "Wastage Rate (%)": calculateWastageRate(
                  district.totalVaccinated,
                  district.NumberOfdosesUsed
                ).rate + "%",
              }
            : {
                "Zero Doses (%)": calculateZeroDosePercent(
                  district.zeroOccurrences,
                  district.totalVaccinated
                ) + "%",
              }),
        }))
      );
      const grandTotal = selectedTable === "wastage"
        ? `${calculateOverallWastageRate()}%`
        : `${calculateOverallZeroDosePercent()}%`;
      exportToExcel(districtData, [selectedTable === "wastage" ? "Wastage Rate (%)" : "Zero Doses (%)"], grandTotal);
    } catch (error) {
      console.error("Excel export failed:", error);
      alert("Failed to export Excel. Please check the console for details.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">DFAs with High Negative Wastage Rate and High Percentage of Zero Doses</h3>
          <p className="text-xs text-gray-500">Updated: {currentDateTime}</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Export to PDF
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Export to Excel
          </button>
        </div>
      </div>

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

      <div className="flex justify-start mb-4 space-x-2">
        {selectedTable === "wastage" ? legendRules4.map((rule) => (
          <div
            key={rule.color}
            className={`w-6 h-6 ${rule.className} rounded cursor-pointer`}
            onClick={() => setShowPopup(true)}
            title={getLegendTooltip(rule)}
          ></div>
        )) : legendRules3.map((rule) => (
          <div
            key={rule.color}
            className={`w-6 h-6 ${rule.className} rounded cursor-pointer`}
            onClick={() => setShowPopup(true)}
            title={getLegendTooltip(rule)}
          ></div>
        ))}
      </div>

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
              {(selectedTable === "wastage" ? legendRules4 : legendRules3).map((rule) => (
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
        {selectedTable === "wastage" ? (
          <table className="min-w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-0.5 px-2 border border-gray-300">Submissions.state</th>
                <th className="py-0.5 px-2 border border-gray-300">Submissions.region</th>
                <th className="py-0.5 px-2 border border-gray-300">Submissions.district</th>
                <th className="py-0.5 px-2 border border-gray-300">Submissions.dfa_code</th>
                <th className="py-0.5 px-2 border border-gray-300" title="((NumberOfdosesUsed * dosesPerVial - totalVaccinated) / (NumberOfdosesUsed * dosesPerVial)) * 100">Sum of Wastage Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {regionData.map((region, regionIdx) =>
                Object.values(region.districts).map((district, distIdx, arr) => {
                  const wastage = calculateWastageRate(
                    district.totalVaccinated,
                    district.NumberOfdosesUsed
                  );
                  return (
                    <tr
                      key={`${region.state}-${region.region}-${district.district}-${distIdx}`}
                      className={distIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {distIdx === 0 ? (
                        <>
                          <td
                            className="py-0.5 px-2 border border-gray-300"
                            rowSpan={arr.length}
                          >
                            {region.state || "N/A"}
                          </td>
                          <td
                            className="py-0.5 px-2 border border-gray-300"
                            rowSpan={arr.length}
                          >
                            {region.region || "N/A"}
                          </td>
                        </>
                      ) : null}
                      <td className="py-0.5 px-2 border border-gray-300">{district.district || "N/A"}</td>
                      <td className="py-0.5 px-2 border border-gray-300">{district.dfa_cod || "N/A"}</td>
                      <td className={`py-0.5 px-2 border border-gray-300 ${getClassByPercentage(wastage.rate, wastage.isNegative)}`}>
                        {wastage.rate}% {wastage.isNegative && "(Negative)"}
                      </td>
                    </tr>
                  );
                })
              ).concat(
                <tr key="overall-total" className="bg-gray-100 font-semibold">
                  <td className="py-0.5 px-2 border border-gray-300" colSpan="4">Overall Total</td>
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
                <th className="py-0.5 px-2 border border-gray-300">Submissions.dfa_code</th>
                <th className="py-0.5 px-2 border border-gray-300" title="(zeroOccurrences / totalVaccinated) * 100">Sum of % of Zero Doses Total</th>
              </tr>
            </thead>
            <tbody>
              {regionData.map((region, regionIdx) =>
                Object.values(region.districts).map((district, distIdx, arr) => {
                  const zeroPercent = calculateZeroDosePercent(district.zeroOccurrences, district.totalVaccinated);
                  if (parseFloat(zeroPercent) > 0) {
                    return (
                      <tr
                        key={`${region.state}-${region.region}-${district.district}-${distIdx}`}
                        className={distIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {distIdx === 0 ? (
                          <>
                            <td
                              className="py-0.5 px-2 border border-gray-300"
                              rowSpan={arr.length}
                            >
                              {region.state || "N/A"}
                            </td>
                            <td
                              className="py-0.5 px-2 border border-gray-300"
                              rowSpan={arr.length}
                            >
                              {region.region || "N/A"}
                            </td>
                          </>
                        ) : null}
                        <td className="py-0.5 px-2 border border-gray-300">{district.district || "N/A"}</td>
                        <td className="py-0.5 px-2 border border-gray-300">{district.dfa_cod || "N/A"}</td>
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
    </div>
  );
}

export default WastageRatesCard;