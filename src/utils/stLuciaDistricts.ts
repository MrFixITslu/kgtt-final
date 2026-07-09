export interface District {
  name: string;
  x: number; // SVG X coordinate
  y: number; // SVG Y coordinate
  description: string;
}

export const ST_LUCIA_DISTRICTS: District[] = [
  { name: 'Castries (Capital)', x: 75, y: 75, description: 'Capital city, main cruise port & commercial hub.' },
  { name: 'Gros Islet', x: 110, y: 25, description: 'Northern tip, famous for pristine beaches & local culture.' },
  { name: 'Babonneau', x: 110, y: 70, description: 'North-East forest hikes, zip-lining & ecological tours.' },
  { name: 'Dennery', x: 145, y: 145, description: 'East coast fishing village, dramatic cliffs & waterfalls.' },
  { name: 'Anse la Raye', x: 55, y: 125, description: 'West coast village, famous for the traditional Friday fish fry.' },
  { name: 'Canaries', x: 45, y: 165, description: 'Tranquil west coast scenic coastal fishing community.' },
  { name: 'Soufrière', x: 45, y: 220, description: 'Eco-tourism capital, gateway to Pitons & sulfur springs.' },
  { name: 'Choiseul', x: 65, y: 275, description: 'South-West craft-making, pottery & cultural heritage site.' },
  { name: 'Laborie', x: 95, y: 295, description: 'Quiet, historic southern coastal village & beaches.' },
  { name: 'Vieux Fort', x: 125, y: 310, description: 'Southern commercial hub, site of Hewanorra Airport (UVF).' },
  { name: 'Micoud', x: 150, y: 225, description: 'South-East agricultural center & rugged Atlantic coastlines.' },
  // Communities
  { name: 'Rodney Bay Marina (Community)', x: 105, y: 30, description: 'Yachting capital of the north, luxury dining & Reduit Beach.' },
  { name: 'Marigot Bay (Community)', x: 60, y: 105, description: 'Picturesque sheltered yacht harbor, premium dining & resorts.' },
  // Attractions
  { name: 'Pigeon Island (Attraction)', x: 115, y: 10, description: 'National landmark featuring historic British fort ruins & beaches.' },
  { name: 'Diamond Falls & Gardens (Attraction)', x: 55, y: 210, description: 'Lush tropical botanical gardens, mineral baths & colorful waterfall.' },
  { name: 'Sulphur Springs Park (Attraction)', x: 40, y: 235, description: 'World\'s only drive-in volcano, active mud pools & geothermal bath.' },
  { name: 'Sugar Beach & Pitons (Attraction)', x: 45, y: 250, description: 'Breathtaking white sand bay nestled directly between the iconic Pitons.' },
  { name: 'Tet Paul Nature Trail (Attraction)', x: 55, y: 255, description: 'Scenic organic nature hike offering spectacular panoramic Piton lookouts.' },
  // Airports
  { name: 'Hewanorra Intl. Airport - UVF (Airport)', x: 130, y: 320, description: 'Main international airport in the south. Flights from USA, Canada, UK & Europe.' },
  { name: 'George F.L. Charles Airport - SLU (Airport)', x: 80, y: 65, description: 'Regional airport near Castries serving Caribbean inter-island flights.' },
  // Hotels & Resorts — North (Gros Islet area)
  { name: 'Sandals Grande St. Lucian (Hotel)', x: 120, y: 18, description: 'All-inclusive luxury Sandals resort on a private peninsula near Gros Islet.' },
  { name: 'Royalton Saint Lucia (Hotel)', x: 100, y: 15, description: 'Premium all-inclusive Royalton resort on Reduit Beach, Gros Islet.' },
  { name: 'Windjammer Landing Resort (Hotel)', x: 90, y: 40, description: 'Spacious villa-style resort on a hillside cove north of Castries.' },
  { name: 'The Landings Resort & Spa (Hotel)', x: 95, y: 22, description: 'Luxury waterfront resort on the Gros Islet coastline near Rodney Bay.' },
  { name: 'Cap Maison Resort & Spa (Hotel)', x: 125, y: 15, description: 'Intimate boutique cliff-top resort on the island\'s northern cape.' },
  // Hotels & Resorts — Castries & Marigot Bay
  { name: 'Sandals Regency La Toc (Hotel)', x: 65, y: 80, description: 'Elegant Sandals all-inclusive beach resort south of Castries.' },
  { name: 'Zoëtry Marigot Bay (Hotel)', x: 58, y: 108, description: 'Boutique luxury resort nestled in the idyllic Marigot Bay harbor.' },
  // Hotels & Resorts — Soufrière (South)
  { name: 'Jade Mountain Resort (Hotel)', x: 38, y: 230, description: 'Iconic open-air sanctuaries resort with breathtaking Piton & Caribbean views.' },
  { name: 'Anse Chastanet Resort (Hotel)', x: 36, y: 225, description: 'Romantic eco-resort on two private beaches at the base of the Pitons.' },
  { name: 'Ladera Resort (Hotel)', x: 42, y: 240, description: 'Open-walled luxury hilltop resort with panoramic Piton vistas.' },
  { name: 'Fond Doux Eco Resort (Hotel)', x: 50, y: 245, description: 'Historic working cocoa plantation eco-resort near Soufrière.' },
  // Hotels & Resorts — Vieux Fort (South)
  { name: 'Coconut Bay Beach Resort (Hotel)', x: 120, y: 315, description: 'Large all-inclusive resort near Hewanorra Airport & Vieux Fort beach.' },
];

export function calculateStLuciaFare(pickupName: string, dropoffName: string): number {
  const p = ST_LUCIA_DISTRICTS.find((d) => d.name === pickupName);
  const d = ST_LUCIA_DISTRICTS.find((d) => d.name === dropoffName);

  if (!p || !d) return 15.00;
  if (pickupName === dropoffName) return 10.00; // Minimal same-district fare

  const distance = Math.sqrt(Math.pow(p.x - d.x, 2) + Math.pow(p.y - d.y, 2));
  
  // Base $15.00 + $8.00 per unit of distance, scaled by 35 for SVG coords
  const fare = 15.00 + (distance / 35) * 8.00;
  return +fare.toFixed(2);
}
