import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Building2,
  MapPin,
  User,
  Phone,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { ComplaintTicket, ComplaintStatus } from '../types';

export const TicketTracker: React.FC = () => {
  const { tickets, trackTicketQuery, setTrackTicketQuery, currentUser, setActiveTab, setSelectedBuildingForReport, buildings } = useApp();

  const [search, setSearch] = useState(trackTicketQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'my' | 'in_progress' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);

  // Sync with global track query
  useEffect(() => {
    if (trackTicketQuery) {
      setSearch(trackTicketQuery);
      const match = tickets.find(
        (t) => t.ticketNumber.toLowerCase() === trackTicketQuery.toLowerCase() || t.id === trackTicketQuery
      );
      if (match) {
        setSelectedTicket(match);
      }
    } else if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [trackTicketQuery, tickets]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.buildingName.toLowerCase().includes(search.toLowerCase()) ||
      ticket.roomOrArea.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'my') {
      return currentUser && ticket.reporterEmail.toLowerCase() === currentUser.email.toLowerCase();
    }
    if (statusFilter === 'in_progress') {
      return ticket.status === 'in_progress' || ticket.status === 'assigned';
    }
    if (statusFilter === 'resolved') {
      return ticket.status === 'resolved';
    }
    return true;
  });

  const getStatusStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'assigned':
        return 1;
      case 'in_progress':
        return 2;
      case 'resolved':
        return 3;
    }
  };

  const steps = [
    { title: 'Submitted', desc: 'Complaint registered' },
    { title: 'Assigned', desc: 'Worker dispatched' },
    { title: 'In Progress', desc: 'Work underway on-site' },
    { title: 'Resolved', desc: 'Verified & closed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Track Campus Complaints
        </h2>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Ticket ID (e.g. RNS-1042) or building..."
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800 transition-colors font-medium"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            All ({tickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('my')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-colors ${
              statusFilter === 'my'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            My Reports
          </button>

          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-colors ${
              statusFilter === 'in_progress'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Main Grid: Ticket List (Left 5 Cols) + Live Stepper & Details (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ticket List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
          {filteredTickets.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
              No complaint tickets match your query. Try searching by full ticket ID (e.g. RNS-1042) or clear filters.
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-slate-900 bg-white shadow-sm ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      #{t.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
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
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 mb-1">
                    {t.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {t.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="truncate max-w-[170px]">{t.buildingName}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {new Date(t.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Ticket Live Stepper & Detailed Inspector */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-base text-slate-900">
                      #{selectedTicket.ticketNumber}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {selectedTicket.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedTicket.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Resolved Permanent Proof Banner */}
              {selectedTicket.status === 'resolved' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-sm block">Complaint Resolved & Verified</span>
                    <span className="text-xs font-semibold text-emerald-900 block mt-0.5">
                      Closed on {new Date(selectedTicket.resolvedAt || selectedTicket.updatedAt).toLocaleDateString()} at{' '}
                      {new Date(selectedTicket.resolvedAt || selectedTicket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                      This ticket remains permanently recorded in the campus maintenance archive for verification.
                    </span>
                  </div>
                </div>
              )}

              {/* Resolution Progress Stepper */}
              <div>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider block mb-4">
                  Resolution Progress
                </span>

                <div className="grid grid-cols-4 gap-2 relative">
                  {steps.map((step, idx) => {
                    const currentIdx = getStatusStepIndex(selectedTicket.status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-2 ${
                            isDone
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          } ${isCurrent ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-xs sm:text-sm font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location & Metadata Spec */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-1">Location:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm sm:text-base">
                    <Building2 className="w-4 h-4 text-slate-600" />
                    <span>{selectedTicket.buildingName}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-700 block mt-1">
                    {selectedTicket.floorOrWing} · {selectedTicket.roomOrArea}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-1">Reported By:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm sm:text-base">
                    <User className="w-4 h-4 text-slate-600" />
                    <span>{selectedTicket.reporterName}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-700 block mt-1 font-mono">
                    {selectedTicket.reporterIdentifier} ({selectedTicket.reporterRole})
                  </span>
                </div>
              </div>

              {/* Assigned Technician Accountability Card */}
              {selectedTicket.assignedWorkerName && (
                <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-amber-950 flex items-center gap-2 text-sm sm:text-base">
                      <Wrench className="w-4 h-4 text-amber-700" />
                      <span>Assigned Maintenance Personnel</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                      {selectedTicket.assignedWorkerSpecialty}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{selectedTicket.assignedWorkerName}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Coordinated via Estate Maintenance Control Room
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-slate-700 font-mono text-[11px]">
                      {selectedTicket.assignedWorkerIntercom && (
                        <span>Intercom: <strong>{selectedTicket.assignedWorkerIntercom}</strong></span>
                      )}
                      {selectedTicket.assignedWorkerPhone && (
                        <span>{selectedTicket.assignedWorkerPhone}</span>
                      )}
                    </div>
                  </div>

                  {selectedTicket.adminNotes && (
                    <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 font-medium">
                      Admin Update: {selectedTicket.adminNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Description Content */}
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                  Issue Description
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Photo Evidence if uploaded */}
              {selectedTicket.photoUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                    Attached Evidence Photo
                  </span>
                  <img
                    src={selectedTicket.photoUrl}
                    alt="Complaint photo"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-56 object-cover rounded-2xl border border-slate-200 shadow-xs"
                  />
                </div>
              )}

              {/* Timeline Audit Logs */}
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2.5">
                  Audit History & Timestamps
                </span>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1.5">
                  {selectedTicket.history.map((log) => (
                    <div key={log.id} className="text-xs relative">
                      <div className="w-2 h-2 rounded-full bg-slate-400 absolute -left-[17px] top-1" />
                      <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="capitalize font-semibold text-slate-600">{log.status}</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-[11px] mt-0.5">{log.actorName}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">{log.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Quick Link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need to report another issue in this area?</span>
                <button
                  onClick={() => {
                    const bldg = buildings.find((b) => b.id === selectedTicket.buildingId);
                    if (bldg) setSelectedBuildingForReport(bldg);
                    setActiveTab('report');
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>Report in {selectedTicket.buildingName}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 text-xs">
              Select a ticket from the left column to view its live resolution tracker.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
