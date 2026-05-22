import React, { useState } from 'react';
import { Outlet, Navigate, Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { LogOut, Home, Users, Settings, Box, Store, Clock, DollarSign, LineChart, Receipt, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils.js';

const navSections = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', icon: Home, label: 'Dashboard', exact: true }
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/services', icon: Box, label: 'Services Config' },
    ]
  },
  {
    title: 'Management',
    items: [
      { to: '/admin/workforce', icon: Store, label: 'Branch Network' },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { to: '/admin/analytics', icon: LineChart, label: 'Analytics' },
      { to: '/admin/orders', icon: Receipt, label: 'Orders & Receipts' },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/admin/settings', icon: Settings, label: 'Settings' }
    ]
  }
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-[#FFD300] rounded-xl flex items-center justify-center font-black text-xl shadow-sm text-slate-900">D</div>
          <div>
             <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">Delicas Worldwide</h1>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Business Center</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto w-full custom-scrollbar">
          {navSections.map((section, sIdx) => (
             <div key={sIdx}>
                <h3 className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{section.title}</h3>
                <div className="space-y-1">
                   {section.items.map(item => {
                     const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                     return (
                        <Link 
                          key={item.to}
                          to={item.to}
                          className={cn(
                             "flex items-center px-3 py-2.5 rounded-xl transition-all font-bold text-sm",
                             isActive 
                               ? "bg-[#FFD300] text-slate-900 shadow-sm" 
                               : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-slate-900" : "text-slate-400")} />
                          {item.label}
                        </Link>
                     );
                   })}
                </div>
             </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between p-2">
             <div className="flex items-center space-x-3">
               <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                 <Users className="w-4 h-4 text-slate-500" />
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-900">{user.username}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Administrator</p>
               </div>
             </div>
             <button 
                onClick={logout}
                className="w-8 h-8 flex items-center justify-center text-[#8B0000] hover:bg-[#8B0000]/10 rounded-lg transition-colors"
                title="Sign Out"
             >
                <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 px-8 flex justify-between items-center shadow-sm z-0">
            <h1 className="text-sm font-bold text-slate-800 tracking-tight flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              Global Operations
            </h1>
            <div className="flex items-center space-x-4">
               <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
                 {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
               </span>
            </div>
        </header>
        <div className="flex-1 overflow-auto h-full p-8 z-0 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

