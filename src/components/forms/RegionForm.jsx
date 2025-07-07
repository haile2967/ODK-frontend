import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchStates } from "../../store/stateSlice";

const { Option } = Select;
const initialForm = {
  regionName: "",
  state_id: undefined,
};

const RegionForm = ({ onSubmit, onCancel, editData }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { states, loading, error } = useSelector(
    (state) => state.states || { states: [], loading: false, error: null }
  );

  useEffect(() => {
    dispatch(fetchStates());
  }, [dispatch]);

  useEffect(() => {
    if (editData) {
      form.setFieldsValue(editData);
    } else {
      form.resetFields();
    }
  }, [editData, form]);

  const handleFinish = async (values) => {
    const requiredFields = ["regionName", "state_id"];
    const missingFields = requiredFields.filter((field) => !values[field]);
    if (missingFields.length > 0) {
      message.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }
    try {
      await onSubmit(values);
      message.success(`${editData ? "Updated" : "Added"} region successfully!`);
      onCancel();
    } catch (error) {
      message.error(
        `Failed to ${editData ? "update" : "add"} region: ${
          error.message || "Unknown error"
        }`
      );
    }
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
            name="regionName"
            label="Region Name"
            rules={[{ required: true, message: "Region name is required" }]}
          >
            <Input placeholder="Region Name" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="state_id"
            label="State"
            rules={[{ required: true, message: "State is required" }]}
          >
            <Select placeholder="Select a state">
              {states.map((state) => (
                <Option key={state.id} value={state.id}>
                  {state.stateName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          {editData ? "Update Region" : "Add Region"}
        </Button>
      </div>
    </Form>
  );
};

export default RegionForm;
