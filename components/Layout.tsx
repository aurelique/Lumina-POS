import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Receipt, LogOut, Menu, X, Settings, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userRole: 'ADMIN' | 'STAFF';
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, onTabChange, onLogout, userRole, darkMode, toggleDarkMode 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allNavItems = [
    { id: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
    { id: 'inventory', label: 'Produk', icon: Package },
    { id: 'transactions', label: 'Riwayat', icon: Receipt },
    { id: 'reports', label: 'Laporan', icon: LayoutDashboard },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const navItems = allNavItems.filter(item => {
    if (userRole === 'STAFF' && item.id === 'settings') return false;
    return true;
  });

  const handleNavClick = (id: string) => {
    onTabChange(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">BySha POS</h1>
        <div className="flex gap-2">
            <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-300">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Sidebar - Z-Index updated to z-40 to sit above POS sticky bar (z-30) but below modals (z-50) */}
      <aside className={`
        fixed md:relative z-40 w-64 h-full bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-lg transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        flex flex-col justify-between pt-16 md:pt-0
      `}>
        <div>
          <div className="hidden md:flex items-center justify-between px-6 h-20 border-b dark:border-gray-700">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              BySha POS
            </h1>
            <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 hover:bg-gray-200 transition-colors"
                title={darkMode ? "Mode Terang" : "Mode Gelap"}
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div className="px-6 py-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Menu</div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${activeTab === item.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-semibold shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'}
                    `}
                  >
                    <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'} />
                    {item.label}
                  </button>
                ))}
              </nav>
          </div>
        </div>

        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="px-4 mb-2">
             <p className="text-xs text-gray-400">Login sebagai</p>
             <p className="font-bold text-gray-800 dark:text-white">{userRole}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
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
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};