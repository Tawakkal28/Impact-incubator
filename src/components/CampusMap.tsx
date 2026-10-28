import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CampusBuilding } from '../types';
import {
  MapPin,
  PlusCircle,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Layers,
  Sparkles,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';

export const CampusMap: React.FC = () => {
  const {
    buildings,
    tickets,
    setActiveTab,
    setSelectedBuildingForReport,
    setTrackTicketQuery,
  } = useApp();

  // Default to RNSPU or first building
  const rnspuBuilding = buildings.find((b) => b.id === 'bldg-rnspu') || buildings[0];
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding>(rnspuBuilding);
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'infographic' | 'vector'>('infographic');
  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuilding | null>(null);

  // Compute active tickets per building
  const getActiveIssuesCount = (buildingId: string) => {
    return tickets.filter((t) => t.buildingId === buildingId && t.status !== 'resolved').length;
  };

  const getCriticalIssuesCount = (buildingId: string) => {
    return tickets.filter(
      (t) => t.buildingId === buildingId && t.status !== 'resolved' && t.urgency === 'critical'
    ).length;
  };

  const filteredBuildings = buildings.filter((bldg) => {
    const matchesZone = zoneFilter === 'All' || bldg.zone === zoneFilter;
    const matchesSearch =
      bldg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bldg.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bldg.departments.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesZone && matchesSearch;
  });

  const selectedBuildingTickets = tickets.filter((t) => t.buildingId === selectedBuilding.id);
  const selectedBuildingActiveTickets = selectedBuildingTickets.filter((t) => t.status !== 'resolved');

  const handleStartReport = (bldg: CampusBuilding) => {
    setSelectedBuildingForReport(bldg);
    setActiveTab('report');
  };

  const handleTrackTicket = (ticketNum: string) => {
    setTrackTicketQuery(ticketNum);
    setActiveTab('track');
  };

  const handleFocusRnspu = () => {
    if (rnspuBuilding) {
      setSelectedBuilding(rnspuBuilding);
    }
  };

  const zones = ['All', 'Academic', 'Laboratories', 'Administrative', 'Amenities', 'Sports'];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              RNSIT Campus Interactive Map
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>RNSPU Block Updated</span>
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            Interactive campus layout with real-time facility tickets and QR code location tagging.
          </p>
        </div>

        {/* View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleFocusRnspu}
            className="px-4 py-2.5 text-sm font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-300 rounded-xl transition-all flex items-center gap-2 shadow-2xs"
          >
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>Focus RNSPU</span>
          </button>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('infographic')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'infographic'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Infographic Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('vector')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'vector'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blueprint Vector
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleStartReport(selectedBuilding)}
            className="px-5 py-2.5 text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Report in {selectedBuilding.shortCode}</span>
          </button>
        </div>
      </div>

      {/* Zone Filter Segmented Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {zones.map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setZoneFilter(zone)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
                zoneFilter === zone
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RNSPU, IT, Canteen..."
            className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors font-medium text-slate-900"
          />
        </div>
      </div>

      {/* Main Grid: Campus Map + Building Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Campus Map Viewport (8 Cols on Desktop) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-sm font-bold text-slate-900">
                {viewMode === 'infographic'
                  ? 'Official RNSIT Infographic Map (RNSPU Updated)'
                  : 'RNSIT Schematic Blueprint'}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-700 font-mono">
              Click any building to inspect & report
            </div>
          </div>

          {/* Map Container */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-[#2a3644] select-none">
            {viewMode === 'infographic' ? (
              /* Infographic View with Interactive Overlays */
              <div className="relative w-full h-full">
                {/* Authentic RNSIT Campus Map Image */}
                <img
                  src="/assets/aistudio/RNSIT_Campus_Map_Infographic_56fde70c.png"
                  alt="RNSIT Campus Map Infographic"
                  className="w-full h-full object-fill pointer-events-none"
                />

                {/* Overlaid RNSPU Block Badge replacing RNSPIN */}
                <div
                  style={{ left: '5.0%', top: '39.0%', width: '5.8%', height: '7.2%' }}
                  onClick={() => {
                    if (rnspuBuilding) setSelectedBuilding(rnspuBuilding);
                  }}
                  onMouseEnter={() => rnspuBuilding && setHoveredBuilding(rnspuBuilding)}
                  onMouseLeave={() => setHoveredBuilding(null)}
                  className={`absolute z-20 flex flex-col items-center justify-center rounded-md cursor-pointer transition-all shadow-md ${
                    selectedBuilding.id === 'bldg-rnspu'
                      ? 'bg-[#1b2b3a] ring-3 ring-amber-400 border-2 border-amber-300 scale-105'
                      : 'bg-[#213243] hover:bg-[#1a2836] border border-slate-500/70 hover:ring-2 hover:ring-amber-300'
                  }`}
                  title="RNSPU Block (RNS Pre-University - Updated)"
                >
                  <span className="text-[10px] sm:text-xs font-black tracking-wider text-amber-300 font-sans">
                    RNSPU
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-bold text-slate-200 uppercase tracking-tight">
                    BLOCK
                  </span>

                  {/* Active Issue Indicator Badge for RNSPU */}
                  {getActiveIssuesCount('bldg-rnspu') > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-xs border border-white">
                      {getActiveIssuesCount('bldg-rnspu')}
                    </div>
                  )}
                </div>

                {/* Interactive Hotspot Buttons for All Buildings */}
                {buildings.map((bldg) => {
                  if (!bldg.mapCoords) return null;
                  const isSelected = selectedBuilding.id === bldg.id;
                  const activeCount = getActiveIssuesCount(bldg.id);
                  const criticalCount = getCriticalIssuesCount(bldg.id);

                  // Skip the main RNSPU body rectangle since the dedicated RNSPU badge above covers it
                  if (bldg.id === 'bldg-rnspu') return null;

                  return (
                    <div
                      key={bldg.id}
                      style={{
                        left: `${bldg.mapCoords.left}%`,
                        top: `${bldg.mapCoords.top}%`,
                        width: `${bldg.mapCoords.width}%`,
                        height: `${bldg.mapCoords.height}%`,
                      }}
                      onClick={() => setSelectedBuilding(bldg)}
                      onMouseEnter={() => setHoveredBuilding(bldg)}
                      onMouseLeave={() => setHoveredBuilding(null)}
                      className={`absolute z-10 cursor-pointer rounded-lg transition-all flex items-center justify-center ${
                        isSelected
                          ? 'ring-3 ring-amber-400 border-2 border-amber-300 bg-amber-400/20 shadow-md backdrop-blur-[1px]'
                          : 'hover:bg-white/20 hover:ring-2 hover:ring-amber-300'
                      }`}
                      title={`${bldg.name} (${bldg.shortCode})`}
                    >
                      {/* Active Tickets Pin Badge */}
                      {activeCount > 0 && (
                        <div
                          className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full font-mono font-black text-[9px] flex items-center justify-center shadow-md border border-white ${
                            criticalCount > 0 ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {activeCount}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Hover Tooltip Overlay */}
                {hoveredBuilding && (
                  <div className="absolute bottom-3 left-3 z-30 bg-slate-950/90 text-white px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-sm border border-slate-700 shadow-lg flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>{hoveredBuilding.name}</span>
                    <span className="font-mono text-amber-300 font-bold">[{hoveredBuilding.shortCode}]</span>
                  </div>
                )}
              </div>
            ) : (
              /* Vector Blueprint Schematic View */
              <svg
                viewBox="0 0 900 520"
                className="w-full h-full select-none"
                style={{ background: '#f8fafc' }}
              >
                <defs>
                  <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                  </pattern>
                </defs>

                <rect width="900" height="520" fill="#f8fafc" />
                <rect width="900" height="520" fill="url(#gridPattern)" opacity="0.6" />

                {/* Roads and Main Corridors */}
                <path
                  d="M 50 170 L 850 170 M 115 170 L 115 470 M 325 170 L 325 470 M 465 170 L 465 470 M 605 170 L 605 470 M 115 470 L 850 470"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Buildings Vector Rendering */}
                {buildings.map((bldg) => {
                  const isSelected = selectedBuilding.id === bldg.id;
                  const activeCount = getActiveIssuesCount(bldg.id);
                  const criticalCount = getCriticalIssuesCount(bldg.id);
                  const { x, y, width, height } = bldg.svgCoordinates;

                  return (
                    <g
                      key={bldg.id}
                      onClick={() => setSelectedBuilding(bldg)}
                      className="cursor-pointer transition-all duration-150"
                    >
                      <rect
                        x={x + 3}
                        y={y + 3}
                        width={width}
                        height={height}
                        rx="8"
                        fill="#000000"
                        opacity={isSelected ? 0.2 : 0.08}
                      />
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx="8"
                        fill={bldg.id === 'bldg-rnspu' ? '#fef3c7' : '#ffffff'}
                        stroke={isSelected ? '#f59e0b' : bldg.id === 'bldg-rnspu' ? '#d97706' : '#94a3b8'}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 4}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize={width < 70 ? '9' : '11'}
                        fontWeight="bold"
                        fontFamily="system-ui"
                      >
                        {bldg.shortCode}
                      </text>

                      {activeCount > 0 && (
                        <g transform={`translate(${x + width - 12}, ${y - 6})`}>
                          <circle
                            r="9"
                            fill={criticalCount > 0 ? '#ef4444' : '#f59e0b'}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          <text
                            y="3"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {activeCount}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Map Legend & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3.5 border-t border-slate-100 text-xs sm:text-sm font-bold text-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>Zero Issues</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Active Complaints</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
                <span>Critical Urgency</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300">
                RNSPU: Near Parking (North-West)
              </span>
            </div>
          </div>
        </div>

        {/* Selected Building Detail Inspector (4 Cols on Desktop) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-lg">
                  {selectedBuilding.zone} Wing
                </span>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {selectedBuilding.shortCode}
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {selectedBuilding.name}
              </h3>
              <div className="text-sm font-bold text-slate-700 mt-1 font-mono">
                {selectedBuilding.floors} Floors · Tag: {selectedBuilding.qrCodeTag}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              {selectedBuilding.description}
            </p>

            {/* Departments */}
            <div>
              <span className="text-xs font-extrabold text-slate-900 block mb-2 uppercase tracking-wider">
                Departments & Facilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBuilding.departments.map((dept, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-800"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>

            {/* Common Problem Areas */}
            <div>
              <span className="text-xs font-extrabold text-slate-900 block mb-2 uppercase tracking-wider">
                Common Key Locations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBuilding.commonAreas.map((area, i) => (
                  <span
                    key={i}
                    className="bg-amber-50/70 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-950"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Tickets List */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-extrabold text-slate-900">
                  Open Tickets ({selectedBuildingActiveTickets.length})
                </span>
              </div>

              {selectedBuildingActiveTickets.length === 0 ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No active complaints reported for this facility.</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedBuildingActiveTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleTrackTicket(t.ticketNumber)}
                      className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all cursor-pointer group text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-amber-800">
                          #{t.ticketNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            t.urgency === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : t.urgency === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {t.urgency}
                        </span>
                      </div>
                      <p className="text-slate-900 font-bold truncate mt-1 text-sm">{t.title}</p>
                      <div className="text-slate-600 mt-1 font-semibold flex items-center gap-1">
                        <span>Status:</span>
                        <span className="font-bold text-slate-900 capitalize">
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions for this building */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleStartReport(selectedBuilding)}
                className="w-full py-3 px-4 rounded-xl text-sm font-extrabold bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Report Issue in {selectedBuilding.shortCode}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4 text-slate-600" />
                <span>View Campus QR Badges</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
