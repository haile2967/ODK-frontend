import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";

const initialForm = {
  nationName: "",
};

const NationForm = ({ onSubmit, onCancel, editData }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editData) {
      form.setFieldsValue(editData);
    } else {
      form.resetFields();
    }
  }, [editData, form]);

  const handleFinish = async (values) => {
    const requiredFields = ["nationName"];
    const missingFields = requiredFields.filter((field) => !values[field]);
    if (missingFields.length > 0) {
      message.error(`Missing required fields: ${missingFields.join(", ")}`);
      return;
    }
    try {
      await onSubmit(values);
      message.success(`${editData ? "Updated" : "Added"} nation successfully!`);
      onCancel();
    } catch (error) {
      message.error(
        `Failed to ${editData ? "update" : "add"} nation: ${
          error.message || "Server error"
        }`
      );
    }
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
            name="nationName"
            label="Nation Name"
            rules={[{ required: true, message: "Nation name is required" }]}
          >
            <Input placeholder="Nation Name" />
          </Form.Item>
        </Col>
      </Row>
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit">
          {editData ? "Update Nation" : "Add Nation"}
        </Button>
      </div>
    </Form>
  );
};

export default NationForm;
