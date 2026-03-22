import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFormDocumentConfig, addFormSection, createForm } from '../api/forms';
import { getMasterDocuments } from '../api/upload';
import { ROUTES } from '../routes';

function FormBuilder() {
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState([{ section_name: 'Personal Details', display_order: 1, documents: [] }]);
  const [masterDocuments, setMasterDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchMasterDocs = async () => {
      try {
        const response = await getMasterDocuments();
        setMasterDocuments(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (err) {
        setError('Failed to load master documents');
      }
    };
    fetchMasterDocs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Form name is required');
      return;
    }
    if (sections.length === 0) {
      setError('At least one section is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formPayload = {
        form_name: formName,
        description: formDescription,
      };
      const formRes = await createForm(formPayload);
      const createdFormId = formRes.data?.form_id;
      const sectionIdByIndex = {};

      for (let i = 0; i < sections.length; i += 1) {
        const sec = sections[i];
        const secRes = await addFormSection(createdFormId, {
          section_name: sec.section_name,
          display_order: sec.display_order || i + 1,
        });
        sectionIdByIndex[i] = secRes.data?.section_id;
      }

      for (let i = 0; i < sections.length; i += 1) {
        const section = sections[i];
        const section_id = sectionIdByIndex[i];
        for (const doc of section.documents) {
          if (!section_id || !doc.document_id) continue;
          await addFormDocumentConfig(createdFormId, {
            section_id,
            document_id: Number(doc.document_id),
            allowed_file_format: doc.allowed_file_format || 'pdf,jpg,jpeg,png',
            max_file_size: Number(doc.max_file_size) || 5242880,
            is_mandatory: doc.is_mandatory ? 1 : 0,
          });
        }
      }
      navigate(ROUTES.admin, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Form Builder</h1>
          <button
            onClick={() => navigate(ROUTES.admin)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Admin
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Form Name */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Form Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Enter form name"
              />
            </div>

            {/* Form Description */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                placeholder="Enter form description"
                rows="3"
              />
            </div>

            {/* Sections */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Sections</h2>
              {sections.map((section, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={section.section_name}
                      onChange={(e) => {
                        const next = [...sections];
                        next[index].section_name = e.target.value;
                        setSections(next);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Section name"
                    />
                    <input
                      type="number"
                      value={section.display_order}
                      onChange={(e) => {
                        const next = [...sections];
                        next[index].display_order = Number(e.target.value);
                        setSections(next);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Display order"
                    />
                  </div>
                  
                  {/* Documents for this section */}
                  <div className="mb-4">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Documents in this section</h3>
                    {section.documents.map((doc, docIndex) => (
                      <div key={docIndex} className="mb-2 p-3 border border-gray-100 rounded grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                          value={doc.document_id}
                          onChange={(e) => {
                            const next = [...sections];
                            next[index].documents[docIndex].document_id = e.target.value;
                            setSections(next);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="">Select document</option>
                          {masterDocuments.map((md) => (
                            <option key={md.document_id} value={md.document_id}>{md.document_name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={doc.allowed_file_format}
                          onChange={(e) => {
                            const next = [...sections];
                            next[index].documents[docIndex].allowed_file_format = e.target.value;
                            setSections(next);
                          }}
                          placeholder="pdf,jpg,png"
                          className="px-3 py-2 border border-gray-300 rounded"
                        />
                        <div className="flex items-center gap-3">
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={doc.is_mandatory}
                              onChange={(e) => {
                                const next = [...sections];
                                next[index].documents[docIndex].is_mandatory = e.target.checked;
                                setSections(next);
                              }}
                              className="mr-2"
                            />
                            Mandatory
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...sections];
                              next[index].documents = next[index].documents.filter((_, i) => i !== docIndex);
                              setSections(next);
                            }}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...sections];
                        next[index].documents.push({
                          document_id: '',
                          allowed_file_format: 'pdf,jpg,jpeg,png',
                          max_file_size: 5242880,
                          is_mandatory: true,
                        });
                        setSections(next);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Add Document
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSections(sections.filter((_, i) => i !== index))}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Remove Section
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setSections([
                    ...sections,
                    { section_name: '', display_order: sections.length + 1, documents: [] },
                  ])
                }
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Section
              </button>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Creating...' : 'Create Form'}
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.admin)}
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

export default FormBuilder;
