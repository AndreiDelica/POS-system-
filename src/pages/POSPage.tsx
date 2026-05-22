import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Service, ServiceModifier, PricingType } from '../types.js';
import { ShoppingCart, Plus, Minus, X, Check, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils.js';

interface CartItem {
  id: string; // unique local ID
  service: Service;
  quantity: number;
  dimensions?: { width: number; height: number };
  manualPrice?: number;
  modifiers: ServiceModifier[];
  calculatedPrice: number;
}

export const POSPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Configuration Modal State
  const [qty, setQty] = useState(1);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [manualPrice, setManualPrice] = useState(0);
  const [selectedModifiers, setSelectedModifiers] = useState<ServiceModifier[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [computedPreview, setComputedPreview] = useState<{ price: number, formula?: string }>({ price: 0 });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const [svcData, matData, colData] = await Promise.all([
        api('/services'),
        api('/services/materials'),
        api('/services/colors')
      ]);
      setServices(svcData);
      setMaterials(matData);
      setColors(colData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openConfig = (service: Service) => {
    setSelectedService(service);
    setQty(1);
    setWidth(0);
    setHeight(0);
    setManualPrice(0);
    setSelectedModifiers([]);
    setSelectedMaterial('');
    setSelectedColor('');
    setComputedPreview({ price: service.pricingType === 'FIXED' ? service.basePrice : 0 });
  };

  useEffect(() => {
    if (selectedService?.pricingType === 'FORMULA') {
       computeRemotePrice();
    } else {
       // local computation for fixed and manual
       let base = selectedService?.pricingType === 'FIXED' ? selectedService.basePrice : (selectedService?.pricingType === 'MANUAL' ? manualPrice : 0);
       let multiplier = 1;
       selectedModifiers.forEach(m => {
          base += m.priceDelta;
          if (m.multiplierDelta > 0) multiplier *= m.multiplierDelta;
       });
       setComputedPreview({ price: base * multiplier * qty });
    }
  }, [width, height, manualPrice, selectedMaterial, selectedColor, selectedModifiers, qty, selectedService]);

  const computeRemotePrice = async () => {
     if (!selectedService || selectedService.pricingType !== 'FORMULA') return;
     if (!width || !height || width <= 0 || height <= 0) {
        setComputedPreview({ price: 0 });
        return;
     }

     try {
       const res = await api('/services/compute-price', {
         method: 'POST',
         body: JSON.stringify({
            service_id: selectedService._id,
            dimensions: { width, height },
            material_id: selectedMaterial || undefined,
            color_id: selectedColor || undefined
         })
       });
       
       if (res.error) {
           setComputedPreview({ price: 0 });
       } else {
           let base = res.price;
           let multiplier = 1;
           selectedModifiers.forEach(m => {
             base += m.priceDelta;
             if (m.multiplierDelta > 0) multiplier *= m.multiplierDelta;
           });
           setComputedPreview({ price: base * multiplier * qty, formula: res.computed_formula });
       }
     } catch (e) {
       console.error(e);
     }
  };

  const addToCart = () => {
    if (!selectedService) return;
    
    if (selectedService.pricingType === 'FORMULA' && computedPreview.price <= 0) {
       alert("Please enter valid dimensions and options"); return; 
    }
    
    const matName = materials.find(m => m._id === selectedMaterial)?.material_name;
    const colName = colors.find(c => c._id === selectedColor)?.label;

    const newItem: any = {
      id: Math.random().toString(36).substr(2, 9),
      service: selectedService,
      quantity: qty,
      dimensions: selectedService.pricingType === 'FORMULA' ? { width, height } : undefined,
      manualPrice: selectedService.pricingType === 'MANUAL' ? manualPrice : undefined,
      modifiers: [...selectedModifiers],
      calculatedPrice: computedPreview.price,
      selected_material: selectedService.supports_materials ? matName : undefined,
      color_intensity: selectedService.supports_color_multiplier ? colName : undefined
    };
    
    setCart([...cart, newItem]);
    setSelectedService(null);
  };

  const removeCartItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const toggleModifier = (mod: ServiceModifier) => {
    if (selectedModifiers.find(m => m._id === mod._id)) {
      setSelectedModifiers(selectedModifiers.filter(m => m._id !== mod._id));
    } else {
      setSelectedModifiers([...selectedModifiers, mod]);
    }
  };
  
  const [showReceipt, setShowReceipt] = useState<any>(null);

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        items: cart.map(item => ({
          service_id: item.service._id,
          quantity: item.quantity,
          dimensions: item.dimensions,
          manualPrice: item.manualPrice,
          selected_material: item.selected_material,
          color_intensity: item.color_intensity,
          modifiers: item.modifiers.map(m => m._id)
        }))
      };
      const orderRes = await api('/orders', { method: 'POST', body: JSON.stringify(payload) });
      
      const receiptData = {
         id: orderRes._id,
         items: [...cart],
         total: cart.reduce((s,i) => s + i.calculatedPrice, 0)
      };
      
      setCart([]);
      setShowReceipt(receiptData);
    } catch (e) {
      alert("Failed to place order.");
    }
  };

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-[#FFD300]" /></div>;

  return (
    <div className="flex h-full flex-col lg:flex-row bg-slate-50 w-full overflow-hidden">
      
      {/* Categories Sidebar (LEFT) */}
      <aside className="w-full lg:w-56 bg-white border-r border-slate-100 flex flex-col z-10 lg:h-full shrink-0">
        <div className="p-6 overflow-y-auto">
          <h2 className="font-black text-sm text-slate-400 uppercase tracking-widest mb-4">Categories</h2>
          <div className="flex flex-col gap-1">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-3 text-sm font-bold rounded-xl text-left transition-colors",
                  activeCategory === cat ? "bg-[#FFD300] text-black shadow-sm" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {cat === 'All' ? 'All Services' : cat}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Services Area (CENTER) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Search Header */}
        <header className="bg-white border-b border-slate-100 p-4 shrink-0 flex items-center">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search services..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-full focus:ring-2 focus:ring-[#FFD300] outline-none"
            />
            <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </header>

        {/* Services Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredServices.map(service => (
            <button 
              key={service._id} 
              onClick={() => openConfig(service)}
              className={cn(
                "bg-white p-4 rounded-2xl border-2 cursor-pointer shadow-sm transition-all group active:scale-95 text-left relative flex flex-col h-full",
                service.pricingType === 'FORMULA' 
                  ? "border-[#FFD300] bg-yellow-50/10" 
                  : "border-transparent hover:border-[#FFD300]"
              )}
            >
              {service.pricingType === 'FORMULA' && (
                <div className="absolute -top-2 -right-2 bg-[#8B0000] text-white text-[10px] px-2 py-1 rounded-full z-10 shadow-sm">FORMULA</div>
              )}
              {service.image ? (
                <div className="w-full aspect-[4/3] rounded-xl mb-4 overflow-hidden bg-slate-100 shrink-0">
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className={cn(
                  "w-12 h-12 rounded-xl mb-4 shrink-0 flex items-center justify-center group-hover:bg-[#FFD300] group-hover:text-black transition-colors text-xl font-bold",
                  service.pricingType === 'FORMULA' ? "bg-yellow-100 text-[#FFD300]" : "bg-slate-50 text-slate-400"
                )}>
                   {service.name[0]}
                </div>
              )}
              
              <div className="flex flex-col flex-1 w-full mb-3">
                 <h3 className="font-bold text-slate-900 leading-tight mb-1">{service.name}</h3>
                 <p className="text-xs text-slate-400 truncate">{service.category}</p>
              </div>
              
              <div className="mt-auto w-full pt-3 border-t border-slate-100">
                <p className="font-black text-lg text-slate-900">
                  {service.pricingType === 'MANUAL' ? 'MANUAL' : `₱${service.basePrice.toFixed(2)}`}
                  {service.pricingType !== 'MANUAL' && <span className="text-[10px] text-slate-400 font-normal"> base</span>}
                </p>
              </div>
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <aside className="w-full lg:w-96 bg-white border-l border-slate-100 flex flex-col z-10 relative h-full">
        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-lg text-slate-900 flex items-center">
              Order Summary
              <span className="ml-2 bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full text-xs">
                {cart.length}
              </span>
            </h2>
            {cart.length > 0 && (
               <button onClick={() => setCart([])} className="text-[10px] text-[#8B0000] font-bold underline hover:text-red-900">CLEAR CART</button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                 <ShoppingCart className="w-12 h-12 mb-4 opacity-50" />
                 <p className="font-semibold text-sm">No items in order</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex flex-col space-y-2 p-4 bg-white border border-slate-100 rounded-xl relative group shadow-sm hover:shadow-md transition-shadow">
                  <button 
                    onClick={() => removeCartItem(item.id)}
                    className="absolute top-2 right-2 text-slate-300 hover:text-[#8B0000] opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full border border-slate-100 shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex justify-between items-start pr-6">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{item.service.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                         {item.service.pricingType}: {item.quantity} qty
                      </p>
                    </div>
                    <p className="font-black text-sm text-slate-700">₱{item.calculatedPrice.toFixed(2)}</p>
                  </div>
                  
                  {(item.dimensions || item.modifiers.length > 0 || item.selected_material || item.color_intensity) && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       {item.dimensions && (
                         <>
                           <div className="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                             <label className="block text-[9px] text-slate-400 uppercase font-bold">Width</label>
                             <span className="text-sm font-bold text-slate-700">{item.dimensions.width}</span>
                           </div>
                           <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-center text-[#FFD300]">
                             <label className="block text-[9px] text-yellow-600 uppercase font-bold">Height</label>
                             <span className="text-sm font-bold text-yellow-900">{item.dimensions.height}</span>
                           </div>
                         </>
                       )}
                       {item.selected_material && (
                           <div className="col-span-2 bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center text-xs">
                             <span className="text-[10px] text-slate-400 uppercase font-bold">Material</span>
                             <span className="font-bold text-slate-700">{item.selected_material}</span>
                           </div>
                       )}
                       {item.color_intensity && (
                           <div className="col-span-2 bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-center text-xs">
                             <span className="text-[10px] text-slate-400 uppercase font-bold">Color</span>
                             <span className="font-bold text-slate-700">{item.color_intensity}</span>
                           </div>
                       )}
                       {item.modifiers.length > 0 && (
                         <div className="col-span-2 pt-1 border-t border-slate-50">
                           <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Modifiers</p>
                           <div className="flex flex-wrap gap-1">
                              {item.modifiers.map(m => (
                                <span key={m._id} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black whitespace-nowrap">
                                  {m.name}
                                </span>
                              ))}
                           </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-3 mt-4">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
               <span>Subtotal</span>
               <span>₱{cart.reduce((s,i) => s + i.calculatedPrice, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
               <span className="font-bold text-slate-400 uppercase text-xs tracking-wider">Total Amount</span>
               <span className="font-black text-3xl text-slate-900">₱{cart.reduce((s,i) => s + i.calculatedPrice, 0).toFixed(2)}</span>
            </div>
            
            <button 
              disabled={cart.length === 0}
              onClick={checkout}
              className="w-full bg-[#FFD300] py-4 rounded-2xl font-black text-lg text-slate-900 shadow-lg shadow-yellow-200 active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none mt-4 flex items-center justify-center"
            >
               COMPLETE ORDER
            </button>
          </div>
        </div>
      </aside>

      {/* Service Configuration Modal Overlay */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{selectedService.name} Configuration</h3>
              <button onClick={() => setSelectedService(null)} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-auto flex-1 flex flex-col gap-6">
              
              {/* Dynamic Inputs based on Pricing Type */}
              {selectedService.pricingType === 'FORMULA' && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Width ({selectedService.unit || 'ft'})</label>
                      <input type="number" min="0" value={width || ''} onChange={e => setWidth(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2 font-bold focus:ring-2 focus:ring-[#FFD300] outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Height ({selectedService.unit || 'ft'})</label>
                      <input type="number" min="0" value={height || ''} onChange={e => setHeight(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-2 font-bold focus:ring-2 focus:ring-[#FFD300] outline-none" />
                    </div>
                  </div>
                  
                  {selectedService.supports_materials && materials.filter(m => m.service_id === selectedService._id).length > 0 && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Material Type</label>
                      <select value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 font-bold focus:ring-2 focus:ring-[#FFD300] outline-none bg-white">
                        <option value="">-- Select Material --</option>
                        {materials.filter(m => m.service_id === selectedService._id).map(m => (
                          <option key={m._id} value={m._id}>{m.material_name} (+₱{m.additional_rate})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedService.supports_color_multiplier && colors.length > 0 && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Color Intensity</label>
                      <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 font-bold focus:ring-2 focus:ring-[#FFD300] outline-none bg-white">
                         <option value="">-- Select Intensity --</option>
                         {colors.map(c => (
                           <option key={c._id} value={c._id}>{c.label} (x{c.multiplier})</option>
                         ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {selectedService.pricingType === 'MANUAL' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Manual Price (₱)</label>
                  <input type="number" min="0" value={manualPrice || ''} onChange={e => setManualPrice(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg p-3 text-xl font-bold focus:ring-2 focus:ring-[#FFD300] outline-none" />
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center font-bold text-xl">-</button>
                  <span className="text-3xl font-extrabold w-16 text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center font-bold text-xl">+</button>
                </div>
              </div>

              {/* Modifiers */}
              {selectedService.modifiers && selectedService.modifiers.length > 0 && (
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Modifiers</label>
                   <div className="flex flex-wrap gap-2">
                     {selectedService.modifiers.map((mod: any) => {
                       const isSelected = selectedModifiers.find(m => m._id === mod._id);
                       return (
                         <button 
                           key={mod._id}
                           onClick={() => toggleModifier(mod)}
                           className={cn(
                             "px-4 py-2 rounded-lg font-medium border text-sm transition-colors",
                             isSelected 
                              ? "bg-[#FFD300] border-[#FFD300] text-black" 
                              : "bg-white border-gray-200 text-gray-600 hover:border-[#FFD300]"
                           )}
                         >
                           {mod.name} 
                           {mod.priceDelta > 0 && ` (+₱${mod.priceDelta})`}
                           {mod.multiplierDelta > 0 && ` (x${mod.multiplierDelta})`}
                         </button>
                       )
                     })}
                   </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
               <div className="flex flex-col">
                 <span className="font-extrabold text-2xl text-gray-900 border-b-2 border-[#FFD300] self-start">
                   ₱{computedPreview.price.toFixed(2)}
                 </span>
                 {selectedService.pricingType === 'FORMULA' && computedPreview.formula && (
                   <span className="text-[10px] text-gray-500 font-mono mt-1">
                      {computedPreview.formula}
                   </span>
                 )}
               </div>
               <button 
                 onClick={addToCart}
                 className="bg-black text-white hover:bg-gray-800 px-8 py-3 rounded-xl font-bold transition-colors"
               >
                 Add to Order
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden max-h-[90vh]">
             <div className="p-6 text-center border-b border-gray-100 flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                   <Check className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">Order Confirmed</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Order #{(showReceipt.id || "").toString().slice(-5)}</p>
             </div>
             <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
               <div className="space-y-4">
                 {showReceipt.items.map((item: any, i: number) => (
                   <div key={i} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex justify-between font-bold text-sm">
                         <span>{item.quantity}x {item.service.name}</span>
                         <span>₱{item.calculatedPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 space-y-1">
                         {item.dimensions && <p>Dimensions: {item.dimensions.width}x{item.dimensions.height} {item.service.unit}</p>}
                         {item.selected_material && <p>Material: {item.selected_material}</p>}
                         {item.color_intensity && <p>Color: {item.color_intensity}</p>}
                         {item.modifiers?.length > 0 && <p>Modifiers: {item.modifiers.map((m: any) => m.name).join(', ')}</p>}
                         {item.service.pricingType === 'FORMULA' && item.calculatedPrice > 0 && (
                            <div className="mt-2 bg-slate-50 p-2 rounded text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis border border-slate-100">
                               Formula: <br />
                               {item.calculatedPrice} / qty = {item.calculatedPrice/item.quantity} <br />
                            </div>
                         )}
                      </div>
                   </div>
                 ))}
               </div>
               <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between font-black text-xl text-slate-900">
                 <span>Total</span>
                 <span>₱{showReceipt.total.toFixed(2)}</span>
               </div>
             </div>
             <div className="p-4 bg-white border-t border-gray-100">
               <button onClick={() => setShowReceipt(null)} className="w-full py-3 bg-[#FFD300] text-black font-bold rounded-xl shadow-sm hover:shadow active:scale-95 transition-all">
                  New Order
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
