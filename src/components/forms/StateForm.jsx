import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchNations } from "../../store/nationSlice";

const { Option } = Select;
const initialForm = {
  stateName: "",
  nation_id: undefined,
};

const StateForm = ({ onSubmit, onCancel, editData }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { nations, loading, error } = useSelector(
    (state) => state.nations || { nations: [], loading: false, error: null }
  );

  useEffect(() => {
    dispatch(fetchNations());
  }, [dispatch]);

  useEffect(() => {
    if (editData) {
      form.setFieldsValue(editData);
    } else {
      form.resetFields();
    }
  }, [editData, form]);

  const handleFinish = async (values) => {
    const requiredFields = ["stateName", "nation_id"];
    const missingFields = requiredFields.filter((field) => !values[field]);
    if (missingFields.length > 0) {
      message.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }
    try {
      await onSubmit(values);
      message.success(`${editData ? "Updated" : "Added"} state successfully!`);
      onCancel();
    } catch (error) {
      message.error(
        `Failed to ${editData ? "update" : "add"} state: ${
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
            name="stateName"
            label="State Name"
            rules={[{ required: true, message: "State name is required" }]}
          >
            <Input placeholder="State Name" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name="nation_id"
            label="Nation"
            rules={[{ required: true, message: "Nation is required" }]}
          >
            <Select placeholder="Select a nation">
              {nations.map((nation) => (
                <Option key={nation.id} value={nation.id}>
                  {nation.nationName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          {editData ? "Update State" : "Add State"}
        </Button>
      </div>
    </Form>
  );
};

export default StateForm;
