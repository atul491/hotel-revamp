import { useState } from "react";
import { Images, MapPin, Utensils, Car, RotateCcw, Ban, LogIn, ChevronRight, ThumbsUp, Star, ArrowLeftRight } from "lucide-react";
import { Stars, BookingB, inr, scoreColor, SellerNote } from "../kit";

const MEAL = { BB: "Breakfast included", RO: "Room only", HB: "Breakfast + Dinner" };

function ScoreChip({ s }) {
  return (
    <span className="inline-flex items-center gap-1 border border-divider px-1.5 py-[1px] text-[11.5px] font-bold" style={{ borderRadius: "var(--rp)", color: scoreColor(s) }}>
      <BookingB size={13} /> {s} Rated
    </span>
  );
}

function Delta({ d }) {
  if (d === 0) return <span className="text-[12px] font-semibold text-sub bg-surface px-2 py-1" style={{ borderRadius: "var(--rp)" }}>No change in price</span>;
  const up = d > 0;
  return (
    <span className="text-[12px] font-bold px-2 py-1" style={{ borderRadius: "var(--rp)", background: up ? "#FEF3F2" : "#ECFDF3", color: up ? "#B42318" : "#027A48" }}>
      {up ? "More by" : "Lesser by"} {inr(d)}
    </span>
  );
}

export function ListCard({ h, v, ctx, active, onOpen }) {
  const r0 = h.rooms[0].rates[0];
  const d = (h.ib.fromPrice - ctx.baseNightly) * ctx.nights;
  const isCurrent = h.id === ctx.currentId;
  const seller = [["Supplier", r0.supplier], ["Cost", inr(r0.pricing.cost_price)], ["Contracted", h.ib.contracted ? "©" : "No"], ["Transfers", h.ib.private_sic]];
  const frame = {
    borderRadius: "var(--r)",
    boxShadow: "var(--shadow)",
    outline: active ? "2px solid var(--accent)" : "none",
    outlineOffset: 1,
  };

  if (v === "ib")
    return (
      <div className="bg-white shadow-lg rounded-md p-4 font-inter" style={{ outline: frame.outline }}>
        <div className="flex justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-1 text-[20px] font-semibold text-[#343C6A]">
              {h.name}{h.ib.contracted && " ©"}
              {h.ib.recommended === true && <ThumbsUp size={16} fill="#00A898" color="#00A898" />}
              {h.ib.recommended === false && <ThumbsUp size={16} fill="#ff0000" color="#ff0000" className="rotate-180" />}
            </h1>
            <h4 className="text-lg font-bold text-ib-blue">₹ {h.ib.fromPrice.toLocaleString()}</h4>
            <div className="text-[14px]"><span className="font-medium text-ib-muted">Booking Rating:</span> {h.ratings.booking.score.toFixed(1)}/10</div>
            <div className="text-[14px]"><span className="font-medium text-ib-muted">Star Rating:</span> {h.stars.toFixed(1)}/5</div>
            <p className="font-medium text-ib-muted text-[14px]">{h.ib.private_sic === "SIC" ? "SIC" : "Private"}</p>
          </div>
          <button onClick={onOpen} className="self-end border py-2 px-4 rounded-md text-ib-teal text-[14px]">{active ? "Hide Rooms ▲" : "Show Rooms ▼"}</button>
        </div>
      </div>
    );

  if (v === "stay")
    return (
      <button onClick={onOpen} className="w-full text-left bg-white border border-divider overflow-hidden" style={frame}>
        <div className="relative">
          <img src={h.photos[0].url} className="w-full h-[150px] object-cover" />
          <span className="absolute top-2 left-2 bg-white text-[11px] font-bold px-2 py-0.5 rounded-full">{ctx.dayRange}</span>
          {isCurrent && <span className="absolute bottom-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFE4E8", color: "#C00840" }}>In itinerary</span>}
        </div>
        <div className="p-3">
          <div className="flex items-center gap-1.5 text-[13px]">
            <Star size={15} fill="#FBBC05" color="#FBBC05" strokeWidth={0} /><span className="font-medium text-[#4EAC7E]">{h.stars} star hotel</span>
            <span className="ml-1 flex items-center gap-1"><BookingB size={15} /> {h.ratings.booking.score} Rated</span>
          </div>
          <div className="text-[16px] font-bold truncate mt-1">{h.name}</div>
          <div className="text-[12.5px] text-sub">{h.rooms[0].name} · {MEAL[r0.board_basis.type]}</div>
          <div className="flex justify-between items-center mt-1.5 text-[12px]">
            <span className="flex items-center gap-1 underline"><MapPin size={12} /> {h.neighbourhood}</span>
            {r0.is_refundable ? <span className="text-[#027A48] font-semibold">Free cancellation</span> : <span className="text-[#E31B53] font-semibold">Non-refundable</span>}
          </div>
          <div className="border-t border-divider mt-2.5 pt-2 flex justify-between items-center text-[12.5px] font-bold" style={{ color: "var(--accent)" }}>
            <span className="flex items-center gap-1"><ArrowLeftRight size={13} /> {isCurrent ? "Change hotel" : "View details"}</span>
            {!isCurrent && <Delta d={d} />}
          </div>
          <SellerNote items={seller} />
        </div>
      </button>
    );

  if (v === "row")
    return (
      <button onClick={onOpen} className="w-full text-left bg-white border border-divider flex gap-3 p-2.5" style={frame}>
        <div className="relative shrink-0">
          <img src={h.photos[0].url} className="w-[132px] h-[118px] object-cover" style={{ borderRadius: "var(--rw)" }} />
          <span className="absolute bottom-1 right-1 text-[10px] text-white bg-black/60 px-1.5 rounded flex items-center gap-0.5"><Images size={10} /> {h.photos.length}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5">
            <div className="text-[14.5px] font-bold leading-snug flex-1">{h.name}</div>
            {isCurrent && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>CURRENT</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-1"><Stars n={h.stars} size={12} color="#E8940B" /><ScoreChip s={h.ratings.booking.score} /><span className="text-[11.5px] text-sub">G {h.ratings.google.score}</span></div>
          <div className="text-[12px] text-sub mt-1 truncate">{h.neighbourhood} · {h.distanceFromCenter} km from centre</div>
          <div className="text-[11.5px] text-sub mt-0.5">{h.rooms.length} room types · {h.rooms.reduce((n, r) => n + r.rates.length, 0)} rates</div>
          <div className="flex justify-between items-end mt-1">
            <span className="text-[12px]"><span className="text-sub">from</span> <b className="text-[14px]">{inr(h.ib.fromPrice)}</b><span className="text-sub">/night</span></span>
            {!isCurrent && <Delta d={d} />}
          </div>
          <SellerNote items={seller} />
        </div>
      </button>
    );

  // reel (app HotelListing card)
  return <ReelCard h={h} d={d} isCurrent={isCurrent} frame={frame} onOpen={onOpen} r0={r0} seller={seller} />;
}

