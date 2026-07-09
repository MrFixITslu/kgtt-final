import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import GlobalHeader from './components/GlobalHeader';
import PassengerView from './views/PassengerView';
import PortalView from './views/PortalView';
import SimulationEngine from './components/common/SimulationEngine';

function AppContent() {
  const { state, dispatch } = useAppContext();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'portal' || roleParam === 'passenger') {
      dispatch({ type: 'SET_ROLE', role: roleParam });
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-950 font-sans transition-colors duration-200">
      <SimulationEngine />
      <GlobalHeader />
      <main>
        {state.activeRole === 'passenger' && <PassengerView />}
        {state.activeRole === 'portal' && <PortalView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
