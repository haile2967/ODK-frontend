import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useDose } from "./DoseContext"; // Adjust path

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { legendRules } from "./legendConfig";
import { legendRules4 } from "./legendConfig.jsx";

function DistrictZeroDosesCard() {
    const { dosesPerVial } = useDose(); // Access dosesPerVial from context
  
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
        <h3 className="text-lg font-semibold text-gray-900">DFAs with High Negative Wastage Rate and High Percentage of Zero Doses</h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID or Form ID in Report Configuration
        </div>
      </div>
    );
  }

  const getRegionData = () => {
    const regionMap = {};
    if (!Array.isArray(filteredDfaData)) return [];
    filteredDfaData.forEach((item) => {
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
          opvVialsAvailable: 0,
          dosesPerVial: dosesPerVial || 20, 
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
          opvVialsAvailable: 0,
          dosesPerVial: dosesPerVial || 20, // Use context value with fallback
        };
      }
      const vaccinated =
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0) +
        (Number(item.vacinated_0_11_multiple_occurence) || 0) +
        (Number(item.vacinated_12_59_multiple_occurence) || 0);
      // const itemDosesPerVial = Number(item.doses_Per_Vial);
      const dosesUsed = Number(item.opv_usedemp_total * dosesPerVial) || 0;
      regionMap[regionKey].districts[districtKey].totalVaccinated += vaccinated;
      regionMap[regionKey].districts[districtKey].zeroDosesTotal +=
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0);
      regionMap[regionKey].districts[districtKey].zeroDoses0_11 += Number(item.vacinated_0_11_zero_occurence) || 0;
      regionMap[regionKey].districts[districtKey].dosesUsed += dosesUsed;
      regionMap[regionKey].districts[districtKey].opvVialsAvailable += Number(item.opv_received_total * dosesPerVial) || 0;
      regionMap[regionKey].districts[districtKey].dosesPerVial = dosesPerVial;
      regionMap[regionKey].totalVaccinated += vaccinated;
      regionMap[regionKey].zeroDosesTotal +=
        (Number(item.vacinated_0_11_zero_occurence) || 0) +
        (Number(item.vacinated_12_59_zero_occurence) || 0);
      regionMap[regionKey].zeroDoses0_11 += Number(item.vacinated_0_11_zero_occurence) || 0;
      regionMap[regionKey].dosesUsed += dosesUsed;
      regionMap[regionKey].opvVialsAvailable += Number(item.opv_received_total * dosesPerVial) || 0;

      if (dosesUsed > 0 && vaccinated === 0) {
        console.warn(`Data inconsistency in ${item.district}: ${dosesUsed} doses used but 0 vaccinations`);
      }
    });
    return Object.values(regionMap).map((region) => ({
      ...region,
      districts: Object.values(region.districts),
    }));
  };

  const calculateWastageRate = (vaccinated, opvVialsAvailable, district, region) => {
    if (opvVialsAvailable > 0) {
      const rate = (1 - vaccinated / opvVialsAvailable) * 100;
      if (rate === 100) {
        console.warn(`100% wastage rate in ${district?.district || region?.region}: vaccinated=${vaccinated}, vials=${opvVialsAvailable}, dosesUsed=${district?.dosesUsed || region?.dosesUsed}`);
      }
      return isNaN(rate) ? 0 : rate.toFixed(1);
    }
    return 0;
  };

  const calculateZeroDosePercent = (zeroOccurrences, totalVaccinated) => {
    if (totalVaccinated > 0) {
      const percent = (zeroOccurrences / totalVaccinated) * 100;
      return isNaN(percent) ? 0 : percent.toFixed(1);
    }
    return 0;
  };

  const getWastageColorClass = (percent) => {
    const numPercent = parseFloat(percent) || 0;
    const rule = legendRules.find((r) => numPercent >= r.min && numPercent <= r.max);
    return rule ? rule.className : "";
  };

  const getZeroDoseColorClass = (percent) => {
    const numPercent = parseFloat(percent) || 0;
    const rule = legendRules4.find((r) => numPercent >= r.min && numPercent <= r.max);
    return rule ? rule.className : "";
  };

  if (!filteredDfaData || filteredDfaData.length === 0 || !Array.isArray(filteredDfaData)) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">No available data...</p>
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
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "portrait" });
    const canvas = await html2canvas(tableRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DFAs with High Negative Wastage Rate and High Percentage of Zero Doses", 10, 10);

    doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 10;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 20;
      doc.addPage();
      doc.text("DFAs with High Negative Wastage Rate and High Percentage of Zero Doses", 10, 10);
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 10;
    }

    const date = new Date().toISOString().split("T")[0];
    doc.save(`district_zero_doses_${date}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [];
    const headers = ["State", "Region", "District", "Sum of % of Zero Doses Total", "% of Zero Doses 0-11 Months", "Number of Doses Used", "Wastage Rate (%)"];
    wsData.push(headers);

    regionData.forEach((region) => {
      region.districts.forEach((district) => {
        wsData.push([
          region.state,
          region.region,
          district.district,
          `${calculateZeroDosePercent(district.zeroDosesTotal, district.totalVaccinated)}%`,
          `${calculateZeroDosePercent(district.zeroDoses0_11, district.totalVaccinated)}%`,
          district.dosesUsed.toLocaleString(),
          `${calculateWastageRate(district.totalVaccinated, district.opvVialsAvailable, district, region)}%`,
        ]);
      });
      wsData.push([
        region.state,
        region.region,
        "Total",
        `${calculateZeroDosePercent(region.zeroDosesTotal, region.totalVaccinated)}%`,
        `${calculateZeroDosePercent(region.zeroDoses0_11, region.totalVaccinated)}%`,
        region.dosesUsed.toLocaleString(),
        `${calculateWastageRate(region.totalVaccinated, region.opvVialsAvailable, null, region)}%`,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "ZeroDosesByDistrict");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `district_zero_doses_${date}.xlsx`);
  };

  const getWastageTooltip = (rule) =>
    `${rule.range}: ${
      rule.color === "Green"
        ? "Vaccine use is efficient with minimal waste."
        : rule.color === "Light Green"
        ? "Acceptable level"
        : rule.color === "Red"
        ? "Too much wastage;"
        : "Negative or unmatched wastage rates"
    }`;

  const getZeroDoseTooltip = (rule) =>
    `${rule.range}: ${
      rule.color === "Green"
        ? "Very low zero-dose rate — good coverage"
        : rule.color === "Light Green"
        ? "Moderate zero-dose rate — needs improvement"
        : rule.color === "Yellow"
        ? "High zero-dose rate — action needed"
        : rule.color === "Red"
        ? "Critical zero-dose rate — very poor coverage"
        : "Data error"
    }`;

  // Deduplicate colors and combine tooltips
  const uniqueColors = {};
  const allRules = [...legendRules, ...legendRules4];
  allRules.forEach((rule) => {
    if (!uniqueColors[rule.className]) {
      uniqueColors[rule.className] = {
        color: rule.color,
        className: rule.className,
        tooltip: rule.color === "Green" || rule.color === "Light Green" || rule.color === "Red"
          ? `${getWastageTooltip(rule)} / ${getZeroDoseTooltip(rule)}`
          : rule.color === "Yellow"
          ? getZeroDoseTooltip(rule)
          : getWastageTooltip(rule),
      };
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Zero Doses and Wastage Rates by District</h3>
        <div className="space-x-2">
          <button onClick={exportToPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Export to PDF</button>
          <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Export to Excel</button>
        </div>
      </div>
      <div className="flex justify-start mb-4 space-x-2">
        {Object.values(uniqueColors).map((rule) => (
          <div
            key={rule.className}
            className={`w-6 h-6 ${rule.className} rounded cursor-pointer`}
            onClick={() => setShowPopup(true)}
            title={rule.tooltip}
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
            <div className="pl-5 space-y-2">
              <h5 className="text-xs font-semibold">Wastage Rate Interpretation</h5>
              <ul className="space-y-2">
                {legendRules.map((rule) => (
                  <li key={rule.color} className="mb-2 text-xs text-black">
                    <span className={`inline-block w-4 h-4 ${rule.className} mr-2`}></span>
                    {getWastageTooltip(rule)}
                  </li>
                ))}
              </ul>
              <h5 className="text-xs font-semibold">Zero Dose Rate</h5>
              <ul className="space-y-2">
                {legendRules4.map((rule) => (
                  <li key={rule.color} className="mb-2 text-xs text-black">
                    <span className={`inline-block w-4 h-4 ${rule.className} mr-2`}></span>
                    {getZeroDoseTooltip(rule)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div ref={tableRef}>
        <table className="min-w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-1 px-2 border border-gray-300">State</th>
              <th className="py-1 px-2 border border-gray-300">Region</th>
              <th className="py-1 px-2 border border-gray-300">District</th>
              <th className="py-1 px-2 border border-gray-300" title="(zeroOccurrences / totalVaccinated) * 100">Sum of % of Zero Doses Total</th>
              <th className="py-1 px-2 border border-gray-300" title="(zeroOccurrences / totalVaccinated) * 100">% of Zero Doses 0-11 Months</th>
              <th className="py-1 px-2 border border-gray-300">Number of Doses Used</th>
              <th className="py-1 px-2 border border-gray-300" title="(zeroOccurrences / totalVaccinated) * 100">Wastage Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {regionData.map((region) => [
              ...region.districts.map((district, distIdx, arr) => (
                <tr
                  key={`${region.state}-${region.region}-${district.district}-${distIdx}`}
                  className={`bg-white`}
                >
                  {distIdx === 0 ? (
                    <td className="py-1 px-2 border border-gray-300" rowSpan={arr.length + 1}>{region.state}</td>
                  ) : null}
                  {distIdx === 0 ? (
                    <td className="py-1 px-2 border border-gray-300" rowSpan={arr.length + 1}>{region.region}</td>
                  ) : null}
                  <td className="py-1 px-2 border border-gray-300">{district.district}</td>
                  <td className={`py-1 px-2 border border-gray-300 ${getZeroDoseColorClass(calculateZeroDosePercent(district.zeroDosesTotal, district.totalVaccinated))}`}>
                    {calculateZeroDosePercent(district.zeroDosesTotal, district.totalVaccinated)}%
                  </td>
                  <td className={`py-1 px-2 border border-gray-300 ${getZeroDoseColorClass(calculateZeroDosePercent(district.zeroDoses0_11, district.totalVaccinated))}`}>
                    {calculateZeroDosePercent(district.zeroDoses0_11, district.totalVaccinated)}%
                  </td>
                  <td className="py-1 px-2 border border-gray-300">{district.dosesUsed.toLocaleString()}</td>
                  <td className={`py-1 px-2 border border-gray-300 ${getWastageColorClass(calculateWastageRate(district.totalVaccinated, district.opvVialsAvailable, district, region))}`}>
                    {calculateWastageRate(district.totalVaccinated, district.opvVialsAvailable, district, region)}%
                  </td>
                </tr>
              )),
              <tr
                key={`${region.state}-${region.region}-total`}
                className="bg-gray-100 font-semibold"
              >
                <td className="py-1 px-2 border border-gray-300">Total</td>
                <td className={`py-1 px-2 border border-gray-300 ${getZeroDoseColorClass(calculateZeroDosePercent(region.zeroDosesTotal, region.totalVaccinated))}`}>
                  {calculateZeroDosePercent(region.zeroDosesTotal, region.totalVaccinated)}%
                </td>
                <td className={`py-1 px-2 border border-gray-300 ${getZeroDoseColorClass(calculateZeroDosePercent(region.zeroDoses0_11, region.totalVaccinated))}`}>
                  {calculateZeroDosePercent(region.zeroDoses0_11, region.totalVaccinated)}%
                </td>
                <td className="py-1 px-2 border border-gray-300">{region.dosesUsed.toLocaleString()}</td>
                <td className={`py-1 px-2 border border-gray-300 ${getWastageColorClass(calculateWastageRate(region.totalVaccinated, region.opvVialsAvailable, null, region))}`}>
                  {calculateWastageRate(region.totalVaccinated, region.opvVialsAvailable, null, region)}%
                </td>
              </tr>,
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DistrictZeroDosesCard;