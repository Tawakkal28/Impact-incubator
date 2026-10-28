import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ComplaintTicket, ComplaintStatus, ComplaintCategory, UrgencyLevel, UserRole } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'custom' | 'none';
}

const STORAGE_KEY_URL = 'ouruni_supabase_url';
const STORAGE_KEY_KEY = 'ouruni_supabase_anon_key';

export const SUPABASE_SCHEMA_SQL = `-- RNSIT Campus Maintenance System - Supabase Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  building_id TEXT NOT NULL,
  building_name TEXT NOT NULL,
  floor_or_wing TEXT NOT NULL,
  room_or_area TEXT NOT NULL,
  urgency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  reporter_email TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reporter_role TEXT NOT NULL,
  reporter_identifier TEXT NOT NULL,
  reporter_phone TEXT,
  photo_url TEXT,
  assigned_worker_id TEXT,
  assigned_worker_name TEXT,
  assigned_worker_specialty TEXT,
  assigned_worker_phone TEXT,
  assigned_worker_intercom TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  history JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 2. Create index on ticket_number and status
CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.tickets (ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_building ON public.tickets (building_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 4. Policies (allow access for campus users)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tickets' AND policyname = 'Public read tickets') THEN
    CREATE POLICY "Public read tickets" ON public.tickets FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tickets' AND policyname = 'Public insert tickets') THEN
    CREATE POLICY "Public insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tickets' AND policyname = 'Public update tickets') THEN
    CREATE POLICY "Public update tickets" ON public.tickets FOR UPDATE USING (true);
  END IF;
END $$;

-- 5. Enable Realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
`;

