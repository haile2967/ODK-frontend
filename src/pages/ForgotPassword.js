import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, clearAuthStatus } from '../store/authSlice';
import useTokenExpiryCheck from "../utils/UseTokenExpiryCheck";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forgotPasswordStatus, error } = useSelector((state) => state.auth);
 useTokenExpiryCheck();
  const onFinish = async (values) => {
    try {
      await dispatch(forgotPassword(values.email)).unwrap();
      message.success('Password reset instructions have been sent to your email');
      navigate('/login');
    } catch (error) {
      message.error(error || 'Failed to send reset instructions');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <Form
          name="forgot-password"
          className="mt-8 space-y-6"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder="Email address"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="large"
              loading={forgotPasswordStatus === 'loading'}
            >
              Send Reset Instructions
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
              onClick={() => dispatch(clearAuthStatus())}
            >
              Back to Login
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ForgotPassword;
