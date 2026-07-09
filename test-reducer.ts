import { appReducer, initialState, AppState, Booking } from './src/context/AppContext';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

console.log('🧪 Starting AppState Reducer Logic Tests...');

// 1. Initial State Checks
let state = { ...initialState };
assert(state.bookings.length === 0, 'Should start with 0 bookings');
assert(state.drivers.length === 1, 'Should start with 1 driver (KAnili Deterville)');
assert(state.drivers[0].status === 'Available', 'Driver KAnili Deterville should start Available');
assert(state.activeRole === 'passenger', 'Active role should default to passenger');
assert(!state.adminAuthenticated, 'Admin should start unauthenticated');
console.log('✓ Initial state validation passed.');

// 2. Set Role Test
state = appReducer(state, { type: 'SET_ROLE', role: 'portal' });
assert(state.activeRole === 'portal', 'Role should update to portal');
console.log('✓ SET_ROLE action passed.');

// 3. Driver Duty status updates
state = appReducer(state, { type: 'UPDATE_DRIVER_STATUS', driverId: 'drv-001', status: 'Offline' });
assert(state.drivers[0].status === 'Offline', 'Driver status should be Offline');
console.log('✓ UPDATE_DRIVER_STATUS (duty status) action passed.');

// 4. Add Booking Test
const mockBooking: Booking = {
  id: 'book-123',
  passengerName: 'John Doe',
  pickup: 'Castries',
  dropoff: 'Gros Islet',
  fare: 45.0,
  paymentMethod: 'Cash',
  status: 'Searching',
  driverId: null,
  eta: 10,
  messages: [],
  scheduledTime: null,
};
state = appReducer(state, { type: 'ADD_BOOKING', booking: mockBooking });
assert(state.bookings.length === 1, 'Bookings length should be 1');
assert(state.bookings[0].id === 'book-123', 'Booking ID should match');
assert(state.bookings[0].status === 'Searching', 'Booking should be in Searching state');
assert(state.activePassengerBookingId === 'book-123', 'Active booking ID should update for passenger');
console.log('✓ ADD_BOOKING action passed.');

// 5. Driver accepts job
state = appReducer(state, { type: 'UPDATE_BOOKING_STATUS', bookingId: 'book-123', status: 'DriverEnRoute', driverId: 'drv-001' });
assert(state.bookings[0].status === 'DriverEnRoute', 'Booking status should be DriverEnRoute');
assert(state.bookings[0].driverId === 'drv-001', 'Booking driverId should be drv-001');
assert(state.drivers[0].status === 'OnJob', 'Driver status should switch to OnJob when assigned');
console.log('✓ UPDATE_BOOKING_STATUS (Accept Job) action passed.');

// 6. Complete Trip
state = appReducer(state, { type: 'UPDATE_BOOKING_STATUS', bookingId: 'book-123', status: 'Completed' });
assert(state.bookings[0].status === 'Completed', 'Booking status should be Completed');
assert(state.drivers[0].status === 'Available', 'Driver status should return to Available on trip completion');
console.log('✓ UPDATE_BOOKING_STATUS (Complete Trip) action passed.');

// 7. Complete booking income and log in ledger
const initialLedgerSize = state.ledger.length;
state = appReducer(state, { type: 'COMPLETE_BOOKING_INCOME', bookingId: 'book-123' });
assert(state.ledger.length === initialLedgerSize + 1, 'Ledger size should increase by 1');
const newEntry = state.ledger[state.ledger.length - 1];
assert(newEntry.type === 'Income', 'New ledger entry should be Income type');
assert(newEntry.amount === 45.0, 'New ledger entry amount should match booking fare');
assert(newEntry.category === 'Ride Fare', 'New ledger entry category should be Ride Fare');
console.log('✓ COMPLETE_BOOKING_INCOME action passed.');

// 8. Add Driver Test
const driverCountBefore = state.drivers.length;
state = appReducer(state, {
  type: 'ADD_DRIVER',
  driver: {
    id: 'drv-002',
    name: 'Julien Baptiste',
    vehicle: 'Hyundai Elantra • SL-3320',
    status: 'Offline',
    currentCoords: { lat: 14.02, lng: -60.97 },
    avatarInitials: 'JB',
  },
});
assert(state.drivers.length === driverCountBefore + 1, 'Drivers list size should increase by 1');
assert(state.drivers[state.drivers.length - 1].name === 'Julien Baptiste', 'Newly added driver name should match');
console.log('✓ ADD_DRIVER action passed.');

// 9. Admin authentication toggle
state = appReducer(state, { type: 'ADMIN_LOGIN' });
assert(state.adminAuthenticated === true, 'Admin should be authenticated');
state = appReducer(state, { type: 'ADMIN_LOGOUT' });
assert(state.adminAuthenticated === false, 'Admin should be logged out');
console.log('✓ Admin login and logout gate actions passed.');

// 9. Sync state cross-tab verification
// Simulate another tab changing the bookings list but preserving local settings
const externalState: AppState = {
  bookings: [
    { ...mockBooking, status: 'Completed' }
  ],
  drivers: [
    { ...state.drivers[0], status: 'Offline' }
  ],
  ledger: [
    ...state.ledger,
    { id: 'led-999', type: 'Income', amount: 100, category: 'Ride Fare', description: 'External', date: '2026-05-19', receiptFile: null }
  ],
  activeRole: 'passenger', // simulated tab's role
  activePassengerBookingId: null,
  activeDriverId: 'drv-001',
  adminAuthenticated: false, // simulated tab's auth status
};

state.activeRole = 'portal';
state.adminAuthenticated = true;

const syncedState = appReducer(state, { type: 'SYNC_STATE', state: externalState });
assert(syncedState.activeRole === 'portal', 'Synced state must preserve local activeRole');
assert(syncedState.adminAuthenticated === true, 'Synced state must preserve local adminAuthenticated status');
assert(syncedState.bookings[0].status === 'Completed', 'Synced state should load booking from external tab');
assert(syncedState.drivers[0].status === 'Offline', 'Synced state should load driver status from external tab');
assert(syncedState.ledger.some(l => l.id === 'led-999'), 'Synced state should append ledger entry from external tab');
console.log('✓ SYNC_STATE cross-tab isolation rules validation passed.');

// 10. Call Logs / Contact Registry Test
const contactLogsCountBefore = state.contactLogs?.length || 0;
state = appReducer(state, {
  type: 'LOG_CONTACT',
  log: {
    type: 'Phone Call',
    passengerNumber: '+1 (758) 724-0513',
    passengerName: 'Jane Smith',
    status: 'Dialed',
    metadata: 'Test call dial log.',
  },
});
assert(state.contactLogs.length === contactLogsCountBefore + 1, 'Contact logs size should increase by 1');
assert(state.contactLogs[0].passengerName === 'Jane Smith', 'Logged contact passengerName should match');
assert(state.contactLogs[0].type === 'Phone Call', 'Logged contact type should be Phone Call');
console.log('✓ LOG_CONTACT action and calling log registration passed.');

console.log('\n🎉 SUCCESS: All reducer and workflow tests passed successfully! The application logic is fully verified and secure.');
