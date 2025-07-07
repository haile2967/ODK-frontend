import React, { useState } from "react";
import NationManagementPage from "./NationCard";
import StateManagementPage from "./StateCard";
import RegionManagementPage from "./RegionCard";
import DistrictManagementPage from "./DistrictCard";

function GeographicalHierarchy() {
  const [activeCard, setActiveCard] = useState(null);

  if (activeCard) {
    const cardComponents = {
      Nation: NationManagementPage,
      State: StateManagementPage,
      Region: RegionManagementPage,
      District: DistrictManagementPage,
    };
    const ActiveCard =
      cardComponents[activeCard] ||
      (() => <div className="text-gray-600">Invalid card</div>);

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-blue-700">{activeCard}</h2>
        </header>
        <main className="p-6">
          <button
            onClick={() => setActiveCard(null)}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back
          </button>
          <ActiveCard />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-blue-700" mb-8>
          Geographical Hierarchy
        </h2>
      </header>
      <main className="p-6">
        <p className="text-gray-700 mb-6">
          This section will manage the geographical hierarchy (states,
          districts, regions and nation).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: "Nation",
              title: "Nation",
              description: "Configure national-level settings and identifiers.",
            },
            {
              key: "State",
              title: "State",
              description: "Configure state-level settings and identifiers.",
            },
            {
              key: "Region",
              title: "Region",
              description: "Configure region-level settings and identifiers.",
            },
            {
              key: "District",
              title: "District",
              description: "Configure district-level settings and identifiers.",
            },
          ].map(({ key, title, description }) => (
            <div
              key={key}
              onClick={() => setActiveCard(key)}
              className="bg-white p-6 rounded-lg shadow hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default GeographicalHierarchy;
