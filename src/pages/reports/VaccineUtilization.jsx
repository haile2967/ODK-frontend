import React, { useState } from "react";
import VaccineUtilizationCard from "./VaccineUtilizationCard";
import WastageRatesCard from "./WastageRatesCard";
import DistrictZeroDosesCard from "./DistrictZeroDosesCard";

function VaccineUtilization() {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setActiveCard(null)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          >
              {/* Simple back arrow */}
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="mr-2">
            <path d="M12.5 16L7.5 10L12.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
    
          </button>
        </div>
        {activeCard === "VaccineUtilization" && <VaccineUtilizationCard />}
        {activeCard === "WastageRates" && <WastageRatesCard />}
        {activeCard === "ZeroDoses" && <DistrictZeroDosesCard />}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Vaccine Utilization</h2>
      <div className="flex gap-6 flex-wrap">
        <button
          className="bg-blue-100 border border-blue-300 rounded-lg p-6 cursor-pointer hover:bg-blue-200 flex-1 min-w-[250px] text-center"
          onClick={() => setActiveCard("VaccineUtilization")}
        >
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Vaccine Utilization and Wastage Rates (%) by Region</h3>
          <p className="text-gray-700 mb-2">
            View vaccine utilization and wastage rates summarized by region. Click to see detailed utilization metrics and wastage percentages.
          </p>
          <p className="text-xs text-blue-700">
            This report helps you monitor and optimize vaccine usage across regions.
          </p>
        </button>
        <button
          className="bg-green-100 border border-green-300 rounded-lg p-6 cursor-pointer hover:bg-green-200 flex-1 min-w-[250px] text-center"
          onClick={() => setActiveCard("WastageRates")}
        >
          <h3 className="text-lg font-semibold mb-2 text-green-800">DFAs with high Negative wastage rate and high percentage of Zero doses</h3>
          <p className="text-gray-700 mb-2">
            View DFAs with high negative wastage rates and high zero-dose percentages. Click to analyze and address potential issues.
          </p>
          <p className="text-xs text-green-800">
            This report helps identify areas needing intervention for vaccine distribution.
          </p>
        </button>
        <button
          className="bg-green-100 border border-green-300 rounded-lg p-6 cursor-pointer hover:bg-green-200 flex-1 min-w-[250px] text-center"
          onClick={() => setActiveCard("ZeroDoses")}
        >
          <h3 className="text-lg font-semibold mb-2 text-green-800">Zero Doses and Wastage Rates by District</h3>
          <p className="text-gray-700 mb-2">
            View zero-dose percentages (total and 0-11 months), doses used, and wastage rates by district. Click to explore detailed vaccine utilization data.
          </p>
          <p className="text-xs text-green-800">
           This report highlights districts with high zero-dose rates to prioritize vaccination efforts.
          </p>
        </button>
      </div>
    </div>
  );
}

export default VaccineUtilization;