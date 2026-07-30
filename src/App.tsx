import React, { useState } from 'react';
import { Page } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { AppointmentPage } from './components/AppointmentPage';
import { ScheduleAdminPage } from './components/ScheduleAdminPage';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | undefined>(undefined);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState<boolean>(false);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceForBooking = (serviceId: string) => {
    setSelectedServiceIdForBooking(serviceId);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#4a4a40] font-sans flex flex-col selection:bg-[#8c9c84] selection:text-white antialiased">
      
      {/* Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectServiceForBooking={handleSelectServiceForBooking}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'appointment' && (
          <AppointmentPage
            initialServiceId={selectedServiceIdForBooking}
            onNavigate={handleNavigate}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />
        )}

        {currentPage === 'schedule-admin' && (
          <ScheduleAdminPage
            onNavigate={handleNavigate}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />

      {/* Supabase & Vercel Instructions Modal */}
      <SupabaseSetupModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

    </div>
  );
}
