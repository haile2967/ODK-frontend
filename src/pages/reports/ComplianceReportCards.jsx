import React, { useState } from 'react';
import ReportByRegion from './ReportByRegion';
import ReportByDistrict from './ReportByDistrict';


function ComplianceReportCards() {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
         <button
          onClick={() => setActiveCard(null)}
          className="mb-4 flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          {/* Simple back arrow */}
          <svg width="18" height="18" fill="none" viewBox="0 0 20 20" className="mr-2">
            <path d="M12.5 16L7.5 10L12.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          
        </button>
        </div>
        {activeCard === 'Region' && <ReportByRegion />}
        {activeCard === 'District' && <ReportByDistrict />}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Compliance Reports</h2>
      <div className="flex gap-6 flex-wrap">
        <button
          className="bg-blue-100 border border-blue-300 rounded-lg p-6 cursor-pointer hover:bg-blue-200 flex-1 min-w-[250px] text-center"
          onClick={() => setActiveCard('Region')}
        >
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Report Compliance by Region</h3>
          <p className="text-gray-700 mb-2">
            View compliance report summarized by region. Click to see the number of teams assigned and participated, and daily compliance percentages for each region.
          </p>
          <p className="text-xs text-blue-700">
            This report helps you monitor and compare compliance across all regions.
          </p>
        </button>
        <button
          className="bg-green-100 border border-green-300 rounded-lg p-6 cursor-pointer hover:bg-green-200 flex-1 min-w-[250px] text-center"
          onClick={() => setActiveCard('District')}
        >
          <h3 className="text-lg font-semibold mb-2 text-green-800">Report Compliance by District</h3>
          <p className="text-gray-700 mb-2">
            View compliance report summarized by district. Click to see the number of teams assigned and participated, and daily compliance percentages for each district.
          </p>
          <p className="text-xs text-green-800">
            This report helps you monitor and compare compliance at the district level.
          </p>
        </button>
      </div>
    </div>
  );
}

export default ComplianceReportCards;