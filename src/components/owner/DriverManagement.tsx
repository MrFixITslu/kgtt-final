import React, { useState } from 'react';
import { useAppContext, Driver, DriverStatus } from '../../context/AppContext';
import { Car, UserPlus, CheckCircle, ShieldAlert, Sparkles, MapPin, Edit2, X, Save } from 'lucide-react';

interface MockApplicant {
  id: string;
  name: string;
  vehicle: string;
  avatarInitials: string;
}

const mockApplicantsList: MockApplicant[] = [
  {
    id: 'app-002',
    name: 'Julien Baptiste',
    vehicle: 'Hyundai Elantra • SL-3320',
    avatarInitials: 'JB',
  },
  {
    id: 'app-003',
    name: 'Sarah Charles',
    vehicle: 'Suzuki Swift • G-8891',
    avatarInitials: 'SC',
  },
];

export default function DriverManagement() {
  const { state, dispatch } = useAppContext();
  const [applicants, setApplicants] = useState<MockApplicant[]>(mockApplicantsList);

  // Form State
  const [name, setName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !vehicleModel || !licensePlate) {
      setError('Please fill in all registration fields');
      return;
    }

    const newDriver: Driver = {
      id: `drv-${Date.now()}`,
      name,
      vehicle: `${vehicleModel} • ${licensePlate.toUpperCase()}`,
      status: 'Offline',
      currentCoords: { lat: 14.02, lng: -60.97 },
      avatarInitials: name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
      currentDistrict: 'Castries (Capital)',
    };

    dispatch({ type: 'ADD_DRIVER', driver: newDriver });
    setSuccess(`Successfully registered ${name} in the fleet!`);
    setName('');
    setVehicleModel('');
    setLicensePlate('');
    setError('');

    setTimeout(() => setSuccess(''), 4000);
  };

  const handleApprove = (applicant: MockApplicant) => {
    const newDriver: Driver = {
      id: applicant.id,
      name: applicant.name,
      vehicle: applicant.vehicle,
      status: 'Offline',
      currentCoords: { lat: 13.98, lng: -60.96 },
      avatarInitials: applicant.avatarInitials,
      currentDistrict: 'Castries (Capital)',
    };

    dispatch({ type: 'ADD_DRIVER', driver: newDriver });
    setApplicants((prev) => prev.filter((a) => a.id !== applicant.id));
    setSuccess(`Approved & onboarded ${applicant.name}!`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editVehicle, setEditVehicle] = useState('');
  const [editStatus, setEditStatus] = useState<DriverStatus>('Offline');

  const startEdit = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setEditName(driver.name);
    setEditVehicle(driver.vehicle);
    setEditStatus(driver.status);
  };

  const saveEdit = (driver: Driver) => {
    if (!editName || !editVehicle) return;
    dispatch({
      type: 'UPDATE_DRIVER',
      driver: {
        ...driver,
        name: editName,
        vehicle: editVehicle,
        status: editStatus,
      },
    });
    setEditingDriverId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Active Fleet Panel (Full Width) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-800/50 p-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-indigo-400" />
            <h3 className="font-bold text-white text-base">Fleet Driver Registry & Status</h3>
          </div>
          <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
            {state.drivers.length} Registered
          </span>
        </div>

        {/* Live Driver List */}
        <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
          {state.drivers.map((driver) => {
            const isOnline = driver.status !== 'Offline';
            return (
              <div
                key={driver.id}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all hover:bg-white/[0.01] group ${
                  driver.status === 'OnJob'
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : driver.status === 'Available'
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-white/5 bg-slate-900/30'
                }`}
              >
                {editingDriverId === driver.id ? (
                  <div className="flex-1 flex items-center justify-between gap-3">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                      />
                      <input 
                        type="text" 
                        value={editVehicle}
                        onChange={(e) => setEditVehicle(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                      />
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as DriverStatus)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                      >
                        <option value="Available">Available</option>
                        <option value="OnJob">OnJob</option>
                        <option value="Offline">Offline</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => saveEdit(driver)} className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                        <Save size={14} />
                      </button>
                      <button onClick={() => setEditingDriverId(null)} className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm shrink-0">
                        {driver.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white leading-snug">{driver.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{driver.vehicle}</p>
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                          <MapPin size={9} className="text-indigo-400 shrink-0" />
                          <span>{driver.currentCoords.lat.toFixed(4)}, {driver.currentCoords.lng.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${
                            driver.status === 'OnJob'
                              ? 'bg-amber-500/10 text-amber-400'
                              : driver.status === 'Available'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-700/25 text-slate-400'
                          }`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${
                              driver.status === 'OnJob'
                                ? 'bg-amber-400 animate-pulse'
                                : driver.status === 'Available'
                                ? 'bg-emerald-400 animate-pulse'
                                : 'bg-slate-500'
                            }`}
                          />
                          {driver.status}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          ID: {driver.id.slice(0, 7)}
                        </span>
                      </div>
                      <button 
                        onClick={() => startEdit(driver)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
