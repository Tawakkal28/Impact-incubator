export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  identifier: string; // USN for student (e.g., 1RN22CS045), Department for faculty (e.g., CSE)
  department: string;
  phone?: string;
  isVerified: boolean;
}

export type ComplaintCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'IT_Connectivity'
  | 'Lab_Equipment'
  | 'Classroom_Facility'
  | 'Sanitation'
  | 'Civil_Structural'
  | 'Other';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintStatus = 'submitted' | 'assigned' | 'in_progress' | 'resolved';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  status: ComplaintStatus;
  actorName: string;
  actorRole: string;
  note: string;
}

export interface ComplaintTicket {
  id: string;
  ticketNumber: string; // e.g. RNS-1042
  title: string;
  description: string;
  category: ComplaintCategory;
  buildingId: string;
  buildingName: string;
  floorOrWing: string;
  roomOrArea: string;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  reporterEmail: string;
  reporterName: string;
  reporterRole: UserRole;
  reporterIdentifier: string; // USN or Dept
  reporterPhone?: string;
  photoUrl?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedWorkerSpecialty?: string;
  assignedWorkerPhone?: string;
  assignedWorkerIntercom?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  history: AuditLogEntry[];
}

export interface CampusBuilding {
  id: string;
  name: string;
  shortCode: string;
  zone: 'Academic' | 'Laboratories' | 'Administrative' | 'Hostels' | 'Amenities' | 'Sports';
  departments: string[];
  floors: number;
  svgCoordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mapCoords?: {
    left: number;
    top: number;
    width: number;
    height: number;
    pinX: number;
    pinY: number;
  };
  description: string;
  commonAreas: string[];
  qrCodeTag: string;
}

export interface MaintenanceWorker {
  id: string;
  name: string;
  specialty: 'Plumber' | 'Electrician' | 'IT_Network' | 'Carpenter' | 'Sanitation_Supervisor' | 'General_Technician';
  phone: string;
  intercom: string;
  room: string;
  shiftHours: string;
  status: 'available' | 'on_site' | 'off_duty';
  activeTicketsCount: number;
}

export interface CampusHelpline {
  id: string;
  title: string;
  department: string;
  number: string;
  intercom: string;
  contactPerson: string;
  hours: string;
  isEmergency: boolean;
}
