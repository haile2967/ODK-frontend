import React, { useState } from "react";
import RegionalSummaryTable from "./RegionalSummaryTable.jsx";
import ChildrenVaccinatedByRegion  from "./ChildrenVaccinatedByRegion.jsx";
import ZeroDoseByRegion from "./ZeroDoseByRegion.jsx";

function VaccinationReport() {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard === "regional-summary") {
    return (
      <div className="p-4">
        <button
          onClick={() => setActiveCard(null)}
          className="mb-4 flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="mr-2">
            <path d="M12.5 16L7.5 10L12.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <RegionalSummaryTable />
      </div>
    );
  }

  // Show ChildrenVaccinatedByRegion when that card is clicked
  if (activeCard === "children-vaccinated") {
    return (
      <div className="p-4">
        <button
          onClick={() => setActiveCard(null)}
          className="mb-4 flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="mr-2">
            <path d="M12.5 16L7.5 10L12.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <ChildrenVaccinatedByRegion />
      </div>
    );
  }
  if (activeCard === "number-proportion") {
    return (
      <div className="p-4">
        <button
          onClick={() => setActiveCard(null)}
          className="mb-4 flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="mr-2">
            <path d="M12.5 16L7.5 10L12.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <ZeroDoseByRegion />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Vaccination Reports</h2>
      <div className="flex gap-6 flex-wrap">
        {/* Regional Summary Card */}
        <div
          className="bg-blue-100 border border-blue-300 rounded-lg p-6 flex-1 min-w-[250px] text-center cursor-pointer hover:bg-blue-200"
          onClick={() => setActiveCard("regional-summary")}
        >
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Regional Summary Table</h3>
          <p className="text-gray-700 mb-2">
            View summary of vaccination data aggregated by region.
          </p>
          <p className="text-xs text-blue-700">
            Click to see regional totals and key indicators.
          </p>
        </div>
        {/* Number of Vaccinated Children Card */}
        <div
          className="bg-green-100 border border-green-300 rounded-lg p-6 flex-1 min-w-[250px] text-center cursor-pointer hover:bg-green-200"
          onClick={() => setActiveCard("children-vaccinated")}
        >
          <h3 className="text-lg font-semibold mb-2 text-green-800">Number of Vaccinated Children</h3>
          <p className="text-gray-700 mb-2">
            Explore the total number of children vaccinated in different age groups.
          </p>
          <p className="text-xs text-green-800">
            Click to view detailed vaccination counts.
          </p>
        </div>
        {/* Number and Proportion Card */}
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6 flex-1 min-w-[250px] text-center cursor-pointer hover:bg-yellow-200"
          onClick={() => setActiveCard("number-proportion")}
          >
          <h3 className="text-lg font-semibold mb-2 text-yellow-800">Number and Proportion</h3>
          <p className="text-gray-700 mb-2">
            Analyze the number and proportion of vaccinated and unvaccinated children.
          </p>
          <p className="text-xs text-yellow-800">
            Click to see proportions and breakdowns.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VaccinationReport;