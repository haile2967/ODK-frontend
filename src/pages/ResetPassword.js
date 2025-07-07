import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../store/authSlice';
import useTokenExpiryCheck from "../utils/UseTokenExpiryCheck";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPasswordStatus } = useSelector((state) => state.auth);
  
  const token = searchParams.get('token');
  const userName = searchParams.get('username');
  useTokenExpiryCheck();
  const onFinish = async (values) => {
    if (!token || !userName) {
      message.error('Invalid reset link or missing username');
      return;
    }
  
    try {
      await dispatch(resetPassword({
        token,
        userName,
        newPassword: values.password,
      })).unwrap();
  
      message.success('Password has been reset successfully');
      navigate('/login');
    } catch (error) {
      message.error(error || 'Failed to reset password');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Form
          name="reset-password"
          className="mt-8 space-y-6"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="New password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Confirm password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="large"
              loading={resetPasswordStatus === 'loading'}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;