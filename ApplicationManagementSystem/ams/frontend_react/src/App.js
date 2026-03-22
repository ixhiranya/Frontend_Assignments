import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import FormBuilder from './pages/FormBuilder';
import ApplyForm from './pages/ApplyForm';
import { ROUTES, getDefaultRouteByRole } from './routes';

const isValidRole = (role) => role === 'admin' || role === 'client';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = (localStorage.getItem('userRole') || '').toLowerCase();
    if (token && isValidRole(role)) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      // Prevent redirect loops when stale/invalid role values exist in localStorage.
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route 
          path={ROUTES.login}
          element={
            isAuthenticated && isValidRole(userRole) ? <Navigate to={getDefaultRouteByRole(userRole)} replace /> :
            <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
          } 
        />
        <Route
          path={ROUTES.register}
          element={
            isAuthenticated && isValidRole(userRole) ? <Navigate to={getDefaultRouteByRole(userRole)} replace /> :
            <Register />
          }
        />
        <Route 
          path={ROUTES.admin}
          element={
            isAuthenticated && userRole === 'admin' ? 
            <AdminDashboard onLogout={handleLogout} /> : 
            <Navigate to={ROUTES.login} replace />
          } 
        />
        <Route 
          path={ROUTES.client}
          element={
            isAuthenticated && userRole === 'client' ? 
            <ClientDashboard onLogout={handleLogout} /> : 
            <Navigate to={ROUTES.login} replace />
          } 
        />
        <Route 
          path={ROUTES.formBuilder}
          element={
            isAuthenticated && userRole === 'admin' ? 
            <FormBuilder onLogout={handleLogout} /> : 
            <Navigate to={ROUTES.login} replace />
          } 
        />
        <Route 
          path={ROUTES.applyForm}
          element={
            isAuthenticated && userRole === 'client' ? 
            <ApplyForm onLogout={handleLogout} /> : 
            <Navigate to={ROUTES.login} replace />
          } 
        />
        <Route
          path={ROUTES.root}
          element={<Navigate to={isAuthenticated && isValidRole(userRole) ? getDefaultRouteByRole(userRole) : ROUTES.login} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated && isValidRole(userRole) ? getDefaultRouteByRole(userRole) : ROUTES.login} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
