import React, { useEffect } from "react";
import { Table } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers } from "../../store/userSlice";

const columns = [
  {
    title: "Full Name",
    dataIndex: "FullName",
    key: "FullName",
  },
  {
    title: "Username",
    dataIndex: "Username",
    key: "Username",
  },
  {
    title: "Password (Hashed)",
    dataIndex: "HashedPassword",
    key: "HashedPassword",
    render: (hashed) => (
      <span style={{ fontFamily: "monospace" }}>{hashed}</span>
    ),
  },
];

const AccountListCard = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector(
    (state) => state.users || { users: [], loading: false, error: null }
  );

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Account List</h2>
      {error && <div className="text-red-500 mb-2">Error: {error}</div>}

      <Table
        columns={columns}
        dataSource={users.map((user) => ({
          ...user,
          Username: user.Username || user.username || user.Email || user.email,
          HashedPassword:
            user.HashedPassword ||
            user.hashed_password ||
            user.Password ||
            user.password,
          key: user.id,
        }))}
        loading={loading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default AccountListCard;
