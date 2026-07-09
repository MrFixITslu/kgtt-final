import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { ST_LUCIA_DISTRICTS } from '../utils/stLuciaDistricts';
import { findShortestPath } from '../utils/routing';

// ─── Schema Types ────────────────────────────────────────────────────────────

export type PaymentMethod = 'Cash' | 'In-App';
export type BookingStatus = 'Searching' | 'DriverEnRoute' | 'InTrip' | 'Completed' | 'Scheduled';
export type DriverStatus = 'Offline' | 'Available' | 'OnJob';
export type LedgerType = 'Investment' | 'Income';

export interface ChatMessage {
  id: string;
  sender: 'Passenger' | 'Driver';
  text: string;
  timestamp: string;
}

export interface Booking {
  id: string;
  passengerName: string;
  pickup: string;
  dropoff: string;
  fare: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  driverId: string | null;
  eta: number; // minutes
  messages: ChatMessage[];
  scheduledTime: string | null; // ISO string or date representation, null if instant
  routePath?: string[];
  currentNodeIndex?: number;
  currentCoords?: { x: number; y: number };
}

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  status: DriverStatus;
  currentCoords: { lat: number; lng: number };
  avatarInitials: string;
  currentDistrict?: string;
}

export interface ReceiptFile {
  name: string;
  size: string;
  url?: string;
}

export interface LedgerEntry {
  id: string;
  type: LedgerType;
  amount: number;
  category: 'Ride Fare' | 'Fuel' | 'Tires' | 'Maintenance' | 'Tech Fees' | 'Marketing' | 'Other';
  description: string;
  date: string;
  receiptFile: ReceiptFile | null;
}

export interface ContactLog {
  id: string;
  timestamp: string;
  type: 'Phone Call' | 'WhatsApp';
  passengerNumber: string;
  status: 'Dialed' | 'Sent';
  passengerName?: string;
  metadata?: string;
}

// ─── State ───────────────────────────────────────────────────────────────────

export interface SocialLinks {
  instagram: string;
  facebook: string;
  tiktok: string;
}

export interface AppState {
  bookings: Booking[];
  drivers: Driver[];
  ledger: LedgerEntry[];
  activeRole: 'passenger' | 'portal';
  activePassengerBookingId: string | null;
  activeDriverId: string;
  adminAuthenticated: boolean;
  contactLogs: ContactLog[];
  socialLinks: SocialLinks;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'SET_ROLE'; role: AppState['activeRole'] }
  | { type: 'ADD_BOOKING'; booking: Booking }
  | { type: 'UPDATE_BOOKING_STATUS'; bookingId: string; status: BookingStatus; driverId?: string }
  | { type: 'DECREMENT_ETA'; bookingId: string }
  | { type: 'SEND_MESSAGE'; bookingId: string; message: ChatMessage }
  | { type: 'UPDATE_DRIVER_STATUS'; driverId: string; status: DriverStatus }
  | { type: 'ADD_LEDGER_ENTRY'; entry: LedgerEntry }
  | { type: 'COMPLETE_BOOKING_INCOME'; bookingId: string }
  | { type: 'ADMIN_LOGIN' }
  | { type: 'ADMIN_LOGOUT' }
  | { type: 'START_SCHEDULED_TRIP'; bookingId: string; driverId: string }
  | { type: 'CANCEL_BOOKING'; bookingId: string }
  | { type: 'ADD_DRIVER'; driver: Driver }
  | { type: 'UPDATE_DRIVER'; driver: Driver }
  | { type: 'SYNC_STATE'; state: AppState }
  | { type: 'ASSIGN_DRIVER'; bookingId: string; driverId: string; routePath: string[]; currentCoords: { x: number; y: number } }
  | { type: 'TICK_SIMULATION' }
  | { type: 'LOG_CONTACT'; log: Omit<ContactLog, 'id' | 'timestamp'> }
  | { type: 'UPDATE_SOCIAL_LINKS'; links: SocialLinks };

