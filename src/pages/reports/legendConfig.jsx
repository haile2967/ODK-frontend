export const legendRules = [
  { color: "Green", range: "100%", min: 100, max: 100, className: "bg-green-600 text-white" },
  { color: "Light Green", range: "90% – 99%", min: 90, max: 99, className: "bg-green-300 text-gray-800" },
  { color: "Yellow", range: "70% – 89%", min: 70, max: 89, className: "bg-yellow-400 text-gray-800" },
  { color: "Light Yellow", range: "50% – 69%", min: 50, max: 69, className: "bg-yellow-200 text-gray-800" },
  { color: "Red", range: "Below 50%", min: 0, max: 49, className: "bg-red-600 text-white" },
  { color: "Red Text", range: "Above 100%", min: 101, max: Infinity, className: "bg-red-50 text-red-600" },
];

export const legendRules2 = [
  { color: "Purple", range: "Negative or Zero", min: -Infinity, max: 0, className: "bg-purple-600 text-white" },
  { color: "Blue Gray", range: "Positive", min: 0, max: Infinity, className: "bg-blue-300 text-gray-800" },
];

export const legendRules3 = [
  { color: "Green", range: "0% – 5%", min: 0, max: 5, className: "bg-green-600 text-white" },
  { color: "Yellow", range: "5% – 15%", min: 5.01, max: 15, className: "bg-yellow-400 text-gray-800" },
  { color: "Red", range: "15% – 30%", min: 15.01, max: 30, className: "bg-red-600 text-white" },
  { color: "Dark Red", range: "30% – 100%", min: 30.01, max: 100, className: "bg-red-800 text-white" },
];

export const legendRules4 = [
  { color: "Green", range: "0% – 9%", min: 0, max: 9, className: "bg-green-600 text-white", description: "Vaccine use is efficient with minimal waste." },
  { color: "Yellow", range: "10% – 14%", min: 10, max: 14, className: "bg-yellow-400 text-gray-800", description: "Acceptable level" },
  { color: "Red", range: "15% and up", min: 15, max: Infinity, className: "bg-red-600 text-white", description: "Too much wastage;" },
];
