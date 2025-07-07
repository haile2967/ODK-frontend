import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const initialForm = {
  FullName: "",
  Email: "",
  Phone: "",
  Role: undefined,
  Nationality: "",
  Gender: "Male",
  DateOfBirth: null,
};

const UserForm = ({ onSubmit, onCancel, editData }) => {
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState(editData?.Role || undefined);
  const roles = useSelector((state) => state.roles.roles || []); // Use roles from roleSlice
  const nations = useSelector((state) => state.definitions.nations || []);
  const states = useSelector((state) => state.definitions.states || []);
  const regions = useSelector((state) => state.definitions.regions || []);
  const districts = useSelector((state) => state.definitions.districts || []);

  useEffect(() => {
    if (editData) {
      const values = { ...initialForm, ...editData };
      if (values.DateOfBirth) {
        values.DateOfBirth = dayjs(values.DateOfBirth, "YYYY-MM-DD");
      } else {
        values.DateOfBirth = null;
      }
      setSelectedRole(editData.Role || undefined);
      form.setFieldsValue(values);
    } else {
      form.resetFields();
      setSelectedRole(undefined);
    }
  }, [editData, form]);

  const handleFinish = (values) => {
    if (!values.DateOfBirth || !values.DateOfBirth.isValid()) {
      message.error("Please select a valid date of birth");
      return;
    }
    if (values.DateOfBirth && values.DateOfBirth.format) {
      values.DateOfBirth = values.DateOfBirth.format("YYYY-MM-DD");
    }
    const requiredFields = [
      "FullName",
      "Email",
      "Phone",
      "Role",
      "Nationality",
      "Gender",
      "DateOfBirth",
    ];
    const missingFields = requiredFields.filter((field) => !values[field]);
    if (missingFields.length > 0) {
      message.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={initialForm}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="FullName"
            label="Full Name"
            rules={[{ required: true, message: "Full name is required" }]}
          >
            <Input placeholder="Full Name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="Email"
            label="Email"
            rules={[
              { required: true, message: "Valid email is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="Phone"
            label="Phone"
            rules={[{ required: true, message: "Phone is required" }]}
          >
            <Input placeholder="Phone" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="Role"
            label="Role"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select
              placeholder="Select role"
              onChange={(value) => setSelectedRole(value)}
              value={selectedRole}
              loading={roles.length === 0}
            >
              {roles.length > 0 ? (
                roles.map((role) => (
                  <Option key={role.id} value={role.id}>
                    {role.name}
                  </Option>
                ))
              ) : (
                <Option disabled value="">
                  No roles available
                </Option>
              )}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="Nationality"
            label="Nationality"
            rules={[{ required: true, message: "Nationality is required" }]}
          >
            <Input placeholder="Nationality" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="Gender"
            label="Gender"
            rules={[{ required: true, message: "Gender is required" }]}
          >
            <Select>
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="DateOfBirth"
            label="Date of Birth"
            rules={[{ required: true, message: "Date of birth is required" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Col>
      </Row>
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          {editData ? "Update User" : "Add User"}
        </Button>
      </div>
    </Form>
  );
};

export default UserForm;
