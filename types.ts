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
  quotationId?: string;
  enquiryId?: string;
  deliveryStage?: DeliveryStage;
  hardDriveReceived?: boolean;
  clientSelectionDone?: boolean;
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

export type DeliveryStage =
  | 'RAW_INGESTED'
  | 'SELECTION_PENDING'
  | 'EDITING_IN_PROGRESS'
  | 'ALBUM_DESIGN'
  | 'DELIVERED'
  | 'COMPLETED';

export interface QuotationItem {
  id: string;
  name: string;
  price?: string | number;
  included: boolean;
}

export interface DeliverableItem {
  id: string;
  item: string;
  details: string;
  included: boolean;
}

export interface CrewRequirement {
  id: string;
  role: string;
  number: number;
}

export type QuotationStatus = 
  | 'DRAFT' 
  | 'SENT' 
  | 'ACCEPTED' 
  | 'CONVERTED' 
  | 'EXPIRED';

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. "Q NO. 07"
  date: string; // e.g. "6 August , 2026"
  clientName: string;
  clientCity: string;
  clientPhone?: string;
  clientEmail?: string;
  packageTitle: string; // e.g. "PACKAGE"
  requirements: QuotationItem[];
  deliverables: DeliverableItem[];
  crewAllocation: CrewRequirement[];
  termsAndConditions: string[];
  totalPrice: number; // e.g. 90000
  advancePercentage: number; // default 50
  status: QuotationStatus;
  enquiryId?: string;
  bookingId?: string;
  contactPerson: string; // e.g. "REUBEN SERRAO"
  contactPhone: string; // e.g. "+91 9380057445"
}

export type EnquiryStatus = 'NEW' | 'QUOTED' | 'CONVERTED' | 'ARCHIVED';

export interface Enquiry {
  id: string;
  enquiryNumber: string; // e.g. "ENQ-2026-104"
  clientName: string;
  phone: string;
  email: string;
  city: string;
  eventDate: string;
  eventType: string;
  estimatedBudget: number;
  status: EnquiryStatus;
  notes?: string;
  quotationId?: string;
  createdAt: string;
}

export type ViewModule = 
  | 'overview' 
  | 'quotations'
  | 'calendar' 
  | 'billing' 
  | 'ledger' 
  | 'settings' 
  | 'access';

export type UserRole = 'ADMIN_DIRECTOR' | 'SECOND_SHOOTER' | 'PRODUCER';

export type PDFThemeColor = 'sage' | 'monochrome' | 'sand_gold' | 'terracotta';

export interface BankingDetails {
  accountName: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
}

export interface StudioSettings {
  studioName: string;
  tagline: string;
  city: string;
  hasGst?: boolean;
  gstin?: string;
  bankingDetails: BankingDetails;
  contactPerson: string;
  contactPhone: string;
  termsAndConditions: string[];
  pdfThemeColor: PDFThemeColor;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string; // Stored client-side for bespoke studio OS role credentials
  fullName: string;
  role: UserRole;
  canViewFinances: boolean; // Selective access: hides ledger & revenues if false
  canAccessSettings: boolean; // Selective access: hides studio parameters if false
  canEditQuotesAndOrders: boolean; // Selective access: read-only quote/order access if false
  canEditLedger: boolean; // Selective access: can edit/modify dual ledger transactions
}
