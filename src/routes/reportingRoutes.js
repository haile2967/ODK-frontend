import ComplianceReport from "../pages/reports/ComplianceReportCards.jsx";
import VacinationReport from "../pages/reports/VaccinationReport.jsx";
import VacineUtilization from "../pages/reports/VaccineUtilization.jsx";
import VacinationCoverage from "../pages/reports/VaccinationCoverage.jsx";
import Planning from "../pages/planning/planning.jsx";
export const reportingRoutes = [
  { path: "compliance_report", element: <ComplianceReport /> },
  { path: "vacination_report", element: <VacinationReport /> },
  { path: "vacine_utilization", element: <VacineUtilization /> },
  { path: "vacination_coverage", element: <VacinationCoverage /> },
  { path: "reports", element: <Planning /> },
];
