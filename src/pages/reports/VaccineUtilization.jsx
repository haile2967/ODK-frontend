import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChartBarIcon, ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Row, Col, Card, Button, Typography } from 'antd';

const { Title, Text } = Typography;

function VaccineUtilization() {
  const navigate = useNavigate();
  const { selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Debug: Log current path and selections
  console.log("Rendering VaccineUtilization at", window.location.pathname);
  console.log("Selected Project ID:", selectedProjectId);
  console.log("Selected Form ID:", selectedFormId);

  // // Check if at least one filter is selected
  // const isFilterSelected = selectedProjectId !== "" || selectedFormId !== "";

  // // Render message if no filters are selected
  // if (!isFilterSelected) {
  //   return (
  //     <div className="p-4 max-w-5xl mx-auto">
  //       <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Vaccine Utilization Report</h2>
  //       <div className="text-center text-red-600 font-medium">
  //         Please select a Project ID or Form ID in Report Configuration
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Vaccine Utilization Report</h2>
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
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 min-h-[180px] ${hoveredCard === 'Vaccine Utilization and Wastage Rates by Region' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/vaccine_utilization/utilization')}
            onMouseEnter={() => setHoveredCard('Vaccine Utilization and Wastage Rates by Region')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start p-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">Vaccine Utilization and Wastage Rates by Region</Title>
                <Text type="secondary" className="block mb-2">
                  View vaccine utilization and wastage rates summarized by region. Click for details.
                </Text>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vaccine_utilization/utilization');
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
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 min-h-[180px] ${hoveredCard === 'DFAs with High Negative Wastage & Zero Doses' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/vaccine_utilization/wastage')}
            onMouseEnter={() => setHoveredCard('DFAs with High Negative Wastage & Zero Doses')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start p-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">DFAs with High Negative Wastage & Zero Doses</Title>
                <Text type="secondary" className="block mb-2">
                  View DFAs with high negative wastage and zero-dose rates. Click to analyze.
                </Text>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vaccine_utilization/wastage');
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
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 min-h-[180px] ${hoveredCard === 'District Zero Doses Report' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/vaccine_utilization/zero-doses')}
            onMouseEnter={() => setHoveredCard('District Zero Doses Report')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start p-4">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">District Zero Doses Report</Title>
                <Text type="secondary" className="block mb-2">
                  View zero-dose rates summarized by district. Click for details.
                </Text>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/vaccine_utilization/zero-doses');
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

export default VaccineUtilization;