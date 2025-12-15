import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { db } from '../services/db';
import { formatRupiah } from '../constants';
import { Transaction } from '../types';
import { Loader2 } from 'lucide-react';

export const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const data = await db.getTransactions();
        setTransactions(data);
        setIsLoading(false);
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const completedTx = transactions.filter(t => t.status === 'LUNAS');
    
    const dailyTotal = completedTx
      .filter(t => new Date(t.date).toDateString() === today)
      .reduce((sum, t) => sum + t.total, 0);

    const monthlyTotal = completedTx.reduce((sum, t) => sum + t.total, 0); 
    
    const netProfit = completedTx.reduce((acc, tx) => {
      const txProfit = tx.items.reduce((itemAcc, item) => {
        return itemAcc + ((item.price - item.cost) * item.quantity);
      }, 0);
      return acc + txProfit;
    }, 0);

    const salesByDate = completedTx.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + t.total;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(salesByDate).map(date => ({
      date,
      sales: salesByDate[date]
    })).slice(-7);

    const byMethod = completedTx.reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const pieData = Object.keys(byMethod).map(method => ({
      name: method,
      value: byMethod[method]
    }));

    const productSales: Record<string, { name: string, qty: number, revenue: number }> = {};
    completedTx.forEach(tx => {
      tx.items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSales[item.id].qty += item.quantity;
        productSales[item.id].revenue += (item.price * item.quantity);
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { dailyTotal, monthlyTotal, netProfit, chartData, pieData, totalCount: completedTx.length, topProducts };
  }, [transactions]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b'];

  if (isLoading) {
      return <div className="flex h-96 items-center justify-center fade-in"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;
  }

  return (
    <div className="space-y-6 fade-in pb-10">
      <h2 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex flex-col">
          <span className="text-gray-500 text-sm font-medium">Penjualan Hari Ini</span>
          <span className="text-2xl font-bold text-indigo-600 mt-2">{formatRupiah(stats.dailyTotal)}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col">
          <span className="text-gray-500 text-sm font-medium">Total Pendapatan</span>
          <span className="text-2xl font-bold text-emerald-600 mt-2">{formatRupiah(stats.monthlyTotal)}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-100 flex flex-col">
          <span className="text-gray-500 text-sm font-medium">Keuntungan Bersih</span>
          <span className="text-2xl font-bold text-violet-600 mt-2">{formatRupiah(stats.netProfit)}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col">
          <span className="text-gray-500 text-sm font-medium">Total Transaksi</span>
          <span className="text-2xl font-bold text-blue-600 mt-2">{stats.totalCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Tren Penjualan (7 Hari)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
              <Tooltip formatter={(value: number) => formatRupiah(value)} />
              <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Metode Pembayaran</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {stats.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b"><h3 className="text-lg font-bold text-gray-800">Produk Terlaris (Top 5)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Nama Produk</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Terjual</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.topProducts.map((product, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-center"><span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs font-bold">{product.qty}</span></td>
                  <td className="px-6 py-4 text-right text-gray-600 font-medium">{formatRupiah(product.revenue)}</td>
                </tr>
              ))}
              {stats.topProducts.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Belum ada data penjualan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};