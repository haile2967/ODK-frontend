import React, { useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function ChildrenVaccinatedByRegion() {
  const { filteredDfaData, selectedProjectId, selectedFormId } = useSelector(
    (state) => state.coverageReport
  );
  const tableRef = useRef(null);

  // Debug logs
  console.log("filteredDfaData in ChildrenVaccinatedByRegion:", filteredDfaData);
  console.log("selectedProjectId:", selectedProjectId);
  console.log("selectedFormId:", selectedFormId);

  // Get unique campaign days and labels
  const campaignDays = useMemo(
    () =>
      Array.from(new Set(filteredDfaData.map((item) => item.campaign_day))).sort(
        (a, b) => new Date(a) - new Date(b)
      ),
    [filteredDfaData]
  );
  const dayLabels = useMemo(
    () => campaignDays.map((_, idx) => `Day ${idx + 1}`),
    [campaignDays]
  );

  // Aggregate data
  const regionData = useMemo(() => {
    const regionMap = {};
    filteredDfaData.forEach((item) => {
      const key = `${item.state}|${item.region}`;
      if (!regionMap[key]) {
        regionMap[key] = {
          state: item.state || "Unknown",
          region: item.region || "Unknown",
          days: {},
        };
      }
      const dayIdx = campaignDays.indexOf(item.campaign_day);
      const dayLabel = `Day ${dayIdx + 1}`;
      if (!regionMap[key].days[dayLabel]) {
        regionMap[key].days[dayLabel] = { "0_11": 0, "12_59": 0 };
      }
      regionMap[key].days[dayLabel]["0_11"] +=
        Number(item.vacinated_0_11_zero_occurence || 0) +
        Number(item.vacinated_0_11_multiple_occurence || 0);
      regionMap[key].days[dayLabel]["12_59"] +=
        Number(item.vacinated_12_59_zero_occurence || 0) +
        Number(item.vacinated_12_59_multiple_occurence || 0);
    });
    return Object.values(regionMap);
  }, [filteredDfaData, campaignDays]);

  // Grand totals
  const grandTotals = useMemo(() => {
    const totals = {};
    dayLabels.forEach((day) => {
      totals[day] = { "0_11": 0, "12_59": 0 };
      regionData.forEach((item) => {
        totals[day]["0_11"] += item.days[day]?.["0_11"] || 0;
        totals[day]["12_59"] += item.days[day]?.["12_59"] || 0;
      });
    });
    return totals;
  }, [regionData, dayLabels]);

  // Check if at least one filter is selected
  const isFilterSelected = selectedProjectId !== "" || selectedFormId !== "";

  // Render message if no filters are selected
  if (!isFilterSelected) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
          Number of Children Vaccinated by Campaign Day per Region
        </h3>
        <div className="text-center text-red-600 font-medium">
          Please select a Project ID or Form ID in Report Configuration
        </div>
      </div>
    );
  }

  // Render no data message if filteredDfaData is empty
  if (!filteredDfaData || filteredDfaData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4 text-center">
          Number of Children Vaccinated by Campaign Day per Region
        </h3>
        <div className="text-center text-red-600 font-medium">
          No data available for selected filters
        </div>
      </div>
    );
  }

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "portrait" });
      doc.setFont("helvetica", "normal");

      const tableColumn = ["State", "Region"];
      dayLabels.forEach((day) => {
        tableColumn.push(`${day} (0-11)`, `${day} (12-59)`);
      });

      const tableRows = regionData.map((item) => {
        const row = [item.state, item.region];
        dayLabels.forEach((day) => {
          row.push(item.days[day]?.["0_11"] || 0, item.days[day]?.["12_59"] || 0);
        });
        return row;
      });

      // Add grand total row
      const grandTotalRow = ["Grand Total", ""];
      dayLabels.forEach((day) => {
        grandTotalRow.push(grandTotals[day]["0_11"], grandTotals[day]["12_59"]);
      });
      tableRows.push(grandTotalRow);

      doc.text("Number of Children Vaccinated by Campaign Day per Region", 14, 15);
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        headStyles: { fillColor: "#F3F4F6", textColor: "#1F2937" },
        alternateRowStyles: { fillColor: "#F9FAFB" },
        styles: { cellPadding: 2, fontSize: 10, lineColor: "#D1D5DB", lineWidth: 0.1 },
        margin: { top: 20 },
      });

      const date = new Date().toISOString().split("T")[0];
      doc.save(`children_vaccinated_by_region_${date}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please check the console for details.");
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const wsData = [
        ["State", "Region", ...dayLabels.flatMap((day) => [`${day} (0-11)`, `${day} (12-59)`])],
      ];

      regionData.forEach((item) => {
        const row = [item.state, item.region];
        dayLabels.forEach((day) => {
          row.push(item.days[day]?.["0_11"] || 0, item.days[day]?.["12_59"] || 0);
        });
        wsData.push(row);
      });

      // Add grand total row
      const grandTotalRow = ["Grand Total", ""];
      dayLabels.forEach((day) => {
        grandTotalRow.push(grandTotals[day]["0_11"], grandTotals[day]["12_59"]);
      });
      wsData.push(grandTotalRow);

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = wsData[0].map((_, idx) => ({ wch: idx < 2 ? 20 : 15 }));

      // Style header and grand total row
      const headerRange = XLSX.utils.decode_range(ws["!ref"]);
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        ws[cellAddress] = {
          v: wsData[0][col],
          s: {
            fill: { fgColor: { rgb: "F3F4F6" } },
            font: { bold: true },
            color: { rgb: "1F2937" },
            border: {
              top: { style: "thin", color: { rgb: "D1D5DB" } },
              bottom: { style: "thin", color: { rgb: "D1D5DB" } },
              left: { style: "thin", color: { rgb: "D1D5DB" } },
              right: { style: "thin", color: { rgb: "D1D5DB" } },
            },
          },
        };
      }
      const grandTotalRowIdx = wsData.length - 1;
      for (let col = 0; col < wsData[0].length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: grandTotalRowIdx, c: col });
        ws[cellAddress] = {
          v: wsData[grandTotalRowIdx][col],
          s: {
            fill: { fgColor: { rgb: "F3F4F6" } },
            font: { bold: true },
            border: {
              top: { style: "thin", color: { rgb: "D1D5DB" } },
              bottom: { style: "thin", color: { rgb: "D1D5DB" } },
              left: { style: "thin", color: { rgb: "D1D5DB" } },
              right: { style: "thin", color: { rgb: "D1D5DB" } },
            },
          },
        };
      }

      XLSX.utils.book_append_sheet(wb, ws, "ChildrenVaccinated");
      const date = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `children_vaccinated_by_region_${date}.xlsx`);
    } catch (error) {
      console.error("Excel export failed:", error);
      alert("Failed to export Excel. Please check the console for details.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-5xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-blue-700 text-center w-full">
          Number of Children Vaccinated by Campaign Day per Region
        </h3>
      </div>
      <div className="flex justify-end mb-4 space-x-2">
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
      <div ref={tableRef} className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border border-gray-300">State</th>
              <th className="py-2 px-4 border border-gray-300">Region</th>
              {dayLabels.map((day, idx) => (
                <React.Fragment key={day}>
                  <th className="py-2 px-4 border border-gray-300">{`${day} (0-11)`}</th>
                  <th className="py-2 px-4 border border-gray-300">{`${day} (12-59)`}</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {regionData.map((row, idx) => (
              <tr
                key={`${row.state}-${row.region}-${idx}`}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="py-2 px-4 border border-gray-300">{row.state}</td>
                <td className="py-2 px-4 border border-gray-300">{row.region}</td>
                {dayLabels.map((day) => (
                  <React.Fragment key={day}>
                    <td className="py-2 px-4 border border-gray-300">
                      {row.days[day]?.["0_11"] || 0}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      {row.days[day]?.["12_59"] || 0}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
            <tr className="bg-gray-100 font-semibold">
              <td className="py-2 px-4 border border-gray-300" colSpan={2}>
                GRAND TOTAL
              </td>
              {dayLabels.map((day) => (
                <React.Fragment key={day}>
                  <td className="py-2 px-4 border border-gray-300">
                    {grandTotals[day]["0_11"]}
                  </td>
                  <td className="py-2 px-4 border border-gray-300">
                    {grandTotals[day]["12_59"]}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChildrenVaccinatedByRegion;