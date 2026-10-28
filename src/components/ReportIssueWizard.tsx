import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle,
  Copy,
  ArrowRight,
  Upload,
  UserCheck,
  Sparkles,
  Phone,
  Layers,
  Wrench,
  Zap,
  Wifi,
  Cpu,
  Tv,
  Trash2,
  Compass,
  QrCode,
} from 'lucide-react';
import { ComplaintCategory, UrgencyLevel, CampusBuilding } from '../types';

export const ReportIssueWizard: React.FC = () => {
  const {
    currentUser,
    buildings,
    selectedBuildingForReport,
    setSelectedBuildingForReport,
    createTicket,
    setActiveTab,
    setTrackTicketQuery,
    setShowAuthModal,
  } = useApp();

  // Form State
  const [buildingId, setBuildingId] = useState<string>(
    selectedBuildingForReport ? selectedBuildingForReport.id : buildings[0]?.id || 'bldg-it'
  );
  const [floorOrWing, setFloorOrWing] = useState('Ground Floor');
  const [roomOrArea, setRoomOrArea] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Plumbing');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync when selectedBuildingForReport changes externally
  useEffect(() => {
    if (selectedBuildingForReport) {
      setBuildingId(selectedBuildingForReport.id);
    }
  }, [selectedBuildingForReport]);

  const currentBuilding = buildings.find((b) => b.id === buildingId) || buildings[0];

  const categories: { label: string; value: ComplaintCategory; icon: any; example: string }[] = [
    { label: 'Plumbing', value: 'Plumbing', icon: Wrench, example: 'Taps, washrooms, leakages, drinking water' },
    { label: 'Electrical', value: 'Electrical', icon: Zap, example: 'Lights, fans, switchboards, sparks, MCB' },
    { label: 'IT & Wi-Fi', value: 'IT_Connectivity', icon: Wifi, example: 'Access points, LAN port, server connection' },
    { label: 'Classroom', value: 'Classroom_Facility', icon: Tv, example: 'Projectors, sound system, podium, benches' },
    { label: 'Lab Equipment', value: 'Lab_Equipment', icon: Cpu, example: 'Machines, test kits, trainer units, PCs' },
    { label: 'Sanitation', value: 'Sanitation', icon: Trash2, example: 'Restroom hygiene, dustbins, campus cleaning' },
    { label: 'Civil', value: 'Civil_Structural', icon: Building2, example: 'Doors, windows, ceiling seepage, railings' },
    { label: 'Other', value: 'Other', icon: Compass, example: 'General campus facility issues' },
  ];

  const quickIssuePills: { cat: ComplaintCategory; title: string; desc: string; urgency: UrgencyLevel }[] = [
    {
      cat: 'Plumbing',
      title: 'Water tap leaking continuously in restroom',
      desc: 'The faucet valve does not close completely, leading to continuous clean water leakage and floor flooding.',
      urgency: 'high',
    },
    {
      cat: 'Classroom_Facility',
      title: 'Projector display flickering / HDMI no signal',
      desc: 'Ceiling projector disconnects randomly during class. Wall HDMI jack feels loose.',
      urgency: 'medium',
    },
    {
      cat: 'Electrical',
      title: 'Power socket sparking when plugging laptop/equipment',
      desc: 'Wall outlet in workstation area sparked when switch was turned on. Potential short circuit hazard.',
      urgency: 'critical',
    },
    {
      cat: 'IT_Connectivity',
      title: 'Institutional Wi-Fi AP offline / high packet loss',
      desc: 'Students and faculty cannot connect to RNSIT_STUDENT network in this area.',
      urgency: 'high',
    },
    {
      cat: 'Sanitation',
      title: 'Restroom cleaning and hygiene replenishment needed',
      desc: 'Handwash liquid dispenser empty and waste bin overflowing.',
      urgency: 'low',
    },
  ];

  // Simulated demo camera photos
  const demoPhotos = [
    {
      name: 'Water Tap Leak',
      url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Projector Jack',
      url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Electrical Panel',
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyQuickPill = (pill: typeof quickIssuePills[0]) => {
    setCategory(pill.cat);
    setTitle(pill.title);
    setDescription(pill.desc);
    setUrgency(pill.urgency);
    if (!roomOrArea.trim()) {
      setRoomOrArea(currentBuilding.commonAreas?.[0] || 'Main Corridor');
    }
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('Please enter a brief summary / title of the problem.');
      return;
    }

    if (!description.trim()) {
      setValidationError('Please provide a short description explaining what is damaged or needs attention.');
      return;
    }

    setValidationError(null);

    const ticket = createTicket({
      title: title.trim(),
      description: description.trim(),
      category,
      buildingId,
      floorOrWing,
      roomOrArea: roomOrArea.trim() || currentBuilding.commonAreas?.[0] || 'General Facility Area',
      urgency,
      photoUrl,
      reporterPhone: phone,
    });

    setCreatedTicketNumber(ticket.ticketNumber);
  };

  const handleCopyTicket = () => {
    if (createdTicketNumber) {
      navigator.clipboard.writeText(createdTicketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackNewTicket = () => {
    if (createdTicketNumber) {
      setTrackTicketQuery(createdTicketNumber);
      setActiveTab('track');
    }
  };

  const handleResetForm = () => {
    setCreatedTicketNumber(null);
    setTitle('');
    setDescription('');
    setRoomOrArea('');
    setPhotoUrl(undefined);
  };

  // If ticket was just created, show pristine confirmation card
  if (createdTicketNumber) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>

          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Ticket Dispatched to Estate Office
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">Complaint Submitted</h2>

          {/* Ticket ID Box */}
          <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-bold text-slate-600 block">Unique Ticket ID</span>
              <span className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight">
                #{createdTicketNumber}
              </span>
            </div>
            <button
              onClick={handleCopyTicket}
              className="px-3.5 py-2 text-xs sm:text-sm font-bold bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 text-slate-800"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Location & Details Summary */}
          <div className="text-left text-sm text-slate-700 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Location:</span>
              <span className="font-bold text-slate-900">{currentBuilding.name} ({floorOrWing})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Room / Area:</span>
              <span className="font-bold text-slate-900">{roomOrArea || 'General Area'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Category:</span>
              <span className="font-bold text-slate-900">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Reporter:</span>
              <span className="font-bold text-slate-900">{currentUser?.name} ({currentUser?.identifier})</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTrackNewTicket}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Track Live Resolution Progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetForm}
              className="py-3 px-4 rounded-xl text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Report Campus Issue
          </h2>
        </div>

        {/* Reporter Verification Card */}
        {currentUser ? (
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-900 shrink-0">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate max-w-[220px]">
              <span className="font-bold text-slate-900 block">{currentUser.name}</span>
              <span className="text-xs text-emerald-800 font-mono font-semibold">{currentUser.identifier}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 font-bold hover:bg-amber-100 transition-colors shrink-0"
          >
            Verify @rnsit.ac.in Account
          </button>
        )}
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} noValidate className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7">
        {/* Section 1: Campus Location Tagging */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider">
              <MapPin className="w-5 h-5 text-amber-600" />
              <span>1. Campus Location</span>
            </div>
          </div>

          {/* Location & QR Tag Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                  Location Tag: <span className="font-mono text-amber-900">{currentBuilding.qrCodeTag}</span>
                </span>
                <span className="text-xs text-slate-700 font-semibold">
                  Tagged to {currentBuilding.name} ({currentBuilding.shortCode})
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-lg">
              ✓ Direct Ticket Submission (QR Scan Optional)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Building Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Building / Block
              </label>
              <select
                value={buildingId}
                onChange={(e) => {
                  setBuildingId(e.target.value);
                  const bldg = buildings.find((b) => b.id === e.target.value);
                  if (bldg) setSelectedBuildingForReport(bldg);
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Floor / Level */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">
                Floor / Wing
              </label>
              <select
                value={floorOrWing}
                onChange={(e) => setFloorOrWing(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
              >
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
                <option value="4th Floor">4th Floor</option>
                <option value="Terrace / Roof">Terrace / Roof</option>
                <option value="Basement / Parking">Basement / Parking</option>
              </select>
            </div>

            {/* Room / Specific Spot */}
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Room No. or Spot</span>
                <span className="text-xs text-slate-500 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={roomOrArea}
                onChange={(e) => {
                  setRoomOrArea(e.target.value);
                  setValidationError(null);
                }}
                placeholder={`e.g. ${currentBuilding.commonAreas?.[0] || 'Main Corridor'}`}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Common Area Quick Suggestions for selected building */}
          {currentBuilding.commonAreas && currentBuilding.commonAreas.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <span className="text-xs font-bold text-slate-700">Quick Spot:</span>
              {currentBuilding.commonAreas.map((area, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setRoomOrArea(area);
                    setValidationError(null);
                  }}
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  {area}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Category & Priority */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>2. Issue Category & Priority</span>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.value;
              return (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3.5 text-left rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                  </div>
                  <span className="font-bold text-sm">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Urgency Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {(['low', 'medium', 'high', 'critical'] as UrgencyLevel[]).map((level) => {
                const isSelected = urgency === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setUrgency(level)}
                    className={`py-2.5 px-3 text-center text-xs sm:text-sm font-bold rounded-xl border capitalize transition-all ${
                      isSelected
                        ? level === 'critical'
                          ? 'border-red-600 bg-red-600 text-white'
                          : level === 'high'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Issue Description & Fast Fill */}
        <div className="pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider">
              3. Description & Details
            </label>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quick-Fill Presets for fast testing */}
          <div className="mb-4">
            <span className="text-xs sm:text-sm font-bold text-slate-800 block mb-2">
              Common Issue Presets (Click to autofill):
            </span>
            <div className="flex flex-wrap gap-2">
              {quickIssuePills.map((pill, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => applyQuickPill(pill)}
                  className="text-xs font-semibold px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-xl transition-colors text-left"
                >
                  {pill.title}
                </button>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div className="mb-3.5">
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Issue Summary / Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationError(null);
              }}
              placeholder="e.g. Water tap leaking continuously near lab washbasin..."
              className={`w-full px-4 py-3 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-colors font-medium ${
                validationError && !title.trim()
                  ? 'border-red-400 bg-red-50/20 focus:border-red-600'
                  : 'border-slate-300 focus:border-slate-900'
              }`}
            />
          </div>

          {/* Full details textarea */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setValidationError(null);
              }}
              placeholder="Describe what is damaged or needs maintenance attention..."
              className={`w-full px-4 py-3 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none leading-relaxed transition-colors font-medium ${
                validationError && !description.trim()
                  ? 'border-red-400 bg-red-50/20 focus:border-red-600'
                  : 'border-slate-300 focus:border-slate-900'
              }`}
            />
          </div>
        </div>

        {/* Section 4: Photo Evidence (Optional) */}
        <div className="pt-5 border-t border-slate-100">
          <label className="block text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wider mb-3">
            4. Photo Evidence (Optional)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Custom File Upload Input */}
            <div className="border border-dashed border-slate-300 rounded-2xl p-5 text-center hover:bg-slate-50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">Choose file or take photo</div>
            </div>

            {/* Quick Demo Photo Samples */}
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Sample Photos:
              </span>
              <div className="flex gap-2.5">
                {demoPhotos.map((demo, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPhotoUrl(demo.url)}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 hover:border-amber-500 w-16 h-16 shrink-0"
                  >
                    <img
                      src={demo.url}
                      alt={demo.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-[9px] font-semibold text-white py-0.5 text-center truncate px-0.5">
                      {demo.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Preview if selected */}
          {photoUrl && (
            <div className="mt-3 relative inline-block">
              <img
                src={photoUrl}
                alt="Selected attachment"
                className="w-36 h-28 object-cover rounded-2xl border border-slate-200 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setPhotoUrl(undefined)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-sm hover:bg-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Section 5: Reporter Contact for Maintenance Dispatch */}
        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Contact Phone (For technician on-site verification)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 XXXXX"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900 font-mono font-medium"
              />
            </div>
          </div>

          <div className="sm:pt-6">
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>Submit Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
