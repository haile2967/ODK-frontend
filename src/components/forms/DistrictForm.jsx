import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchRegions } from "../../store/regionSlice";

const { Option } = Select;
const initialForm = {
  districtName: "",
  noOfDFAs: 0,
  noOfTeams: 0,
  region_id: undefined,
};

const DistrictForm = ({ onSubmit, onCancel, editData }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { regions, loading, error } = useSelector(
    (state) => state.regions || { regions: [], loading: false, error: null }
  );
  const [regionOptions, setRegionOptions] = useState([]);

  useEffect(() => {
    dispatch(fetchRegions()).then((response) => {
      if (response.payload) {
        setRegionOptions(response.payload);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (editData) {
      form.setFieldsValue(editData);
    } else {
      form.resetFields();
    }
  }, [editData, form]);

  const handleFinish = (values) => {
    const requiredFields = ["districtName", "region_id"];
    const missingFields = requiredFields.filter((field) => !values[field]);
    if (missingFields.length > 0) {
      message.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }
    // Ensure noOfDFAs and noOfTeams are numbers and default to 0 if not provided
    const payload = {
      ...values,
      noOfDFAs: values.noOfDFAs ? Number(values.noOfDFAs) : 0,
      noOfTeams: values.noOfTeams ? Number(values.noOfTeams) : 0,
    };
    onSubmit(payload);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
            name="districtName"
            label="District Name"
            rules={[{ required: true, message: "District name is required" }]}
          >
            <Input placeholder="District Name" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="noOfDFAs"
            label="Number of DFAs"
            rules={[{ required: false }]}
          >
            <Input type="number" min={0} placeholder="Number of DFAs" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="noOfTeams"
            label="Number of Teams"
            rules={[{ required: false }]}
          >
            <Input type="number" min={0} placeholder="Number of Teams" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="region_id"
            label="Region"
            rules={[{ required: true, message: "Region is required" }]}
          >
            <Select placeholder="Select a region">
              {regionOptions.map((region) => (
                <Option key={region.id} value={region.id}>
                  {region.regionName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          {editData ? "Update District" : "Add District"}
        </Button>
      </div>
    </Form>
  );
};

export default DistrictForm;
