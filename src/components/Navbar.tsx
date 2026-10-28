import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  PlusCircle,
  Search,
  QrCode,
  PhoneCall,
  ShieldAlert,
  UserCheck,
  LogOut,
  Lock,
  Unlock,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    isAdminUnlocked,
    activeTab,
    setActiveTab,
    setShowAuthModal,
    setShowAdminPasscodeModal,
    lockAdmin,
    logout,
    tickets,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const openTicketsCount = tickets.filter((t) => t.status !== 'resolved').length;
  const criticalCount = tickets.filter((t) => t.status !== 'resolved' && t.urgency === 'critical').length;

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark & Single Subtitle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('map')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg tracking-wider shadow-sm group-hover:bg-slate-800 transition-colors">
                U
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  Our<span className="text-amber-600">UNI</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 tracking-normal -mt-1">
                  RNSIT Campus Desk
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleNavClick('map')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'map'
                  ? 'text-slate-950 font-semibold bg-slate-100'
                  : 'hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Campus Map</span>
            </button>

            <button
              onClick={() => handleNavClick('report')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'report'
                  ? 'text-slate-950 font-semibold bg-slate-100'
                  : 'hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => handleNavClick('track')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'track'
                  ? 'text-slate-950 font-semibold bg-slate-100'
                  : 'hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Track Ticket</span>
              {openTicketsCount > 0 && (
                <span className="text-xs font-mono font-medium text-slate-600 tabular-nums">
                  ({openTicketsCount})
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('qr')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'qr'
                  ? 'text-slate-950 font-semibold bg-slate-100'
                  : 'hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4 text-slate-500" />
              <span>QR Badges</span>
            </button>

            <button
              onClick={() => handleNavClick('helplines')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'helplines'
                  ? 'text-slate-950 font-semibold bg-slate-100'
                  : 'hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-slate-500" />
              <span>Helplines</span>
            </button>

            {/* Admin Console Tab (Visible or with Lock) */}
            <button
              onClick={() => {
                if (isAdminUnlocked) {
                  handleNavClick('admin');
                } else {
                  setShowAdminPasscodeModal(true);
                }
              }}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'text-amber-950 font-semibold bg-amber-50 border border-amber-200'
                  : isAdminUnlocked
                  ? 'text-amber-800 hover:bg-amber-50/60'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {isAdminUnlocked ? (
                <Unlock className="w-4 h-4 text-amber-600" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
              <span>Admin Portal</span>
              {criticalCount > 0 && isAdminUnlocked && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-red-100 text-red-700 rounded font-semibold tabular-nums">
                  {criticalCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action / Verified Campus Account */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors bg-slate-50/50 text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex flex-col text-xs leading-tight">
                      <span className="font-semibold text-slate-900 truncate max-w-[120px]">
                        {currentUser.name}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px] truncate max-w-[120px]">
                        {currentUser.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 text-xs">
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium mb-1">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified @rnsit.ac.in Account</span>
                        </div>
                        <p className="font-medium text-slate-900">{currentUser.name}</p>
                        <p className="text-slate-500 font-mono text-[11px]">{currentUser.identifier}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{currentUser.department}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setShowAuthModal(true);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between"
                        >
                          <span>Switch RNSIT Account</span>
                          <span className="text-[10px] text-slate-400">Student/Faculty</span>
                        </button>

                        {isAdminUnlocked ? (
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              lockAdmin();
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-800 flex items-center gap-2"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Lock Admin Mode</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setShowAdminPasscodeModal(true);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-slate-700 flex items-center gap-2"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Unlock Admin Portal</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 border-t border-slate-100 mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visible Logout CTA */}
                <button
                  onClick={logout}
                  title="Sign Out to Login Page"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                Sign In with @rnsit.ac.in
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-950 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  {currentUser ? currentUser.name : 'Guest User'}
                </span>
                <span className="font-mono text-[10px] text-emerald-700 font-medium">
                  {currentUser ? '@rnsit.ac.in' : 'Restricted'}
                </span>
              </div>
              {currentUser && (
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {currentUser.identifier} · {currentUser.role}
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('map')}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 ${
                activeTab === 'map' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
              }`}
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Campus Map</span>
            </button>

            <button
              onClick={() => handleNavClick('report')}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 ${
                activeTab === 'report' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Report Issue</span>
            </button>

            <button
              onClick={() => handleNavClick('track')}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 ${
                activeTab === 'track' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Track Ticket ({openTicketsCount})</span>
            </button>

            <button
              onClick={() => handleNavClick('qr')}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 ${
                activeTab === 'qr' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
              }`}
            >
              <QrCode className="w-4 h-4 text-slate-500" />
              <span>QR Badges</span>
            </button>

            <button
              onClick={() => handleNavClick('helplines')}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 ${
                activeTab === 'helplines' ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-slate-500" />
              <span>Campus Helplines</span>
            </button>

            <button
              onClick={() => {
                if (isAdminUnlocked) {
                  handleNavClick('admin');
                } else {
                  setMobileMenuOpen(false);
                  setShowAdminPasscodeModal(true);
                }
              }}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 ${
                activeTab === 'admin' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-amber-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Admin Portal {isAdminUnlocked ? '(Unlocked)' : '(Passcode Required)'}</span>
            </button>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowAuthModal(true);
                }}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Switch Account
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-center px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
