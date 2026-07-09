// St. Lucia road network connectivity graph
// Connects neighboring districts along the main ring road and cross-connections.
export const ROAD_GRAPH: Record<string, string[]> = {
  'Castries (Capital)': ['Gros Islet', 'Babonneau', 'Anse la Raye', 'Rodney Bay Marina (Community)', 'Marigot Bay (Community)', 'George F.L. Charles Airport - SLU (Airport)', 'Sandals Regency La Toc (Hotel)', 'Windjammer Landing Resort (Hotel)'],
  'Gros Islet': ['Castries (Capital)', 'Babonneau', 'Pigeon Island (Attraction)', 'Rodney Bay Marina (Community)', 'Sandals Grande St. Lucian (Hotel)', 'Royalton Saint Lucia (Hotel)', 'The Landings Resort & Spa (Hotel)', 'Cap Maison Resort & Spa (Hotel)'],
  'Babonneau': ['Castries (Capital)', 'Gros Islet', 'Dennery'],
  'Dennery': ['Babonneau', 'Micoud'],
  'Micoud': ['Dennery', 'Vieux Fort'],
  'Vieux Fort': ['Micoud', 'Laborie', 'Hewanorra Intl. Airport - UVF (Airport)', 'Coconut Bay Beach Resort (Hotel)'],
  'Laborie': ['Vieux Fort', 'Choiseul'],
  'Choiseul': ['Laborie', 'Soufrière', 'Sugar Beach & Pitons (Attraction)', 'Tet Paul Nature Trail (Attraction)'],
  'Soufrière': ['Choiseul', 'Canaries', 'Diamond Falls & Gardens (Attraction)', 'Sulphur Springs Park (Attraction)', 'Sugar Beach & Pitons (Attraction)', 'Tet Paul Nature Trail (Attraction)', 'Jade Mountain Resort (Hotel)', 'Anse Chastanet Resort (Hotel)', 'Ladera Resort (Hotel)', 'Fond Doux Eco Resort (Hotel)'],
  'Canaries': ['Soufrière', 'Anse la Raye'],
  'Anse la Raye': ['Canaries', 'Castries (Capital)', 'Marigot Bay (Community)'],

  // Communities
  'Rodney Bay Marina (Community)': ['Gros Islet', 'Castries (Capital)'],
  'Marigot Bay (Community)': ['Castries (Capital)', 'Anse la Raye', 'Zoëtry Marigot Bay (Hotel)'],

  // Attractions
  'Pigeon Island (Attraction)': ['Gros Islet'],
  'Diamond Falls & Gardens (Attraction)': ['Soufrière'],
  'Sulphur Springs Park (Attraction)': ['Soufrière'],
  'Sugar Beach & Pitons (Attraction)': ['Soufrière', 'Choiseul'],
  'Tet Paul Nature Trail (Attraction)': ['Soufrière', 'Choiseul'],

  // Airports
  'Hewanorra Intl. Airport - UVF (Airport)': ['Vieux Fort', 'Coconut Bay Beach Resort (Hotel)'],
  'George F.L. Charles Airport - SLU (Airport)': ['Castries (Capital)'],

  // Hotels — North (Gros Islet)
  'Sandals Grande St. Lucian (Hotel)': ['Gros Islet', 'Rodney Bay Marina (Community)'],
  'Royalton Saint Lucia (Hotel)': ['Gros Islet', 'Rodney Bay Marina (Community)'],
  'Windjammer Landing Resort (Hotel)': ['Castries (Capital)', 'Gros Islet'],
  'The Landings Resort & Spa (Hotel)': ['Gros Islet', 'Rodney Bay Marina (Community)'],
  'Cap Maison Resort & Spa (Hotel)': ['Gros Islet'],

  // Hotels — Castries & Marigot Bay
  'Sandals Regency La Toc (Hotel)': ['Castries (Capital)'],
  'Zoëtry Marigot Bay (Hotel)': ['Marigot Bay (Community)'],

  // Hotels — Soufrière
  'Jade Mountain Resort (Hotel)': ['Soufrière'],
  'Anse Chastanet Resort (Hotel)': ['Soufrière'],
  'Ladera Resort (Hotel)': ['Soufrière'],
  'Fond Doux Eco Resort (Hotel)': ['Soufrière'],

  // Hotels — Vieux Fort
  'Coconut Bay Beach Resort (Hotel)': ['Vieux Fort', 'Hewanorra Intl. Airport - UVF (Airport)'],
};

/**
 * Finds the shortest path (list of district names) between start and end districts.
 * Uses Breadth-First Search (BFS) for simplicity and correctness on unweighted edges.
 */
export function findShortestPath(start: string, end: string): string[] {
  if (!start || !end) return [];
  if (start === end) return [start];

  const queue: string[][] = [[start]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];

    if (node === end) {
      return path;
    }

    const neighbors = ROAD_GRAPH[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  // Fallback to simple start-end pair if no path found (should not happen for connected graph)
  return [start, end];
}
