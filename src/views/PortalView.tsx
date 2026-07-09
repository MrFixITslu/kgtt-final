import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import DutyToggle from '../components/driver/DutyToggle';
import IncomingJobModal from '../components/driver/IncomingJobModal';
import TripMilestones from '../components/driver/TripMilestones';
import KPIStrip from '../components/owner/KPIStrip';
import FinancialLedger from '../components/owner/FinancialLedger';
import PandLSummary from '../components/owner/PandLSummary';
import DriverManagement from '../components/owner/DriverManagement';
import NotificationCenter from '../components/owner/NotificationCenter';
import ContactLogsRegistry from '../components/owner/ContactLogsRegistry';
import SocialLinksManager from '../components/owner/SocialLinksManager';
import { Smartphone, Car, Clock, ShieldAlert, Lock, LogOut } from 'lucide-react';

export default function PortalView() {
  const { state, dispatch } = useAppContext();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const driver = state.drivers.find((d) => d.id === state.activeDriverId);
  const isOnline = driver?.status !== 'Offline';

  // Find a booking in Searching state (incoming job)
  const incomingBooking = state.bookings.find((b) => b.status === 'Searching');

  // Find this driver's active job
  const activeBooking = state.bookings.find(
    (b) => b.driverId === state.activeDriverId && b.status !== 'Completed'
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      dispatch({ type: 'ADMIN_LOGIN' });
      setError('');
      setPasscode('');
    } else {
      setError('Invalid passcode. Hint: use admin123');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'ADMIN_LOGOUT' });
  };

  return (
    <div
      className="min-h-screen bg-slate-950 p-4 lg:p-8 font-sans flex flex-col justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url("/bright_st_lucia_bg.png")' }}
    >
      {/* Soft overlay to guarantee high-contrast text readability */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md pointer-events-none" />
      
      <div className="mx-auto w-full max-w-screen-2xl relative z-10">
        {!state.adminAuthenticated ? (
          /* Passcode Gate Screen */
          <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 py-16 text-center shadow-xl backdrop-blur-xl">
              <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Lock size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">Owner Portal Locked</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Enter the administrator passcode to view earnings, ledger, and dispatch records.
              </p>

              <form onSubmit={handleLogin} className="mt-6 w-full flex flex-col gap-3">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-center text-lg tracking-widest text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
                />
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-400">
                    <ShieldAlert size={12} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Authenticate
                </button>
              </form>
              <p className="mt-4 text-[10px] text-slate-500">
                Passcode hint: <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-300">admin123</code>
              </p>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard: Main Header -> Driver Console (Full-Width Row) -> Owner Dashboard Sections */
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* MAIN HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  Fleet Owner & Operations Console
                </h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">K&G Taxi Tours · Admin Portal</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 hover:border-rose-500/30 hover:text-rose-400 transition-all active:scale-95 shadow-md"
              >
                <LogOut size={13} />
                Lock Owner Console
              </button>
            </div>

            {/* DRIVER CONSOLE (1x1 Full-Width Grid Row at the Top) */}
            <div className="w-full rounded-3xl border border-white/15 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-3.5">
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <Smartphone size={16} className="text-amber-500" />
                      Driver Console (KAnili Deterville)
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Go online to receive and advance live passenger requests</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Inline Today's Stats */}
                    <div className="flex items-center gap-2 rounded-xl bg-slate-950/50 px-3 py-1.5 border border-white/5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Earnings Today:</span>
                      <span className="text-xs font-black text-emerald-400">
                        ${state.ledger
                          .filter((l) => l.type === 'Income' && l.date === new Date().toISOString().split('T')[0])
                          .reduce((s, l) => s + l.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-950/50 px-3 py-1.5 border border-white/5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Trips Completed:</span>
                      <span className="text-xs font-black text-white">
                        {state.bookings.filter(
                          (b) => b.driverId === state.activeDriverId && b.status === 'Completed'
                        ).length}
                      </span>
                    </div>
                    <DutyToggle />
                  </div>
                </div>

                {/* Simulated Driver Console Body */}
                <div className="w-full">
                  {/* Offline state */}
                  {!isOnline && !activeBooking && (
                    <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950/40 py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-500 border border-white/5">
                        <Car size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-400">You are offline</p>
                      <p className="text-[11px] text-slate-600 px-4">Toggle your status above to become available for ride requests.</p>
                    </div>
                  )}

                  {/* Online idle state */}
                  {isOnline && !activeBooking && !incomingBooking && (
                    <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 py-8 text-center">
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                        <Car size={20} className="text-emerald-400" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                        </span>
                      </div>
                      <p className="text-xs font-bold text-emerald-400">Online & Ready</p>
                      <p className="text-[11px] text-slate-500 px-6 leading-relaxed">
                        Waiting for requests… Switch to the Passenger view to book an immediate ride.
                      </p>
                    </div>
                  )}

                  {/* Active trip milestones */}
                  {activeBooking && (
                    <TripMilestones booking={activeBooking} />
                  )}
                </div>
              </div>
            </div>

            {/* OWNER DASHBOARD PANEL */}
            <div className="w-full flex flex-col gap-6">
              {/* Real-time Notifications & Reminders */}
              <NotificationCenter />

              {/* KPI stats */}
              <KPIStrip />

              {/* Dashboard sections stacked in a clean 1x1 grid layout */}
              <div className="grid grid-cols-1 gap-6">
                <PandLSummary />
                <FinancialLedger />
                <DriverManagement />
                <ContactLogsRegistry />
                <SocialLinksManager />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Incoming job modal (overlay) */}
      {isOnline && incomingBooking && !activeBooking && (
        <IncomingJobModal booking={incomingBooking} />
      )}
    </div>
  );
}
