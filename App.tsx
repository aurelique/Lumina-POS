import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Transactions } from './components/Transactions';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { User } from './types';
import { db } from './components/services/db';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [darkMode, setDarkMode] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    // 1. Check for Magic Link Configuration (?db=URL)
    const params = new URLSearchParams(window.location.search);
    const magicDbUrl = params.get('db');
    
    if (magicDbUrl) {
      try {
        localStorage.setItem('lumina_gscript_url', magicDbUrl);
        // Clean the URL for security so the secret doesn't stay in history
        window.history.replaceState({}, document.title, window.location.pathname);
        alert('Database berhasil dihubungkan otomatis dari Link!');
        setDbConnected(true);
      } catch (e) {
        console.error("Failed to auto-configure", e);
      }
    }

    // 2. Check Auth
    const savedUser = localStorage.getItem('lumina_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 3. Check Dark Mode
    const savedTheme = localStorage.getItem('lumina_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lumina_theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lumina_theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('lumina_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('lumina_user');
    setUser(null);
    setActiveTab('pos');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'pos': return <POS />;
      case 'inventory': return <Inventory />;
      case 'transactions': return <Transactions />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <POS />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={handleLogout}
      userRole={user.role}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;