import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { legendRules } from "../pages/reports/legendConfig";

// Function to determine color class based on percentage using legendRules (mirrors web logic)
const getColorClass = (percent) => {
  const numPercent = parseFloat(percent) || 0;
  const rule = legendRules.find((r) => numPercent >= r.min && numPercent <= r.max);
  return rule ? rule.className : "";
};

// Map legendRules className to hex colors for PDF and Excel
const getColorHex = (percent) => {
  const colorClass = getColorClass(percent);
  const colorMap = {
    "bg-green-500": "#22C55E",
    "bg-lime-300": "#A3E635",
    "bg-yellow-300": "#FACC15",
    "bg-orange-300": "#F97316",
    "bg-red-500": "#EF4444",
    "bg-purple-500": "#A855F7",
    "": "#FFFFFF", // Default for no match
  };
  return colorMap[colorClass] || "#FFFFFF";
};

// Export to PDF
export const exportToPDF = (regionData, dayLabels, grandTotalAssigned, grandTotalPerDay) => {
  try {
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: "portrait" });
    doc.setFont("helvetica", "normal");

    const tableColumn = ["State", "Region", "Number of Teams"];
    dayLabels.forEach((day) => {
      tableColumn.push(day);
      tableColumn.push(`% of reported ${day}`);
    });
    const tableRows = [];

    // Add region data
    regionData.forEach((item) => {
      const rowData = [
        item.state,
        item.region,
        item.teams_assigned_per_day[dayLabels[0]] || 0,
      ];
      dayLabels.forEach((day) => {
        const participated = item.teams_per_day[day] || 0;
        const assigned = item.teams_assigned_per_day[dayLabels[0]] || 0;
        const percent = assigned > 0 ? ((participated / assigned) * 100).toFixed(1) : "0";
        rowData.push(participated, `${percent}%`);
      });
      tableRows.push(rowData);
    });

    // Add grand total row
    const grandTotalRow = ["Grand Total", "", grandTotalAssigned];
    dayLabels.forEach((day) => {
      const participated = grandTotalPerDay[day] || 0;
      const percent = grandTotalAssigned > 0 ? ((participated / grandTotalAssigned) * 100).toFixed(1) : "0";
      grandTotalRow.push(participated, `${percent}%`);
    });
    tableRows.push(grandTotalRow);

    // Debug: Log colors being applied
    console.log("Applying colors:", tableRows.map(row => row.map((cell, idx) => idx % 2 === 1 && idx >= 3 ? getColorHex(cell.replace("%", "")) : null).filter(Boolean)));

    // Define column styles for percentage columns
    const columnStyles = {};
    dayLabels.forEach((_, idx) => {
      const percentCol = 3 + idx * 2 + 1; // Percentage columns (4, 6, 8, ...)
      columnStyles[percentCol] = {
        cellWidth: 20,
        fillColor: (rowIndex) => {
          const percent = parseFloat(tableRows[rowIndex][percentCol].replace("%", "")) || 0;
          const color = getColorHex(percent);
          console.log(`Row ${rowIndex}, Col ${percentCol}, Percent ${percent}, Color ${color}`);
          return color;
        },
      };
    });

    // Generate table with styling
    doc.text("Reporting compliance by region", 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      columnStyles,
      headStyles: { fillColor: "#F3F4F6", textColor: "#1F2937" },
      alternateRowStyles: { fillColor: "#F9FAFB" },
      styles: { cellPadding: 2, fontSize: 10, lineColor: "#D1D5DB", lineWidth: 0.1 },
      margin: { top: 20 },
    });

    const date = new Date().toISOString().split("T")[0];
    doc.save(`report_by_region_${date}.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    console.error("Error stack:", error.stack);
    alert("Failed to export PDF. Please check the console for details.");
  }
};

// Export to Excel
export const exportToExcel = (regionData, dayLabels, grandTotalAssigned, grandTotalPerDay) => {
  try {
    const wb = XLSX.utils.book_new();
    const wsData = [];

    // Add headers
    const headers = ["State", "Region", "Number of Teams"];
    dayLabels.forEach((day) => {
      headers.push(day);
      headers.push(`% of reported ${day}`);
    });
    wsData.push(headers);

    // Add region data
    regionData.forEach((item) => {
      const row = [
        item.state,
        item.region,
        item.teams_assigned_per_day[dayLabels[0]] || 0,
      ];
      dayLabels.forEach((day) => {
        const participated = item.teams_per_day[day] || 0;
        const assigned = item.teams_assigned_per_day[dayLabels[0]] || 0;
        const percent = assigned > 0 ? ((participated / assigned) * 100).toFixed(1) : "0";
        row.push(participated, `${percent}%`);
      });
      wsData.push(row);
    });

    // Add grand total row
    const grandTotalRow = ["Grand Total", "", grandTotalAssigned];
    dayLabels.forEach((day) => {
      const participated = grandTotalPerDay[day] || 0;
      const percent = grandTotalAssigned > 0 ? ((participated / grandTotalAssigned) * 100).toFixed(1) : "0";
      grandTotalRow.push(participated, `${percent}%`);
    });
    wsData.push(grandTotalRow);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Apply styles for percentage columns using getColorHex
    dayLabels.forEach((_, idx) => {
      const percentCol = String.fromCharCode(68 + idx * 2); // D, F, H, etc. (3 + idx * 2)
      wsData.forEach((row, rowIdx) => {
        if (rowIdx === 0) return; // Skip header
        const cellAddress = `${percentCol}${rowIdx + 1}`;
        const percent = parseFloat(row[3 + idx * 2 + 1].replace("%", "")) || 0;
        const colorHex = getColorHex(percent);
        ws[cellAddress] = {
          v: row[3 + idx * 2 + 1],
          s: {
            fill: { fgColor: { rgb: colorHex.replace("#", "") } },
            border: {
              top: { style: "thin", color: { rgb: "D1D5DB" } },
              bottom: { style: "thin", color: { rgb: "D1D5DB" } },
              left: { style: "thin", color: { rgb: "D1D5DB" } },
              right: { style: "thin", color: { rgb: "D1D5DB" } },
            },
          },
        };
      });
    });

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
    for (let col = 0; col < headers.length; col++) {
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

    // Set column widths
    ws["!cols"] = headers.map((_, idx) => ({
      wch: idx < 2 ? 20 : 15, // Wider for State and Region
    }));

    XLSX.utils.book_append_sheet(wb, ws, "ReportByRegion");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `report_by_region_${date}.xlsx`);
  } catch (error) {
    console.error("Excel export failed:", error);
    alert("Failed to export Excel. Please check the console for details.");
  }
};