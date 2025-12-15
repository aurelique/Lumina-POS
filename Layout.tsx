import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Receipt, LogOut, Menu, X, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
    { id: 'inventory', label: 'Produk', icon: Package },
    { id: 'transactions', label: 'Riwayat', icon: Receipt },
    { id: 'reports', label: 'Laporan', icon: LayoutDashboard },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b z-20 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600">Lumina</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-10 w-64 h-full bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col justify-between pt-16 md:pt-0
      `}>
        <div>
          <div className="hidden md:flex items-center justify-center h-20 border-b">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Lumina POS
            </h1>
          </div>
          <nav className="mt-6 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative w-full pt-14 md:pt-0">
        <div className="h-full overflow-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};