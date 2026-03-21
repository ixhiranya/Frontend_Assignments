import React, { useState, useEffect } from 'react';
import { getMasterDocuments, addMasterDocument } from '../api/upload';

function MasterDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getMasterDocuments();
      setDocuments(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      setError('Failed to load master documents');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      setError('Document name is required');
      return;
    }

    setAdding(true);
    setError('');

    try {
      await addMasterDocument({
        document_name: newDocName.trim(),
        description: newDocDesc.trim(),
      });
      setNewDocName('');
      setNewDocDesc('');
      await loadDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add document');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
          Master Documents
        </h2>
        <p className="text-slate-600 text-lg">Manage the master list of documents that can be used in forms</p>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm">
          {error}
        </div>
      )}

      {/* Add Document Form */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 mb-8 border border-amber-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">⭐</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Add New Document</h3>
        </div>
        <form onSubmit={handleAddDocument} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-3">Document Name *</label>
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Enter document name"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-3">Description</label>
              <input
                type="text"
                value={newDocDesc}
                onChange={(e) => setNewDocDesc(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Enter description (optional)"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? 'Adding...' : 'Add Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <h3 className="text-2xl font-bold text-slate-800">Existing Documents</h3>
        </div>
        <div className="overflow-x-auto">
          {documents.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-slate-500 text-lg">No documents defined yet. Add one above.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                    ID
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {documents.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {doc.document_id}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-slate-900">
                      {doc.document_name}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-slate-600">
                      {doc.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default MasterDocuments;