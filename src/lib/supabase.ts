import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppointmentBooking, BookingStatus } from '../types';

// Read env vars if present
const metaEnv = (import.meta as any).env || {};
const rawSupabaseUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
const rawSupabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

// Format URL if user forgot protocol
const supabaseUrl = rawSupabaseUrl && !rawSupabaseUrl.startsWith('http')
  ? `https://${rawSupabaseUrl}`
  : rawSupabaseUrl;

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
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bk-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    try {
      const dbPayload = {
        id: newBooking.id,
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
        notes: newBooking.notes || '',
        status: newBooking.status,
        created_at: newBooking.createdAt
      };

      const { error } = await supabase.from('appointments').insert([dbPayload]);
      if (error) {
        console.error('Supabase insert error, saving locally too:', error.message);
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
  return `-- Create MamaHands Spa Appointments Table in Supabase
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
    notes TEXT,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for customer bookings)
CREATE POLICY "Allow public insert to appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (true);

-- Allow public read (for real-time slot checking)
CREATE POLICY "Allow public read of appointments" 
ON public.appointments FOR SELECT 
USING (true);

-- Allow public update (for status changes/admin management)
CREATE POLICY "Allow public update of appointments" 
ON public.appointments FOR UPDATE 
USING (true);

-- Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
`;
}
