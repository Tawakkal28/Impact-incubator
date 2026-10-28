import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateQRMatrix } from '../utils/qrCode';
import {
  QrCode,
  Printer,
  Copy,
  ExternalLink,
  MapPin,
  Building2,
  Check,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CampusBuilding } from '../types';

export const QrDirectory: React.FC = () => {
  const { buildings, setSelectedBuildingForReport, setActiveTab } = useApp();

  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0].id);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor');
  const [copied, setCopied] = useState(false);
  const [simulatedScannerActive, setSimulatedScannerActive] = useState(false);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId) || buildings[0];

  // Deep-link URL that would be encoded in the physical QR badge
  const qrEncodedUrl = `${window.location.origin}/#report?bldg=${selectedBuilding.id}&loc=${encodeURIComponent(
    selectedBuilding.qrCodeTag
  )}`;

  // Generate 25x25 QR matrix
  const qrMatrix = generateQRMatrix(qrEncodedUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrEncodedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = (building: CampusBuilding) => {
    setSelectedBuildingForReport(building);
    setActiveTab('report');
  };

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Campus QR Location Badges
          </h2>
        </div>

        <button
          onClick={handlePrintBadge}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs flex items-center gap-2 shrink-0"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print Physical Plaque</span>
        </button>
      </div>

      {/* Main Layout: Selector & Badge Display (7 Cols) + Quick Scanner Demo (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Printable Physical Badge Display */}
        <div className="lg:col-span-7 space-y-4">
          {/* Location Selector Dropdown */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <label className="block text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider">
              Select Campus Building & Plaque Location
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Building
                </label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-bold"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Placement Wing / Level
                </label>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                >
                  <option value="Ground Floor Entry Lobby">Ground Floor Entry Lobby</option>
                  <option value="1st Floor Corridor">1st Floor Corridor</option>
                  <option value="2nd Floor Labs">2nd Floor Labs</option>
                  <option value="3rd Floor Washrooms">3rd Floor Washrooms</option>
                  <option value="Department Office Wing">Department Office Wing</option>
                  <option value="Student Common Area">Student Common Area</option>
                </select>
              </div>
            </div>
          </div>

          {/* Printable Campus Plaque Container */}
          <div
            id="printable-plaque"
            className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-md text-center relative overflow-hidden"
          >
            {/* Institution Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                RNS Institute of Technology · Bengaluru
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-display">
                CAMPUS ISSUE REPORTING POINT
              </h3>
              <div className="text-xs font-semibold text-amber-700 font-mono mt-1">
                OURUNI SMART INFRASTRUCTURE DESK
              </div>
            </div>

            {/* Location Tag */}
            <div className="mb-4">
              <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded-full text-xs font-bold text-slate-900 font-mono">
                {selectedBuilding.qrCodeTag}
              </div>
              <h4 className="text-lg font-bold text-slate-900 mt-1.5">
                {selectedBuilding.name}
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                {selectedFloor} · {selectedBuilding.zone} Zone
              </p>
            </div>

            {/* SVG High-Contrast Vector QR Matrix */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-white p-3 rounded-2xl border-2 border-slate-900 shadow-inner my-2">
              <svg viewBox="0 0 25 25" className="w-full h-full shape-rendering-crispEdges">
                {qrMatrix.map((row, r) =>
                  row.map((col, c) =>
                    col ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null
                  )
                )}
              </svg>
            </div>

            {/* Instructions */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                How to Report Here:
              </p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-0.5 leading-relaxed">
                Scan with any smartphone camera or OurUNI app to auto-fill this location and dispatch an on-campus plumber, electrician, or technician.
              </p>
              <div className="text-[11px] text-slate-400 font-mono mt-2">
                Emergency Estate Intercom: Ext 200 · Security: Ext 100
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-mono truncate max-w-xs">{qrEncodedUrl}</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 font-medium bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 text-slate-700 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Copy URL'}</span>
            </button>
          </div>
        </div>

        {/* Quick-Scan Scanner Demo for Reviewers */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider mb-4">
              <Camera className="w-5 h-5 text-amber-600" />
              <span>Simulate QR Scan (Tester Mode)</span>
            </div>

            {/* Simulated Reticle View */}
            <div className="relative aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden mb-4 flex flex-col items-center justify-center text-center p-4">
              {/* Camera Scanner Viewfinder */}
              <div className="w-36 h-36 border-2 border-dashed border-amber-400 rounded-2xl relative flex items-center justify-center animate-pulse">
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400" />
                <QrCode className="w-12 h-12 text-white/40" />
              </div>
              <span className="text-xs text-amber-300 font-mono mt-3 font-semibold">
                Target badge in optical reticle
              </span>
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-2">
              <span className="text-sm font-extrabold text-slate-900 block mb-2">
                Click to Simulate Scan at Building:
              </span>

              {buildings.slice(0, 6).map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleSimulateScan(b)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-900 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-between text-sm group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-slate-900 group-hover:text-amber-950 truncate">
                      {b.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-700 font-mono text-xs font-semibold">
                    <span>{b.shortCode}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
