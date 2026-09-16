import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { StatusLogModal } from './components/layout/StatusLogModal';
import { ConnectRepoModal } from './components/repo/ConnectRepoModal';
import { AIChatDrawer } from './components/chat/AIChatDrawer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ComparePage } from './pages/ComparePage';
import { HistoryPage } from './pages/HistoryPage';

export const AppLayout: React.FC = () => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0A0E14] text-gray-200">
      {/* Sidebar */}
      <Sidebar onOpenConnectModal={() => setIsConnectModalOpen(true)} />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenConnectModal={() => setIsConnectModalOpen(true)} />

        <main className="flex-1 overflow-y-auto pb-12">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Floating AI Chatbot Drawer & Modals */}
      <AIChatDrawer />
      <StatusLogModal />
      <ConnectRepoModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ScanProvider>
          <Routes>
            {/* Landing Page Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Dedicated Login Page Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Application Dashboard Routes */}
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </ScanProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
