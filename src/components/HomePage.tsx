import React, { useState } from 'react';
import { Page, SpaService, ServiceCategory } from '../types';
import { 
  SPA_NAME, 
  SPA_TAGLINE, 
  SPA_SERVICES, 
  SIGNATURE_SCENTS, 
  ADD_ON_SERVICES, 
  SPA_PHONES, 
  SPA_LOCATION 
} from '../data/services';
import { 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Star, 
  Flame, 
  Droplet, 
  Heart,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onSelectServiceForBooking: (serviceId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onNavigate, 
  onSelectServiceForBooking 
}) => {
  const [activeTab, setActiveTab] = useState<ServiceCategory | 'all'>('all');

  const filteredServices = activeTab === 'all' 
    ? SPA_SERVICES 
    : SPA_SERVICES.filter(s => s.category === activeTab);

  return (
    <div className="space-y-16 pb-12">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f2f2eb] via-[#fdfbf7] to-[#fdfbf7] pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8c9c84]/10 rounded-full filter blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8c9c84]/10 rounded-full filter blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#8c9c84]/15 text-[#6b7a64] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-[#8c9c84]/30 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#8c9c84]" />
              <span>Pateros Wellness Sanctuary & Massage Spa</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#3a3a32] leading-[1.12]">
              {SPA_NAME}
            </h1>

            <p className="font-serif italic text-xl sm:text-2xl text-[#6b7a64] font-light">
              "{SPA_TAGLINE}"
            </p>

            <p className="text-base sm:text-lg text-[#4a4a40] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans opacity-90">
              Rejuvenate your body and soothe your mind with authentic therapeutic massages, hot stone treatments, cupping ventosa, and luxury botanical body scrubs. Select your preferred date and time slot in real-time.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onNavigate('appointment')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4a4a40] hover:bg-[#3a3a32] text-white font-semibold text-xs tracking-[0.2em] uppercase shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2.5"
              >
                <Calendar className="w-4 h-4 text-[#8c9c84]" />
                <span>Book Appointment Online</span>
              </button>

              <a
                href={`tel:${SPA_PHONES[0]}`}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-[#f2f2eb] text-[#4a4a40] font-semibold text-xs tracking-[0.15em] uppercase border border-[#e5e5db] shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#8c9c84]" />
                <span>Call {SPA_PHONES[0]}</span>
              </a>
            </div>

            {/* Quick Badges */}
            <div className="pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-[#e5e5db] text-center lg:text-left">
              <div>
                <p className="font-serif text-xl sm:text-2xl text-[#3a3a32]">₱299 - ₱1.6k</p>
                <p className="text-xs text-[#6b7a64] uppercase tracking-wider font-medium">Affordable Rates</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl text-[#3a3a32]">30–120 mins</p>
                <p className="text-xs text-[#6b7a64] uppercase tracking-wider font-medium">Tailored Sessions</p>
              </div>
              <div>
                <p className="font-serif text-xl sm:text-2xl text-[#3a3a32]">Live Slots</p>
                <p className="text-xs text-[#6b7a64] uppercase tracking-wider font-medium">Real-Time Sync</p>
              </div>
            </div>

          </div>

          {/* Right Hero Image & Quick Feature Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Decorative Image Frame */}
              <div className="rounded-[40px] overflow-hidden shadow-xl border-4 border-white bg-[#f2f2eb] aspect-[4/3] sm:aspect-[1/1] relative group">
                <img
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1000&q=80"
                  alt="MamaHands Aesthetics Spa Treatment"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs font-medium uppercase tracking-widest text-[#f2f2eb] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#8c9c84] text-[#8c9c84]" /> Rated 4.9/5 by Guests
                  </span>
                  <p className="font-serif text-lg font-normal">Pure Organic & Warm Oil Massages</p>
                  <p className="text-xs text-stone-200">24 B. Morcilla St., Poblacion, Pateros</p>
                </div>
              </div>

              {/* Floating Realtime Badge Card */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white p-4 rounded-3xl shadow-xl border border-[#e5e5db] flex items-center gap-3 max-w-xs animate-bounce-subtle">
                <div className="w-10 h-10 rounded-full bg-[#8c9c84]/20 text-[#6b7a64] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-[#8c9c84]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#3a3a32]">Instant Real-Time Slots</p>
                  <p className="text-[11px] text-[#6b7a64]">Bookings update automatically in live database</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* --- SERVICES MENU SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6b7a64]">
            Our Service Menu & Pricing
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#3a3a32]">
            Therapeutic Massages & Spa Treatments
          </h2>
          <p className="text-[#4a4a40] text-sm sm:text-base opacity-80">
            Choose from our curated selection of Premium Massages, Classic Basic Massages, and Add-on enhancements.
          </p>

          {/* Category Filter Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'premium', label: 'Premium Massage' },
              { id: 'basic', label: 'Basic Massage' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#8c9c84] text-white shadow-xs'
                    : 'bg-white text-[#4a4a40] hover:bg-[#f2f2eb] border border-[#e5e5db]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(service => (
            <div 
              key={service.id}
              className="bg-white rounded-[32px] overflow-hidden border border-[#e5e5db] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Image & Tag Header */}
              <div className="relative h-48 overflow-hidden bg-[#f2f2eb]">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {service.tag && (
                  <span className="absolute top-3 left-3 bg-[#8c9c84] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-xs">
                    {service.tag}
                  </span>
                )}

                <span className="absolute bottom-3 left-3 text-xs text-[#f2f2eb] font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  {service.category === 'premium' ? 'Premium Care' : 'Basic Care'}
                </span>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-normal text-[#3a3a32] group-hover:text-[#6b7a64] transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4a4a40] opacity-80 mt-2 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Signature Scents Badge if applicable */}
                  {service.hasSignatureScents && (
                    <div className="mt-3 p-3 rounded-2xl bg-[#f2f2eb] border border-[#e5e5db] text-xs">
                      <p className="font-bold text-[#6b7a64] mb-1 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                        <Droplet className="w-3.5 h-3.5 text-[#8c9c84]" /> Choice of Signature Scent:
                      </p>
                      <p className="text-[#3a3a32] font-medium">
                        🍋 Citrus Glow | 🥛 Milk Radiance | ☕ Coffee Revive
                      </p>
                    </div>
                  )}
                </div>

                {/* Duration & Price Options Grid */}
                <div className="space-y-3 pt-3 border-t border-[#e5e5db]">
                  <p className="text-xs text-[#6b7a64] uppercase tracking-widest font-bold">Available Durations & Rates:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {service.options.map(opt => (
                      <div 
                        key={opt.durationMinutes}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          opt.isPopular
                            ? 'bg-[#f2f2eb] border-[#8c9c84] text-[#3a3a32]'
                            : 'bg-[#fafafa] border-[#eee] text-[#4a4a40]'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-xs text-[#6b7a64] font-semibold">
                          <Clock className="w-3 h-3 text-[#8c9c84]" />
                          <span>{opt.durationMinutes} mins</span>
                        </div>
                        <p className="font-serif text-lg text-[#3a3a32] mt-0.5">
                          ₱{opt.pricePhp.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => {
                      onSelectServiceForBooking(service.id);
                      onNavigate('appointment');
                    }}
                    className="w-full mt-2 py-3 px-4 rounded-2xl bg-[#4a4a40] hover:bg-[#3a3a32] text-white font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <Calendar className="w-4 h-4 text-[#8c9c84]" />
                    <span>Select & Book Time Slot</span>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </section>

      {/* --- ADD-ONS SECTION --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f2f2eb] rounded-[40px] p-8 sm:p-12 border border-[#e5e5db] shadow-xs">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6b7a64]">
              Enhance Your Experience
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#3a3a32]">
              Add-Ons Services
            </h2>
            <p className="text-sm text-[#4a4a40] opacity-80">
              Complement any massage with our specialized add-on therapies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {ADD_ON_SERVICES.map(addon => (
              <div 
                key={addon.id}
                className="bg-white p-6 rounded-3xl border border-[#e5e5db] flex items-start justify-between gap-4 shadow-xs hover:border-[#8c9c84] transition-all"
              >
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-[#3a3a32]">
                    {addon.name}
                  </h3>
                  <p className="text-xs text-[#6b7a64]">
                    {addon.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif text-xl text-[#6b7a64] font-medium">
                    +₱{addon.pricePhp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SIGNATURE SCENTS HIGHLIGHT --- */}
      <section className="bg-[#3a3a32] text-[#fdfbf7] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#8c9c84]">
              Holistic Body Scrub Aromas
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal">
              Our Signature Scents
            </h2>
            <p className="text-[#f2f2eb]/80 text-sm">
              Paired exclusively with our 120-minute Holistic Massage w/ Body Scrub (₱ 1,699).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SIGNATURE_SCENTS.map(scent => (
              <div 
                key={scent.name}
                className="bg-[#4a4a40] p-8 rounded-[32px] border border-[#5a5a4e] text-center space-y-4 hover:border-[#8c9c84] transition-colors"
              >
                <div className="text-5xl">{scent.icon}</div>
                <h3 className="font-serif text-2xl font-normal text-[#fdfbf7]">
                  {scent.name}
                </h3>
                <p className="text-xs text-[#f2f2eb]/70 leading-relaxed">
                  {scent.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LOCATION & WHY CHOOSE US --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6b7a64]">
              Why Guests Love MamaHands
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#3a3a32]">
              Elevated Care for Natural Beauty & Wellbeing
            </h2>

            <div className="space-y-4">
              {[
                { title: "Licensed & Experienced Massage Therapists", desc: "Our skilled therapists tailor stroke pressure precisely to your body's specific comfort level." },
                { title: "Pure Aromatic Oils & Organic Scrubs", desc: "We use hypoallergenic natural oils and freshly blended body scrubs." },
                { title: "Pristine Hygienic Environment", desc: "Fresh laundered linens, sterilized equipment, and peaceful ambient rooms for each session." },
                { title: "Real-Time Online Slot Reservations", desc: "No long waiting times in the spa lounge. Reserve your precise therapist slot online." },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#8c9c84]/20 text-[#6b7a64] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-[#8c9c84]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#3a3a32]">{item.title}</h4>
                    <p className="text-xs text-[#6b7a64] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="px-6 py-3.5 rounded-2xl bg-[#8c9c84] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#6b7a64] transition-all flex items-center gap-2"
              >
                <span>Read More About Our Spa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Location Box */}
          <div className="bg-white p-8 rounded-[40px] border border-[#e5e5db] shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-[#e5e5db] pb-4">
              <MapPin className="w-6 h-6 text-[#8c9c84]" />
              <div>
                <h3 className="font-serif text-xl text-[#3a3a32]">Visit Our Pateros Spa</h3>
                <p className="text-xs text-[#6b7a64]">MamaHands Aesthetics & Spa</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#4a4a40]">
              <p><strong>Address:</strong> {SPA_LOCATION}</p>
              <p><strong>Operating Hours:</strong> 10:00 AM – 10:00 PM Daily</p>
              <p><strong>Hotlines:</strong> {SPA_PHONES.join(" / ")}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(SPA_LOCATION)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center py-3.5 rounded-2xl bg-[#f2f2eb] hover:bg-[#e5e5db] text-[#3a3a32] font-semibold text-xs tracking-wider uppercase border border-[#e5e5db] transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[#8c9c84]" />
                <span>Open in Google Maps</span>
              </a>

              <button
                onClick={() => onNavigate('appointment')}
                className="w-full py-3.5 rounded-2xl bg-[#4a4a40] hover:bg-[#3a3a32] text-white font-semibold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar className="w-4 h-4 text-[#8c9c84]" />
                <span>Book Appointment Now</span>
              </button>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