function ReelCard({ h, d, isCurrent, frame, onOpen, r0, seller }) {
  const [i, setI] = useState(0);
  const photos = h.photos.slice(0, 6);
  return (
    <div className="bg-white border border-divider overflow-hidden" style={frame}>
      <div className="relative h-[168px] overflow-hidden">
        <div className="flex h-full transition-transform" style={{ transform: `translateX(-${i * 100}%)` }}>
          {photos.map((p, k) => <img key={k} src={p.url} className="w-full h-full object-cover shrink-0" />)}
        </div>
        <button className="absolute inset-y-0 left-0 w-1/4" onClick={() => setI(Math.max(0, i - 1))} />
        <button className="absolute inset-y-0 right-0 w-1/4" onClick={() => setI(Math.min(photos.length - 1, i + 1))} />
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">{photos.map((_, k) => <span key={k} className="w-1.5 h-1.5 rounded-full bg-white" style={{ opacity: k === i ? 1 : 0.5 }} />)}</div>
        <span className="absolute bottom-2 right-2 text-[11px] text-white bg-black/60 px-2 py-0.5 rounded-full flex items-center gap-1"><Images size={11} /> {h.photos.length} photos</span>
      </div>
      <button onClick={onOpen} className="w-full text-left p-3">
        <div className="text-[14.5px] font-bold">{h.name}</div>
        <div className="flex items-center gap-1.5 mt-1"><Stars n={h.stars} size={12} color="#E8940B" /><ScoreChip s={h.ratings.booking.score} /></div>
        <div className="text-[12.5px] text-sub mt-1.5 flex items-center gap-1"><MapPin size={13} /> {h.neighbourhood} · {h.distanceFromCenter} km from city centre</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[12px] text-sub">
          {r0.board_basis.type !== "RO" && <span className="flex items-center gap-1"><Utensils size={12} /> {MEAL[r0.board_basis.type]}</span>}
          <span className="flex items-center gap-1"><Car size={12} /> {h.ib.private_sic === "SIC" ? "Shared transfer" : "Private transfer"}</span>
          {r0.is_refundable ? <span className="flex items-center gap-1"><RotateCcw size={12} /> Refundable</span> : <span className="flex items-center gap-1 text-inact"><Ban size={12} /> Non-refundable</span>}
          {h.stayBasics.earlyCheckIn?.included && <span className="flex items-center gap-1"><LogIn size={12} /> Early check-in</span>}
        </div>
        <div className="border-t border-divider mt-2.5 pt-2.5 flex justify-between items-center">
          {isCurrent ? <span className="text-[12px] font-bold" style={{ color: "var(--accent)" }}>Your current stay</span> : <Delta d={d} />}
          <ChevronRight size={16} className="text-inact" />
        </div>
        <SellerNote items={seller} />
      </button>
    </div>
  );
}
