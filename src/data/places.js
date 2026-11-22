// ─── Places around each city, for the map and the "nearby" lines ───
//
// Four kinds, matching Trailix's nearby groups and transit points:
//   transit  → TransitPoint / nearby "transport" + "metro" (bus stands, harbours, stations)
//   meeting  → group pickup / meeting point (fleet feed)
//   activity → Activity (nearby "attractions")
//   food     → Restaurant / HotelDiningOutlet (nearby "eatAndDrink")
// Names are real; coordinates are approximate until Trailix's database is wired in.

export const PLACES = {
  Seminyak: [
    { kind: "transit", name: "Kura-Kura bus stop, Seminyak Square", lat: -8.6888, lng: 115.1632 },
    { kind: "transit", name: "Petitenget bus stop", lat: -8.6790, lng: 115.1570 },
    { kind: "transit", name: "Ngurah Rai International Airport", lat: -8.7467, lng: 115.1668 },
    { kind: "meeting", name: "Meeting point · Seminyak Square", lat: -8.6885, lng: 115.1630 },
    { kind: "meeting", name: "Meeting point · Petitenget Temple car park", lat: -8.6780, lng: 115.1530 },
    { kind: "activity", name: "Petitenget Temple", lat: -8.6775, lng: 115.1520 },
    { kind: "activity", name: "Seminyak Beach", lat: -8.6910, lng: 115.1575 },
    { kind: "activity", name: "Potato Head Beach Club", lat: -8.6800, lng: 115.1520 },
    { kind: "activity", name: "Double Six Beach", lat: -8.6960, lng: 115.1595 },
    { kind: "activity", name: "Seminyak Village Mall", lat: -8.6865, lng: 115.1640 },
    { kind: "food", name: "Queen's Tandoor (Indian)", lat: -8.6900, lng: 115.1690 },
    { kind: "food", name: "Gopal Vegetarian (pure veg)", lat: -8.6920, lng: 115.1700 },
    { kind: "food", name: "La Lucciola", lat: -8.6840, lng: 115.1540 },
    { kind: "food", name: "Sisterfields", lat: -8.6875, lng: 115.1630 },
  ],
  Ubud: [
    { kind: "transit", name: "Perama bus stop, Jl. Hanoman", lat: -8.5200, lng: 115.2650 },
    { kind: "transit", name: "Kubu Bus Terminal (Ubud)", lat: -8.4975, lng: 115.2740 },
    { kind: "meeting", name: "Meeting point · Ubud Palace", lat: -8.5063, lng: 115.2625 },
    { kind: "meeting", name: "Meeting point · Monkey Forest gate", lat: -8.5160, lng: 115.2590 },
    { kind: "activity", name: "Sacred Monkey Forest Sanctuary", lat: -8.5190, lng: 115.2590 },
    { kind: "activity", name: "Ubud Palace", lat: -8.5063, lng: 115.2625 },
    { kind: "activity", name: "Ubud Art Market", lat: -8.5070, lng: 115.2620 },
    { kind: "activity", name: "Campuhan Ridge Walk", lat: -8.5020, lng: 115.2560 },
    { kind: "activity", name: "Tegallalang Rice Terrace", lat: -8.4320, lng: 115.2790 },
    { kind: "activity", name: "Tirta Empul Temple", lat: -8.4155, lng: 115.3150 },
    { kind: "food", name: "Bali Buda (Indian options, veg)", lat: -8.5050, lng: 115.2640 },
    { kind: "food", name: "Queen's of India Ubud (Indian)", lat: -8.5075, lng: 115.2610 },
    { kind: "food", name: "Locavore", lat: -8.5085, lng: 115.2590 },
    { kind: "food", name: "Sari Organik (pure veg)", lat: -8.4985, lng: 115.2600 },
  ],
  "Nusa Penida": [
    { kind: "transit", name: "Toya Pakeh Harbour", lat: -8.6750, lng: 115.4825 },
    { kind: "transit", name: "Banjar Nyuh Harbour", lat: -8.6831, lng: 115.4577 },
    { kind: "transit", name: "Sampalan Harbour", lat: -8.6760, lng: 115.5460 },
    { kind: "meeting", name: "Meeting point · Toya Pakeh Harbour gate", lat: -8.6755, lng: 115.4830 },
    { kind: "meeting", name: "Meeting point · Sampalan Harbour", lat: -8.6765, lng: 115.5455 },
    { kind: "activity", name: "Kelingking Beach", lat: -8.7515, lng: 115.4730 },
    { kind: "activity", name: "Broken Beach (Pasih Uug)", lat: -8.7330, lng: 115.4500 },
    { kind: "activity", name: "Angel's Billabong", lat: -8.7315, lng: 115.4510 },
    { kind: "activity", name: "Crystal Bay", lat: -8.7140, lng: 115.4590 },
    { kind: "activity", name: "Diamond Beach", lat: -8.7700, lng: 115.6170 },
    { kind: "activity", name: "Atuh Beach", lat: -8.7620, lng: 115.6160 },
    { kind: "food", name: "Penida Colada Beach Bar", lat: -8.6775, lng: 115.4990 },
    { kind: "food", name: "Amok Sunset", lat: -8.6745, lng: 115.4760 },
    { kind: "food", name: "Warung Bu Nyoman (local, veg options)", lat: -8.6780, lng: 115.5440 },
  ],
};

export const KINDS = {
  transit: { label: "Metro / transit", colour: "#1570EF" },
  meeting: { label: "Meeting points", colour: "#FD014F" },
  activity: { label: "Activities", colour: "#7F56D9" },
  food: { label: "Food", colour: "#F79009" },
};

// Straight-line distance in km. Trailix's nearby uses the same before road routing.
export function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Walking under 2 km (about 80 m a minute), otherwise a drive at town speed.
export function travel(km) {
  if (km < 2) return { mode: "walk", min: Math.max(1, Math.round((km * 1000) / 80)) };
  return { mode: "drive", min: Math.max(2, Math.round((km / 25) * 60)) };
}

export const fmtKm = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

// Nearest `n` places of a kind to a point, with distance and travel time.
export function nearest(city, kind, from, n = 1) {
  if (!from) return [];
  return (PLACES[city] || [])
    .filter((p) => p.kind === kind)
    .map((p) => ({ ...p, km: distanceKm(from, p) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n)
    .map((p) => ({ ...p, ...travel(p.km) }));
}
