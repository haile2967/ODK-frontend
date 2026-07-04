import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { Row, Col, Card, Button, Typography } from 'antd';

const { Title, Text } = Typography;

function ComplianceReportCards() {
  const navigate = useNavigate();
  const { selectedProjectId, selectedFormId } = useSelector((state) => state.coverageReport);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Debug: Log current path and selections
  console.log("Rendering ComplianceReportCards at", window.location.pathname);
  console.log("Selected Project ID:", selectedProjectId);
  console.log("Selected Form ID:", selectedFormId);

  // // Check if at least one filter is selected
  // const isFilterSelected = selectedProjectId !== "" || selectedFormId !== "";

  // // Render message if no filters are selected
  // if (!isFilterSelected) {
  //   return (
  //     <div className="p-4 max-w-5xl mx-auto">
  //       <h2 className="text-2xl font-bold mb-6 text-gray-800">Compliance Reports</h2>
  //       <div className="text-center text-red-600 font-medium">
  //         Please select a Project ID or Form ID in Report Configuration
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Compliance Reports</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 ${hoveredCard === 'Report Compliance by Region' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/compliance_report/region')}
            onMouseEnter={() => setHoveredCard('Report Compliance by Region')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <MapPinIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">Report Compliance by Region</Title>
                <Text type="secondary" className="block mb-2">
                  View compliance report summarized by region. 
                </Text>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/compliance_report/region');
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
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 ${hoveredCard === 'Report Compliance by District' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => navigate('/compliance_report/district')}
            onMouseEnter={() => setHoveredCard('Report Compliance by District')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">Report Compliance by District</Title>
                <Text type="secondary" className="block mb-2">
                  View compliance report summarized by district. 
                </Text>
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/compliance_report/district');
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

export default ComplianceReportCards;