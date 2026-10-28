import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, AlertCircle, Check, ArrowRight, X } from 'lucide-react';
import { UserRole } from '../types';

export const AuthGateModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, login } = useApp();

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('student');
  const [identifierInput, setIdentifierInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('Computer Science & Engg');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const isEmailValidRNSIT = emailInput.trim().toLowerCase().endsWith('@rnsit.ac.in');
  const hasEnteredOtherDomain = emailInput.includes('@') && !isEmailValidRNSIT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = login(emailInput, nameInput, roleInput, identifierInput, departmentInput);
    if (!result.success) {
      setErrorMessage(result.error || 'Invalid RNSIT email address.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">RNSIT Institutional Access</h3>
            </div>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200 font-medium leading-relaxed">
            <span className="font-bold text-slate-900">RNSIT Anti-Spam Gate:</span> Only verified accounts with an <span className="font-mono font-bold text-slate-900">@rnsit.ac.in</span> institutional email may submit tickets or manage workflows.
          </div>

          {/* Custom RNSIT Email Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="e.g. 1rn22cs045.rahul@rnsit.ac.in"
                  className={`w-full px-4 py-3 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-colors font-medium ${
                    isEmailValidRNSIT
                      ? 'border-emerald-500 focus:border-emerald-600 pr-10'
                      : hasEnteredOtherDomain
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-slate-300 focus:border-slate-900'
                  }`}
                  required
                />
                {isEmailValidRNSIT && (
                  <div className="absolute right-3.5 top-3.5 text-emerald-600 flex items-center">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </div>

              {hasEnteredOtherDomain && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Outside email rejected. Only @rnsit.ac.in addresses are permitted.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Campus Role
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Teaching Staff / Faculty</option>
                  <option value="admin">Administrative Staff</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  {roleInput === 'student' ? 'USN' : 'Staff ID / Room'}
                </label>
                <input
                  type="text"
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  placeholder={roleInput === 'student' ? 'e.g. 1RN22CS045' : 'e.g. RNS-FAC-114'}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  Department
                </label>
                <select
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                >
                  <option value="Computer Science & Engg">Computer Science (CSE)</option>
                  <option value="Information Science & Engg">Information Science (ISE)</option>
                  <option value="AI & Machine Learning">AI & ML</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Campus Estate Office">Estate & Administration</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isEmailValidRNSIT}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                isEmailValidRNSIT
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Verify & Continue with @rnsit.ac.in</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
