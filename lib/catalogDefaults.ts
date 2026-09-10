import {
  QuotationItem,
  DeliverableItem,
  CrewRequirement,
  StudioSettings,
  UserAccount,
} from '@/types';

export interface CatalogTemplate {
  standardRequirements: QuotationItem[];
  standardDeliverables: DeliverableItem[];
  standardCrew: CrewRequirement[];
  standardTerms: string[];
  defaultContactPerson: string;
  defaultContactPhone: string;
}

export const defaultCatalog: CatalogTemplate = {
  standardRequirements: [
    { id: 'req-01', name: 'Traditional Photography', price: '-', included: true },
    { id: 'req-02', name: 'Candid Photography', price: '-', included: true },
    { id: 'req-03', name: 'Cinematic Highlights', price: '-', included: true },
    { id: 'req-04', name: 'Traditional Videography', price: '-', included: true },
    { id: 'req-05', name: 'Drone Aerial Cinema Coverage', price: 'Rs 8,000 /-', included: false },
    { id: 'req-06', name: 'Pre-Wedding Coastal Beach Session', price: 'Rs 12,000 /-', included: false },
    { id: 'req-07', name: 'Roce / Haldi Evening Ritual Coverage', price: 'Rs 10,000 /-', included: false },
  ],

  standardDeliverables: [
    {
      id: 'del-01',
      item: 'Edited High-Resolution Photos',
      details: '*varies per event generally 500 - 800',
      included: true,
    },
    {
      id: 'del-02',
      item: 'Cinematic Highlight Video',
      details: '*duration 2-8 mintues',
      included: true,
    },
    {
      id: 'del-03',
      item: 'Full-Length Edited Video',
      details: '*covers the whole event',
      included: true,
    },
    {
      id: 'del-04',
      item: 'Premium Glossy & MATT Photo Album',
      details: '*35-40 pages',
      included: true,
    },
    {
      id: 'del-05',
      item: 'Complimentary : Couple photo frame',
      details: '*archival gallery frame included',
      included: true,
    },
    {
      id: 'del-06',
      item: 'Teaser Reel for Instagram (4K 9:16)',
      details: '*delivered within 48 hours of event',
      included: false,
    },
    {
      id: 'del-07',
      item: 'Mini Pocket Books for Parents (2 Copies)',
      details: '*20 pages soft-touch matte',
      included: false,
    },
  ],

  standardCrew: [
    { id: 'crew-01', role: 'Photographers', number: 2 },
    { id: 'crew-02', role: 'Videographers', number: 2 },
    { id: 'crew-03', role: 'Drone Pilots', number: 1 },
    { id: 'crew-04', role: 'Grip & Lighting Assistants', number: 1 },
  ],

  standardTerms: [
    'A 50% advance is required to confirm the booking. Dates are secured only after payment.',
    'Remaining balance must be cleared on or before the event date.',
    'Advance is non-refundable. Date changes are subject to availability.',
    'Final photos/videos will be delivered within 2-6 weeks.',
    'Travel And Accommodation Need To be Provided If Requested.',
    'Accommodation is not included in the above quotation and has to be provided by the client.',
    'We reserve the right to use content for portfolio and promotional purposes.',
    'In case of unforeseen issues, liability is limited to the amount paid.',
    'Delays from the client side may impact coverage. We are not responsible for reduced deliverables due to time loss.',
    'Additional Photos For Album Or Sheets Will Be Charged Additional.',
    'Photo Selection for the album done by the Client.',
    'Couple needs to provide a Hard Drive for the collection of RAW data, agency will not be liable for anykind of DATA LOSS after 6 months from the shoot date.',
  ],

  defaultContactPerson: 'DAN AUREL',
  defaultContactPhone: '+91 9380057445',
};

export const defaultStudioSettings: StudioSettings = {
  studioName: 'LUMINA',
  tagline: 'Wedding Cinemastory & Stills // Mangalore',
  city: 'Mangalore, Karnataka',
  hasGst: false,
  gstin: '',
  bankingDetails: {
    accountName: 'LUMINA ATELIER STUDIOS LLP',
    bankName: 'HDFC Bank Ltd',
    branch: 'Hampankatta Branch, Mangalore',
    accountNumber: '50200084920194',
    ifscCode: 'HDFC0000084',
    upiId: 'lumina.studios@hdfcbank',
  },
  contactPerson: 'DAN AUREL',
  contactPhone: '+91 9380057445',
  termsAndConditions: defaultCatalog.standardTerms,
  pdfThemeColor: 'sage',
};

export const defaultUsers: UserAccount[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'adminoflumina123',
    fullName: 'Studio Director Dan Aurel',
    role: 'ADMIN_DIRECTOR',
    canViewFinances: true,
    canAccessSettings: true,
    canEditQuotesAndOrders: true,
  },
  {
    id: 'usr-roshan',
    username: 'roshan',
    password: 'crewpass123',
    fullName: 'Roshan D’Silva (Lead 2nd Unit)',
    role: 'SECOND_SHOOTER',
    canViewFinances: false, // hidden finances
    canAccessSettings: false, // restricted settings
    canEditQuotesAndOrders: false, // restricted from editing finalized quotes
  },
  {
    id: 'usr-farooq',
    username: 'farooq',
    password: 'ditpass123',
    fullName: 'Farooq Mansoor (DIT & Colorist)',
    role: 'SECOND_SHOOTER',
    canViewFinances: false,
    canAccessSettings: false,
    canEditQuotesAndOrders: false,
  },
];
