import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Page, 
  SpaService, 
  SignatureScent, 
  AppointmentBooking, 
  TimeSlot 
} from '../types';
import { 
  SPA_SERVICES, 
  ADD_ON_SERVICES, 
  SIGNATURE_SCENTS, 
  DAILY_TIME_SLOTS, 
  MAX_THERAPISTS_PER_SLOT, 
  SPA_NAME, 
  SPA_LOCATION, 
  SPA_PHONES 
} from '../data/services';
import { 
  fetchAppointments, 
  createAppointment, 
  subscribeToAppointments, 
  isSupabaseConfigured 
} from '../lib/supabase';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Droplet, 
  Plus, 
  Check, 
  Copy, 
  Printer, 
  Share2, 
  Database,
  RefreshCw
} from 'lucide-react';

interface AppointmentPageProps {
  initialServiceId?: string;
  onNavigate: (page: Page) => void;
  onOpenSupabaseModal: () => void;
}

export const AppointmentPage: React.FC<AppointmentPageProps> = ({
  initialServiceId,
  onNavigate,
  onOpenSupabaseModal
}) => {
  // Step State (1: Service, 2: Customization, 3: Date & Slot, 4: Contact Details, 5: Confirmation)
  const [step, setStep] = useState<number>(1);

  // Selected Service State
  const [selectedService, setSelectedService] = useState<SpaService>(() => {
    if (initialServiceId) {
      const match = SPA_SERVICES.find(s => s.id === initialServiceId);
      if (match) return match;
    }
    return SPA_SERVICES[0]; // Default Deep Relaxation Massage
  });

  // Selected Duration Option
  const [selectedDurationIndex, setSelectedDurationIndex] = useState<number>(0);

  // Selected Scent (if applicable)
  const [selectedScent, setSelectedScent] = useState<SignatureScent>('Citrus Glow');

  // Selected Add-ons
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  // Selected Date (YYYY-MM-DD, default today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Selected Time Slot
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Customer Contact State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [therapistGender, setTherapistGender] = useState<'Female' | 'Male' | 'No Preference'>('No Preference');
  const [notes, setNotes] = useState<string>('');

  // Real-Time Booked Slots Map: { "10:00 AM": number_of_bookings }
  const [bookedSlotsMap, setBookedSlotsMap] = useState<Record<string, number>>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Confirmed Booking Result
  const [confirmedBooking, setConfirmedBooking] = useState<AppointmentBooking | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Fetch booked slots for selectedDate whenever date changes or realtime triggers
  const loadBookedSlots = async (dateStr: string) => {
    setIsLoadingSlots(true);
    try {
      const bookingsForDate = await fetchAppointments(dateStr);
      const counts: Record<string, number> = {};
      bookingsForDate.forEach(b => {
        if (b.status !== 'cancelled') {
          counts[b.bookingTime] = (counts[b.bookingTime] || 0) + 1;
        }
      });
      setBookedSlotsMap(counts);
    } catch (err) {
      console.error('Error loading booked slots:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadBookedSlots(selectedDate);

    // Subscribe to realtime booking updates
    const unsubscribe = subscribeToAppointments(() => {
      loadBookedSlots(selectedDate);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  // Derived Financials
  const currentDurationOption = selectedService.options[selectedDurationIndex] || selectedService.options[0];
  const servicePrice = currentDurationOption.pricePhp;

  const selectedAddOnObjects = ADD_ON_SERVICES.filter(a => selectedAddOnIds.includes(a.id));
  const addOnsTotal = selectedAddOnObjects.reduce((sum, a) => sum + a.pricePhp, 0);
  const grandTotal = servicePrice + addOnsTotal;

  // Toggle Addon
  const toggleAddOn = (addonId: string) => {
    if (selectedAddOnIds.includes(addonId)) {
      setSelectedAddOnIds(selectedAddOnIds.filter(id => id !== addonId));
    } else {
      setSelectedAddOnIds([...selectedAddOnIds, addonId]);
    }
  };

  // Submit Booking Handler
  const handleCompleteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !selectedTimeSlot) {
      alert('Please fill in your name, contact phone number, and select a time slot.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingRef = `MH-${Math.floor(1000 + Math.random() * 9000)}`;

      const bookingData: Omit<AppointmentBooking, 'id' | 'createdAt'> = {
        bookingRef,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        durationMinutes: currentDurationOption.durationMinutes,
        pricePhp: servicePrice,
        selectedScent: selectedService.hasSignatureScents ? selectedScent : undefined,
        selectedAddOns: selectedAddOnObjects.map(a => a.name),
        addOnsTotalPhp: addOnsTotal,
        totalPricePhp: grandTotal,
        bookingDate: selectedDate,
        bookingTime: selectedTimeSlot,
        therapistGenderPreference: therapistGender,
        notes: notes.trim(),
        status: 'confirmed'
      };

      const result = await createAppointment(bookingData);
      setConfirmedBooking(result);
      setStep(5);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }

    } catch (err) {
      console.error('Failed to save booking:', err);
      alert('There was a problem submitting your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBookingRefToClipboard = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.bookingRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  // Helper for generating upcoming 14 days
  const getUpcomingDates = () => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isToday = i === 0;
      list.push({ iso, dayName, monthDay, isToday });
    }
    return list;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title Header */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#6b7a64] bg-[#8c9c84]/15 px-4 py-1.5 rounded-full border border-[#8c9c84]/30">
          MamaHands Aesthetics & Spa
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#3a3a32]">
          Reserve Your Spa Schedule
        </h1>
        <p className="text-xs sm:text-sm text-[#4a4a40] opacity-80">
          Real-Time Slot Verification • Instant Confirmation
        </p>
      </div>

      {/* Step Progress Tracker */}
      {step <= 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6b7a64] mb-2 px-1">
            <span className={step >= 1 ? 'text-[#3a3a32] font-bold' : ''}>1. Service</span>
            <span className={step >= 2 ? 'text-[#3a3a32] font-bold' : ''}>2. Customization</span>
            <span className={step >= 3 ? 'text-[#3a3a32] font-bold' : ''}>3. Date & Slot</span>
            <span className={step >= 4 ? 'text-[#3a3a32] font-bold' : ''}>4. Your Details</span>
          </div>

          <div className="w-full bg-[#f2f2eb] h-2.5 rounded-full overflow-hidden border border-[#e5e5db]">
            <div 
              className="bg-[#8c9c84] h-full transition-all duration-500 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-xl p-6 sm:p-10 relative">

        {/* --- STEP 1: SERVICE SELECTOR --- */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D2C22]">
                Step 1: Choose Your Treatment & Duration
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Select your preferred spa service and session time below.
              </p>
            </div>

            {/* Services Cards List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {SPA_SERVICES.map(service => {
                const isSelected = selectedService.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setSelectedDurationIndex(0); // Reset duration selection for new service
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#8B5A2B] bg-[#FAF5ED] shadow-md'
                        : 'border-[#E8DFC8] bg-white hover:border-[#C5B8A5]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                          isSelected ? 'border-[#8B5A2B] bg-[#8B5A2B]' : 'border-stone-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-bold text-[#3D2C22]">
                              {service.name}
                            </h3>
                            {service.tag && (
                              <span className="text-[10px] bg-[#8B5A2B] text-white font-bold px-2 py-0.5 rounded-full">
                                {service.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6E5D52] mt-1">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {/* Duration Pills for this service */}
                      <div className="w-full sm:w-auto flex flex-wrap gap-2 shrink-0">
                        {service.options.map((opt, idx) => {
                          const isOptSelected = isSelected && selectedDurationIndex === idx;
                          return (
                            <button
                              key={opt.durationMinutes}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedService(service);
                                setSelectedDurationIndex(idx);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isOptSelected
                                  ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-xs'
                                  : 'bg-white text-[#3D2C22] border-[#E8DFC8] hover:bg-[#FAF5ED]'
                              }`}
                            >
                              {opt.durationMinutes} mins — ₱{opt.pricePhp}
                            </button>
                          );
                        })}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="pt-4 border-t border-[#E8DFC8] flex justify-between items-center">
              <div className="text-xs text-[#8C7A6B]">
                Selected Service: <strong className="text-[#3D2C22]">{selectedService.name} ({currentDurationOption.durationMinutes} mins)</strong>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-full bg-[#8B5A2B] hover:bg-[#724821] text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <span>Continue to Customization</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* --- STEP 2: SCENTS & ADD-ONS --- */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D2C22]">
                Step 2: Customize Your Session
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Select your signature scent (if applicable) and optional facial/thermal add-ons.
              </p>
            </div>

            {/* Signature Scent Selector (if service supports it) */}
            {selectedService.hasSignatureScents && (
              <div className="p-5 rounded-2xl bg-[#FAF5ED] border border-[#E8DFC8] space-y-3">
                <div className="flex items-center gap-2 text-[#8B5A2B]">
                  <Droplet className="w-5 h-5" />
                  <h3 className="font-serif font-bold text-base text-[#3D2C22]">
                    Select Signature Scrub Aroma (Included)
                  </h3>
                </div>
                <p className="text-xs text-stone-600">
                  Your 120-minute Holistic Body Scrub includes one of our handcrafted aromatherapy blends:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SIGNATURE_SCENTS.map(scent => {
                    const isScentSelected = selectedScent === scent.name;
                    return (
                      <button
                        key={scent.name}
                        type="button"
                        onClick={() => setSelectedScent(scent.name)}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          isScentSelected
                            ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-sm'
                            : 'bg-white text-[#3D2C22] border-[#E8DFC8] hover:border-[#8B5A2B]'
                        }`}
                      >
                        <div className="text-3xl mb-1">{scent.icon}</div>
                        <p className="font-serif font-bold text-sm">{scent.name}</p>
                        <p className={`text-[11px] mt-1 line-clamp-2 ${isScentSelected ? 'text-stone-100' : 'text-stone-500'}`}>
                          {scent.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-Ons List */}
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-[#3D2C22]">
                Optional Add-On Enhancements
              </h3>
              <p className="text-xs text-stone-500">
                You can attach any of these additional treatments to your massage session:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ADD_ON_SERVICES.map(addon => {
                  const isChecked = selectedAddOnIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? 'border-[#8B5A2B] bg-[#FAF5ED] shadow-xs'
                          : 'border-[#E8DFC8] bg-white hover:border-[#C5B8A5]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                        isChecked ? 'border-[#8B5A2B] bg-[#8B5A2B]' : 'border-stone-300'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif font-bold text-sm text-[#3D2C22]">
                            {addon.name}
                          </h4>
                          <span className="font-bold text-xs text-[#8B5A2B]">
                            +₱{addon.pricePhp}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subtotal Summary Banner */}
            <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-600">Current Running Total:</span>
              <span className="font-serif font-bold text-lg text-[#3D2C22]">
                ₱{grandTotal.toLocaleString()} PHP
              </span>
            </div>

            {/* Nav Controls */}
            <div className="pt-4 border-t border-[#E8DFC8] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 font-medium text-xs flex items-center gap-1.5 hover:bg-stone-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-full bg-[#8B5A2B] hover:bg-[#724821] text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <span>Select Date & Time Slot</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* --- STEP 3: DATE & REAL-TIME TIME SLOT PICKER --- */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#3D2C22]">
                  Step 3: Preferred Date & Time Slot
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Available time slots update in real-time based on live therapist schedule.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadBookedSlots(selectedDate)}
                  className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  title="Refresh live slots"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSlots ? 'animate-spin text-[#8B5A2B]' : ''}`} />
                  <span>Refresh Slots</span>
                </button>
              </div>
            </div>

            {/* Date Picker Carousel / Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#3D2C22] uppercase tracking-wider block">
                1. Choose Date:
              </label>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {getUpcomingDates().map(d => {
                  const isSelected = selectedDate === d.iso;
                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.iso);
                        setSelectedTimeSlot(''); // Reset slot selection on date change
                      }}
                      className={`shrink-0 px-4 py-3 rounded-2xl text-center transition-all border ${
                        isSelected
                          ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-md scale-105'
                          : 'bg-[#FAF5ED] text-[#3D2C22] border-[#E8DFC8] hover:border-[#8B5A2B]'
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{d.dayName}</p>
                      <p className="font-serif text-base font-bold mt-0.5">{d.monthDay}</p>
                      {d.isToday && (
                        <span className={`text-[9px] font-bold block px-1.5 py-0.5 rounded-full mt-1 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#8B5A2B]/10 text-[#8B5A2B]'
                        }`}>
                          Today
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real-time Time Slots Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#3D2C22] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#8B5A2B]" />
                  2. Select Preferred Time Slot:
                </label>
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync Active
                </span>
              </div>

              {isLoadingSlots ? (
                <div className="p-8 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#8B5A2B]" />
                  <span>Checking live therapist station schedule...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DAILY_TIME_SLOTS.map(slotTime => {
                    const bookedCount = bookedSlotsMap[slotTime] || 0;
                    const remainingStations = Math.max(0, MAX_THERAPISTS_PER_SLOT - bookedCount);
                    const isFullyBooked = remainingStations === 0;
                    const isSelected = selectedTimeSlot === slotTime;

                    return (
                      <button
                        key={slotTime}
                        type="button"
                        disabled={isFullyBooked}
                        onClick={() => setSelectedTimeSlot(slotTime)}
                        className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center relative ${
                          isFullyBooked
                            ? 'bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed text-stone-400'
                            : isSelected
                              ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-md ring-2 ring-[#8B5A2B]/30'
                              : 'bg-white text-[#3D2C22] border-[#E8DFC8] hover:border-[#8B5A2B] hover:bg-[#FAF5ED]'
                        }`}
                      >
                        <p className="font-serif font-bold text-base">{slotTime}</p>
                        
                        <p className={`text-[10px] mt-1 font-medium ${
                          isFullyBooked
                            ? 'text-rose-600 font-bold'
                            : isSelected
                              ? 'text-white/90'
                              : remainingStations === 1
                                ? 'text-amber-700 font-bold'
                                : 'text-emerald-700'
                        }`}>
                          {isFullyBooked 
                            ? 'Fully Booked' 
                            : `${remainingStations} ${remainingStations === 1 ? 'station' : 'stations'} open`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Date/Time Alert */}
            {selectedTimeSlot && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Slot Secured for Reservation:</p>
                  <p>
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at <strong>{selectedTimeSlot}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Nav Controls */}
            <div className="pt-4 border-t border-[#E8DFC8] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 font-medium text-xs flex items-center gap-1.5 hover:bg-stone-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="button"
                disabled={!selectedTimeSlot}
                onClick={() => setStep(4)}
                className={`px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2 shadow-md transition-all ${
                  selectedTimeSlot
                    ? 'bg-[#8B5A2B] hover:bg-[#724821] text-white'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <span>Enter Contact Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* --- STEP 4: CUSTOMER CONTACT DETAILS --- */}
        {step === 4 && (
          <form onSubmit={handleCompleteBooking} className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D2C22]">
                Step 4: Customer Information
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Please provide your contact info so our reception can record your booking schedule.
              </p>
            </div>

            {/* Summary Preview Box */}
            <div className="p-4 rounded-2xl bg-[#FAF5ED] border border-[#E8DFC8] text-xs space-y-2">
              <div className="flex justify-between items-center font-serif font-bold text-sm text-[#3D2C22]">
                <span>{selectedService.name} ({currentDurationOption.durationMinutes} mins)</span>
                <span className="text-[#8B5A2B]">₱{grandTotal.toLocaleString()} PHP</span>
              </div>
              <p className="text-stone-600">
                📅 Date: <strong>{selectedDate}</strong> at <strong>{selectedTimeSlot}</strong>
              </p>
              {selectedService.hasSignatureScents && (
                <p className="text-stone-600">
                  🌿 Scent: <strong>{selectedScent}</strong>
                </p>
              )}
              {selectedAddOnObjects.length > 0 && (
                <p className="text-stone-600">
                  ✨ Add-ons: {selectedAddOnObjects.map(a => a.name).join(', ')}
                </p>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3D2C22] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#8B5A2B]" /> Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8CBB5] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-sm"
                />
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3D2C22] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#8B5A2B]" /> Philippine Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +63 917 123 4567 or 09171234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8CBB5] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-sm"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3D2C22] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#8B5A2B]" /> Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. maria@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8CBB5] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-sm"
                />
              </div>

              {/* Therapist Preference */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#3D2C22] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B5A2B]" /> Therapist Gender Preference
                </label>
                <select
                  value={therapistGender}
                  onChange={(e) => setTherapistGender(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8CBB5] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-sm bg-white"
                >
                  <option value="No Preference">No Preference (First Available)</option>
                  <option value="Female">Female Therapist</option>
                  <option value="Male">Male Therapist</option>
                </select>
              </div>

            </div>

            {/* Special Request / Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3D2C22]">
                Special Focus Areas / Health Conditions (Optional):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please focus on upper shoulder stiffness. Light pressure on legs."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8CBB5] focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] text-sm"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#E8DFC8] flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 font-medium text-xs flex items-center gap-1.5 hover:bg-stone-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 rounded-full bg-[#8B5A2B] hover:bg-[#724821] text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Recording Schedule...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#E6C280]" />
                    <span>Confirm & Book Schedule Now</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* --- STEP 5: CONFIRMATION & RECEIPT CARD --- */}
        {step === 5 && confirmedBooking && (
          <div className="space-y-6 text-center animate-fadeIn py-2">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Booking Recorded Successfully
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#3D2C22] pt-2">
                Your Reservation is Confirmed!
              </h2>
              <p className="text-xs text-stone-500">
                Thank you for choosing {SPA_NAME}. We look forward to welcoming you!
              </p>
            </div>

            {/* Printable Receipt Card */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border-2 border-dashed border-[#D4AF37] text-left max-w-lg mx-auto space-y-4 shadow-sm">
              
              <div className="flex justify-between items-center border-b border-[#E8DFC8] pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Booking Reference</p>
                  <p className="font-mono text-xl font-extrabold text-[#8B5A2B]">{confirmedBooking.bookingRef}</p>
                </div>

                <button
                  onClick={copyBookingRefToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-[#D8CBB5] text-xs font-medium text-stone-700 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>{copiedRef ? 'Copied!' : 'Copy Ref'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs text-[#3D2C22]">
                <p><strong>Customer Name:</strong> {confirmedBooking.customerName}</p>
                <p><strong>Mobile Hotline:</strong> {confirmedBooking.customerPhone}</p>
                <p><strong>Treatment:</strong> {confirmedBooking.serviceName} ({confirmedBooking.durationMinutes} mins)</p>
                {confirmedBooking.selectedScent && (
                  <p><strong>Signature Scent:</strong> {confirmedBooking.selectedScent}</p>
                )}
                {confirmedBooking.selectedAddOns.length > 0 && (
                  <p><strong>Add-Ons:</strong> {confirmedBooking.selectedAddOns.join(', ')}</p>
                )}
                <p><strong>Schedule Date:</strong> {confirmedBooking.bookingDate}</p>
                <p><strong>Time Slot:</strong> <span className="font-bold text-[#8B5A2B]">{confirmedBooking.bookingTime}</span></p>
                <p><strong>Therapist Preference:</strong> {confirmedBooking.therapistGenderPreference}</p>
                <p className="pt-2 border-t border-[#E8DFC8] text-base font-bold flex justify-between">
                  <span>Total Amount Due at Spa:</span>
                  <span className="text-[#8B5A2B]">₱{confirmedBooking.totalPricePhp.toLocaleString()} PHP</span>
                </p>
              </div>

              <div className="pt-2 text-[11px] text-stone-500 italic border-t border-[#E8DFC8]/60">
                📍 Location: {SPA_LOCATION}
              </div>

            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white hover:bg-stone-100 text-[#3D2C22] border border-[#D8CBB5] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-[#8B5A2B]" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={() => onNavigate('schedule-admin')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#3D2C22] hover:bg-[#5C4B40] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>View Staff Schedule</span>
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setConfirmedBooking(null);
                  setSelectedTimeSlot('');
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#8B5A2B] hover:bg-[#724821] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Book Another Schedule</span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
