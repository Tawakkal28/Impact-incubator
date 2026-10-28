import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PhoneCall,
  Phone,
  ShieldAlert,
  AlertTriangle,
  Clock,
  User,
  Copy,
  Check,
  Search,
  Building2,
  HeartPulse,
} from 'lucide-react';
import { CampusHelpline } from '../types';

export const HelplinesView: React.FC = () => {
  const { helplines } = useApp();
  const [filterEmergency, setFilterEmergency] = useState<'all' | 'emergency' | 'general'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredHelplines = helplines.filter((hl) => {
    const matchesType =
      filterEmergency === 'all'
        ? true
        : filterEmergency === 'emergency'
        ? hl.isEmergency
        : !hl.isEmergency;

    const matchesSearch =
      hl.title.toLowerCase().includes(search.toLowerCase()) ||
      hl.department.toLowerCase().includes(search.toLowerCase()) ||
      hl.number.includes(search) ||
      hl.intercom.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  const handleCopyNumber = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          RNSIT Campus Emergency & Helpline Directory
        </h2>
      </div>

      {/* Emergency Notice Card */}
      <div className="p-4 sm:p-5 bg-red-50 border border-red-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-950">Immediate Hazard / Safety Emergency?</h3>
            <p className="text-xs text-red-700 mt-0.5">
              For live electric sparks, gas leaks, medical emergencies, or structural hazards, call campus central control immediately.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:+918028611880"
            className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Security: +91 80 2861 1880</span>
          </a>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search helpline, department, or intercom..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterEmergency('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterEmergency === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Contacts
          </button>

          <button
            onClick={() => setFilterEmergency('emergency')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterEmergency === 'emergency'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Emergency (24x7)
          </button>

          <button
            onClick={() => setFilterEmergency('general')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterEmergency === 'general'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Facility Helpdesks
          </button>
        </div>
      </div>

      {/* Helpline Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHelplines.map((hl) => (
          <div
            key={hl.id}
            className={`p-5 rounded-3xl border transition-all bg-white shadow-xs ${
              hl.isEmergency ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {hl.department}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5">{hl.title}</h4>
              </div>

              {hl.isEmergency && (
                <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                  24x7 Emergency
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 my-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Campus Intercom:</span>
                <span className="font-mono font-bold text-slate-900">{hl.intercom}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Operating Hours:</span>
                <span className="text-slate-700">{hl.hours}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">In-Charge Officer:</span>
                <span className="text-slate-700 truncate max-w-[200px]">{hl.contactPerson}</span>
              </div>
            </div>

            {/* Direct Dial Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="font-mono font-semibold text-xs text-slate-900">{hl.number}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyNumber(hl.id, hl.number)}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copy Number"
                >
                  {copiedId === hl.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <a
                  href={`tel:${hl.number.replace(/\s+/g, '')}`}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
