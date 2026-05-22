import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { AdminLayout } from './layouts/AdminLayout.js';
import { BranchLayout } from './layouts/BranchLayout.js';
import { POSPage } from './pages/POSPage.js';
import { ServicesManagement } from './pages/ServicesManagement.js';
import { EmployeesManagement } from './pages/EmployeesManagement.js';
import { BranchDashboard } from './pages/BranchDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { OrdersManagement } from './pages/OrdersManagement.js';
import { BranchManagement } from './pages/BranchManagement.js';
import { WorkforceBranches } from './pages/WorkforceBranches.js';
import { SalaryMonitoring } from './pages/SalaryMonitoring.js';
import { GlobalAnalytics } from './pages/GlobalAnalytics.js';
import { QueuePage } from './pages/QueuePage.js';
import { AttendancePage } from './pages/AttendancePage.js';

// Dummy stubs for initial tests
const Dashboard = ({ title }: { title: string }) => <div className="p-8"><h1 className="text-2xl font-bold">{title}</h1></div>;

const AppRoutes = () => {
  const { isLoading, user } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-10 h-10 border-4 border-[#FFD300] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
         <Route index element={<AdminDashboard />} />
         <Route path="services" element={<ServicesManagement />} />
         <Route path="workforce" element={<WorkforceBranches />} />
         <Route path="employees" element={<EmployeesManagement />} />
         <Route path="attendance" element={<AttendancePage />} />
         <Route path="salary" element={<SalaryMonitoring />} />
         <Route path="analytics" element={<GlobalAnalytics />} />
         <Route path="orders" element={<OrdersManagement />} />
         <Route path="branches" element={<BranchManagement />} />
         <Route path="settings" element={<Dashboard title="Settings" />} />
      </Route>

      {/* Branch Routes */}
      <Route path="/branch" element={<BranchLayout />}>
         <Route index element={<BranchDashboard />} />
         <Route path="pos" element={<POSPage />} />
         <Route path="queue" element={<QueuePage />} />
         <Route path="attendance" element={<AttendancePage />} />
         <Route path="analytics" element={<BranchDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/branch') : '/login'} replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
