import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";

function ResetPasswordCard({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleFinish = (values) => {
    setLoading(true);
    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
      message.success(`A password reset link has been sent to ${values.email}`);
    }, 1200);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto mt-10">
      <div className="flex justify-between items-center mb-8">
        {onBack && (
          <Button onClick={onBack} type="default">
            Back
          </Button>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Reset Password
      </h3>
      {emailSent ? (
        <p className="text-green-600 text-center">
          Check your email for a password reset link.
        </p>
      ) : (
        <Form layout="vertical" onFinish={handleFinish} className="space-y-4">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input placeholder="Enter your email address" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}

export default ResetPasswordCard;
