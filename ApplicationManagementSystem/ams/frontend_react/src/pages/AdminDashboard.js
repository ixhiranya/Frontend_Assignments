import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminStats from '../components/AdminStats';
import FormsList from '../components/FormsList';
import ApplicationsList from '../components/ApplicationsList';
import MasterDocuments from '../components/MasterDocuments';
import { ROUTES } from '../routes';

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-lg border-b border-slate-200 px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-1">Manage your application management system</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 p-8">
          {activeTab === 'dashboard' && <AdminStats />}
          {activeTab === 'forms' && <FormsList />}
          {activeTab === 'applications' && <ApplicationsList />}
          {activeTab === 'master' && <MasterDocuments />}
          {activeTab === 'form-builder' && (
            <div className="text-center">
              <button
                onClick={() => navigate(ROUTES.formBuilder)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 font-semibold text-lg"
              >
                Go to Form Builder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
