import { useEffect, useMemo, useRef, useState } from "react";
import { X, HelpCircle, MapPin, ChevronDown, ChevronRight, CalendarDays, Check, Trash2, Settings, Plus, Sparkles, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { TRIP_STAYS, TRIP_START, STAY_CITIES, UNIVERSAL_HOTELS, buildStays, setTripStays, fmtDate, fmtDay } from "./data/ibHotels";

// ─── Hotel Details: the IB "Setup Hotel Search" screen, rebuilt here for this trip ───
//
// One row per stay: nights, check-in (follows the row above), location, rooms, hotel, room type,
// price, early check-in / late checkout, delete and a settings menu (Booked by Guest, Finalize Later).
// Everything is a draft until Submit; Submit rewrites the trip, keeps a chosen hotel only when its
// city and dates are unchanged (otherwise "Needs reselection"), and the itinerary follows.

const NAVY = "#181e4c";
const PINK = "#FD014F";
let seq = 100;

const findRate = (h, rateId) => {
  for (const room of h.rooms) {
    const r = room.rates.find((x) => x.rate_id === rateId);
    if (r) return { room, r };
  }
  return { room: h.rooms[0], r: h.rooms[0].rates[0] };
};

export default function HotelSetup({ stay, onClose, onPickHotel }) {
  const fromTrip = () => TRIP_STAYS.map((s, i) => ({
    id: s.id, city: s.city, nights: s.nights, rooms: s.rooms || 1, early: !!s.early, late: !!s.late, later: !!s.later,
    byGuest: !!stay.bookings?.[i]?.byGuest,
  }));
  const [rows, setRows] = useState(fromTrip);
  const [reorder, setReorder] = useState(false);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");

  // Where each saved stay was, to tell whether its hotel still fits.
  const before = useMemo(() => Object.fromEntries(TRIP_STAYS.map((s, i) => [s.id, { ...s, i, booking: stay.bookings?.[i] || {} }])), []); // eslint-disable-line react-hooks/exhaustive-deps
  const planned = buildStays(rows);
  const keeps = (r, p) => {
    const b = before[r.id];
    return b && b.city === r.city && b.in === p.in && b.out === p.out;
  };
  const totalNights = rows.reduce((n, r) => n + r.nights, 0);
  const end = planned.length ? planned[planned.length - 1].out : TRIP_START;
  const dirty = JSON.stringify(rows) !== JSON.stringify(fromTrip());

  const set = (i, patch) => { setError(""); setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r))); };
  const move = (i, d) => setRows((rs) => { const a = [...rs]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; });

  // Write the draft into the trip; returns false when something is missing.
  const apply = () => {
    if (!rows.length) { setError("Add at least one stay."); return false; }
    const missing = rows.findIndex((r) => !r.city);
    if (missing >= 0) { setError(`Pick a location for row ${missing + 1}.`); return false; }
    const bookings = {};
    rows.forEach((r, j) => {
      const b = before[r.id];
      if (r.byGuest) bookings[j] = { byGuest: true };
      else if (keeps(r, planned[j]) && b.booking.hotelId) bookings[j] = { ...b.booking, byGuest: false };
      else bookings[j] = { byGuest: false };
    });
    setTripStays(rows);
    stay.applyTrip({ bookings });
    return true;
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 flex items-start justify-center p-6 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-[1280px] bg-white rounded-2xl shadow-2xl p-5" style={{ fontFamily: "Geist, Inter, system-ui, sans-serif", color: NAVY }} onClick={(e) => { e.stopPropagation(); setMenu(null); }}>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-[22px] font-bold">Hotel Details</h2>
          <HelpCircle size={17} color={PINK} />
          {dirty && <span className="ml-4 text-[12.5px] font-semibold text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89] rounded-full px-2.5 py-0.5">Changes not saved yet</span>}
          <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full hover:bg-[#F2F4F7] flex items-center justify-center" aria-label="Close"><X size={20} color="#667085" /></button>
        </div>

        {/* Trip details */}
        <div className="flex items-center gap-5 border border-[#E4E7EC] rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(16,24,40,.06)] mb-5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-3 py-1 border" style={{ color: PINK, borderColor: "#FDA29B", background: "#FEF3F2" }}><MapPin size={13} /> Trip details</span>
          <Leg icon={<MapPin size={18} color="#12B76A" />} title="Delhi" sub={`Departs ${fmtDate(TRIP_START)}`} />
          <ChevronRight size={14} color="#98A2B3" />
          <Leg icon={<MapPin size={18} color="#475467" />} title="Bali" sub={`${totalNights} night${totalNights === 1 ? "" : "s"}`} />
          <ChevronRight size={14} color="#98A2B3" />
          <Leg icon={<MapPin size={18} color={PINK} />} title="Delhi" sub={`Returns ${fmtDate(end)}`} />
        </div>

        {/* Header */}
        <div className="grid items-end gap-3 px-1 text-[13.5px] font-semibold text-[#344054] mb-2" style={{ gridTemplateColumns: reorder ? `28px ${COLS}` : COLS }}>
          {reorder && <span />}
          <span>Nights <b style={{ color: PINK }}>*</b></span>
          <span>Check-In</span>
          <span>Location <b style={{ color: PINK }}>*</b></span>
          <span>Rooms <b style={{ color: PINK }}>*</b></span>
          <span>Hotel <b style={{ color: PINK }}>*</b></span>
          <span>Room Type</span>
          <span>Price</span>
          <span className="text-center text-[12px] leading-tight">Early<br />Check-in</span>
          <span className="text-center text-[12px] leading-tight">Late<br />Checkout</span>
          <span /><span />
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {rows.map((r, i) => {
            const p = planned[i];
            const b = before[r.id];
            const booking = b?.booking || {};
            const hotel = !r.byGuest && booking.hotelId ? UNIVERSAL_HOTELS.find((x) => x.id === booking.hotelId) : null;
            const fits = keeps(r, p);
            const rate = hotel ? findRate(hotel, booking.rateId) : null;
            const stale = hotel && !fits;
            return (
              <div key={r.id} className="grid items-start gap-3 px-1" style={{ gridTemplateColumns: reorder ? `28px ${COLS}` : COLS }}>
                {reorder && (
                  <div className="flex flex-col pt-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-30" aria-label="Move up"><ArrowUp size={14} /></button>
                    <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="disabled:opacity-30" aria-label="Move down"><ArrowDown size={14} /></button>
                  </div>
                )}
                <Select value={r.nights} onChange={(v) => set(i, { nights: +v })} options={Array.from({ length: 10 }, (_, k) => [k + 1, k + 1])} />
                <div>
                  <div className={`${FIELD} flex items-center justify-between`}><span>{fmtDate(p.in)}</span><CalendarDays size={15} color="#98A2B3" /></div>
                  <div className="text-[11.5px] text-[#98A2B3] mt-1 pl-3">→ out {fmtDay(p.out)}</div>
                </div>
                <Select value={r.city || ""} onChange={(v) => set(i, { city: v })} options={[["", "Select city"], ...STAY_CITIES.map((c) => [c, c])]} />
                <Select value={r.rooms} onChange={(v) => set(i, { rooms: +v })} options={[1, 2, 3, 4].map((n) => [n, n])} />
                <button onClick={() => { if (!r.city) { setError(`Pick a location for row ${i + 1} first.`); return; } if (apply()) onPickHotel(i); }}
                  className={`${FIELD} text-left truncate hover:border-[#98A2B3] ${r.byGuest || (hotel && !stale) ? "text-[#181e4c] font-medium" : "text-[#98A2B3]"}`}
                  title={r.city ? `Choose a hotel in ${r.city}` : "Pick a location first"}>
                  {r.byGuest ? "Booked by guest" : hotel && !stale ? hotel.name : "Add Hotels"}
                </button>
                <div className={`${FIELD} truncate ${rate && !stale ? "" : "text-[#98A2B3]"}`}>{r.byGuest ? "—" : rate && !stale ? rate.room.name : "Room Type"}</div>
                <div>
                  <div className={`${FIELD} ${rate && !stale ? "font-semibold" : "text-[#98A2B3]"}`} style={stale ? { borderLeft: "3px solid #B54708" } : undefined}>
                    {r.byGuest ? "₹0" : rate && !stale ? `₹${(rate.r.pricing.selling_price * r.nights).toLocaleString("en-IN")}` : "Price"}
                  </div>
                  {stale && <div className="text-[11.5px] font-semibold text-[#B54708] mt-1 pl-3">Needs reselection</div>}
                  {r.later && <div className="text-[11.5px] font-semibold text-[#6941C6] mt-1 pl-3">Finalize later</div>}
                </div>
                <Toggle on={r.early} onClick={() => set(i, { early: !r.early })} label="Early check-in" />
                <Toggle on={r.late} onClick={() => set(i, { late: !r.late })} label="Late checkout" />
                <button onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-[#FEF3F2]" style={{ borderColor: "#FDA29B" }} aria-label="Delete stay"><Trash2 size={16} color={PINK} /></button>
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setMenu(menu === r.id ? null : r.id); }} className="w-10 h-10 rounded-full border border-[#D0D5DD] flex items-center justify-center hover:bg-[#F2F4F7]" aria-label="Stay settings"><Settings size={16} color="#667085" /></button>
                  {menu === r.id && (
                    <div className="absolute right-0 top-full mt-1 z-10 w-[190px] bg-white border border-[#E4E7EC] rounded-lg shadow-xl py-1 text-[13.5px]" onClick={(e) => e.stopPropagation()}>
                      <MenuItem on={r.byGuest} onClick={() => { set(i, { byGuest: !r.byGuest }); setMenu(null); }}>Booked by Guest</MenuItem>
                      <MenuItem on={r.later} onClick={() => { set(i, { later: !r.later }); setMenu(null); }}>Finalize Later</MenuItem>
                      <MenuItem disabled>Manual Add</MenuItem>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && <div className="mt-3 text-[13px] font-semibold text-[#B42318]">{error}</div>}

        {/* Footer */}
        <div className="flex items-center gap-2 mt-6 flex-wrap">
          <FootBtn onClick={() => setRows((rs) => [...rs, { id: `n${seq++}`, city: "", nights: 1, rooms: 1, early: false, late: false, later: false, byGuest: false }])}><Plus size={15} /> Add Nights</FootBtn>
          <FootBtn onClick={() => setRows(STAY_CITIES.map((c, k) => ({ id: rows[k]?.id || `n${seq++}`, city: c, nights: [3, 2, 1][k], rooms: 1, early: false, late: false, later: false, byGuest: false })))} title="Fill with the usual Bali split"><Sparkles size={15} /> Suggest Stay Cities</FootBtn>
          <FootBtn on={reorder} onClick={() => setReorder((x) => !x)}><ArrowUpDown size={15} /> Reorder</FootBtn>
          <div className="ml-auto flex items-center gap-2">
            <FootBtn onClick={() => { setRows(fromTrip()); setError(""); }}><RotateCcw size={14} /> Reset</FootBtn>
            <FootBtn onClick={onClose}>Cancel</FootBtn>
            <button onClick={() => { if (apply()) onClose(); }} className="h-10 px-6 rounded-full text-[14.5px] font-bold text-white" style={{ background: PINK }}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const COLS = "84px 168px 160px 64px minmax(160px,1.4fr) minmax(130px,1fr) 120px 56px 64px 40px 40px";
const FIELD = "h-10 w-full rounded-full border border-[#D0D5DD] bg-white px-4 flex items-center text-[14px]";

function Leg({ icon, title, sub }) {
  return <div className="flex items-center gap-2">{icon}<div className="leading-tight"><div className="text-[15px] font-bold">{title}</div><div className="text-[12.5px] text-[#667085]">{sub}</div></div></div>;
}
function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${FIELD} appearance-none pr-8 cursor-pointer ${value === "" ? "text-[#98A2B3]" : ""}`}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
function Toggle({ on, onClick, label }) {
  return (
    <div className="flex justify-center">
      <button onClick={onClick} aria-label={label} aria-pressed={on} title={label}
        className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
        style={on ? { background: NAVY, borderColor: NAVY } : { borderColor: "#D0D5DD" }}>
        <Check size={15} color={on ? "#fff" : "#98A2B3"} />
      </button>
    </div>
  );
}
function MenuItem({ children, onClick, on, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} title={disabled ? "Not in this prototype" : undefined}
      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F9FAFB] disabled:text-[#98A2B3] disabled:hover:bg-transparent">
      <span className="w-4">{on && <Check size={14} color={PINK} />}</span>{children}
    </button>
  );
}
function FootBtn({ children, onClick, on, title }) {
  return (
    <button onClick={onClick} title={title} className="h-10 px-4 rounded-full border text-[14px] font-semibold flex items-center gap-1.5 hover:bg-[#F5F6FA]"
      style={on ? { borderColor: NAVY, background: "#EEF0F7" } : { borderColor: "#D0D5DD" }}>
      {children}
    </button>
  );
}
