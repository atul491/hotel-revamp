// ─── Places around each city, for the map and the "nearby" lines ───
//
// Four kinds, matching Trailix's nearby groups and transit points:
//   transit  → TransitPoint / nearby "transport" + "metro" (bus stands, harbours, stations)
//   meeting  → group pickup / meeting point (fleet feed)
//   activity → Activity (nearby "attractions")
//   food     → Restaurant / HotelDiningOutlet (nearby "eatAndDrink")
// Names are real; coordinates are approximate until Trailix's database is wired in.

import { ROAD } from "./roadDistances.js";

export const PLACES = {
  Seminyak: [
    { kind: "transit", name: "Kura-Kura bus stop, Seminyak Square", about: "Stop for the Kura-Kura tourist shuttle. Runs between Seminyak, Kuta, Legian and Nusa Dua.", lat: -8.6888, lng: 115.1632 },
    { kind: "transit", name: "Petitenget bus stop", about: "Kura-Kura shuttle stop on Jl. Petitenget, close to the beach clubs.", lat: -8.6790, lng: 115.1570 },
    { kind: "airport", name: "Ngurah Rai International Airport (DPS)", about: "Bali's only international airport. Allow extra time in evening traffic.", lat: -8.7467, lng: 115.1668 },
    { kind: "meeting", name: "Meeting point · Seminyak Square", about: "Group pickup point for tours. Easy to find, next to the shops and cafés.", lat: -8.6885, lng: 115.1630 },
    { kind: "meeting", name: "Meeting point · Petitenget Temple car park", about: "Pickup point by the temple car park, handy for north Seminyak hotels.", lat: -8.6780, lng: 115.1530 },
    { kind: "activity", name: "Petitenget Temple", about: "Seaside Hindu temple. Lovely at sunset, sarong needed to enter.", lat: -8.6775, lng: 115.1520 },
    { kind: "activity", name: "Seminyak Beach", about: "Wide sandy beach known for sunsets, bean bags and beach bars.", lat: -8.6910, lng: 115.1575 },
    { kind: "activity", name: "Potato Head Beach Club", about: "Famous beach club with a pool facing the sea. Best for sunset drinks.", lat: -8.6800, lng: 115.1520 },
    { kind: "activity", name: "Double Six Beach", about: "Lively beach with surf schools, sunset bars and evening food stalls.", lat: -8.6960, lng: 115.1595 },
    { kind: "activity", name: "Seminyak Village Mall", about: "Small air-conditioned mall with boutiques, a food court and a supermarket.", lat: -8.6865, lng: 115.1640 },
    { kind: "food", name: "Queen's Tandoor (Indian)", about: "Popular North Indian restaurant. Tandoori dishes, Jain options on request.", lat: -8.6900, lng: 115.1690 },
    { kind: "food", name: "Gopal Vegetarian (pure veg)", about: "Pure vegetarian Indian food. Thalis and South Indian dishes.", lat: -8.6920, lng: 115.1700 },
    { kind: "food", name: "La Lucciola", about: "Beachfront Italian restaurant famous for its sunset view.", lat: -8.6840, lng: 115.1540 },
    { kind: "food", name: "Sisterfields", about: "Busy all-day café known for brunch and good coffee.", lat: -8.6875, lng: 115.1630 },
  ],
  Ubud: [
    { kind: "airport", name: "Ngurah Rai International Airport (DPS)", about: "Bali's only international airport. Allow extra time in evening traffic.", lat: -8.7467, lng: 115.1668 },
    { kind: "transit", name: "Perama bus stop, Jl. Hanoman", about: "Perama shuttle office. Buses to Kuta, Sanur, Amed and Lovina.", lat: -8.5200, lng: 115.2650 },
    { kind: "transit", name: "Kubu Bus Terminal (Ubud)", about: "Local bus and shuttle terminal at the north side of Ubud town.", lat: -8.4975, lng: 115.2740 },
    { kind: "meeting", name: "Meeting point · Ubud Palace", about: "Main group pickup in central Ubud, opposite the Art Market.", lat: -8.5063, lng: 115.2625 },
    { kind: "meeting", name: "Meeting point · Monkey Forest gate", about: "Pickup at the main gate of the Monkey Forest, south Ubud.", lat: -8.5160, lng: 115.2590 },
    { kind: "activity", name: "Sacred Monkey Forest Sanctuary", about: "Forest temple with hundreds of long-tailed monkeys. Keep bags closed.", lat: -8.5190, lng: 115.2590 },
    { kind: "activity", name: "Ubud Palace", about: "Royal palace in the heart of Ubud. Evening Legong dance shows.", lat: -8.5063, lng: 115.2625 },
    { kind: "activity", name: "Ubud Art Market", about: "Market for sarongs, baskets and souvenirs. Bargaining expected.", lat: -8.5070, lng: 115.2620 },
    { kind: "activity", name: "Campuhan Ridge Walk", about: "Easy 2 km ridge walk through grass and palms. Best at sunrise.", lat: -8.5020, lng: 115.2560 },
    { kind: "activity", name: "Tegallalang Rice Terrace", about: "Bali's best-known rice terraces, with swings and cafés along the valley.", lat: -8.4320, lng: 115.2790 },
    { kind: "activity", name: "Tirta Empul Temple", about: "Water temple with holy springs where visitors take part in a purification ritual.", lat: -8.4155, lng: 115.3150 },
    // From Trailix's approved Bali activity list (scripts/create-and-enrich-activities.ts); positions approximate.
    { kind: "activity", name: "Goa Gajah (Elephant Cave)", about: "9th-century cave temple with a carved entrance and old bathing pools.", lat: -8.5235, lng: 115.2871, trailix: true },
    { kind: "activity", name: "Tjampuhan Spa", about: "Riverside spa with stone-carved grotto pools. Classic Balinese treatments.", lat: -8.5045, lng: 115.2560, trailix: true },
    { kind: "activity", name: "Balinese Massage at Lumera Spa Ubud", about: "Traditional Balinese massage in central Ubud. Good for couples.", lat: -8.5118, lng: 115.2612, trailix: true },
    { kind: "activity", name: "Heaven Swing", about: "Jungle swing over the valley, famous for the 'flying dress' photos.", lat: -8.4560, lng: 115.2780, trailix: true },
    { kind: "activity", name: "Teraz Swing", about: "Swing and photo nests over the Tegallalang rice terraces.", lat: -8.4335, lng: 115.2790, trailix: true },
    { kind: "food", name: "Bali Buda (Indian options, veg)", about: "Healthy café with vegetarian and Indian-style options. Has a small organic shop.", lat: -8.5050, lng: 115.2640 },
    { kind: "food", name: "Queen's of India Ubud (Indian)", about: "North Indian restaurant with veg thalis and tandoori. Jain food on request.", lat: -8.5075, lng: 115.2610 },
    { kind: "food", name: "Locavore", about: "Award-winning fine dining using only Indonesian produce. Book well ahead.", lat: -8.5085, lng: 115.2590 },
    { kind: "food", name: "Sari Organik (pure veg)", about: "Pure veg café in the middle of the rice fields, reached by a short walk.", lat: -8.4985, lng: 115.2600 },
  ],
  "Nusa Penida": [
    // No airport on the island: fast boat to Sanur, then about 30 min by road.
    { kind: "airport", name: "Ngurah Rai International Airport (DPS)", about: "Bali's only international airport. Allow extra time in evening traffic.", lat: -8.7467, lng: 115.1668, fixed: { mode: "boat + drive", min: 90 } },
    { kind: "transit", name: "Toya Pakeh Harbour", about: "Main fast-boat harbour on the west side, for boats from Sanur.", lat: -8.6750, lng: 115.4825 },
    { kind: "transit", name: "Banjar Nyuh Harbour", about: "Fast-boat harbour near Crystal Bay, for some Sanur operators.", lat: -8.6831, lng: 115.4577 },
    { kind: "transit", name: "Sampalan Harbour", about: "Harbour on the north-east coast, closer to Diamond and Atuh beaches.", lat: -8.6760, lng: 115.5460 },
    { kind: "meeting", name: "Meeting point · Toya Pakeh Harbour gate", about: "Pickup at the harbour gate as boats arrive. Drivers hold name boards.", lat: -8.6755, lng: 115.4830 },
    { kind: "meeting", name: "Meeting point · Sampalan Harbour", about: "Pickup point at Sampalan, for east-side tours.", lat: -8.6765, lng: 115.5455 },
    { kind: "activity", name: "Kelingking Beach", about: "Famous T-Rex shaped cliff. The steep path down is for fit walkers only.", lat: -8.7515, lng: 115.4730 },
    { kind: "activity", name: "Broken Beach (Pasih Uug)", about: "Natural rock arch over a sea pool. Short walk from Angel's Billabong.", lat: -8.7330, lng: 115.4500 },
    { kind: "activity", name: "Angel's Billabong", about: "Clear rock pool by the sea. Stay out when waves are high.", lat: -8.7315, lng: 115.4510 },
    { kind: "activity", name: "Crystal Bay", about: "Calm bay for snorkelling and sunset. Manta trips often start nearby.", lat: -8.7140, lng: 115.4590 },
    { kind: "activity", name: "Diamond Beach", about: "White-sand beach below cliffs with carved stairs. Great photo spot.", lat: -8.7700, lng: 115.6170 },
    { kind: "activity", name: "Atuh Beach", about: "Quiet cove beside Diamond Beach with a rock arch and beach huts.", lat: -8.7620, lng: 115.6160 },
    { kind: "food", name: "Penida Colada Beach Bar", about: "Beach bar with sea views, cocktails and simple food.", lat: -8.6775, lng: 115.4990 },
    { kind: "food", name: "Amok Sunset", about: "Hillside restaurant facing the sunset over the Bali strait.", lat: -8.6745, lng: 115.4760 },
    { kind: "food", name: "Warung Bu Nyoman (local, veg options)", about: "Local warung with Indonesian food and vegetarian options.", lat: -8.6780, lng: 115.5440 },
  ],
};

