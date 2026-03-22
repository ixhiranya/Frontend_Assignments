import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AvailableForms from '../components/AvailableForms';
import MyApplications from '../components/MyApplications';
import { ROUTES } from '../routes';

function ClientDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('available-forms');
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole="client" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Client Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'available-forms' && <AvailableForms />}
          {activeTab === 'my-applications' && <MyApplications />}
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;
