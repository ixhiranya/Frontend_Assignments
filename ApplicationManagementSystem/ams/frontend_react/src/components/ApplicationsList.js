import React, { useState, useEffect } from 'react';
import { getAdminApplications, getAdminApplicationDetail } from '../api/admin';
import { getDownloadUrl } from '../api/upload';

function ApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await getAdminApplications();
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        const normalizedApps = rows.map((app) => ({
          id: app.id ?? app.application_id,
          formName: app.formName ?? app.form_name,
          applicantName: app.applicantName ?? app.applicant_name,
          status: app.status || '',
        }));
        setApplications(normalizedApps);
      } catch (err) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleViewDetails = async (appId) => {
    try {
      setDetailLoading(true);
      const response = await getAdminApplicationDetail(appId);
      setSelectedApp(response.data?.data || null);
    } catch (err) {
      setError('Failed to load application detail');
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return <div>Loading applications...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Applications</h2>
      {applications.length === 0 ? (
        <p className="text-gray-600">No applications yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Form</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Applicant</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{app.formName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{app.applicantName}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleViewDetails(app.id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailLoading && <div className="mt-4">Loading application detail...</div>}
      {selectedApp && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Application #{selectedApp.application_id}
            </h3>
            <button
              onClick={() => setSelectedApp(null)}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
            >
              Close
            </button>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-semibold">Form:</span> {selectedApp.form_name}
          </p>
          <p className="text-sm text-gray-700 mb-4">
            <span className="font-semibold">Applicant:</span> {selectedApp.applicant_name}
          </p>
          <h4 className="font-semibold text-gray-800 mb-2">Uploaded Documents</h4>
          {selectedApp.uploaded_documents?.length ? (
            <div className="space-y-2">
              {selectedApp.uploaded_documents.map((doc) => (
                <div key={doc.upload_id} className="flex items-center justify-between border rounded px-3 py-2">
                  <span className="text-sm text-gray-700">{doc.document_name} - {doc.file_name}</span>
                  <a
                    href={getDownloadUrl(doc.upload_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No documents uploaded.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ApplicationsList;
