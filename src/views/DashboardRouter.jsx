import React from 'react';
import useAuthStore from '../store/authStore';
import Dashboard from './Dashboard';
import SaaSDashboard from './SaaSDashboard';

export default function DashboardRouter() {
  const { role, user } = useAuthStore();
  
  // Lógica exacta que usa el Sidebar para determinar si es SuperAdmin
  const isSuperAdmin = role === 'admin' || user?.email === 'amadomora@gmail.com';

  if (isSuperAdmin) {
    return <SaaSDashboard />;
  }

  // Si es un inquilino / empresa
  return <Dashboard />;
}
