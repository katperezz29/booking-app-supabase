import React, { useState, useEffect } from 'react';
import { Therapist, AppointmentBooking, Page } from '../types';
import { fetchTherapistById, fetchAppointments, updateTherapist, subscribeToAppointments } from '../lib/supabase';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowLeft,
  Briefcase,
  ShieldAlert,
  CalendarCheck,
  UserX
} from 'lucide-react';

interface TherapistPortalPageProps {
  therapistId: string;
  onNavigate: (page: Page) => void;
}

export const TherapistPortalPage: React.FC<TherapistPortalPageProps> = ({
  therapistId,
  onNavigate
}) => {
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [leaveReasonInput, setLeaveReasonInput] = useState<string>('');
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const t = await fetchTherapistById(therapistId);
      setTherapist(t);
      if (t) {
        const allBookings = await fetchAppointments();
        // Filter appointments assigned to this therapist either by ID or Name
        const assigned = allBookings.filter(b => 
          b.therapistId === t.id || 
          (b.therapistName && b.therapistName.toLowerCase() === t.name.toLowerCase())
        );
        setAppointments(assigned);
      }
    } catch (err) {
      console.error('Error loading therapist portal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribe = subscribeToAppointments(() => {
      loadData();
    });

    return () => unsubscribe();
  }, [therapistId]);

  const handleToggleStatus = async (newStatus: 'available' | 'on_leave') => {
    if (!therapist) return;
    if (newStatus === 'on_leave' && !showLeaveModal) {
      setShowLeaveModal(true);
      return;
    }

    try {
      await updateTherapist(therapist.id, {
        status: newStatus,
        leaveReason: newStatus === 'on_leave' ? leaveReasonInput || 'On Leave' : ''
      });
      setShowLeaveModal(false);
      setLeaveReasonInput('');
      loadData();
    } catch (err) {
      console.error('Failed to update therapist status:', err);
    }
  };

  const copyScheduleLink = () => {
    const fullUrl = `${window.location.origin}/${therapistId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#8c9c84] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-serif text-[#3a3a32]">Loading Therapist Schedule...</p>
      </div>
    );
  }

  // If therapist is deleted or not found
  if (!therapist) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-rose-200 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <UserX className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              404 Not Found
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#3a3a32]">
              Therapist Page Not Available
            </h1>
            <p className="text-sm text-[#4a4a40] max-w-md mx-auto">
              This therapist profile or schedule link (UUID: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">{therapistId}</code>) has been deleted or is no longer available in the spa roster.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 rounded-xl bg-[#3a3a32] text-white text-xs font-semibold hover:bg-black transition-colors shadow-xs flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <button
              onClick={() => onNavigate('administrator')}
              className="px-5 py-2.5 rounded-xl bg-[#8c9c84] text-white text-xs font-semibold hover:bg-[#6b7a64] transition-colors shadow-xs"
            >
              Go to Administrator Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.bookingDate === todayStr && a.status !== 'cancelled');
  const upcomingAppointments = appointments.filter(a => a.bookingDate > todayStr && a.status !== 'cancelled');
  const pastOrCancelled = appointments.filter(a => a.bookingDate < todayStr || a.status === 'cancelled');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#e5e5db] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#e5e5db] pb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#8c9c84]/20 text-[#6b7a64] flex items-center justify-center font-serif text-2xl font-bold border border-[#8c9c84]/30">
              {therapist.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6b7a64] bg-[#8c9c84]/15 px-3 py-1 rounded-full border border-[#8c9c84]/30 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Therapist Portal
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  therapist.status === 'available'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {therapist.status === 'available' ? 'Available Today' : `On Leave ${therapist.leaveReason ? `(${therapist.leaveReason})` : ''}`}
                </span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#3a3a32] mt-1">
                {therapist.name}
              </h1>
              <p className="text-xs text-[#6b7a64] font-mono mt-0.5">
                UUID: {therapist.id}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={copyScheduleLink}
              className="px-3.5 py-2 rounded-xl bg-[#f2f2eb] hover:bg-[#e5e5db] text-[#3a3a32] text-xs font-medium flex items-center gap-1.5 transition-colors border border-[#e5e5db]"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8c9c84]" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Portal Link'}</span>
            </button>

            {therapist.status === 'available' ? (
              <button
                onClick={() => handleToggleStatus('on_leave')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Set On Leave / Off Duty
              </button>
            ) : (
              <button
                onClick={() => handleToggleStatus('available')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Mark Available Today
              </button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#4a4a40]">
            <Phone className="w-4 h-4 text-[#8c9c84]" />
            <span>Phone: <strong>{therapist.phone}</strong></span>
          </div>
          {therapist.email && (
            <div className="flex items-center gap-2 text-[#4a4a40]">
              <Mail className="w-4 h-4 text-[#8c9c84]" />
              <span>Email: <strong>{therapist.email}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[#4a4a40]">
            <Briefcase className="w-4 h-4 text-[#8c9c84]" />
            <span>Specialties: <strong>{therapist.specialties.join(', ')}</strong></span>
          </div>
        </div>
      </div>

      {/* Leave Reason Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-[#e5e5db]">
            <h3 className="font-serif font-bold text-lg text-[#3a3a32]">Mark On Leave / Off Duty</h3>
            <p className="text-xs text-[#6b7a64]">
              Please state the reason for going on leave today (e.g. Vacation, Sick Leave, Family Event).
            </p>
            <input
              type="text"
              placeholder="Leave reason (e.g., Personal Leave)"
              value={leaveReasonInput}
              onChange={(e) => setLeaveReasonInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleStatus('on_leave')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                Confirm On Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#3a3a32] flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#8c9c84]" />
            Today's Assigned Appointments ({todayAppointments.length})
          </h2>
          <span className="text-xs font-semibold text-[#6b7a64] bg-[#f2f2eb] px-3 py-1 rounded-full border border-[#e5e5db]">
            Date: {todayStr}
          </span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#e5e5db] text-center space-y-2">
            <Calendar className="w-8 h-8 text-[#8c9c84] mx-auto opacity-50" />
            <p className="font-serif text-base text-[#3a3a32]">No sessions scheduled for today</p>
            <p className="text-xs text-[#6b7a64]">You have a clear schedule for today, {therapist.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayAppointments.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-3xl border border-[#e5e5db] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="font-mono text-xs font-bold text-[#8c9c84]">{item.bookingRef}</span>
                  <span className="text-xs font-semibold bg-[#f2f2eb] px-2.5 py-1 rounded-lg text-[#3a3a32]">
                    <Clock className="w-3 h-3 inline mr-1 text-[#8c9c84]" />
                    {item.bookingTime} ({item.durationMinutes} mins)
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3a3a32]">{item.customerName}</h3>
                  <p className="text-xs text-[#6b7a64] flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-[#8c9c84]" /> {item.customerPhone}
                  </p>
                </div>

                <div className="bg-[#f2f2eb]/70 p-3 rounded-2xl text-xs space-y-1">
                  <p className="font-semibold text-[#3a3a32]">{item.serviceName}</p>
                  {item.selectedScent && <p className="text-amber-800">Scent: {item.selectedScent}</p>}
                  {item.selectedAddOns.length > 0 && <p className="text-stone-600">Add-ons: {item.selectedAddOns.join(', ')}</p>}
                  {item.notes && <p className="italic text-stone-500 pt-1">"{item.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming & All History */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#3a3a32] flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#8c9c84]" />
          Upcoming & All Assigned Appointments ({appointments.length})
        </h2>

        {appointments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#e5e5db] text-center space-y-2">
            <Briefcase className="w-8 h-8 text-[#8c9c84] mx-auto opacity-50" />
            <p className="font-serif text-base text-[#3a3a32]">No appointments assigned yet</p>
            <p className="text-xs text-[#6b7a64]">Spa receptionists can assign incoming clients to you from the Administrator Page.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#e5e5db] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3a3a32] text-[#f2f2eb] font-serif uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Ref Code</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5db] text-[#3a3a32]">
                  {appointments.map(item => (
                    <tr key={item.id} className="hover:bg-[#f2f2eb]/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#8c9c84]">{item.bookingRef}</td>
                      <td className="p-4">
                        <p className="font-bold">{item.bookingDate}</p>
                        <p className="text-stone-500">{item.bookingTime}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold">{item.customerName}</p>
                        <p className="text-stone-500 font-mono text-[11px]">{item.customerPhone}</p>
                      </td>
                      <td className="p-4">{item.serviceName}</td>
                      <td className="p-4">{item.durationMinutes} mins</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
