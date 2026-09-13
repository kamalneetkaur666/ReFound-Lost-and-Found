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
import { Sparkles, ShieldCheck, Heart, Github, Bell, X, ArrowRight } from 'lucide-react';

function AppContent() {
  const {
    selectedClaimForModal,
    setSelectedClaimForModal,
    activeToast,
    dismissToast,
    openClaimDetailsModal,
  } = useApp();
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

      {/* Floating Active Toast Banner */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-indigo-100 flex items-start gap-3.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                {activeToast.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                {activeToast.message}
              </p>
              {(activeToast.claimId || activeToast.itemId) && (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (activeToast.claimId) {
                        openClaimDetailsModal(activeToast.claimId, activeToast.itemId);
                      } else if (activeToast.itemId) {
                        openClaimDetailsModal(activeToast.itemId, activeToast.itemId);
                      }
                      dismissToast();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>View Claim & Message</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={dismissToast}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={dismissToast}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
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
