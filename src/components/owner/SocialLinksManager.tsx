import React, { useState, useEffect } from 'react';
import { Share2, Link, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function SocialLinksManager() {
  const { state, dispatch } = useAppContext();
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [success, setSuccess] = useState('');

  // Hydrate local state when context loads/updates
  useEffect(() => {
    if (state.socialLinks) {
      setInstagram(state.socialLinks.instagram || '');
      setFacebook(state.socialLinks.facebook || '');
      setTiktok(state.socialLinks.tiktok || '');
    }
  }, [state.socialLinks]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: 'UPDATE_SOCIAL_LINKS',
      links: { instagram, facebook, tiktok },
    });
    setSuccess('Social media links updated successfully!');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Share2 className="text-indigo-400 animate-pulse" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Social Links Settings</h3>
            <p className="text-[10px] text-slate-400">Configure Passenger View social connections</p>
          </div>
        </div>
        <Sparkles size={16} className="text-amber-500" />
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Instagram Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 fill-none stroke-current text-pink-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram Link
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://instagram.com/username"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 pl-3 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Facebook Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 fill-none stroke-current text-blue-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            Facebook Link
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://facebook.com/username"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 pl-3 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* TikTok Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Link size={12} className="text-teal-400" />
            TikTok Link
          </label>
          <div className="relative">
            <input
              type="url"
              placeholder="https://tiktok.com/@username"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 pl-3 pr-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-center">
            {success}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          className="w-full mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          Save Social Links
        </button>
      </form>
    </div>
  );
}