export function normalizeSupabaseUrl(inputUrl: string): string {
  if (!inputUrl) return '';
  let clean = inputUrl.trim().replace(/^["']|["']$/g, '');

  const dashboardMatch = clean.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  if (/^[a-zA-Z0-9_-]{12,32}$/.test(clean)) {
    return `https://${clean}.supabase.co`;
  }

  clean = clean.replace(/\/rest\/v1\/?$/i, '');
  clean = clean.replace(/\/+$/, '');

  if (!clean.startsWith('http://') && !clean.startsWith('https://') && clean.includes('.supabase.co')) {
    clean = `https://${clean}`;
  }

  return clean;
}

export function normalizeSupabaseKey(inputKey: string): string {
  if (!inputKey) return '';
  return inputKey.trim().replace(/^["']|["']$/g, '');
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '');
  const envKey = normalizeSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY || '');

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  const customUrl = normalizeSupabaseUrl(localStorage.getItem(STORAGE_KEY_URL) || '');
  const customKey = normalizeSupabaseKey(localStorage.getItem(STORAGE_KEY_KEY) || '');

  if (customUrl && customKey) {
    return {
      url: customUrl,
      anonKey: customKey,
      isConfigured: true,
      source: 'custom',
    };
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  const clientKey = `${config.url}_${config.anonKey}`;
  if (cachedClient && lastClientKey === clientKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
      },
    });
    lastClientKey = clientKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = normalizeSupabaseKey(anonKey);
  localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
  localStorage.setItem(STORAGE_KEY_KEY, cleanKey);
  cachedClient = null;
  lastClientKey = '';
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
  lastClientKey = '';
}

export function mapRowToTicket(row: any): ComplaintTicket {
  return {
    id: row.id,
    ticketNumber: row.ticket_number || row.ticketNumber,
    title: row.title,
    description: row.description,
    category: row.category as ComplaintCategory,
    buildingId: row.building_id || row.buildingId,
    buildingName: row.building_name || row.buildingName,
    floorOrWing: row.floor_or_wing || row.floorOrWing,
    roomOrArea: row.room_or_area || row.roomOrArea,
    urgency: row.urgency as UrgencyLevel,
    status: row.status as ComplaintStatus,
    reporterEmail: row.reporter_email || row.reporterEmail,
    reporterName: row.reporter_name || row.reporterName,
    reporterRole: (row.reporter_role || row.reporterRole) as UserRole,
    reporterIdentifier: row.reporter_identifier || row.reporterIdentifier,
    reporterPhone: row.reporter_phone || row.reporterPhone,
    photoUrl: row.photo_url || row.photoUrl,
    assignedWorkerId: row.assigned_worker_id || row.assignedWorkerId,
    assignedWorkerName: row.assigned_worker_name || row.assignedWorkerName,
    assignedWorkerSpecialty: row.assigned_worker_specialty || row.assignedWorkerSpecialty,
    assignedWorkerPhone: row.assigned_worker_phone || row.assignedWorkerPhone,
    assignedWorkerIntercom: row.assigned_worker_intercom || row.assignedWorkerIntercom,
    adminNotes: row.admin_notes || row.adminNotes,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
    resolvedAt: row.resolved_at || row.resolvedAt,
    history: Array.isArray(row.history) ? row.history : [],
  };
}

export function mapTicketToRow(ticket: ComplaintTicket): any {
  return {
    id: ticket.id,
    ticket_number: ticket.ticketNumber,
    title: ticket.title,
    description: ticket.description,
    category: ticket.category,
    building_id: ticket.buildingId,
    building_name: ticket.buildingName,
    floor_or_wing: ticket.floorOrWing,
    room_or_area: ticket.roomOrArea,
    urgency: ticket.urgency,
    status: ticket.status,
    reporter_email: ticket.reporterEmail,
    reporter_name: ticket.reporterName,
    reporter_role: ticket.reporterRole,
    reporter_identifier: ticket.reporterIdentifier,
    reporter_phone: ticket.reporterPhone || null,
    photo_url: ticket.photoUrl || null,
    assigned_worker_id: ticket.assignedWorkerId || null,
    assigned_worker_name: ticket.assignedWorkerName || null,
    assigned_worker_specialty: ticket.assignedWorkerSpecialty || null,
    assigned_worker_phone: ticket.assignedWorkerPhone || null,
    assigned_worker_intercom: ticket.assignedWorkerIntercom || null,
    admin_notes: ticket.adminNotes || null,
    created_at: ticket.createdAt,
    updated_at: ticket.updatedAt,
    resolved_at: ticket.resolvedAt || null,
    history: ticket.history || [],
  };
}

export async function fetchTicketsFromSupabase(): Promise<{ data: ComplaintTicket[] | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Supabase client not configured' };
  }

  try {
    const { data, error } = await client
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    const tickets = (data || []).map(mapRowToTicket);
    return { data: tickets, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Unknown network error' };
  }
}

export async function insertTicketToSupabase(ticket: ComplaintTicket): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const row = mapTicketToRow(ticket);
    const { error } = await client.from('tickets').insert([row]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error inserting ticket' };
  }
}

export async function updateTicketInSupabase(ticket: ComplaintTicket): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const row = mapTicketToRow(ticket);
    const { error } = await client.from('tickets').update(row).eq('id', ticket.id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error updating ticket' };
  }
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string; tableReady?: boolean }> {
  let client: SupabaseClient;

  if (url && key) {
    try {
      client = createClient(url, key);
    } catch (e: any) {
      return { success: false, message: `Invalid URL or format: ${e.message}` };
    }
  } else {
    const current = getSupabaseClient();
    if (!current) {
      return { success: false, message: 'Supabase credentials not configured' };
    }
    client = current;
  }

  try {
    // Check if tickets table is accessible
    const { data, error } = await client.from('tickets').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('relation "public.tickets" does not exist')) {
        return {
          success: true,
          tableReady: false,
          message: 'Connected to Supabase project successfully! Note: Table "tickets" does not exist yet. Please execute the provided SQL setup script in your Supabase SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Connected to Supabase, but encountered error: ${error.message} (${error.code})`,
      };
    }
    return {
      success: true,
      tableReady: true,
      message: 'Connection verified! "tickets" table is live and active in Supabase PostgreSQL.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect: ${err.message || 'Network error'}`,
    };
  }
}
