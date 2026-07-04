import React from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function RegionalSummaryTable() {
  const { filteredDfaData, selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);

  console.log("filteredDfaData in RegionalSummaryTable:", filteredDfaData);
  console.log("selectedProjectId:", selectedProjectId);
  console.log("selectedFormId:", selectedFormId);

  const isFilterSelected = selectedProjectId !== "" && selectedProjectId !== "all" && selectedFormId !== "";

  if (!isFilterSelected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6 max-w-full overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-blue-700">Regional Vaccination Summary</h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID or Form ID in Report Configuration
        </div>
      </div>
    );
  }

  if (!filteredDfaData || filteredDfaData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow mt-6 max-w-full overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4 text-blue-700">Regional Vaccination Summary</h3>
        <div className="text-center text-red-600 font-medium">
          No data available for selected filters
        </div>
      </div>
    );
  }

  const regionMap = {};
  filteredDfaData.forEach((item, index) => {
    console.log(`Processing item ${index}:`, {
      state: item.state,
      region: item.region,
      vacinated_0_11_zero: item.vacinated_0_11_zero_occurence,
      vacinated_0_11_multiple: item.vacinated_0_11_multiple_occurence,
      vacinated_12_59_zero: item.vacinated_12_59_zero_occurence,
      vacinated_12_59_multiple: item.vacinated_12_59_multiple_occurence,
      opv_usedemp_total: item.opv_usedemp_total,
      revisited_not_available: item.revisited_unvaccinated_not_available,
      revisited_refusals: item.revisited_unvaccinated_refusals,
    });

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

  console.log("regionMap before rendering:", JSON.stringify(regionMap, null, 2));

  const stateMap = {};
  Object.values(regionMap).forEach((region) => {
    if (!stateMap[region.state]) stateMap[region.state] = [];
    stateMap[region.state].push(region);
  });

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

  const exportToPDF = () => {
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "landscape" });
    const tableColumn = ["State", "Region", "0-11 Repeat Vaccinated", "12-59 Repeat Vaccinated", "0-11 Zero Doses", "12-59 Zero Doses", "OPV Used/Emptied", "Revisited Not Available", "Revisited Refusals", "0-11 Total Vaccinated", "12-59 Total Vaccinated", "Total Zero Doses", "Total Vaccinated"];
    const tableRows = [];

    Object.entries(stateMap).forEach(([state, regions]) => {
      regions.forEach((region) => {
        tableRows.push([
          state,
          region.region,
          region.vac_0_11_repeat,
          region.vac_12_59_repeat,
          region.zero_0_11,
          region.zero_12_59,
          region.opv_usedemp,
          region.revisited_not_available,
          region.revisited_refusals,
          region.total_vac_0_11,
          region.total_vac_12_59,
          region.total_zero_doses,
          region.total_vaccinated,
        ]);
      });
      const totals = calcStateTotals(regions);
      tableRows.push([
        state,
        "Total",
        totals.vac_0_11_repeat,
        totals.vac_12_59_repeat,
        totals.zero_0_11,
        totals.zero_12_59,
        totals.opv_usedemp,
        totals.revisited_not_available,
        totals.revisited_refusals,
        totals.total_vac_0_11,
        totals.total_vac_12_59,
        totals.total_zero_doses,
        totals.total_vaccinated,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: "#F3F4F6", textColor: "#1F2937" },
      alternateRowStyles: { fillColor: "#F9FAFB" },
      styles: { cellPadding: 2, fontSize: 8, lineColor: "#D1D5DB", lineWidth: 0.1 },
      margin: { top: 20 },
    });

    doc.text("Regional Vaccination Summary", 14, 15);
    const date = new Date().toISOString().split("T")[0];
    doc.save(`regional_summary_${date}.pdf`);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [];
    const headers = ["State", "Region", "0-11 Repeat Vaccinated", "12-59 Repeat Vaccinated", "0-11 Zero Doses", "12-59 Zero Doses", "OPV Used/Emptied", "Revisited Not Available", "Revisited Refusals", "0-11 Total Vaccinated", "12-59 Total Vaccinated", "Total Zero Doses", "Total Vaccinated"];
    wsData.push(headers);

    Object.entries(stateMap).forEach(([state, regions]) => {
      regions.forEach((region) => {
        wsData.push([
          state,
          region.region,
          region.vac_0_11_repeat,
          region.vac_12_59_repeat,
          region.zero_0_11,
          region.zero_12_59,
          region.opv_usedemp,
          region.revisited_not_available,
          region.revisited_refusals,
          region.total_vac_0_11,
          region.total_vac_12_59,
          region.total_zero_doses,
          region.total_vaccinated,
        ]);
      });
      const totals = calcStateTotals(regions);
      wsData.push([
        state,
        "Total",
        totals.vac_0_11_repeat,
        totals.vac_12_59_repeat,
        totals.zero_0_11,
        totals.zero_12_59,
        totals.opv_usedemp,
        totals.revisited_not_available,
        totals.revisited_refusals,
        totals.total_vac_0_11,
        totals.total_vac_12_59,
        totals.total_zero_doses,
        totals.total_vaccinated,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "RegionalSummary");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `regional_summary_${date}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6 max-w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold mb-4 text-blue-700">Regional Vaccination Summary</h3>
        <div className="space-x-2">
          <button onClick={exportToPDF} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Export to PDF</button>
          <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Export to Excel</button>
        </div>
      </div>
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
                      rowSpan={regions.length + 1}
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
              <tr key={state + "-total"} className="bg-gray-100 font-bold">
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