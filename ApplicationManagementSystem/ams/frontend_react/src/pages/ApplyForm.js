import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormById } from '../api/forms';
import { createApplication, getApplicationById, submitApplication } from '../api/applications';
import { uploadDocument } from '../api/upload';
import { ROUTES } from '../routes';

function ApplyForm() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [application, setApplication] = useState(null);
  const [filesByDocId, setFilesByDocId] = useState({});
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeApplication = async () => {
      try {
        const [formRes, appRes] = await Promise.all([
          getFormById(formId),
          createApplication(formId),
        ]);
        setForm(formRes.data?.data || null);
        const appData = appRes.data?.data || null;
        if (appData?.application_id) {
          const appDetail = await getApplicationById(appData.application_id);
          setApplication(appDetail.data?.data || appData);
        } else {
          setApplication(appData);
        }
      } catch (err) {
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    initializeApplication();
  }, [formId]);

  const refreshApplication = async () => {
    if (!application?.application_id) return;
    const appDetail = await getApplicationById(application.application_id);
    setApplication(appDetail.data?.data || application);
  };

  const handleFileSelect = (documentId, file) => {
    setFilesByDocId((prev) => ({ ...prev, [documentId]: file }));
  };

  const handleUpload = async (documentId) => {
    const file = filesByDocId[documentId];
    if (!file || !application?.application_id) return;
    try {
      setUploadingDocId(documentId);
      setError('');
      await uploadDocument({
        applicationId: application.application_id,
        documentId,
        file,
      });
      await refreshApplication();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await submitApplication(application?.application_id);
      alert('Application submitted successfully!');
      navigate(ROUTES.client, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  const uploadedByDocumentId = (application?.uploaded_documents || []).reduce((acc, doc) => {
    acc[doc.document_id] = doc;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{form?.form_name}</h1>
          {form?.description && (
            <p className="text-gray-600 mb-6">{form.description}</p>
          )}
          <p className="text-sm text-gray-600 mb-6">
            Application ID: <span className="font-semibold">{application?.application_id || '-'}</span>
          </p>

          <form onSubmit={handleSubmit}>
            {form?.sections?.map((section) => (
              <div key={section.section_id} className="mb-8 border rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{section.section_name}</h2>
                {(section.documents || []).length === 0 ? (
                  <p className="text-sm text-gray-600">No documents configured for this section.</p>
                ) : (
                  <div className="space-y-4">
                    {section.documents.map((doc) => {
                      const uploaded = uploadedByDocumentId[doc.document_id];
                      return (
                        <div key={doc.document_id} className="border rounded p-3">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {doc.document_name} {doc.is_mandatory ? '*' : ''}
                              </p>
                              <p className="text-xs text-gray-600">
                                Allowed: {doc.allowed_file_format} | Max: {Math.round((doc.max_file_size || 0) / (1024 * 1024))} MB
                              </p>
                            </div>
                            {uploaded && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Uploaded
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex gap-3 items-center">
                            <input
                              type="file"
                              onChange={(e) => handleFileSelect(doc.document_id, e.target.files?.[0])}
                              className="text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpload(doc.document_id)}
                              disabled={uploadingDocId === doc.document_id || !filesByDocId[doc.document_id]}
                              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 text-sm"
                            >
                              {uploadingDocId === doc.document_id ? 'Uploading...' : 'Upload'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.client)}
                className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ApplyForm;
