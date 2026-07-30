import React, { useState } from 'react';
import { Page } from '../types';
import { SPA_NAME, SPA_PHONES } from '../data/services';
import { isSupabaseConfigured } from '../lib/supabase';
import { Calendar, Clock, MapPin, Menu, Phone, Sparkles, X, ShieldCheck, Database } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenSupabaseModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = currentPage === 'administrator' || currentPage === 'schedule-admin';

  // Public Nav Items (Staff Schedule & Supabase are hidden publicly)
  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'home', label: 'Home', icon: <Sparkles className="w-4 h-4" /> },
    { page: 'about', label: 'About Spa', icon: <MapPin className="w-4 h-4" /> },
    { page: 'appointment', label: 'Book Appointment', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7]/95 backdrop-blur-md border-b border-[#e5e5db] shadow-xs transition-all">
      {/* Top Bar with Phone & Location */}
      <div className="bg-[#3a3a32] text-[#f2f2eb] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 text-[#8c9c84] font-medium">
              <MapPin className="w-3.5 h-3.5" /> 24 B. Morcilla St., Pateros, Metro Manila
            </span>
            <span className="hidden md:inline text-[#6a6a60]">|</span>
            <span className="hidden md:flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8c9c84]" /> Open Daily 10:00 AM – 10:00 PM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={`tel:${SPA_PHONES[0]}`} 
              className="flex items-center gap-1 text-[#f2f2eb] hover:text-[#8c9c84] transition-colors font-medium"
            >
              <Phone className="w-3 h-3 text-[#8c9c84]" /> {SPA_PHONES[0]}
            </a>
            
            {/* Supabase Connection is ONLY shown when user is in the Administrator view */}
            {isAdminPage && (
              <>
                <span className="text-[#6a6a60]">•</span>
                <button
                  onClick={onOpenSupabaseModal}
                  className="flex items-center gap-1 text-xs bg-[#4a4a40] hover:bg-[#5c5c50] text-[#f2f2eb] px-2.5 py-1 rounded-md transition-all border border-[#6a6a60]"
                  title="Database & Vercel deployment instructions"
                >
                  <Database className="w-3 h-3 text-[#8c9c84]" />
                  <span>Supabase {isSupabaseConfigured ? 'Connected' : 'Setup'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button 
          onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }} 
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="w-11 h-11 rounded-full bg-[#8c9c84] text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs group-hover:scale-105 transition-transform border border-white/40">
            MH
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl font-semibold text-[#3a3a32] tracking-tight leading-tight group-hover:text-[#6b7a64] transition-colors">
              {SPA_NAME}
            </h1>
            <p className="text-xs text-[#6b7a64] italic font-sans">
              Where Calm Begins, and Care Continues.
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            const isAppointment = item.page === 'appointment';
            
            if (isAppointment) {
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`ml-3 px-6 py-2.5 rounded-full font-medium text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all transform active:scale-95 ${
                    isActive
                      ? 'bg-[#8c9c84] text-white ring-2 ring-[#8c9c84]/30'
                      : 'bg-[#4a4a40] text-white hover:bg-[#3a3a32]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#f2f2eb]" />
                  <span>Book Now</span>
                </button>
              );
            }

            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'text-[#3a3a32] bg-[#f2f2eb] font-semibold'
                    : 'text-[#4a4a40] hover:text-[#3a3a32] hover:bg-[#f2f2eb]/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => onNavigate('appointment')}
            className="px-4 py-1.5 rounded-full bg-[#8c9c84] text-white text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#3a3a32] hover:bg-[#f2f2eb] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fdfbf7] border-b border-[#e5e5db] px-4 pt-2 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-[#8c9c84] text-white'
                    : 'text-[#3a3a32] hover:bg-[#f2f2eb]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-[#e5e5db] flex items-center justify-between text-xs text-[#6b7a64]">
            <span>Pateros, Metro Manila</span>
            {isAdminPage && (
              <button
                onClick={() => { onOpenSupabaseModal(); setMobileMenuOpen(false); }}
                className="text-[#3a3a32] font-semibold underline flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5 text-[#8c9c84]" /> Database Setup
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
