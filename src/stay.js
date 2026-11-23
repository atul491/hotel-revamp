import { useMemo, useState } from "react";
import { UNIVERSAL_HOTELS, IB_SAVED_STAY, TRIP_STAYS, TRIP_PRICES } from "./data/ibHotels";
import { findPlace, distanceKm, travel } from "./data/places";

// One stay per city; the active tab decides which one is being edited.
const stayOf = (i) => ({ ...TRIP_STAYS[i], adults: 2 });
const SAVED = Object.fromEntries(TRIP_STAYS.map((s, i) => [i, s.saved ? { ...s.saved, byGuest: false } : { byGuest: false }]));

const findRate = (h, rateId) => {
  for (const room of h.rooms) {
    const r = room.rates.find((x) => x.rate_id === rateId);
    if (r) return { room, r };
  }
  return { room: h.rooms[0], r: h.rooms[0].rates[0] };
};

// nearTransit / nearMeeting: 0 = off, otherwise "within N metres" of the nearest stop / meeting point.
export const EMPTY_FILTERS = { type: [], refund: [], stars: [], min: 0, max: 0, nearTransit: 0, nearMeeting: 0, near: null, nearR: 0, q: "", sort: "best", byGuest: false };

export function useStay(initialId = null) {
  const [openId, setOpenId] = useState(initialId);
  const [sels, setSels] = useState({});
  const [bookings, setBookings] = useState(SAVED);
  const [wish, setWish] = useState(["61022417"]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [city, setCity] = useState(0);
  const STAY = stayOf(city);
  const cityHotels = UNIVERSAL_HOTELS.filter((x) => x.city === STAY.city);

  const booking = bookings[city] || { byGuest: false };
  const setBooking = (b) => setBookings((all) => ({ ...all, [city]: b }));
  const booked = UNIVERSAL_HOTELS.find((x) => x.id === booking.hotelId);
  const bookedRate = booked ? findRate(booked, booking.rateId) : null;
  const baseNightly = booking.byGuest ? 0 : bookedRate?.r.pricing.selling_price ?? 0;

  // The open hotel must belong to the active city; otherwise fall back to its first hotel.
  const h = cityHotels.find((x) => x.id === openId) || cityHotels[0];
  const defaultSel = (x) => {
    if (x.id === booking.hotelId) {
      const { room } = findRate(x, booking.rateId);
      return { roomId: room.id, rateId: booking.rateId };
    }
    return { roomId: x.rooms[0].id, rateId: x.rooms[0].rates[0].rate_id };
  };
  const selOf = (x) => sels[x.id] || defaultSel(x);

  // Select is a toggle. Same hotel (and, for a room card, same rate) again = unselect.
  // Opening a hotel, its rooms or a room panel never selects anything.
  const book = (x, rateId) => {
    const same = booking.hotelId === x.id && (!rateId || booking.rateId === rateId);
    if (same) {
      setBooking({ byGuest: false });
      return;
    }
    const id = rateId || selOf(x).rateId;
    setBooking({ hotelId: x.id, rateId: id, byGuest: false });
    setFilters((f) => ({ ...f, byGuest: false }));
  };

  // Filtering works on the IB fields the left column offers.
  const list = useMemo(() => {
    const f = filters;
    // Near a place: every hotel gets its distance to it; the radius filters, "near" sorts.
    const anchor = findPlace(STAY.city, f.near);
    const withNear = anchor
      ? cityHotels.map((x) => { if (!x.coords) return x; const km = distanceKm(anchor, x.coords); return { ...x, near: { km, ...travel(km), place: anchor } }; })
      : cityHotels;
    let out = withNear.filter((x) => {
      if (anchor && f.nearR && !(x.near && x.near.km * 1000 <= f.nearR)) return false;
      const r0 = x.rooms[0].rates[0];
      const types = f.type;
      if (types.includes("Private") && x.ib.private_sic !== "Private" && !types.includes("SIC")) return false;
      if (types.includes("SIC") && x.ib.private_sic !== "SIC" && !types.includes("Private")) return false;
      const tiers = types.filter((t) => ["Gold", "Silver", "Bronze"].includes(t));
      if (tiers.length && !tiers.map((t) => t.toLowerCase()).includes(x.ib.tier)) return false;
      const anyRef = x.rooms.some((r) => r.rates.some((y) => y.is_refundable));
      const anyNon = x.rooms.some((r) => r.rates.some((y) => !y.is_refundable));
      if (f.refund.length === 1 && f.refund[0] === "Refundable" && !anyRef) return false;
      if (f.refund.length === 1 && f.refund[0] === "Non Refundable" && !anyNon) return false;
      if (f.stars.length && !f.stars.includes(x.stars)) return false;
      if (f.min && x.ib.fromPrice < f.min) return false;
      if (f.max && x.ib.fromPrice > f.max) return false;
      if (f.nearTransit && !(x.ib.metro && x.ib.metro.meters <= f.nearTransit)) return false;
      if (f.nearMeeting && !(x.ib.meetingPoint && x.ib.meetingPoint.meters <= f.nearMeeting)) return false;
      if (f.q && !x.name.toLowerCase().includes(f.q.toLowerCase())) return false;
      return !!r0;
      // eslint-disable-next-line no-unreachable
    });
    const by = {
      best: (a, b) => (b.ib.contracted - a.ib.contracted) || (b.ib.master?.static_score || b.ratings.booking.score * 10) - (a.ib.master?.static_score || a.ratings.booking.score * 10),
      low: (a, b) => a.ib.fromPrice - b.ib.fromPrice,
      high: (a, b) => b.ib.fromPrice - a.ib.fromPrice,
      rating: (a, b) => b.ratings.booking.score - a.ratings.booking.score,
      near: (a, b) => (a.near?.km ?? 1e9) - (b.near?.km ?? 1e9),
    };
    if (f.sort === "near" && !anchor) return [...out].sort(by.best);
    return [...out].sort(by[f.sort] || by.best);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, wish, city]);

  const prices = cityHotels.map((x) => x.ib.fromPrice);
  const priceRange = [Math.min(...prices), Math.max(...prices)];

  // Every city's saved room, for the bookings panel, the stepper ticks and the total.
  const stays = TRIP_STAYS.map((s, i) => {
    const b = bookings[i] || {};
    if (b.byGuest) return { s, done: true, byGuest: true, hotel: "Booked by guest", room: "", price: 0 };
    const hh = UNIVERSAL_HOTELS.find((x) => x.id === b.hotelId);
    if (!hh) return { s, done: false };
    const { room, r } = findRate(hh, b.rateId);
    return { s, done: true, hotel: hh.name, room: room.name, price: r.pricing.selling_price };
  });
  const hotelsTotal = stays.reduce((n, x) => n + (x.done && !x.byGuest ? x.price * x.s.nights : 0), 0);
  const gst = Math.round((hotelsTotal + TRIP_PRICES.activities) * TRIP_PRICES.gstRate);
  const tcs = Math.round((hotelsTotal + TRIP_PRICES.activities) * TRIP_PRICES.tcsRate);
  const trip = {
    hotels: hotelsTotal,
    addOns: TRIP_PRICES.addOns,
    flights: TRIP_PRICES.flights,
    activities: TRIP_PRICES.activities,
    gst,
    tcs,
    total: hotelsTotal + TRIP_PRICES.addOns + TRIP_PRICES.flights + TRIP_PRICES.activities + gst + tcs,
  };

  const ctx = useMemo(
    () => ({
      ...STAY,
      baseNightly,
      currentId: booking.byGuest ? "" : booking.hotelId,
      bookedRateId: booking.rateId,
      currentName: booking.byGuest ? "Hotel booked by guest" : booked?.name,
      sel: selOf(h),
      setSel: (s) => setSels((p) => ({ ...p, [h.id]: s })),
      selOf,
      setSelFor: (x, s) => setSels((p) => ({ ...p, [x.id]: s })),
      book,
      others: cityHotels.filter((x) => x.id !== h.id),
      open: setOpenId,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [h.id, sels, booking, baseNightly, city],
  );

  return {
    h, ctx, openId, setOpenId, hotels: UNIVERSAL_HOTELS, cityHotels, list, stays, bookings,
    booking, setBooking, booked, bookedRate, wish, setWish, filters, setFilters, priceRange,
    city, setCity, trip,
  };
}
