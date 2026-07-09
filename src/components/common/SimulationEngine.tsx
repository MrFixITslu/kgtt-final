import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

export default function SimulationEngine() {
  const { state, dispatch } = useAppContext();
  const stateRef = useRef(state);

  // Keep stateRef up to date to avoid interval closure capture issues
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = stateRef.current;

      // Drive the coordinates tick for active bookings (en route or in trip)
      const hasActiveTrips = currentState.bookings.some(
        (b) => b.status === 'DriverEnRoute' || b.status === 'InTrip'
      );
      if (hasActiveTrips) {
        dispatch({ type: 'TICK_SIMULATION' });
      }
    }, 2000); // Ticks every 2 real seconds for snappy and responsive map animation

    return () => clearInterval(interval);
  }, [dispatch]);

  return null; // Pure background simulator component, does not render any visual DOM
}
