import { useMemo, useState } from "react";
import { UNIVERSAL_HOTELS, IB_SAVED_STAY, TRIP_STAYS, TRIP_PRICES } from "./data/ibHotels";

// The stay being edited: Seminyak, 3 nights, 2 adults, Alila already saved.
export const STAY = {
  city: "Seminyak",
  nights: IB_SAVED_STAY[1],
  adults: 2,
  checkIn: "Sat, 20 Jun",
  checkOut: "Tue, 23 Jun",
  dayRange: "Day 1–4",
};

const SAVED = {
  hotelId: String(IB_SAVED_STAY[0]),
  roomId: null,
  rateId: IB_SAVED_STAY[7].travclan_room_id,
};

const findRate = (h, rateId) => {
  for (const room of h.rooms) {
    const r = room.rates.find((x) => x.rate_id === rateId);
    if (r) return { room, r };
  }
  return { room: h.rooms[0], r: h.rooms[0].rates[0] };
};

export const EMPTY_FILTERS = { type: [], refund: [], stars: [], min: 0, max: 0, q: "", sort: "best", byGuest: false };

export function useStay(initialId = SAVED.hotelId) {
  const [openId, setOpenId] = useState(initialId);
  const [sels, setSels] = useState({});
  const [booking, setBooking] = useState(SAVED);
  const [wish, setWish] = useState(["61022417"]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [city, setCity] = useState(0);

  const booked = UNIVERSAL_HOTELS.find((x) => x.id === booking.hotelId);
  const bookedRate = booked ? findRate(booked, booking.rateId) : null;
  const baseNightly = booking.byGuest ? 0 : bookedRate?.r.pricing.selling_price ?? 0;

  const h = UNIVERSAL_HOTELS.find((x) => x.id === openId) || UNIVERSAL_HOTELS[0];
  const defaultSel = (x) => {
    if (x.id === booking.hotelId) {
      const { room } = findRate(x, booking.rateId);
      return { roomId: room.id, rateId: booking.rateId };
    }
    return { roomId: x.rooms[0].id, rateId: x.rooms[0].rates[0].rate_id };
  };
  const selOf = (x) => sels[x.id] || defaultSel(x);

  const book = (x, rateId) => {
    const id = rateId || selOf(x).rateId;
    setBooking({ hotelId: x.id, rateId: id, byGuest: false });
    setFilters((f) => ({ ...f, byGuest: false }));
  };

  // Filtering works on the IB fields the left column offers.
  const list = useMemo(() => {
    const f = filters;
    let out = UNIVERSAL_HOTELS.filter((x) => {
      const r0 = x.rooms[0].rates[0];
      const types = f.type;
      if (types.includes("Private") && x.ib.private_sic !== "Private" && !types.includes("SIC")) return false;
      if (types.includes("SIC") && x.ib.private_sic !== "SIC" && !types.includes("Private")) return false;
      const tiers = types.filter((t) => ["Gold", "Silver", "Bronze"].includes(t));
      if (tiers.length && !tiers.map((t) => t.toLowerCase()).includes(x.ib.tier)) return false;
      if (types.includes("Wishlisted") && !wish.includes(x.id)) return false;
      const anyRef = x.rooms.some((r) => r.rates.some((y) => y.is_refundable));
      const anyNon = x.rooms.some((r) => r.rates.some((y) => !y.is_refundable));
      if (f.refund.length === 1 && f.refund[0] === "Refundable" && !anyRef) return false;
      if (f.refund.length === 1 && f.refund[0] === "Non Refundable" && !anyNon) return false;
      if (f.stars.length && !f.stars.includes(x.stars)) return false;
      if (f.min && x.ib.fromPrice < f.min) return false;
      if (f.max && x.ib.fromPrice > f.max) return false;
      if (f.q && !x.name.toLowerCase().includes(f.q.toLowerCase())) return false;
      return !!r0;
    });
    const by = {
      best: (a, b) => (b.ib.contracted - a.ib.contracted) || (b.ib.master?.static_score || b.ratings.booking.score * 10) - (a.ib.master?.static_score || a.ratings.booking.score * 10),
      low: (a, b) => a.ib.fromPrice - b.ib.fromPrice,
      high: (a, b) => b.ib.fromPrice - a.ib.fromPrice,
      rating: (a, b) => b.ratings.booking.score - a.ratings.booking.score,
    };
    return [...out].sort(by[f.sort] || by.best);
  }, [filters, wish]);

  const prices = UNIVERSAL_HOTELS.map((x) => x.ib.fromPrice);
  const priceRange = [Math.min(...prices), Math.max(...prices)];

  const hotelsTotal =
    baseNightly * STAY.nights + TRIP_STAYS.reduce((n, s) => n + (s.booked ? s.booked.price * s.nights : 0), 0);
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
      currentName: booking.byGuest ? "Hotel booked by guest" : booked?.name,
      sel: selOf(h),
      setSel: (s) => setSels((p) => ({ ...p, [h.id]: s })),
      selOf,
      setSelFor: (x, s) => setSels((p) => ({ ...p, [x.id]: s })),
      book,
      others: UNIVERSAL_HOTELS.filter((x) => x.id !== h.id),
      open: setOpenId,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [h.id, sels, booking, baseNightly],
  );

  return {
    h, ctx, openId, setOpenId, hotels: UNIVERSAL_HOTELS, list,
    booking, setBooking, booked, bookedRate, wish, setWish, filters, setFilters, priceRange,
    city, setCity, trip,
  };
}
