import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LandingView } from './components/LandingView.tsx';
import { BrowseView } from './components/BrowseView.tsx';
import { ReportItemView } from './components/ReportItemView.tsx';
import { ItemDetailsView } from './components/ItemDetailsView.tsx';
import { MyReportsView } from './components/MyReportsView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ClaimModal } from './components/ClaimModal.tsx';
import { ClaimDetailsModal } from './components/ClaimDetailsModal.tsx';
import { ItemReport } from './types.ts';
import { Sparkles, ShieldCheck, Heart, Github } from 'lucide-react';

function AppContent() {
  const { selectedClaimForModal, setSelectedClaimForModal } = useApp();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [claimModalItem, setClaimModalItem] = useState<ItemReport | null>(null);

  const handleNavigate = (view: string, itemId?: string) => {
    if (itemId) {
      setSelectedItemId(itemId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReport = (type: 'lost' | 'found' = 'lost') => {
    setCurrentView(type === 'lost' ? 'report-lost' : 'report-found');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemClick = (id: string) => {
    setSelectedItemId(id);
    setCurrentView('item-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenReportModal={handleOpenReport}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            onNavigate={handleNavigate}
            onOpenReportModal={handleOpenReport}
          />
        )}

        {currentView === 'browse' && (
          <BrowseView
            onSelectItem={handleItemClick}
            onOpenReportModal={handleOpenReport}
          />
        )}

        {currentView === 'report-lost' && (
          <ReportItemView
            initialType="lost"
            onSuccess={newItem => {
              setSelectedItemId(newItem.id);
              setCurrentView('item-details');
            }}
            onCancel={() => setCurrentView('browse')}
          />
        )}

        {currentView === 'report-found' && (
          <ReportItemView
            initialType="found"
            onSuccess={newItem => {
              setSelectedItemId(newItem.id);
              setCurrentView('item-details');
            }}
            onCancel={() => setCurrentView('browse')}
          />
        )}

        {currentView === 'item-details' && selectedItemId && (
          <ItemDetailsView
            itemId={selectedItemId}
            onBack={() => setCurrentView('browse')}
            onNavigateItem={id => {
              setSelectedItemId(id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenClaimModal={item => setClaimModalItem(item)}
          />
        )}

        {currentView === 'my-reports' && (
          <MyReportsView
            onNavigateItem={handleItemClick}
            onOpenReportModal={handleOpenReport}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView onNavigate={handleNavigate} />
        )}
      </main>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {claimModalItem && (
        <ClaimModal
          item={claimModalItem}
          onClose={() => setClaimModalItem(null)}
          onSuccess={() => {
            setClaimModalItem(null);
            setCurrentView('my-reports');
          }}
        />
      )}

      {selectedClaimForModal && (
        <ClaimDetailsModal
          claim={selectedClaimForModal}
          onClose={() => setSelectedClaimForModal(null)}
          onNavigateItem={handleItemClick}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              R
            </div>
            <span className="font-semibold text-slate-700">
              ReFound • Campus Lost & Found
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Powered by Gemini Intelligent Matching
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Zero-Guess Ownership Verification
            </span>
          </div>

          <p className="text-slate-400 text-[11px]">
            Designed for Campus Students, Faculty & Staff
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
