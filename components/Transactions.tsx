import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, XCircle, ChevronDown, ChevronUp, CheckCheck, AlertCircle, AlertTriangle, Loader2, Check } from 'lucide-react';
import { Transaction } from '../types';
import { db } from './services/db';
import { formatRupiah } from './constants';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'VOID' | 'PAID' | null; txId: string | null; }>({ isOpen: false, type: null, txId: null });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await db.getTransactions();
      setTransactions([...data]);
    } catch (error) {
      console.error("Failed to load transactions", error);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateAction = (e: React.MouseEvent, type: 'VOID' | 'PAID', id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    setActionModal({ isOpen: true, type, txId: id });
  };

  const handleConfirmAction = async () => {
    const { type, txId } = actionModal;
    if (!txId) return;

    try {
      let success = false;
      if (type === 'VOID') success = await db.voidTransaction(txId);
      else if (type === 'PAID') success = await db.markAsPaid(txId);

      if (success) {
        loadTransactions();
        setActionModal({ isOpen: false, type: null, txId: null });
      } else {
        alert("Gagal. Transaksi mungkin sudah berubah status.");
      }
    } catch (error) {
      console.error("Error", error);
    }
  };

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LUNAS': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'DIBATALKAN': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6 fade-in pb-10">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
        <div><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Riwayat</h2><p className="text-gray-500 dark:text-gray-400 text-sm">Kelola status transaksi.</p></div>
        <button onClick={loadTransactions} className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg border dark:border-gray-600 transition-colors">
          {isLoading ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18} />} Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden min-h-[200px]">
        {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={32}/></div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400"><AlertCircle size={48} className="mb-2 text-gray-300 dark:text-gray-600" /><p>Belum ada data.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-800 dark:text-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Waktu</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.map(tx => (
                  <React.Fragment key={tx.id}>
                    <tr onClick={() => toggleExpand(tx.id)} className={`cursor-pointer transition-colors ${expandedId === tx.id ? 'bg-indigo-50/60 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{new Date(tx.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.date).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{formatRupiah(tx.total)}</td>
                      <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(tx.status)}`}>{tx.status}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-3">
                          {tx.status === 'PENDING' && (
                            <button 
                              onClick={(e) => initiateAction(e, 'PAID', tx.id)}
                              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors"
                              title="Tandai Lunas"
                            >
                              <Check size={14} /> Bayar
                            </button>
                          )}
                          <div className={`transition-transform duration-200 ${expandedId === tx.id ? 'rotate-180' : ''}`}>
                            <ChevronDown size={20} className="text-gray-400 hover:text-gray-600"/>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {expandedId === tx.id && (
                      <tr className="bg-indigo-50/30 dark:bg-indigo-900/10">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Items</h4>
                            {(tx.items || []).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1 border-b dark:border-gray-700 border-gray-50 last:border-0">
                                <span className="text-gray-900 dark:text-gray-200 font-medium">{item.quantity}x {item.name}</span>
                                <span className="text-gray-600 dark:text-gray-400">{formatRupiah(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                              {tx.status === 'PENDING' && <button onClick={(e) => initiateAction(e, 'PAID', tx.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">LUNAS</button>}
                              {tx.status !== 'DIBATALKAN' && <button onClick={(e) => initiateAction(e, 'VOID', tx.id)} className="flex-1 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg text-sm font-bold bg-white dark:bg-gray-700 transition-colors">BATAL</button>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 text-center space-y-4 animate-in zoom-in duration-200 border dark:border-gray-700">
             <h3 className="text-xl font-bold text-gray-800 dark:text-white">{actionModal.type === 'VOID' ? 'Batalkan Transaksi?' : 'Konfirmasi Pembayaran?'}</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">Tindakan ini akan memperbarui status dan stok produk.</p>
             <div className="flex gap-3 pt-2">
               <button onClick={() => setActionModal({ isOpen: false, type: null, txId: null })} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Batal</button>
               <button onClick={handleConfirmAction} className={`flex-1 py-2 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 ${actionModal.type === 'VOID' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Ya, Proses</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};