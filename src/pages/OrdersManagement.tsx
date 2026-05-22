import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Loader2, Search, Filter, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils.js';

export const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterBranch, setFilterBranch] = useState('ALL');
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orderRes, branchRes] = await Promise.all([
        api('/orders'),
        api('/branches')
      ]);
      // Sort orders by newest first
      const sorted = orderRes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
      setBranches(branchRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
       case 'Pending': return 'bg-yellow-100 text-yellow-800';
       case 'Printing': return 'bg-blue-100 text-blue-800';
       case 'Ready': return 'bg-purple-100 text-purple-800';
       case 'Completed': return 'bg-green-100 text-green-800';
       case 'Cancelled': return 'bg-red-100 text-red-800';
       default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredOrders = orders.filter(o => 
    (filterStatus === 'ALL' || o.status === filterStatus) &&
    (filterBranch === 'ALL' || o.branch_id?._id === filterBranch || o.branch_id === filterBranch) &&
    (search === '' || (o._id.toLowerCase().includes(search.toLowerCase())))
  );

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-[#FFD300] w-8 h-8" /></div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
         <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Orders & Receipts</h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">Monitor all branch transactions real-time.</p>
            </div>
         </div>
         
         <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by Order ID..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFD300] outline-none font-medium text-sm transition-all"
                />
            </div>
            <select 
               value={filterBranch} 
               onChange={e => setFilterBranch(e.target.value)}
               className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD300]"
            >
               <option value="ALL">All Branches</option>
               {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
               ))}
            </select>
            <select 
               value={filterStatus} 
               onChange={e => setFilterStatus(e.target.value)}
               className="px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD300]"
            >
               <option value="ALL">All Statuses</option>
               <option value="Pending">Pending</option>
               <option value="Printing">Printing</option>
               <option value="Ready">Ready</option>
               <option value="Completed">Completed</option>
               <option value="Cancelled">Cancelled</option>
            </select>
         </div>
      </div>
      
      <div className="flex-1 overflow-auto">
         <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 box-border border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Order ID</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Date</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs">Branch</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-right">Total</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs center">Status</th>
                <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-xs text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredOrders.length === 0 ? (
                  <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">No orders found matching your criteria.</td>
                  </tr>
               ) : (
                  filteredOrders.map(order => (
                     <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 border-l-4 border-transparent hover:border-[#FFD300]">{order._id.slice(-6)}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                            {branches.find(b => b._id === order.branch_id || b._id === order.branch_id?._id)?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 text-right">₱{order.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                           <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold", getStatusColor(order.status))}>
                              {order.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <button 
                             onClick={() => setSelectedOrder(order)}
                             className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center"
                           >
                             <Eye className="w-3.5 h-3.5 mr-1" /> View
                           </button>
                        </td>
                     </tr>
                  ))
               )}
            </tbody>
         </table>
      </div>

       {/* Receipt Modal */}
       {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden max-h-[90vh]">
             <div className="p-6 text-center border-b border-gray-100 flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-3">
                   <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-slate-900">Order Receipt</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Order #{selectedOrder._id.slice(-6)}</p>
                <div className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
             </div>
             <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
               <div className="space-y-4">
                 {selectedOrder.items.map((item: any, i: number) => (
                   <div key={i} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex justify-between font-bold text-sm text-slate-900">
                         <span>{item.quantity}x {item.service_name || 'Service'}</span>
                         <span>₱{item.calculatedPrice?.toFixed(2) || item.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 space-y-1 font-medium">
                         {item.dimensions && <p>Dimensions: {item.dimensions.width}x{item.dimensions.height}</p>}
                         {item.selected_material && <p>Material: {item.selected_material}</p>}
                         {item.color_intensity && <p>Color: {item.color_intensity}</p>}
                         {item.computed_formula && (
                           <div className="mt-2 bg-slate-50 p-2 rounded text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis border border-slate-100">
                               Formula: <br />
                               {item.computed_formula}
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
               </div>
               <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between font-black text-xl text-slate-900">
                 <span>Total</span>
                 <span>₱{selectedOrder.totalAmount?.toFixed(2)}</span>
               </div>
             </div>
             <div className="p-4 bg-white border-t border-gray-100">
               <button onClick={() => setSelectedOrder(null)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:shadow active:scale-95 transition-all">
                  Close Receipt
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
