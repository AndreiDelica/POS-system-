import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Loader2, DollarSign, Search, Calendar, User } from 'lucide-react';

export const SalaryMonitoring: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // By using employee route, we can get embedded attendances (if populated).
      // Let's modify employee route or fetch both.
      const epRes = await api('/employees');
      const attRes = await api('/attendance');
      
      const computeSalary = epRes.map((emp: any) => {
         // get all attendances
         const empAtt = attRes.filter((a: any) => a.employee_id && (a.employee_id._id === emp._id || a.employee_id === emp._id));
         const totalHours = empAtt.reduce((sum: number, a: any) => sum + (a.totalHours || 0), 0);
         // Assuming basic rate 60
         const hourlyRate = 60;
         return {
            ...emp,
            totalHours,
            estimatedSalary: totalHours * hourlyRate,
            presentDays: empAtt.length
         }
      });
      setEmployees(computeSalary);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-[#FFD300] w-8 h-8" /></div>;

  return (
    <div className="flex flex-col gap-6 p-2 h-full">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Salary Monitoring</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Automatic payroll estimates based on attendance.</p>
          </div>
          
          <div className="relative w-64">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search employee..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#FFD300] outline-none font-medium text-slate-800"
             />
          </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
         <div className="flex-1 overflow-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                 <tr>
                   <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Employee</th>
                   <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Branch</th>
                   <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-center">Days Present</th>
                   <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-center">Total Hours</th>
                   <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-right">Est. Salary Component</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                   {filtered.length === 0 ? (
                       <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No employees found.</td></tr>
                   ) : (
                       filtered.map(emp => (
                           <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-700 flex items-center">
                                <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center mr-3 text-slate-500">
                                   <User className="w-4 h-4" />
                                </div>
                                <div>
                                   <div>{emp.name}</div>
                                   <div className="text-xs font-medium text-slate-400 font-mono mt-0.5">{emp.nfc_uid || 'No UID'}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-600">
                                {emp.branch_id?.name || 'Unassigned'}
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-slate-900">
                                {emp.presentDays}
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-slate-900">
                                {emp.totalHours.toFixed(2)} hrs
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  <span className="font-black text-lg">₱{emp.estimatedSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                              </td>
                           </tr>
                       ))
                   )}
               </tbody>
             </table>
         </div>
      </div>
    </div>
  );
};
