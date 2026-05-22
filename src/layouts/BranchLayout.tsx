import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { LogOut, LayoutDashboard, ShoppingCart, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils.js';

export const BranchLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'BRANCH_USER') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/branch', icon: LayoutDashboard },
    { name: 'POS Terminal', path: '/branch/pos', icon: ShoppingCart },
    { name: 'Order Queue', path: '/branch/queue', icon: Clock },
    { name: 'Attendance', path: '/branch/attendance', icon: Clock },
    { name: 'Analytics', path: '/branch/analytics', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen w-full bg-white font-sans text-slate-900 overflow-hidden">
      <aside className="w-64 border-r border-slate-100 flex flex-col">
        <div className="p-6 mb-4">
          <div className="w-12 h-12 bg-[#FFD300] rounded-lg mb-3 flex items-center justify-center font-bold text-xl">D</div>
          <h1 className="text-xs font-black tracking-widest uppercase text-slate-400">Delicas Worldwide</h1>
          <p className="text-sm font-semibold text-slate-900">Branch System</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/branch' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={cn(
                  "flex items-center p-3 rounded-xl transition-colors",
                  isActive 
                    ? "bg-slate-50 border-l-4 border-[#FFD300] text-slate-900" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
            <div className="text-xs">
              <p className="font-bold">{user.username}</p>
              <p className="text-slate-400 uppercase">Branch User</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-[#8B0000] font-medium border border-[#8B0000]/20 rounded-lg hover:bg-[#8B0000]/5 transition-colors text-xs"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-slate-50 h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-100 p-4 flex justify-between items-center">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">System Navigation</h1>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-full">SESSION: ACTIVE</span>
            </div>
        </header>
        <div className="flex-1 overflow-auto h-full flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
