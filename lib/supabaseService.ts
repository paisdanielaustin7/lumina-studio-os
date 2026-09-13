import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  UserAccount,
  StudioSettings,
  Quotation,
  Enquiry,
  ShootBooking,
  LedgerEntry,
  Invoice,
} from '@/types';

// =========================================================================
// 1. FETCH OPERATIONS
// =========================================================================

export async function fetchUsersFromCloud(): Promise<UserAccount[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('lumina_users').select('*');
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      username: row.username,
      password: row.password,
      fullName: row.full_name,
      role: row.role,
      canViewFinances: row.can_view_finances,
      canAccessSettings: row.can_access_settings,
      canEditQuotesAndOrders: row.can_edit_quotes_and_orders,
      canEditLedger: row.can_edit_ledger,
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch users:', err);
    return null;
  }
}

export async function fetchSettingsFromCloud(): Promise<StudioSettings | null> {
  if (!supabase || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('lumina_settings')
      .select('*')
      .eq('id', 'studio_settings')
      .single();
    if (error) return null;
    if (!data) return null;

    return {
      studioName: data.studio_name,
      tagline: data.tagline,
      city: data.city,
      hasGst: data.has_gst,
      gstin: data.gstin,
      bankingDetails: data.banking_details,
      contactPerson: data.contact_person,
      contactPhone: data.contact_phone,
      termsAndConditions: data.terms_and_conditions,
      pdfThemeColor: data.pdf_theme_color,
      customPalettes: Array.isArray(data.custom_palettes) ? data.custom_palettes : [],
      crewRoster: Array.isArray(data.crew_roster) && data.crew_roster.length > 0 ? data.crew_roster : undefined,
      uiTheme: data.ui_theme || 'slate',
      packageRequirements: Array.isArray(data.package_requirements) && data.package_requirements.length > 0 ? data.package_requirements : undefined,
      packageDeliverables: Array.isArray(data.package_deliverables) && data.package_deliverables.length > 0 ? data.package_deliverables : undefined,
    };
  } catch (err) {
    console.warn('[Supabase] Failed to fetch settings:', err);
    return null;
  }
}

export async function fetchQuotationsFromCloud(): Promise<Quotation[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('lumina_quotations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      quotationNumber: row.quotation_number,
      date: row.date,
      clientName: row.client_name,
      clientCity: row.client_city,
      clientPhone: row.client_phone || '',
      clientEmail: row.client_email || '',
      packageTitle: row.package_title,
      requirements: row.requirements || [],
      deliverables: row.deliverables || [],
      crewAllocation: row.crew_allocation || [],
      termsAndConditions: row.terms_and_conditions || [],
      totalPrice: Number(row.total_price),
      advancePercentage: Number(row.advance_percentage || 50),
      status: row.status,
      enquiryId: row.enquiry_id,
      bookingId: row.booking_id,
      contactPerson: row.contact_person || '',
      contactPhone: row.contact_phone || '',
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch quotations:', err);
    return null;
  }
}

export async function fetchEnquiriesFromCloud(): Promise<Enquiry[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('lumina_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      enquiryNumber: row.enquiry_number,
      clientName: row.client_name,
      phone: row.phone,
      email: row.email,
      city: row.city,
      eventDate: row.event_date,
      eventType: row.event_type,
      estimatedBudget: Number(row.estimated_budget),
      status: row.status,
      notes: row.notes,
      quotationId: row.quotation_id,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch enquiries:', err);
    return null;
  }
}

export async function fetchBookingsFromCloud(): Promise<ShootBooking[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('lumina_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      shootCode: row.shoot_code,
      title: row.title,
      client: row.client,
      type: row.type,
      status: row.status,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      callTime: row.call_time,
      location: row.location,
      productionTeam: row.production_team || [],
      shotListTotal: row.shot_list_total || 0,
      shotListCompleted: row.shot_list_completed || 0,
      financialSummary: row.financial_summary,
      scheduleTimeline: row.schedule_timeline || [],
      gearAllocated: row.gear_allocated || [],
      editorialNotes: row.editorial_notes || '',
      quotationId: row.quotation_id,
      enquiryId: row.enquiry_id,
      deliveryStage: row.delivery_stage,
      hardDriveReceived: row.hard_drive_received,
      clientSelectionDone: row.client_selection_done,
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch bookings:', err);
    return null;
  }
}

