import React, { useState, useEffect } from 'react';
import { getAllForms, deleteForm } from '../api/forms';

function FormsList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await getAllForms();
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        const normalizedForms = rows.map((form) => ({
          id: form.id ?? form.form_id,
          name: form.name ?? form.form_name,
          description: form.description,
          applicantCount: form.applicant_count ?? 0,
        }));
        setForms(normalizedForms);
      } catch (err) {
        setError('Failed to load forms');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleDelete = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await deleteForm(formId);
        setForms(forms.filter(form => form.id !== formId));
      } catch (err) {
        setError('Failed to delete form');
      }
    }
  };

  if (loading) return <div>Loading forms...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Forms</h2>
      {forms.length === 0 ? (
        <p className="text-gray-600">No forms created yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Form ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applicants</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{form.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{form.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{form.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{form.applicantCount}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDelete(form.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FormsList;
