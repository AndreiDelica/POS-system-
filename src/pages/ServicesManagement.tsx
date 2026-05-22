import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api.js';
import { Service, PricingType } from '../types.js';
import { Plus, Edit2, Trash2, Save, X, Loader2, Upload, Link as LinkIcon, ChevronDown, Check } from 'lucide-react';

const CATEGORIES = [
  "DOCUMENT",
  "PRINTING SERVICES",
  "BINDING SERVICES",
  "PHOTO SERVICES",
  "LEGAL / NOTARIAL SERVICES",
  "RISOGRAPH SERVICES"
];

export const ServicesManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Service>>({
    name: '', category: '', pricingType: 'FIXED', basePrice: 0, image: '',
    formulaConfig: { widthMin: 0, widthMax: 0, heightMin: 0, heightMax: 0, multiplier: 1 }
  });
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [imageTab, setImageTab] = useState<'url' | 'upload'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchServices = async () => {
    try {
      const data = await api('/services');
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form._id) {
        await api(`/services/${form._id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/services', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchServices();
      setForm({ name: '', category: '', pricingType: 'FIXED', basePrice: 0, image: '' });
    } catch (err: any) {
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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Services Management</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Configure pricing rules, modifiers, and global service catalog.</p>
        </div>
        <button 
          onClick={() => { setForm({ name: '', category: '', pricingType: 'FIXED', basePrice: 0, image: '' }); setShowModal(true); setImageTab('upload'); setIsCategoryOpen(false); }}
          className="bg-[#FFD300] text-black font-bold px-4 py-2.5 rounded-xl hover:bg-[#ebd000] focus:ring-4 focus:ring-[#FFD300]/30 transition-all flex items-center shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" /> New Service
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing Type</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map(s => (
              <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {s.image ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0 border border-slate-200">
                        {s.name[0]}
                        </div>
                    )}
                    <span className="font-bold text-slate-900">{s.name}</span>
                  </div>
                </td>
                <td className="p-4 font-medium text-slate-600">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{s.category}</span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.pricingType === 'FORMULA' ? 'bg-[#8B0000]/10 text-[#8B0000]' : 'bg-slate-100 text-slate-700'}`}>
                    {s.pricingType}
                  </span>
                </td>
                <td className="p-4 font-black text-slate-900">₱{s.basePrice}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => { setForm(s); setShowModal(true); setImageTab(s.image?.startsWith('http') ? 'url' : 'upload'); setIsCategoryOpen(false); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
              <h3 className="font-black text-xl tracking-tight text-slate-900">{form._id ? 'Edit Service' : 'Add New Service'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="overflow-y-auto flex-1">
                <form id="serviceForm" onSubmit={handleSave} className="p-6 space-y-6">
                
                {/* Image Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Service Image</label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                        <button type="button" onClick={() => setImageTab('upload')} className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center transition-all ${imageTab === 'upload' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload File
                        </button>
                        <button type="button" onClick={() => setImageTab('url')} className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center transition-all ${imageTab === 'url' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                            <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> Web URL
                        </button>
                    </div>

                    {imageTab === 'upload' ? (
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[#FFD300] hover:bg-yellow-50/50 transition-colors group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {form.image && form.image.startsWith('data:') ? (
                                <div className="absolute inset-0 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2">
                                    <img src={form.image} alt="Preview" className="h-full object-contain rounded-lg" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white font-bold text-sm flex items-center"><Edit2 className="w-4 h-4 mr-2" /> Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400 group-hover:text-[#FFD300] group-hover:bg-yellow-100 transition-colors">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">Click to upload image</p>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>
                    ) : (
                        <input type="url" value={form.image?.startsWith('http') ? form.image : ''} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://example.com/image.png" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] outline-none transition-all placeholder:text-slate-400 font-medium" />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Service Name</label>
                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] outline-none transition-all font-medium" placeholder="E.g., Tarpaulin Printing" />
                    </div>
                    
                    <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <button 
                        type="button" 
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-left flex justify-between items-center focus:bg-white focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] outline-none transition-all font-medium"
                    >
                        {form.category || <span className="text-slate-400">Select formatting category</span>}
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isCategoryOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden isolate py-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => { setForm({...form, category: cat}); setIsCategoryOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-black flex justify-between items-center transition-colors"
                                >
                                    {cat}
                                    {form.category === cat && <Check className="w-4 h-4 text-[#FFD300]" />}
                                </button>
                            ))}
                        </div>
                    )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pricing Logic</label>
                    <div className="relative">
                        <select required value={form.pricingType} onChange={e => setForm({...form, pricingType: e.target.value as PricingType})} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] outline-none transition-all font-medium pr-10">
                            <option value="FIXED">FIXED - Constant Price</option>
                            <option value="FORMULA">FORMULA - Math Based (W x H)</option>
                            <option value="MANUAL">MANUAL - Open Price</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    </div>
                    {form.pricingType === 'FIXED' && (
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Base Price (₱)</label>
                        <input type="number" min="0" value={form.basePrice} onChange={e => setForm({...form, basePrice: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#FFD300] focus:border-[#FFD300] outline-none transition-all font-medium" />
                    </div>
                    )}
                </div>

                {form.pricingType === 'FORMULA' && (
                    <div className="border border-yellow-200 bg-yellow-50/50 rounded-xl p-5 space-y-4">
                    <h4 className="font-bold text-sm text-yellow-900 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#FFD300] mr-2"></span>
                        Formula Configuration
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Base Price (₱)</label>
                        <input type="number" min="0" value={form.basePrice || ''} onChange={e => setForm({...form, basePrice: Number(e.target.value)})} className="w-full bg-white border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD300] outline-none font-medium" placeholder="e.g. 35" />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit</label>
                        <input type="text" value={form.unit || 'ft'} readOnly onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-slate-100 border border-yellow-200 rounded-lg px-3 py-2 text-sm outline-none font-medium text-slate-500" placeholder="ft" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Width ({form.unit || 'ft'})</label>
                        <input type="number" value={form.formulaConfig?.min_width || ''} onChange={e => setForm({...form, formulaConfig: { ...form.formulaConfig, min_width: Number(e.target.value) }})} className="w-full bg-white border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD300] outline-none font-medium" />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Width</label>
                        <input type="number" value={form.formulaConfig?.max_width || ''} onChange={e => setForm({...form, formulaConfig: { ...form.formulaConfig, max_width: Number(e.target.value) }})} className="w-full bg-white border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD300] outline-none font-medium" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Height ({form.unit || 'ft'})</label>
                        <input type="number" value={form.formulaConfig?.min_height || ''} onChange={e => setForm({...form, formulaConfig: { ...form.formulaConfig, min_height: Number(e.target.value) }})} className="w-full bg-white border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD300] outline-none font-medium" />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Height</label>
                        <input type="number" value={form.formulaConfig?.max_height || ''} onChange={e => setForm({...form, formulaConfig: { ...form.formulaConfig, max_height: Number(e.target.value) }})} className="w-full bg-white border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFD300] outline-none font-medium" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-2 border-t border-yellow-200/50">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!form.supports_dimensions} onChange={e => setForm({...form, supports_dimensions: e.target.checked})} className="w-4 h-4 text-[#FFD300] bg-white border-yellow-300 rounded focus:ring-[#FFD300]" />
                            <span className="text-sm font-bold text-slate-700">Requires Width × Height</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!form.supports_materials} onChange={e => setForm({...form, supports_materials: e.target.checked})} className="w-4 h-4 text-[#FFD300] bg-white border-yellow-300 rounded focus:ring-[#FFD300]" />
                            <span className="text-sm font-bold text-slate-700">Supports Material Selection</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!form.supports_color_multiplier} onChange={e => setForm({...form, supports_color_multiplier: e.target.checked})} className="w-4 h-4 text-[#FFD300] bg-white border-yellow-300 rounded focus:ring-[#FFD300]" />
                            <span className="text-sm font-bold text-slate-700">Supports Color Intensity</span>
                        </label>
                    </div>

                    <p className="text-xs text-yellow-800 font-medium bg-yellow-100/50 px-3 py-2 rounded-lg inline-block">Calculation: <b>(Base + Material) × Width × Height × Color</b></p>
                    </div>
                )}
                </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-all">Cancel</button>
                <button type="submit" form="serviceForm" className="px-6 py-2.5 bg-[#FFD300] font-bold text-black hover:bg-[#ebd000] rounded-xl shadow-sm hover:shadow flex items-center transition-all focus:ring-4 focus:ring-[#FFD300]/30">
                  <Save className="w-4 h-4 mr-2" /> {form._id ? 'Update Service' : 'Save Service'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

