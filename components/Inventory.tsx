import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, X, Settings, List, Download, Upload, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { db } from './services/db';
import { formatRupiah } from './constants';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', category: 'Makanan', price: 0, cost: 0, stock: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [p, c] = await Promise.all([db.getProducts(), db.getCategories()]);
    setProducts(p);
    setCategories(c);
    setIsLoading(false);
  };

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      const defaultCat = categories.find(c => c !== 'Semua') || 'Lainnya';
      setFormData({ name: '', category: defaultCat, price: 0, cost: 0, stock: 0 });
    }
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      await db.deleteProduct(id);
      loadData();
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const productToSave: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name || 'Produk Baru',
      category: formData.category || 'Lainnya',
      price: Number(formData.price),
      cost: Number(formData.cost),
      stock: Number(formData.stock),
    };

    await db.saveProduct(productToSave);
    setIsProductModalOpen(false);
    loadData();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      await db.addCategory(newCategoryName.trim());
      setNewCategoryName('');
      loadData();
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    if (confirm(`Hapus kategori "${cat}"?`)) {
      await db.deleteCategory(cat);
      loadData();
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "Nama Produk,Kategori,Harga Jual,Modal,Stok";
    const example = "Nasi Goreng Spesial,Makanan,25000,15000,50\nEs Teh Manis,Minuman,5000,2000,100";
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${example}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_produk_lumina.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportTrigger = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      try {
        setIsLoading(true);
        const rows = text.split('\n');
        const newProducts: Omit<Product, 'id'>[] = [];
        let successCount = 0;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue;
          const cols = row.split(',');
          if (cols.length >= 5) {
            const name = cols[0].trim();
            const category = cols[1].trim() || 'Lainnya';
            const price = Number(cols[2].trim()) || 0;
            const cost = Number(cols[3].trim()) || 0;
            const stock = Number(cols[4].trim()) || 0;
            if (name) {
              newProducts.push({ name, category, price, cost, stock });
              successCount++;
            }
          }
        }

        if (newProducts.length > 0) {
          await db.addProductsBulk(newProducts);
          loadData();
          alert(`Berhasil mengimpor ${successCount} produk!`);
        } else {
          alert('Tidak ada data valid.');
        }
      } catch (error) {
        console.error("Import error", error);
        alert('Gagal memproses file.');
      } finally {
        setIsLoading(false);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Produk</h2>
          <p className="text-gray-500 dark:text-gray-400">Kelola daftar produk, harga, dan stok.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg shadow-sm text-sm font-medium">
            <Download size={16} /> Template
          </button>
          <button onClick={handleImportTrigger} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-2 rounded-lg shadow-sm text-sm font-medium">
            <Upload size={16} /> Import
          </button>
          <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium">
            <List size={18} /> Kategori
          </button>
          <button onClick={() => handleOpenProductModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium ml-auto sm:ml-0">
            <Plus size={18} /> Tambah
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari produk..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-indigo-500 outline-none text-gray-800 dark:text-white placeholder-gray-400"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
             <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nama Produk</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Kategori</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Harga</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Stok</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">{product.category}</span></td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{formatRupiah(product.price)}</td>
                    <td className="px-6 py-4"><span className={product.stock < 10 ? 'text-red-500 dark:text-red-400 font-bold' : 'text-green-600 dark:text-green-400'}>{product.stock}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenProductModal(product)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in duration-200 border dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6 border-b dark:border-gray-700 pb-2"><h3 className="font-bold text-gray-800 dark:text-white text-lg">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3><button onClick={() => setIsProductModalOpen(false)}><X size={24} className="text-gray-500"/></button></div>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Produk</label>
                <input required placeholder="Contoh: Kopi Susu" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2.5 rounded-xl text-gray-800 dark:text-white bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-2.5 rounded-xl text-gray-800 dark:text-white bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                    {categories.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stok Awal</label>
                  <input type="number" placeholder="0" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full border p-2.5 rounded-xl text-gray-800 dark:text-white bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Harga Jual</label>
                  <input type="number" placeholder="Rp 0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border p-2.5 rounded-xl text-gray-800 dark:text-white bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modal (HPP)</label>
                  <input type="number" placeholder="Rp 0" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} className="w-full border p-2.5 rounded-xl text-gray-800 dark:text-white bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div className="pt-2">
                <button disabled={isLoading} className="w-full bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold shadow-md transition-colors">
                    {isLoading ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in duration-200 border dark:border-gray-700">
             <div className="flex justify-between mb-4"><h3 className="font-bold text-gray-800 dark:text-white">Kategori</h3><button onClick={() => setIsCategoryModalOpen(false)}><X size={24} className="text-gray-500"/></button></div>
             <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input required placeholder="Baru..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-1 border p-2 rounded text-gray-800 dark:text-white bg-white dark:bg-gray-700 dark:border-gray-600" />
                <button className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"><Plus size={20}/></button>
             </form>
             <div className="max-h-60 overflow-y-auto space-y-2">
                {categories.filter(c => c !== 'Semua').map(c => (
                  <div key={c} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <span className="text-gray-800 dark:text-gray-200">{c}</span>
                    <button onClick={() => handleDeleteCategory(c)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                  </div>
                ))}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};