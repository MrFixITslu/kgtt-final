import React, { useEffect } from 'react';
import { useAppContext, Booking } from '../../context/AppContext';
import { Clock, MapPin, Navigation, Car, CheckCircle2, Phone, Calendar, Trash2 } from 'lucide-react';
import StLuciaMap from '../common/StLuciaMap';

interface Props {
  booking: Booking;
}

const STATUS_CONFIG = {
  Scheduled: {
    label: 'Trip Confirmed & Scheduled',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    pulse: false,
  },
  Searching: {
    label: 'Finding your driver…',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    pulse: true,
  },
  DriverEnRoute: {
    label: 'Driver is on the way',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/30',
    pulse: false,
  },
  InTrip: {
    label: 'You are on your way!',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    pulse: false,
  },
  Completed: {
    label: 'Trip Completed!',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    pulse: false,
  },
};

export default function RideTracker({ booking }: Props) {
  const { dispatch, state } = useAppContext();
  const cfg = STATUS_CONFIG[booking.status];
  const driver = state.drivers.find((d) => d.id === booking.driverId);

  // Live ETA countdown
  useEffect(() => {
    if (booking.status !== 'DriverEnRoute' || booking.eta <= 0) return;
    const interval = setInterval(() => {
      dispatch({ type: 'DECREMENT_ETA', bookingId: booking.id });
    }, 10000); // every 10 real seconds
    return () => clearInterval(interval);
  }, [booking.status, booking.eta, booking.id, dispatch]);

  const isScheduledBooking = booking.status === 'Scheduled';
  
  const steps = isScheduledBooking
    ? [
        { key: 'Scheduled', label: 'Scheduled' },
        { key: 'DriverEnRoute', label: 'En Route' },
        { key: 'InTrip', label: 'In Trip' },
        { key: 'Completed', label: 'Done' },
      ]
    : [
        { key: 'Searching', label: 'Searching' },
        { key: 'DriverEnRoute', label: 'En Route' },
        { key: 'InTrip', label: 'In Trip' },
        { key: 'Completed', label: 'Done' },
      ];

  const stepIndex = steps.findIndex((s) => s.key === booking.status);

  const handlePassengerCancel = () => {
    if (window.confirm('Are you sure you want to cancel this scheduled ride?')) {
      dispatch({ type: 'CANCEL_BOOKING', bookingId: booking.id });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Status badge */}
      <div className={`flex items-center gap-3 rounded-2xl border p-4 ${cfg.bg}`}>
        {cfg.pulse && (
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
          </span>
        )}
        {booking.status === 'Completed' && <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />}
        {booking.status === 'DriverEnRoute' && <Car size={20} className="text-indigo-400 shrink-0 animate-bounce" />}
        {booking.status === 'InTrip' && <Navigation size={20} className="text-emerald-400 shrink-0" />}
        {booking.status === 'Scheduled' && <Calendar size={20} className="text-blue-400 shrink-0" />}
        <div>
          <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
          {booking.status === 'DriverEnRoute' && (
            <p className="text-xs text-slate-400">
              ETA: <span className="font-semibold text-white">{booking.eta} min</span>
            </p>
          )}
          {booking.status === 'Scheduled' && booking.scheduledTime && (
            <p className="text-xs text-slate-400">
              Starts: <span className="font-semibold text-white">{new Date(booking.scheduledTime).toLocaleString()}</span>
            </p>
          )}
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-0">
        {steps.map((step, i) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                  i <= stepIndex
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <p className={`mt-1 text-[10px] font-medium ${i <= stepIndex ? 'text-indigo-400' : 'text-slate-600'}`}>
                {step.label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mb-4 h-0.5 flex-1 transition-all duration-500 ${
                  i < stepIndex ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Cancel Panel for Scheduled Booking */}
      {isScheduledBooking && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div>
            <p className="text-xs font-bold text-slate-300">Need to cancel?</p>
            <p className="text-[10px] text-slate-500">You can cancel scheduled rides anytime.</p>
          </div>
          <button
            onClick={handlePassengerCancel}
            className="flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-md shadow-rose-500/10"
          >
            <Trash2 size={12} />
            Cancel Ride
          </button>
        </div>
      )}

      {/* Driver info */}
      {driver && booking.status !== 'Searching' && booking.status !== 'Scheduled' && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/80 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-lg">
            {driver.avatarInitials}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{driver.name}</p>
            <p className="text-xs text-slate-400">{driver.vehicle}</p>
          </div>
          {booking.status !== 'Completed' && (
            <a
              href="tel:+1234567890"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
            >
              <Phone size={16} />
            </a>
          )}
        </div>
      )}

      {/* Route summary */}
      <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-800/50 p-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} className="text-indigo-400 shrink-0" />
          <span className="text-slate-300">{booking.pickup}</span>
        </div>
        <div className="ml-1.5 h-4 w-px border-l-2 border-dashed border-slate-600" />
        <div className="flex items-center gap-2 text-sm">
          <Navigation size={14} className="text-emerald-400 shrink-0" />
          <span className="text-white font-medium">{booking.dropoff}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-slate-700 pt-2">
          <span className="text-xs text-slate-400">Fare</span>
          <span className="text-sm font-bold text-white">${booking.fare.toFixed(2)} · {booking.paymentMethod}</span>
        </div>
      </div>

      {/* Interactive St. Lucia Map */}
      <div className="relative">
        <StLuciaMap
          pickup={booking.pickup}
          dropoff={booking.dropoff}
          currentCoords={booking.currentCoords}
          routePath={booking.routePath}
          bookingStatus={booking.status}
          heightClass="h-[240px]"
        />

        {/* Map Status Overlays */}
        {booking.status === 'Searching' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px] rounded-2xl">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-900/90 border border-white/10 p-4 shadow-xl">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              <p className="text-xs text-slate-300 font-semibold">Locating nearest driver…</p>
            </div>
          </div>
        )}

        {booking.status === 'Scheduled' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1px] rounded-2xl">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-900/90 border border-white/10 p-4 shadow-xl text-center max-w-[220px]">
              <Calendar size={24} className="text-blue-400 animate-pulse" />
              <p className="text-xs text-slate-300 font-semibold">Reservation Active</p>
              <p className="text-[10px] text-slate-500 leading-normal">Your trip is scheduled. A driver will be assigned automatically when the trip begins.</p>
            </div>
          </div>
        )}
      </div>

      {booking.status === 'Searching' && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-300 leading-relaxed text-center">
          💬 <strong>In-App Chat:</strong> Will unlock here once a driver accepts your ride. Switch to the <strong>Driver App</strong> and click <strong>Accept Job</strong> to test.
        </div>
      )}
    </div>
  );
}
