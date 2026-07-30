import React, { useState, useEffect } from 'react';
import { Page } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { AppointmentPage } from './components/AppointmentPage';
import { AdministratorPage } from './components/AdministratorPage';
import { TherapistPortalPage } from './components/TherapistPortalPage';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedServiceIdForBooking, setSelectedServiceIdForBooking] = useState<string | undefined>(undefined);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  const [supabaseModalOpen, setSupabaseModalOpen] = useState<boolean>(false);

  // Parse path for URL-based navigation (/administrator, /about, /appointment, /${uuid})
  useEffect(() => {
    const syncPageFromPath = () => {
      const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
      const pathLower = rawPath.toLowerCase();

      if (UUID_REGEX.test(rawPath)) {
        setSelectedTherapistId(rawPath);
        setCurrentPage('therapist-portal');
      } else if (pathLower.startsWith('therapist/') && UUID_REGEX.test(rawPath.replace('therapist/', ''))) {
        const id = rawPath.replace('therapist/', '');
        setSelectedTherapistId(id);
        setCurrentPage('therapist-portal');
      } else if (pathLower.includes('administrator') || pathLower.includes('admin')) {
        setCurrentPage('administrator');
      } else if (pathLower.includes('about')) {
        setCurrentPage('about');
      } else if (pathLower.includes('appointment') || pathLower.includes('book')) {
        setCurrentPage('appointment');
      } else {
        setCurrentPage('home');
      }
    };

    syncPageFromPath();
    window.addEventListener('popstate', syncPageFromPath);
    return () => window.removeEventListener('popstate', syncPageFromPath);
  }, []);

  const handleNavigate = (page: Page, therapistId?: string) => {
    setCurrentPage(page);
    let path = '/';
    if (page === 'about') path = '/about';
    else if (page === 'appointment') path = '/appointment';
    else if (page === 'administrator' || page === 'schedule-admin') path = '/administrator';
    else if (page === 'therapist-portal' && (therapistId || selectedTherapistId)) {
      const id = therapistId || selectedTherapistId;
      setSelectedTherapistId(id);
      path = `/${id}`;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
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

        {(currentPage === 'administrator' || currentPage === 'schedule-admin') && (
          <AdministratorPage
            onNavigate={handleNavigate}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />
        )}

        {currentPage === 'therapist-portal' && (
          <TherapistPortalPage
            therapistId={selectedTherapistId}
            onNavigate={handleNavigate}
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
