import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Loader2, Fingerprint, Clock, CalendarDays, BarChart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [attendances, setAttendances] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAttendances();
    }
  }, [user]);

  const fetchAttendances = async () => {
    setLoadingList(true);
    try {
      const data = await api('/attendance');
      setAttendances(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleTap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
       const res = await api('/attendance/tap', { method: 'POST', body: JSON.stringify({ nfc_uid: uid }) });
       setMessage({ type: 'success', text: res.message });
       setUid('');
       if (user?.role === 'ADMIN') fetchAttendances();
    } catch (e: any) {
       setMessage({ type: 'error', text: e.message || 'Verification Failed' });
    } finally {
       setLoading(false);
    }
  };

  if (user?.role === 'ADMIN') {
    return (
      <div className="flex flex-col gap-6 p-2 h-full">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Monitoring</h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">Global view of employee time logs.</p>
            </div>
            <div className="flex gap-4 items-center">
               <form onSubmit={handleTap} className="flex gap-2 relative">
                 <input 
                   type="text" 
                   placeholder="Manual NFC UID Entry" 
                   value={uid}
                   onChange={e => setUid(e.target.value)}
                   disabled={loading}
                   className="w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-[#FFD300] outline-none"
                 />
                 <button 
                   type="submit"
                   disabled={loading || !uid}
                   className="bg-[#FFD300] text-black font-bold px-4 py-2 rounded-xl text-sm"
                 >
                   Verify
                 </button>
               </form>
               {message && <span className={`text-xs font-bold ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{message.text}</span>}
            </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
             {loadingList ? (
                <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FFD300] w-8 h-8" /></div>
             ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Date</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Employee</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Time In</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Time Out</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-right">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {attendances.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No attendance logs found.</td></tr>
                     ) : (
                        attendances.map(att => (
                           <tr key={att._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900 border-l-4 border-transparent hover:border-[#FFD300]">
                                {new Date(att.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-700 flex items-center">
                                <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center mr-2 text-[10px] text-slate-500">
                                   {att.employee_id?.name?.charAt(0) || <User className="w-3 h-3" />}
                                </div>
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
                        ))
                     )}
                  </tbody>
                </table>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center">
        
        <div className="w-24 h-24 bg-[#FFD300]/20 rounded-full flex items-center justify-center mb-6">
          <Fingerprint className="w-12 h-12 text-yellow-800" />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 mb-2">Employee Attendance</h2>
        <p className="text-gray-500 font-medium mb-8 text-center">Please tap your NFC ID card or enter UID to Time In / Time Out.</p>
        
        <form onSubmit={handleTap} className="w-full">
          <input 
            type="text" 
            placeholder="NFC UID (e.g. 04-XX-YY-ZZ)" 
            value={uid}
            onChange={e => setUid(e.target.value)}
            disabled={loading}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-center font-mono font-bold text-lg mb-4 focus:ring-2 focus:ring-[#FFD300] outline-none"
            autoFocus 
            required 
          />
          <button 
            type="submit"
            disabled={loading || !uid}
            className="w-full bg-[#FFD300] text-black font-extrabold py-4 rounded-xl shadow-sm hover:bg-[#ebd000] transition-colors flex justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Verify Identity"}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-lg font-bold w-full text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-[#8B0000]'}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};
