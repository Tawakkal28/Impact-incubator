import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  GraduationCap,
  User,
  Building2,
  Lock,
  KeyRound,
  AlertCircle,
  Check,
  ArrowRight,
  PhoneCall,
  Sparkles,
  Info,
} from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, unlockAdmin, helplines } = useApp();

  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engg');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const emergencySecurity = helplines.find((h) => h.isEmergency) || helplines[0];

  const isEmailValidRNSIT = email.trim().toLowerCase().endsWith('@rnsit.ac.in');
  const hasEnteredNonRNSDomain = email.includes('@') && !isEmailValidRNSIT;

  const handleRoleTabChange = (role: UserRole) => {
    setActiveRoleTab(role);
    setErrorMessage(null);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@rnsit.ac.in')) {
      setErrorMessage(
        'Access denied: You must use an official RNSIT institutional email address ending with @rnsit.ac.in to prevent spam.'
      );
      return;
    }

    if (activeRoleTab === 'admin') {
      if (adminPasscode.trim().toLowerCase() !== 'rnsit2026') {
        setErrorMessage('Invalid administrative passcode. (Demo passcode: rnsit2026)');
        return;
      }
      unlockAdmin(adminPasscode);
    }

    const result = login(
      trimmedEmail,
      name.trim() || (activeRoleTab === 'student' ? 'RNSIT Student' : 'RNSIT Faculty'),
      activeRoleTab,
      identifier.trim() || (activeRoleTab === 'student' ? '1RN22CS000' : 'Faculty ID'),
      department
    );

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-sm">
              U
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                Our<span className="text-amber-600">UNI</span>
              </span>
              <span className="text-sm font-bold text-slate-700 ml-2.5 hidden sm:inline">
                RNS Institute of Technology · Campus Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 hidden sm:inline">Emergency Security:</span>
            <a
              href="tel:+918028611880"
              className="font-mono font-semibold text-slate-900 hover:text-amber-700 bg-slate-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>+91 80 2861 1880</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Login Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl w-full">
          {/* Left Column: Campus Information & Anti-Spam Explanation (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Campus Anti-Spam Gate</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Centralized Issue Reporting & Facility Desk
              </h1>
            </div>

            {/* Verification Note Box */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-sm">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
                <Info className="w-5 h-5 text-amber-600" />
                <span>Restricted to @rnsit.ac.in Community</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs font-bold text-slate-700 font-mono">
                <span>· Students (USN)</span>
                <span>· Faculty Members</span>
                <span>· Estate Control</span>
              </div>
            </div>

            {/* Campus Service Highlights */}
            <div className="space-y-3 pt-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider block">
                Campus Portal Services
              </span>
              <div className="space-y-2.5">
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Student & Faculty Grievance</span>
                    <span className="text-xs text-slate-700 font-medium">Log infrastructure, sanitation, and lab equipment issues across any RNSIT block.</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Interactive Campus Vector Map</span>
                    <span className="text-xs text-slate-700 font-medium">Visual location tagging with real-time hazard pins across RNSPU, CSE, ECE & more.</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Estate Office Work Order Triage</span>
                    <span className="text-xs text-slate-700 font-medium">Authorized technician dispatch, photo verification, and permanent resolution records.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
              {/* Role Selection Tabs */}
              <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => handleRoleTabChange('student')}
                  className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeRoleTab === 'student'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTabChange('faculty')}
                  className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeRoleTab === 'faculty'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Faculty</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTabChange('admin')}
                  className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeRoleTab === 'admin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Estate Admin</span>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleCustomLogin} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>RNSIT Institutional Email</span>
                    <span className="text-xs font-mono text-emerald-700 font-bold">@rnsit.ac.in</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="e.g. 1rn22cs045.rahul@rnsit.ac.in"
                      className={`w-full px-4 py-3 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-colors font-medium ${
                        isEmailValidRNSIT
                          ? 'border-emerald-500 focus:border-emerald-600 pr-10'
                          : hasEnteredNonRNSDomain
                          ? 'border-red-400 bg-red-50/30'
                          : 'border-slate-300 focus:border-slate-900'
                      }`}
                      required
                    />
                    {isEmailValidRNSIT && (
                      <div className="absolute right-3.5 top-3.5 text-emerald-600 flex items-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {hasEnteredNonRNSDomain && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600 font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Non-RNSIT domain rejected. Please use your @rnsit.ac.in address.</span>
                    </div>
                  )}
                </div>

                {/* Name & USN/Identifier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      {activeRoleTab === 'student' ? 'USN' : 'Staff Identifier'}
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={activeRoleTab === 'student' ? 'e.g. 1RN22CS045' : 'e.g. ISE Department'}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-mono font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Academic Department / Wing
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                  >
                    <option value="Computer Science & Engg">Computer Science & Engineering (CSE)</option>
                    <option value="Information Science & Engg">Information Science & Engineering (ISE)</option>
                    <option value="AI & Machine Learning">AI & Machine Learning (AIML)</option>
                    <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                    <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Master of Business Admin">MBA / Management Studies</option>
                    <option value="Campus Administration & Maintenance">Campus Administration & Estate</option>
                  </select>
                </div>

                {/* Admin Passcode Gate (only visible for Admin role) */}
                {activeRoleTab === 'admin' && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <label className="block text-sm font-extrabold text-amber-950 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-amber-600" />
                        <span>Administrative Passcode</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-900">
                        Demo: rnsit2026
                      </span>
                    </label>
                    <input
                      type="password"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Enter admin passcode"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-amber-300 bg-white focus:outline-none focus:border-amber-700 font-mono font-bold"
                      required
                    />
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Sign In to OurUNI Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-sm text-slate-700 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-extrabold text-slate-900 text-sm">
            OurUNI · RNS Institute of Technology (RNSIT)
          </p>
          <p className="text-xs font-semibold text-slate-700">
            Dr. Vishnuvardhan Road, Channasandra, RR Nagar Post, Bengaluru - 560098
          </p>
        </div>
      </footer>
    </div>
  );
};
