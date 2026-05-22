import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { TrendingUp, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';

export const BranchDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/analytics').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#FFD300] w-8 h-8" /></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Today's Sales</p>
            <h3 className="text-3xl font-black mt-2 text-gray-900">₱{data?.todaySales?.toFixed(2) || '0.00'}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#FFD300]/20 flex items-center justify-center">
            <DollarSign className="text-yellow-700 w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Orders Today</p>
            <h3 className="text-3xl font-black mt-2 text-gray-900">{data?.todayOrderCount || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <ShoppingBag className="text-blue-700 w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Orders Active</p>
            <h3 className="text-3xl font-black mt-2 text-gray-900">{data?.totalOrders || 0}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <TrendingUp className="text-green-700 w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
