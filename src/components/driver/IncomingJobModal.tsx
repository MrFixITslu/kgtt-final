import React from 'react';
import { useAppContext, Booking } from '../../context/AppContext';
import { MapPin, DollarSign, Zap, X } from 'lucide-react';
import { findShortestPath } from '../../utils/routing';
import { ST_LUCIA_DISTRICTS } from '../../utils/stLuciaDistricts';

interface Props {
  booking: Booking;
}

export default function IncomingJobModal({ booking }: Props) {
  const { dispatch, state } = useAppContext();
  const driver = state.drivers.find((d) => d.id === state.activeDriverId);

  const handleAccept = () => {
    if (!driver) return;
    
    // Manual routing: calculate path from driver's current district to pickup
    const driverStartDist = driver.currentDistrict || 'Castries (Capital)';
    const path = findShortestPath(driverStartDist, booking.pickup);
    const startNode = ST_LUCIA_DISTRICTS.find((d) => d.name === driverStartDist);
    const startCoords = startNode ? { x: startNode.x, y: startNode.y } : { x: 2, y: 8 };

    dispatch({
      type: 'ASSIGN_DRIVER',
      bookingId: booking.id,
      driverId: driver.id,
      routePath: path,
      currentCoords: startCoords,
    });
  };

  const handleDecline = () => {
    // Just ignore — booking stays in Searching for other drivers
    // In a real app this would reassign; here we keep it simple
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-in slide-in-from-bottom-4 duration-300">
        {/* Flashing ring */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 opacity-75 blur animate-pulse" />

        <div className="relative rounded-3xl border border-white/20 bg-slate-900 p-5 shadow-2xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
              </span>
              <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">New Ride Request</span>
            </div>
            <button
              onClick={handleDecline}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Passenger */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-bold text-white">
              {booking.passengerName.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <p className="font-semibold text-white">{booking.passengerName}</p>
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                <span className="text-slate-400 ml-1">4.9</span>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="mb-4 rounded-2xl bg-slate-800 p-4 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <MapPin size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pickup</p>
                <p className="text-sm font-medium text-white">{booking.pickup}</p>
              </div>
            </div>
            <div className="ml-1.5 h-4 border-l-2 border-dashed border-slate-600" />
            <div className="flex items-start gap-2">
              <div className="h-3.5 w-3.5 rounded-full border-2 border-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Dropoff</p>
                <p className="text-sm font-medium text-white">{booking.dropoff}</p>
              </div>
            </div>
          </div>

          {/* Earnings */}
          <div className="mb-5 flex gap-3">
            <div className="flex flex-1 flex-col items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 py-3">
              <DollarSign size={16} className="text-emerald-400 mb-1" />
              <p className="text-xl font-bold text-white">${booking.fare.toFixed(2)}</p>
              <p className="text-[10px] text-emerald-400">Earnings</p>
            </div>
            <div className="flex flex-1 flex-col items-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 py-3">
              <Zap size={16} className="text-indigo-400 mb-1" />
              <p className="text-xl font-bold text-white">{booking.paymentMethod === 'In-App' ? '💳' : '💵'}</p>
              <p className="text-[10px] text-indigo-400">{booking.paymentMethod}</p>
            </div>
          </div>

          {/* Accept */}
          <button
            onClick={handleAccept}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/40 transition-all duration-200 hover:shadow-indigo-500/60 active:scale-95"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            ✓ Accept Job
          </button>
        </div>
      </div>
    </div>
  );
}
