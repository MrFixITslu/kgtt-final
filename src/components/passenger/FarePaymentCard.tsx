import React, { useState } from 'react';
import { useAppContext, PaymentMethod } from '../../context/AppContext';
import { RouteSelection } from './DestinationSelector';
import { CreditCard, Banknote, MapPin, Navigation, Zap, Calendar } from 'lucide-react';

interface Props {
  route: RouteSelection;
  onBooked: () => void;
}

export default function FarePaymentCard({ route, onBooked }: Props) {
  const { dispatch } = useAppContext();
  const [payment, setPayment] = useState<PaymentMethod>('In-App');
  const [loading, setLoading] = useState(false);

  const serviceFee = +(route.baseFare * 0.12).toFixed(2);
  const total = +(route.baseFare + serviceFee).toFixed(2);

  const isScheduled = !!route.scheduledTime;

  const handleRequest = () => {
    setLoading(true);
    setTimeout(() => {
      dispatch({
        type: 'ADD_BOOKING',
        booking: {
          id: `bk-${Date.now()}`,
          passengerName: 'Alex Jordan',
          pickup: route.pickup,
          dropoff: route.dropoff,
          fare: total,
          paymentMethod: payment,
          status: isScheduled ? 'Scheduled' : 'Searching',
          driverId: null,
          eta: 8,
          messages: [],
          scheduledTime: route.scheduledTime,
        },
      });
      setLoading(false);
      onBooked();
    }, 600);
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-800/80 p-5 backdrop-blur-sm">
      {/* Route Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500">
            <MapPin size={10} className="text-white" />
          </div>
          <span className="text-slate-300">{route.pickup}</span>
        </div>
        <div className="ml-2 h-5 w-px border-l-2 border-dashed border-slate-600" />
        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
            <Navigation size={10} className="text-white" />
          </div>
          <span className="text-white font-medium">{route.dropoff}</span>
        </div>
      </div>

      {/* Scheduled timestamp info if applicable */}
      {isScheduled && route.scheduledTime && (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2.5 text-xs text-indigo-300">
          <Calendar size={14} className="shrink-0" />
          <div>
            <p className="font-semibold uppercase tracking-wider text-[9px] text-indigo-400">Scheduled Date & Time</p>
            <p className="font-medium text-white">{new Date(route.scheduledTime).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Fare breakdown */}
      <div className="rounded-2xl bg-slate-900/60 p-4">
        <div className="flex justify-between text-sm text-slate-400 mb-1">
          <span>Base fare</span>
          <span>${route.baseFare.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-400 mb-3">
          <span>Service fee (12%)</span>
          <span>${serviceFee}</span>
        </div>
        <div className="flex justify-between border-t border-slate-700 pt-3 font-bold text-white">
          <span>Total</span>
          <span className="text-lg text-indigo-300">${total}</span>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Method</p>
        <div className="flex gap-2">
          {(['In-App', 'Cash'] as PaymentMethod[]).map((method) => (
            <button
              key={method}
              onClick={() => setPayment(method)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all duration-200 ${
                payment === method
                  ? 'border-indigo-500 bg-indigo-600/30 text-indigo-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'
              }`}
            >
              {method === 'In-App' ? <CreditCard size={15} /> : <Banknote size={15} />}
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Book button */}
      <button
        onClick={handleRequest}
        disabled={loading}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/50 active:scale-95 disabled:opacity-60"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        {loading ? (
          <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <Zap size={18} />
        )}
        {loading
          ? 'Creating Reservation…'
          : isScheduled
          ? `Book for Scheduled Time`
          : `Request Ride Now • $${total}`}
      </button>
    </div>
  );
}
