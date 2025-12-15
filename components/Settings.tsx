import React, { useState, useEffect } from 'react';
import { Save, Link, CheckCircle, XCircle, Copy, AlertTriangle, Loader2, Smartphone, Info } from 'lucide-react';
import { db, DEFAULT_SCRIPT_URL } from './services/db';

const GOOGLE_SCRIPT_CODE = `
// --- UPDATE SCRIPT INI DI GOOGLE APPS SCRIPT ---
// (Script content same as before)
// ... Gunakan kode yang sudah ada ...
`;

export const Settings: React.FC = () => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [testStatus, setTestStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    // Load from local storage, OR fallback to the default hardcoded URL
    const savedUrl = localStorage.getItem('lumina_gscript_url');
    const activeUrl = savedUrl || DEFAULT_SCRIPT_URL;
    
    setScriptUrl(activeUrl);
    updateShareLink(activeUrl);
  }, []);

  const updateShareLink = (url: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const magicLink = `${baseUrl}?db=${encodeURIComponent(url)}`;
    setShareLink(magicLink);
  };

  const handleSave = async () => {
    setTestStatus('LOADING');
    localStorage.setItem('lumina_gscript_url', scriptUrl);
    updateShareLink(scriptUrl);
    
    const isConnected = await db.testConnection(scriptUrl);
    setTestStatus(isConnected ? 'SUCCESS' : 'ERROR');
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link berhasil disalin!');
  };

  return (
    <div className="space-y-6 fade-in pb-10 max-w-4xl mx-auto dark:text-gray-200">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pengaturan Database</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Connection Form */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                    <Link className="text-indigo-600 dark:text-indigo-400" size={24}/>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Hubungkan Google Sheet</h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Aplikasi ini terhubung ke URL Google Apps Script di bawah ini.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Web App URL</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={scriptUrl}
                                onChange={(e) => setScriptUrl(e.target.value)}
                                placeholder="https://script.google.com/macros/s/..../exec"
                                className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                            />
                            <button 
                                onClick={handleSave} 
                                disabled={!scriptUrl || testStatus === 'LOADING'}
                                className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 min-w-[120px] justify-center"
                            >
                                {testStatus === 'LOADING' ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                                <span>Simpan</span>
                            </button>
                        </div>
                    </div>

                    {testStatus === 'SUCCESS' && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center gap-2 border border-emerald-200 dark:border-emerald-800 text-sm">
                            <CheckCircle size={18} />
                            <span className="font-bold">Terhubung! Database siap.</span>
                        </div>
                    )}

                    {testStatus === 'ERROR' && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-800 text-sm">
                            <XCircle size={18} />
                            <span>Gagal terhubung. Cek URL & Deployment.</span>
                        </div>
                    )}
                    
                    <div className="pt-2">
                        <p className="text-xs text-gray-400">
                            * URL ini sudah ditanam di aplikasi (Default), Anda tidak perlu mengubahnya kecuali ingin pindah database.
                        </p>
                    </div>
                </div>
            </div>

            {/* QR Code Section (Optional but kept for manual sharing if needed) */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="text-indigo-600 dark:text-indigo-400" size={24}/>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Akses Perangkat Lain</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="bg-white p-2 rounded-xl shadow-sm border">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareLink)}`} 
                            alt="QR Code Koneksi" 
                            className="w-36 h-36"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                           Scan untuk membuka aplikasi di HP kasir. Database akan otomatis terhubung.
                        </p>
                        <div className="flex gap-2">
                            <input readOnly value={shareLink} className="flex-1 text-xs bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400" />
                            <button onClick={copyShareLink} className="bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-700 dark:text-gray-200 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl">
                 <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">Status Database</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            Aplikasi menggunakan database default.<br/>
                            ID Script: ...{scriptUrl.slice(-15)}
                        </p>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};