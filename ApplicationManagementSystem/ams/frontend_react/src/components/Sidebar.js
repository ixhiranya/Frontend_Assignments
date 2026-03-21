import React from 'react';

function Sidebar({ activeTab, setActiveTab, userRole }) {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'forms', label: 'Forms', icon: '📋' },
    { id: 'applications', label: 'Applications', icon: '📄' },
    { id: 'master', label: 'Master Documents', icon: '⭐', special: true },
    { id: 'form-builder', label: 'Create Form', icon: '✏️' },
  ];

  const clientMenuItems = [
    { id: 'available-forms', label: 'Available Forms', icon: '📝' },
    { id: 'my-applications', label: 'My Applications', icon: '📂' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : clientMenuItems;

  return (
    <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl min-h-screen">
      <div className="p-8 border-b border-slate-700">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AMS
        </h2>
        <p className="text-slate-400 text-sm mt-2 font-medium">
          {userRole === 'admin' ? 'Admin Panel' : 'Client Portal'}
        </p>
      </div>

      <nav className="mt-8 px-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-6 py-4 mb-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 ${
              item.special
                ? activeTab === item.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 transform scale-105'
                  : 'bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/20'
                : activeTab === item.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {item.special && (
              <span className="ml-auto text-xs bg-amber-400/20 text-amber-300 px-2 py-1 rounded-full border border-amber-400/30">
                PRO
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
