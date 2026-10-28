import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CampusMap } from './components/CampusMap';
import { ReportIssueWizard } from './components/ReportIssueWizard';
import { TicketTracker } from './components/TicketTracker';
import { QrDirectory } from './components/QrDirectory';
import { AdminDashboard } from './components/AdminDashboard';
import { HelplinesView } from './components/HelplinesView';
import { LoginPage } from './components/LoginPage';
import { AuthGateModal } from './components/AuthGateModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { RotateCcw, ShieldCheck, MapPin, PhoneCall, Building2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isAdminUnlocked, setShowAdminPasscodeModal, resetDataToDefault, currentUser } = useApp();

  // If user is not authenticated / has logged out, display dedicated full-page Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Listen to hash changes for deep-linking (e.g. from QR codes)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('report')) {
        setActiveTab('report');
      } else if (hash.includes('map')) {
        setActiveTab('map');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setActiveTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'map' && <CampusMap />}
        {activeTab === 'report' && <ReportIssueWizard />}
        {activeTab === 'track' && <TicketTracker />}
        {activeTab === 'qr' && <QrDirectory />}
        {activeTab === 'helplines' && <HelplinesView />}
        {activeTab === 'admin' && (
          isAdminUnlocked ? <AdminDashboard /> : (
            <div className="max-w-md mx-auto py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto">
                <Building2 className="w-7 h-7 text-amber-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Estate Administration Passcode Required</h2>
              <button
                onClick={() => setShowAdminPasscodeModal(true)}
                className="px-6 py-3 text-sm font-extrabold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <span>Enter Admin Passcode (Demo: rnsit2026)</span>
              </button>
            </div>
          )
        )}
      </main>

      {/* Campus Policy & Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-sm text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-base">
                U
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-base">OurUNI · RNS Institute of Technology</p>
                <p className="font-medium text-slate-700 text-xs">
                  Channasandra, Dr. Vishnuvardhan Road, Bengaluru — 560098
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Restricted to @rnsit.ac.in Domain</span>
              </span>

              <button
                onClick={resetDataToDefault}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1.5 transition-colors"
                title="Reset local storage and re-populate seeded campus issues"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Records</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthGateModal />
      <AdminPasscodeModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
