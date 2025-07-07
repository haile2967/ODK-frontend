import React, { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import MetadataFetcherCard from './MetadataFetcherCard';
import DFAFetcherCard from './DFAFetcherCard';
import TeamFetcherCard from './TeamFetcherCard';
import FormManagementCard from './FormManagementCard';
import MergingCard from './MergingCard';
import DataCleaningCard from './DataCleaningCard';

function ODKDataProcessing() {
  const [activeCard, setActiveCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const cardConfig = [
    {
      name: 'Form Management',
      component: FormManagementCard,
      description: 'Handling form fields.',
      color: 'from-blue-500 to-blue-700',
      icon: '📋',
    },
    {
      name: 'Metadata Analysis',
      component: MetadataFetcherCard,
      description: 'Display metadata.',
      color: 'from-emerald-500 to-emerald-700',
      icon: '🔍',
    },
    {
      name: 'DFA Data Analysis',
      component: DFAFetcherCard,
      description: 'Display DFA data.',
      color: 'from-violet-500 to-violet-700',
      icon: '📊',
    },
    {
      name: 'Team Data Analysis',
      component: TeamFetcherCard,
      description: 'Display Team data.',
      color: 'from-amber-500 to-amber-700',
      icon: '👥',
    },
    {
      name: 'Merging',
      component: MergingCard,
      description: 'Merge Team data and DFA data.',
      color: 'from-teal-500 to-teal-700',
      icon: '🔄',
    },
    {
      name: 'Data Cleaning',
      component: DataCleaningCard,
      description: 'Apply cleaning rules to the merged data.',
      color: 'from-rose-500 to-rose-700',
      icon: '🧹',
    },
  ];

  if (activeCard) {
    const ActiveCard = cardConfig.find(card => card.name === activeCard)?.component || 
      (() => <div className="text-gray-600">Invalid card</div>);
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl ">
        <div className="flex items-center mb-6 ">
          <button
            onClick={() => setActiveCard(null)}
            className="flex items-center bg-white text-blue-600 px-4 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition-all duration-200 border border-blue-100 mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{activeCard}</h2>
        </div>
        <div>
          <ActiveCard />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">ODK Data Processing</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cardConfig.map((card) => (
          <button
            key={card.name}
            onClick={() => setActiveCard(card.name)}
            onMouseEnter={() => setHoveredCard(card.name)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`relative h-48 bg-gradient-to-br ${card.color} p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left flex flex-col justify-between overflow-hidden group`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{card.name}</h3>
                <p className="text-blue-50 mt-2 text-xs sm:text-sm opacity-90">{card.description}</p>
              </div>
              <span className="text-2xl sm:text-3xl opacity-80">{card.icon}</span>
            </div>
            <div className={`mt-4 text-white text-xs sm:text-sm font-medium transition-all duration-200 ${hoveredCard === card.name ? 'opacity-100' : 'opacity-0'}`}>
              Click to open →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ODKDataProcessing;