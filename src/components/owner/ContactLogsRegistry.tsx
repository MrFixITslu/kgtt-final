import React, { useState } from 'react';
import { Phone, MessageCircle, Search, Clock, User, ClipboardList, ExternalLink } from 'lucide-react';
import { useAppContext, ContactLog } from '../../context/AppContext';

export default function ContactLogsRegistry() {
  const { state } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const logs = state.contactLogs || [];

  // Filter logs by search query
  const filteredLogs = logs.filter(
    (log) =>
      log.passengerNumber.includes(searchQuery) ||
      (log.passengerName && log.passengerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString([], {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col gap-5 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-amber-500" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hotline Contact Registry</h3>
            <p className="text-[10px] text-slate-400">Logs of dial clicks and messaging inquiries</p>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name/number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 rounded-xl border border-slate-700 bg-slate-800/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:bg-slate-800/80 transition-all"
          />
          <Search className="absolute left-2.5 top-2.5 text-slate-500" size={12} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/40 rounded-2xl p-3 border border-white/5">
        <div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Leads</p>
          <p className="text-lg font-black text-white">{logs.length}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Phone Calls</p>
          <p className="text-lg font-black text-indigo-400">
            {logs.filter((l) => l.type === 'Phone Call').length}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">WhatsApp</p>
          <p className="text-lg font-black text-emerald-400">
            {logs.filter((l) => l.type === 'WhatsApp').length}
          </p>
        </div>
      </div>

      {/* Logs List Container */}
      <div className="flex-1 overflow-y-auto max-h-[300px] pr-1.5 flex flex-col gap-2.5 custom-scrollbar">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <ClipboardList className="text-slate-700" size={32} />
            <p className="text-xs text-slate-500 font-medium">No contact interactions logged yet.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-white/5 bg-slate-950/20 p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-700/30 transition-all"
            >
              <div className="flex gap-3 items-start">
                {/* Icon Badge */}
                <div
                  className={`p-2 rounded-xl mt-0.5 ${
                    log.type === 'Phone Call'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {log.type === 'Phone Call' ? <Phone size={14} /> : <MessageCircle size={14} />}
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      {log.passengerName || 'Anonymous Guest'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold tracking-tight">
                      {log.passengerNumber}
                    </span>
                  </div>
                  {log.metadata && (
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {log.metadata}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1">
                    <Clock size={10} />
                    {formatTime(log.timestamp)}
                  </div>
                </div>
              </div>

              {/* Action Buttons to Call Back or Chat Back */}
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                {log.type === 'Phone Call' ? (
                  <a
                    href={`tel:${log.passengerNumber}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-[10px] font-bold text-white transition-all shadow-md"
                  >
                    <Phone size={10} />
                    Call Back
                  </a>
                ) : (
                  <a
                    href={`https://wa.me/${log.passengerNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white transition-all shadow-md"
                  >
                    <MessageCircle size={10} />
                    Chat Back
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
