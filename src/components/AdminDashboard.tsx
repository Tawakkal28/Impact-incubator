import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Phone,
  Building2,
  Lock,
  Layers,
  Search,
  Filter,
  Plus,
  ArrowRight,
  X,
  FileText,
  User,
  Camera,
  Image as ImageIcon,
  Eye,
  Maximize2,
  Sparkles,
  Database,
} from 'lucide-react';
import { ComplaintTicket, ComplaintStatus, UrgencyLevel, MaintenanceWorker } from '../types';
import { SupabaseModal } from './SupabaseModal';

export const AdminDashboard: React.FC = () => {
  const {
    tickets,
    maintenanceWorkers,
    buildings,
    updateTicketStatus,
    lockAdmin,
    currentUser,
    setTrackTicketQuery,
    setActiveTab,
    isSupabaseConnected,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [photoFilter, setPhotoFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketForAction, setSelectedTicketForAction] = useState<ComplaintTicket | null>(null);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);

  // Modal Action Form State
  const [actionStatus, setActionStatus] = useState<ComplaintStatus>('assigned');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [adminNote, setAdminNote] = useState('');

  // Stats calculation
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
  const criticalTickets = tickets.filter((t) => t.urgency === 'critical' && t.status !== 'resolved').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;
  const photoTicketsCount = tickets.filter((t) => Boolean(t.photoUrl)).length;

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? t.status !== 'resolved'
        : t.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || t.urgency === urgencyFilter;
    const matchesBuilding = buildingFilter === 'all' || t.buildingId === buildingFilter;
    const matchesPhoto = !photoFilter || Boolean(t.photoUrl);
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesUrgency && matchesBuilding && matchesPhoto && matchesSearch;
  });

  const handleOpenActionModal = (ticket: ComplaintTicket) => {
    setSelectedTicketForAction(ticket);
    setActionStatus(ticket.status === 'submitted' ? 'assigned' : ticket.status);
    setSelectedWorkerId(ticket.assignedWorkerId || maintenanceWorkers[0]?.id || '');
    setAdminNote('');
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForAction) return;

    updateTicketStatus(
      selectedTicketForAction.id,
      actionStatus,
      adminNote.trim() || `Admin set status to ${actionStatus}`,
      selectedWorkerId || undefined
    );

    setSelectedTicketForAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono uppercase font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                RNSIT Estate & Maintenance Control
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300 font-mono font-semibold">Authorized Admin Console</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Campus Infrastructure Triage
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSupabaseModal(true)}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-2 border ${
                isSupabaseConnected
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Configure Supabase Database"
            >
              <Database className={`w-4 h-4 ${isSupabaseConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Supabase DB</span>
              {isSupabaseConnected ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ) : (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded font-bold">
                  Setup
                </span>
              )}
            </button>

            <button
              onClick={lockAdmin}
              className="px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Lock Admin Mode</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-slate-300 block font-bold uppercase tracking-wider">Pending Triage</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono text-white tabular-nums">{openTickets}</span>
              <span className="text-xs text-slate-300 font-semibold">active</span>
            </div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-red-300 block font-bold uppercase tracking-wider">Critical Hazards</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono text-red-400 tabular-nums">{criticalTickets}</span>
              <span className="text-xs text-red-300 font-semibold">urgent</span>
            </div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-amber-300 block font-bold uppercase tracking-wider">Work In Progress</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono text-amber-400 tabular-nums">{inProgressTickets}</span>
              <span className="text-xs text-amber-300 font-semibold">on-site</span>
            </div>
          </div>

          <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-emerald-300 block font-bold uppercase tracking-wider">Resolved Complaints</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">{resolvedTickets}</span>
              <span className="text-xs text-emerald-300 font-semibold">closed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, reporter, building, or description..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800 transition-colors font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Photo Evidence Toggle */}
            <button
              type="button"
              onClick={() => setPhotoFilter(!photoFilter)}
              className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                photoFilter
                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-700" />
              <span>With Photos ({photoTicketsCount})</span>
            </button>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="active">Active Queue (Open & In Progress)</option>
              <option value="all">All Records (Inclusive)</option>
              <option value="submitted">Submitted (Needs Triage)</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved Archive</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="all">All Urgencies</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Building Filter */}
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="all">All Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.shortCode}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Tickets Triage Table (8 Cols) + Verified Worker Contact Sheet (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Triage Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs overflow-hidden">
          {/* Queue Tab Switcher: Active Queue vs Resolved Archive vs All */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === 'active'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Active Queue ({openTickets})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('resolved')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === 'resolved'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resolved Archive ({resolvedTickets})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-600" />
              <span>All ({totalTickets})</span>
            </button>
          </div>

          {/* Retention & Lifecycle Information Callout */}
          {statusFilter === 'resolved' ? (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">Permanent Institutional Resolved Archive</span>
                <span className="font-medium text-emerald-900">
                  Resolved issues automatically exit the live triage queue and are cleared from the campus map pin counts. They remain permanently preserved in this audit ledger for verification, accreditation reporting, and student tracking.
                </span>
              </div>
            </div>
          ) : statusFilter === 'active' ? (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="font-bold text-slate-900">Active Workload:</span>
                <span className="font-medium">Unresolved reports requiring triage, worker dispatch, or on-site work.</span>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
              {statusFilter === 'resolved'
                ? `Resolved Archive (${filteredTickets.length})`
                : statusFilter === 'active'
                ? `Active Complaints Queue (${filteredTickets.length})`
                : `All Complaints (${filteredTickets.length})`}
            </h3>
            <span className="text-xs font-bold text-slate-500 font-mono">
              Click photo to zoom · Click manage to assign
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-sm font-semibold text-slate-500">
                No tickets match your filters.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  className="py-4 hover:bg-slate-50/80 transition-colors rounded-2xl px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 max-w-xl">
                    {/* User Uploaded Photo Thumbnail in Admin List */}
                    {t.photoUrl ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingPhotoUrl(t.photoUrl!);
                        }}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-300 hover:border-amber-500 cursor-pointer shrink-0 shadow-xs group bg-slate-950"
                        title="Click to view user uploaded photo evidence"
                      >
                        <img
                          src={t.photoUrl}
                          alt="User photo evidence"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-slate-900/90 text-[9px] font-bold text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Camera className="w-2.5 h-2.5" />
                          <span>Photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0 text-slate-400">
                        <Camera className="w-5 h-5 text-slate-300" />
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">No Photo</span>
                      </div>
                    )}

                    {/* Ticket Details */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          #{t.ticketNumber}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span
                          className={`text-xs font-bold uppercase px-2 py-0.5 rounded font-mono ${
                            t.urgency === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : t.urgency === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.urgency}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-700">{t.category}</span>

                        {t.photoUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                            <Camera className="w-3 h-3 text-amber-700" />
                            <span>Photo Evidence</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {t.title}
                      </h4>

                      <div className="text-xs text-slate-700 font-medium flex items-center gap-2">
                        <span>{t.buildingName} ({t.roomOrArea})</span>
                        <span>·</span>
                        <span>By {t.reporterName}</span>
                      </div>

                      {t.status === 'resolved' ? (
                        <div className="text-xs text-emerald-900 font-bold flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            Resolved on {new Date(t.resolvedAt || t.updatedAt).toLocaleDateString()} at{' '}
                            {new Date(t.resolvedAt || t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {t.adminNotes ? ` · Note: ${t.adminNotes}` : ''}
                          </span>
                        </div>
                      ) : t.assignedWorkerName ? (
                        <div className="text-xs text-amber-950 font-bold flex items-center gap-1.5 pt-0.5">
                          <Wrench className="w-3.5 h-3.5 text-amber-700" />
                          <span>Assigned to {t.assignedWorkerName} ({t.assignedWorkerSpecialty})</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                        t.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : t.status === 'assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => handleOpenActionModal(t)}
                      className="px-4 py-2 text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verified Maintenance Personnel Directory (Admin Offline Coordination) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider">
                Campus Maintenance Staff
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {maintenanceWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="p-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{worker.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                      {worker.specialty.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Campus Intercom:</span>
                      <span className="font-mono font-semibold text-slate-900">{worker.intercom}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <a href={`tel:${worker.phone}`} className="font-mono text-amber-700 hover:underline">
                        {worker.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Shift / Room:</span>
                      <span className="truncate max-w-[150px]">{worker.room}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">
                      Active Jobs: {worker.activeTicketsCount}
                    </span>
                    <span
                      className={`font-semibold capitalize ${
                        worker.status === 'on_site' ? 'text-amber-700' : 'text-emerald-700'
                      }`}
                    >
                      {worker.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Modal for Updating Complaint & Assigning Worker with Full Photo Evidence */}
      {selectedTicketForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between shrink-0">
              <div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                  #{selectedTicketForAction.ticketNumber} · {selectedTicketForAction.category}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Manage Complaint & Dispatch
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {selectedTicketForAction.buildingName} ({selectedTicketForAction.roomOrArea})
                </p>
              </div>
              <button
                onClick={() => setSelectedTicketForAction(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Photo Evidence */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Issue Description & Reporter Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Issue Title:
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {selectedTicketForAction.title}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Problem Details:
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 mt-0.5 leading-relaxed">
                    {selectedTicketForAction.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold">Reported by: </span>
                    <span className="font-bold text-slate-900">{selectedTicketForAction.reporterName}</span>
                    <span className="font-mono text-slate-600 font-semibold"> ({selectedTicketForAction.reporterIdentifier})</span>
                  </div>
                  {selectedTicketForAction.reporterPhone && (
                    <a
                      href={`tel:${selectedTicketForAction.reporterPhone}`}
                      className="text-amber-800 font-mono font-bold flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span>{selectedTicketForAction.reporterPhone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Photo Evidence Section (Visible to Admin!) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>Uploaded Photo Evidence</span>
                  </span>
                  {selectedTicketForAction.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setViewingPhotoUrl(selectedTicketForAction.photoUrl!)}
                      className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
                    >
                      <Maximize2 className="w-3 h-3 text-amber-700" />
                      <span>Expand Fullscreen</span>
                    </button>
                  )}
                </div>

                {selectedTicketForAction.photoUrl ? (
                  <div
                    onClick={() => setViewingPhotoUrl(selectedTicketForAction.photoUrl!)}
                    className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-amber-500 bg-slate-950 cursor-pointer transition-all shadow-sm"
                    title="Click to view fullscreen photo"
                  >
                    <img
                      src={selectedTicketForAction.photoUrl}
                      alt="Uploaded Complaint Evidence"
                      referrerPolicy="no-referrer"
                      className="w-full max-h-60 sm:max-h-72 object-contain mx-auto group-hover:scale-102 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="px-3.5 py-1.5 bg-slate-900/90 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md border border-slate-700">
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span>Click to View Full Size</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4 text-slate-400" />
                    <span>No photo was attached by the reporter for this complaint.</span>
                  </div>
                )}
              </div>

              {/* Resolution Form */}
              <form onSubmit={handleSaveAction} className="space-y-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Update Resolution Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['assigned', 'in_progress', 'resolved'] as ComplaintStatus[]).map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setActionStatus(st)}
                        className={`py-2.5 px-3 text-xs font-bold rounded-xl border capitalize transition-all ${
                          actionStatus === st
                            ? st === 'resolved'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : st === 'in_progress'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  {actionStatus === 'resolved' && (
                    <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-950 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Marking as Resolved clears this ticket from the active triage queue & campus map pins, moving it permanently to the Resolved Archive.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Assign Internal Maintenance Technician
                  </label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                  >
                    <option value="">-- No technician assigned / Keep current --</option>
                    {maintenanceWorkers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.specialty.replace('_', ' ')}) — Intercom: {w.intercom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Admin Action / Work Order Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g. Worker dispatched with replacement valve. Scheduled for repair by 12:00 PM."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 leading-relaxed font-medium"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForAction(null)}
                    className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
                  >
                    Save & Update Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {viewingPhotoUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setViewingPhotoUrl(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between mb-3 text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold">Photo Evidence Inspection</span>
              </div>
              <button
                onClick={() => setViewingPhotoUrl(null)}
                className="text-white/80 hover:text-white p-2 rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
                title="Close photo viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-black w-full flex items-center justify-center">
              <img
                src={viewingPhotoUrl}
                alt="Full size evidence"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>
            <div className="mt-3 text-xs font-mono text-slate-300">
              Uploaded via OurUNI Portal · RNSIT Facility Management
            </div>
          </div>
        </div>
      )}

      {/* Supabase Database Settings Modal */}
      <SupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
};
