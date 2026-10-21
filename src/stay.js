import { useMemo, useState } from "react";
import { UNIVERSAL_HOTELS, IB_SAVED_STAY } from "./data/ibHotels";

// The stay being edited: Seminyak, 3 nights, 2 adults, Alila already saved.
export const STAY = {
  city: "Seminyak",
  nights: IB_SAVED_STAY[1],
  adults: 2,
  checkIn: "Sat, 20 Jun",
  checkOut: "Tue, 23 Jun",
  dayRange: "Day 1–4",
  baseNightly: IB_SAVED_STAY[3],
  currentId: String(IB_SAVED_STAY[0]),
  currentName: IB_SAVED_STAY[4],
};

const defaultSel = (h) => {
  if (h.id === STAY.currentId) {
    const room = h.rooms.find((r) => r.std_room_id === IB_SAVED_STAY[7].std_room_id) || h.rooms[0];
    return { roomId: room.id, rateId: IB_SAVED_STAY[7].travclan_room_id };
  }
  return { roomId: h.rooms[0].id, rateId: h.rooms[0].rates[0].rate_id };
};

export function useStay(initialId = STAY.currentId) {
  const [openId, setOpenId] = useState(initialId);
  const [sels, setSels] = useState({});
  const h = UNIVERSAL_HOTELS.find((x) => x.id === openId) || UNIVERSAL_HOTELS[0];
  const sel = sels[h.id] || defaultSel(h);
  const ctx = useMemo(
    () => ({
      ...STAY,
      sel,
      setSel: (s) => setSels((p) => ({ ...p, [h.id]: s })),
      others: UNIVERSAL_HOTELS.filter((x) => x.id !== h.id),
      open: setOpenId,
    }),
    [h.id, sel],
  );
  return { h, ctx, openId, setOpenId, hotels: UNIVERSAL_HOTELS };
}