export async function fetchLedgerFromCloud(): Promise<LedgerEntry[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('lumina_ledger')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      transactionRef: row.transaction_ref,
      date: row.date,
      description: row.description,
      category: row.category,
      type: row.type,
      amount: Number(row.amount),
      counterparty: row.counterparty,
      relatedShootCode: row.related_shoot_code,
      status: row.status,
      paymentMethod: row.payment_method,
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch ledger:', err);
    return null;
  }
}

export async function fetchInvoicesFromCloud(): Promise<Invoice[] | null> {
  if (!supabase || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('lumina_invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      clientId: row.client_id,
      clientName: row.client_name,
      brand: row.brand,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      items: row.items || [],
      subtotal: Number(row.subtotal),
      productionFeeTax: Number(row.production_fee_tax || 0),
      totalAmount: Number(row.total_amount),
      balanceDue: Number(row.balance_due),
      status: row.status,
      quotationId: row.quotation_id || undefined,
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch invoices:', err);
    return null;
  }
}

// =========================================================================
// 2. SYNC / WRITE OPERATIONS
// =========================================================================

export async function syncUserToCloud(user: UserAccount): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('lumina_users').upsert(
      {
        id: user.id,
        username: user.username.trim().toLowerCase(),
        password: user.password,
        full_name: user.fullName,
        role: user.role,
        can_view_finances: user.canViewFinances,
        can_access_settings: user.canAccessSettings,
        can_edit_quotes_and_orders: user.canEditQuotesAndOrders,
        can_edit_ledger: user.canEditLedger,
      },
      { onConflict: 'username' }
    );
    if (error) {
      console.error('[Supabase] syncUserToCloud error:', error);
    }
  } catch (e) {
    console.error('[Supabase] syncUserToCloud error:', e);
  }
}

export async function deleteUserFromCloud(userId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    await supabase.from('lumina_users').delete().eq('id', userId);
  } catch (e) {
    console.error('[Supabase] deleteUserFromCloud error:', e);
  }
}

export async function syncSettingsToCloud(settings: StudioSettings): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    const payload: any = {
      id: 'studio_settings',
      studio_name: settings.studioName,
      tagline: settings.tagline,
      city: settings.city,
      has_gst: settings.hasGst,
      gstin: settings.gstin || '',
      banking_details: settings.bankingDetails,
      contact_person: settings.contactPerson,
      contact_phone: settings.contactPhone,
      terms_and_conditions: settings.termsAndConditions,
      pdf_theme_color: settings.pdfThemeColor,
      custom_palettes: settings.customPalettes || [],
      crew_roster: settings.crewRoster || [],
      ui_theme: settings.uiTheme || 'slate',
      package_requirements: settings.packageRequirements || [],
      package_deliverables: settings.packageDeliverables || [],
      updated_at: new Date().toISOString(),
    };

    let { error } = await supabase.from('lumina_settings').upsert(payload);
    if (error) {
      console.warn('[Supabase] syncSettingsToCloud column warning:', error.message);
      const newerColumns = ['crew_roster', 'ui_theme', 'package_requirements', 'package_deliverables', 'custom_palettes'];
      for (const col of newerColumns) {
        if (error?.message?.toLowerCase().includes(col)) {
          delete payload[col];
          const retry = await supabase.from('lumina_settings').upsert(payload);
          error = retry.error;
        }
      }
      if (error && error.message?.toLowerCase().includes('column')) {
        for (const col of newerColumns) {
          delete payload[col];
        }
        await supabase.from('lumina_settings').upsert(payload);
      }
    }
  } catch (e) {
    console.error('[Supabase] syncSettingsToCloud error:', e);
  }
}

export async function syncQuotationToCloud(quote: Quotation): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    await supabase.from('lumina_quotations').upsert({
      id: quote.id,
      quotation_number: quote.quotationNumber,
      date: quote.date,
      client_name: quote.clientName,
      client_city: quote.clientCity,
      client_phone: quote.clientPhone || '',
      client_email: quote.clientEmail || '',
      package_title: quote.packageTitle,
      requirements: quote.requirements,
      deliverables: quote.deliverables,
      crew_allocation: quote.crewAllocation,
      terms_and_conditions: quote.termsAndConditions,
      total_price: quote.totalPrice,
      advance_percentage: quote.advancePercentage,
      status: quote.status,
      enquiry_id: quote.enquiryId || null,
      booking_id: quote.bookingId || null,
      contact_person: quote.contactPerson,
      contact_phone: quote.contactPhone,
    });
  } catch (e) {
    console.error('[Supabase] syncQuotationToCloud error:', e);
  }
}

