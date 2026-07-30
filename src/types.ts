export type Page = 'home' | 'about' | 'appointment' | 'administrator' | 'schedule-admin';

export interface DurationOption {
  durationMinutes: number; // e.g. 30, 60, 90, 120
  pricePhp: number;        // e.g. 549, 699, etc.
  isPopular?: boolean;
}

export type ServiceCategory = 'premium' | 'basic' | 'addons';

export interface SpaService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  options: DurationOption[];
  hasSignatureScents?: boolean;
  image?: string;
  tag?: string;
}

export type SignatureScent = 'Citrus Glow' | 'Milk Radiance' | 'Coffee Revive';

export interface AddOnService {
  id: string;
  name: string;
  pricePhp: number;
  description: string;
}

export interface TimeSlot {
  time: string;           // e.g., "10:00 AM"
  availableSeats: number; // e.g., max 3 concurrent appointments
  isBooked?: boolean;
}

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface AppointmentBooking {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  pricePhp: number;
  selectedScent?: SignatureScent;
  selectedAddOns: string[]; // names of add-ons
  addOnsTotalPhp: number;
  totalPricePhp: number;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // e.g. "02:30 PM"
  therapistGenderPreference: 'Female' | 'Male' | 'No Preference';
  notes?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
