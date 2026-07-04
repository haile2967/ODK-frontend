import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TableCellsIcon, UserGroupIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { Row, Col, Card, Button, Typography } from 'antd';

const { Title, Text } = Typography;

function VaccinationReport() {
  const navigate = useNavigate();
  const { selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Debug: Log current path and selections
  console.log("Rendering VaccinationReport at", window.location.pathname);
  console.log("Selected Project ID:", selectedProjectId);
  console.log("Selected Form ID:", selectedFormId);

  // // Check if at least one filter is selected
  // const isFilterSelected = selectedProjectId !== "" || selectedFormId !== "";

  // // Render message if no filters are selected
  // if (!isFilterSelected) {
  //   return (
  //     <div className="p-4 max-w-5xl mx-auto">
  //       <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Vaccination Reports</h2>
  //       <div className="text-center text-red-600 font-medium">
  //         Please select a Project ID or Form ID in Report Configuration
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Vaccination Reports</h2>
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Selected Project ID:</span>{" "}
          {selectedProjectId || selectedProjectId === "all" ? selectedProjectId : "None"}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Selected Form ID:</span>{" "}
          {selectedFormId || selectedFormId === "all" ? selectedFormId : "None"}
        </p>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 min-h-[180px] ${hoveredCard === 'Regional Vaccination Summary Report' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/vaccination_report/regional_summary')}
            onMouseEnter={() => setHoveredCard('Regional Vaccination Summary Report')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start p-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <TableCellsIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">Regional Vaccination Summary Report</Title>
                <Text type="secondary" className="block mb-2">
                  View vaccination report summarized by region.
                </Text>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vaccination_report/regional_summary');
                  }}
                >
                  View report →
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 min-h-[180px] ${hoveredCard === 'Daily Vaccinated Children Report' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/vaccination_report/children_vaccinated')}
            onMouseEnter={() => setHoveredCard('Daily Vaccinated Children Report')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start p-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">Daily Vaccinated Children Report</Title>
                <Text type="secondary" className="block mb-2">
                  Explore the total number of children vaccinated in different age groups.
                </Text>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vaccination_report/children_vaccinated');
                  }}
                >
                  View report →
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 min-h-[180px] ${hoveredCard === 'Vaccinated Children Proportion Report' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/vaccination_report/zero_dose')}
            onMouseEnter={() => setHoveredCard('Vaccinated Children Proportion Report')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start p-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <ChartPieIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">Vaccinated Children Proportion Report</Title>
                <Text type="secondary" className="block mb-2">
                  Analyze the number and proportion of vaccinated and unvaccinated children.
                </Text>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vaccination_report/zero_dose');
                  }}
                >
                  View report →
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default VaccinationReport;