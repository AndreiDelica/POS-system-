import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Loader2, ExternalLink, Download, FileText, Store } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, AreaChart, Area, Cell, Legend } from 'recharts';

export const GlobalAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('GLOBAL');

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (data) {
       // Just generating dynamic shifts to simulate branch data without a full backend branch analytics endpoint yet.
    }
  }, [selectedBranch]);

  const fetchData = async () => {
    try {
      const [dbStats, dbBranches] = await Promise.all([
         api('/analytics'),
         api('/branches')
      ]);
      setBranches(dbBranches);
      
      const mockWeeklySales = [
         { name: 'Mon', revenue: 1500, volume: 45 },
         { name: 'Tue', revenue: 2300, volume: 62 },
         { name: 'Wed', revenue: 3400, volume: 89 },
         { name: 'Thu', revenue: 2800, volume: 75 },
         { name: 'Fri', revenue: 4800, volume: 110 },
         { name: 'Sat', revenue: 5200, volume: 130 },
         { name: 'Sun', revenue: 3900, volume: 95 },
      ];

      const mockBranchPerf = [
         { name: 'Main Branch', orders: 450, revenue: 12500 },
         { name: 'RTU Branch', orders: 320, revenue: 8400 },
         { name: 'DFA Branch', orders: 280, revenue: 6100 },
      ];

      const mockPeakHours = [
         { hour: '8 AM', traffic: 10 },
         { hour: '10 AM', traffic: 45 },
         { hour: '12 PM', traffic: 85 },
         { hour: '2 PM', traffic: 100 },
         { hour: '4 PM', traffic: 60 },
         { hour: '6 PM', traffic: 30 },
      ];

      const mockServicesProfit = [
         { name: 'Tarpaulin', margin: 85, revenue: 14000 },
         { name: 'Mug Print', margin: 60, revenue: 5000 },
         { name: 'Doc Print', margin: 40, revenue: 3000 },
         { name: 'ID PVC', margin: 75, revenue: 8000 },
      ];

      const mockEmployeesProd = [
         { name: 'Alex M.', efficiency: 95, ordersHandled: 120 },
         { name: 'Sarah J.', efficiency: 88, ordersHandled: 105 },
         { name: 'Mark T.', efficiency: 92, ordersHandled: 115 },
      ];

      setData({
         stats: dbStats,
         weeklyChart: mockWeeklySales,
         branchChart: mockBranchPerf,
         peakHours: mockPeakHours,
         servicesProfit: mockServicesProfit,
         employeeProd: mockEmployeesProd,
         aov: 245.50
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center h-full"><Loader2 className="animate-spin text-[#FFD300] w-10 h-10" /></div>;

  // Branch data multiplier simulation
  const m = selectedBranch === 'GLOBAL' ? 1 : 0.4;

  const currentWeeklyData = data.weeklyChart.map((d: any) => ({
      ...d, 
      revenue: d.revenue * m, 
      volume: Math.floor(d.volume * m)
  }));
  
  const currentTotalVolume = currentWeeklyData.reduce((sum: number, cur: any) => sum + cur.volume, 0);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Business Intelligence</h2>
            <p className="text-slate-500 font-medium mt-1">Deep analytics and performance metrics.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative">
                <Store className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                   value={selectedBranch}
                   onChange={e => setSelectedBranch(e.target.value)}
                   className="pl-9 pr-8 py-2.5 bg-white border border-slate-300 text-slate-900 font-bold text-sm rounded-xl outline-none focus:ring-2 focus:ring-[#FFD300] shadow-sm appearance-none cursor-pointer hover:bg-slate-50"
                >
                   <option value="GLOBAL">Global Enterprise</option>
                   {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                   ))}
                </select>
             </div>
             
             <div className="flex gap-2">
                <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 font-bold text-sm rounded-xl hover:bg-slate-50 flex items-center shadow-sm">
                    <FileText className="w-4 h-4 mr-2" /> Export
                </button>
             </div>
          </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Average Order Value</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight">₱{data.aov.toFixed(2)}</p>
         </div>
         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Volume (7 Days)</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight">{currentTotalVolume}</p>
         </div>
         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Highest Margin Service</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tight">Tarpaulin <span className="text-lg text-green-600 ml-2">85%</span></p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Order Volume Trends */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-96">
            <div className="mb-6">
               <h3 className="text-lg font-black text-slate-900 tracking-tight">Revenue Trends</h3>
               <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">7 Day Trajectory</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={currentWeeklyData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue (₱)" stroke="#0F172A" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                 </LineChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Branch Performance / Top Services depending on mode */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-96">
            <div className="mb-6">
               <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {selectedBranch === 'GLOBAL' ? 'Branch Performance' : 'Service Popularity'}
               </h3>
               <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                  {selectedBranch === 'GLOBAL' ? 'Revenue & Orders Split' : 'Top selling services'}
               </p>
            </div>
            <div className="flex-1 min-h-0">
               {selectedBranch === 'GLOBAL' ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data.branchChart} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 'bold'}} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#0F172A', fontSize: 12, fontWeight: 'bold'}} dx={-10} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue (₱)" fill="#FFD300" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="orders" name="Orders" fill="#0F172A" radius={[0, 4, 4, 0]} barSize={20} />
                     </BarChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="flex-1 overflow-auto pr-2 space-y-6 mt-4">
                     {data.servicesProfit.map((service: any, idx: number) => (
                        <div key={idx} className="relative">
                           <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-slate-800 text-sm">{service.name}</span>
                              <div className="flex items-center gap-4">
                                 <span className="text-sm font-black text-[#FFD300]">{(service.revenue * m).toLocaleString()}</span>
                              </div>
                           </div>
                           <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                              <div className="bg-[#FFD300] h-full rounded-full" style={{ width: `${service.margin}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Peak Hours */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-96">
            <div className="mb-6">
               <h3 className="text-lg font-black text-slate-900 tracking-tight">Peak Business Hours</h3>
               <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Traffic Density</p>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.peakHours} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12, fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                    <Bar dataKey="traffic" name="Foot Traffic %" radius={[4, 4, 0, 0]}>
                       {data.peakHours.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.traffic > 75 ? '#8B0000' : '#FFD300'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

