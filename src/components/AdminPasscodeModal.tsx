import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, KeyRound, AlertCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const AdminPasscodeModal: React.FC = () => {
  const { showAdminPasscodeModal, setShowAdminPasscodeModal, unlockAdmin } = useApp();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  if (!showAdminPasscodeModal) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockAdmin(passcode);
    if (!success) {
      setError(true);
    } else {
      setError(false);
      setPasscode('');
    }
  };

  const handleQuickDemo = () => {
    unlockAdmin('rnsit2026');
    setError(false);
    setPasscode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Admin Command Gate</h3>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAdminPasscodeModal(false);
              setError(false);
            }}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleUnlock} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Security Passcode</span>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">rnsit2026</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(false);
                }}
                placeholder="Enter admin passcode"
                className={`w-full px-4 py-3 text-base rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-colors font-mono font-bold ${
                  error ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-slate-900'
                }`}
                autoFocus
                required
              />
              <KeyRound className="w-5 h-5 text-slate-500 absolute right-3.5 top-3.5" />
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Incorrect passcode. Please enter rnsit2026 or click unlock below.</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Unlock Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>One-Click Unlock (Demo: rnsit2026)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
