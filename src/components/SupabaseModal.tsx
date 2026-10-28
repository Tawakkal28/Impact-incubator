import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  X,
  Server,
  Key,
  Shield,
  Layers,
} from 'lucide-react';
import { SUPABASE_SCHEMA_SQL, testSupabaseConnection } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const {
    supabaseConfig,
    isSupabaseConnected,
    isSupabaseSyncing,
    supabaseSyncError,
    saveSupabaseSettings,
    disconnectSupabase,
    refreshTicketsFromSupabase,
    syncLocalTicketsToSupabase,
    tickets,
  } = useApp();

  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; tableReady?: boolean } | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'connection' | 'schema' | 'sync'>('connection');

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult({
        success: false,
        message: 'Please provide both your Supabase Project URL and Anon Public Key.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await saveSupabaseSettings(urlInput.trim(), keyInput.trim());
    setTestResult(result);
    setTesting(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handlePushToSupabase = async () => {
    setSyncStatus('Pushing records to Supabase PostgreSQL...');
    const result = await syncLocalTicketsToSupabase();
    if (result.success) {
      setSyncStatus(`Successfully pushed ${result.count} tickets to Supabase!`);
    } else {
      setSyncStatus(`Push failed: ${result.error}`);
    }
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handlePullFromSupabase = async () => {
    setSyncStatus('Fetching records from Supabase...');
    await refreshTicketsFromSupabase();
    setSyncStatus('Tickets updated from Supabase PostgreSQL!');
    setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold">Supabase PostgreSQL Database</h3>
                {isSupabaseConnected ? (
                  <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Offline / Local Cache
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Real-time tickets persistence & institutional incident management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('connection')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'connection'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            Connection Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('schema')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'schema'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            SQL Schema (Setup)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sync')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'sync'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Sync & Tools
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Connection Tab */}
          {activeSubTab === 'connection' && (
            <div className="space-y-5">
              {/* Connection Status Card */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  isSupabaseConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {isSupabaseConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-extrabold flex items-center gap-2">
                    {isSupabaseConnected
                      ? 'Supabase Database Connected'
                      : 'Supabase Not Connected (Operating in Local Mode)'}
                    {supabaseConfig.source !== 'none' && (
                      <span className="text-2xs font-mono font-bold bg-white/70 px-2 py-0.5 rounded border border-slate-300 text-slate-700">
                        source: {supabaseConfig.source}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-90">
                    {isSupabaseConnected
                      ? 'All tickets, real-time status updates, and reporter history sync directly with your PostgreSQL tables in Supabase.'
                      : 'Enter your Supabase project credentials below to enable live PostgreSQL persistence and real-time updates.'}
                  </p>
                  {supabaseSyncError && (
                    <p className="text-xs text-red-600 font-medium pt-1">
                      Sync Error: {supabaseSyncError}
                    </p>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleTestAndSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Supabase Project URL</span>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 text-xs flex items-center gap-1 font-semibold normal-case"
                    >
                      Supabase Dashboard <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <div className="relative">
                    <Server className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://your-project-id.supabase.co"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800 font-mono"
                    />
                  </div>
                  <p className="text-2xs text-slate-500 mt-1">
                    Found in your Supabase project under Project Settings &gt; API &gt; Project URL
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Supabase Anon / Public API Key
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800 font-mono"
                    />
                  </div>
                  <p className="text-2xs text-slate-500 mt-1">
                    Found in Project Settings &gt; API &gt; Project API keys &gt; `anon` `public`
                  </p>
                </div>

                {testResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                      testResult.success
                        ? testResult.tableReady
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block">
                        {testResult.success ? 'Connection Validated' : 'Connection Failed'}
                      </span>
                      <span>{testResult.message}</span>
                      {testResult.tableReady === false && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setActiveSubTab('schema')}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                          >
                            View & Copy SQL Setup Script
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={testing}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {testing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Database className="w-4 h-4" />
                    )}
                    <span>{testing ? 'Testing Connection...' : 'Save & Connect to Supabase'}</span>
                  </button>

                  {supabaseConfig.isConfigured && (
                    <button
                      type="button"
                      onClick={disconnectSupabase}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors"
                    >
                      Disconnect Database
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* SQL Schema Tab */}
          {activeSubTab === 'schema' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 space-y-2">
                <span className="font-extrabold text-slate-900 block flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Quick Supabase Setup Instructions
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Log in to your Supabase Dashboard and choose your project.</li>
                  <li>Click on the <strong>SQL Editor</strong> tab on the left sidebar.</li>
                  <li>Click <strong>New Query</strong>, paste the script below, and click <strong>Run</strong>.</li>
                  <li>Return to the Connection tab to save your URL and Anon Key.</li>
                </ol>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between bg-slate-900 text-slate-300 px-4 py-2 rounded-t-xl text-xs font-mono font-bold">
                  <span>schema.sql</span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-b-xl overflow-x-auto max-h-64 border border-slate-800">
                  {SUPABASE_SCHEMA_SQL}
                </pre>
              </div>
            </div>
          )}

          {/* Sync & Tools Tab */}
          {activeSubTab === 'sync' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">
                  Database Synchronization Tools
                </span>
                <p className="text-xs text-slate-600">
                  Transfer existing campus tickets to your remote Supabase PostgreSQL database, or refresh local state with live records.
                </p>
              </div>

              {syncStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{syncStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePushToSupabase}
                  disabled={!supabaseConfig.isConfigured || isSupabaseSyncing}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all disabled:opacity-50"
                >
                  <UploadCloud className="w-5 h-5 text-emerald-600 mb-2" />
                  <span className="font-bold text-sm block text-slate-900">Push Local Tickets</span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Upload current {tickets.length} campus complaints to Supabase PostgreSQL.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePullFromSupabase}
                  disabled={!supabaseConfig.isConfigured || isSupabaseSyncing}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 text-emerald-600 mb-2 ${isSupabaseSyncing ? 'animate-spin' : ''}`} />
                  <span className="font-bold text-sm block text-slate-900">Pull Remote Tickets</span>
                  <span className="text-xs text-slate-500 block mt-1">
                    Download latest complaints from your Supabase PostgreSQL database.
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between">
          <div className="text-2xs text-slate-500 font-mono">
            {tickets.length} total tickets in active state
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
