import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import VideoManagement from './pages/VideoManagement';
import CouponGenerator from './pages/CouponGenerator';
import SubscriptionManager from './pages/SubscriptionManager';
import SecuritySettings from './pages/SecuritySettings';
import LoginModal from './pages/LoginModal';

function AdminPortalContent() {
  const { isAdminLoggedIn } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isAdminLoggedIn) {
    return <LoginModal />;
  }

  const renderContent = () => {
    switch(currentTab) {
      case 'dashboard':
        return <DashboardOverview key={refreshKey} onNavigate={setCurrentTab} />;
      case 'videos':
        return <VideoManagement key={refreshKey} />;
      case 'coupons':
        return <CouponGenerator key={refreshKey} />;
      case 'viewers':
        return <SubscriptionManager key={refreshKey} />;
      case 'settings':
        return <SecuritySettings key={refreshKey} />;
      default:
        return <DashboardOverview onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Responsive Sidebar (Desktop fixed + Mobile slide-over) */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header 
          currentTab={currentTab} 
          onRefresh={() => setRefreshKey(k => k + 1)} 
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminPortalContent />
    </AdminAuthProvider>
  );
}
