import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Loader2, Users, Store, Clock, DollarSign, User, Check, X } from 'lucide-react';
import { cn } from '../lib/utils.js';

type ModalTabType = 'EMPLOYEES' | 'ATTENDANCE' | 'PAYROLL';

export const WorkforceBranches: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedBranchCard, setSelectedBranchCard] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<ModalTabType>('EMPLOYEES');
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, branchRes, attRes] = await Promise.all([
        api('/employees'),
        api('/branches'),
        api('/attendance')
      ]);
      setEmployees(empRes);
      setBranches(branchRes);
      setAttendances(attRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEmployees = () => {
    if (selectedBranch === 'ALL') return employees;
    return employees.filter(emp => (emp.branch_id?._id || emp.branch_id) === selectedBranch);
  };
  
  const filteredEmployees = getFilteredEmployees();

  const getFilteredAttendances = () => {
    // Filter attendances based on the filtered employees list
    const validEmpIds = new Set(filteredEmployees.map(e => e._id));
    return attendances.filter(a => validEmpIds.has(a.employee_id?._id || a.employee_id));
  };

  const filteredAttendances = getFilteredAttendances();

  const getTodayAttendances = () => {
    const today = new Date().toDateString();
    return filteredAttendances.filter(a => new Date(a.date).toDateString() === today);
  };
  
  const computePayroll = () => {
    return filteredEmployees.map((emp: any) => {
       const empAtt = filteredAttendances.filter((a: any) => a.employee_id && (a.employee_id._id === emp._id || a.employee_id === emp._id));
       const totalHours = empAtt.reduce((sum: number, a: any) => sum + (a.totalHours || 0), 0);
       return { ...emp, totalHours, estimatedSalary: totalHours * 60, presentDays: empAtt.length };
    });
  };

  if (loading) return <div className="p-8 flex justify-center items-center h-full"><Loader2 className="animate-spin text-[#FFD300] w-10 h-10" /></div>;

  const todayAtt = getTodayAttendances();
  const payrollData = computePayroll();
  const totalPayrollEst = payrollData.reduce((sum, e) => sum + e.estimatedSalary, 0);
  
  const displayedBranches = selectedBranch === 'ALL' 
    ? branches 
    : branches.filter(b => b._id === selectedBranch);

  // Modal data processing
  const modalEmployees = selectedBranchCard 
    ? employees.filter(emp => (emp.branch_id?._id || emp.branch_id) === selectedBranchCard._id)
    : [];

  const modalValidEmpIds = new Set(modalEmployees.map(e => e._id));
  const modalAttendances = attendances.filter(a => modalValidEmpIds.has(a.employee_id?._id || a.employee_id));

  const modalPayrollData = modalEmployees.map((emp: any) => {
       const empAtt = modalAttendances.filter((a: any) => a.employee_id && (a.employee_id._id === emp._id || a.employee_id === emp._id));
       const totalHours = empAtt.reduce((sum: number, a: any) => sum + (a.totalHours || 0), 0);
       return { ...emp, totalHours, estimatedSalary: totalHours * 60, presentDays: empAtt.length };
  });

  return (
    <>
    <div className="flex flex-col gap-6 pb-12 h-auto min-h-full">
      {/* Header & KPI Summary */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
           <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Branch Network</h2>
             <p className="text-slate-500 font-medium mt-1">Manage workforce and operations across branches.</p>
           </div>
           
           <div className="relative">
              <Store className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                 value={selectedBranch}
                 onChange={e => setSelectedBranch(e.target.value)}
                 className="pl-10 pr-8 py-2.5 bg-white border border-slate-300 text-slate-900 font-bold text-sm rounded-xl outline-none focus:ring-2 focus:ring-[#FFD300] shadow-sm appearance-none cursor-pointer hover:bg-slate-50 min-w-[200px]"
              >
                 <option value="ALL">All Branches (Global)</option>
                 {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                 ))}
              </select>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mr-4">
               <Users className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Employees</h3>
               <p className="text-2xl font-black text-slate-900 leading-none mt-1">{filteredEmployees.length}</p>
             </div>
           </div>
           
           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center">
             <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mr-4">
               <Clock className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Present Today</h3>
               <p className="text-2xl font-black text-slate-900 leading-none mt-1">{todayAtt.length} <span className="text-sm text-slate-400 font-bold ml-1">/ {filteredEmployees.length}</span></p>
             </div>
           </div>

           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center">
             <div className="w-12 h-12 bg-yellow-50 text-yellow-700 rounded-xl flex items-center justify-center mr-4">
               <DollarSign className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Est. Payroll</h3>
               <p className="text-2xl font-black text-slate-900 leading-none mt-1">₱{totalPayrollEst.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
             </div>
           </div>

           <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center">
             <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mr-4">
               <Store className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Branches</h3>
               <p className="text-2xl font-black text-slate-900 leading-none mt-1">{displayedBranches.length}</p>
             </div>
           </div>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1 min-h-[400px] p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayedBranches.map(b => (
                 <div 
                   key={b._id} 
                   onClick={() => { setSelectedBranchCard(b); setModalTab('EMPLOYEES'); }}
                   className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col hover:border-slate-400 hover:shadow-md transition-all cursor-pointer shadow-sm group"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="text-lg font-black text-slate-900 group-hover:text-[#FFD300] transition-colors">{b.name}</h3>
                       <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold whitespace-nowrap flex items-center">
                          <Check className="w-3 h-3 mr-1" /> Operational
                       </span>
                    </div>
                    
                    <p className="text-xs font-bold text-slate-500 mb-6">{b.address}</p>
                    
                    <div className="mt-auto grid grid-cols-2 gap-3 mb-4">
                       <div className="bg-white p-3 border border-slate-200 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Total Staff</p>
                          <p className="text-lg font-black text-slate-900">{employees.filter(e => b._id === (e.branch_id?._id || e.branch_id)).length}</p>
                       </div>
                       <div className="bg-white p-3 border border-slate-200 rounded-xl">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Present Today</p>
                          <p className="text-lg font-black text-green-600">
                             {attendances.filter(a => employees.find(e => (e._id === (a.employee_id?._id || a.employee_id) && b._id === (e.branch_id?._id || e.branch_id))) && new Date(a.date).toDateString() === new Date().toDateString()).length}
                          </p>
                       </div>
                    </div>

                    <div className="w-full text-center py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest mt-2 group-hover:bg-[#FFD300] group-hover:text-slate-900 transition-colors">
                       Manage Workforce
                    </div>
                 </div>
              ))}
           </div>
      </div>
    </div>
      {/* Branch Modal Details */}
      {selectedBranchCard && (
         <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-full flex flex-col shadow-2xl relative overflow-hidden flex-1">
               <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50 flex-shrink-0">
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedBranchCard.name} <span className="text-slate-400 font-medium text-lg ml-2">Workforce Details</span></h2>
                     <p className="text-sm font-bold text-slate-500 tracking-widest uppercase mt-1">{selectedBranchCard.address}</p>
                  </div>
                  <button 
                     onClick={() => setSelectedBranchCard(null)}
                     className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-900"
                  >
                     <X className="w-6 h-6" />
                  </button>
               </div>
               
               <div className="px-6 py-3 border-b border-slate-200 flex gap-2 flex-shrink-0 bg-white">
                  {[
                    { id: 'EMPLOYEES', label: 'Employee Directory', icon: User },
                    { id: 'ATTENDANCE', label: 'Attendance Logs', icon: Clock },
                    { id: 'PAYROLL', label: 'Payroll Monitoring', icon: DollarSign },
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setModalTab(tab.id as ModalTabType)}
                        className={cn(
                           "flex items-center px-4 py-2 text-sm font-bold rounded-lg transition-all",
                           modalTab === tab.id ? "bg-[#FFD300] text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                     >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                     </button>
                  ))}
               </div>
               
               <div className="flex-1 overflow-auto bg-slate-50 p-6 min-h-0">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
                     {modalTab === 'EMPLOYEES' && (
                        <div className="overflow-x-auto h-full max-h-full">
                           <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 shadow-sm">
                                <tr>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Employee</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Role</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-center">NFC UID</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {modalEmployees.length === 0 && (
                                   <tr>
                                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No employees assigned</td>
                                   </tr>
                                )}
                                {modalEmployees.map(emp => (
                                  <tr key={emp._id} className="hover:bg-slate-50">
                                     <td className="px-6 py-4">
                                       <div className="flex items-center">
                                          <div className="w-8 h-8 rounded bg-slate-200 text-slate-500 flex items-center justify-center mr-3 font-bold text-xs">
                                            {emp.name?.charAt(0)}
                                          </div>
                                          <span className="font-bold text-slate-900">{emp.name}</span>
                                       </div>
                                     </td>
                                     <td className="px-6 py-4">
                                       <span className={cn("px-2 py-1 rounded text-xs font-bold", 
                                          emp.role === 'ADMIN' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                                       )}>
                                          {emp.role}
                                       </span>
                                     </td>
                                     <td className="px-6 py-4 text-center font-mono text-xs font-bold text-slate-400">
                                        {emp.nfc_uid ? emp.nfc_uid : <span className="text-red-400">UNASSIGNED</span>}
                                     </td>
                                  </tr>
                                ))}
                              </tbody>
                           </table>
                        </div>
                     )}

                     {modalTab === 'ATTENDANCE' && (
                        <div className="overflow-x-auto h-full max-h-full">
                           <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 shadow-sm z-10">
                                <tr>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Date</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Employee</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Time In</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Time Out</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-right">Total Hours</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {modalAttendances.length === 0 && (
                                   <tr>
                                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No attendance logs found</td>
                                   </tr>
                                 )}
                                 {modalAttendances.map(att => (
                                     <tr key={att._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                          {new Date(att.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700 flex items-center">
                                          {att.employee_id?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-green-700 font-medium">
                                          {att.timeIn ? new Date(att.timeIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                          {att.timeOut ? new Date(att.timeOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">Active</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                          {att.totalHours ? att.totalHours.toFixed(2) + 'h' : '--'}
                                        </td>
                                     </tr>
                                  ))}
                              </tbody>
                           </table>
                        </div>
                     )}

                     {modalTab === 'PAYROLL' && (
                        <div className="overflow-x-auto h-full max-h-full">
                           <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 shadow-sm z-10">
                                <tr>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Employee</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-center">Days Present</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-center">Total Hours</th>
                                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-right">Est. Base Salary (₱60/hr)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {modalPayrollData.length === 0 && (
                                   <tr>
                                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No payroll data found</td>
                                   </tr>
                                 )}
                                 {modalPayrollData.map(emp => (
                                    <tr key={emp._id} className="hover:bg-slate-50">
                                       <td className="px-6 py-4 font-bold text-slate-900">{emp.name}</td>
                                       <td className="px-6 py-4 text-center text-slate-600 font-medium">{emp.presentDays}</td>
                                       <td className="px-6 py-4 text-center text-slate-900 font-black">{emp.totalHours.toFixed(2)} hrs</td>
                                       <td className="px-6 py-4 text-right">
                                          <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 font-black text-lg rounded border border-green-100">
                                            ₱{emp.estimatedSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      )}
    </>
  );
};
