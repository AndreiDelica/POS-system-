import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api.js';
import { Employee, Branch, Attendance } from '../types.js';
import { Plus, Trash2, Edit2, Save, X, Loader2, Upload, Link as LinkIcon, User, MapPin, Briefcase, Calendar, Clock, DollarSign, ChevronRight, Filter } from 'lucide-react';
import { cn } from '../lib/utils.js';

export const EmployeesManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const [form, setForm] = useState<Partial<Employee>>({
    name: '', position: '', salary_rate: 0, branch_id: '', image: '', nfc_uid: ''
  });
  
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, branchRes] = await Promise.all([
        api('/employees'),
        api('/branches')
      ]);
      setEmployees(empRes);
      setBranches(branchRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form._id) {
        await api(`/employees/${form._id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/employees', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchData();
      setForm({ name: '', position: '', salary_rate: 0, branch_id: '', image: '', nfc_uid: '' });
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
        await api(`/employees/${id}`, { method: 'DELETE' });
        fetchData();
        if (selectedEmp?._id === id) setSelectedEmp(null);
    } catch(err: any) {
        alert("Error: " + err.message);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-[#FFD300]" /></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-2">
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Team Members</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Manage employees, salaries, and attendance records.</p>
            </div>
            <button 
            onClick={() => { setForm({ name: '', position: '', salary_rate: 0, branch_id: branches[0]?._id || '', image: '', nfc_uid: '' }); setShowModal(true); setImageTab('upload'); }}
            className="bg-slate-900 text-white font-bold px-5 py-3 rounded-2xl hover:bg-slate-800 transition-colors shadow-sm flex items-center"
            >
            <Plus className="w-5 h-5 mr-2" /> Add Member
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {employees.map(emp => (
                <div 
                    key={emp._id} 
                    onClick={() => setSelectedEmp(emp)}
                    className={cn(
                        "bg-white rounded-3xl border-2 p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-sm flex flex-col",
                        selectedEmp?._id === emp._id ? "border-slate-900 bg-slate-50/50 shadow-md" : "border-slate-100/50 hover:border-slate-300"
                    )}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-slate-500 bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                {emp.image ? <img src={emp.image} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 leading-tight">{emp.name}</h3>
                                <p className="text-sm font-medium text-[#FFD300] bg-yellow-50 px-2 py-0.5 rounded-md inline-block mt-1">{emp.position || 'Staff'}</p>
                            </div>
                        </div>
                        <button onClick={(e) => handleDelete(emp._id, e)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="mt-auto space-y-2 pt-4 border-t border-slate-100">
                        <div className="flex items-center text-sm font-medium text-slate-600">
                            <Briefcase className="w-4 h-4 mr-2 text-slate-400" /> 
                            {branches.find(b => b._id === emp.branch_id)?.name || 'Unassigned'}
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-600">
                            <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                            ₱{emp.salary_rate?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'} / month
                        </div>
                    </div>
                </div>
            ))}
            {employees.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                    <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No employees found</h3>
                    <p className="text-slate-500">Click "Add Member" to get started.</p>
                </div>
            )}
        </div>
      </div>

      {/* Selected Employee Panel */}
      {selectedEmp && (
          <div className="w-full lg:w-96 bg-white border border-slate-100 rounded-3xl flex flex-col shrink-0 shadow-sm overflow-hidden h-fit sticky top-6">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">Member Overview</h3>
                  <button onClick={() => setSelectedEmp(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="p-6 pb-4 flex flex-col items-center border-b border-slate-100">
                  <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 border-4 border-white shadow-md overflow-hidden text-slate-400 flex items-center justify-center font-bold text-3xl">
                      {selectedEmp.image ? <img src={selectedEmp.image} className="w-full h-full object-cover" /> : selectedEmp.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedEmp.name}</h2>
                  <p className="text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs font-bold mt-2 uppercase tracking-wide">{selectedEmp.position || 'Staff'}</p>
              </div>

              <div className="p-6 space-y-4">
                  <h4 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-3">Recent Attendance</h4>
                  <div className="space-y-3">
                      {selectedEmp.attendances && selectedEmp.attendances.length > 0 ? (
                          selectedEmp.attendances.slice(0, 5).map(att => (
                              <div key={att._id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                  <div className="flex items-center">
                                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center mr-3 border border-slate-100">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(att.date).toLocaleString('default', { month: 'short' })}</span>
                                          <span className="text-sm font-bold text-slate-900 leading-none">{new Date(att.date).getDate()}</span>
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-slate-900">Time In</p>
                                          <p className="text-xs text-slate-500 font-medium">{new Date(att.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      {att.timeOut ? (
                                        <>
                                            <p className="text-xs font-bold text-slate-900">Time Out</p>
                                            <p className="text-xs text-slate-500 font-medium">{new Date(att.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </>
                                      ) : (
                                          <span className="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg">ACTIVE</span>
                                      )}
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                              <Calendar className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                              <p className="text-sm text-slate-500 font-medium">No recent logs.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
              <h3 className="font-black text-xl tracking-tight text-slate-900">Add Team Member</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
                <form id="empForm" onSubmit={handleSave} className="space-y-6">
                    {/* Image Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700">Profile Picture</label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                            <button type="button" onClick={() => setImageTab('upload')} className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center transition-all ${imageTab === 'upload' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload File
                            </button>
                            <button type="button" onClick={() => setImageTab('url')} className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center transition-all ${imageTab === 'url' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                                <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> Web URL
                            </button>
                        </div>

                        {imageTab === 'upload' ? (
                            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-slate-400 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                {form.image && form.image.startsWith('data:') ? (
                                    <div className="absolute inset-0 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
                                        <img src={form.image} alt="Preview" className="h-full object-cover w-full" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-bold text-sm flex items-center"><Edit2 className="w-4 h-4 mr-2" /> Change Photo</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Upload profile photo</p>
                                    <p className="text-xs text-slate-400 mt-1">Recommended size 400x400px</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                        ) : (
                            <input type="url" value={form.image?.startsWith('http') ? form.image : ''} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://example.com/avatar.png" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium" />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                        <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium" />
                        </div>
                        <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Job Title / Position</label>
                        <input type="text" value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium" placeholder="E.g. Operator" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Branch Assignment</label>
                            <select required value={form.branch_id} onChange={e => setForm({...form, branch_id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium">
                                <option value="" disabled>Select a branch</option>
                                {branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Monthly Salary (₱)</label>
                        <input type="number" min="0" value={form.salary_rate || ''} onChange={e => setForm({...form, salary_rate: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium" />
                        </div>
                    </div>
                </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-all">Cancel</button>
                <button type="submit" form="empForm" className="px-6 py-2.5 bg-slate-900 text-white font-bold hover:bg-slate-800 rounded-xl shadow-sm hover:shadow flex items-center transition-all focus:ring-4 focus:ring-slate-900/30">
                  <Save className="w-4 h-4 mr-2" /> Save Member
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
