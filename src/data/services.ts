import { SpaService, AddOnService, SignatureScent } from '../types';

export const SPA_NAME = "MamaHands Aesthetics & Spa";
export const SPA_TAGLINE = "Where Calm Begins, and Care Continues.";
export const SPA_LOCATION = "24 B. Morcilla St., Poblacion, Pateros, 1620 Metro Manila, Philippines";
export const SPA_PHONES = ["+63 966 196 6258", "+63 9 62 258 9844"];
export const SPA_HOURS = "10:00 AM - 10:00 PM Daily";

export const SIGNATURE_SCENTS: { name: SignatureScent; icon: string; description: string }[] = [
  { name: 'Citrus Glow', icon: '🍋', description: 'Refreshing, energizing citrus essence to invigorate your senses.' },
  { name: 'Milk Radiance', icon: '🥛', description: 'Nourishing, soothing blend for velvety soft and hydrated skin.' },
  { name: 'Coffee Revive', icon: '☕', description: 'Exfoliating, anti-oxidant rich roast blend to stimulate circulation.' },
];

export const ADD_ON_SERVICES: AddOnService[] = [
  {
    id: 'addon-ear-candling',
    name: 'Ear Candling Therapy',
    pricePhp: 150,
    description: 'Gentle, soothing thermal ear therapy to relieve sinus pressure and promote deep tranquility.'
  },
  {
    id: 'addon-facial-mask',
    name: 'Hydrating Facial Mask',
    pricePhp: 100,
    description: 'Deeply moisturizing botanical face mask to restore natural glow and soothe skin after massage.'
  }
];

export const SPA_SERVICES: SpaService[] = [
  // --- Premium Massage ---
  {
    id: 'deep-relaxation',
    name: 'Deep Relaxation Massage',
    category: 'premium',
    description: 'Targeted therapeutic deep-tissue pressure designed to melt away chronic muscle tension and stress.',
    options: [
      { durationMinutes: 90, pricePhp: 699 },
      { durationMinutes: 120, pricePhp: 999, isPopular: true }
    ],
    tag: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hot-stone-premium',
    name: 'Hot Stone Therapy Massage',
    category: 'premium',
    description: 'Warm basalt stones placed along energy points combined with smooth glides to relieve deep muscular stiffness.',
    options: [
      { durationMinutes: 90, pricePhp: 749 },
      { durationMinutes: 120, pricePhp: 1099 }
    ],
    tag: 'Thermal Care',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ventosa-massage',
    name: 'Ventosa Massage',
    category: 'premium',
    description: 'Traditional cupping therapy paired with relaxing body massage to improve blood flow and dispel body trapped coldness/lamig.',
    options: [
      { durationMinutes: 90, pricePhp: 749 },
      { durationMinutes: 120, pricePhp: 1099 }
    ],
    tag: 'Traditional Cupping',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
  },

  // --- Basic Massage ---
  {
    id: 'traditional-massage',
    name: 'Traditional Massage',
    category: 'basic',
    description: 'Classic Pinoy Hilot-inspired strokes with aromatic warm oil to ease day-to-day fatigue.',
    options: [
      { durationMinutes: 60, pricePhp: 549 },
      { durationMinutes: 90, pricePhp: 699, isPopular: true }
    ],
    tag: 'Classic',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'swedish-massage',
    name: 'Swedish Massage',
    category: 'basic',
    description: 'Gentle, long effleurage strokes and kneading for complete body relaxation and mental calm.',
    options: [
      { durationMinutes: 60, pricePhp: 549 },
      { durationMinutes: 90, pricePhp: 699 }
    ],
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'shiatsu-massage',
    name: 'Shiatsu Massage (No Oil)',
    category: 'basic',
    description: 'Dry Japanese pressure-point massage using thumbs, palms, and elbows to balance body energy flow.',
    options: [
      { durationMinutes: 60, pricePhp: 549 },
      { durationMinutes: 90, pricePhp: 699 }
    ],
    tag: 'Oil-Free',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'hot-stone-basic',
    name: 'Hot Stone Therapy Massage',
    category: 'basic',
    description: '60-minute or 90-minute warm basalt stone relief for quick, deep heat penetration into tight muscles.',
    options: [
      { durationMinutes: 60, pricePhp: 749 },
      { durationMinutes: 90, pricePhp: 1099 }
    ],
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'express-massage',
    name: 'Express Massage',
    category: 'basic',
    description: 'Focused 30-minute quick relief targeting Head, Back, Shoulders, and Feet for busy individuals on the go.',
    options: [
      { durationMinutes: 30, pricePhp: 299 }
    ],
    tag: 'Quick Relief',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'holistic-body-scrub',
    name: 'Holistic Massage w/ Body Scrub',
    category: 'basic',
    description: 'Luxury 2-hour pampering combining a full-body soothing massage with an exfoliating body scrub of your signature scent.',
    options: [
      { durationMinutes: 120, pricePhp: 1699, isPopular: true }
    ],
    hasSignatureScents: true,
    tag: 'Signature Spa Package',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
  }
];

export const DAILY_TIME_SLOTS: string[] = [
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
  "07:00 PM",
  "08:30 PM"
];

// Max capacity per time slot (e.g., 3 therapist stations available simultaneously)
export const MAX_THERAPISTS_PER_SLOT = 3;
