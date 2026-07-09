import React, { useEffect, useRef, useState } from 'react';
import { Bell, ShieldAlert, Sparkles, X, User, Navigation, MapPin } from 'lucide-react';
import { useAppContext, Booking } from '../../context/AppContext';

// Dynamic Chime Sound using Web Audio API
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pleasant high-end double chime (A5 -> C#6)
    const chime = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gainNode.gain.setValueAtTime(0.12, start);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    chime(880.00, now, 0.35);       // A5
    chime(1109.73, now + 0.08, 0.45); // C#6
  } catch (e) {
    console.warn('Audio Context failed to start (interaction required):', e);
  }
};

export default function NotificationCenter() {
  const { state, dispatch } = useAppContext();
  const [activeAlerts, setActiveAlerts] = useState<Booking[]>([]);
  const [showReminders, setShowReminders] = useState(false);
  const prevBookingsRef = useRef<string[]>([]);
  const initialLoadRef = useRef(true);

  // Filter unassigned or searching bookings
  const searchingBookings = state.bookings.filter(b => b.status === 'Searching');
  const scheduledBookings = state.bookings.filter(b => b.status === 'Scheduled');

  useEffect(() => {
    // Collect all current booking IDs
    const currentIds = state.bookings.map(b => b.id);
    
    // On initial mount, just populate the seen list without triggering alarms
    if (initialLoadRef.current) {
      prevBookingsRef.current = currentIds;
      initialLoadRef.current = false;
      return;
    }

    // Detect brand new bookings that were not present in previous render
    const newBookings = state.bookings.filter(
      b => !prevBookingsRef.current.includes(b.id) && b.status === 'Searching'
    );

    if (newBookings.length > 0) {
      // Play alert chime
      playChime();
      
      // Add to active notifications
      setActiveAlerts(prev => [...prev, ...newBookings]);
    }

    // Update the ref
    prevBookingsRef.current = currentIds;
  }, [state.bookings]);

  // Clean up alerts when they are assigned drivers or deleted from outside
  useEffect(() => {
    setActiveAlerts(prev => prev.filter(alert => 
      state.bookings.some(b => b.id === alert.id && b.status === 'Searching')
    ));
  }, [state.bookings]);

  const handleDismiss = (bookingId: string) => {
    setActiveAlerts(prev => prev.filter(b => b.id !== bookingId));
  };

  const handleAutoAssign = (bookingId: string) => {
    // Find first available driver
    const availableDriver = state.drivers.find(d => d.status === 'Available');
    if (availableDriver) {
      dispatch({
        type: 'UPDATE_BOOKING_STATUS',
        bookingId,
        status: 'DriverEnRoute',
        driverId: availableDriver.id
      });
      // Also update driver status
      dispatch({
        type: 'UPDATE_DRIVER_STATUS',
        driverId: availableDriver.id,
        status: 'OnJob'
      });
    } else {
      // Fallback: assign the main active driver
      dispatch({
        type: 'UPDATE_BOOKING_STATUS',
        bookingId,
        status: 'DriverEnRoute',
        driverId: state.activeDriverId
      });
    }
    handleDismiss(bookingId);
  };

  return (
    <>
      {/* Floating Toast Notification Box */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {activeAlerts.map(booking => (
          <div
            key={booking.id}
            className="pointer-events-auto w-full rounded-2xl border border-amber-500/30 bg-slate-900/95 p-4.5 shadow-2xl backdrop-blur-xl animate-slideIn flex flex-col gap-3 relative overflow-hidden"
          >
            {/* Ambient gold glow line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20" />

            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Bell size={13} className="animate-bounce" />
                New Ride Request
              </div>
              <button
                onClick={() => handleDismiss(booking.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                <User size={13} className="text-slate-500" />
                {booking.passengerName}
              </div>
              <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-indigo-400" />
                  <span className="truncate">{booking.pickup}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation size={11} className="text-emerald-400" />
                  <span className="truncate">{booking.dropoff}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
              <span className="text-xs font-bold text-slate-300">
                Fare: <span className="text-amber-400 font-black">${booking.fare.toFixed(2)}</span>
              </span>
              <button
                onClick={() => handleAutoAssign(booking.id)}
                className="rounded-lg bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-[10px] font-black uppercase text-slate-950 transition-colors"
              >
                Confirm & Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reminders Bar & Badge */}
      {(searchingBookings.length > 0 || scheduledBookings.length > 0) && (
        <div className="bg-slate-900 border-b border-white/5 px-6 py-2.5 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-slate-400 font-medium">
              Fleet Alert: <strong className="text-slate-200">{searchingBookings.length} pending instant</strong> and <strong className="text-slate-200">{scheduledBookings.length} scheduled</strong> jobs require dispatcher confirmation.
            </span>
          </div>
          <button
            onClick={() => setShowReminders(!showReminders)}
            className="text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider text-[10px]"
          >
            {showReminders ? 'Hide Reminders' : 'View Action List'}
          </button>
        </div>
      )}

      {/* Reminder Panel Popup */}
      {showReminders && (searchingBookings.length > 0 || scheduledBookings.length > 0) && (
        <div className="bg-slate-950/80 border-b border-white/5 px-6 py-4 flex flex-col gap-3 animate-fadeIn">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldAlert size={12} className="text-amber-500" />
            Unconfirmed Jobs List
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchingBookings.map(b => (
              <div key={b.id} className="rounded-xl border border-amber-500/20 bg-slate-900/50 p-3 flex justify-between items-center gap-3">
                <div>
                  <p className="text-[11px] font-bold text-slate-200">{b.passengerName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{b.pickup} → {b.dropoff}</p>
                </div>
                <button
                  onClick={() => handleAutoAssign(b.id)}
                  className="rounded bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-[9px] font-bold text-amber-300 px-2 py-1 uppercase"
                >
                  Assign
                </button>
              </div>
            ))}
            {scheduledBookings.map(b => (
              <div key={b.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 flex justify-between items-center gap-3">
                <div>
                  <p className="text-[11px] font-bold text-slate-200">{b.passengerName} (Sched)</p>
                  <p className="text-[10px] text-slate-400 truncate">{b.pickup} → {b.dropoff}</p>
                  <p className="text-[9px] text-indigo-400">{b.scheduledTime ? new Date(b.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
                </div>
                <button
                  onClick={() => {
                    // Activate scheduled ride immediately
                    dispatch({
                      type: 'START_SCHEDULED_TRIP',
                      bookingId: b.id,
                      driverId: state.activeDriverId
                    });
                  }}
                  className="rounded bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-[9px] font-bold text-indigo-300 px-2 py-1 uppercase"
                >
                  Launch
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
