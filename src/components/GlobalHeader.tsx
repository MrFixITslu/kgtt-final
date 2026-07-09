import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Car, Sun, Moon } from 'lucide-react';

export default function GlobalHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/20">
            <Car size={18} className="text-slate-950 font-bold" />
          </div>
          <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 bg-clip-text text-lg font-black tracking-wide text-transparent font-sans uppercase">
            K&G Taxi Tours
          </span>
          <span className="ml-2 hidden rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 sm:block">
            St. Lucia Ecosystem
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white transition-all active:scale-95"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Live indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Active Loop</span>
          </div>
        </div>
      </div>
    </header>
  );
}