export async function syncEnquiryToCloud(enq: Enquiry): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    await supabase.from('lumina_enquiries').upsert({
      id: enq.id,
      enquiry_number: enq.enquiryNumber,
      client_name: enq.clientName,
      phone: enq.phone,
      email: enq.email,
      city: enq.city,
      event_date: enq.eventDate,
      event_type: enq.eventType,
      estimated_budget: enq.estimatedBudget,
      status: enq.status,
      notes: enq.notes || '',
      quotation_id: enq.quotationId || null,
    });
  } catch (e) {
    console.error('[Supabase] syncEnquiryToCloud error:', e);
  }
}

export async function syncBookingToCloud(booking: ShootBooking): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    await supabase.from('lumina_bookings').upsert({
      id: booking.id,
      shoot_code: booking.shootCode,
      title: booking.title,
      client: booking.client,
      type: booking.type,
      status: booking.status,
      date: booking.date,
      start_time: booking.startTime,
      end_time: booking.endTime,
      call_time: booking.callTime,
      location: booking.location,
      production_team: booking.productionTeam,
      shot_list_total: booking.shotListTotal,
      shot_list_completed: booking.shotListCompleted,
      financial_summary: booking.financialSummary,
      schedule_timeline: booking.scheduleTimeline,
      gear_allocated: booking.gearAllocated,
      editorial_notes: booking.editorialNotes,
      quotation_id: booking.quotationId || null,
      enquiry_id: booking.enquiryId || null,
      delivery_stage: booking.deliveryStage,
      hard_drive_received: booking.hardDriveReceived,
      client_selection_done: booking.clientSelectionDone,
    });
  } catch (e) {
    console.error('[Supabase] syncBookingToCloud error:', e);
  }
}

export async function syncLedgerEntryToCloud(entry: LedgerEntry): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    await supabase.from('lumina_ledger').upsert({
      id: entry.id,
      transaction_ref: entry.transactionRef,
      date: entry.date,
      description: entry.description,
      category: entry.category,
      type: entry.type,
      amount: entry.amount,
      counterparty: entry.counterparty,
      related_shoot_code: entry.relatedShootCode || null,
      status: entry.status,
      payment_method: entry.paymentMethod || null,
    });
  } catch (e) {
    console.error('[Supabase] syncLedgerEntryToCloud error:', e);
  }
}

export async function deleteLedgerEntryFromCloud(entryId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    await supabase.from('lumina_ledger').delete().eq('id', entryId);
  } catch (e) {
    console.error('[Supabase] deleteLedgerEntryFromCloud error:', e);
  }
}

export async function syncInvoiceToCloud(inv: Invoice): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    await supabase.from('lumina_invoices').upsert({
      id: inv.id,
      invoice_number: inv.invoiceNumber,
      client_id: inv.clientId,
      client_name: inv.clientName,
      brand: inv.brand,
      issue_date: inv.issueDate,
      due_date: inv.dueDate,
      items: inv.items,
      subtotal: inv.subtotal,
      production_fee_tax: inv.productionFeeTax,
      total_amount: inv.totalAmount,
      balance_due: inv.balanceDue,
      status: inv.status,
      quotation_id: inv.quotationId || null,
    });
  } catch (e) {
    console.error('[Supabase] syncInvoiceToCloud error:', e);
  }
}

// =========================================================================
// 3. SEED INITIAL CLOUD DATABASE IF EMPTY
// =========================================================================

