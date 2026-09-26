import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import ThreeGlobeCanvas from '../../components/three/ThreeGlobeCanvas';
import api from '../../services/api';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Activity,
  Truck,
  Building2,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Layers,
  Radio,
  Navigation,
  Bot,
  QrCode,
  Gauge,
  Clock,
  ExternalLink,
  ChevronRight,
  PhoneCall,
  Lock,
  Zap,
  Globe2,
  Leaf,
  Users,
  Award,
  Sliders,
  Thermometer,
  BatteryCharging,
  Wifi,
  RefreshCw,
  Cpu,
  BellRing,
  Scale,
  MapPin,
  CheckSquare,
  Scan,
  BarChart3,
  Printer,
} from 'lucide-react';

const HomePage = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  // Handle Logo click (Always navigate and scroll to top of home page)
  const handleLogoClick = (e) => {
    e?.preventDefault();
    if (window.location.hash) {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  // Quick Tracker State
  const [searchId, setSearchId] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [quickTrackResult, setQuickTrackResult] = useState(null);
  const [trackError, setTrackError] = useState('');

  // Segregation Matrix Active Tab
  const [activeCategory, setActiveCategory] = useState('yellow');

  // Role Tab
  const [activeRoleTab, setActiveRoleTab] = useState('hospital');

  // Demo Login Trigger
  const [demoLoggingIn, setDemoLoggingIn] = useState('');

  // Interactive IoT Smart Bin Showcase State
  const [selectedIotBinId, setSelectedIotBinId] = useState('YB-104');
  const [simulatedFill, setSimulatedFill] = useState(82);
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [tamperTriggered, setTamperTriggered] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [lastPacketTime, setLastPacketTime] = useState('Just now');

  const smartBinsList = [
    {
      id: 'YB-104',
      name: 'ICU Ward 3 - Yellow Bin',
      category: 'Yellow (Infectious)',
      color: '#eab308',
      colorBg: 'bg-amber-500',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      department: 'Critical Care Unit',
      hospital: 'Apex Multi-Speciality',
      defaultFill: 82,
      maxCapacityKg: 25,
      temp: 22.4,
      sensorId: 'ESP32-LORAWAN-0091',
      battery: 94,
      signalDbm: -72,
    },
    {
      id: 'RB-208',
      name: 'Emergency Trauma - Red Bin',
      category: 'Red (Contaminated Plastics)',
      color: '#ef4444',
      colorBg: 'bg-rose-500',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      department: 'Emergency & Trauma Center',
      hospital: 'Apex Multi-Speciality',
      defaultFill: 46,
      maxCapacityKg: 30,
      temp: 21.8,
      sensorId: 'ESP32-LORAWAN-0094',
      battery: 89,
      signalDbm: -76,
    },
    {
      id: 'WB-301',
      name: 'Surgery OT 1 - White Sharps',
      category: 'White (Sharps & Needles)',
      color: '#64748b',
      colorBg: 'bg-slate-500',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      department: 'Operation Theater Complex',
      hospital: 'Apex Multi-Speciality',
      defaultFill: 28,
      maxCapacityKg: 10,
      temp: 20.9,
      sensorId: 'ESP32-LORAWAN-0102',
      battery: 98,
      signalDbm: -68,
    },
    {
      id: 'BB-412',
      name: 'Diagnostics Lab - Blue Bin',
      category: 'Blue (Glassware & Implants)',
      color: '#0284c7',
      colorBg: 'bg-sky-500',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      department: 'Pathology & Microbiology',
      hospital: 'Apex Multi-Speciality',
      defaultFill: 64,
      maxCapacityKg: 20,
      temp: 21.2,
      sensorId: 'ESP32-LORAWAN-0108',
      battery: 91,
      signalDbm: -74,
    },
  ];

  const currentSmartBin = smartBinsList.find((b) => b.id === selectedIotBinId) || smartBinsList[0];
  const calculatedWeight = ((simulatedFill / 100) * currentSmartBin.maxCapacityKg).toFixed(1);
  const remainingDistanceCm = Math.max(2, Math.round((100 - simulatedFill) * 0.75));
  const isAutoDispatchTriggered = simulatedFill >= 80;

  const handleSelectBin = (bin) => {
    setSelectedIotBinId(bin.id);
    setSimulatedFill(bin.defaultFill);
    setIsLidOpen(false);
    setTamperTriggered(false);
  };

  const handleSimulatePulseTick = () => {
    setPulseActive(true);
    setLastPacketTime('1s ago (Synced)');
    addToast(`IoT Pulse Broadcasted: Bin #${selectedIotBinId} telemetry verified by edge gateway.`, 'info');
    setTimeout(() => setPulseActive(false), 800);
  };

  // Interactive Platform Modules Workbench State
  const [activeModuleTab, setActiveModuleTab] = useState('ai');
  const [aiTestIndex, setAiTestIndex] = useState(0);
  const [aiClassifying, setAiClassifying] = useState(false);
  const [simFleetStatus, setSimFleetStatus] = useState('in_transit');

  const aiSamples = [
    {
      item: 'Surgical Latex Gloves (Contaminated)',
      category: 'Red (Contaminated Plastics)',
      color: '#ef4444',
      confidence: 99.2,
      latency: '38ms',
      method: 'Autoclaving + Shredding',
      hazard: 'Biohazard Non-Sharp',
      icon: '🧤',
    },
    {
      item: 'Soiled Dressing & Bloodied Gauze',
      category: 'Yellow (Infectious & Anatomical)',
      color: '#eab308',
      confidence: 98.7,
      latency: '41ms',
      method: 'Incineration at 1050°C',
      hazard: 'Pathogenic Fluid Risk',
      icon: '🩹',
    },
    {
      item: 'Discarded Antibiotic Glass Ampoules',
      category: 'Blue (Glassware & Implants)',
      color: '#0284c7',
      confidence: 99.5,
      latency: '34ms',
      method: 'Sodium Hypochlorite Disinfection',
      hazard: 'Sharp Glass & Cytotoxic Residue',
      icon: '🧪',
    },
    {
      item: 'Hypodermic Syringe Needles & Scalpels',
      category: 'White (Puncture-Proof Sharps)',
      color: '#64748b',
      confidence: 99.8,
      latency: '29ms',
      method: 'Dry Heat Sterilization + Concrete Sharp Pit',
      hazard: 'Puncture & Bloodborne Infection',
      icon: '💉',
    },
  ];

  const handleTestAiSample = (idx) => {
    setAiClassifying(true);
    setAiTestIndex(idx);
    setTimeout(() => {
      setAiClassifying(false);
    }, 450);
  };

  // Interactive Stakeholder Portals Simulator State
  const [hospitalSimWard, setHospitalSimWard] = useState('ICU Ward 3');
  const [hospitalSimColor, setHospitalSimColor] = useState('Yellow');
  const [hospitalSimWeight, setHospitalSimWeight] = useState('4.2');
  const [hospitalLoggedBags, setHospitalLoggedBags] = useState([
    { id: 'BMW-2024-8841', ward: 'ICU Ward 3', color: 'Yellow', weight: '4.85 kg', time: '12m ago' },
    { id: 'BMW-2024-8842', ward: 'OT 1 (Surgery)', color: 'Red', weight: '2.10 kg', time: '45m ago' },
  ]);

  const [collectorScanned, setCollectorScanned] = useState(false);
  const [manifestGenerated, setManifestGenerated] = useState(false);

  const handleHospitalLogBag = () => {
    const newId = `BMW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBag = {
      id: newId,
      ward: hospitalSimWard,
      color: hospitalSimColor,
      weight: `${hospitalSimWeight} kg`,
      time: 'Just now',
    };
    setHospitalLoggedBags([newBag, ...hospitalLoggedBags.slice(0, 3)]);
    addToast(`Waste Bag #${newId} logged with ward QR seal!`, 'success');
  };

  // Handle Quick Search
  const handleQuickSearch = async (e) => {
    e?.preventDefault();
    const idToSearch = searchId.trim();
    if (!idToSearch) return;

    try {
      setTrackingLoading(true);
      setTrackError('');
      setQuickTrackResult(null);
      const res = await api.get(`/tracking/${encodeURIComponent(idToSearch)}`);
      if (res?.data) {
        setQuickTrackResult(res.data);
      } else {
        setTrackError('No tracking record found for this identifier.');
      }
    } catch (err) {
      // Mock fallback preview if backend doesn't have the exact ID in demo
      setQuickTrackResult({
        identifier: idToSearch,
        wasteBag: {
          bagId: idToSearch,
          category: { name: 'Yellow (Infectious)', color: '#eab308' },
          weight: 4.85,
          status: 'in_transit',
          hospital: { name: 'Apex Multi-Speciality Hospital', city: 'Mumbai' },
          createdAt: new Date().toISOString(),
        },
        collection: {
          trackingNumber: `COL-${idToSearch.replace(/[^0-9]/g, '') || '9821'}`,
          collector: { name: 'Vikram Shinde', vehicleNumber: 'MH-04-AX-5512' },
          status: 'in_transit',
        },
        currentCheckpoint: 'In Transit to Central CBWTF Plant',
        timeline: [
          { status: 'Logged & Sealed', location: 'Apex Hospital - ICU Ward 3', time: '08:30 AM', completed: true },
          { status: 'IoT Smart Bin Deposited', location: 'Bin #YB-104 (Weight: 4.85 kg)', time: '09:15 AM', completed: true },
          { status: 'Collected by Fleet', location: 'Vehicle MH-04-AX-5512', time: '10:45 AM', completed: true },
          { status: 'En Route to Treatment', location: 'Highway Expressway Corridor', time: 'Now', completed: true },
          { status: 'Autoclave / Incineration', location: 'Central CBWTF Facility', time: 'Est. 12:30 PM', completed: false }
        ]
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  // 1-Click Demo Login
  const handleDemoLogin = async (role) => {
    try {
      setDemoLoggingIn(role);
      let email = 'hospital@example.com';
      let pass = 'Hospital@123';
      let targetPath = '/hospital/dashboard';

      if (role === 'admin') {
        email = 'admin@example.com';
        pass = 'Admin@123';
        targetPath = '/admin/dashboard';
      } else if (role === 'collector') {
        email = 'collector@example.com';
        pass = 'Collector@123';
        targetPath = '/collector/dashboard';
      }

      const loggedUser = await login(email, pass);
      addToast(`Logged in successfully as ${loggedUser.name} (${role.toUpperCase()})`, 'success');
      navigate(targetPath);
    } catch (err) {
      addToast(err.message || 'Demo sign in failed. Please try manual login.', 'error');
    } finally {
      setDemoLoggingIn('');
    }
  };

  // Categories Data
  const categoriesData = {
    yellow: {
      name: 'Yellow Category',
      title: 'Infectious & Anatomical Waste',
      color: '#eab308',
      bgLight: '#fefce8',
      borderLight: '#fef08a',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      items: [
        'Human anatomical tissues & organs',
        'Soiled cotton, gauze dressings & bandages',
        'Expired pharmaceuticals & cytotoxicity vials',
        'Microbiology & lab bacterial cultures'
      ],
      method: 'High-Temperature Incineration (1050°C) or Plasma Pyrolysis',
      treatmentDetail: 'Destroys pathogen DNA and bio-toxins without dioxin release through secondary combustion scrubbers.',
      hazardLevel: 'High Biological Risk (Class 2/3 Biohazard)',
      iotTelemetry: { fill: 68, weight: '14.2 kg', temp: '22.4°C', tamper: 'Secure' }
    },
    red: {
      name: 'Red Category',
      title: 'Contaminated Recyclable Plastics',
      color: '#ef4444',
      bgLight: '#fef2f2',
      borderLight: '#fecaca',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      items: [
        'Intravenous (IV) bottles & fluid tubes',
        'Disposable catheters & urine collection bags',
        'Syringes without needles & vacutainers',
        'Surgical latex gloves & protective aprons'
      ],
      method: 'Autoclaving (121°C @ 15 psi) followed by Shredding & Regranulation',
      treatmentDetail: 'Steam sterilization neutralizes bacteria before specialized shredding for authorized polymer recycling.',
      hazardLevel: 'Medium Contact Risk (Non-sharp)',
      iotTelemetry: { fill: 42, weight: '8.6 kg', temp: '21.8°C', tamper: 'Secure' }
    },
    white: {
      name: 'White (Translucent)',
      title: 'Sharps, Needles & Scalpels',
      color: '#64748b',
      bgLight: '#f8fafc',
      borderLight: '#e2e8f0',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      items: [
        'Hypodermic needles & needle-syringe combos',
        'Surgical scalpel blades & lancets',
        'Contaminated glass slides & razor tips',
        'Fixed metal orthopedic pins & drill wires'
      ],
      method: 'Autoclaving / Dry Heat Sterilization + Encapsulation in Concrete Pit',
      treatmentDetail: 'Puncture-proof and tamper-proof containers prevent accidental needle-stick transmission (HIV/HBSAg).',
      hazardLevel: 'Severe Puncture & Bloodborne Pathogen Risk',
      iotTelemetry: { fill: 29, weight: '3.1 kg', temp: '21.0°C', tamper: 'Secure' }
    },
    blue: {
      name: 'Blue Category',
      title: 'Glassware & Metallic Implants',
      color: '#0284c7',
      bgLight: '#f0f9ff',
      borderLight: '#bae6fd',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
      items: [
        'Discarded medicine glass ampoules & vials',
        'Contaminated lab beakers & Petri dishes',
        'Metallic orthopedic implants & titanium plates',
        'Cardiovascular stent delivery remnants'
      ],
      method: 'Disinfection via 1-2% Sodium Hypochlorite + Autoclaving & Glass Foundry Reuse',
      treatmentDetail: 'Chemical and thermal sterilization prepares clean glass cullet and metal alloys for certified re-melting.',
      hazardLevel: 'Cut & Chemical Biohazard',
      iotTelemetry: { fill: 54, weight: '11.4 kg', temp: '20.9°C', tamper: 'Secure' }
    }
  };

  const activeCatData = categoriesData[activeCategory];

  return (
    <div className="min-h-screen bg-surface-tertiary text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">

      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white py-2 px-4 text-xs font-medium border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              CPCB Certified
            </span>
            <span className="text-emerald-100 hidden sm:inline">
              Bio-Medical Waste Management Rules 2016 Compliant &bull; Live Barcode & Manifest Chain of Custody
            </span>
            <span className="text-emerald-100 sm:hidden">
              Bio-Medical Waste Traceability Platform
            </span>
          </div>

          <div className="flex items-center space-x-4 text-emerald-200 text-[11px]">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 inline-block"></span>
              IoT Gateway: Online
            </span>
            <span className="hidden md:flex items-center">
              <Lock className="w-3 h-3 mr-1" /> 256-Bit Encrypted Telemetry
            </span>
            <Link to="/traceability" className="underline hover:text-white transition-colors">
              Public Barcode Tracker &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STICKY GLASS HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center space-x-3 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
            title="Open Home Page"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-btn-emerald group-hover:scale-105 transition-transform duration-200">
              <svg viewBox="0 0 20 20" className="w-6 h-6" fill="none">
                <rect x="8" y="2" width="4" height="16" rx="2" fill="white" />
                <rect x="2" y="8" width="16" height="4" rx="2" fill="white" />
                <circle cx="10" cy="10" r="2.5" fill="rgba(255,255,255,0.4)" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-0.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">MediTrack</span>
                <span className="text-xl font-black text-emerald-600 tracking-tight">X</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Biomedical Traceability
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-700 transition-colors">Platform Modules</a>
            <a href="#segregation" className="hover:text-emerald-700 transition-colors">4-Color Segregation</a>
            <a href="#telemetry" className="hover:text-emerald-700 transition-colors">IoT Smart Bins</a>
            <a href="#lifecycle" className="hover:text-emerald-700 transition-colors">Chain of Custody</a>
            <a href="#roles" className="hover:text-emerald-700 transition-colors">Workflows</a>
            <Link to="/traceability" className="flex items-center text-emerald-700 hover:text-emerald-800 transition-colors">
              <Search className="w-3.5 h-3.5 mr-1" />
              Traceability Search
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={
                    user?.role === 'admin'
                      ? '/admin/dashboard'
                      : user?.role === 'collector'
                      ? '/collector/dashboard'
                      : '/hospital/dashboard'
                  }
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-btn-emerald transition-all flex items-center space-x-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-all"
                >
                  Sign In
                </Link>
                <a
                  href="#demo-launch"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-btn-emerald transition-all items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Demo</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION WITH 3D THREE.JS CANVAS */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-emerald-100/60">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `radial-gradient(#10b981 0.75px, transparent 0.75px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/90 text-emerald-800 text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Generation Bio-Medical Waste Ecosystem</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-700 font-medium">CPCB 2016 Compliant</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Intelligent Biomedical <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 bg-clip-text text-transparent">
                  Waste Traceability
                </span>{' '}
                & Smart Segregation
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                End-to-end digital chain of custody connecting hospital wards, IoT ultrasonic smart bins, 
                AI-assisted waste classification, GPS-tracked collection fleets, and certified treatment facilities.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#quick-track"
                  className="px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-btn-emerald hover:shadow-btn-emerald-hover transition-all flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Track Bag or Manifest</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#demo-launch"
                  className="px-6 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Test Drive Personas</span>
                </a>

                <Link
                  to="/integrations/ai-classifier"
                  className="px-4 py-3.5 rounded-xl font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center space-x-1.5 text-sm"
                >
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>AI Classifier Simulator</span>
                </Link>
              </div>

              {/* Live Metric Tickers */}
              <div className="pt-6 border-t border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">99.98%</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Segregation Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">480+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Connected Hospitals</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-teal-600 tracking-tight">1.4M+ kg</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Certified Bio-Waste Traced</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-sky-600 tracking-tight">0 Violations</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">CPCB Audit Record</div>
                </div>
              </div>

            </div>

            {/* Right Interactive 3D Globe Visual */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full max-w-[500px] aspect-square relative">
                
                {/* Three.js Globe Canvas */}
                <ThreeGlobeCanvas />

                {/* Floating Stat Card 1 - Top Left */}
                <div className="absolute -top-2 left-2 sm:-left-4 z-20 animate-float" style={{ animationDelay: '0s' }}>
                  <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-100 shadow-card flex items-center space-x-3 text-left">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Smart Bin #YB-104</div>
                      <div className="text-[10px] text-amber-600 font-semibold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-pulse" />
                        82% Full &bull; Auto-Pickup Dispatched
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Stat Card 2 - Bottom Right */}
                <div className="absolute -bottom-3 right-0 sm:-right-4 z-20 animate-float" style={{ animationDelay: '2.5s' }}>
                  <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-100 shadow-card flex items-center space-x-3 text-left">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 flex-shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Fleet Unit MH-12-TX</div>
                      <div className="text-[10px] text-sky-600 font-semibold flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1 animate-pulse" />
                        GPS Lock: En Route to CBWTF
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE INSTANT TRACEABILITY SEARCH */}
      <section id="quick-track" className="py-14 bg-white border-b border-emerald-100/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <QrCode className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Public Verification Gateway
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Instant Waste Bag & Manifest Verification
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto mt-1">
              Verify chain of custody, GPS collection timestamps, bag weight, and treatment certification for any registered barcode.
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleQuickSearch} className="relative flex flex-col sm:flex-row gap-2 shadow-card rounded-2xl p-2 bg-slate-50 border border-emerald-100">
            <div className="relative flex-grow flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Waste Bag Barcode (e.g. BMW-2024-8841, TRK-9021-X)..."
                className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={trackingLoading}
              className="px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-btn-emerald transition-all flex items-center justify-center space-x-2 flex-shrink-0"
            >
              {trackingLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Status</span>
                </>
              )}
            </button>
          </form>

          {/* Sample Chips */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-4 text-xs text-slate-500">
            <span className="font-medium">Try Sample Tags:</span>
            {['BMW-2024-8841', 'TRK-9021-X', 'HSP-APOLLO-04'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setSearchId(sample);
                  setTimeout(() => handleQuickSearch(), 50);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-mono text-[11px] font-semibold border border-emerald-200 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Quick Track Result Card */}
          {quickTrackResult && (
            <div className="mt-8 p-6 rounded-2xl bg-white border border-emerald-200 shadow-card animate-scale-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-black text-slate-900 font-mono">{quickTrackResult.identifier}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {quickTrackResult.wasteBag?.status || 'In Transit'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Origin: <strong className="text-slate-700">{quickTrackResult.wasteBag?.hospital?.name || 'Apex Multi-Speciality'}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/traceability?id=${encodeURIComponent(quickTrackResult.identifier)}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Open Full Traceability Audit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Checkpoint Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Waste Category</div>
                  <div className="text-xs font-bold text-amber-600 mt-1 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                    {quickTrackResult.wasteBag?.category?.name || 'Yellow (Infectious)'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Verified Weight</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {quickTrackResult.wasteBag?.weight || 4.85} kg (Load Cell)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Collector</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {quickTrackResult.collection?.collector?.name || 'Vikram Shinde (BioTrans)'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Phase</div>
                  <div className="text-xs font-bold text-emerald-700 mt-1">
                    {quickTrackResult.currentCheckpoint || 'In Transit to Central CBWTF'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {trackError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{trackError}</span>
            </div>
          )}
        </div>
      </section>

      {/* 5. INTERACTIVE 4-COLOR BIOMEDICAL SEGREGATION MATRIX */}
      <section id="segregation" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
            <Layers className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Biomedical Waste Management Rules 2016
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            The 4-Color Segregation Matrix
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Correct source segregation is mandated by pollution control boards. MediTrackX pairs digital barcode tagging with AI vision validation to eliminate cross-contamination.
          </p>
        </div>

        {/* Color Tab Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8">
          {Object.entries(categoriesData).map(([key, cat]) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 border ${
                  isActive
                    ? 'bg-white shadow-card border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900'
                    : 'bg-white/60 hover:bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="capitalize">{key} Bag</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Category Showcase Card */}
        <div
          className="rounded-3xl p-8 lg:p-10 border transition-all duration-300 shadow-card"
          style={{
            backgroundColor: activeCatData.bgLight,
            borderColor: activeCatData.borderLight,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Category Info */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="flex items-center space-x-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: activeCatData.color }}
                />
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {activeCatData.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${activeCatData.badgeBg}`}>
                  {activeCatData.hazardLevel}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200">
                  Disposal: {activeCatData.method.split(' ')[0]}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Approved Waste Items for this Category:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCatData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 text-xs font-semibold text-slate-800 flex items-start space-x-2"
                    >
                      <CheckCircle2
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: activeCatData.color }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scientific Treatment Method */}
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Regulatory Scientific Treatment Protocol:</span>
                </div>
                <div className="text-xs font-bold text-slate-800">{activeCatData.method}</div>
                <div className="text-xs text-slate-600">{activeCatData.treatmentDetail}</div>
              </div>
            </div>

            {/* Right Simulated IoT Bin Sensor Readout */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      IoT Sensor Telemetry
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Online &bull; Node #04
                  </span>
                </div>

                {/* Simulated Fill Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Ultrasonic Fill Depth:</span>
                    <span className="text-slate-900">{activeCatData.iotTelemetry.fill}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${activeCatData.iotTelemetry.fill}%`,
                        backgroundColor: activeCatData.color,
                      }}
                    />
                  </div>
                </div>

                {/* Sensor Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Load Cell</div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">
                      {activeCatData.iotTelemetry.weight}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Internal Temp</div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">
                      {activeCatData.iotTelemetry.temp}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Lid Seal</div>
                    <div className="text-sm font-black text-emerald-600 mt-0.5">
                      {activeCatData.iotTelemetry.tamper}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Auto-pickup threshold: 80%</span>
                  <Link
                    to="/integrations/iot-telemetry"
                    className="text-emerald-700 font-bold hover:underline flex items-center"
                  >
                    View All 16 Facility Bins &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5.5 DEDICATED IOT SMART BINS & TELEMETRY SECTION (MATCHING LIGHT HEALTHCARE THEME) */}
      <section id="telemetry" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
            <Radio className="w-3.5 h-3.5 mr-1.5 text-teal-600 animate-pulse" />
            <span>IoT Edge Telemetry & Smart Bins</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            Next-Gen IoT Smart Bins & Auto-Dispatch
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Every departmental hospital bin is an autonomous edge computing node equipped with ultrasonic fill depth ranging, 
            tare-calibrated load cells, thermal probes, and automatic pickup triggers.
          </p>
        </div>

        {/* Top 4 IoT Telemetry Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 text-left">
          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-card flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">16 Bins</div>
              <div className="text-xs font-semibold text-slate-500">100% Online &bull; Telemetry Active</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-card flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-teal-700">{simulatedFill}% Fill</div>
              <div className="text-xs font-semibold text-slate-500">Current Unit Utilization</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-card flex items-center space-x-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isAutoDispatchTriggered 
                ? 'bg-rose-50 border border-rose-200 text-rose-700 animate-pulse'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-2xl font-black ${isAutoDispatchTriggered ? 'text-rose-700' : 'text-slate-900'}`}>
                {isAutoDispatchTriggered ? '1 Active' : '0 Alerts'}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {isAutoDispatchTriggered ? 'Auto-Pickup En Route' : 'All Bins Below 80%'}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-card flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 flex-shrink-0">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900">LoRaWAN + MQTT</div>
              <div className="text-xs font-semibold text-slate-500">TLS 1.3 Encrypted Broker</div>
            </div>
          </div>
        </div>

        {/* Smart Bin Selector Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {smartBinsList.map((b) => {
            const isSelected = b.id === selectedIotBinId;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBin(b)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2.5 border ${
                  isSelected
                    ? 'bg-white text-slate-900 border-emerald-500 shadow-card ring-2 ring-emerald-500/20'
                    : 'bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white border-slate-200'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.color }}
                />
                <span>{b.name}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {b.id}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visual Smart Bin Simulator (Clean White Healthcare Panel) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-emerald-100 shadow-card space-y-6 text-left">
            
            {/* Bin Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black text-slate-900">{currentSmartBin.name}</span>
                  <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                    {currentSmartBin.sensorId}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Department: <strong className="text-slate-800">{currentSmartBin.department}</strong> &bull; {currentSmartBin.hospital}
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="text-xs font-bold text-emerald-800">Telemetry: {lastPacketTime}</span>
              </div>
            </div>

            {/* Interactive Fill Slider Control */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center text-slate-700">
                  <Sliders className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  <span>Interactive Fill Level Simulator:</span>
                </span>
                <span className="text-sm font-black text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                  {simulatedFill}% Full
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={simulatedFill}
                onChange={(e) => setSimulatedFill(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>0% (Empty)</span>
                <span className="text-amber-600 font-bold">50% (Normal)</span>
                <span className="text-rose-600 font-bold">80% (Auto-Dispatch Trigger)</span>
                <span className="text-slate-700">100% (Full)</span>
              </div>
            </div>

            {/* Cutaway Chamber Visual */}
            <div className="relative h-56 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
              
              {/* Ultrasonic Emitter Head (Top) */}
              <div className="flex items-center justify-between z-10 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono text-slate-300 font-bold">
                    JSN-SR04T Ultrasonic Sensor
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {remainingDistanceCm} cm to Brim
                </div>
              </div>

              {/* Acoustic Soundwave Pulse Effect */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center opacity-30">
                <div className="w-16 h-4 border-b-2 border-emerald-400 rounded-[50%] animate-ping" />
                <div className="w-28 h-6 border-b-2 border-emerald-400 rounded-[50%] mt-2 animate-ping" style={{ animationDelay: '0.2s' }} />
              </div>

              {/* Dynamic Fluid Fill Level */}
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-300 flex items-center justify-center"
                style={{
                  height: `${simulatedFill}%`,
                  backgroundColor: currentSmartBin.color,
                  opacity: 0.88,
                }}
              >
                <span className="text-xs font-black text-slate-900 bg-white/95 px-3 py-1 rounded-full shadow-md">
                  {currentSmartBin.category.split(' ')[0]} Waste ({calculatedWeight} kg)
                </span>
              </div>

              {/* Bottom Load Cell Scale Base */}
              <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-2 text-[11px] font-mono text-slate-300">
                <span className="flex items-center">
                  <Scale className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  HX711 4-Point Load Cell:
                </span>
                <span className="font-bold text-white">
                  {calculatedWeight} / {currentSmartBin.maxCapacityKg} kg (Tare Zeroed)
                </span>
              </div>
            </div>

            {/* Dynamic Auto-Dispatch Trigger Card */}
            {isAutoDispatchTriggered ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left animate-scale-in">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse shadow-sm">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-rose-800 flex items-center space-x-1.5">
                      <span>THRESHOLD BREACHED (&ge;80%): AUTOMATIC PICKUP TRIGGERED!</span>
                    </div>
                    <div className="text-xs text-rose-700 leading-relaxed">
                      Auto-generated manifest ticket <strong className="font-mono text-slate-900">#REQ-8891</strong>. 
                      Dispatched collection vehicle <strong className="text-slate-900">MH-04-AX-5512</strong> (Collector Vikram Shinde). 
                      Estimated hospital arrival: <strong className="text-emerald-700 font-bold">14 minutes</strong>.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                <span className="flex items-center font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
                  Bin level nominal. Automatic pickup request will trigger when capacity reaches 80%.
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-700 hidden sm:inline">Safe Margin</span>
              </div>
            )}

            {/* Hardware Test Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLidOpen(!isLidOpen)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1.5 ${
                  isLidOpen
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{isLidOpen ? 'Lid: Open (Alert)' : 'Lid: Sealed'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTamperTriggered(!tamperTriggered);
                  if (!tamperTriggered) {
                    addToast(`Tamper Gyro Triggered: Anti-tilt alarm logged for Bin #${selectedIotBinId}`, 'warning');
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center space-x-1.5 ${
                  tamperTriggered
                    ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                <span>{tamperTriggered ? 'Tilt: 45° Alarm!' : 'Test Gyro Tilt'}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulatePulseTick}
                disabled={pulseActive}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-btn-emerald transition-all flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pulseActive ? 'animate-spin' : ''}`} />
                <span>{pulseActive ? 'Pinging...' : 'Ping Live Pulse'}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Sensor Architecture Breakdown (Clean Light Cards) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Sensor HUD Matrix (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Sensor 1 */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-card space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Ultrasonic Transducer</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{remainingDistanceCm} cm</div>
                <div className="text-[11px] text-slate-500">
                  JSN-SR04T contactless depth sensor. Waterproof and immune to biohazard dust.
                </div>
              </div>

              {/* Sensor 2 */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-card space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Strain-Gauge Scale</span>
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{calculatedWeight} kg</div>
                <div className="text-[11px] text-slate-500">
                  HX711 24-bit ADC load cell. Prevents billing discrepancies and bin overload.
                </div>
              </div>

              {/* Sensor 3 */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-card space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Chamber Temperature</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                    <Thermometer className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{currentSmartBin.temp}&deg;C</div>
                <div className="text-[11px] text-slate-500">
                  DS18B20 sealed probe. Monitors internal fermentation & exothermic reaction risk.
                </div>
              </div>

              {/* Sensor 4 */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-card space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">LoRaWAN & LiFePO4</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <BatteryCharging className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{currentSmartBin.battery}%</div>
                <div className="text-[11px] text-slate-500">
                  Solar-augmented battery. Signal: {currentSmartBin.signalDbm} dBm. 18-month off-grid run.
                </div>
              </div>

            </div>

            {/* Edge Architecture & Cloud Broker Card */}
            <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-card space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-btn-emerald">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">ESP32 Edge Microcontroller & MQTT Gateway</h3>
                  <p className="text-xs text-slate-500">Low-latency processing with automated threshold triggers</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Smart bins continuously sample ultrasonic depth and strain-gauge weight using Kalman noise filtration. 
                Telemetry packets are transmitted securely over LoRaWAN or NB-IoT directly to the cloud MongoDB Atlas database.
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Wifi className="w-4 h-4 text-emerald-600" />
                  <span>Broker: MQTT over WebSockets &bull; TLS 1.3</span>
                </div>

                <Link
                  to="/integrations/iot-telemetry"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-btn-emerald transition-all inline-flex items-center space-x-1.5"
                >
                  <span>Open 16-Bin Telemetry Suite</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Other Hospital Bins Quick Summary List */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Other Departmental Bins in Facility
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {smartBinsList
                  .filter((b) => b.id !== selectedIotBinId)
                  .map((otherBin) => (
                    <button
                      key={otherBin.id}
                      type="button"
                      onClick={() => handleSelectBin(otherBin)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition-colors"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: otherBin.color }} />
                        <span className="text-xs font-bold text-slate-800">{otherBin.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">{otherBin.department}</div>
                      <div className="text-[11px] font-bold text-emerald-700 mt-1">{otherBin.defaultFill}% Full</div>
                    </button>
                  ))}
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 6. CORE PLATFORM PILLARS & INNOVATIONS (INTERACTIVE MODULES WORKBENCH) */}
      <section id="features" className="py-20 bg-white border-y border-emerald-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Platform Architecture & Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Interactive Platform Modules
            </h2>
            <p className="text-slate-600 text-base mt-2">
              Combining industrial IoT hardware, computer vision AI, GPS fleet telemetry, and cloud manifests into an airtight compliance engine.
            </p>
          </div>

          {/* Module Selector Tab Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            {[
              { id: 'ai', name: 'AI Vision Classifier', icon: Bot, tag: 'CNN' },
              { id: 'gps', name: 'GPS Fleet Radar', icon: Navigation, tag: 'GNSS' },
              { id: 'traceability', name: 'Digital Traceability', icon: QrCode, tag: 'SHA-256' },
              { id: 'manifests', name: 'CPCB Form II Manifests', icon: FileText, tag: 'Govt Audit' },
              { id: 'robot', name: 'Hospital AMR Robots', icon: Bot, tag: 'SLAM AGV' },
              { id: 'bins', name: 'IoT Smart Bins', icon: Radio, tag: 'LoRaWAN' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeModuleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'bins') {
                      const el = document.getElementById('telemetry');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      setActiveModuleTab(tab.id);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-btn-emerald ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-white border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {tab.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Live Module Workbench Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-tertiary border border-emerald-100 shadow-card mb-16 text-left">
            
            {/* Tab 1: AI Vision Classifier */}
            {activeModuleTab === 'ai' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Edge Computer Vision &bull; MobileNetV3
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">Inference: &lt;80ms</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">
                    AI-Driven Source Waste Classification
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Trained on over 140,000 annotated biomedical waste images across 4 regulatory color categories. 
                    Detects incorrect bag disposal before the lid seals, preventing costly regulatory penalties.
                  </p>

                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Instant visual item recognition at nursing stations & OT prep rooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Real-time cross-contamination audio-visual warning buzzer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Auto-logs photograph snapshot to cloud manifest audit record</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/integrations/ai-classifier"
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-btn-emerald transition-all inline-flex items-center space-x-1.5"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Launch Full AI Classifier Simulator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Right Interactive AI Test Bench */}
                <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-2">
                      <Scan className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800">Interactive AI Detection Bench</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Live Neural Model Active
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 font-medium">
                    Click a sample item below to trigger live neural network inference:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {aiSamples.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTestAiSample(idx)}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center space-x-2 ${
                          aiTestIndex === idx
                            ? 'bg-emerald-50/80 border-emerald-400 font-bold text-slate-900 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-lg">{sample.icon}</span>
                        <span className="truncate">{sample.item.split(' ')[0]} {sample.item.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Classification Result Display */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 relative overflow-hidden">
                    {aiClassifying && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-10">
                        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
                          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          <span>Scanning Item (Edge Inference)...</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Detected Object:</span>
                      <span className="font-bold text-slate-900">{aiSamples[aiTestIndex].item}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Assigned Bin Category:</span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold text-white"
                        style={{ backgroundColor: aiSamples[aiTestIndex].color }}
                      >
                        {aiSamples[aiTestIndex].category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Model Confidence:</span>
                      <span className="font-black text-emerald-700 font-mono">
                        {aiSamples[aiTestIndex].confidence}% &bull; {aiSamples[aiTestIndex].latency}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      Disposal: <strong className="text-slate-800">{aiSamples[aiTestIndex].method}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: GPS Fleet Radar */}
            {activeModuleTab === 'gps' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      GNSS Satellite Telemetry &bull; Geofenced Corridor
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">Update Rate: 2s</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">
                    Real-Time GPS Fleet Tracking & Geofencing
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Authorized bio-waste trucks are equipped with satellite transponders, cargo bay temperature monitors, 
                    and automated geofence tripwires to guarantee 0% roadside dumping.
                  </p>

                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>Strict geofenced transit corridors between hospitals & CBWTFs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>Cargo bay refrigeration sensor tracking (&lt;8&deg;C cold-chain preservation)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span>Instant SMS & WhatsApp alerts upon unscheduled door opens or route deviation</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/integrations/gps-fleet"
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all inline-flex items-center space-x-1.5"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Open Live GPS Fleet Command</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-bold text-slate-800">Fleet Unit MH-04-AX-5512</span>
                    </div>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1 animate-pulse" />
                      In Transit &bull; GNSS Locked
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Route Corridor:</span>
                      <span className="font-bold text-slate-900">Apex Hospital &rarr; Metro CBWTF Plant</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Speed</div>
                        <div className="font-black text-slate-800 mt-0.5">42 km/h</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Cold Chain</div>
                        <div className="font-black text-sky-700 mt-0.5">4.2&deg;C (Safe)</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Geofence</div>
                        <div className="font-black text-emerald-700 mt-0.5">Verified &#10003;</div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-600">Transit Progress (18.4 km / 24.0 km):</span>
                        <span className="text-slate-900 font-mono font-bold">76%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: '76%' }} />
                      </div>
                      <div className="text-[10px] text-slate-500 text-right">Estimated arrival: 14 mins</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Digital Traceability */}
            {activeModuleTab === 'traceability' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Immutable Chain of Custody &bull; Cryptographic Ledger
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">
                    End-to-End Barcode Traceability Engine
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    From the moment a nurse seals an infectious waste bag, an immutable digital ledger entry is generated. 
                    Every custody handoff requires dual biometric or PIN signatures.
                  </p>

                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Tamper-evident QR bag tags with SHA-256 genesis hash</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Independent weight verification at hospital ward, truck, and incinerator gate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span>Instant public verification gateway for compliance inspectors</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/traceability"
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all inline-flex items-center space-x-1.5"
                    >
                      <Search className="w-4 h-4" />
                      <span>Open Traceability Search</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-xs font-bold text-slate-800">Custody Checkpoint Sequence</span>
                    <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Bag #BMW-2024-8841
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { title: 'Hospital Ward Genesis', desc: 'Apex Hospital - ICU 3 (Nurse Sunita R.)', time: '08:30 AM', done: true },
                      { title: 'IoT Smart Bin Deposit', desc: 'Bin #YB-104 (Weight: 4.85 kg logged)', time: '09:15 AM', done: true },
                      { title: 'Transporter Custody Handover', desc: 'Vehicle MH-04-AX (Driver Vikram S.)', time: '10:45 AM', done: true },
                      { title: 'Treatment Plant Gate Receipt', desc: 'Central CBWTF Plant (Inspector Amit P.)', time: 'Pending', done: false },
                    ].map((step, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span className={`w-2 h-2 rounded-full ${step.done ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <span>{step.title}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">{step.desc}</div>
                        </div>
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          step.done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {step.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: CPCB Manifests */}
            {activeModuleTab === 'manifests' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      CPCB Form II / Form IV &bull; Bio-Medical Waste Rules 2016
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">
                    Automated Statutory Compliance Manifests
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Eliminate manual logbooks. MediTrackX automatically populates statutory manifest Form II and annual Form IV 
                    reports formatted exactly to state pollution control board specifications.
                  </p>

                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>One-click digital signature for hospital superintendent & authorized driver</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Automated monthly waste category mass-balance calculations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Direct PDF & Excel export for pollution control board inspections</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => addToast('CPCB Form II Manifest preview generated with digital signature seal.', 'success')}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all inline-flex items-center space-x-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Simulate Form II Generation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-800">State Pollution Control Board Manifest</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Form II Verified
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
                    <div className="flex justify-between border-b pb-1.5 text-slate-600">
                      <span>Manifest No:</span>
                      <span className="font-bold text-slate-900">CPCB-MH-2024-8841-B</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 text-slate-600">
                      <span>Healthcare Facility:</span>
                      <span className="font-bold text-slate-900">Apex Multi-Speciality (HSP-042)</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 text-slate-600">
                      <span>CBWTF Operator:</span>
                      <span className="font-bold text-slate-900">BioTrans Solutions (CBWTF-09)</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 text-slate-600">
                      <span>Total Consignment:</span>
                      <span className="font-bold text-emerald-700">18.4 kg (Yellow: 9.8, Red: 5.2, Blue: 3.4)</span>
                    </div>
                    <div className="flex justify-between pt-1 text-slate-600">
                      <span>Digital Seal:</span>
                      <span className="text-emerald-700 font-bold">&#10003; Cryptographically Signed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Hospital AMR Robots */}
            {activeModuleTab === 'robot' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                      Autonomous Mobile Robots (AMR) &bull; SLAM Lidar
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900">
                    Indoor Autonomous Hospital Waste Transport
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Self-driving internal transport robots navigate hospital elevators and corridors to collect hazardous bags from nursing stations, 
                    reducing human exposure to infectious aerosols.
                  </p>

                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>Lidar SLAM mapping for safe pedestrian obstacle avoidance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>Automated wireless elevator integration & airtight sealed container</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>Automatic return to ultraviolet-C sterilization dock</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/integrations/robot-dispatch"
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-all inline-flex items-center space-x-1.5"
                    >
                      <Bot className="w-4 h-4" />
                      <span>Open AMR Robot Fleet Console</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-800">MediBot Unit #01 [Indoor AGV]</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Active Navigation
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Mission:</span>
                      <span className="font-bold text-slate-900">ICU Ward 3 &rarr; Central Waste Holding Dock</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payload Sealed:</span>
                      <span className="font-bold text-emerald-700">14.2 kg (Yellow Biohazard Container)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lidar Obstacle Radar:</span>
                      <span className="font-bold text-teal-700">Clear &bull; Speed: 1.2 m/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Battery Level:</span>
                      <span className="font-bold text-slate-900">88% (Auto-Dock in 45m)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 6-Card Ecosystem Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-surface-tertiary border border-emerald-100 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-btn-emerald group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Vision Classifier</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Mobile and edge computer vision neural network capable of recognizing biomedical waste items in under 80ms, preventing high-liability cross contamination before sealing.
              </p>
              <Link
                to="/integrations/ai-classifier"
                className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>Test Live AI Classifier</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-surface-tertiary border border-emerald-100 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-6 shadow-glow-teal group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">IoT Ultrasonic Bins</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Dual ultrasonic distance sensors, load cell scales, and anti-tamper gyroscopes. Automatically triggers priority collection requests when bins breach 80% capacity.
              </p>
              <Link
                to="/integrations/iot-telemetry"
                className="inline-flex items-center text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                <span>Explore IoT Telemetry</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-surface-tertiary border border-emerald-100 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-6 shadow-glow-blue group-hover:scale-110 transition-transform">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">GPS Fleet Logistics</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Real-time satellite tracking of authorized biomedical waste trucks. Enforces strict geofenced corridors between hospitals and CBWTFs with zero-dumping guarantees.
              </p>
              <Link
                to="/integrations/gps-fleet"
                className="inline-flex items-center text-xs font-bold text-sky-700 hover:text-sky-800"
              >
                <span>Live Fleet Radar</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-surface-tertiary border border-emerald-100 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">QR & RFID Bag Custody</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Unique serial barcodes per bag sealed at ward level. Scanned at 4 consecutive handover gates with cryptographic hash validation to prevent clandestine disposal.
              </p>
              <Link
                to="/traceability"
                className="inline-flex items-center text-xs font-bold text-indigo-700 hover:text-indigo-800"
              >
                <span>Traceability Engine</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-surface-tertiary border border-emerald-100 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Automated CPCB Manifests</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Instant digital generation of Form II & Form IV compliance manifests required by state pollution control boards, eliminating paperwork and manual logging errors.
              </p>
              <span className="inline-flex items-center text-xs font-bold text-amber-700">
                <span>Form II/IV Audit Compliant</span>
              </span>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-surface-tertiary border border-emerald-100 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mb-6 shadow-btn-emerald group-hover:scale-110 transition-transform">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Carbon & Safety Metrics</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Executive dashboards tracking plastic recycled (Red Bag), incinerator emission equivalents, hazardous load reduction, and hospital accreditation readiness (NABH).
              </p>
              <span className="inline-flex items-center text-xs font-bold text-emerald-700">
                <span>ESG & Green Healthcare Ready</span>
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 7. VISUAL CHAIN OF CUSTODY PIPELINE (5 STEPS) */}
      <section id="lifecycle" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-sky-600" /> End-to-End Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            5-Stage Chain of Custody Pipeline
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Every gram of biomedical waste is digitally tracked from the patient bedside to final scientific sterilization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm relative text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Ward Generation & Barcode Seal</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Staff segregates into 4 color bags, affixes unique QR code tag, and logs weight in ward terminal.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm relative text-left">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">IoT Bin Deposit & Dispatch</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ultrasonic sensors measure fill level. Once 80% is reached, an automated pickup request is generated.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm relative text-left">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Collector Scan & Digital Weighing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Certified collector scans bag QR with mobile app, validates weight against hospital scale, and accepts custody.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm relative text-left">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-3">
              4
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">GPS Monitored Fleet Transit</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vehicle transits via geofenced corridor. Anti-tamper sensors log door events and real-time vehicle speed.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm relative text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold text-sm flex items-center justify-center mb-3">
              5
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">CBWTF Treatment & Certificate</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Treatment facility performs autoclave/incineration cycle and digitally issues Form II Certificate of Destruction.
            </p>
          </div>

        </div>
      </section>

      {/* 8. ROLE-BASED EXPERIENCE TABS */}
      <section id="roles" className="py-20 bg-white border-y border-emerald-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Stakeholder Portals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Tailored Portals for Every Role
            </h2>
            <p className="text-slate-600 text-base mt-2">
              Clean, role-specific interfaces engineered for speed, high contrast, and zero clutter.
            </p>
          </div>

          {/* Role Selector */}
          <div className="flex justify-center mb-10">
            <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 inline-flex space-x-2">
              {[
                { id: 'hospital', label: 'Hospital Staff', icon: Building2 },
                { id: 'collector', label: 'Authorized Collector', icon: Truck },
                { id: 'admin', label: 'Compliance Admin', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeRoleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRoleTab(tab.id)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all ${
                      isActive
                        ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Details with Live Working Simulators */}
          <div className="max-w-6xl mx-auto p-6 sm:p-10 rounded-3xl bg-surface-tertiary border border-emerald-100 shadow-card text-left">
            
            {/* Persona 1: Hospital Staff */}
            {activeRoleTab === 'hospital' && (
              <div className="space-y-8 animate-fade-in">
                {/* Hospital Top KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Clinical Wards</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">8 Monitored</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">ICU, OT, OPD, Pathology</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Logged Today</div>
                    <div className="text-xl font-black text-emerald-700 mt-0.5">{hospitalLoggedBags.length + 22} Bags</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Zero manifest backlog</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Collector Response</div>
                    <div className="text-xl font-black text-teal-700 mt-0.5">18 mins avg</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Automated pickup dispatch</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">CPCB Form II</div>
                    <div className="text-xl font-black text-sky-700 mt-0.5">100% Pass</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">&#10003; Audit Compliant</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 space-y-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Nursing Station & Infection Control Portal
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      Rapid Ward Waste Logging & Barcode Tagging
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Engineered for high-pressure hospital wards. Nursing staff and sanitation supervisors can register 
                      hazardous bags in under 10 seconds, print waterproof QR tags, and track departmental bin fill levels.
                    </p>

                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Instant serial barcode generation with ward & waste metadata</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Live ultrasonic bin fill levels across ICU, OT, and Diagnostics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>One-click pickup summons with vehicle ETA tracking</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleDemoLogin('hospital')}
                        disabled={demoLoggingIn === 'hospital'}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-btn-emerald transition-all inline-flex items-center space-x-1.5"
                      >
                        <Building2 className="w-4 h-4" />
                        <span>{demoLoggingIn === 'hospital' ? 'Logging in...' : 'Launch Hospital Staff Demo'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Interactive Live Bag Logger Simulator */}
                  <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-2">
                        <Printer className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">Live Ward Waste Logging Simulator</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Interactive Sandbox
                      </span>
                    </div>

                    {/* Quick Logging Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Select Ward</label>
                        <select
                          value={hospitalSimWard}
                          onChange={(e) => setHospitalSimWard(e.target.value)}
                          className="mt-1 w-full p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                          <option>ICU Ward 3</option>
                          <option>Operation Theater 1</option>
                          <option>Emergency Trauma</option>
                          <option>Pathology & Lab</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Waste Category</label>
                        <select
                          value={hospitalSimColor}
                          onChange={(e) => setHospitalSimColor(e.target.value)}
                          className="mt-1 w-full p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                        >
                          <option>Yellow (Infectious)</option>
                          <option>Red (Plastics)</option>
                          <option>White (Sharps)</option>
                          <option>Blue (Glassware)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={hospitalSimWeight}
                          onChange={(e) => setHospitalSimWeight(e.target.value)}
                          className="mt-1 w-full p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleHospitalLogBag}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-btn-emerald transition-all flex items-center justify-center space-x-1.5"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Log Hazardous Bag & Generate Barcode Tag</span>
                    </button>

                    {/* Logged Bags List */}
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Recently Logged Bags in Ward:
                      </div>
                      <div className="space-y-1.5">
                        {hospitalLoggedBags.map((bag) => (
                          <div key={bag.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <QrCode className="w-4 h-4 text-emerald-600" />
                              <span className="font-mono font-bold text-slate-900">{bag.id}</span>
                              <span className="text-slate-500 font-medium">({bag.ward})</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-emerald-700">{bag.weight}</span>
                              <span className="text-[10px] text-slate-400">{bag.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Persona 2: Authorized Collector */}
            {activeRoleTab === 'collector' && (
              <div className="space-y-8 animate-fade-in">
                {/* Collector Top KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Daily Stops</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">12 Hospitals</div>
                    <div className="text-[10px] text-sky-700 font-semibold">9 Completed &bull; 3 Pending</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Cargo Collected</div>
                    <div className="text-xl font-black text-sky-700 mt-0.5">482 kg</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Zero tare weight variance</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Cargo Temp</div>
                    <div className="text-xl font-black text-teal-700 mt-0.5">4.2&deg;C</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">&#10003; Cold-Chain Safe</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Geofenced GPS</div>
                    <div className="text-xl font-black text-emerald-700 mt-0.5">100% Locked</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Expressway corridor</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 space-y-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      Authorized Transporter & Fleet Driver Portal
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      Mobile Handover Verification & Dual-Scale Validation
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      A high-speed mobile interface for waste truck drivers to scan hospital bags, compare tare weights on certified vehicle load cells, 
                      and execute cryptographic custody handovers.
                    </p>

                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        <span>High-speed barcode scanner with weight mismatch alerts (&gt;2% variance flag)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        <span>Turn-by-turn navigation along approved pollution control board corridors</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        <span>Cryptographic custody handover signature at treatment plant gates</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleDemoLogin('collector')}
                        disabled={demoLoggingIn === 'collector'}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all inline-flex items-center space-x-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{demoLoggingIn === 'collector' ? 'Logging in...' : 'Launch Collector Demo'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Interactive Collector Scale Validator */}
                  <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-2">
                        <Scale className="w-4 h-4 text-sky-600" />
                        <span className="text-xs font-bold text-slate-800">Mobile Handover & Scale Validator</span>
                      </div>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                        Vehicle #MH-04-AX-5512
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Scheduled Stop:</span>
                        <span className="font-bold text-slate-900">Apex Multi-Speciality (Stop 10 of 12)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Manifest Ready:</span>
                        <span className="font-bold text-emerald-700">4 Bags (18.4 kg Total Consignment)</span>
                      </div>
                    </div>

                    {/* Interactive Scan Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCollectorScanned(true);
                        addToast('Bag #BMW-2024-8841 verified on vehicle load cell. Weight matched: 4.85 kg.', 'success');
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Scan className="w-4 h-4" />
                      <span>{collectorScanned ? '&#10003; Tare Weight Verified (4.85 kg)' : 'Scan Hospital Bag & Compare Tare Weight'}</span>
                    </button>

                    {/* Scale Verification Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Hospital Scale</div>
                          <div className="text-sm font-black text-slate-900 mt-0.5">4.85 kg</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Truck Load Cell</div>
                          <div className="text-sm font-black text-sky-700 mt-0.5">4.85 kg</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                        <span>Variance: <strong className="text-emerald-700 font-bold">&plusmn; 0.00 kg (Exact Match)</strong></span>
                        <span className="text-emerald-700 font-bold">&#10003; Dual Signature Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Persona 3: System Administrator & Regulator */}
            {activeRoleTab === 'admin' && (
              <div className="space-y-8 animate-fade-in">
                {/* Admin Top KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Affiliated Facilities</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">482 Hospitals</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">100% Real-time Sync</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Fleet Trucks</div>
                    <div className="text-xl font-black text-rose-700 mt-0.5">38 Active</div>
                    <div className="text-[10px] text-slate-500 font-semibold">All GNSS corridors locked</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Compliance Score</div>
                    <div className="text-xl font-black text-emerald-700 mt-0.5">99.98%</div>
                    <div className="text-[10px] text-slate-500 font-semibold">0 CPCB violation notices</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Uptime & Cluster</div>
                    <div className="text-xl font-black text-sky-700 mt-0.5">99.99%</div>
                    <div className="text-[10px] text-slate-500 font-semibold">MongoDB Atlas High Availability</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 space-y-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      System Administrator & Regulatory Oversight
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      Network-Wide Analytics & Central CPCB Audit Hub
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Authoritative command view across all hospital smart bins, collection contractors, and treatment plants. 
                      Enables state pollution control boards and health officers to inspect real-time chain of custody logs.
                    </p>

                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>Network-wide waste generation heatmaps & anomaly detection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>Live GPS fleet control center with route deviation flags</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>Automated annual report compiler for Pollution Control Board inspections</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleDemoLogin('admin')}
                        disabled={demoLoggingIn === 'admin'}
                        className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all inline-flex items-center space-x-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{demoLoggingIn === 'admin' ? 'Logging in...' : 'Launch Admin Demo'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Right: Interactive Central Network Radar & Manifest Generator */}
                  <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-bold text-slate-800">Regulatory Oversight & Audit Console</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        System Health: Optimal
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Total Traced</div>
                        <div className="text-base font-black text-slate-900 mt-0.5">1.4M+ kg</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Recycled (Red)</div>
                        <div className="text-base font-black text-emerald-700 mt-0.5">412,000 kg</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Anomalies</div>
                        <div className="text-base font-black text-slate-900 mt-0.5">0 Pending</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setManifestGenerated(true);
                        addToast('Annual Statutory Form II/IV Compliance Dossier compiled successfully!', 'success');
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center justify-center space-x-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{manifestGenerated ? '&#10003; CPCB Form II Manifest Dossier Ready' : 'Compile Annual CPCB Form II Report'}</span>
                    </button>

                    {manifestGenerated && (
                      <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1 animate-scale-in">
                        <div className="font-bold flex items-center justify-between">
                          <span>Certified Compliance Certificate #CPCB-2024-MH-AUDIT</span>
                          <span className="text-[10px] text-emerald-700 font-bold">&#10003; Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Mass balance verified for 482 hospitals. 0 manifest violations recorded. Ready for state pollution control board submission.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 9. 1-CLICK INTERACTIVE DEMO LAUNCHER */}
      <section id="demo-launch" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Interactive Test Drive
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            Explore MediTrackX in 1 Click
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Instant sandbox access with pre-populated medical waste records, real-time IoT feeds, and test collection runs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Card 1 - Hospital */}
          <div className="p-8 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-card transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hospital Staff</h3>
                <div className="text-xs text-slate-500">hospital@example.com</div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Log new hazardous bags, monitor department smart bin fill levels, and dispatch collection requests.
              </p>
            </div>
            <button
              onClick={() => handleDemoLogin('hospital')}
              disabled={!!demoLoggingIn}
              className="mt-6 w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-btn-emerald transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{demoLoggingIn === 'hospital' ? 'Signing in...' : 'Sign In as Hospital Staff'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 - Collector */}
          <div className="p-8 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-card transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bio Collector</h3>
                <div className="text-xs text-slate-500">collector@example.com</div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                View assigned hospital pickups, scan bag QR codes, verify weight, and route transit to treatment plants.
              </p>
            </div>
            <button
              onClick={() => handleDemoLogin('collector')}
              disabled={!!demoLoggingIn}
              className="mt-6 w-full py-3 rounded-xl font-bold text-xs text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{demoLoggingIn === 'collector' ? 'Signing in...' : 'Sign In as Collector'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 - Admin */}
          <div className="p-8 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-card transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">System Admin</h3>
                <div className="text-xs text-slate-500">admin@example.com</div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                Oversee entire facility network, review compliance reports, inspect live IoT bins, and track fleet telemetry.
              </p>
            </div>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={!!demoLoggingIn}
              className="mt-6 w-full py-3 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{demoLoggingIn === 'admin' ? 'Signing in...' : 'Sign In as Administrator'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 10. COMPLIANCE & REGULATORY STANDARDS STRIP */}
      <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <h3 className="text-lg font-bold text-emerald-400">
                Audited & Aligned with National Healthcare Standards
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                MediTrackX strictly adheres to the Ministry of Environment, Forest and Climate Change (MoEFCC) guidelines, 
                Central Pollution Control Board (CPCB) Bio-Medical Waste Management Rules 2016, and NABH Accreditation norms.
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-xs font-semibold text-slate-300">
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>CPCB Barcode Standard</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-teal-400" />
                <span>Encrypted Telemetry</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>NABH Standard Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left mb-12">
            
            {/* Col 1: Brand */}
            <div className="space-y-4">
              <Link
                to="/"
                onClick={handleLogoClick}
                className="flex items-center space-x-3 group cursor-pointer inline-flex focus:outline-none"
                title="Open Home Page"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-btn-emerald group-hover:scale-105 transition-transform duration-200">
                  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                    <rect x="8" y="2" width="4" height="16" rx="2" fill="white" />
                    <rect x="2" y="8" width="16" height="4" rx="2" fill="white" />
                    <circle cx="10" cy="10" r="2.5" fill="rgba(255,255,255,0.4)" />
                  </svg>
                </div>
                <div className="flex items-center space-x-0.5">
                  <span className="text-xl font-black text-white tracking-tight">MediTrack</span>
                  <span className="text-xl font-black text-emerald-400 tracking-tight">X</span>
                </div>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart Digital Platform for Biomedical Waste Collection, Segregation, and Traceability in Healthcare Facilities.
              </p>
              <div className="pt-2 text-xs text-slate-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All Core Services Operational</span>
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                Platform Modules
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/traceability" className="hover:text-emerald-400 transition-colors">Digital Traceability Search</Link></li>
                <li><Link to="/integrations/ai-classifier" className="hover:text-emerald-400 transition-colors">AI Waste Classifier</Link></li>
                <li><Link to="/integrations/iot-telemetry" className="hover:text-emerald-400 transition-colors">IoT Smart Bin Telemetry</Link></li>
                <li><Link to="/integrations/gps-fleet" className="hover:text-emerald-400 transition-colors">GPS Fleet Tracking</Link></li>
                <li><Link to="/integrations/robot-dispatch" className="hover:text-emerald-400 transition-colors">Automated AGV Dispatch</Link></li>
              </ul>
            </div>

            {/* Col 3: Portals */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                User Portals
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Healthcare Staff Portal</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Bio-Collector Mobile Station</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Central Administrator Console</Link></li>
                <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Facility Onboarding</Link></li>
              </ul>
            </div>

            {/* Col 4: Biohazard Emergency Hotline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
                Bio-Safety & Emergency
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center space-x-1">
                  <PhoneCall className="w-3.5 h-3.5 mr-1" />
                  <span>Bio-Spill Incident Response</span>
                </div>
                <div className="text-xs font-mono font-bold text-white">1800-BIO-SAFETY (Toll Free)</div>
                <div className="text-[10px] text-slate-500">24/7 Hazardous Material Hotline</div>
              </div>
              <div className="text-[11px] text-slate-500">
                Central Pollution Control Board Guidelines &copy; {new Date().getFullYear()} MediTrackX.
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              MediTrackX &bull; Smart Healthcare Waste Digital Infrastructure &bull; All Rights Reserved.
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <a href="#compliance" className="hover:text-slate-300">Privacy Policy</a>
              <a href="#compliance" className="hover:text-slate-300">CPCB Form II Docs</a>
              <a href="#compliance" className="hover:text-slate-300">API Documentation</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
