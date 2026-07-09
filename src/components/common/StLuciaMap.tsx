import React from 'react';
import { ST_LUCIA_DISTRICTS } from '../../utils/stLuciaDistricts';
import { MapPin, Navigation } from 'lucide-react';
import { Driver } from '../../context/AppContext';
import { findShortestPath } from '../../utils/routing';

interface Props {
  pickup?: string;
  dropoff?: string;
  currentCoords?: { x: number; y: number };
  routePath?: string[];
  bookingStatus?: string;
  heightClass?: string;
  drivers?: Driver[];
}

const ROAD_CONNECTIONS = [
  ['Castries (Capital)', 'Gros Islet'],
  ['Castries (Capital)', 'Babonneau'],
  ['Castries (Capital)', 'Anse la Raye'],
  ['Gros Islet', 'Babonneau'],
  ['Babonneau', 'Dennery'],
  ['Dennery', 'Micoud'],
  ['Micoud', 'Vieux Fort'],
  ['Vieux Fort', 'Laborie'],
  ['Laborie', 'Choiseul'],
  ['Choiseul', 'Soufrière'],
  ['Soufrière', 'Canaries'],
  ['Canaries', 'Anse la Raye'],
  // New connections
  ['Pigeon Island (Attraction)', 'Gros Islet'],
  ['Rodney Bay Marina (Community)', 'Gros Islet'],
  ['Rodney Bay Marina (Community)', 'Castries (Capital)'],
  ['Marigot Bay (Community)', 'Castries (Capital)'],
  ['Marigot Bay (Community)', 'Anse la Raye'],
  ['Diamond Falls & Gardens (Attraction)', 'Soufrière'],
  ['Sulphur Springs Park (Attraction)', 'Soufrière'],
  ['Sugar Beach & Pitons (Attraction)', 'Soufrière'],
  ['Sugar Beach & Pitons (Attraction)', 'Choiseul'],
  ['Tet Paul Nature Trail (Attraction)', 'Soufrière'],
  ['Tet Paul Nature Trail (Attraction)', 'Choiseul'],
];

// District label positions helper
const getLabelOffset = (name: string): { dx: number; dy: number; textAnchor: 'start' | 'middle' | 'end' } => {
  switch (name) {
    case 'Gros Islet': return { dx: 0, dy: -14, textAnchor: 'middle' };
    case 'Castries (Capital)': return { dx: -10, dy: -5, textAnchor: 'end' };
    case 'Babonneau': return { dx: 10, dy: -5, textAnchor: 'start' };
    case 'Anse la Raye': return { dx: -10, dy: 3, textAnchor: 'end' };
    case 'Dennery': return { dx: 10, dy: 3, textAnchor: 'start' };
    case 'Canaries': return { dx: -10, dy: 3, textAnchor: 'end' };
    case 'Soufrière': return { dx: -10, dy: -2, textAnchor: 'end' };
    case 'Micoud': return { dx: 10, dy: 3, textAnchor: 'start' };
    case 'Choiseul': return { dx: -10, dy: 10, textAnchor: 'end' };
    case 'Laborie': return { dx: 0, dy: 15, textAnchor: 'middle' };
    case 'Vieux Fort': return { dx: 0, dy: 15, textAnchor: 'middle' };
    // Custom offsets for new tourist attractions and communities
    case 'Pigeon Island (Attraction)': return { dx: 10, dy: -2, textAnchor: 'start' };
    case 'Rodney Bay Marina (Community)': return { dx: -10, dy: -2, textAnchor: 'end' };
    case 'Marigot Bay (Community)': return { dx: -10, dy: 5, textAnchor: 'end' };
    case 'Diamond Falls & Gardens (Attraction)': return { dx: 10, dy: -5, textAnchor: 'start' };
    case 'Sulphur Springs Park (Attraction)': return { dx: -10, dy: 5, textAnchor: 'end' };
    case 'Sugar Beach & Pitons (Attraction)': return { dx: -10, dy: 10, textAnchor: 'end' };
    case 'Tet Paul Nature Trail (Attraction)': return { dx: 10, dy: 10, textAnchor: 'start' };
    default: return { dx: 8, dy: 3, textAnchor: 'start' };
  }
};

