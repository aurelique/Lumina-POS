import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Minus, Plus, Trash2, CreditCard, Banknote, Clock, CheckCircle, ChevronUp, X, Loader2 } from 'lucide-react';
import { Product, CartItem, Transaction } from '../types';
import { db } from '../services/db';
import { formatRupiah } from '../constants';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onUpdateQuantity, onRemove }) => (
  <div className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg group border border-gray-100">
    <div className="flex-1 min-w-0">
      <p className="font-bold text-sm text-gray-800 truncate">{item.name}</p>
      <p className="text-xs text-gray-500">{formatRupiah(item.price)}</p>
    </div>
    <div className="flex items-center gap-2 bg-white rounded-lg border px-1 h-8">
      <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-600 h-full flex items-center justify-center w-8"><Minus size={14}/></button>
      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
      <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-600 h-full flex items-center justify-center w-8"><Plus size={14}/></button>
    </div>
    <button 
      onClick={() => onRemove(item.id)} 
      className="text-gray-400 hover:text-red-500 p-2 rounded transition-colors"
    >
      <Trash2 size={18}/>
    </button>
  </div>
);

export const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS' | 'DIGITAL'>('TUNAI');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastStatus, setLastStatus] = useState<'LUNAS' | 'PENDING'>('LUNAS');

  useEffect(() => {
    loadData();
  }, [isSuccess]);

  const loadData = async () => {
    setIsLoading(true);
    const [p, c] = await Promise.all([db.getProducts(), db.getCategories()]);
    setProducts(p);
    setCategories(c);
    setIsLoading(false);
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item; 
          const product = products.find(p => p.id === id);
          if (product && newQty > product.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Semua' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async (status: 'LUNAS' | 'PENDING') => {
    setIsLoading(true); // Show loading during transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: cart,
      total: cartTotal,
      paymentMethod,
      status: status
    };
    
    await db.createTransaction(transaction);
    setLastStatus(status);
    
    setIsCheckoutModalOpen(false);
    setIsMobileCartOpen(false);
    setIsSuccess(true);
    setCart([]);
    setIsLoading(false);
    
    setTimeout(() => setIsSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] lg:h-[calc(100vh-60px)] gap-6 fade-in">
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="space-y-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 outline-none" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="overflow-y-auto pb-20 lg:pb-0 pr-1">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} onClick={() => addToCart(product)} className={`group bg-white p-4 rounded-xl shadow-sm border-l-4 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col h-32 justify-between ${product.stock === 0 ? 'opacity-60 border-gray-300' : 'border-indigo-200'}`}>
                  <div><h3 className="font-bold text-gray-800 line-clamp-2 leading-tight">{product.name}</h3><span className="text-xs text-gray-500 mt-1 inline-block">{product.category}</span></div>
                  <div className="flex justify-between items-end"><span className="text-indigo-600 font-bold">{formatRupiah(product.price)}</span>{product.stock === 0 ? <span className="text-xs font-bold text-red-500">Habis</span> : <span className="text-xs text-gray-400">{product.stock} sisa</span>}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hidden lg:flex flex-col w-96 bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="p-5 border-b bg-gray-50 flex justify-between items-center"><h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><ShoppingCart size={20} /> Pesanan</h2><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">{cartCount} item</span></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3"><ShoppingCart size={48} className="opacity-20" /><p>Keranjang kosong</p></div> : cart.map(item => <CartItemRow key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />)}
        </div>
        <div className="p-5 bg-gray-50 border-t space-y-4">
          <div className="grid grid-cols-2 gap-2">
             <button onClick={() => setPaymentMethod('TUNAI')} className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${paymentMethod === 'TUNAI' ? 'bg-white border-indigo-500 text-indigo-600 shadow-sm ring-1 ring-indigo-500' : 'border-gray-200 text-gray-600 bg-gray-100'}`}><Banknote size={16} /> Tunai</button>
             <button onClick={() => setPaymentMethod('QRIS')} className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${paymentMethod === 'QRIS' ? 'bg-white border-indigo-500 text-indigo-600 shadow-sm ring-1 ring-indigo-500' : 'border-gray-200 text-gray-600 bg-gray-100'}`}><CreditCard size={16} /> QRIS</button>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800"><span>Total</span><span>{formatRupiah(cartTotal)}</span></div>
          <div className="grid grid-cols-4 gap-2">
            <button disabled={cart.length === 0} onClick={() => handleCheckout('PENDING')} className="col-span-1 bg-amber-100 text-amber-700 py-3 rounded-xl font-bold hover:bg-amber-200 disabled:opacity-50 transition-all flex items-center justify-center"><Clock size={20} /></button>
            <button disabled={cart.length === 0} onClick={() => setIsCheckoutModalOpen(true)} className="col-span-3 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all">Bayar {paymentMethod}</button>
          </div>
        </div>
      </div>

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col p-6 text-center space-y-4">
             <h3 className="font-bold text-xl">Konfirmasi</h3>
             <p className="text-gray-500">Bayar {formatRupiah(cartTotal)} via {paymentMethod}?</p>
             <button onClick={() => handleCheckout('LUNAS')} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Ya, Selesaikan</button>
             <button onClick={() => setIsCheckoutModalOpen(false)} className="w-full border py-3 rounded-xl">Batal</button>
          </div>
        </div>
      )}
      
      {isMobileCartOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50"><h3 className="font-bold">Detail</h3><button onClick={() => setIsMobileCartOpen(false)}><X size={20}/></button></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">{cart.map(item => <CartItemRow key={item.id} item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />)}</div>
            <div className="p-4 border-t space-y-3">
               <div className="flex justify-between font-bold"><span>Total</span><span>{formatRupiah(cartTotal)}</span></div>
               <button onClick={() => handleCheckout('LUNAS')} disabled={cart.length===0} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Bayar</button>
            </div>
          </div>
      )}

      {/* Mobile Sticky Bar */}
      {!isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-30 shadow-lg">
          <button onClick={() => setIsMobileCartOpen(true)} disabled={cart.length === 0} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold flex justify-between items-center">
            <div className="flex items-center gap-2"><div className="bg-white/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><ChevronUp size={16} /><span>{cartCount} Item</span></div></div>
            <div className="flex items-center gap-2"><span>Bayar</span><span className="bg-black/20 px-2 py-0.5 rounded text-sm">{formatRupiah(cartTotal)}</span></div>
          </button>
        </div>
      )}

      {isSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in duration-300">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${lastStatus === 'LUNAS' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {lastStatus === 'LUNAS' ? <CheckCircle className="text-emerald-500 w-12 h-12" /> : <Clock className="text-amber-500 w-12 h-12" />}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{lastStatus === 'LUNAS' ? 'Berhasil!' : 'Disimpan'}</h3>
           </div>
        </div>
      )}
    </div>
  );
};