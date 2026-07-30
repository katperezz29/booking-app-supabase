import React, { useState, useEffect } from 'react';
import { AppointmentBooking, BookingStatus, Page, Therapist, TherapistStatus } from '../types';
import { 
  fetchAppointments, 
  updateAppointmentStatus, 
  subscribeToAppointments, 
  isSupabaseConfigured,
  fetchTherapists,
  createTherapist,
  updateTherapist,
  deleteTherapist,
  assignTherapistToAppointment
} from '../lib/supabase';
import { 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Phone, 
  Database,
  Download, 
  RefreshCw, 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  Users, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle,
  Briefcase,
  UserX,
  X,
  HeartHandshake,
  DollarSign,
  CalendarCheck
} from 'lucide-react';

interface AdministratorPageProps {
  onNavigate: (page: Page, therapistId?: string) => void;
  onOpenSupabaseModal: () => void;
}

export const AdministratorPage: React.FC<AdministratorPageProps> = ({
  onNavigate,
  onOpenSupabaseModal
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'therapists'>('appointments');
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters for appointments
  const [filterDate, setFilterDate] = useState<string>(''); 
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Therapist Modal state
  const [showAddTherapistModal, setShowAddTherapistModal] = useState<boolean>(false);
  const [showEditTherapistModal, setShowEditTherapistModal] = useState<boolean>(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  
  // Therapist Form Fields
  const [tName, setTName] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tGender, setTGender] = useState<'Female' | 'Male'>('Female');
  const [tSpecialties, setTSpecialties] = useState('');
  const [tStatus, setTStatus] = useState<TherapistStatus>('available');
  const [tLeaveReason, setTLeaveReason] = useState('');

  // Therapist Assignment Modal State for Appointment
  const [assigningAppointmentId, setAssigningAppointmentId] = useState<string | null>(null);
  const [selectedTherapistIdForAssign, setSelectedTherapistIdForAssign] = useState<string>('');
  const [customTherapistNameInput, setCustomTherapistNameInput] = useState<string>('');

  // Toast / Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [appData, thData] = await Promise.all([
        fetchAppointments(filterDate || undefined),
        fetchTherapists()
      ]);
      setAppointments(appData);
      setTherapists(thData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    const unsubscribe = subscribeToAppointments(() => {
      loadAllData();
    });

    return () => unsubscribe();
  }, [filterDate]);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      loadAllData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Assign Therapist handler
  const handleAssignTherapistSubmit = async () => {
    if (!assigningAppointmentId) return;
    
    let chosenId: string | null = null;
    let chosenName: string | null = null;

    if (selectedTherapistIdForAssign === 'custom') {
      chosenName = customTherapistNameInput.trim() || 'Assigned Therapist';
    } else if (selectedTherapistIdForAssign) {
      const found = therapists.find(t => t.id === selectedTherapistIdForAssign);
      if (found) {
        chosenId = found.id;
        chosenName = found.name;
      }
    }

    try {
      await assignTherapistToAppointment(assigningAppointmentId, chosenId, chosenName);
      setAssigningAppointmentId(null);
      setSelectedTherapistIdForAssign('');
      setCustomTherapistNameInput('');
      loadAllData();
    } catch (err) {
      console.error('Failed to assign therapist:', err);
    }
  };

  // Therapist CRUD
  const handleCreateTherapistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName || !tPhone) return;

    try {
      const specialtiesArr = tSpecialties
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await createTherapist({
        name: tName,
        phone: tPhone,
        email: tEmail,
        gender: tGender,
        specialties: specialtiesArr.length > 0 ? specialtiesArr : ['Swedish Massage'],
        status: tStatus,
        leaveReason: tStatus === 'on_leave' ? tLeaveReason : ''
      });

      setShowAddTherapistModal(false);
      resetTherapistForm();
      loadAllData();
    } catch (err) {
      console.error('Failed to create therapist:', err);
    }
  };

  const handleUpdateTherapistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTherapist || !tName || !tPhone) return;

    try {
      const specialtiesArr = tSpecialties
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await updateTherapist(editingTherapist.id, {
        name: tName,
        phone: tPhone,
        email: tEmail,
        gender: tGender,
        specialties: specialtiesArr.length > 0 ? specialtiesArr : ['Swedish Massage'],
        status: tStatus,
        leaveReason: tStatus === 'on_leave' ? tLeaveReason : ''
      });

      setShowEditTherapistModal(false);
      setEditingTherapist(null);
      resetTherapistForm();
      loadAllData();
    } catch (err) {
      console.error('Failed to update therapist:', err);
    }
  };

  const handleDeleteTherapist = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete therapist "${name}"? Their portal page /${id} will no longer be available.`)) {
      return;
    }

    try {
      await deleteTherapist(id);
      loadAllData();
    } catch (err) {
      console.error('Failed to delete therapist:', err);
    }
  };

  const handleToggleTherapistAvailability = async (therapist: Therapist) => {
    const newStatus: TherapistStatus = therapist.status === 'available' ? 'on_leave' : 'available';
    try {
      await updateTherapist(therapist.id, {
        status: newStatus,
        leaveReason: newStatus === 'on_leave' ? 'On Leave' : ''
      });
      loadAllData();
    } catch (err) {
      console.error('Failed to toggle therapist status:', err);
    }
  };

  const resetTherapistForm = () => {
    setTName('');
    setTPhone('');
    setTEmail('');
    setTGender('Female');
    setTSpecialties('');
    setTStatus('available');
    setTLeaveReason('');
  };

  const openEditModal = (t: Therapist) => {
    setEditingTherapist(t);
    setTName(t.name);
    setTPhone(t.phone);
    setTEmail(t.email || '');
    setTGender(t.gender);
    setTSpecialties(t.specialties.join(', '));
    setTStatus(t.status);
    setTLeaveReason(t.leaveReason || '');
    setShowEditTherapistModal(true);
  };

  const copyTherapistLink = (id: string) => {
    const fullUrl = `${window.location.origin}/${id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered dataset
  const filteredAppointments = appointments.filter(b => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.therapistName && b.therapistName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // KPI calculations
  const totalBookings = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const unassignedCount = appointments.filter(a => !a.therapistName && a.status === 'confirmed').length;
  const totalRevenue = appointments
    .filter(a => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.totalPricePhp || 0), 0);

  const availableTherapistsCount = therapists.filter(t => t.status === 'available').length;
  const onLeaveTherapistsCount = therapists.filter(t => t.status === 'on_leave').length;

  // CSV Export
  const exportToCSV = () => {
    const headers = ["Booking Ref", "Date", "Time", "Customer Name", "Phone", "Service", "Price (PHP)", "Assigned Therapist", "Status", "Notes"];
    const rows = filteredAppointments.map(b => [
      b.bookingRef,
      b.bookingDate,
      b.bookingTime,
      `"${b.customerName}"`,
      `"${b.customerPhone}"`,
      `"${b.serviceName}"`,
      b.totalPricePhp,
      `"${b.therapistName || 'Unassigned'}"`,
      b.status,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e5db] pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b7a64] bg-[#8c9c84]/15 px-3 py-1 rounded-full border border-[#8c9c84]/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator Control Panel
            </span>
            <span className="text-xs text-[#6b7a64] bg-[#f2f2eb] px-2.5 py-1 rounded-full border border-[#e5e5db]">
              {isSupabaseConfigured ? 'Supabase Database Active' : 'Local Storage Mode'}
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#3a3a32] mt-2">
            Spa Management & Roster
          </h1>
          <p className="text-xs text-[#4a4a40] opacity-80 max-w-2xl">
            Assign therapists to customer massage appointments, manage therapist availability status (Available / On Leave), configure database tables, and view therapist individual schedule links (UUID).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadAllData}
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

          <button
            onClick={onOpenSupabaseModal}
            className="px-3.5 py-2 rounded-xl bg-[#8c9c84] text-white text-xs font-semibold hover:bg-[#6b7a64] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-[#f2f2eb]" />
            <span>Supabase Setup</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-[#e5e5db]">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'text-[#3a3a32] border-b-2 border-[#8c9c84]'
              : 'text-[#6b7a64] hover:text-[#3a3a32]'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-[#8c9c84]" />
          <span>Customer Appointments & Assignments</span>
          <span className="bg-[#f2f2eb] text-[#3a3a32] text-[10px] px-2 py-0.5 rounded-full border border-[#e5e5db]">
            {appointments.length}
          </span>
          {unassignedCount > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
              {unassignedCount} Needs Therapist
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('therapists')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'therapists'
              ? 'text-[#3a3a32] border-b-2 border-[#8c9c84]'
              : 'text-[#6b7a64] hover:text-[#3a3a32]'
          }`}
        >
          <Users className="w-4 h-4 text-[#8c9c84]" />
          <span>Therapists Table (`therapists`)</span>
          <span className="bg-[#f2f2eb] text-[#3a3a32] text-[10px] px-2 py-0.5 rounded-full border border-[#e5e5db]">
            {therapists.length}
          </span>
        </button>
      </div>

      {/* TAB 1: APPOINTMENTS & THERAPIST ASSIGNMENT */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          
          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#6b7a64]">
                <span>Total Bookings</span>
                <Calendar className="w-4 h-4 text-[#8c9c84]" />
              </div>
              <p className="font-serif text-2xl font-bold text-[#3a3a32]">{totalBookings}</p>
              <p className="text-[11px] text-[#8c9c84]">Active spa appointments</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Unassigned Therapists</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="font-serif text-2xl font-bold text-amber-800">{unassignedCount}</p>
              <p className="text-[11px] text-stone-500">Appointments needing massage therapist</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Confirmed & Assigned</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif text-2xl font-bold text-emerald-800">{confirmedCount}</p>
              <p className="text-[11px] text-stone-500">Upcoming client visits</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>Est. Total Revenue</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-serif text-2xl font-bold text-[#3a3a32]">₱{totalRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-stone-500">From customer bookings</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-5 rounded-2xl border border-[#e5e5db] shadow-xs grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#6b7a64] uppercase tracking-wider block">
                Search Customer / Therapist / Ref
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#8c9c84] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Name, phone, ref, or therapist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#e5e5db] text-xs focus:outline-none focus:ring-2 focus:ring-[#8c9c84]"
                />
              </div>
            </div>

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
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setFilterDate('');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="w-full py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Appointments Table with Therapist Assignment */}
          <div className="bg-white rounded-[32px] border border-[#e5e5db] shadow-xs overflow-hidden">
            <div className="p-4 bg-[#f2f2eb] border-b border-[#e5e5db] flex items-center justify-between text-xs font-bold text-[#3a3a32]">
              <span>Customer Appointments ({filteredAppointments.length})</span>
              <span className="text-[#6b7a64] font-normal">Assign therapist to each appointment row</span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-[#6b7a64] text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#8c9c84]" />
                <span>Loading appointments & therapist assignments...</span>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Calendar className="w-10 h-10 text-[#8c9c84] mx-auto opacity-50" />
                <p className="font-serif text-lg text-[#3a3a32]">No appointments found</p>
                <p className="text-xs text-[#6b7a64]">Try adjusting filters or search queries.</p>
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
                      <th className="p-4">Assigned Therapist</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5db] text-[#3a3a32]">
                    {filteredAppointments.map(item => {
                      const assignedTherapistObj = item.therapistId ? therapists.find(t => t.id === item.therapistId) : null;
                      
                      return (
                        <tr key={item.id} className="hover:bg-[#f2f2eb]/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#8c9c84]">
                            {item.bookingRef}
                          </td>

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

                          <td className="p-4 space-y-0.5">
                            <p className="font-bold text-sm text-[#3a3a32]">{item.customerName}</p>
                            <p className="text-[#6b7a64] font-mono text-[11px] flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#8c9c84]" />
                              {item.customerPhone}
                            </p>
                            <p className="text-[10px] text-[#8c9c84]">Pref: {item.therapistGenderPreference}</p>
                          </td>

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
                          </td>

                          {/* ASSIGNED THERAPIST COLUMN */}
                          <td className="p-4">
                            {item.therapistName ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-bold text-[#3a3a32] text-xs">{item.therapistName}</span>
                                </div>
                                {assignedTherapistObj && (
                                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border ${
                                    assignedTherapistObj.status === 'available'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                    {assignedTherapistObj.status === 'available' ? 'Available Today' : 'On Leave'}
                                  </span>
                                )}
                                <button
                                  onClick={() => {
                                    setAssigningAppointmentId(item.id);
                                    setSelectedTherapistIdForAssign(item.therapistId || 'custom');
                                    setCustomTherapistNameInput(item.therapistName || '');
                                  }}
                                  className="block text-[10px] text-[#8c9c84] hover:underline font-semibold"
                                >
                                  Edit / Change Therapist
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                                  <AlertCircle className="w-3 h-3 text-amber-600" /> Unassigned
                                </span>
                                <button
                                  onClick={() => {
                                    setAssigningAppointmentId(item.id);
                                    setSelectedTherapistIdForAssign(therapists.length > 0 ? therapists[0].id : 'custom');
                                    setCustomTherapistNameInput('');
                                  }}
                                  className="block text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl transition-colors"
                                >
                                  + Assign Therapist
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="p-4 font-serif font-bold text-sm text-[#8c9c84]">
                            ₱{item.totalPricePhp.toLocaleString()}
                          </td>

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

                          <td className="p-4 text-right space-x-1">
                            {item.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(item.id, 'completed')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleStatusChange(item.id, 'cancelled')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs"
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: THERAPISTS TABLE MANAGEMENT (`therapists`) */}
      {activeTab === 'therapists' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e5e5db] shadow-xs">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3a3a32] flex items-center gap-2">
                <Users className="w-6 h-6 text-[#8c9c84]" />
                Therapists Roster (`therapists` table)
              </h2>
              <p className="text-xs text-[#6b7a64] mt-1">
                Primary key uses <strong>UUID</strong>. Add, edit, delete therapists, toggle daily leave status, and access their personal portal links (`/${'{uuid}'}`).
              </p>
            </div>

            <button
              onClick={() => {
                resetTherapistForm();
                setShowAddTherapistModal(true);
              }}
              className="px-4 py-2.5 bg-[#8c9c84] hover:bg-[#6b7a64] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-xs self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Therapist</span>
            </button>
          </div>

          {/* Roster Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#e5e5db] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8c9c84]/15 text-[#6b7a64] flex items-center justify-center font-bold">
                {therapists.length}
              </div>
              <div>
                <p className="text-xs text-[#6b7a64] font-semibold">Total Therapists</p>
                <p className="font-serif font-bold text-[#3a3a32]">Registered in Database</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                {availableTherapistsCount}
              </div>
              <div>
                <p className="text-xs text-emerald-800 font-semibold">Available Today</p>
                <p className="font-serif font-bold text-emerald-900">Ready for Massages</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                {onLeaveTherapistsCount}
              </div>
              <div>
                <p className="text-xs text-rose-800 font-semibold">On Leave Today</p>
                <p className="font-serif font-bold text-rose-900">Off Duty</p>
              </div>
            </div>
          </div>

          {/* Therapists Table */}
          <div className="bg-white rounded-[32px] border border-[#e5e5db] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3a3a32] text-[#f2f2eb] font-serif uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">UUID Primary Key</th>
                    <th className="p-4">Therapist Name</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Specialties</th>
                    <th className="p-4">Today's Availability</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5db] text-[#3a3a32]">
                  {therapists.map(t => (
                    <tr key={t.id} className="hover:bg-[#f2f2eb]/50 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-[#8c9c84] font-semibold max-w-[140px] truncate" title={t.id}>
                        {t.id}
                      </td>

                      <td className="p-4 font-bold text-sm text-[#3a3a32]">
                        {t.name}
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-semibold border border-stone-200">
                          {t.gender}
                        </span>
                      </td>

                      <td className="p-4 space-y-0.5">
                        <p className="font-mono text-[11px] text-stone-700">{t.phone}</p>
                        {t.email && <p className="text-[10px] text-stone-500">{t.email}</p>}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {t.specialties.map((spec, i) => (
                            <span key={i} className="text-[10px] bg-[#f2f2eb] text-[#3a3a32] px-2 py-0.5 rounded-md border border-[#e5e5db]">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            t.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            {t.status === 'available' ? 'Available Today' : `On Leave ${t.leaveReason ? `(${t.leaveReason})` : ''}`}
                          </span>

                          <button
                            onClick={() => handleToggleTherapistAvailability(t)}
                            className="text-[10px] font-semibold text-[#8c9c84] hover:underline"
                          >
                            Toggle
                          </button>
                        </div>
                      </td>

                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => onNavigate('therapist-portal', t.id)}
                          className="px-2.5 py-1 bg-[#8c9c84] hover:bg-[#6b7a64] text-white rounded-lg text-[10px] font-bold transition-colors shadow-xs inline-flex items-center gap-1"
                          title="Open Schedule Page (/${t.id})"
                        >
                          <ExternalLink className="w-3 h-3" /> View Schedule
                        </button>

                        <button
                          onClick={() => copyTherapistLink(t.id)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-semibold transition-colors border border-stone-200"
                          title="Copy Link (/${t.id})"
                        >
                          {copiedId === t.id ? <Check className="w-3 h-3 text-emerald-600 inline" /> : <Copy className="w-3 h-3 text-stone-500 inline" />}
                        </button>

                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors inline-block"
                          title="Edit Therapist"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteTherapist(t.id, t.name)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors inline-block"
                          title="Delete Therapist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: ASSIGN THERAPIST TO APPOINTMENT */}
      {assigningAppointmentId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-[#e5e5db] shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#3a3a32]">Assign Massage Therapist</h3>
              <button onClick={() => setAssigningAppointmentId(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6b7a64]">
              Select an available therapist from your roster database, or type a custom therapist name.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                  Choose from Therapists Roster
                </label>
                <select
                  value={selectedTherapistIdForAssign}
                  onChange={(e) => setSelectedTherapistIdForAssign(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none bg-white font-medium text-[#3a3a32]"
                >
                  <option value="">-- Select Therapist --</option>
                  {therapists.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.gender}) - {t.status === 'available' ? 'Available Today' : `On Leave (${t.leaveReason || 'Off Duty'})`}
                    </option>
                  ))}
                  <option value="custom">-- Custom Name Input --</option>
                </select>
              </div>

              {selectedTherapistIdForAssign === 'custom' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Custom Therapist Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter therapist name..."
                    value={customTherapistNameInput}
                    onChange={(e) => setCustomTherapistNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setAssigningAppointmentId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTherapistSubmit}
                className="px-5 py-2 rounded-xl bg-[#8c9c84] hover:bg-[#6b7a64] text-white text-xs font-bold shadow-xs"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW THERAPIST */}
      {showAddTherapistModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-[#e5e5db] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#3a3a32]">Add New Therapist (`therapists`)</h3>
              <button onClick={() => setShowAddTherapistModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTherapistSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Clara"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+63 917 000 0000"
                    value={tPhone}
                    onChange={(e) => setTPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="therapist@mamahands.com"
                    value={tEmail}
                    onChange={(e) => setTEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={tGender}
                    onChange={(e) => setTGender(e.target.value as 'Female' | 'Male')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                  Specialties (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swedish Massage, Deep Tissue, Ventosa"
                  value={tSpecialties}
                  onChange={(e) => setTSpecialties(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Today's Availability Status
                  </label>
                  <select
                    value={tStatus}
                    onChange={(e) => setTStatus(e.target.value as TherapistStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none bg-white"
                  >
                    <option value="available">Available Today</option>
                    <option value="on_leave">On Leave / Off Duty</option>
                  </select>
                </div>

                {tStatus === 'on_leave' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                      Leave Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Personal Vacation"
                      value={tLeaveReason}
                      onChange={(e) => setTLeaveReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddTherapistModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#8c9c84] hover:bg-[#6b7a64] text-white text-xs font-bold shadow-xs"
                >
                  Create Therapist (Generate UUID)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT THERAPIST */}
      {showEditTherapistModal && editingTherapist && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-[#e5e5db] shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#3a3a32]">Edit Therapist</h3>
                <p className="font-mono text-[10px] text-[#8c9c84]">UUID: {editingTherapist.id}</p>
              </div>
              <button onClick={() => setShowEditTherapistModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTherapistSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={tPhone}
                    onChange={(e) => setTPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={tEmail}
                    onChange={(e) => setTEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={tGender}
                    onChange={(e) => setTGender(e.target.value as 'Female' | 'Male')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                  Specialties (Comma separated)
                </label>
                <input
                  type="text"
                  value={tSpecialties}
                  onChange={(e) => setTSpecialties(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                    Today's Availability Status
                  </label>
                  <select
                    value={tStatus}
                    onChange={(e) => setTStatus(e.target.value as TherapistStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none bg-white"
                  >
                    <option value="available">Available Today</option>
                    <option value="on_leave">On Leave / Off Duty</option>
                  </select>
                </div>

                {tStatus === 'on_leave' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#6b7a64] uppercase mb-1">
                      Leave Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Personal Leave"
                      value={tLeaveReason}
                      onChange={(e) => setTLeaveReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5db] text-xs focus:ring-2 focus:ring-[#8c9c84] outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowEditTherapistModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#8c9c84] hover:bg-[#6b7a64] text-white text-xs font-bold shadow-xs"
                >
                  Save Therapist Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