export default function StLuciaMap({
  pickup,
  dropoff,
  currentCoords,
  routePath,
  bookingStatus,
  heightClass = 'h-[360px]',
  drivers,
}: Props) {
  // Coordinate grid mapping helper
  const mapX = (gridX: number) => {
    return gridX;
  };

  const mapY = (gridY: number) => {
    return gridY;
  };

  // Build active route path representation
  const computedRoutePath = routePath || (pickup && dropoff ? findShortestPath(pickup, dropoff) : undefined);
  const activeLines: React.ReactNode[] = [];
  if (computedRoutePath && computedRoutePath.length > 1) {
    for (let i = 0; i < computedRoutePath.length - 1; i++) {
      const fromNode = ST_LUCIA_DISTRICTS.find((d) => d.name === computedRoutePath[i]);
      const toNode = ST_LUCIA_DISTRICTS.find((d) => d.name === computedRoutePath[i + 1]);
      if (fromNode && toNode) {
        const isCompletedSegment = false; // Simple layout highlight
        activeLines.push(
          <line
            key={`active-${i}-${fromNode.name}-${toNode.name}`}
            x1={mapX(fromNode.x)}
            y1={mapY(fromNode.y)}
            x2={mapX(toNode.x)}
            y2={mapY(toNode.y)}
            stroke={bookingStatus === 'InTrip' ? '#10b981' : '#6366f1'} // Emerald for active trip, Indigo for driver en route
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="6,4"
            className="animate-[dash_2s_linear_infinite]"
            style={{
              strokeDashoffset: 10,
            }}
          />
        );
      }
    }
  }

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-md shadow-2xl flex items-center justify-center p-3`}>
      {/* Decorative Tropical Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <svg
        viewBox="0 0 200 340"
        className="h-full w-auto select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Premium Gradient Fill for Island Outline */}
          <linearGradient id="islandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>

          {/* District glow filters */}
          <filter id="glowIndigo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowEmerald" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Glassmorphic Island Silhouette Shape */}
        <path
          d="M 110 20 C 120 30, 135 50, 145 80 C 160 110, 175 140, 170 160 C 165 190, 170 220, 155 260 C 145 290, 135 310, 130 320 C 120 330, 95 320, 80 305 C 70 280, 50 250, 45 220 C 40 190, 50 160, 60 120 C 70 80, 80 50, 110 20 Z"
          fill="url(#islandGradient)"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeOpacity="0.2"
          className="shadow-xl"
        />

        {/* 2. Road Graph Corridors (Static Dotted Lines) */}
        {ROAD_CONNECTIONS.map(([n1, n2], idx) => {
          const d1 = ST_LUCIA_DISTRICTS.find((d) => d.name === n1);
          const d2 = ST_LUCIA_DISTRICTS.find((d) => d.name === n2);
          if (!d1 || !d2) return null;
          return (
            <line
              key={`road-${idx}`}
              x1={mapX(d1.x)}
              y1={mapY(d1.y)}
              x2={mapX(d2.x)}
              y2={mapY(d2.y)}
              stroke="rgba(251, 191, 36, 0.08)"
              strokeWidth="1.2"
              strokeDasharray="3,3"
            />
          );
        })}

        {/* 3. Active Navigation Route Path (Highlighted Lines) */}
        {activeLines}

        {/* 4. District Node Circles & Labels */}
        {ST_LUCIA_DISTRICTS.map((district) => {
          const isPickup = district.name === pickup;
          const isDropoff = district.name === dropoff;
          const x = mapX(district.x);
          const y = mapY(district.y);
          const offset = getLabelOffset(district.name);

          // Render district nodes with custom coloring
          return (
            <g key={district.name} className="group">
              {/* Pulsing ring for key status districts */}
              {isPickup && (
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  className="animate-ping"
                />
              )}
              {isDropoff && (
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  className="animate-ping"
                />
              )}

              {/* Solid Node Circle */}
              <circle
                cx={x}
                cy={y}
                r={isPickup || isDropoff ? '4.5' : '3.5'}
                fill={
                  isPickup
                    ? '#6366f1' // Indigo
                    : isDropoff
                    ? '#10b981' // Emerald
                    : 'rgba(71, 85, 105, 0.7)' // Slate
                }
                stroke={
                  isPickup
                    ? '#ffffff'
                    : isDropoff
                    ? '#ffffff'
                    : 'rgba(255, 255, 255, 0.15)'
                }
                strokeWidth="1"
                className="transition-all duration-300 group-hover:scale-125"
              />

              {/* District Label Text */}
              <text
                x={x + offset.dx}
                y={y + offset.dy}
                fill={
                  isPickup
                    ? '#a5b4fc'
                    : isDropoff
                    ? '#6ee7b7'
                    : 'rgba(148, 163, 184, 0.75)'
                }
                fontSize="6.5"
                fontWeight={isPickup || isDropoff ? 'bold' : 'normal'}
                textAnchor={offset.textAnchor}
                className="pointer-events-none tracking-tight font-sans font-medium"
              >
                {district.name.replace(' (Capital)', '')}
              </text>
            </g>
          );
        })}

        {/* Render multiple fleet driver markers if available */}
        {drivers &&
          drivers.map((d) => {
            // Skip the driver currently doing an active ride, as they're animated separately
            if (currentCoords && d.status === 'OnJob') return null;

            // Only show active online drivers on the map
            if (d.status === 'Offline') return null;

            const distNode = ST_LUCIA_DISTRICTS.find(
              (node) => node.name === (d.currentDistrict || 'Castries (Capital)')
            );
            if (!distNode) return null;

            const x = mapX(distNode.x);
            const y = mapY(distNode.y);

            return (
              <g key={`fleet-drv-${d.id}`}>
                {/* Micro outer pulse */}
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="none"
                  stroke={d.status === 'Available' ? '#10b981' : '#f59e0b'}
                  strokeWidth="1"
                  className="animate-pulse opacity-40 pointer-events-none"
                />
                {/* Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={d.status === 'Available' ? '#10b981' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth="1"
                  style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                />
              </g>
            );
          })}

        {/* 5. Driver Vehicle Marker (Smooth SVG Position Interpolation) */}
        {currentCoords && (
          <g
            style={{
              transform: `translate(${mapX(currentCoords.x)}px, ${mapY(currentCoords.y)}px)`,
              transition: 'transform 1.9s linear',
            }}
          >
            {/* Outer pulsating drop shadow */}
            <circle cx="0" cy="0" r="10" fill="#f59e0b" opacity="0.3" className="animate-ping" />
            
            {/* Golden Car Circle Indicator */}
            <circle
              cx="0"
              cy="0"
              r="5.5"
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
            />

            {/* Glowing inner core */}
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
          </g>
        )}
      </svg>

      {/* Floating Legend Badge */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-white/5 bg-slate-900/90 px-2.5 py-1 text-[9px] font-bold tracking-wide uppercase text-slate-400 select-none shadow-lg">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Dropoff</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Driver</span>
        </div>
      </div>
    </div>
  );
}
