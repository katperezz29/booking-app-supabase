import React from 'react';
import { Page } from '../types';
import { SPA_NAME, SPA_TAGLINE, SPA_LOCATION, SPA_PHONES, SPA_HOURS } from '../data/services';
import { MapPin, Phone, Clock, Sparkles, Heart, ShieldCheck, ChevronRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: Page) => void;
  onOpenSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSupabaseModal }) => {
  return (
    <footer className="bg-[#3a3a32] text-[#f2f2eb] pt-16 pb-8 border-t border-[#4a4a40]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8c9c84] text-white flex items-center justify-center font-serif text-lg font-bold border border-white/30">
                MH
              </div>
              <h2 className="font-serif text-xl font-bold text-[#fdfbf7]">
                {SPA_NAME}
              </h2>
            </div>
            <p className="text-sm italic text-[#d5d5cc]">
              "{SPA_TAGLINE}"
            </p>
            <p className="text-xs text-[#b8b8ad] leading-relaxed">
              Your premier sanctuary for authentic therapeutic massages, holistic body scrubs, and soothing wellness treatments in Pateros.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#8c9c84]">
              <ShieldCheck className="w-4 h-4 text-[#8c9c84]" />
              <span className="text-[#f2f2eb]">Certified Professional Therapists</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#fdfbf7] tracking-wider uppercase text-xs">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-sm text-[#d5d5cc]">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="hover:text-[#8c9c84] transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#8c9c84]" /> Home Sanctuary
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')} 
                  className="hover:text-[#8c9c84] transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#8c9c84]" /> About & Facilities
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('appointment')} 
                  className="hover:text-[#8c9c84] transition-colors flex items-center gap-1.5 font-medium text-[#8c9c84]"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#8c9c84]" /> Book Online Appointment
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('administrator')} 
                  className="hover:text-[#8c9c84] transition-colors flex items-center gap-1.5 opacity-75 hover:opacity-100"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#8c9c84]" /> Administrator Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Spa Services Summary */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#fdfbf7] tracking-wider uppercase text-xs">
              Popular Treatments
            </h3>
            <ul className="space-y-1.5 text-xs text-[#d5d5cc]">
              <li>• Deep Relaxation Massage (90/120 mins)</li>
              <li>• Traditional Pinoy Massage (60/90 mins)</li>
              <li>• Hot Stone Therapy & Ventosa</li>
              <li>• Holistic Massage w/ Body Scrub (Citrus, Milk, Coffee)</li>
              <li>• Add-ons: Ear Candling & Hydrating Mask</li>
            </ul>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#fdfbf7] tracking-wider uppercase text-xs">
              Contact & Location
            </h3>
            <div className="space-y-2 text-xs text-[#d5d5cc]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8c9c84] shrink-0 mt-0.5" />
                <span>{SPA_LOCATION}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-[#8c9c84] shrink-0" />
                <div className="flex flex-col">
                  {SPA_PHONES.map(phone => (
                    <a key={phone} href={`tel:${phone}`} className="hover:text-[#8c9c84] transition-colors">
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Clock className="w-4 h-4 text-[#8c9c84] shrink-0" />
                <span>{SPA_HOURS}</span>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                onClick={onOpenSupabaseModal}
                className="w-full text-left text-xs bg-[#4a4a40] hover:bg-[#5a5a4e] text-[#f2f2eb] p-2.5 rounded-xl border border-[#5a5a4e] flex items-center justify-between transition-colors"
              >
                <span>Supabase & Vercel Guide</span>
                <Sparkles className="w-3.5 h-3.5 text-[#8c9c84]" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#4a4a40] flex flex-col sm:flex-row items-center justify-between text-xs text-[#a8a89c] gap-4">
          <p>© {new Date().getFullYear()} {SPA_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[#b8b8ad]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#8c9c84] fill-[#8c9c84]" />
            <span>for peaceful mind & body rejuvenation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
