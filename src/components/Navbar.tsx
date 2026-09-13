import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Compass,
  PlusCircle,
  FolderHeart,
  Bell,
  User as UserIcon,
  LogOut,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, itemId?: string) => void;
  onOpenAuth: () => void;
  onOpenReportModal: (type?: 'lost' | 'found') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenReportModal,
}) => {
  const {
    currentUser,
    logoutUser,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    openClaimDetailsModal,
    setDemoUser,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="nav-brand-logo"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Re<span className="text-indigo-600">Found</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Campus
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">
                Smart Lost & Found
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-link-home"
              onClick={() => onNavigate('landing')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'landing'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              id="nav-link-browse"
              onClick={() => onNavigate('browse')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === 'browse'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse Items
            </button>
            <button
              id="nav-link-reports"
              onClick={() => onNavigate('my-reports')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 relative ${
                currentView === 'my-reports'
                  ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              My Reports
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Report Item Dropdown Button */}
            <div className="relative">
              <button
                id="btn-report-item-menu"
                onClick={() => setShowReportDropdown(!showReportDropdown)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3.5 py-2 rounded-lg text-sm font-medium shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Report Item</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
              </button>

              {showReportDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowReportDropdown(false)}
                >
                  <button
                    id="btn-report-lost-dropdown"
                    onClick={() => {
                      setShowReportDropdown(false);
                      onNavigate('report-lost');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-amber-50/70 flex items-start gap-3 text-slate-800"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      L
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">Report Lost Item</div>
                      <div className="text-xs text-slate-500">I lost something on campus</div>
                    </div>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    id="btn-report-found-dropdown"
                    onClick={() => {
                      setShowReportDropdown(false);
                      onNavigate('report-found');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/70 flex items-start gap-3 text-slate-800"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      F
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">Report Found Item</div>
                      <div className="text-xs text-slate-500">I found an item on campus</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notifications-toggle"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 max-h-[26rem] flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-800">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span>Notifications</span>
                      {unreadNotificationCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                          {unreadNotificationCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead()}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            setShowNotifMenu(false);
                            if (n.type === 'claim' || n.type === 'claim_update' || n.relatedClaimId) {
                              openClaimDetailsModal(n);
                            } else if (n.relatedItemId) {
                              onNavigate('item-details', n.relatedItemId);
                            }
                          }}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                            !n.read ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              n.type === 'match'
                                ? 'bg-purple-100 text-purple-700'
                                : n.type === 'claim'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {n.type === 'claim' ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-1">
                              <h4 className="text-xs font-semibold text-slate-900 truncate">
                                {n.title}
                              </h4>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                            <div className="flex items-center justify-between gap-2 mt-1.5">
                              <span className="text-[10px] text-slate-400 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {(n.type === 'claim' || n.type === 'claim_update' || n.relatedClaimId) && (
                                <span className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                  <span>View Message & Profile</span>
                                  <span>&rarr;</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account / Profile Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="btn-user-profile-toggle"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifMenu(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[120px] truncate">
                    {currentUser.displayName}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.displayName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      {currentUser.campusId && (
                        <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          ID: {currentUser.campusId}
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('profile');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                        My Profile & Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('my-reports');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FolderHeart className="w-3.5 h-3.5 text-slate-500" />
                        My Reports & Claims
                      </button>
                    </div>

                    {/* Quick Demo Switcher */}
                    <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                        Switch Demo Persona
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setDemoUser('student');
                            setShowUserMenu(false);
                          }}
                          className={`text-left text-xs py-1 px-2 rounded flex items-center justify-between ${
                            currentUser.uid === 'demo-user-1'
                              ? 'bg-indigo-100 text-indigo-800 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>Alex (Lost Hydro Flask)</span>
                          {currentUser.uid === 'demo-user-1' && (
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setDemoUser('staff');
                            setShowUserMenu(false);
                          }}
                          className={`text-left text-xs py-1 px-2 rounded flex items-center justify-between ${
                            currentUser.uid === 'demo-staff-1'
                              ? 'bg-indigo-100 text-indigo-800 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>Jordan (Library Staff)</span>
                          {currentUser.uid === 'demo-staff-1' && (
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logoutUser();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-nav-signin"
                onClick={onOpenAuth}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
