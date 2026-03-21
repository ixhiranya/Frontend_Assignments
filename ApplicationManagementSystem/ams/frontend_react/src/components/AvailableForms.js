import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllForms } from '../api/forms';
import { getClientApplications } from '../api/applications';

function AvailableForms() {
  const [forms, setForms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch forms
        const formsResponse = await getAllForms();
        const rows = Array.isArray(formsResponse.data?.data) ? formsResponse.data.data : [];
        const normalizedForms = rows.map((form) => ({
          id: form.id ?? form.form_id,
          name: form.name ?? form.form_name,
          description: form.description,
          fields: form.fields,
        }));
        
        // Fetch applications
        const appsResponse = await getClientApplications();
        const apps = Array.isArray(appsResponse.data?.data) ? appsResponse.data.data : [];
        
        setForms(normalizedForms);
        setApplications(apps);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getApplicationStatus = (formId) => {
    const app = applications.find(app => app.form_id === formId);
    return app ? app.status : null;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">{error}</div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          Available Forms
        </h2>
        <p className="text-slate-600">Browse and apply to available application forms</p>
      </div>
      {forms.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-slate-500 text-lg">No forms available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {form.name}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {form.fields?.length || 0} fields
                    </p>
                  </div>
                </div>
                {form.description && (
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">{form.description}</p>
                )}
                {(() => {
                  const status = getApplicationStatus(form.id);
                  if (status === 'Submitted') {
                    return (
                      <button
                        disabled
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg cursor-not-allowed"
                      >
                        ✅ Applied
                      </button>
                    );
                  } else if (status === 'Draft') {
                    return (
                      <button
                        onClick={() => navigate(`/apply/${form.id}`)}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 font-semibold"
                      >
                        Continue Application
                      </button>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => navigate(`/apply/${form.id}`)}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 font-semibold"
                      >
                        Apply Now
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AvailableForms;
