import { useState } from "react";
import { Images, MapPin, Utensils, Car, RotateCcw, Ban, LogIn, ChevronRight, ThumbsUp, Star, ArrowLeftRight } from "lucide-react";
import { Heart, Image as ImageIco, ChevronDown as Down, Check as Tick } from "lucide-react";
import { Stars, BookingB, inr, scoreColor, SellerNote, AmenityIcons } from "../kit";
import { useDesign } from "../design";
import { Tags, NOTE } from "./screen";

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

export function ListCard({ h, v, ctx, active, onOpen, wished, onWish, expanded, onToggleRooms, onSelect }) {
  const { picks, custom } = useDesign();
  const r0 = h.rooms.flatMap((r) => r.rates).sort((a, b) => a.pricing.selling_price - b.pricing.selling_price)[0];
  const d = (h.ib.fromPrice - ctx.baseNightly) * ctx.nights;
  const isCurrent = h.id === ctx.currentId;
  const seller = [["Supplier", r0.supplier], ["Cost", inr(r0.pricing.cost_price)], ["Contracted", h.ib.contracted ? "©" : "No"], ["Transfers", h.ib.private_sic]];
  const frame = {
    borderRadius: "var(--r)",
    boxShadow: "var(--shadow)",
    outline: active ? "2px solid var(--accent)" : "none",
    outlineOffset: 1,
  };

  if (v === "ibrow")
    return <IBRow {...{ h, ctx, active, onOpen, wished, onWish, expanded, onToggleRooms, onSelect, r0, isCurrent, seller, picks, custom }} />;

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
          <Tags h={h} v="pills" className="absolute top-2 right-2 justify-end" />
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
          <Tags h={h} v={picks.tags === "text" ? "text" : "pills"} className="mt-1" />
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
        <Tags h={h} v="pills" className="absolute top-2 left-2" />
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

// ─── The new IB listing row ───
function IBRow({ h, ctx, active, onOpen, wished, onWish, expanded, onToggleRooms, onSelect, r0: cheapest, isCurrent, picks, custom }) {
  const show = (k) => !custom.hiddenParts.includes(k);
  const tv = picks.tags;
  // The hotel already on the itinerary shows its saved rate, others their cheapest.
  const all = h.rooms.flatMap((r) => r.rates);
  const r0 = (isCurrent && all.find((x) => x.rate_id === ctx.bookedRateId)) || cheapest;
  const room = h.rooms.find((r) => r.rates.includes(r0)) || h.rooms[0];
  const bed = String(room.beds || "").replace(/^\d+\s*/, "").replace(/\s*beds?$/i, "");
  const link = "text-[15px] font-medium flex items-center gap-1.5";
  return (
    // Clicking anywhere on the row opens the hotel, except Select, Show rooms and the heart.
    <div onClick={onOpen} title="Open hotel details" className="bg-white p-4 cursor-pointer transition-shadow hover:shadow-lg" style={{ borderRadius: "var(--r)", boxShadow: "var(--shadow)", outline: active ? "2px solid var(--accent)" : "none", outlineOffset: 1 }}>
      <div className="flex gap-6 flex-wrap">
        {show("photo") && (
          <button onClick={(e) => { e.stopPropagation(); onOpen?.(); }} className="relative shrink-0">
            <img src={h.photos[0].url} className="w-[260px] h-[196px] object-cover" style={{ borderRadius: "var(--rw)" }} />
            {show("tags") && tv === "photo" && <Tags h={h} v="pills" className="absolute top-2 left-2 right-2" />}
          </button>
        )}
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button onClick={(e) => { e.stopPropagation(); onOpen?.(); }} className="text-[24px] font-bold text-left hover:underline leading-tight" style={{ fontFamily: "var(--head-font)" }}>{h.name}</button>
            {show("stars") && <span className="text-[19px] font-semibold flex items-center gap-0.5">{h.stars}<Stars n={1} size={20} color="#FDB022" /></span>}
            {show("wishlist") && (
              <button onClick={(e) => { e.stopPropagation(); onWish?.(); }} className="w-9 h-9 rounded-full border border-divider flex items-center justify-center" title="Wishlist">
                <Heart size={17} fill={wished ? "var(--accent)" : "none"} color={wished ? "var(--accent)" : "#98A2B3"} />
              </button>
            )}
          </div>
          {show("tags") && (tv === "inline" || tv === "text") && <Tags h={h} v={tv === "text" ? "text" : "pills"} className="mt-1.5" />}
          {show("room") && <div className="text-[19px] font-medium mt-3">{room.name}</div>}
          {show("roomFacts") && (room.size || bed) && <div className="text-[16px] text-[#414651] mt-1.5">{[room.size && `${room.size} m²`, bed].filter(Boolean).join(" • ")}</div>}
          {show("amenities") && (
            <div className="mt-2"><AmenityIcons items={[r0.board_basis.description, ...h.ib.inclusions.filter((i) => !/breakfast/i.test(i))]} size={16} max={4} /></div>
          )}
          {show("links") && (
            <div className="flex items-center gap-4 mt-3" style={{ color: "#E31B53" }}>
              <button onClick={(e) => { e.stopPropagation(); onOpen?.(); }} className={link}><ImageIco size={15} /> Show Images</button><span className="text-[#414651]">|</span>
              <button onClick={(e) => { e.stopPropagation(); onOpen?.(); }} className={link}><MapPin size={15} /> Show on Map</button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end text-right ml-auto min-w-[210px]">
          {show("tags") && tv === "pills" && <Tags h={h} v="pills" className="justify-end mb-2.5" />}
          {show("reviews") && (
            <div className="flex items-center gap-2">
              <div className="text-[16px] leading-tight text-[#414651]">{h.ratings.booking.count.toLocaleString("en-IN")}+<br /><b className="text-[18px] font-semibold text-head">Reviews</b></div>
              <span className="w-[52px] h-[52px] text-white text-[19px] font-bold flex items-center justify-center" style={{ background: "#003580", borderRadius: 8 }}>{h.ratings.booking.score.toFixed(1)}</span>
            </div>
          )}
          {show("perNight") && <div className="text-[17px] text-[#414651] mt-2">{inr(r0.pricing.selling_price)}/Night</div>}
          {show("total") && (
            <div className="text-[25px] font-extrabold leading-tight text-[#1B2559]" title={picks.notice === "price" ? NOTE : undefined}>
              {inr(r0.pricing.selling_price * ctx.nights)} ({ctx.nights} Nights){picks.notice === "price" && <span className="text-[11px] align-super text-sub ml-0.5 cursor-help">ⓘ</span>}
            </div>
          )}
          <div className="flex-1" />
          {show("actions") && (
            <div className="flex gap-3 mt-4">
              <button onClick={(e) => { e.stopPropagation(); onSelect?.(); }} className="px-5 py-2 text-[17px] font-bold border-[1.5px] inline-flex items-center gap-1"
                style={{ borderRadius: "var(--rp)", borderColor: "#E31B53", background: isCurrent ? "#E31B53" : "#fff", color: isCurrent ? "#fff" : "#E31B53" }}>
                {isCurrent ? <><Tick size={15} strokeWidth={3} /> Selected</> : "Select"}
              </button>
              <button onClick={(e) => { e.stopPropagation(); onToggleRooms?.(); }} className="px-5 py-2 text-[17px] font-semibold border border-divider inline-flex items-center gap-2 shadow-sm" style={{ borderRadius: "var(--rp)", color: "#98A2B3" }}>
                <Down size={17} className={expanded ? "rotate-180" : ""} /> {expanded ? "Hide rooms" : "Show rooms"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
