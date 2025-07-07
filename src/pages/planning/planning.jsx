import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col } from 'antd';
import { ArrowLeftOutlined, ApiOutlined, CheckOutlined} from '@ant-design/icons';
import SubmissionVariableMapping from './SubmissionVariableMapping';
import PreparednessCheckListProcessing from './PreparednessCheckListProcessing';

const { Title, Text } = Typography;

function Planning() {
  const [activeCard, setActiveCard] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  if (activeCard) {
    const cardComponents = {
      'Submission Variable Mapping': (props) => (
        <SubmissionVariableMapping onBack={() => setActiveCard(null)} {...props} />
      ),
      'Preparedness CheckList Processing': (props) => (
        <PreparednessCheckListProcessing onBack={() => setActiveCard(null)} {...props} />
      ),
    };

    const ActiveCard = cardComponents[activeCard] || (() => <div className="text-gray-600">Invalid card</div>);

    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setActiveCard(null)}
            className="mr-2 flex items-center justify-center"
            style={{ width: 40, height: 40 }}
          />
          <Title level={2} className="text-blue-700 mb-0">{activeCard}</Title>
        </div>
        <ActiveCard />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <Title level={2} className="text-blue-700 mb-2">Planning Dashboard</Title>
      <Text type="secondary" className="block mb-6">
        Manage your vaccination campaign configurations and preparations
      </Text>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 ${hoveredCard === 'Submission Variable Mapping' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => setActiveCard('Submission Variable Mapping')}
            onMouseEnter={() => setHoveredCard('Submission Variable Mapping')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <ApiOutlined className="text-blue-600 text-xl" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">Submission Variable Mapping</Title>
                <Text type="secondary" className="block mb-2">
                  Configure and map variables for vaccination data submissions.
                </Text>
                <Button 
                  type="link" 
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCard('Submission Variable Mapping');
                  }}
                >
                  Configure now →
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            className={`bg-white rounded-lg shadow-sm transition-all duration-300 cursor-pointer border-l-4 ${hoveredCard === 'Preparedness CheckList Processing' ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => setActiveCard('Preparedness CheckList Processing')}
            onMouseEnter={() => setHoveredCard('Preparedness CheckList Processing')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-start">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <CheckOutlined className="text-green-600 text-xl" />
              </div>
              <div>
                <Title level={4} className="text-gray-900 mb-2">Preparedness Checklist Processing</Title>
                <Text type="secondary" className="block mb-2">
                  Upload and manage preparedness checklists for vaccination campaigns.
                </Text>
                <Button 
                  type="link" 
                  className="p-0 text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCard('Preparedness CheckList Processing');
                  }}
                >
                  Manage checklists →
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Planning;