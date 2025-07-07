import React, { useState, useEffect } from "react";

const initialForm = { name: "", status: "active" };

const RoleForm = ({ onSubmit, onCancel, editData }) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        status: editData.status || "active",
      });
    } else {
      setForm(initialForm);
    }
  }, [editData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.name.trim()) {
      onSubmit(form);
      setForm(initialForm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Role Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {editData ? "Update Role" : "Add Role"}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;
