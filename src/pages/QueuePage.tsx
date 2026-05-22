import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { Order } from '../types.js';
import { Loader2, Printer, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../lib/utils.js';

export const QueuePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api('/orders');
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // In a real app we would use WebSockets or polling here
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      fetchOrders();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-[#FFD300]" /></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Queue</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Stage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold flex items-center justify-between rounded-t-xl">
             <span className="flex items-center text-gray-700"><Clock className="w-4 h-4 mr-2"/> Pending</span>
             <span className="bg-gray-200 text-gray-700 px-2 rounded-full text-xs">{orders.filter(o => o.status === 'Pending').length}</span>
          </div>
          <div className="overflow-auto p-4 space-y-4">
             {orders.filter(o => o.status === 'Pending').map(order => (
               <div key={order._id} className="border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md bg-white">
                 <div className="flex justify-between font-bold text-sm mb-2">
                   <span>Order #{(order._id as string).slice(-5)}</span>
                   <span className="text-[#FFD300]">₱{order.totalAmount}</span>
                 </div>
                 <div className="text-xs text-gray-600 mb-4 font-medium">
                   {order.items.map((i: any) => `${i.quantity}x ${i.service_id?.name || 'Unknown'}`).join(', ')}
                 </div>
                 <button onClick={() => updateStatus(order._id, 'Printing')} className="w-full bg-[#FFD300] py-2 font-bold text-black text-sm rounded transition-colors hover:bg-[#ebd000]">
                    Start Processing
                 </button>
               </div>
             ))}
          </div>
        </div>

        {/* Printing Stage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 bg-blue-50 border-b border-blue-100 font-bold flex items-center justify-between rounded-t-xl">
             <span className="flex items-center text-blue-800"><Printer className="w-4 h-4 mr-2"/> Processing</span>
          </div>
          <div className="overflow-auto p-4 space-y-4">
             {orders.filter(o => o.status === 'Printing').map(order => (
               <div key={order._id} className="border border-blue-100 p-4 rounded-lg bg-blue-50/50">
                 <div className="font-bold text-sm mb-4">Order #{(order._id as string).slice(-5)}</div>
                 <button onClick={() => updateStatus(order._id, 'Ready')} className="w-full bg-blue-600 text-white py-2 font-bold text-sm rounded hover:bg-blue-700">
                    Mark Ready
                 </button>
               </div>
             ))}
          </div>
        </div>

        {/* Ready Stage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 bg-green-50 border-b border-green-100 font-bold flex items-center justify-between rounded-t-xl">
             <span className="flex items-center text-green-800"><CheckCircle className="w-4 h-4 mr-2"/> Ready for Pickup</span>
          </div>
          <div className="overflow-auto p-4 space-y-4">
             {orders.filter(o => o.status === 'Ready').map(order => (
               <div key={order._id} className="border border-green-100 p-4 rounded-lg bg-green-50/50">
                 <div className="font-bold text-sm mb-4 tracking-tighter">Order #{(order._id as string).slice(-5)}</div>
                 <button onClick={() => updateStatus(order._id, 'Completed')} className="w-full bg-green-600 text-white py-2 font-bold text-sm rounded hover:bg-green-700">
                    Complete Order
                 </button>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};
