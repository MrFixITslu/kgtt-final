import React, { useState, useRef, useEffect } from 'react';
import { useAppContext, Booking, ChatMessage } from '../../context/AppContext';
import { MapPin, Navigation, CheckCircle2, Flag, Send, MessageCircle } from 'lucide-react';

interface Props {
  booking: Booking;
}

type Milestone = 'DriverEnRoute' | 'InTrip' | 'Completed';

const MILESTONES: { status: Milestone; label: string; action: string; icon: React.ReactNode; color: string }[] = [
  {
    status: 'DriverEnRoute',
    label: 'En Route to Pickup',
    action: 'Confirm Arrival',
    icon: <MapPin size={18} />,
    color: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40',
  },
  {
    status: 'InTrip',
    label: 'Passenger Onboard',
    action: 'Start Trip',
    icon: <Navigation size={18} />,
    color: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/40',
  },
  {
    status: 'Completed',
    label: 'Trip Complete',
    action: 'Complete Trip',
    icon: <Flag size={18} />,
    color: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/40',
  },
];

const QUICK_DRIVER_REPLIES = ["On my way!", "Arrived at pickup", "Starting trip now", "Have a safe trip!"];

export default function TripMilestones({ booking }: Props) {
  const { dispatch } = useAppContext();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [booking.messages]);

  const currentMilestoneIndex = MILESTONES.findIndex((m) => m.status === booking.status);
  const nextMilestone = currentMilestoneIndex < MILESTONES.length - 1
    ? MILESTONES[currentMilestoneIndex + 1]
    : null;

  const handleMilestone = () => {
    if (!nextMilestone) return;
    if (nextMilestone.status === 'Completed') {
      dispatch({ type: 'UPDATE_BOOKING_STATUS', bookingId: booking.id, status: 'Completed' });
      dispatch({ type: 'COMPLETE_BOOKING_INCOME', bookingId: booking.id });
    } else {
      dispatch({ type: 'UPDATE_BOOKING_STATUS', bookingId: booking.id, status: nextMilestone.status });
    }
  };

  const sendMessage = (msgText: string) => {
    if (!msgText.trim()) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Driver',
      text: msgText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    dispatch({ type: 'SEND_MESSAGE', bookingId: booking.id, message: msg });
    setText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trip card */}
      <div className="rounded-3xl border border-white/5 bg-slate-950/40 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${booking.status === 'Completed' ? 'bg-emerald-400' : 'bg-indigo-400 animate-pulse'}`} />
          <span className="text-sm font-bold text-white">Active Trip</span>
          <span className="ml-auto text-sm font-bold text-emerald-400">${booking.fare.toFixed(2)}</span>
        </div>

        {/* Route */}
        <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-slate-900/60 p-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={13} className="text-indigo-400 shrink-0" />
            <span className="text-slate-300">{booking.pickup}</span>
          </div>
          <div className="ml-1.5 h-3 border-l-2 border-dashed border-slate-600" />
          <div className="flex items-center gap-2 text-sm">
            <Navigation size={13} className="text-emerald-400 shrink-0" />
            <span className="text-white font-medium">{booking.dropoff}</span>
          </div>
        </div>

        {/* Milestone stepper */}
        <div className="mb-4 flex flex-col gap-2">
          {MILESTONES.map((m, i) => {
            const milestoneIdx = MILESTONES.findIndex((x) => x.status === booking.status);
            const done = i < milestoneIdx || booking.status === 'Completed';
            const active = m.status === booking.status;
            return (
              <div key={m.status} className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                active ? 'bg-indigo-500/10 border border-indigo-500/30' :
                done ? 'bg-emerald-500/5 border border-emerald-500/20 opacity-60' :
                'bg-slate-900/40 border border-slate-700/40 opacity-40'
              }`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                  done ? 'bg-emerald-500 text-white' :
                  active ? 'bg-indigo-500 text-white' :
                  'bg-slate-700 text-slate-500'
                }`}>
                  {done ? <CheckCircle2 size={16} /> : m.icon}
                </div>
                <span className={`text-sm font-medium ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {m.label}
                </span>
                {done && <CheckCircle2 size={14} className="ml-auto text-emerald-400" />}
              </div>
            );
          })}
        </div>

        {/* Next action button */}
        {booking.status !== 'Completed' && nextMilestone && (
          <button
            onClick={handleMilestone}
            className={`group relative w-full overflow-hidden rounded-2xl py-4 text-base font-bold text-white shadow-xl transition-all duration-200 active:scale-95 ${nextMilestone.color}`}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            {nextMilestone.action}
          </button>
        )}

        {booking.status === 'Completed' && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 py-4">
            <CheckCircle2 size={28} className="text-emerald-400" />
            <p className="text-base font-bold text-white">Trip Completed!</p>
            <p className="text-sm text-emerald-400">Earned ${booking.fare.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Driver chat */}
      <div className="rounded-3xl border border-white/5 bg-slate-950/40 p-4 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle size={15} className="text-indigo-400" />
          <span className="text-sm font-semibold text-white">Passenger Chat</span>
        </div>

        <div className="mb-3 flex h-36 flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-900/50 p-3">
          {booking.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-xs text-slate-500">No messages yet</p>
            </div>
          ) : (
            booking.messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'Driver' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  msg.sender === 'Driver' ? 'rounded-br-sm bg-indigo-600 text-white' : 'rounded-bl-sm bg-slate-700 text-slate-200'
                }`}>
                  {msg.text}
                </div>
                <span className="mt-0.5 text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_DRIVER_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={booking.status === 'Completed'}
              className="shrink-0 rounded-full border border-slate-600 bg-slate-700/50 px-3 py-1 text-xs text-slate-300 hover:border-indigo-500 hover:text-indigo-300 transition-colors disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(text)}
            placeholder={booking.status === 'Completed' ? 'Trip ended' : 'Message passenger…'}
            disabled={booking.status === 'Completed'}
            className="flex-1 rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
          />
          <button
            onClick={() => sendMessage(text)}
            disabled={!text.trim() || booking.status === 'Completed'}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
