import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import DestinationSelector, { RouteSelection } from '../components/passenger/DestinationSelector';
import FarePaymentCard from '../components/passenger/FarePaymentCard';
import RideTracker from '../components/passenger/RideTracker';
import InAppChat from '../components/passenger/InAppChat';
import { ArrowLeft } from 'lucide-react';

type Step = 'select' | 'fare' | 'tracking';

const CAROUSEL_IMAGES = [
  '/sharp_st_lucia_bg.png',
  '/bright_st_lucia_bg.png',
  '/st_lucia_resort_pool.png',
  '/st_lucia_bg.png',
];

export default function PassengerView() {
  const { state } = useAppContext();
  const [step, setStep] = useState<Step>('select');
  const [selectedRoute, setSelectedRoute] = useState<RouteSelection | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Background carousel timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeBooking = state.activePassengerBookingId
    ? state.bookings.find((b) => b.id === state.activePassengerBookingId)
    : null;

  // Automatically switch to tracking step if there is an active booking
  React.useEffect(() => {
    if (activeBooking && activeBooking.status !== 'Completed') {
      setStep('tracking');
    }
  }, [activeBooking]);

  const showTracker = activeBooking && step === 'tracking';
  const showFare = selectedRoute && step === 'fare';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans bg-slate-950">
      {/* LEFT SIDE: Picture Carousel */}
      <div 
        className="lg:w-[60%] h-[35vh] lg:h-auto bg-cover bg-center bg-no-repeat relative transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url("${CAROUSEL_IMAGES[currentImageIndex]}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/40" />
      </div>

      {/* RIGHT SIDE: Input Box / Terminal */}
      <div className="flex-1 lg:w-[40%] flex items-center justify-center p-4 lg:p-12 relative z-10 -mt-8 lg:mt-0">
        {/* Core container (Centered Phone Layout) */}
        <div className="w-full max-w-[420px] relative flex flex-col justify-center items-center">
        {/* Glassmorphic Phone Shell */}
        <div className="w-full rounded-[40px] border border-white/15 bg-slate-900/60 backdrop-blur-xl p-3.5 shadow-2xl shadow-black/80 ring-1 ring-white/5 relative overflow-hidden">
          
          {/* Screen content */}
          <div className="min-h-[75vh] rounded-[28px] border border-white/5 bg-slate-950/90 p-5 flex flex-col justify-between">
            
            <div>
              {/* Mobile Phone Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-4 px-1 select-none">
                <span>10:09 PM</span>
                <div className="flex items-center gap-1.5">
                  {/* Signal bars */}
                  <div className="flex items-end gap-[1.5px] h-2">
                    <span className="w-[2px] h-[3px] bg-slate-600 rounded-[0.5px]" />
                    <span className="w-[2px] h-[5px] bg-slate-600 rounded-[0.5px]" />
                    <span className="w-[2px] h-[7px] bg-slate-600 rounded-[0.5px]" />
                    <span className="w-[2px] h-2 bg-amber-500 rounded-[0.5px]" />
                  </div>
                  {/* Wifi icon */}
                  <svg className="w-3 h-3 fill-amber-500" viewBox="0 0 24 24">
                    <path d="M12 21l-12-12c4.8-4.8 12.4-4.8 17.2 0l-5.2 5.2c-2.4-2.4-6.4-2.4-8.8 0l6.8 6.8z" />
                  </svg>
                  {/* Battery */}
                  <div className="w-5 h-2.5 border border-slate-600 rounded-[3px] p-[1px] flex items-center">
                    <div className="h-full w-[85%] bg-amber-500 rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* App header */}
              <div className="flex items-center gap-3 mb-5">
                {(step !== 'select') && (
                  <button
                    onClick={() => {
                      if (step === 'fare') setStep('select');
                      else if (step === 'tracking' && activeBooking?.status === 'Completed') setStep('select');
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} />
                  </button>
                )}
                <div>
                  <h1 className="text-lg font-black text-white tracking-tight">
                    {step === 'select' && 'Book Your Ride'}
                    {step === 'fare' && (selectedRoute?.scheduledTime ? 'Schedule Ride' : 'Confirm Ride')}
                    {step === 'tracking' && (activeBooking?.status === 'Scheduled' ? 'Scheduled Trip' : 'Live Tracking')}
                  </h1>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    {step === 'select' && 'K&G Taxi Tours'}
                    {step === 'fare' && 'Choose your payment method'}
                    {step === 'tracking' && `Booking #${activeBooking?.id.slice(-6)}`}
                  </p>
                </div>
              </div>

              {/* Step: Select destination */}
              {step === 'select' && (
                <DestinationSelector
                  onSelect={(route) => {
                    setSelectedRoute(route);
                    setStep('fare');
                  }}
                />
              )}

              {/* Step: Fare + payment */}
              {showFare && selectedRoute && (
                <FarePaymentCard
                  route={selectedRoute}
                  onBooked={() => {
                    if (selectedRoute.scheduledTime) {
                      // For scheduled trips, go back to select screen
                      setStep('select');
                      setSelectedRoute(null);
                      alert('Trip successfully scheduled! View/manage it under the Scheduled Trips in the Owner console.');
                    } else {
                      setStep('tracking');
                    }
                  }}
                />
              )}

              {/* Step: Tracking */}
              {step === 'tracking' && activeBooking && (
                <div className="flex flex-col gap-4">
                  <RideTracker booking={activeBooking} />
                  {activeBooking.status !== 'Searching' && activeBooking.status !== 'Scheduled' && (
                    <InAppChat booking={activeBooking} />
                  )}
                  {activeBooking.status === 'Completed' && (
                    <button
                      onClick={() => {
                        setStep('select');
                        setSelectedRoute(null);
                      }}
                      className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-colors"
                    >
                      Book Another Ride
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Hint */}
            {step === 'tracking' && activeBooking?.status === 'Searching' && (
              <p className="mt-4 text-center text-[10px] text-slate-500 bg-slate-900/40 py-2 px-3 border border-white/5 rounded-xl">
                💡 Switch to the <strong className="text-amber-400">Portal Dashboard</strong> to accept this ride.
              </p>
            )}

            {/* Dynamic Social Links */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between shrink-0">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest select-none">Connect with Us</span>
              <div className="flex items-center gap-2">
                {state.socialLinks?.instagram && (
                  <a
                    href={state.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-pink-500 hover:border-pink-500/30 transition-all active:scale-90"
                    title="Instagram"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                )}
                {state.socialLinks?.facebook && (
                  <a
                    href={state.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-blue-500 hover:border-blue-500/30 transition-all active:scale-90"
                    title="Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
                {state.socialLinks?.tiktok && (
                  <a
                    href={state.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-teal-400 hover:border-teal-500/30 transition-all active:scale-90"
                    title="TikTok"
                  >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.61-.7v5.13c.03 3.39-2.07 6.64-5.32 7.75-3.3 1.15-7.23-.23-8.86-3.32-1.72-3.15-.96-7.51 1.73-9.76 2.05-1.72 5.09-1.99 7.42-.77.01.01.02.02.02.03v4.1c-1.34-.84-3.14-.69-4.24.42-.98.98-1.07 2.65-.2 3.73.91 1.17 2.68 1.48 3.91.68 1.02-.63 1.48-1.89 1.44-3.07V0z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
