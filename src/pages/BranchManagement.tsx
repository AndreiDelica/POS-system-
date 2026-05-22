import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Loader2, Plus, Store, Check, Target, Edit2 } from 'lucide-react';

export const BranchManagement: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const branchRes = await api('/branches');
      setBranches(branchRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-[#FFD300] w-8 h-8" /></div>;

  return (
    <div className="flex flex-col gap-6 p-2 h-full">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Branch Management</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage worldwide operating branches.</p>
          </div>
          <button 
           className="bg-slate-900 text-white font-bold px-5 py-3 rounded-2xl hover:bg-slate-800 transition-colors shadow-sm flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Branch
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         {branches.map(b => (
            <div key={b._id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
               <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                     <Store className="w-6 h-6" />
                  </div>
               </div>
               <h3 className="text-xl font-bold text-slate-900">{b.name}</h3>
               <p className="text-sm font-medium text-slate-500 mb-6">{b.address}</p>
               
               <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                     <span className="text-slate-500 font-medium">Status</span>
                     <span className="flex items-center text-green-600"><Check className="w-4 h-4 mr-1"/> Active</span>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};
