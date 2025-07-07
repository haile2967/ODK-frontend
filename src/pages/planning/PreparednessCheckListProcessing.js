import React, { useState, useEffect, useCallback, Component } from "react";
import {
  Button,
  Upload,
  Table,
  Card,
  Typography,
  Row,
  Col,
  Progress,
  Tag,
  message,
  Popconfirm,
  Space,
  Spin,
} from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import users from "./temp_users.json";

// Static store to persist fileMap and approvalStatus across role changes
let persistedFileMap = new Map();
let persistedApprovalStatus = {};

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "16px", color: "red" }}>
          <Typography.Text type="danger">
            Error rendering component:{" "}
            {this.state.error?.message || "Unknown error"}
          </Typography.Text>
        </div>
      );
    }
    return this.props.children;
  }
}

const { Title, Text } = Typography;

function PreparednessCheckListProcessing({ onBack }) {
  const [fileMap, setFileMap] = useState(persistedFileMap);
  const [approvalStatus, setApprovalStatus] = useState(persistedApprovalStatus);
  const [approvalData, setApprovalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Get user from Redux store
  const currentUser = useSelector((state) => state.auth.currentUser);
  const userRole = currentUser?.role || "District Team";
  const userId = currentUser?.user_id?.toString() || "7"; // Default to first District Team user
  const isDistrictTeam = userRole === "District Team";

  // Role hierarchy
  const hierarchy = [
    "District Team",
    "District DFA",
    "District Admin",
    "Region Admin",
    "State Admin",
    "National Admin",
  ];

  // Find users by role from users.json
  const getUsersByRole = useCallback((role) => {
    return users.filter((u) => u.role === role);
  }, []);


  // Check if all users in a role have approved
  const isRoleApproved = useCallback((role) => {
    const roleUsers = getUsersByRole(role);
    return (
      roleUsers.length > 0 &&
      roleUsers.every(
        (user) =>
          persistedApprovalStatus[user.user_id.toString()] === "approved"
      )
    );
  }, []);

  // Check if Approve/Reject buttons should be enabled
  const canApprove = useCallback(() => {
    if (isDistrictTeam) return false; // District Team auto-approves
    const userIndex = hierarchy.indexOf(userRole);
    if (userIndex <= 1) return true; // District DFA can approve after District Team (auto-approved)
    const lowerRole = hierarchy[userIndex - 1];
    return isRoleApproved(lowerRole);
  }, [userRole, isDistrictTeam]);

  // Load approval data for non-District Team users
  useEffect(() => {
    if (!isDistrictTeam && fileMap.size > 0) {
      console.log("Loading approval data for role:", userRole);
      setLoading(true);
      setTimeout(() => {
        setApprovalData(generateMockApprovalData());
        setLoading(false);
      }, 500);
    } else {
      setApprovalData({});
    }
  }, [userRole, fileMap]);

  const generateMockApprovalData = useCallback(() => {
    const userIndex = hierarchy.indexOf(userRole);
    // Start from roles above District Team
    const levelsToShow = hierarchy.slice(1, userIndex);

    const mockData = {};
    levelsToShow.forEach((level) => {
      const roleUsers = getUsersByRole(level);
      mockData[level] = {
        total: roleUsers.length,
        approved: roleUsers.filter(
          (user) =>
            persistedApprovalStatus[user.user_id.toString()] === "approved"
        ).length,
        rejected: roleUsers.filter(
          (user) =>
            persistedApprovalStatus[user.user_id.toString()] === "rejected"
        ).length,
        pending: roleUsers.filter(
          (user) =>
            !persistedApprovalStatus[user.user_id.toString()] ||
            persistedApprovalStatus[user.user_id.toString()] === "pending"
        ).length,
        details: roleUsers.map((user) => ({
          id: `${level}-${user.user_id}`,
          name: user.full_name,
          status: persistedApprovalStatus[user.user_id.toString()] || "pending",
          date:
            persistedApprovalStatus[user.user_id.toString()] &&
            persistedApprovalStatus[user.user_id.toString()] !== "pending"
              ? new Date().toISOString().split("T")[0]
              : null,
        })),
      };
    });

    console.log("Generated mock approval data:", mockData);
    return mockData;
  }, [userRole]);

  const beforeUpload = useCallback(
    (file) => {
      console.log("beforeUpload:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      setUploadError(null);

      if (!isDistrictTeam) {
        console.error("User role not allowed:", userRole);
        message.error("Only District Team members can upload files");
        return Upload.LIST_IGNORE;
      }

      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";
      if (!isExcel) {
        console.error("Invalid file type:", file.type);
        message.error("You can only upload Excel files (.xlsx or .xls)");
        setUploadError(
          "Invalid file type. Please upload an .xlsx or .xls file."
        );
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    [isDistrictTeam, userRole]
  );

  const handleUpload = useCallback(
    ({ file, onSuccess, onError }) => {
      console.log("handleUpload started:", file.name);
      setLoading(true);
      setUploadError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("FileReader onload triggered");
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          console.log("Workbook parsed:", {
            sheetNames: workbook.SheetNames,
            sheetCount: workbook.SheetNames.length,
          });

          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            console.error("No sheets found in the Excel file");
            message.error("No sheets found in the Excel file");
            setUploadError("No sheets found in the Excel file");
            setLoading(false);
            onError(new Error("No sheets found"));
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log("Raw JSON data:", jsonData);

          const headers = jsonData[0]
            ? jsonData[0].map((col) => String(col).trim()).filter((col) => col)
            : [];
          if (headers.length === 0) {
            console.error("No headers found in the first row");
            message.error("No valid headers found in the Excel file");
            setUploadError("No valid headers found in the Excel file");
            setLoading(false);
            onError(new Error("No headers found"));
            return;
          }

          // Convert rows to objects using headers
          const tableData = jsonData.slice(1).map((row, index) => {
            const rowData = {};
            headers.forEach((header, i) => {
              rowData[header] = row[i] !== undefined ? String(row[i]) : "";
            });
            return { key: `${file.uid}-${index}`, ...rowData };
          });

          console.log("Parsed Excel data:", { headers, tableData });

          // Auto-approve for all District Team users
          const newApprovalStatus = { ...persistedApprovalStatus };
          if (isDistrictTeam) {
            const districtTeamUsers = getUsersByRole("District Team");
            districtTeamUsers.forEach((user) => {
              newApprovalStatus[user.user_id.toString()] = "approved";
            });
          }

          // Update fileMap and persisted store
          const newFileMap = new Map(persistedFileMap);
          newFileMap.set(file.uid, {
            uid: file.uid,
            name: file.name,
            status: "done",
            url: "#",
            uploadDate: new Date().toLocaleDateString(),
            excelColumns: headers.map((header) => ({
              title: header,
              dataIndex: header,
              key: header,
              render: (text) => text || "N/A",
            })),
            excelData: tableData,
          });

          console.log("Setting fileMap:", Array.from(newFileMap.entries()));
          persistedFileMap = newFileMap;
          persistedApprovalStatus = newApprovalStatus;
          setFileMap(newFileMap);
          setApprovalStatus(newApprovalStatus);
          message.success(`${file.name} uploaded successfully`);
          setLoading(false);
          onSuccess("ok", file);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          message.error(
            "Error parsing Excel file. Please ensure it is a valid .xlsx or .xls file."
          );
          setUploadError("Failed to parse the Excel file");
          setLoading(false);
          onError(error);
        }
      };
      reader.onerror = () => {
        console.error("FileReader error");
        message.error("Failed to read the Excel file");
        setUploadError("Failed to read the file");
        setLoading(false);
        onError(new Error("FileReader error"));
      };
      reader.readAsArrayBuffer(file);
    },
    [isDistrictTeam, userRole]
  );

  const handleApprove = useCallback(() => {
    console.log("Approving plan for user:", userId, "role:", userRole);
    const newApprovalStatus = {
      ...persistedApprovalStatus,
      [userId]: "approved",
    };
    persistedApprovalStatus = newApprovalStatus;
    setApprovalStatus(newApprovalStatus);
    setApprovalData(generateMockApprovalData());
    message.success("Plan approved successfully");
  }, [userId, userRole, generateMockApprovalData]);

  const handleReject = useCallback(() => {
    console.log("Rejecting plan for user:", userId, "role:", userRole);
    const newApprovalStatus = {
      ...persistedApprovalStatus,
      [userId]: "rejected",
    };
    persistedApprovalStatus = newApprovalStatus;
    setApprovalStatus(newApprovalStatus);
    setApprovalData(generateMockApprovalData());
    message.success("Plan rejected successfully");
  }, [userId, userRole, generateMockApprovalData]);

  const handleDelete = useCallback(() => {
    if (!isDistrictTeam) {
      console.error("User role not allowed:", userRole);
      message.error("Only District Team members can delete files");
      return;
    }
    console.log("Deleting all files");
    persistedFileMap = new Map();
    persistedApprovalStatus = {};
    setFileMap(new Map());
    setApprovalStatus({});
    setApprovalData({});
    message.success("All files deleted successfully");
  }, [isDistrictTeam, userRole]);

  const getColumns = useCallback(() => {
    return [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag
            icon={
              status === "approved" ? (
                <CheckCircleOutlined />
              ) : status === "rejected" ? (
                <CloseCircleOutlined />
              ) : (
                <ClockCircleOutlined />
              )
            }
            color={
              status === "approved"
                ? "success"
                : status === "rejected"
                ? "error"
                : "default"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        ),
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        render: (date) => date || "N/A",
      },
    ];
  }, []);

  const getApprovalLevelsToShow = useCallback(() => {
    const userIndex = hierarchy.indexOf(userRole);
    // Exclude District Team by starting from index 1
    return hierarchy.slice(1, userIndex);
  }, [userRole]);

  // Debug state changes
  useEffect(() => {
    console.log("State updated:", {
      fileMap: Array.from(fileMap.entries()),
      approvalStatus,
      approvalData,
      loading,
      uploadError,
      userRole,
      userId,
      canApprove: canApprove(),
    });
  }, [
    fileMap,
    approvalStatus,
    approvalData,
    loading,
    uploadError,
    userRole,
    userId,
    canApprove,
  ]);

  return (
    <ErrorBoundary>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              className="mr-2 flex items-center justify-center"
              style={{ width: 40, height: 40 }}
            />
            <Title level={2} className="text-blue-700 mb-0">
              Preparedness Checklist Processing
            </Title>
          </div>
          <Space>
            {isDistrictTeam && (
              <>
                <Upload
                  accept=".xlsx,.xls"
                  beforeUpload={beforeUpload}
                  customRequest={handleUpload}
                  fileList={Array.from(fileMap.keys()).map((uid) =>
                    fileMap.get(uid)
                  )}
                  showUploadList={false}
                >
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    disabled={loading}
                  >
                    {loading ? "Uploading..." : "Upload Plan"}
                  </Button>
                </Upload>
                {fileMap.size > 0 && (
                  <Popconfirm
                    title="Are you sure to delete all files?"
                    onConfirm={handleDelete}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger icon={<DeleteOutlined />} disabled={loading}>
                      Delete All
                    </Button>
                  </Popconfirm>
                )}
              </>
            )}
          </Space>
        </div>

        {uploadError && (
          <div className="mb-4">
            <Text type="danger">{uploadError}</Text>
          </div>
        )}

        {loading && (
          <div className="mt-4 text-center">
            <Spin tip="Processing Excel file..." />
          </div>
        )}

        <Row gutter={[24, 24]} className="mb-6">
          <Col span={24}>
            <Card title="Uploaded Checklist Data" loading={loading}>
              {fileMap.size > 0 ? (
                Array.from(fileMap.entries()).map(([uid, fileData]) => (
                  <div key={uid} className="mb-6">
                    <div className="flex items-center mb-4">
                      <FileExcelOutlined className="text-green-600 text-2xl mr-4" />
                      <div>
                        <Text strong>{fileData.name}</Text>
                        <Text type="secondary" className="block">
                          Uploaded on {fileData.uploadDate}
                        </Text>
                      </div>
                    </div>
                    {fileData.excelData?.length > 0 ? (
                      <>
                        <Table
                          columns={fileData.excelColumns}
                          dataSource={fileData.excelData}
                          pagination={{ pageSize: 10 }}
                          size="small"
                          rowKey="key"
                          scroll={{ x: "max-content" }}
                        />
                        {!isDistrictTeam && (
                          <div className="mt-4">
                            <Space>
                              <Button
                                type="primary"
                                onClick={handleApprove}
                                disabled={
                                  !canApprove() ||
                                  approvalStatus[userId] === "approved"
                                }
                              >
                                Approve Plan
                              </Button>
                              <Button
                                type="primary"
                                danger
                                onClick={handleReject}
                                disabled={
                                  !canApprove() ||
                                  approvalStatus[userId] === "rejected"
                                }
                              >
                                Reject Plan
                              </Button>
                            </Space>
                          </div>
                        )}
                      </>
                    ) : (
                      <Text type="secondary">
                        No data found in the uploaded file
                      </Text>
                    )}
                  </div>
                ))
              ) : (
                <Text type="secondary">No checklist data uploaded yet</Text>
              )}
            </Card>
          </Col>
        </Row>

        {!isDistrictTeam && fileMap.size > 0 && (
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Approval Status" loading={loading}>
                {getApprovalLevelsToShow().length > 0 ? (
                  getApprovalLevelsToShow().map(
                    (level) =>
                      approvalData[level] && (
                        <div key={level} className="mb-8">
                          <Title level={4} className="mb-4">
                            {level} Approvals
                          </Title>
                          <div className="mb-4">
                            <Progress
                              percent={
                                Math.round(
                                  (approvalData[level].approved /
                                    approvalData[level].total) *
                                    100
                                ) || 0
                              }
                              success={{
                                percent: Math.round(
                                  (approvalData[level].rejected /
                                    approvalData[level].total) *
                                    100 || 0
                                ),
                              }}
                              status="active"
                              strokeColor={{
                                "0%": "#108ee9",
                                "100%": "#87d068",
                              }}
                            />
                            <div className="flex justify-between mt-2">
                              <Text>
                                <CheckCircleOutlined className="text-green-500 mr-1" />
                                {approvalData[level].approved} Approved
                              </Text>
                              <Text>
                                <CloseCircleOutlined className="text-red-500 mr-1" />
                                {approvalData[level].rejected} Rejected
                              </Text>
                              <Text>
                                <ClockCircleOutlined className="text-gray-500 mr-1" />
                                {approvalData[level].pending} Pending
                              </Text>
                            </div>
                          </div>
                          <Table
                            columns={getColumns()}
                            dataSource={approvalData[level].details}
                            pagination={false}
                            size="small"
                            rowKey="id"
                          />
                        </div>
                      )
                  )
                ) : (
                  <Text type="secondary">
                    No approval data available for lower roles
                  </Text>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default PreparednessCheckListProcessing;
