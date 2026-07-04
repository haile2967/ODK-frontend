import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPinIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Row, Col, Card, Button, Typography } from 'antd';

const { Title, Text } = Typography;

function VaccinationCoverage() {
  const navigate = useNavigate();
  const { selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Debug: Log current path and selections
  console.log("Rendering VaccinationCoverage at", window.location.pathname);
  console.log("Selected Project ID:", selectedProjectId);
  console.log("Selected Form ID:", selectedFormId);

  // // Check if at least one filter is selected
  // const isFilterSelected = selectedProjectId !== "" || selectedFormId !== "";

  // // Render message if no filters are selected
  // if (!isFilterSelected) {
  //   return (
  //     <div className="p-4 max-w-5xl mx-auto">
  //       <h2 className="text-2xl font-bold mb-6 text-gray-800">Vaccination Coverage</h2>
  //       <div className="text-center text-red-600 font-medium">
  //         Please select a Project ID or Form ID in Report Configuration
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Vaccination Coverage</h2>
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
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 min-h-[180px] ${hoveredCard === 'Vaccination Coverage-RCA' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/vaccination_coverage/rca')}
            onMouseEnter={() => setHoveredCard('Vaccination Coverage-RCA')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start p-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="h-[120px] flex flex-col justify-between">
                <div>
                  <Title level={4} className="text-gray-900 mb-2">Vaccination Coverage-RCA</Title>
                  <Text type="secondary" className="block mb-2">
                    View vaccination coverage data aggregated by region.
                  </Text>
                </div>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vaccination_coverage/rca');
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
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 min-h-[180px] ${hoveredCard === 'Vaccination Coverage Source of RCA Data' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/vaccination_coverage/source-rca-data')}
            onMouseEnter={() => setHoveredCard('Vaccination Coverage Source of RCA Data')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start p-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="h-[120px] flex flex-col justify-between">
                <div>
                  <Title level={4} className="text-gray-900 mb-2">Vaccination Coverage Source of RCA Data</Title>
                  <Text type="secondary" className="block mb-2">
                    Explore the sources of RCA data for vaccination coverage.
                  </Text>
                </div>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vaccination_coverage/source-rca-data');
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

export default VaccinationCoverage;