export async function seedCloudIfEmpty(data: {
  users: UserAccount[];
  settings: StudioSettings;
  quotations: Quotation[];
  enquiries: Enquiry[];
  bookings: ShootBooking[];
  ledger: LedgerEntry[];
  invoices: Invoice[];
}) {
  if (!supabase || !isSupabaseConfigured()) return;

  try {
    const { count: userCount } = await supabase.from('lumina_users').select('*', { count: 'exact', head: true });
    if (userCount === 0 || userCount === null) {
      for (const u of data.users) {
        await syncUserToCloud(u);
      }
    }

    const { count: settingsCount } = await supabase.from('lumina_settings').select('*', { count: 'exact', head: true });
    if (settingsCount === 0 || settingsCount === null) {
      await syncSettingsToCloud(data.settings);
    }

    const { count: quoteCount } = await supabase.from('lumina_quotations').select('*', { count: 'exact', head: true });
    if (quoteCount === 0 || quoteCount === null) {
      for (const q of data.quotations) {
        await syncQuotationToCloud(q);
      }
    }

    const { count: enqCount } = await supabase.from('lumina_enquiries').select('*', { count: 'exact', head: true });
    if (enqCount === 0 || enqCount === null) {
      for (const e of data.enquiries) {
        await syncEnquiryToCloud(e);
      }
    }

    const { count: bookingCount } = await supabase.from('lumina_bookings').select('*', { count: 'exact', head: true });
    if (bookingCount === 0 || bookingCount === null) {
      for (const b of data.bookings) {
        await syncBookingToCloud(b);
      }
    }

    const { count: ledgerCount } = await supabase.from('lumina_ledger').select('*', { count: 'exact', head: true });
    if (ledgerCount === 0 || ledgerCount === null) {
      for (const l of data.ledger) {
        await syncLedgerEntryToCloud(l);
      }
    }

    const { count: invCount } = await supabase.from('lumina_invoices').select('*', { count: 'exact', head: true });
    if (invCount === 0 || invCount === null) {
      for (const i of data.invoices) {
        await syncInvoiceToCloud(i);
      }
    }
  } catch (err) {
    console.warn('[Supabase] Initial seed skipped or already populated:', err);
  }
}

export async function reseedCloudData(data: {
  settings: StudioSettings;
  quotations: Quotation[];
  enquiries: Enquiry[];
  bookings: ShootBooking[];
  ledger: LedgerEntry[];
  invoices: Invoice[];
}): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;
  try {
    await syncSettingsToCloud(data.settings);
    for (const q of data.quotations) {
      await syncQuotationToCloud(q);
    }
    for (const e of data.enquiries) {
      await syncEnquiryToCloud(e);
    }
    for (const b of data.bookings) {
      await syncBookingToCloud(b);
    }
    for (const l of data.ledger) {
      await syncLedgerEntryToCloud(l);
    }
    for (const i of data.invoices) {
      await syncInvoiceToCloud(i);
    }
  } catch (err) {
    console.error('[Supabase] Error reseeding cloud data:', err);
  }
}

// =========================================================================
// 4. REAL-TIME SUBSCRIPTION MANAGER
// =========================================================================

export interface RealtimeSyncHandlers {
  onQuotationsChange: (quotes: Quotation[]) => void;
  onEnquiriesChange: (enquiries: Enquiry[]) => void;
  onBookingsChange: (bookings: ShootBooking[]) => void;
  onLedgerChange: (ledger: LedgerEntry[]) => void;
  onInvoicesChange: (invoices: Invoice[]) => void;
  onUsersChange: (users: UserAccount[]) => void;
  onSettingsChange: (settings: StudioSettings) => void;
}

export function subscribeToLuminaRealtime(handlers: RealtimeSyncHandlers): () => void {
  if (!supabase || !isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('lumina_realtime_sync')
    // 1. Quotations
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lumina_quotations' },
      async () => {
        const refreshed = await fetchQuotationsFromCloud();
        if (refreshed) handlers.onQuotationsChange(refreshed);
      }
    )
    // 2. Enquiries
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lumina_enquiries' },
      async () => {
        const refreshed = await fetchEnquiriesFromCloud();
        if (refreshed) handlers.onEnquiriesChange(refreshed);
      }
    )
    // 3. Bookings / Orders
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lumina_bookings' },
      async () => {
        const refreshed = await fetchBookingsFromCloud();
        if (refreshed) handlers.onBookingsChange(refreshed);
      }
    )
    // 4. Ledger
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lumina_ledger' },
      async () => {
        const refreshed = await fetchLedgerFromCloud();
        if (refreshed) handlers.onLedgerChange(refreshed);
      }
    )
    // 5. Invoices
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lumina_invoices' },
      async () => {
        const refreshed = await fetchInvoicesFromCloud();
        if (refreshed) handlers.onInvoicesChange(refreshed);
      }
    )
    // 6. Users
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lumina_users' },
      async () => {
        const refreshed = await fetchUsersFromCloud();
        if (refreshed) handlers.onUsersChange(refreshed);
      }
    )
    // 7. Settings
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lumina_settings' },
      async () => {
        const refreshed = await fetchSettingsFromCloud();
        if (refreshed) handlers.onSettingsChange(refreshed);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase Realtime] Connected to live Postgres sync channel.');
      }
    });

  return () => {
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
}
