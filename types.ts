export type ClientTier = 
  | 'HAUTE_COUTURE' 
  | 'COMMERCIAL_LUXURY' 
  | 'EDITORIAL_PRESS' 
  | 'PRIVATE_ESTATE';

export interface Client {
  id: string;
  name: string;
  company: string;
  brandTier: ClientTier;
  email: string;
  phone?: string;
  avatarUrl?: string;
  city: string;
  totalBilled: number;
  totalPaid: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'LEAD';
}

export type ShootType =
  | 'Haute Couture Editorial'
  | 'Architectural Digest Feature'
  | 'Commercial Campaign'
  | 'High Jewelry Lookbook'
  | 'Parisian Runway Motion'
  | 'Automotive Avant-Garde';

export type ShootStatus = 
  | 'CONFIRMED' 
  | 'IN_PRODUCTION' 
  | 'POST_PROCESSING' 
  | 'DELIVERED' 
  | 'TENTATIVE';

export interface ProductionCrewMember {
  role: string;
  name: string;
  phone?: string;
  initials: string;
}

export interface ShootBooking {
  id: string;
  shootCode: string; // e.g. "LUM-2026-09A"
  title: string;
  client: Client;
  type: ShootType;
  status: ShootStatus;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  callTime: string;
  location: {
    name: string;
    city: string;
    coordinates: string;
    accessCode?: string;
  };
  productionTeam: ProductionCrewMember[];
  shotListTotal: number;
  shotListCompleted: number;
  financialSummary: {
    totalFee: number;
    retainerPaid: number;
    balanceDue: number;
    currency: string;
  };
  scheduleTimeline: Array<{
    time: string;
    activity: string;
    lead: string;
  }>;
  gearAllocated: string[];
  editorialNotes: string;
}

export type LedgerCategory =
  | 'CLIENT_RECEIVABLE'
  | 'PRODUCTION_EXPENSE'
  | 'GEAR_RENTAL'
  | 'STUDIO_OVERHEAD'
  | 'TALENT_PAYOUT'
  | 'LOCATION_PERMIT'
  | 'POST_COLOR_GRADE';

export type LedgerStatus = 'CLEARED' | 'PENDING' | 'OVERDUE' | 'DISPUTED';

export interface LedgerEntry {
  id: string;
  transactionRef: string;
  date: string;
  description: string;
  category: LedgerCategory;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  counterparty: string; // Client name or Vendor name
  relatedShootCode?: string;
  status: LedgerStatus;
  paymentMethod?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  brand: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  productionFeeTax: number;
  totalAmount: number;
  balanceDue: number;
  status: 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE';
}

export interface KPISummary {
  netMargins: {
    amount: number;
    percentage: number;
    changePct: number;
  };
  cashFlow: {
    current: number;
    monthInflow: number;
    monthOutflow: number;
  };
  confirmedShoots: {
    count: number;
    activeProductionDays: number;
  };
  unpaidRetainers: {
    total: number;
    count: number;
  };
}

export type ViewModule = 
  | 'overview' 
  | 'calendar' 
  | 'billing' 
  | 'ledger' 
  | 'settings' 
  | 'access';

export type UserRole = 'ADMIN_DIRECTOR' | 'SECOND_SHOOTER' | 'PRODUCER';
