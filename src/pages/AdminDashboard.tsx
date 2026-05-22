import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { TrendingUp, ShoppingBag, DollarSign, Loader2, Users, Store, Activity, ArrowRight, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/analytics').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Loader2 className="animate-spin text-[#FFD300] w-10 h-10" /></div>;

  // Mock revenue trend
  const revenueData = [
     { name: 'Mon', revenue: data?.todaySales * 0.4 || 1200 },
     { name: 'Tue', revenue: data?.todaySales * 0.6 || 2100 },
     { name: 'Wed', revenue: data?.todaySales * 0.5 || 1800 },
     { name: 'Thu', revenue: data?.todaySales * 0.8 || 3200 },
     { name: 'Fri', revenue: data?.todaySales * 1.2 || 4500 },
     { name: 'Sat', revenue: data?.todaySales * 1.5 || 5300 },
     { name: 'Sun', revenue: data?.todaySales * 1.0 || 3800 },
  ];

  return (
    <div className="flex flex-col gap-8 pb-8">
      
      {/* Header section */}
      <div className="flex flex-col space-y-1">
         <h2 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h2>
         <p className="text-slate-500 font-medium">Real-time summary of business operations and performance.</p>
      </div>
      
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
             <DollarSign className="w-24 h-24 text-slate-900 -mr-6 -mt-6" />
          </div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Today's Revenue</h3>
          <p className="text-4xl font-black text-slate-900 relative z-10 tracking-tight">
            ₱{data?.todaySales?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}
          </p>
          <div className="mt-4 flex items-center text-sm font-bold text-green-600 relative z-10 bg-green-50 w-max px-2 py-1 rounded-md">
             <TrendingUp className="w-4 h-4 mr-1" /> +12.5% vs yesterday
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
             <ShoppingBag className="w-24 h-24 text-slate-900 -mr-6 -mt-6" />
          </div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 relative z-10">Total Orders Today</h3>
          <div className="flex items-end gap-x-3 relative z-10">
             <p className="text-4xl font-black text-slate-900 tracking-tight">{data?.todayOrderCount || 0}</p>
             <p className="text-sm font-bold text-slate-400 mb-1">({data?.pendingOrders || 0} Pending)</p>
          </div>
          <div className="mt-4 flex items-center text-sm font-bold text-[#FFD300] bg-yellow-50 text-yellow-800 w-max px-2 py-1 rounded-md relative z-10">
             <Activity className="w-4 h-4 mr-1" /> High Activity
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
             <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Employees</h3>
                <p className="text-4xl font-black text-slate-900 tracking-tight">{data?.totalEmployees || 0}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <Users className="w-6 h-6" />
             </div>
          </div>
          <Link to="/admin/attendance" className="mt-6 flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 w-max group">
             View Attendance <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between">
             <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Active Branches</h3>
                <p className="text-4xl font-black text-slate-900 tracking-tight">{data?.activeBranches || 0}</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
               <Store className="w-6 h-6" />
             </div>
          </div>
          <Link to="/admin/branches" className="mt-6 flex items-center text-sm font-bold text-purple-600 hover:text-purple-700 w-max group">
             Manage Branches <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      
      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Chart */}
         <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Trends</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Last 7 Days</p>
               </div>
               <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FFD300]">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
               </select>
            </div>
            
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD300" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FFD300" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#FFD300" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Side Cards */}
         <div className="flex flex-col gap-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-500 rounded-full blur-3xl opacity-20"></div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Peak Hour Insight</h3>
               <div className="flex items-start">
                  <div className="bg-slate-800 p-3 rounded-xl mr-4 border border-slate-700">
                     <Clock className="w-6 h-6 text-[#FFD300]" />
                  </div>
                  <div>
                     <p className="text-lg font-bold">1:00 PM - 3:00 PM</p>
                     <p className="text-sm font-medium text-slate-400 mt-1">Historically highest volume interval.</p>
                  </div>
               </div>
               <div className="mt-6 pt-4 border-t border-slate-800">
                 <Link to="/admin/analytics" className="text-[#FFD300] text-sm font-bold flex items-center hover:text-yellow-400 transition-colors">
                    View Full Analysis <ArrowRight className="w-4 h-4 ml-2" />
                 </Link>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex-1">
               <h3 className="text-sm font-black text-slate-900 tracking-tight mb-4">Top Services (By Volume)</h3>
               <div className="space-y-4">
                  {[
                    { name: 'Tarpaulin Printing', val: '45%' },
                    { name: 'Document Print', val: '30%' },
                    { name: 'Photo Print', val: '15%' },
                    { name: 'Other', val: '10%' }
                  ].map((s, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-sm font-bold text-slate-700 mb-1.5">
                          <span>{s.name}</span>
                          <span>{s.val}</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-[#FFD300] h-2 rounded-full" style={{ width: s.val }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

