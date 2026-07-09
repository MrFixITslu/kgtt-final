import React, { useState } from 'react';
import { MapPin, Navigation, Calendar, Clock, ArrowRightLeft, Sparkles, MapPinned, Phone, MessageCircle, X } from 'lucide-react';
import { ST_LUCIA_DISTRICTS, calculateStLuciaFare } from '../../utils/stLuciaDistricts';
import { useAppContext } from '../../context/AppContext';

export interface RouteSelection {
  pickup: string;
  dropoff: string;
  baseFare: number;
  scheduledTime: string | null; // null if "Request Now"
}

interface Props {
  onSelect: (selection: RouteSelection) => void;
  onRoutePreview?: (pickup: string, dropoff: string) => void;
}

export default function DestinationSelector({ onSelect, onRoutePreview }: Props) {
  const { dispatch } = useAppContext();
  const [pickup, setPickup] = useState(ST_LUCIA_DISTRICTS[0].name);
  const [dropoff, setDropoff] = useState(ST_LUCIA_DISTRICTS[1].name);
  const [isScheduled, setIsScheduled] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');

  // Call logging states
  const [showCallModal, setShowCallModal] = useState(false);
  const [contactType, setContactType] = useState<'Phone Call' | 'WhatsApp'>('Phone Call');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [modalError, setModalError] = useState('');

  const fare = calculateStLuciaFare(pickup, dropoff);

  const pickupInfo = ST_LUCIA_DISTRICTS.find((d) => d.name === pickup);
  const dropoffInfo = ST_LUCIA_DISTRICTS.find((d) => d.name === dropoff);

  const handleSwap = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const handleInitiateContact = (type: 'Phone Call' | 'WhatsApp', e: React.MouseEvent) => {
    e.preventDefault();
    setContactType(type);
    setPassengerPhone('');
    setPassengerName('');
    setModalError('');
    setShowCallModal(true);
  };

  // Trigger preview coordinates
  React.useEffect(() => {
    onRoutePreview?.(pickup, dropoff);
    // Expose route to parent map preview
    const parentView = (window as any).passengerViewRoutePreview;
    if (typeof parentView === 'function') {
      parentView(pickup, dropoff);
    }
  }, [pickup, dropoff, onRoutePreview]);

  const handleConfirmContact = () => {
    if (!passengerPhone.trim()) {
      setModalError('Please enter your contact phone number.');
      return;
    }
    if (passengerPhone.replace(/[^0-9+]/g, '').length < 7) {
      setModalError('Please enter a valid phone number.');
      return;
    }

    dispatch({
      type: 'LOG_CONTACT',
      log: {
        type: contactType,
        passengerNumber: passengerPhone,
        passengerName: passengerName.trim() || 'Anonymous Guest',
        status: contactType === 'Phone Call' ? 'Dialed' : 'Sent',
        metadata: `Direct booking call/chat. Route: ${pickup} to ${dropoff}.`
      }
    });

    setShowCallModal(false);

    if (contactType === 'Phone Call') {
      window.location.href = 'tel:+17587240513';
    } else {
      const waMsg = `Hello K&G Taxi Tours! I would like to book a ride from ${pickup} to ${dropoff}. My name is ${passengerName} and my number is ${passengerPhone}.`;
      window.open(`https://wa.me/17587240513?text=${encodeURIComponent(waMsg)}`, '_blank');
    }
  };

  // Pricing calculations
  const currentFare = fare;

  // Real distance calculations using St. Lucia grid coords
  const gridDistance = pickupInfo && dropoffInfo 
    ? Math.sqrt(Math.pow(pickupInfo.x - dropoffInfo.x, 2) + Math.pow(pickupInfo.y - dropoffInfo.y, 2))
    : 3;
  const estDistanceKm = Math.max(8, Math.round(gridDistance * 7.5));
  const estTimeMin = Math.max(15, Math.round(estDistanceKm * 1.4));

  const handleProceed = () => {
    if (isScheduled) {
      if (!date || !time) {
        setError('Please select a valid date and time.');
        return;
      }
      const scheduledDateTime = new Date(`${date}T${time}`);
      if (scheduledDateTime.getTime() < Date.now()) {
        setError('Scheduled time must be in the future.');
        return;
      }
      setError('');
      onSelect({
        pickup,
        dropoff,
        baseFare: currentFare,
        scheduledTime: scheduledDateTime.toISOString(),
      });
    } else {
      setError('');
      onSelect({
        pickup,
        dropoff,
        baseFare: currentFare,
        scheduledTime: null,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 text-white">
      {/* Route Inputs Card (Mockup Style with path connector) */}
      <div className="relative rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        {/* Left vertical path line */}
        <div className="absolute left-[26px] top-[40px] bottom-[40px] w-0.5 border-l border-dashed border-slate-600 z-0" />

        <div className="flex flex-col gap-4 z-10 relative">
          {/* Pickup Selection */}
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <MapPin size={12} />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Pick Up</label>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none border-none cursor-pointer appearance-none py-1"
              >
                {ST_LUCIA_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name} className="bg-slate-900 text-white">
                    {d.name}
                  </option>
                ))}
              </select>
              {pickupInfo && (
                <p className="text-[10px] text-slate-500">{pickupInfo.description}</p>
              )}
            </div>
          </div>

          {/* Swap Button Line */}
          <div className="flex justify-end pr-2 h-0 relative">
            <button
              onClick={handleSwap}
              type="button"
              className="absolute -top-3 right-4 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:text-white transition-all shadow-md active:scale-90 z-20"
            >
              <ArrowRightLeft size={10} className="rotate-90" />
            </button>
          </div>

          {/* Dropoff Selection */}
          <div className="flex items-start gap-3 pt-2">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
              <Navigation size={12} />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Destination</label>
              <select
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none border-none cursor-pointer appearance-none py-1"
              >
                {ST_LUCIA_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name} className="bg-slate-900 text-white">
                    {d.name}
                  </option>
                ))}
              </select>
              {dropoffInfo && (
                <p className="text-[10px] text-slate-500">{dropoffInfo.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ride Fare Estimate (Mockup Style) */}
      <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ride Fare</p>
        <p className="text-3xl font-black text-amber-400 mt-1">${currentFare.toFixed(2)}</p>
        <p className="text-[10px] text-slate-400 mt-1.5">
          Est. Time: <span className="text-white font-semibold">{estTimeMin} min</span> | Distance: <span className="text-white font-semibold">{estDistanceKm} km</span>
        </p>
      </div>

      {/* Scheduling Toggles */}
      <div className="flex gap-2 rounded-xl border border-white/5 bg-slate-950/40 p-1">
        <button
          type="button"
          onClick={() => {
            setIsScheduled(false);
            setError('');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            !isScheduled
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Request Now
        </button>
        <button
          type="button"
          onClick={() => setIsScheduled(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            isScheduled
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Schedule Later
        </button>
      </div>

      {/* Date & Time Selectors for Scheduled Rides */}
      {isScheduled && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar size={10} />
                Date
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>
          {error && (
            <p className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg py-1 px-2.5">
              ⚠️ {error}
            </p>
          )}
        </div>
      )}

      {/* Proceed Button (Amber/Gold mockup style) */}
      <button
        onClick={handleProceed}
        className="w-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-300 transform active:scale-98"
      >
        {isScheduled ? 'Proceed to Schedule →' : 'Proceed to Payment →'}
      </button>

      {/* Call / WhatsApp Direct Booking */}
      <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
        <p className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
          Or Book Directly Via Hotline
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => handleInitiateContact('Phone Call', e)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 py-2.5 text-[11px] font-bold text-white transition-all shadow-md active:scale-98"
          >
            <Phone size={12} className="text-amber-400" />
            Call Us
          </button>
          <button
            onClick={(e) => handleInitiateContact('WhatsApp', e)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 py-2.5 text-[11px] font-bold text-emerald-300 transition-all shadow-md active:scale-98"
          >
            <MessageCircle size={12} className="text-emerald-400" />
            WhatsApp Us
          </button>
        </div>
      </div>

      {/* Glassmorphic Contact Details Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {contactType === 'Phone Call' ? <Phone size={14} className="text-amber-400" /> : <MessageCircle size={14} className="text-emerald-400" />}
                Connect with Dispatch
              </h3>
              <button onClick={() => setShowCallModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Confirm your contact information so our dispatchers can record your booking inquiry and contact you back immediately.
            </p>

            <div className="flex flex-col gap-3 mb-5">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Contact Number (Required)</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (758) 724-0000"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-white outline-none focus:border-amber-500"
                />
              </div>

              {modalError && (
                <p className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg py-1.5 px-3">
                  ⚠️ {modalError}
                </p>
              )}
            </div>

            <button
              onClick={handleConfirmContact}
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-98 shadow-lg ${
                contactType === 'Phone Call'
                  ? 'bg-amber-600 shadow-amber-500/20 hover:bg-amber-500'
                  : 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-500'
              }`}
            >
              {contactType === 'Phone Call' ? 'Confirm & Dial Hotline' : 'Confirm & Open Chat'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