// ─── Initial Data ─────────────────────────────────────────────────────────────

export const initialDrivers: Driver[] = [
  {
    id: 'drv-001',
    name: 'KAnili Deterville',
    vehicle: 'Toyota • RED 4421',
    status: 'Available',
    currentCoords: { lat: 14.01, lng: -60.98 }, // Centered in St. Lucia (approx)
    avatarInitials: 'KD',
  },
];

const initialLedger: LedgerEntry[] = [
  {
    id: 'led-001',
    type: 'Income',
    amount: 240,
    category: 'Ride Fare',
    description: 'Airport Transfer (Vieux Fort → Castries)',
    date: '2026-05-15',
    receiptFile: null,
  },
  {
    id: 'led-002',
    type: 'Investment',
    amount: 80,
    category: 'Fuel',
    description: 'Weekly gas fillup - Rubis Shell',
    date: '2026-05-16',
    receiptFile: { name: 'rubis_receipt_may16.png', size: '240 KB' },
  },
  {
    id: 'led-003',
    type: 'Income',
    amount: 95,
    category: 'Ride Fare',
    description: 'Soufrière → Gros Islet Transfer',
    date: '2026-05-17',
    receiptFile: null,
  },
  {
    id: 'led-004',
    type: 'Investment',
    amount: 320,
    category: 'Tires',
    description: 'Two front tire replacements (Michelin)',
    date: '2026-05-18',
    receiptFile: { name: 'st_lucia_tyres_inv552.pdf', size: '1.2 MB' },
  },
];

