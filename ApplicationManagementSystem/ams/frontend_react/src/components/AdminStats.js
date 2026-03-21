import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../api/admin';

function AdminStats() {
  const [stats, setStats] = useState({
    totalForms: 0,
    totalApplications: 0,
    totalClients: 0,
    submittedApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await getAdminStats();
        const statsData = statsRes.data?.data || {};

        setStats({
          totalForms: statsData.total_forms || 0,
          totalApplications: statsData.total_apps || 0,
          totalClients: statsData.total_clients || 0,
          submittedApplications: statsData.submitted_apps || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Forms', value: stats.totalForms, color: 'from-blue-500 to-blue-600', icon: '📋', bgColor: 'from-blue-50 to-blue-100' },
    { title: 'Total Applications', value: stats.totalApplications, color: 'from-emerald-500 to-emerald-600', icon: '📄', bgColor: 'from-emerald-50 to-emerald-100' },
    { title: 'Total Clients', value: stats.totalClients, color: 'from-amber-500 to-amber-600', icon: '👥', bgColor: 'from-amber-50 to-amber-100' },
    { title: 'Submitted', value: stats.submittedApplications, color: 'from-purple-500 to-purple-600', icon: '✅', bgColor: 'from-purple-50 to-purple-100' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className={`bg-gradient-to-br ${card.bgColor} rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300`}>
            <div className={`bg-gradient-to-r ${card.color} rounded-xl p-4 w-16 h-16 mb-4 flex items-center justify-center shadow-lg`}>
              <span className="text-white text-2xl">{card.icon}</span>
            </div>
            <h3 className="text-slate-600 text-sm font-semibold mb-2 uppercase tracking-wide">{card.title}</h3>
            <p className="text-4xl font-bold text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminStats;
