import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Power, Wifi, WifiOff, Car } from 'lucide-react';

export default function DutyToggle() {
  const { state, dispatch } = useAppContext();
  const driver = state.drivers.find((d) => d.id === state.activeDriverId);
  if (!driver) return null;

  const isOnline = driver.status !== 'Offline';
  const isOnJob = driver.status === 'OnJob';

  const handleToggle = () => {
    if (isOnJob) return; // cannot go offline mid-job
    dispatch({
      type: 'UPDATE_DRIVER_STATUS',
      driverId: driver.id,
      status: isOnline ? 'Offline' : 'Available',
    });
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border p-5 transition-all duration-500 ${
      isOnJob
        ? 'border-amber-500/30 bg-amber-500/10'
        : isOnline
        ? 'border-emerald-500/30 bg-emerald-500/10'
        : 'border-slate-700 bg-slate-800/80'
    }`}>
      {/* Glow effect when online */}
      {isOnline && !isOnJob && (
        <div className="absolute inset-0 -z-10 bg-emerald-500/5 blur-2xl" />
      )}

      <div className="flex items-center justify-between">
        {/* Status info */}
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
            isOnJob ? 'bg-amber-500/20 text-amber-400' :
            isOnline ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-slate-700 text-slate-500'
          }`}>
            {isOnJob ? <Car size={22} /> : isOnline ? <Wifi size={22} /> : <WifiOff size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{driver.name}</span>
              {isOnline && (
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isOnJob ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${isOnJob ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">{driver.vehicle}</p>
            <p className={`text-xs font-semibold mt-0.5 ${
              isOnJob ? 'text-amber-400' : isOnline ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {isOnJob ? '🚗 On Active Job' : isOnline ? '● Available for rides' : '○ Offline'}
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={isOnJob}
          title={isOnJob ? 'Cannot go offline during a trip' : ''}
          className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 font-bold shadow-lg transition-all duration-300 disabled:cursor-not-allowed ${
            isOnJob
              ? 'border-amber-500/50 bg-amber-500/20 text-amber-400'
              : isOnline
              ? 'border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/40 hover:bg-emerald-500 active:scale-95'
              : 'border-slate-600 bg-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 active:scale-95'
          }`}
        >
          <Power size={22} />
        </button>
      </div>

      {isOnJob && (
        <p className="mt-3 text-center text-xs text-amber-400/80">
          Complete your current trip before going offline
        </p>
      )}
    </div>
  );
}
