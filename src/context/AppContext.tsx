import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserSession,
  UserRole,
  ComplaintTicket,
  ComplaintStatus,
  CampusBuilding,
  MaintenanceWorker,
  CampusHelpline,
  ComplaintCategory,
  UrgencyLevel,
} from '../types';
import {
  DEMO_USERS,
  CAMPUS_BUILDINGS,
  INITIAL_MAINTENANCE_WORKERS,
  CAMPUS_HELPLINES,
  INITIAL_COMPLAINT_TICKETS,
} from '../data/campusData';
import {
  getSupabaseConfig,
  getSupabaseClient,
  saveSupabaseConfig,
  clearSupabaseConfig,
  fetchTicketsFromSupabase,
  insertTicketToSupabase,
  updateTicketInSupabase,
  testSupabaseConnection,
  mapRowToTicket,
  mapTicketToRow,
  SupabaseConfig,
} from '../lib/supabase';

interface AppContextType {
  currentUser: UserSession | null;
  isAuthenticated: boolean;
  isAdminUnlocked: boolean;
  activeTab: 'map' | 'report' | 'track' | 'qr' | 'helplines' | 'admin';
  setActiveTab: (tab: 'map' | 'report' | 'track' | 'qr' | 'helplines' | 'admin') => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showAdminPasscodeModal: boolean;
  setShowAdminPasscodeModal: (show: boolean) => void;
  selectedBuildingForReport: CampusBuilding | null;
  setSelectedBuildingForReport: (building: CampusBuilding | null) => void;
  trackTicketQuery: string;
  setTrackTicketQuery: (query: string) => void;
  buildings: CampusBuilding[];
  maintenanceWorkers: MaintenanceWorker[];
  helplines: CampusHelpline[];
  tickets: ComplaintTicket[];
  login: (email: string, name: string, role: UserRole, identifier: string, department: string) => { success: boolean; error?: string };
  loginWithDemo: (role: 'student' | 'faculty' | 'admin') => void;
  logout: () => void;
  unlockAdmin: (passcode: string) => boolean;
  lockAdmin: () => void;
  createTicket: (data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    buildingId: string;
    floorOrWing: string;
    roomOrArea: string;
    urgency: UrgencyLevel;
    photoUrl?: string;
    reporterPhone?: string;
  }) => ComplaintTicket;
  updateTicketStatus: (
    ticketId: string,
    status: ComplaintStatus,
    note: string,
    assignedWorkerId?: string
  ) => void;
  resetDataToDefault: () => void;

  // Supabase Database Integration
  supabaseConfig: SupabaseConfig;
  isSupabaseConnected: boolean;
  isSupabaseSyncing: boolean;
  supabaseSyncError: string | null;
  saveSupabaseSettings: (url: string, key: string) => Promise<{ success: boolean; message: string; tableReady?: boolean }>;
  disconnectSupabase: () => void;
  refreshTicketsFromSupabase: () => Promise<void>;
  syncLocalTicketsToSupabase: () => Promise<{ success: boolean; count: number; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User state
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      if (localStorage.getItem('ouruni_logged_out') === 'true') {
        return null;
      }
      const saved = localStorage.getItem('ouruni_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('ouruni_admin_unlocked') === 'true';
  });

  // 2. Navigation
  const [activeTab, setActiveTab] = useState<'map' | 'report' | 'track' | 'qr' | 'helplines' | 'admin'>('map');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAdminPasscodeModal, setShowAdminPasscodeModal] = useState<boolean>(false);
  const [selectedBuildingForReport, setSelectedBuildingForReport] = useState<CampusBuilding | null>(null);
  const [trackTicketQuery, setTrackTicketQuery] = useState<string>('');

  // 3. Supabase state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getSupabaseConfig());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState<boolean>(false);
  const [supabaseSyncError, setSupabaseSyncError] = useState<string | null>(null);

  // 4. Tickets state
  const [tickets, setTickets] = useState<ComplaintTicket[]>(() => {
    try {
      const saved = localStorage.getItem('ouruni_tickets');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINT_TICKETS;
    } catch {
      return INITIAL_COMPLAINT_TICKETS;
    }
  });

  // 5. Workers & Helplines
  const [maintenanceWorkers, setMaintenanceWorkers] = useState<MaintenanceWorker[]>(() => {
    try {
      const saved = localStorage.getItem('ouruni_workers');
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_WORKERS;
    } catch {
      return INITIAL_MAINTENANCE_WORKERS;
    }
  });

  const buildings = CAMPUS_BUILDINGS;
  const helplines = CAMPUS_HELPLINES;

  // Persist tickets locally for offline / fallback
  useEffect(() => {
    localStorage.setItem('ouruni_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Persist user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ouruni_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ouruni_user');
    }
  }, [currentUser]);

  // Persist admin lock
  useEffect(() => {
    localStorage.setItem('ouruni_admin_unlocked', isAdminUnlocked ? 'true' : 'false');
  }, [isAdminUnlocked]);

  // Supabase initial load and real-time synchronization
  const refreshTicketsFromSupabase = useCallback(async () => {
    const config = getSupabaseConfig();
    if (!config.isConfigured) return;

    setIsSupabaseSyncing(true);
    setSupabaseSyncError(null);

    try {
      const { data, error } = await fetchTicketsFromSupabase();
      if (error) {
        setSupabaseSyncError(error);
        setIsSupabaseConnected(false);
      } else if (data) {
        setIsSupabaseConnected(true);
        if (data.length > 0) {
          setTickets(data);
        }
      }
    } catch (err: any) {
      setSupabaseSyncError(err?.message || 'Sync failed');
      setIsSupabaseConnected(false);
    } finally {
      setIsSupabaseSyncing(false);
    }
  }, []);

  // Set up real-time listener whenever Supabase is configured
  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseConfig(config);

    if (!config.isConfigured) {
      setIsSupabaseConnected(false);
      return;
    }

    refreshTicketsFromSupabase();

    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel('public:tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTicket = mapRowToTicket(payload.new);
            setTickets((prev) => {
              const exists = prev.some((t) => t.id === newTicket.id || t.ticketNumber === newTicket.ticketNumber);
              if (exists) {
                return prev.map((t) => (t.id === newTicket.id ? newTicket : t));
              }
              return [newTicket, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTicket = mapRowToTicket(payload.new);
            setTickets((prev) =>
              prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setTickets((prev) => prev.filter((t) => t.id !== deletedId));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSupabaseConnected(true);
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  }, [refreshTicketsFromSupabase]);

  // Login with domain check
  const login = (
    email: string,
    name: string,
    role: UserRole,
    identifier: string,
    department: string
  ): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@rnsit.ac.in')) {
      return {
        success: false,
        error: 'Access restricted! You must enter a valid RNSIT institutional email address ending in @rnsit.ac.in to prevent spam.',
      };
    }

    const newUser: UserSession = {
      email: trimmedEmail,
      name: name.trim() || (role === 'student' ? 'RNSIT Student' : 'RNSIT Faculty'),
      role,
      identifier: identifier.trim() || (role === 'student' ? '1RN22CS000' : 'Faculty'),
      department: department.trim() || 'General Academics',
      isVerified: true,
    };

    localStorage.removeItem('ouruni_logged_out');
    setCurrentUser(newUser);
    setShowAuthModal(false);
    return { success: true };
  };

  const loginWithDemo = (role: 'student' | 'faculty' | 'admin') => {
    localStorage.removeItem('ouruni_logged_out');
    const demo = DEMO_USERS[role];
    setCurrentUser(demo);
    if (role === 'admin') {
      setIsAdminUnlocked(true);
    }
    setShowAuthModal(false);
  };

  const logout = () => {
    localStorage.setItem('ouruni_logged_out', 'true');
    localStorage.removeItem('ouruni_user');
    setCurrentUser(null);
    setIsAdminUnlocked(false);
  };

  const unlockAdmin = (passcode: string): boolean => {
    if (passcode.trim().toLowerCase() === 'rnsit2026') {
      setIsAdminUnlocked(true);
      if (!currentUser || currentUser.role !== 'admin') {
        setCurrentUser(DEMO_USERS.admin);
      }
      setShowAdminPasscodeModal(false);
      setActiveTab('admin');
      return true;
    }
    return false;
  };

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
    setActiveTab('map');
  };

  const createTicket = (data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    buildingId: string;
    floorOrWing: string;
    roomOrArea: string;
    urgency: UrgencyLevel;
    photoUrl?: string;
    reporterPhone?: string;
  }): ComplaintTicket => {
    const bldg = buildings.find((b) => b.id === data.buildingId);
    const count = tickets.length + 1045;
    const ticketNum = `RNS-${count}`;
    const now = new Date().toISOString();

    const newTicket: ComplaintTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: ticketNum,
      title: data.title,
      description: data.description,
      category: data.category,
      buildingId: data.buildingId,
      buildingName: bldg ? bldg.name : 'RNSIT Campus',
      floorOrWing: data.floorOrWing,
      roomOrArea: data.roomOrArea,
      urgency: data.urgency,
      status: 'submitted',
      reporterEmail: currentUser?.email || 'verified.guest@rnsit.ac.in',
      reporterName: currentUser?.name || 'RNSIT Member',
      reporterRole: currentUser?.role || 'student',
      reporterIdentifier: currentUser?.identifier || '1RN22CS045',
      reporterPhone: data.reporterPhone || currentUser?.phone,
      photoUrl: data.photoUrl,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: now,
          status: 'submitted',
          actorName: currentUser ? `${currentUser.name} (${currentUser.role})` : 'RNSIT User',
          actorRole: currentUser?.role || 'student',
          note: `Issue submitted for ${bldg?.name || 'Campus'} - ${data.roomOrArea}.`,
        },
      ],
    };

    // Optimistic local update
    setTickets((prev) => [newTicket, ...prev]);

    // Asynchronously sync to Supabase if configured
    if (supabaseConfig.isConfigured) {
      insertTicketToSupabase(newTicket).catch((err) => {
        console.warn('Supabase sync background error on create:', err);
      });
    }

    return newTicket;
  };

  const updateTicketStatus = (
    ticketId: string,
    status: ComplaintStatus,
    note: string,
    assignedWorkerId?: string
  ) => {
    const now = new Date().toISOString();
    const worker = maintenanceWorkers.find((w) => w.id === assignedWorkerId);

    let updatedTicketToPersist: ComplaintTicket | null = null;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;

        const updatedHistory = [
          ...t.history,
          {
            id: `h-${Date.now()}`,
            timestamp: now,
            status,
            actorName: currentUser?.name || 'Estate Maintenance Admin',
            actorRole: 'admin',
            note: note || `Status updated to ${status}.`,
          },
        ];

        const updated: ComplaintTicket = {
          ...t,
          status,
          updatedAt: now,
          resolvedAt: status === 'resolved' ? now : t.resolvedAt,
          assignedWorkerId: assignedWorkerId !== undefined ? assignedWorkerId : t.assignedWorkerId,
          assignedWorkerName: worker ? worker.name : t.assignedWorkerName,
          assignedWorkerSpecialty: worker ? worker.specialty : t.assignedWorkerSpecialty,
          assignedWorkerPhone: worker ? worker.phone : t.assignedWorkerPhone,
          assignedWorkerIntercom: worker ? worker.intercom : t.assignedWorkerIntercom,
          adminNotes: note ? `${note} (Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : t.adminNotes,
          history: updatedHistory,
        };

        updatedTicketToPersist = updated;
        return updated;
      })
    );

    // Update worker ticket counts
    if (assignedWorkerId) {
      setMaintenanceWorkers((prev) =>
        prev.map((w) => {
          if (w.id === assignedWorkerId) {
            return { ...w, activeTicketsCount: w.activeTicketsCount + 1, status: 'on_site' };
          }
          return w;
        })
      );
    }

    // Asynchronously push update to Supabase
    if (supabaseConfig.isConfigured && updatedTicketToPersist) {
      updateTicketInSupabase(updatedTicketToPersist).catch((err) => {
        console.warn('Supabase sync background error on update:', err);
      });
    }
  };

  const saveSupabaseSettings = async (url: string, key: string): Promise<{ success: boolean; message: string; tableReady?: boolean }> => {
    const testResult = await testSupabaseConnection(url, key);
    if (!testResult.success) {
      return testResult;
    }

    saveSupabaseConfig(url, key);
    const newConfig = getSupabaseConfig();
    setSupabaseConfig(newConfig);
    setIsSupabaseConnected(true);

    // Attempt to pull latest tickets
    await refreshTicketsFromSupabase();

    return testResult;
  };

  const disconnectSupabase = () => {
    clearSupabaseConfig();
    setSupabaseConfig(getSupabaseConfig());
    setIsSupabaseConnected(false);
    setSupabaseSyncError(null);
  };

  const syncLocalTicketsToSupabase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, count: 0, error: 'Supabase client is not connected' };
    }

    try {
      setIsSupabaseSyncing(true);
      const rows = tickets.map(mapTicketToRow);
      const { error } = await client.from('tickets').upsert(rows, { onConflict: 'id' });

      if (error) {
        return { success: false, count: 0, error: error.message };
      }

      return { success: true, count: rows.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Sync error' };
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  const resetDataToDefault = () => {
    localStorage.removeItem('ouruni_tickets');
    localStorage.removeItem('ouruni_user');
    localStorage.removeItem('ouruni_admin_unlocked');
    localStorage.removeItem('ouruni_workers');
    localStorage.removeItem('ouruni_logged_out');
    setTickets(INITIAL_COMPLAINT_TICKETS);
    setCurrentUser(null);
    setIsAdminUnlocked(false);
    setMaintenanceWorkers(INITIAL_MAINTENANCE_WORKERS);
    setActiveTab('map');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdminUnlocked,
        activeTab,
        setActiveTab,
        showAuthModal,
        setShowAuthModal,
        showAdminPasscodeModal,
        setShowAdminPasscodeModal,
        selectedBuildingForReport,
        setSelectedBuildingForReport,
        trackTicketQuery,
        setTrackTicketQuery,
        buildings,
        maintenanceWorkers,
        helplines,
        tickets,
        login,
        loginWithDemo,
        logout,
        unlockAdmin,
        lockAdmin,
        createTicket,
        updateTicketStatus,
        resetDataToDefault,
        supabaseConfig,
        isSupabaseConnected,
        isSupabaseSyncing,
        supabaseSyncError,
        saveSupabaseSettings,
        disconnectSupabase,
        refreshTicketsFromSupabase,
        syncLocalTicketsToSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
