import { useState } from "react";
import { Building2, HelpCircle, Plus, Pointer, Pencil, ChevronDown, ArrowLeftRight, Copy, Star, CalendarDays, BedDouble, Coffee } from "lucide-react";
import { UNIVERSAL_HOTELS, TRIP_STAYS } from "./data/ibHotels";

// ─── The itinerary's Hotel section (IB), the screen before the hotel list ───
//
// One row per city of the trip. A city with no hotel shows "Select Hotel": it opens the hotel
// list for the whole trip (all cities, starting at that one). A city with a hotel shows the IB
// hotel card; its bottom bar gets a new ⇄ "Replace hotel" button that opens the hotel list on
// that city and dates only, to pick an alternative.

const NAVY = "#181e4c";
const year = 2026;

const findRate = (h, rateId) => {
  for (const room of h.rooms) {
    const r = room.rates.find((x) => x.rate_id === rateId);
    if (r) return { room, r };
  }
  return { room: h.rooms[0], r: h.rooms[0].rates[0] };
};
const money = (n) => `₹ ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Itinerary({ stay, onSelect, onReplace }) {
  return (
    <div className="h-full overflow-y-auto bg-white" style={{ fontFamily: "Geist, Inter, system-ui, sans-serif", color: NAVY }}>
      <div className="max-w-[1180px] mx-auto px-6 py-6">
        <div className="text-[12px] text-[#667085] mb-4">Riya &amp; Kabir · Bali honeymoon · Itinerary</div>
        <div className="flex items-center gap-2.5 mb-4">
          <Building2 size={26} color="#1570EF" />
          <h2 className="text-[24px] font-bold">Hotel</h2>
          <HelpCircle size={20} color="#FD014F" />
          <button onClick={() => onSelect(0)} className="ml-auto h-10 px-5 rounded-full border-[1.5px] text-[15px] font-bold hover:bg-[#F5F6FA]" style={{ borderColor: NAVY }}>Setup Hotel Search</button>
        </div>

        <div className="space-y-3">
          {TRIP_STAYS.map((s, i) => {
            const b = stay.bookings?.[i] || {};
            const h = UNIVERSAL_HOTELS.find((x) => x.id === b.hotelId);
            return (
              <div key={s.city} className="flex gap-4 items-stretch">
                <div className="w-[104px] shrink-0 self-start rounded-xl border border-[#E4E7EC] overflow-hidden text-center">
                  <div className="text-[14px] text-[#475467] py-1.5 bg-white">{s.city}</div>
                  <div className="bg-white pb-2">
                    <div className="text-[30px] font-bold leading-none">{s.nights}</div>
                    <div className="text-[14px] text-[#475467] mt-1">Nights</div>
                  </div>
                </div>
                {b.byGuest ? <GuestCard s={s} onReplace={() => onReplace(i)} />
                  : h ? <HotelCard s={s} h={h} rateId={b.rateId} onReplace={() => onReplace(i)} />
                  : <EmptyCard onSelect={() => onSelect(i)} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ onSelect }) {
  return (
    <div className="flex-1 min-h-[112px] rounded-xl border border-dashed border-[#D0D5DD] flex flex-col items-center justify-center gap-2 py-4">
      <button onClick={onSelect} className="h-10 px-6 rounded-full border-[1.5px] text-[16px] font-bold hover:bg-[#F5F6FA]" style={{ borderColor: NAVY }}>Select Hotel</button>
      <div className="text-[14px] text-[#667085]">Results ready — pick a hotel above.</div>
    </div>
  );
}

function HotelCard({ s, h, rateId, onReplace }) {
  const { room, r } = findRate(h, rateId);
  const nightly = r.pricing.selling_price;
  return (
    <Card
      img={h.photos[0]?.url}
      name={h.name}
      stars={h.stars}
      tags={[String(r.supplier || "").toUpperCase(), h.ib.private_sic].filter(Boolean)}
      room={room.name}
      dates={`${s.from} – ${s.to}, ${year}`}
      meal={/breakfast/i.test(r.board_basis.description) ? "Breakfast" : r.board_basis.description}
      policy={r.is_refundable ? "Refundable" : "Non Refundable"}
      total={nightly * s.nights}
      nightly={nightly}
      nights={s.nights}
      onReplace={onReplace}
    />
  );
}

function GuestCard({ s, onReplace }) {
  return (
    <Card
      guest
      name="Hotel booked by guest"
      tags={["User Booked"]}
      room="Room booked by guest"
      dates={`${s.from} – ${s.to}, ${year}`}
      policy="Non Refundable"
      total={0}
      nightly={0}
      nights={s.nights}
      onReplace={onReplace}
    />
  );
}

function Card({ img, guest, name, stars, tags, room, dates, meal, policy, total, nightly, nights, onReplace }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-[#E4E7EC] shadow-[0_1px_3px_rgba(16,24,40,.06)] overflow-hidden">
      <div className="flex">
        <div className="w-[170px] h-[176px] shrink-0 bg-[#F2F4F7] flex items-center justify-center">
          {guest ? <BedDouble size={56} color="#F79009" strokeWidth={1.2} /> : <img src={img} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0 px-6 py-5 flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-8 h-8 rounded-full border border-[#E4E7EC] flex items-center justify-center text-[#667085]"><Copy size={14} /></span>
              <span className="text-[20px] font-bold">{name}</span>
              {stars ? <span className="flex items-center gap-1 text-[16px] text-[#667085]"><Star size={18} fill="#FDB022" color="#FDB022" /> {stars} star</span> : null}
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-4 text-[16px] text-[#475467]">
              <span className="truncate max-w-[220px]">{room}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={16} /> {dates}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><BedDouble size={16} /> 1 room</span>
              {meal && <><span>·</span><span className="flex items-center gap-1.5 font-semibold" style={{ color: NAVY }}><Coffee size={16} /> {meal}</span></>}
            </div>
            <div className="mt-5 text-[15px] text-[#475467]">Cancellation Policy: {policy}</div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-4">
            <div className="flex gap-2">
              {tags.map((t) => <span key={t} className="px-3 py-1 rounded-full bg-[#EEF0F4] text-[14px] font-bold">{t}</span>)}
            </div>
            <div className="text-right mt-2">
              <div className="text-[22px] font-bold">{money(total)}</div>
              <div className="text-[15px] text-[#475467]">{money(nightly)} /night for {nights} nights</div>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom bar: IB's actions, plus the new ⇄ Replace hotel */}
      <div className="border-t border-[#E4E7EC] px-6 py-3 flex items-center justify-end gap-2.5">
        <IconBtn label="Add"><Plus size={16} /></IconBtn>
        <IconBtn label="Choose manually"><Pointer size={16} /></IconBtn>
        <IconBtn label="Replace hotel" onClick={onReplace} highlight><ArrowLeftRight size={16} /></IconBtn>
        <IconBtn label="Edit" filled><Pencil size={15} /></IconBtn>
        <IconBtn label="More"><ChevronDown size={16} /></IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, children, filled, highlight }) {
  const [hover, setHover] = useState(false);
  return (
    <span className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button onClick={onClick} aria-label={label}
        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${filled ? "bg-[#F2F4F7] border-transparent text-[#98A2B3]" : "border-[#D0D5DD] text-[#6B6F99] hover:bg-[#F5F6FA]"} ${highlight ? "hover:border-[#181e4c] hover:text-[#181e4c]" : ""}`}>
        {children}
      </button>
      {hover && highlight && (
        <span className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 whitespace-nowrap rounded-md bg-[#181e4c] text-white text-[12.5px] font-semibold px-2.5 py-1 shadow-lg pointer-events-none">
          {label}
          <span className="absolute left-1/2 -translate-x-1/2 top-full border-[5px] border-transparent border-t-[#181e4c]" />
        </span>
      )}
    </span>
  );
}
