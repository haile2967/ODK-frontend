import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addForm, updateForm, deleteFormWithCheck as deleteForm, setError } from '../../store/formSlice';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

function FormManagementCard() {
  const dispatch = useDispatch();
  const { forms, status, error } = useSelector((state) => state.form);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(forms[0]?.project_id?.toString() || '');
  const [formData, setFormData] = useState({
    form_id: '',
    project_id: '',
    type: '',
    version: '1.0.0',
    description: '',
    user_id: 1,
  });
  const [modalError, setModalError] = useState(null);

  const uniqueProjectIds = [...new Set(forms.map(form => form.project_id))].sort((a, b) => a - b);

  const columns = [
    { key: 'form_id', label: 'Form ID' },
    { key: 'type', label: 'Type' },
    { key: 'version', label: 'Version' },
    { key: 'description', label: 'Description' },
    { key: 'actions', label: 'Action' },
  ];

  const filteredForms = forms.filter(form => form.project_id === Number(selectedProjectId));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'project_id' ? value : value });
    setModalError(null);
  };

  const handleProjectIdChange = (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
  };

  const handleSubmit = () => {
    if (!formData.form_id || !formData.project_id || !formData.type || !formData.description) {
      setModalError('Form ID, Project ID, Type, and Description are required.');
      return;
    }
    if (!editingForm) {
      const isDuplicate = forms.some(
        (form) =>
          form.form_id === formData.form_id &&
          form.project_id === Number(formData.project_id) &&
          form.type === formData.type &&
          form.version === formData.version
      );
      if (isDuplicate) {
        setModalError('Form with these details already exists.');
        return;
      }
      dispatch(addForm({ ...formData, project_id: Number(formData.project_id), user_id: 1 }));
    } else {
      dispatch(updateForm({ ...formData, project_id: Number(formData.project_id) }));
    }
    setIsModalOpen(false);
    setEditingForm(null);
    setModalError(null);
    setFormData({ form_id: '', project_id: '', type: '', version: '1.0.0', description: '', user_id: 1 });
  };

  const handleEdit = (form) => {
    setEditingForm(form);
    setFormData({ ...form, project_id: form.project_id.toString() });
    setIsModalOpen(true);
    setModalError(null);
  };

  const handleDelete = (project_id, form_id) => {
    dispatch(deleteForm({ project_id: Number(project_id), form_id }));
  };

  const openAddFormModal = () => {
    setEditingForm(null);
    setFormData({ form_id: '', project_id: '', type: '', version: '1.0.0', description: '', user_id: 1 });
    setIsModalOpen(true);
    setModalError(null);
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-md border border-gray-100 w-full ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Form Management
          </h3>
          <p className="text-blue-500 text-sm sm:text-base mt-1">Handling form fields.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={selectedProjectId}
            onChange={handleProjectIdChange}
            className="p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base w-full sm:w-auto bg-blue-50 text-blue-800"
          >
            {uniqueProjectIds.map((projectId) => (
              <option key={projectId} value={projectId}>
                Project {projectId}
              </option>
            ))}
          </select>
          <button
            onClick={openAddFormModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Add Form
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>}
      {status === 'loading' && <p className="text-blue-600 mb-4 text-sm sm:text-base">Loading...</p>}

      {Array.isArray(filteredForms) && filteredForms.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                {columns.map((col) => (
                  <th key={col.key} className="p-4 font-semibold text-sm sm:text-base">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredForms.map((form, index) => (
                <tr
                  key={form.form_id}
                  className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-blue-50' : 'bg-blue-100'} hover:bg-blue-200 transition-all duration-200`}
                >
                  <td className="p-4 text-blue-900 text-sm sm:text-base font-medium">{form.form_id}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{form.type}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{form.version}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">{form.description}</td>
                  <td className="p-4 text-blue-900 text-sm sm:text-base">
                    <button
                      onClick={() => handleEdit(form)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(form.project_id, form.form_id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-blue-600 text-sm sm:text-base">No forms available for Project {selectedProjectId}.</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg border border-blue-100">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
              {editingForm ? 'Edit Form' : 'Add Form'}
            </h3>
            {modalError && <p className="text-red-600 mb-4 text-sm">{modalError}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700">Form ID</label>
                <input
                  type="text"
                  name="form_id"
                  value={formData.form_id}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-blue-50 text-blue-900"
                  disabled={!!editingForm}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">Project ID</label>
                <input
                  type="number"
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-blue-50 text-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-blue-50 text-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">Version</label>
                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-blue-50 text-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-blue-50 text-blue-900"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError(null);
                }}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                {editingForm ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormManagementCard;