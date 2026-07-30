import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppointmentBooking, BookingStatus, Therapist, TherapistStatus } from '../types';

// Read env vars if present
const metaEnv = (import.meta as any).env || {};
const rawSupabaseUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
const rawSupabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

// Format URL & strip any trailing /rest/v1 or extra paths added by mistake
let formattedUrl = rawSupabaseUrl;
if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
  formattedUrl = `https://${formattedUrl}`;
}

if (formattedUrl) {
  try {
    const urlObj = new URL(formattedUrl);
    // Extract base origin (e.g. "https://geqquinhxunzpzgcfarp.supabase.co")
    formattedUrl = urlObj.origin;
  } catch {
    formattedUrl = formattedUrl
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/+$/, '');
  }
}

const supabaseUrl = formattedUrl;
const supabaseAnonKey = rawSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder') &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  supabaseUrl.includes('.supabase.co')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEY = 'mamahands_spa_appointments_v1';
const THERAPISTS_STORAGE_KEY = 'mamahands_spa_therapists_v1';
const REALTIME_CHANNEL_NAME = 'mamahands_booking_updates';

// Setup BroadcastChannel for real-time multi-tab updates when running client-side / without Supabase
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(REALTIME_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel initialization fallback:', e);
  }
}

// Initial seed therapists with valid UUIDs
const INITIAL_SEED_THERAPISTS: Therapist[] = [
  {
    id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
    name: 'Elena Vance',
    gender: 'Female',
    phone: '+63 917 555 1234',
    email: 'elena.vance@mamahands.com',
    specialties: ['Deep Relaxation Massage', 'Swedish Massage', 'Aromatherapy'],
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e',
    name: 'Sofia Rivera',
    gender: 'Female',
    phone: '+63 918 555 2345',
    email: 'sofia.rivera@mamahands.com',
    specialties: ['Ventosa Cupping', 'Holistic Scrub', 'Hot Stone Massage'],
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 'c3d4e5f6-a1b2-4c3d-0e4f-5a6b7c8d9e0f',
    name: 'Marcus De Leon',
    gender: 'Male',
    phone: '+63 919 555 3456',
    email: 'marcus.deleon@mamahands.com',
    specialties: ['Deep Tissue Massage', 'Foot Reflexology'],
    status: 'on_leave',
    leaveReason: 'Personal Leave',
    createdAt: new Date().toISOString()
  },
  {
    id: 'd4e5f6a1-b2c3-4d4e-1f5a-6b7c8d9e0f1a',
    name: 'Ana Morales',
    gender: 'Female',
    phone: '+63 920 555 4567',
    email: 'ana.morales@mamahands.com',
    specialties: ['Swedish Massage', 'Ear Candling Therapy'],
    status: 'available',
    createdAt: new Date().toISOString()
  }
];

// Helper to get local therapists
export function getLocalTherapists(): Therapist[] {
  if (typeof window === 'undefined') return INITIAL_SEED_THERAPISTS;
  try {
    const raw = localStorage.getItem(THERAPISTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(THERAPISTS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_THERAPISTS));
      return INITIAL_SEED_THERAPISTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local storage therapists:', err);
    return INITIAL_SEED_THERAPISTS;
  }
}

// Helper to save local therapists
export function saveLocalTherapists(therapists: Therapist[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THERAPISTS_STORAGE_KEY, JSON.stringify(therapists));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'THERAPISTS_UPDATED', timestamp: Date.now() });
    }
  } catch (err) {
    console.error('Error saving local storage therapists:', err);
  }
}

// Initial seed appointments for demonstration
const INITIAL_SEED_BOOKINGS: AppointmentBooking[] = [
  {
    id: 'seed-1',
    bookingRef: 'MH-9102',
    customerName: 'Maria Santos',
    customerPhone: '+63 917 123 4567',
    customerEmail: 'maria.santos@gmail.com',
    serviceId: 'deep-relaxation',
    serviceName: 'Deep Relaxation Massage',
    durationMinutes: 120,
    pricePhp: 999,
    selectedAddOns: ['Ear Candling Therapy'],
    addOnsTotalPhp: 150,
    totalPricePhp: 1149,
    bookingDate: new Date().toISOString().split('T')[0], // today
    bookingTime: '02:30 PM',
    therapistGenderPreference: 'Female',
    notes: 'Please focus on lower back and neck shoulders.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'seed-2',
    bookingRef: 'MH-9105',
    customerName: 'Juan Dela Cruz',
    customerPhone: '+63 918 987 6543',
    customerEmail: 'juan.dc@yahoo.com',
    serviceId: 'holistic-body-scrub',
    serviceName: 'Holistic Massage w/ Body Scrub',
    durationMinutes: 120,
    pricePhp: 1699,
    selectedScent: 'Coffee Revive',
    selectedAddOns: ['Hydrating Facial Mask'],
    addOnsTotalPhp: 100,
    totalPricePhp: 1799,
    bookingDate: new Date().toISOString().split('T')[0], // today
    bookingTime: '04:00 PM',
    therapistGenderPreference: 'No Preference',
    notes: 'Coffee scrub preferred.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

// Helper to get local bookings
function getLocalBookings(): AppointmentBooking[] {
  if (typeof window === 'undefined') return INITIAL_SEED_BOOKINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_BOOKINGS));
      return INITIAL_SEED_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local storage bookings:', err);
    return INITIAL_SEED_BOOKINGS;
  }
}

// Helper to save local bookings
function saveLocalBookings(bookings: AppointmentBooking[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    // Notify other tabs/windows in real time
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'APPOINTMENTS_UPDATED', timestamp: Date.now() });
    }
  } catch (err) {
    console.error('Error saving local storage bookings:', err);
  }
}

/**
 * Fetch all appointments (or filter by date)
 */
export async function fetchAppointments(dateFilter?: string): Promise<AppointmentBooking[]> {
  if (supabase) {
    try {
      let query = supabase.from('appointments').select('*').order('created_at', { ascending: false });
      if (dateFilter) {
        query = query.eq('booking_date', dateFilter);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((item: any) => ({
          id: item.id,
          bookingRef: item.booking_ref || `MH-${item.id.slice(0, 4)}`,
          customerName: item.customer_name,
          customerPhone: item.customer_phone,
          customerEmail: item.customer_email || '',
          serviceId: item.service_id,
          serviceName: item.service_name,
          durationMinutes: item.duration_minutes,
          pricePhp: item.price_php,
          selectedScent: item.selected_scent,
          selectedAddOns: item.selected_add_ons || [],
          addOnsTotalPhp: item.add_ons_total_php || 0,
          totalPricePhp: item.total_price_php,
          bookingDate: item.booking_date,
          bookingTime: item.booking_time,
          therapistGenderPreference: item.therapist_gender_preference || 'No Preference',
          therapistId: item.therapist_id || undefined,
          therapistName: item.therapist_name || undefined,
          notes: item.notes || '',
          status: item.status || 'confirmed',
          createdAt: item.created_at
        }));
      }
      console.warn('Supabase fetch error, falling back to local storage:', error?.message);
    } catch (err) {
      console.error('Supabase fetch failed:', err);
    }
  }

  // Fallback to local storage
  const all = getLocalBookings();
  if (dateFilter) {
    return all.filter(b => b.bookingDate === dateFilter && b.status !== 'cancelled');
  }
  return all;
}

/**
 * Save new booking
 */
export async function createAppointment(bookingData: Omit<AppointmentBooking, 'id' | 'createdAt'>): Promise<AppointmentBooking> {
  const newBooking: AppointmentBooking = {
    ...bookingData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[10]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)),
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    try {
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newBooking.id);

      const dbPayload: Record<string, any> = {
        booking_ref: newBooking.bookingRef,
        customer_name: newBooking.customerName,
        customer_phone: newBooking.customerPhone,
        customer_email: newBooking.customerEmail,
        service_id: newBooking.serviceId,
        service_name: newBooking.serviceName,
        duration_minutes: newBooking.durationMinutes,
        price_php: newBooking.pricePhp,
        selected_scent: newBooking.selectedScent || null,
        selected_add_ons: newBooking.selectedAddOns,
        add_ons_total_php: newBooking.addOnsTotalPhp,
        total_price_php: newBooking.totalPricePhp,
        booking_date: newBooking.bookingDate,
        booking_time: newBooking.bookingTime,
        therapist_gender_preference: newBooking.therapistGenderPreference,
        therapist_id: newBooking.therapistId || null,
        therapist_name: newBooking.therapistName || null,
        notes: newBooking.notes || '',
        status: newBooking.status,
        created_at: newBooking.createdAt
      };

      if (isValidUuid) {
        dbPayload.id = newBooking.id;
      }

      const { data, error } = await supabase.from('appointments').insert([dbPayload]).select();
      if (error) {
        console.error('Supabase insert error, saving locally too:', error.message, error.details);
      } else if (data && data[0]) {
        newBooking.id = data[0].id;
      }
    } catch (err) {
      console.error('Supabase save failed:', err);
    }
  }

  // Always update local storage as well for instant responsiveness & offline redundancy
  const current = getLocalBookings();
  saveLocalBookings([newBooking, ...current]);
  return newBooking;
}

/**
 * Update booking status
 */
export async function updateAppointmentStatus(id: string, status: BookingStatus): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('appointments').update({ status }).eq('id', id);
    } catch (e) {
      console.error('Supabase update failed:', e);
    }
  }

  const current = getLocalBookings();
  const updated = current.map(b => b.id === id ? { ...b, status } : b);
  saveLocalBookings(updated);
  return true;
}

/**
 * Assign or reassign a therapist to an appointment
 */
export async function assignTherapistToAppointment(
  appointmentId: string,
  therapistId: string | null,
  therapistName: string | null
): Promise<boolean> {
  if (supabase) {
    try {
      await supabase
        .from('appointments')
        .update({
          therapist_id: therapistId,
          therapist_name: therapistName
        })
        .eq('id', appointmentId);
    } catch (err) {
      console.error('Supabase assignTherapist error:', err);
    }
  }

  const current = getLocalBookings();
  const updated = current.map(b => 
    b.id === appointmentId 
      ? { ...b, therapistId: therapistId || undefined, therapistName: therapistName || undefined }
      : b
  );
  saveLocalBookings(updated);
  return true;
}

/**
 * Fetch all therapists
 */
export async function fetchTherapists(): Promise<Therapist[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('therapists').select('*').order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          email: item.email || '',
          gender: item.gender || 'Female',
          specialties: item.specialties || [],
          status: item.status || 'available',
          leaveReason: item.leave_reason || '',
          createdAt: item.created_at
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch therapists error, using local fallback:', err);
    }
  }

  return getLocalTherapists();
}

/**
 * Fetch a single therapist by UUID
 */
export async function fetchTherapistById(id: string): Promise<Therapist | null> {
  if (!id) return null;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('therapists').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email || '',
          gender: data.gender || 'Female',
          specialties: data.specialties || [],
          status: data.status || 'available',
          leaveReason: data.leave_reason || '',
          createdAt: data.created_at
        };
      }
    } catch (err) {
      console.warn('Supabase fetch therapist by ID failed:', err);
    }
  }

  const local = getLocalTherapists();
  return local.find(t => t.id === id) || null;
}

/**
 * Create a new therapist (with UUID primary key)
 */
export async function createTherapist(data: Omit<Therapist, 'id' | 'createdAt'>): Promise<Therapist> {
  const newTherapist: Therapist = {
    ...data,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '20000000-2000-4000-8000-200000000000'.replace(/[20]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)),
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    try {
      const dbPayload = {
        id: newTherapist.id,
        name: newTherapist.name,
        phone: newTherapist.phone,
        email: newTherapist.email || null,
        gender: newTherapist.gender,
        specialties: newTherapist.specialties,
        status: newTherapist.status,
        leave_reason: newTherapist.leaveReason || null,
        created_at: newTherapist.createdAt
      };
      const { data: resData, error } = await supabase.from('therapists').insert([dbPayload]).select();
      if (error) {
        console.error('Supabase insert therapist error:', error);
      } else if (resData && resData[0]) {
        newTherapist.id = resData[0].id;
      }
    } catch (err) {
      console.error('Supabase createTherapist exception:', err);
    }
  }

  const current = getLocalTherapists();
  saveLocalTherapists([newTherapist, ...current]);
  return newTherapist;
}

/**
 * Update an existing therapist
 */
export async function updateTherapist(id: string, updates: Partial<Therapist>): Promise<boolean> {
  if (supabase) {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
      if (updates.specialties !== undefined) dbUpdates.specialties = updates.specialties;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.leaveReason !== undefined) dbUpdates.leave_reason = updates.leaveReason;

      await supabase.from('therapists').update(dbUpdates).eq('id', id);
    } catch (err) {
      console.error('Supabase updateTherapist error:', err);
    }
  }

  const current = getLocalTherapists();
  const updated = current.map(t => t.id === id ? { ...t, ...updates } : t);
  saveLocalTherapists(updated);
  return true;
}

/**
 * Delete a therapist by UUID
 */
export async function deleteTherapist(id: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('therapists').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase deleteTherapist error:', err);
    }
  }

  const current = getLocalTherapists();
  const filtered = current.filter(t => t.id !== id);
  saveLocalTherapists(filtered);
  return true;
}

/**
 * Subscribe to real-time changes (handles both Supabase Realtime & BroadcastChannel for browser tabs)
 */
export function subscribeToAppointments(onUpdate: () => void) {
  let supabaseSubscription: any = null;

  if (supabase) {
    try {
      supabaseSubscription = supabase
        .channel('public:appointments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
          onUpdate();
        })
        .subscribe();
    } catch (err) {
      console.warn('Supabase real-time channel error:', err);
    }
  }

  // Local BroadcastChannel listener
  const handleBroadcastMessage = (event: MessageEvent) => {
    if (event.data?.type === 'APPOINTMENTS_UPDATED') {
      onUpdate();
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // Storage listener for cross-tab fallback
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onUpdate();
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (supabaseSubscription) {
      supabase.removeChannel(supabaseSubscription);
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

/**
 * Get SQL schema for Supabase table initialization
 */
export function getSupabaseSqlSchema(): string {
  return `-- Create Therapists Table in Supabase (UUID Primary Key)
CREATE TABLE IF NOT EXISTS public.therapists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    gender VARCHAR(20) DEFAULT 'Female',
    specialties JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'available',
    leave_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Therapists
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on therapists" ON public.therapists FOR SELECT USING (true);
CREATE POLICY "Allow public insert on therapists" ON public.therapists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on therapists" ON public.therapists FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on therapists" ON public.therapists FOR DELETE USING (true);

-- Create MamaHands Spa Appointments Table in Supabase
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    service_id VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    price_php NUMERIC(10, 2) NOT NULL,
    selected_scent VARCHAR(100),
    selected_add_ons JSONB DEFAULT '[]'::jsonb,
    add_ons_total_php NUMERIC(10, 2) DEFAULT 0,
    total_price_php NUMERIC(10, 2) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(20) NOT NULL,
    therapist_gender_preference VARCHAR(50) DEFAULT 'No Preference',
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
    therapist_name VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if appointments table already existed
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS therapist_id UUID;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS therapist_name VARCHAR(255);

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policies for Appointments
CREATE POLICY "Allow public insert to appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read of appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public update of appointments" ON public.appointments FOR UPDATE USING (true);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.therapists;
`;
}
