import React, { useState } from "react";
import {
  Card,
  Button,
  Upload,
  Typography,
  Row,
  Col,
  Checkbox,
  Space,
  message,
  Divider,
  Popconfirm,
} from "antd";
import { UploadOutlined , SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import districtData from "./temp_district_data_summary.json";

const { Title, Text } = Typography;

const SubmissionVariableMapping = () => {
  const [uploadedVariables, setUploadedVariables] = useState([]);
  const [matchedVariables, setMatchedVariables] = useState({});
  const [selectedExcelVar, setSelectedExcelVar] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Handle file upload and extract columns
  const handleUpload = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Get the first row (headers) to extract column names
      const headers = [];
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
        const cell = worksheet[cellAddress];
        headers.push(cell ? cell.v : `Column ${C + 1}`);
      }

      const initialMatches = {};
      headers.forEach((excelVar) => {
        const matchedJsonVar = Object.keys(districtData[0]).find(
          (jsonVar) => jsonVar.toLowerCase() === excelVar.toLowerCase()
        );
        if (matchedJsonVar) {
          initialMatches[excelVar] = matchedJsonVar;
        }
      });

      setUploadedVariables(headers);
      setMatchedVariables(initialMatches);
      setFileList([file]);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      message.error("Failed to process file");
      console.error("File processing error:", error);
    }
  };

  // Handle delete uploaded file
  const handleDelete = () => {
    setUploadedVariables([]);
    setMatchedVariables({});
    setSelectedExcelVar(null);
    setFileList([]);
    message.success("Uploaded file cleared");
  };

  // Handle checkbox change for Excel variables
  const handleCheckboxChange = (excelVar, checked) => {
    if (checked) {
      setSelectedExcelVar(excelVar);
    } else {
      setSelectedExcelVar(null);
      if (matchedVariables[excelVar]) {
        setMatchedVariables((prev) => {
          const newMatches = { ...prev };
          delete newMatches[excelVar];
          return newMatches;
        });
      }
    }
  };

  // Handle matching a variable
  const handleMatch = (jsonVar) => {
    if (!selectedExcelVar) {
      message.warning("Please select an Excel variable to match");
      return;
    }
    setMatchedVariables((prev) => ({
      ...prev,
      [selectedExcelVar]: jsonVar,
    }));
    setSelectedExcelVar(null);
  };

  // Handle save mappings
  const handleSave = () => {
    const unmatchedCount = uploadedVariables.length - Object.keys(matchedVariables).length;
    if (unmatchedCount > 0) {
      message.warning(`You have ${unmatchedCount} unmatched variables.`);
      return;
    }
    message.success("Mappings saved successfully!");
    console.log("Saved mappings:", matchedVariables);
    // Add your save logic here
  };

  // Get unmatched JSON variables for the right panel
  const unmatchedJsonVariables = Object.keys(districtData[0]).filter(
    (jsonVar) => !Object.values(matchedVariables).includes(jsonVar)
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Title level={2} className="text-blue-700 mb-0">
          Matching Analysis
        </Title>
      </div>

      {/* Upload and Delete Buttons */}
      <Card className="mb-6">
        <Space>
          <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
          >
            <Button type="primary" icon={<UploadOutlined />} size="large">
              Upload File
            </Button>
          </Upload>
          {fileList.length > 0 && (
            <Popconfirm
              title="Are you sure you want to delete this upload?"
              description="This will clear all your mappings and uploaded data."
              onConfirm={handleDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="default"
                icon={<DeleteOutlined />}
                size="large"
                danger
              >
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
        {/* {uploadedVariables.length > 0 && (
          <Text type="secondary" className="block mt-2">
            {uploadedVariables.length} columns detected in {fileList[0]?.name}
          </Text>
        )} */}
      </Card>

      {uploadedVariables.length > 0 && (
        <>
          <Row gutter={[24, 24]}>
            {/* Left Side: Excel Variables - Wider column */}
            <Col xs={24} md={14}>
              <Card
                title="District Data Variables Summary"
                className="h-full"
                headStyle={{ backgroundColor: '#f0f2f5', borderBottom: '1px solid #d9d9d9' }}
              >
                <div className="grid grid-cols-12 gap-4 border-b py-2 font-semibold">
                  {/* <div className="col-span-1">Select</div> */}
                  <div className="col-span-6 row-span-2">Document Variables</div>
                  <div className="col-span-4">Matched Variables</div>
                  <div className="col-span-2">Action</div>
                </div>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    {uploadedVariables.map((excelVar) => (
                      <div
                        key={excelVar}
                        className={`grid grid-cols-12 gap-4 items-center p-2 border-b ${
                          matchedVariables[excelVar] ? "bg-green-50" : ""
                        }`}
                      >
                        <div className="col-span-1">
                          <Checkbox
                            checked={
                              matchedVariables[excelVar] ||
                              selectedExcelVar === excelVar
                            }
                            onChange={(e) =>
                              handleCheckboxChange(excelVar, e.target.checked)
                            }
                            disabled={!!matchedVariables[excelVar]}
                          />
                        </div>
                        <div className="col-span-5">
                          <Text
                            ellipsis={{ tooltip: excelVar }}
                            className={matchedVariables[excelVar] ? "font-medium" : ""}
                          >
                            {excelVar}
                          </Text>
                        </div>
                        <div className="col-span-4">
                          <Text
                            ellipsis={{ tooltip: matchedVariables[excelVar] || '' }}
                            type={matchedVariables[excelVar] ? undefined : "secondary"}
                          >
                            {matchedVariables[excelVar] || "-"}
                          </Text>
                        </div>
                        <div className="col-span-2">
                          {matchedVariables[excelVar] ? (
                            <Popconfirm
                              title="Are you sure you want to unmatch this variable?"
                              onConfirm={() => handleCheckboxChange(excelVar, false)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button danger size="small">
                                Unmatch
                              </Button>
                            </Popconfirm>
                          ) : (
                            <Text type="secondary">-</Text>
                          )}
                        </div>
                      </div>
                    ))}
                  </Space>
                </div>
              </Card>
            </Col>

            {/* Right Side: Database Variables - Narrower column */}
            <Col xs={24} md={10}>
              <Card
                title="Matching Potential Variables"
                className="h-full"
                headStyle={{ backgroundColor: '#f0f2f5', borderBottom: '1px solid #d9d9d9' }}
              >
                <div className="mb-4">
                  <Text strong>Selected Variable:</Text>
                  <Text className="ml-2" type={selectedExcelVar ? undefined : "secondary"}>
                    {selectedExcelVar || "None"}
                  </Text>
                </div>
                <Divider />
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    {unmatchedJsonVariables.map((jsonVar) => (
                      <div
                        key={jsonVar}
                        className="flex items-center justify-between p-2 border-b hover:bg-gray-50"
                      >
                        <Text ellipsis={{ tooltip: jsonVar }}>{jsonVar}</Text>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleMatch(jsonVar)}
                          disabled={!selectedExcelVar}
                        >
                          Match
                        </Button>
                      </div>
                    ))}
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Save Button */}
          <div className="mt-6 text-right">
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={uploadedVariables.length === 0}
            >
              Save Mappings
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SubmissionVariableMapping;