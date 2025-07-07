import React, { useState } from "react";
import VaccinationCoverageRCA from "./VaccinationCoverageRCA.jsx";
import VaccinationCoverageSourceRCADATA from "./VaccinationCoverageSourceRCADATA.jsx";

function VaccinationCoverage() {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard === "vaccination-coverage-rca") {
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
        <VaccinationCoverageRCA />
      </div>
    );
  }

  if (activeCard === "vaccination-coverage-source-rca-data") {
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
        <VaccinationCoverageSourceRCADATA />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Vaccination Coverage</h2>
      <div className="flex gap-6 flex-wrap">
        {/* Vaccination Coverage RCA Card */}
        <div
          className="bg-blue-100 border border-blue-300 rounded-lg p-6 flex-1 min-w-[250px] text-center cursor-pointer hover:bg-blue-200"
          onClick={() => setActiveCard("vaccination-coverage-rca")}
        >
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Vaccination Coverage-RCA</h3>
          <p className="text-gray-700 mb-2">
            View vaccination coverage data aggregated by region.
          </p>
          <p className="text-xs text-blue-700">
            Click to see regional coverage details.
          </p>
        </div>
        {/* Vaccination Coverage Source RCA Data Card */}
        <div
          className="bg-green-100 border border-green-300 rounded-lg p-6 flex-1 min-w-[250px] text-center cursor-pointer hover:bg-green-200"
          onClick={() => setActiveCard("vaccination-coverage-source-rca-data")}
        >
          <h3 className="text-lg font-semibold mb-2 text-green-800">Vaccination Coverage Source of RCA Data</h3>
          <p className="text-gray-700 mb-2">
            Explore the sources of RCA data for vaccination coverage.
          </p>
          <p className="text-xs text-green-800">
            Click to view detailed data sources.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VaccinationCoverage;