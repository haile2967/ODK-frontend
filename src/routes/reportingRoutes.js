
import ComplianceReport from '../pages/reports/ComplianceReportCards.jsx';
import ReportByRegion from '../pages/reports/ReportByRegion.jsx';
import ReportByDistrict from '../pages/reports/ReportByDistrict.jsx';
import VaccinationReport from '../pages/reports/VaccinationReport.jsx';
import RegionalSummaryTable from '../pages/reports/RegionalSummaryTable.jsx';
import ChildrenVaccinatedByRegion from '../pages/reports/ChildrenVaccinatedByRegion.jsx';
import ZeroDoseByRegion from '../pages/reports/ZeroDoseByRegion.jsx';
import VaccineUtilization from '../pages/reports/VaccineUtilization.jsx';
import VaccineUtilizationCard from '../pages/reports/VaccineUtilizationCard.jsx';
import WastageRatesCard from '../pages/reports/WastageRatesCard.jsx';
import DistrictZeroDosesCard from '../pages/reports/DistrictZeroDosesCard.jsx';
import VaccinationCoverage from '../pages/reports/VaccinationCoverage.jsx';
import VaccinationCoverageRCA from '../pages/reports/VaccinationCoverageRCA.jsx';
import VaccinationCoverageSourceRCADATA from '../pages/reports/VaccinationCoverageSourceRCADATA.jsx';
import ReportConfiguration from '../pages/reports/ReportConfiguration.jsx'; // Added
import Planning from '../pages/planning/planning.jsx';


export const reportingRoutes = [
  { path: 'compliance_report', element: <ComplianceReport /> },
  { path: 'compliance_report/region', element: <ReportByRegion /> },
  { path: 'compliance_report/district', element: <ReportByDistrict /> },
  { path: 'vacination_report', element: <VaccinationReport /> },
  { path: 'vaccination_report/regional_summary', element: <RegionalSummaryTable /> },
  { path: 'vaccination_report/children_vaccinated', element: <ChildrenVaccinatedByRegion /> },
  { path: 'vaccination_report/zero_dose', element: <ZeroDoseByRegion /> },
  { path: 'report-config', element: <ReportConfiguration /> },
  { path: 'vacine_utilization', element: <VaccineUtilization /> },
  { path: 'vaccine_utilization/utilization', element: <VaccineUtilizationCard /> },
  { path: 'vaccine_utilization/wastage', element: <WastageRatesCard /> },
  { path: 'vaccine_utilization/zero-doses', element: <DistrictZeroDosesCard /> },
  { path: 'vacination_coverage', element: <VaccinationCoverage /> },
  { path: 'vaccination_coverage/rca', element: <VaccinationCoverageRCA /> },
  { path: 'vaccination_coverage/source-rca-data', element: <VaccinationCoverageSourceRCADATA /> },

  { path: 'reports', element: <Planning /> },
];