export const KINDS = {
  airport: { label: "Airport", colour: "#344054" },
  transit: { label: "Metro / bus stand", colour: "#1570EF" },
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

// ─── Real road trips (precomputed by scripts/road-distances.mjs) ───
// Walk when the footpath is 2 km or less; otherwise drive. Drive times are a traffic range:
// road km at 25 km/h (light traffic) to 13 km/h (Bali peak), never under the empty-road time;
// trips over 20 km use 32 → 20 km/h (bypass / main roads).
// Example: Alila Seminyak → DPS is 12.8 km by road, 30–60 min (Google: 13 km, 30–60 min).
const round5 = (m) => (m > 20 ? Math.round(m / 5) * 5 : m);
const fmtMin = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`);
// "8 min", "30–60 min", "1 h 25 min – 2 h"
export function span(t) {
  if (!t.max || t.max === t.min) return fmtMin(t.min);
  if (t.max <= 90) return `${t.min}–${t.max} min`;
  return `${fmtMin(t.min)} – ${fmtMin(t.max)}`;
}
export const tripText = (t) => `${span(t)} ${t.mode === "walk" ? "walk" : t.mode === "boat + drive" ? "by car + boat" : "drive"}`;
export function roadTrip(from, p) {
  const r = from && ROAD[`${from.lat},${from.lng}|${p.name}`];
  if (!r || !r.car) return null;
  if (r.foot && r.foot.km <= 2) return { km: r.foot.km, min: Math.max(1, r.foot.min), max: null, mode: "walk", road: true };
  // Cab time = pickup / parking overhead + road km at town speed (light → peak traffic).
  // Checked against Google: Alila → DPS 12.8 km ≈ 30–55 min; Alila → Kura-Kura stop 4.1 km ≈ 15–20 min.
  const far = r.car.km > 20; // long trips are mostly on bigger roads
  const lo = Math.max(r.car.min, Math.round(6 + (r.car.km / (far ? 38 : 30)) * 60)), hi = Math.round(8 + (r.car.km / (far ? 22 : 17)) * 60);
  const boat = r.car.boat || 0;
  return { km: r.car.km, min: round5(lo + boat), max: round5(Math.max(hi, lo + 2) + boat), mode: boat ? "boat + drive" : "drive", via: r.car.via, road: true };
}
// Fallback when a pair isn't precomputed: straight line, rough time.
export function trip(from, p) {
  return roadTrip(from, p) || (() => { const km = distanceKm(from, p); return { km, ...(p.fixed || travel(km)), road: false }; })();
}

// Nearest `n` places of a kind to a point, by road, with distance and travel time.
export function nearest(city, kind, from, n = 1) {
  if (!from) return [];
  return (PLACES[city] || [])
    .filter((p) => p.kind === kind)
    .map((p) => ({ ...p, ...trip(from, p) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n);
}

// ─── "Near a place" filter: a place is stored in the filters as "kind|name" ───
export const placeKey = (p) => `${p.kind}|${p.name}`;
export const placeName = (keyOrPlace) => (typeof keyOrPlace === "string" ? keyOrPlace.split("|").slice(1).join("|") : keyOrPlace.name).replace(/^Meeting point · /, "");
export const findPlace = (city, key) => (key ? (PLACES[city] || []).find((p) => placeKey(p) === key) || null : null);

// ─── How a client would get there, in words: walkable / short ride / need a car ───
export function reach({ mode, min }) {
  if (mode === "walk" && min <= 10) return { label: "Walkable", colour: "#027A48", bg: "#ECFDF3", tip: "10 min walk or less" };
  if ((mode === "walk" && min <= 25) || (mode === "drive" && min <= 15)) return { label: "Short ride", colour: "#B54708", bg: "#FFFAEB", tip: "A short taxi / scooter ride (or a long walk)" };
  return { label: "Need a car", colour: "#B42318", bg: "#FEF3F2", tip: "Plan a car or transfer" };
}
