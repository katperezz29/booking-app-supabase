import React from 'react';
import { Page } from '../types';
import { SPA_NAME, SPA_TAGLINE, SPA_LOCATION, SPA_PHONES, SPA_HOURS, SPA_SERVICES, ADD_ON_SERVICES } from '../data/services';
import { MapPin, Phone, Clock, Sparkles, Heart, ShieldCheck, Award, Users, CheckCircle } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-[#6b7a64] bg-[#8c9c84]/15 px-4 py-1.5 rounded-full border border-[#8c9c84]/30">
          About MamaHands Aesthetics & Spa
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#3a3a32]">
          {SPA_NAME}
        </h1>
        <p className="font-serif italic text-xl text-[#6b7a64]">
          "{SPA_TAGLINE}"
        </p>
        <p className="text-[#4a4a40] text-sm sm:text-base leading-relaxed opacity-90">
          Located in Pateros, Metro Manila, MamaHands Aesthetics & Spa was founded to provide a peaceful sanctuary where guests can release daily physical tension, restore vital energy, and experience pure therapeutic pampering.
        </p>
      </div>

      {/* Philosophy & Photo Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-6">
          <h2 className="font-serif text-3xl font-normal text-[#3a3a32]">
            Our Care Philosophy
          </h2>
          <p className="text-sm text-[#4a4a40] leading-relaxed">
            At MamaHands, we believe massage therapy is not merely a luxury—it is an essential pillar of wellness and body maintenance. Every touch is administered with intention, precision, and deep respect for your body's natural anatomy.
          </p>
          <p className="text-sm text-[#4a4a40] leading-relaxed">
            Whether you are seeking deep-tissue relief from intense workouts, classic hilot relaxation, or holistic body exfoliation infused with natural coffee or milk, our certified spa therapists ensure a memorable experience.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#f2f2eb] border border-[#e5e5db]">
              <Award className="w-6 h-6 text-[#8c9c84] mb-2" />
              <h3 className="font-serif font-bold text-[#3a3a32] text-sm">Certified Skilled Therapists</h3>
              <p className="text-xs text-[#6b7a64] mt-1">Trained in anatomy, pressure-points, and traditional cupping.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#f2f2eb] border border-[#e5e5db]">
              <Sparkles className="w-6 h-6 text-[#8c9c84] mb-2" />
              <h3 className="font-serif font-bold text-[#3a3a32] text-sm">Aromatic Organic Oils</h3>
              <p className="text-xs text-[#6b7a64] mt-1">Natural botanical essences designed to hydrate and soothe.</p>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[32px] overflow-hidden shadow-xs h-64 border-2 border-white">
            <img 
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80" 
              alt="Massage Therapy" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-[32px] overflow-hidden shadow-xs h-64 border-2 border-white mt-6">
            <img 
              src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80" 
              alt="Hot Stone Therapy" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>

      {/* Official Price List Reference Table (Directly matching the flyer image) */}
      <div className="bg-white rounded-[40px] p-6 sm:p-10 border border-[#e5e5db] shadow-xs space-y-8">
        <div className="text-center space-y-2 border-b border-[#e5e5db] pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6b7a64]">
            Official Spa Menu Reference
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#3a3a32]">
            Complete Services & Pricing
          </h2>
          <p className="text-xs text-[#6b7a64]">
            Prices in Philippine Pesos (₱ PHP) as displayed on official menu board
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Premium Massage Table */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-[#6b7a64] border-b-2 border-[#8c9c84] pb-1 flex items-center justify-between font-semibold">
              <span>Premium Massage</span>
              <span className="text-xs font-sans text-[#6b7a64] uppercase tracking-wider">Duration / Price</span>
            </h3>

            <div className="space-y-3">
              {SPA_SERVICES.filter(s => s.category === 'premium').map(service => (
                <div key={service.id} className="p-4 rounded-2xl bg-[#f2f2eb] border border-[#e5e5db] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-[#3a3a32] text-sm">{service.name}</h4>
                    {service.tag && (
                      <span className="text-[10px] bg-[#8c9c84] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {service.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {service.options.map(opt => (
                      <span key={opt.durationMinutes} className="bg-white px-3 py-1 rounded-lg border border-[#e5e5db] font-medium text-[#3a3a32]">
                        {opt.durationMinutes} mins — <strong className="text-[#6b7a64]">₱{opt.pricePhp}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Massage Table */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg text-[#6b7a64] border-b-2 border-[#8c9c84] pb-1 flex items-center justify-between font-semibold">
              <span>Basic Massage</span>
              <span className="text-xs font-sans text-[#6b7a64] uppercase tracking-wider">Duration / Price</span>
            </h3>

            <div className="space-y-3">
              {SPA_SERVICES.filter(s => s.category === 'basic').map(service => (
                <div key={service.id} className="p-4 rounded-2xl bg-[#f2f2eb] border border-[#e5e5db] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-[#3a3a32] text-sm">{service.name}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {service.options.map(opt => (
                      <span key={opt.durationMinutes} className="bg-white px-3 py-1 rounded-lg border border-[#e5e5db] font-medium text-[#3a3a32]">
                        {opt.durationMinutes} mins — <strong className="text-[#6b7a64]">₱{opt.pricePhp}</strong>
                      </span>
                    ))}
                  </div>
                  {service.hasSignatureScents && (
                    <p className="text-[11px] text-[#6b7a64] font-medium italic">
                      Scents: Citrus Glow | Milk Radiance | Coffee Revive
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Add-ons & Contact Banner */}
        <div className="pt-4 border-t border-[#e5e5db] grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#3a3a32] text-white p-6 rounded-2xl space-y-2">
            <h4 className="font-serif font-normal text-[#fdfbf7] text-base">Add-Ons Services</h4>
            <ul className="text-xs space-y-1 text-[#f2f2eb]/80">
              {ADD_ON_SERVICES.map(addon => (
                <li key={addon.id} className="flex justify-between">
                  <span>• {addon.name}</span>
                  <strong className="text-[#8c9c84]">₱{addon.pricePhp}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#f2f2eb] p-6 rounded-2xl border border-[#e5e5db] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-serif font-bold text-[#3a3a32] text-base">Book Now Hotlines</h4>
              <p className="text-xs text-[#4a4a40] mt-1">{SPA_PHONES.join(" / ")}</p>
              <p className="text-xs text-[#6b7a64] mt-0.5">{SPA_LOCATION}</p>
            </div>
            <button
              onClick={() => onNavigate('appointment')}
              className="w-full py-3 rounded-xl bg-[#4a4a40] text-white text-xs font-semibold uppercase tracking-widest hover:bg-[#3a3a32] transition-colors"
            >
              Go to Online Booking Form
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
