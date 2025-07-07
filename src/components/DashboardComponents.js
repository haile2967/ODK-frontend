import React from "react";
import { Progress, Tag, Divider } from "antd";
import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";

export const DashboardCard = ({
  title,
  icon,
  description,
  link,
  tag,
  state,
}) => {
  return (
    <Link
      to={link}
      state={state}
      className="block no-underline hover:no-underline"
    >
      <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`text-2xl ${tag?.color || "text-blue-500"}`}>
            {icon}
          </div>
          {tag && (
            <span
              className={`px-2 py-1 text-xs rounded-full ${tag.color} bg-opacity-10`}
            >
              {tag.text}
            </span>
          )}
        </div>
        <h3 className="text-gray-800 text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <div className="flex items-center text-sm text-gray-500 hover:text-blue-500">
          <span>Manage {title.toLowerCase()}</span>
          <RightOutlined className="ml-2" />
        </div>
      </div>
    </Link>
  );
};

export const SectionHeader = ({ title, description }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <Divider className="my-4" />
    </div>
  );
};
