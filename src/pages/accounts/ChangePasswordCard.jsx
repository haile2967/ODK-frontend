import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";

const ChangePasswordCard = ({ onPasswordChange }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    // Simulate password change logic (replace with real API call)
    setTimeout(() => {
      setLoading(false);
      message.success("Password changed successfully!");
      if (onPasswordChange) onPasswordChange();
    }, 1000);
  };

  return (
    <Card title="Change Password" className="max-w-md mx-auto mt-8">
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Current Password"
          name="currentPassword"
          rules={[{ required: true, message: "Please enter your current password" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: "Please enter a new password" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordCard;