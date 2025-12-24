import React, { useState } from 'react';
import { DataProvider } from './services/dataContext';
import { AuthProvider, useAuth } from './services/authContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Orders } from './pages/Orders';
import { Invoices } from './pages/Invoices';
import { WebSeo } from './pages/WebSeo';
import { Settings } from './pages/Settings';
import { MonthlyAds } from './pages/MonthlyAds';
import { Login } from './pages/Login';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <Clients />;
      case 'monthly-ads': return <MonthlyAds />;
      case 'orders': return <Orders />;
      case 'invoices': return <Invoices />;
      case 'webseo': return <WebSeo />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;