export const initialState: AppState = {
  bookings: [],
  drivers: initialDrivers,
  ledger: initialLedger,
  activeRole: 'passenger',
  activePassengerBookingId: null,
  activeDriverId: 'drv-001',
  adminAuthenticated: false,
  contactLogs: [],
  socialLinks: {
    instagram: 'https://instagram.com/kg_taxitours',
    facebook: 'https://facebook.com/kg_taxitours',
    tiktok: 'https://tiktok.com/@kg_taxitours',
  },
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SYNC_STATE':
      return {
        ...state,
        bookings: action.state.bookings,
        drivers: action.state.drivers,
        ledger: action.state.ledger,
        contactLogs: action.state.contactLogs || [],
        socialLinks: action.state.socialLinks || { instagram: '', facebook: '', tiktok: '' },
        // Sync activePassengerBookingId if the current passenger booking was completed or deleted
        activePassengerBookingId: action.state.bookings.some(b => b.id === state.activePassengerBookingId)
          ? state.activePassengerBookingId
          : (action.state.bookings.find(b => b.status !== 'Completed' && b.status !== 'Scheduled')?.id || null),
      };

    case 'SET_ROLE':
      return { ...state, activeRole: action.role };

    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [...state.bookings, action.booking],
        activePassengerBookingId:
          action.booking.status !== 'Scheduled' ? action.booking.id : state.activePassengerBookingId,
      };

    case 'UPDATE_BOOKING_STATUS':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.bookingId
            ? {
                ...b,
                status: action.status,
                driverId: action.driverId !== undefined ? action.driverId : b.driverId,
              }
            : b
        ),
        drivers:
          action.status === 'DriverEnRoute' || action.status === 'InTrip'
            ? state.drivers.map((d) =>
                d.id === action.driverId ? { ...d, status: 'OnJob' } : d
              )
            : action.status === 'Completed'
            ? state.drivers.map((d) => {
                const booking = state.bookings.find((b) => b.id === action.bookingId);
                return booking && d.id === booking.driverId
                  ? { ...d, status: 'Available' }
                  : d;
              })
            : state.drivers,
      };

    case 'START_SCHEDULED_TRIP':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.bookingId
            ? {
                ...b,
                status: 'Searching',
                eta: 0,
              }
            : b
        ),
        activePassengerBookingId: action.bookingId, // Make active for passenger view
      };

    case 'ASSIGN_DRIVER': {
      const b = state.bookings.find((bk) => bk.id === action.bookingId);
      if (!b) return state;
      return {
        ...state,
        bookings: state.bookings.map((bk) =>
          bk.id === action.bookingId
            ? {
                ...bk,
                status: 'DriverEnRoute',
                driverId: action.driverId,
                routePath: action.routePath,
                currentNodeIndex: 0,
                currentCoords: action.currentCoords,
                eta: action.routePath.length - 1,
              }
            : bk
        ),
        drivers: state.drivers.map((d) =>
          d.id === action.driverId ? { ...d, status: 'OnJob' } : d
        ),
      };
    }

    case 'TICK_SIMULATION': {
      let ledgerEntriesToAdd: LedgerEntry[] = [];
      let updatedDrivers = [...state.drivers];

      const updatedBookings = state.bookings.map((booking): Booking => {
        if (booking.status !== 'DriverEnRoute' && booking.status !== 'InTrip') {
          return booking;
        }

        const path = booking.routePath || [];
        const currentIndex = booking.currentNodeIndex ?? 0;

        if (path.length === 0) return booking;

        // If we haven't reached the destination node of the current segment
        if (currentIndex < path.length - 1) {
          const nextIndex = currentIndex + 1;
          const nextNodeName = path[nextIndex];
          const nextNode = ST_LUCIA_DISTRICTS.find((d) => d.name === nextNodeName);

          const nextCoords = nextNode
            ? { x: nextNode.x, y: nextNode.y }
            : booking.currentCoords;

          // If the driver is going to pickup, update the driver's coordinates on map & console
          if (booking.status === 'DriverEnRoute') {
            updatedDrivers = updatedDrivers.map((d) =>
              d.id === booking.driverId
                ? {
                    ...d,
                    currentDistrict: nextNodeName,
                  }
                : d
            );
          }

          return {
            ...booking,
            currentNodeIndex: nextIndex,
            currentCoords: nextCoords,
            eta: Math.max(1, path.length - 1 - nextIndex),
          };
        } else {
          // We reached the end of the current path!
          if (booking.status === 'DriverEnRoute') {
            // Driver arrived at Pickup! Start the actual passenger trip
            const newPath = findShortestPath(booking.pickup, booking.dropoff);
            const pickupNode = ST_LUCIA_DISTRICTS.find((d) => d.name === booking.pickup);
            const pickupCoords = pickupNode
              ? { x: pickupNode.x, y: pickupNode.y }
              : { x: 2, y: 8 };

            // Add notification message in chat
            const arrivalMsg: ChatMessage = {
              id: `msg-arrive-${Date.now()}`,
              sender: 'Driver',
              text: "I have arrived at your pickup location!",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            return {
              ...booking,
              status: 'InTrip',
              routePath: newPath,
              currentNodeIndex: 0,
              currentCoords: pickupCoords,
              eta: Math.max(1, newPath.length - 1),
              messages: [...booking.messages, arrivalMsg],
            };
          } else {
            // Arrived at Dropoff! Complete the ride
            // 1. Generate income Ledger Entry
            const incomeEntry: LedgerEntry = {
              id: `led-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              type: 'Income',
              amount: booking.fare,
              category: 'Ride Fare',
              description: `K&G Ride: ${booking.pickup} → ${booking.dropoff}`,
              date: new Date().toISOString().split('T')[0],
              receiptFile: null,
            };
            ledgerEntriesToAdd.push(incomeEntry);

            // 2. Set driver back to Available at dropoff district
            updatedDrivers = updatedDrivers.map((d) =>
              d.id === booking.driverId
                ? {
                    ...d,
                    status: 'Available',
                    currentDistrict: booking.dropoff,
                  }
                : d
            );

            return {
              ...booking,
              status: 'Completed',
              eta: 0,
            };
          }
        }
      });

      return {
        ...state,
        bookings: updatedBookings,
        drivers: updatedDrivers,
        ledger: [...state.ledger, ...ledgerEntriesToAdd],
        // Reset active passenger booking if it just completed
        activePassengerBookingId: updatedBookings.find(
          (b) => b.id === state.activePassengerBookingId && b.status !== 'Completed'
        )?.id ?? null,
      };
    }

    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter((b) => b.id !== action.bookingId),
        activePassengerBookingId:
          state.activePassengerBookingId === action.bookingId ? null : state.activePassengerBookingId,
      };

    case 'DECREMENT_ETA':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.bookingId ? { ...b, eta: Math.max(0, b.eta - 1) } : b
        ),
      };

    case 'SEND_MESSAGE':
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.bookingId
            ? { ...b, messages: [...b.messages, action.message] }
            : b
        ),
      };

    case 'UPDATE_DRIVER_STATUS':
      return {
        ...state,
        drivers: state.drivers.map((d) =>
          d.id === action.driverId ? { ...d, status: action.status } : d
        ),
      };

    case 'ADD_LEDGER_ENTRY':
      return { ...state, ledger: [...state.ledger, action.entry] };

    case 'COMPLETE_BOOKING_INCOME': {
      const booking = state.bookings.find((b) => b.id === action.bookingId);
      if (!booking) return state;
      const incomeEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        type: 'Income',
        amount: booking.fare,
        category: 'Ride Fare',
        description: `${booking.pickup} → ${booking.dropoff}`,
        date: new Date().toISOString().split('T')[0],
        receiptFile: null,
      };
      return { ...state, ledger: [...state.ledger, incomeEntry] };
    }
    case 'LOG_CONTACT': {
      const newLog: ContactLog = {
        ...action.log,
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        contactLogs: [newLog, ...state.contactLogs],
      };
    }

    case 'ADD_DRIVER':
      return {
        ...state,
        drivers: [...state.drivers, action.driver],
      };

    case 'UPDATE_DRIVER':
      return {
        ...state,
        drivers: state.drivers.map((d) => (d.id === action.driver.id ? action.driver : d)),
      };

    case 'ADMIN_LOGIN':
      return { ...state, adminAuthenticated: true };

    case 'ADMIN_LOGOUT':
      return { ...state, adminAuthenticated: false };

    case 'UPDATE_SOCIAL_LINKS':
      return {
        ...state,
        socialLinks: action.links,
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

const loadSavedState = (): AppState => {
  try {
    const saved = localStorage.getItem('wave_fleet_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialState,
        bookings: parsed.bookings || [],
        ledger: parsed.ledger || [],
        drivers: parsed.drivers || initialDrivers,
        contactLogs: parsed.contactLogs || [],
        socialLinks: parsed.socialLinks || initialState.socialLinks,
      };
    }
  } catch (e) {
    console.error('Error loading state from localStorage', e);
  }
  return initialState;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, () => loadSavedState());

  // Save to localStorage on state changes
  useEffect(() => {
    const stateToSave = {
      bookings: state.bookings,
      ledger: state.ledger,
      drivers: state.drivers,
      contactLogs: state.contactLogs || [],
      socialLinks: state.socialLinks || initialState.socialLinks,
    };
    localStorage.setItem('wave_fleet_state', JSON.stringify(stateToSave));
  }, [state.bookings, state.ledger, state.drivers, state.contactLogs, state.socialLinks]);

  // Sync state from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wave_fleet_state' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const newState: AppState = {
            ...state,
            bookings: parsed.bookings || [],
            ledger: parsed.ledger || [],
            drivers: parsed.drivers || [],
            contactLogs: parsed.contactLogs || [],
            socialLinks: parsed.socialLinks || initialState.socialLinks,
          };
          dispatch({ type: 'SYNC_STATE', state: newState });
        } catch (err) {
          console.error('Failed to sync state from localStorage event', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
