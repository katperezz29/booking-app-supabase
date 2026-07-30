import React, { useState, useEffect } from 'react';
import { AppointmentBooking, BookingStatus, Page } from '../types';
import { fetchAppointments, updateAppointmentStatus, subscribeToAppointments, isSupabaseConfigured } from '../lib/supabase';
import { SPA_NAME } from '../data/services';
import { 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  Download, 
  RefreshCw, 
  Filter, 
  UserCheck, 
  Phone, 
  Sparkles,
  Database,
  Lock,
  Unlock
} from 'lucide-react';

interface ScheduleAdminPageProps {
  onNavigate: (page: Page) => void;
  onOpenSupabaseModal: () => void;
}

export const ScheduleAdminPage: React.FC<ScheduleAdminPageProps> = ({
  onNavigate,
  onOpenSupabaseModal
}) => {
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>(''); // empty means all dates
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pin protection state (simple staff access password)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default open, pin can be toggled
  const [pinInput, setPinInput] = useState<string>('');

  const loadAllSchedule = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAppointments(filterDate || undefined);
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching admin schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllSchedule();

    const unsubscribe = subscribeToAppointments(() => {
      loadAllSchedule();
    });

    return () => unsubscribe();
  }, [filterDate]);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      loadAllSchedule();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Filtered dataset
  const filteredAppointments = appointments.filter(b => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Booking Ref", "Date", "Time", "Customer Name", "Phone", "Service", "Duration", "Price (PHP)", "Status", "Therapist Pref", "Notes"];
    const rows = filteredAppointments.map(b => [
      b.bookingRef,
      b.bookingDate,
      b.bookingTime,
      `"${b.customerName}"`,
      `"${b.customerPhone}"`,
      `"${b.serviceName}"`,
      `${b.durationMinutes} mins`,
      b.totalPricePhp,
      b.status,
      b.therapistGenderPreference,
      `"${b.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mamahands_spa_schedule_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5db] pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b7a64] bg-[#8c9c84]/15 px-3 py-1 rounded-full border border-[#8c9c84]/30">
              Staff & Receptionist Portal
            </span>
            <span className="text-xs text-[#6b7a64] bg-[#f2f2eb] px-2.5 py-1 rounded-full border border-[#e5e5db]">
              {isSupabaseConfigured ? 'Supabase Live Sync' : 'Local Storage Sync'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-[#3a3a32] mt-2">
            Spa Customer Schedule
          </h1>
          <p className="text-xs text-[#4a4a40] opacity-80">
            Monitor incoming appointments, update treatment statuses, and manage therapist bookings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadAllSchedule}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#e5e5db] text-xs font-medium text-[#3a3a32] hover:bg-[#f2f2eb] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#8c9c84]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-xl bg-[#4a4a40] text-white text-xs font-semibold hover:bg-[#3a3a32] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#8c9c84]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenSupabaseModal}
            className="px-3 py-2 rounded-xl bg-[#8c9c84] text-white text-xs font-semibold hover:bg-[#6b7a64] flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#f2f2eb]" />
            <span>Database Status</span>
          </button>
        </div>
      </div>

      {/* Control Filters & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        
        {/* Search Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#6b7a64] uppercase tracking-wider block">
            Search Customer / Ref
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#8c9c84] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Name, phone, or MH-ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e5db] text-xs focus:outline-none focus:ring-2 focus:ring-[#8c9c84]"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#6b7a64] uppercase tracking-wider block">
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#e5e5db] text-xs focus:outline-none focus:ring-2 focus:ring-[#8c9c84] bg-white"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#6b7a64] uppercase tracking-wider block">
            Status Filter
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[#e5e5db] text-xs focus:outline-none focus:ring-2 focus:ring-[#8c9c84] bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterDate('');
              setFilterStatus('all');
              setSearchQuery('');
            }}
            className="w-full py-2 rounded-xl bg-[#f2f2eb] hover:bg-[#e5e5db] text-[#3a3a32] text-xs font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>

      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-[32px] border border-[#e5e5db] shadow-xs overflow-hidden">
        
        <div className="p-4 bg-[#f2f2eb] border-b border-[#e5e5db] flex items-center justify-between text-xs font-bold text-[#3a3a32]">
          <span>Total Schedule Records Found: ({filteredAppointments.length})</span>
          {filterDate && <span>Showing for date: {filterDate}</span>}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#6b7a64] text-sm flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#8c9c84]" />
            <span>Loading schedule entries...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-[#8c9c84] mx-auto opacity-50" />
            <p className="font-serif text-lg text-[#3a3a32]">No appointments match your filter</p>
            <p className="text-xs text-[#6b7a64]">Try clearing the date filter or searching for another customer name.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#3a3a32] text-[#f2f2eb] font-serif uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Ref Code</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Treatment & Add-Ons</th>
                  <th className="p-4">Total Fee</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5db] text-[#3a3a32]">
                {filteredAppointments.map(item => (
                  <tr key={item.id} className="hover:bg-[#f2f2eb]/50 transition-colors">
                    
                    {/* Ref Code */}
                    <td className="p-4 font-mono font-bold text-[#8c9c84]">
                      {item.bookingRef}
                    </td>

                    {/* Schedule */}
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-[#3a3a32]">{item.bookingDate}</p>
                      <p className="text-xs text-[#6b7a64] font-semibold">{item.bookingTime}</p>
                    </td>

                    {/* Customer */}
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-sm text-[#3a3a32]">{item.customerName}</p>
                      <p className="text-[#6b7a64] font-mono text-[11px]">{item.customerPhone}</p>
                      <p className="text-[10px] text-[#8c9c84]">Pref: {item.therapistGenderPreference}</p>
                    </td>

                    {/* Treatment */}
                    <td className="p-4 space-y-1 max-w-xs">
                      <p className="font-serif font-bold">{item.serviceName} ({item.durationMinutes}m)</p>
                      {item.selectedScent && (
                        <span className="inline-block text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          Scent: {item.selectedScent}
                        </span>
                      )}
                      {item.selectedAddOns.length > 0 && (
                        <p className="text-[10px] text-stone-500">
                          Add-ons: {item.selectedAddOns.join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[10px] italic text-stone-500 bg-stone-50 p-1 rounded border border-stone-200">
                          "{item.notes}"
                        </p>
                      )}
                    </td>

                    {/* Fee */}
                    <td className="p-4 font-serif font-bold text-sm text-[#8B5A2B]">
                      ₱{item.totalPricePhp.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Quick Status Buttons */}
                    <td className="p-4 text-right space-x-1">
                      {item.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, 'completed')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'cancelled')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                            title="Cancel Appointment"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {item.status !== 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'confirmed')}
                          className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
