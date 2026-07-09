import React, { useState, useRef, useEffect } from 'react';
import { useAppContext, Booking, ChatMessage } from '../../context/AppContext';
import { Send, Phone, MessageCircle } from 'lucide-react';

interface Props {
  booking: Booking;
}

const QUICK_REPLIES = ["I'm outside", "Be there in 2 min", "Running late, sorry!", "At the entrance"];

export default function InAppChat({ booking }: Props) {
  const { dispatch, state } = useAppContext();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const driver = state.drivers.find((d) => d.id === booking.driverId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [booking.messages]);

  const sendMessage = (msgText: string) => {
    if (!msgText.trim()) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Passenger',
      text: msgText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    dispatch({ type: 'SEND_MESSAGE', bookingId: booking.id, message: msg });
    setText('');
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-800/80 p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-white">
            {driver ? `Chat with ${driver.name}` : 'Trip Chat'}
          </span>
        </div>
        <a
          href="tel:+1234567890"
          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/40 transition-colors"
        >
          <Phone size={13} />
          Call
        </a>
      </div>

      {/* Message thread */}
      <div className="flex h-44 flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-900/50 p-3 scrollbar-thin">
        {booking.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <MessageCircle size={24} className="text-slate-600" />
            <p className="text-xs text-slate-500">No messages yet</p>
            <p className="text-[10px] text-slate-600">Messages are visible to both you and your driver</p>
          </div>
        ) : (
          booking.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'Passenger' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  msg.sender === 'Passenger'
                    ? 'rounded-br-sm bg-indigo-600 text-white'
                    : 'rounded-bl-sm bg-slate-700 text-slate-200'
                }`}
              >
                {msg.text}
              </div>
              <span className="mt-0.5 text-[10px] text-slate-500">{msg.timestamp}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {QUICK_REPLIES.map((q) => (
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

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(text)}
          placeholder={booking.status === 'Completed' ? 'Trip ended' : 'Type a message…'}
          disabled={booking.status === 'Completed'}
          className="flex-1 rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors disabled:opacity-40"
        />
        <button
          onClick={() => sendMessage(text)}
          disabled={!text.trim() || booking.status === 'Completed'}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
