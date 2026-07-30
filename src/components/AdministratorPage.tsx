import React, { useState, useEffect } from 'react';
import { AppointmentBooking, BookingStatus, Page } from '../types';
import { fetchAppointments, updateAppointmentStatus, subscribeToAppointments, isSupabaseConfigured } from '../lib/supabase';
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
  Unlock,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Check
} from 'lucide-react';

interface AdministratorPageProps {
  onNavigate: (page: Page) => void;
  onOpenSupabaseModal: () => void;
}

export const AdministratorPage: React.FC<AdministratorPageProps> = ({
  onNavigate,
  onOpenSupabaseModal
}) => {
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filterDate, setFilterDate] = useState<string>(''); // empty means all dates
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Analytics Stats
  const totalBookings = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  const totalRevenue = appointments
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.totalPricePhp || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.bookingDate === todayStr);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Booking Ref", "Date", "Time", "Customer Name", "Phone", "Email", "Service", "Duration", "Price (PHP)", "Status", "Therapist Pref", "Notes"];
    const rows = filteredAppointments.map(b => [
      b.bookingRef,
      b.bookingDate,
      b.bookingTime,
      `"${b.customerName}"`,
      `"${b.customerPhone}"`,
      `"${b.customerEmail || ''}"`,
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
    link.setAttribute("download", `mamahands_spa_customer_schedule_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5db] pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b7a64] bg-[#8c9c84]/15 px-3 py-1 rounded-full border border-[#8c9c84]/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Spa Administrator Portal
            </span>
            <span className="text-xs text-[#6b7a64] bg-[#f2f2eb] px-2.5 py-1 rounded-full border border-[#e5e5db]">
              {isSupabaseConfigured ? 'Supabase Live Sync' : 'Local Storage Sync'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-[#3a3a32] mt-2">
            Spa Customer Schedule
          </h1>
          <p className="text-xs text-[#4a4a40] opacity-80">
            Real-time control panel to view customer appointments, track spa revenue, update booking statuses, and configure database settings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadAllSchedule}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#e5e5db] text-xs font-medium text-[#3a3a32] hover:bg-[#f2f2eb] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#8c9c84]' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2 rounded-xl bg-[#4a4a40] text-white text-xs font-semibold hover:bg-[#3a3a32] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#8c9c84]" />
            <span>Export CSV</span>
          </button>

          {/* Supabase Connection Button (Exclusively accessible here in Admin Page) */}
          <button
            onClick={onOpenSupabaseModal}
            className="px-3.5 py-2 rounded-xl bg-[#8c9c84] text-white text-xs font-semibold hover:bg-[#6b7a64] flex items-center gap-1.5 transition-colors shadow-xs"
            title="Configure Supabase Database Connection & Migration"
          >
            <Database className="w-3.5 h-3.5 text-[#f2f2eb]" />
            <span>Supabase {isSupabaseConfigured ? 'Connection' : 'Setup'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6b7a64]">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4 text-[#8c9c84]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#3a3a32]">{totalBookings}</p>
          <p className="text-[11px] text-[#8c9c84]">Today: {todayAppointments.length} scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-emerald-800">{confirmedCount}</p>
          <p className="text-[11px] text-stone-500">Upcoming client visits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Completed</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-blue-800">{completedCount}</p>
          <p className="text-[11px] text-stone-500">Finished treatments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
            <span>Est. Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#3a3a32]">₱{totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-stone-500">From active bookings</p>
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
            <option value="all">All Statuses ({totalBookings})</option>
            <option value="confirmed">Confirmed ({confirmedCount})</option>
            <option value="completed">Completed ({completedCount})</option>
            <option value="cancelled">Cancelled ({cancelledCount})</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setFilterDate(todayStr)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
              filterDate === todayStr 
                ? 'bg-[#8c9c84] text-white' 
                : 'bg-[#f2f2eb] hover:bg-[#e5e5db] text-[#3a3a32]'
            }`}
          >
            Today's Schedule
          </button>
          
          <button
            onClick={() => {
              setFilterDate('');
              setFilterStatus('all');
              setSearchQuery('');
            }}
            className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium transition-colors"
            title="Show All Dates & Clear Search"
          >
            Reset
          </button>
        </div>

      </div>

      {/* Spa Customer Schedule Table */}
      <div className="bg-white rounded-[32px] border border-[#e5e5db] shadow-xs overflow-hidden">
        
        <div className="p-4 bg-[#f2f2eb] border-b border-[#e5e5db] flex items-center justify-between text-xs font-bold text-[#3a3a32] flex-wrap gap-2">
          <span>Customer Schedule Records ({filteredAppointments.length})</span>
          {filterDate ? (
            <span className="text-[#6b7a64] font-normal">Filtering for date: <strong>{filterDate}</strong></span>
          ) : (
            <span className="text-[#6b7a64] font-normal">Showing all upcoming & historical bookings</span>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#6b7a64] text-sm flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#8c9c84]" />
            <span>Fetching Spa Customer Schedule...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-[#8c9c84] mx-auto opacity-50" />
            <p className="font-serif text-lg text-[#3a3a32]">No customer appointments found</p>
            <p className="text-xs text-[#6b7a64]">Try selecting another date or clearing your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#3a3a32] text-[#f2f2eb] font-serif uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Ref Code</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Service & Add-Ons</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5db] text-[#3a3a32]">
                {filteredAppointments.map(item => (
                  <tr key={item.id} className="hover:bg-[#f2f2eb]/50 transition-colors">
                    
                    {/* Booking Reference */}
                    <td className="p-4 font-mono font-bold text-[#8c9c84]">
                      {item.bookingRef}
                    </td>

                    {/* Schedule Date & Time */}
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-[#3a3a32] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#8c9c84]" />
                        {item.bookingDate}
                      </p>
                      <p className="text-xs text-[#6b7a64] font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8c9c84]" />
                        {item.bookingTime}
                      </p>
                    </td>

                    {/* Customer Info */}
                    <td className="p-4 space-y-0.5">
                      <p className="font-bold text-sm text-[#3a3a32]">{item.customerName}</p>
                      <p className="text-[#6b7a64] font-mono text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#8c9c84]" />
                        {item.customerPhone}
                      </p>
                      <p className="text-[10px] text-[#8c9c84]">Therapist Pref: {item.therapistGenderPreference}</p>
                    </td>

                    {/* Service & Add-Ons */}
                    <td className="p-4 space-y-1 max-w-xs">
                      <p className="font-serif font-bold text-[#3a3a32]">{item.serviceName} ({item.durationMinutes} mins)</p>
                      {item.selectedScent && (
                        <span className="inline-block text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                          Scent: {item.selectedScent}
                        </span>
                      )}
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <p className="text-[10px] text-stone-500">
                          Add-ons: {item.selectedAddOns.join(', ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-[10px] italic text-stone-500 bg-stone-50 p-1.5 rounded-lg border border-stone-200">
                          "{item.notes}"
                        </p>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 font-serif font-bold text-sm text-[#8c9c84]">
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

                    {/* Quick Status Actions */}
                    <td className="p-4 text-right space-x-1">
                      {item.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, 'completed')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs"
                            title="Mark as Completed"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'cancelled')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs"
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
