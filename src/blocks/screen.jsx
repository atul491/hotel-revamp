import { useState } from "react";
import {
  Heart, ChevronLeft, ChevronRight, Check, Search, Info, Headphones, Filter, Star, IndianRupee, SlidersHorizontal, ChevronDown, X,
} from "lucide-react";
import { inr, useView } from "../kit";
import { useDesign } from "../design";
import { TRIP_STAYS } from "../data/ibHotels";

// ─── Tier look (30 Sundays Gold / Silver / Bronze) ───
export const TIER = {
  gold: { label: "Gold", grad: "linear-gradient(135deg,#F9E29C,#D4A72C)", fg: "#6B4E00", band: "linear-gradient(90deg,#FFF6DA,#FFFDF5)", line: "#E8C55A" },
  silver: { label: "Silver", grad: "linear-gradient(135deg,#EEF0F3,#A9B0BC)", fg: "#475467", band: "linear-gradient(90deg,#F2F4F7,#FCFCFD)", line: "#C9CED6" },
  bronze: { label: "Bronze", grad: "linear-gradient(135deg,#F8C08F,#C46A2B)", fg: "#7A3E12", band: "linear-gradient(90deg,#FFEBDD,#FFF9F5)", line: "#E9A15F" },
};

// ─── Tags up front ───
export function tagList(h, custom, mode) {
  const refundable = h.rooms.some((r) => r.rates.some((x) => x.is_refundable));
  const all = {
    tier: h.ib.tier && { t: TIER[h.ib.tier].label.toUpperCase(), bg: TIER[h.ib.tier].grad, fg: TIER[h.ib.tier].fg },
    transfer: { t: h.ib.private_sic === "SIC" ? "SIC" : "Private", bg: h.ib.private_sic === "SIC" ? "#E31B53" : "#7F56D9", fg: "#fff" },
    refund: { t: refundable ? "Refundable" : "Non-refundable", bg: refundable ? "#ECFDF3" : "#FEF3F2", fg: refundable ? "#027A48" : "#B42318" },
    pick: h.sundaysPick && { t: "Sundays pick", bg: "linear-gradient(135deg,#FFF0F4,#FEF6E9)", fg: "#C00840" },
    contracted: mode === "seller" && h.ib.contracted && { t: "Contracted ©", bg: "#E6F7F5", fg: "#00857A" },
    recommended: mode === "seller" && h.ib.recommended === true && { t: "👍 Recommended", bg: "#EEF4FF", fg: "#3538CD" },
  };
  return custom.tags.map((k) => all[k] && { k, ...all[k] }).filter(Boolean);
}

export function Tags({ h, v, className = "" }) {
  const { custom } = useDesign();
  const { mode } = useView();
  const list = tagList(h, custom, mode);
  if (!list.length) return null;
  if (v === "text")
    return <div className={`text-[12px] text-sub font-semibold ${className}`}>{list.map((x) => x.t).join(" · ")}</div>;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {list.map((x) => (
        <span key={x.k} className="text-[10.5px] font-extrabold tracking-wide px-2 py-[3px] whitespace-nowrap shadow-sm" style={{ background: x.bg, color: x.fg, borderRadius: "var(--rp)" }}>
          {x.t}
        </span>
      ))}
    </div>
  );
}

// ─── Top bar with the city stepper ───
export function TopBar({ v, city, setCity, booked, support }) {
  const done = (i) => (i === 0 ? !!booked : !!TRIP_STAYS[i].booked);
  const btn = "px-4 py-1.5 text-[13.5px] font-bold border-[1.5px]";
  const left = (
    <div className="flex items-center gap-2">
      <button className={btn} style={{ borderRadius: "var(--rp)", borderColor: "var(--accent)", color: "var(--accent)" }}>Back</button>
      <button className={`${btn} flex items-center gap-1.5`} style={{ borderRadius: "var(--rp)", borderColor: "var(--accent)", color: "var(--accent)" }}><Heart size={14} /> Wishlist</button>
    </div>
  );
  const right = (
    <div className="flex items-center gap-2">
      {support === "link" && <button className="text-[13px] font-semibold text-sub flex items-center gap-1 mr-1"><Headphones size={14} /> Need help?</button>}
      <button className={btn} style={{ borderRadius: "var(--rp)", borderColor: "#D5D7DA", color: "#A4A7AE" }}>Modify</button>
      <button className={btn} style={{ borderRadius: "var(--rp)", borderColor: "var(--accent)", background: "var(--accent)", color: "#fff" }}>Continue</button>
    </div>
  );
  let mid;
  if (v === "pills")
    mid = (
      <div className="flex gap-1.5">
        {TRIP_STAYS.map((s, i) => (
          <button key={s.city} onClick={() => setCity(i)} className="px-3.5 py-1.5 text-[12.5px] border text-left leading-tight"
            style={{ borderRadius: "var(--rp)", background: city === i ? "var(--accent)" : "#fff", color: city === i ? "#fff" : "#181D27", borderColor: city === i ? "var(--accent)" : "#E9EAEB" }}>
            <b>{s.city} {s.nights}N</b> {done(i) && "✓"}<div className="text-[11px] opacity-80">{s.from} – {s.to}</div>
          </button>
        ))}
      </div>
    );
  else if (v === "timeline")
    mid = (
      <div className="flex items-start">
        {TRIP_STAYS.map((s, i) => (
          <div key={s.city} className="flex items-start">
            <button onClick={() => setCity(i)} className="flex flex-col items-center w-[110px]">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border-2"
                style={{ background: done(i) ? "var(--accent)" : "#fff", borderColor: city === i || done(i) ? "var(--accent)" : "#D5D7DA", color: done(i) ? "#fff" : "var(--accent)" }}>
                {done(i) ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className="text-[12.5px] mt-1" style={{ fontWeight: city === i ? 800 : 600 }}>{s.city} · {s.nights}N</span>
              <span className="text-[11px] text-sub">{s.from} – {s.to}</span>
            </button>
            {i < TRIP_STAYS.length - 1 && <span className="w-10 border-t-2 mt-3" style={{ borderColor: done(i) ? "var(--accent)" : "#E9EAEB" }} />}
          </div>
        ))}
      </div>
    );
  else if (v === "compact")
    mid = <CompactCity city={city} setCity={setCity} done={done} />;
  else
    mid = (
      <div className="flex items-center gap-2">
        <button onClick={() => setCity(Math.max(0, city - 1))} className="w-8 h-8 rounded-full border border-divider flex items-center justify-center text-inact"><ChevronLeft size={16} /></button>
        <div className="flex border border-divider overflow-hidden bg-white" style={{ borderRadius: "var(--rw)" }}>
          {TRIP_STAYS.map((s, i) => {
            const act = city === i;
            return (
              <button key={s.city} onClick={() => setCity(i)} className="relative px-6 py-2 text-[13.5px] leading-tight text-center"
                style={{ background: act ? "var(--accent)" : "#fff", color: act ? "#fff" : "#181D27", clipPath: act ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)" : "none" }}>
                <div>{s.city} <b>{s.nights}N</b></div>
                <div className="text-[12.5px]">{s.from} - {s.to}</div>
                {done(i) && !act && <Check size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2" style={{ color: "var(--accent)" }} />}
              </button>
            );
          })}
        </div>
        <button onClick={() => setCity(Math.min(TRIP_STAYS.length - 1, city + 1))} className="w-8 h-8 rounded-full border border-divider flex items-center justify-center text-inact"><ChevronRight size={16} /></button>
      </div>
    );
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-2.5 bg-white border-b border-divider">
      {left}{mid}{right}
    </div>
  );
}

function CompactCity({ city, setCity, done }) {
  const [open, setOpen] = useState(false);
  const s = TRIP_STAYS[city];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 border border-divider px-3 py-1.5 text-[13.5px] bg-white" style={{ borderRadius: "var(--rw)" }}>
        <b>{s.city} · {s.nights}N</b><span className="text-sub text-[12px]">{s.from} – {s.to}</span><span className="text-[11px] text-sub">{TRIP_STAYS.filter((_, i) => done(i)).length}/{TRIP_STAYS.length} done</span><ChevronDown size={15} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 bg-white border border-divider shadow-lg w-full" style={{ borderRadius: "var(--rw)" }}>
          {TRIP_STAYS.map((x, i) => (
            <button key={x.city} onClick={() => { setCity(i); setOpen(false); }} className="w-full text-left px-3 py-2 text-[13px] hover:bg-surface flex justify-between">
              {x.city} · {x.nights}N {done(i) && <Check size={14} style={{ color: "var(--accent)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filters ───
const TYPE_OPTS = ["Private", "SIC", "Gold", "Silver", "Bronze", "Wishlisted"];
const toggle = (arr, x) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);

function Box({ on, onClick, children }) {
  return (
    <label className="flex items-center gap-2.5 text-[13.5px] py-1 cursor-pointer select-none">
      <span onClick={onClick} className="w-4 h-4 border rounded flex items-center justify-center" style={{ borderColor: on ? "var(--accent)" : "#D5D7DA", background: on ? "var(--accent)" : "#fff" }}>
        {on && <Check size={11} color="#fff" strokeWidth={3} />}
      </span>
      <span onClick={onClick}>{children}</span>
    </label>
  );
}

function FilterBody({ f, set, range }) {
  const stars = (n) => <span className="inline-flex ml-1">{Array.from({ length: n }).map((_, i) => <Star key={i} size={15} fill="#FDB022" color="#FDB022" strokeWidth={0} />)}</span>;
  const head = (I, t, extra) => (
    <div className="flex items-center gap-2 text-[14.5px] font-bold mb-1.5"><I size={15} style={{ color: "var(--accent)" }} /> {t} {extra}</div>
  );
  const min = f.min || range[0];
  const max = f.max || range[1];
  return (
    <div className="space-y-4">
      <div>{head(Filter, "Hotel Type")}{TYPE_OPTS.map((t) => <Box key={t} on={f.type.includes(t)} onClick={() => set({ ...f, type: toggle(f.type, t) })}>{t}</Box>)}</div>
      <div className="border-t border-divider pt-3">{head(Filter, "Room Type")}{["Refundable", "Non Refundable"].map((t) => <Box key={t} on={f.refund.includes(t)} onClick={() => set({ ...f, refund: toggle(f.refund, t) })}>{t}</Box>)}</div>
      <div className="border-t border-divider pt-3">{head(Star, "Star Rating")}{[5, 4, 3].map((n) => <Box key={n} on={f.stars.includes(n)} onClick={() => set({ ...f, stars: toggle(f.stars, n) })}>{n} Star {stars(n)}</Box>)}</div>
      <div className="border-t border-divider pt-3">
        {head(IndianRupee, "Price Range", <span className="text-[11.5px] font-normal text-sub">(per night)</span>)}
        <div className="text-center text-[14px] font-semibold my-1">{inr(min)} – {inr(max)}</div>
        <input type="range" min={range[0]} max={range[1]} value={max} onChange={(e) => set({ ...f, max: +e.target.value })} className="w-full" style={{ accentColor: "var(--accent)" }} />
        <div className="flex gap-2 mt-1">
          <input value={min} onChange={(e) => set({ ...f, min: +e.target.value || 0 })} className="w-1/2 border border-divider px-2.5 py-1.5 text-[13px]" style={{ borderRadius: "var(--rp)" }} />
          <input value={max} onChange={(e) => set({ ...f, max: +e.target.value || 0 })} className="w-1/2 border border-divider px-2.5 py-1.5 text-[13px]" style={{ borderRadius: "var(--rp)" }} />
        </div>
      </div>
    </div>
  );
}

export function activeCount(f) {
  return f.type.length + f.refund.length + f.stars.length + (f.min ? 1 : 0) + (f.max ? 1 : 0);
}

export function Filters({ v, f, set, range }) {
  const [open, setOpen] = useState(false);
  const n = activeCount(f);
  if (v === "column")
    return (
      <aside className="bg-white border border-divider p-4 self-start" style={{ borderRadius: "var(--r)" }}>
        <FilterBody f={f} set={set} range={range} />
      </aside>
    );
  if (v === "chips") {
    const quick = [["5 Star", () => set({ ...f, stars: toggle(f.stars, 5) }), f.stars.includes(5)], ["SIC", () => set({ ...f, type: toggle(f.type, "SIC") }), f.type.includes("SIC")],
      ["Private", () => set({ ...f, type: toggle(f.type, "Private") }), f.type.includes("Private")], ["Gold", () => set({ ...f, type: toggle(f.type, "Gold") }), f.type.includes("Gold")],
      ["Refundable", () => set({ ...f, refund: toggle(f.refund, "Refundable") }), f.refund.includes("Refundable")], ["Wishlisted", () => set({ ...f, type: toggle(f.type, "Wishlisted") }), f.type.includes("Wishlisted")]];
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {quick.map(([l, fn, on]) => (
          <button key={l} onClick={fn} className="px-3 py-1.5 text-[12.5px] font-semibold border" style={{ borderRadius: "var(--rp)", borderColor: on ? "var(--accent)" : "#E9EAEB", background: on ? "var(--accent-soft)" : "#fff", color: on ? "var(--accent-ink)" : "#535862" }}>{l}</button>
        ))}
        <MoreFilters f={f} set={set} range={range} n={n} label="More filters" />
      </div>
    );
  }
  return <MoreFilters f={f} set={set} range={range} n={n} label="Filters" big open={open} setOpen={setOpen} />;
}

function MoreFilters({ f, set, range, n, label, big }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={`flex items-center gap-1.5 border font-semibold ${big ? "px-4 py-2 text-[13.5px]" : "px-3 py-1.5 text-[12.5px]"}`} style={{ borderRadius: "var(--rp)", borderColor: "#D5D7DA" }}>
        <SlidersHorizontal size={14} /> {label}{n > 0 && <span className="text-[11px] text-white px-1.5 rounded-full" style={{ background: "var(--accent)" }}>{n}</span>}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-start" onClick={() => setOpen(false)}>
          <div className="bg-white w-[300px] h-full overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center mb-3"><b className="text-[16px]">Filters</b><button onClick={() => setOpen(false)} className="ml-auto"><X size={18} /></button></div>
            <FilterBody f={f} set={set} range={range} />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Toolbar ───
export function Toolbar({ v, count, f, set }) {
  const [q, setQ] = useState(false);
  const search = (cls = "") => (
    <div className={`flex items-center gap-2 border border-divider bg-white px-3 py-2 ${cls}`} style={{ borderRadius: "var(--rw)" }}>
      <Search size={16} style={{ color: "var(--accent)" }} />
      <input value={f.q} onChange={(e) => set({ ...f, q: e.target.value })} placeholder="Search hotels..." className="flex-1 outline-none text-[14px] bg-transparent" />
    </div>
  );
  const sort = (
    <select value={f.sort} onChange={(e) => set({ ...f, sort: e.target.value })} className="border border-divider bg-white px-3 py-2 text-[14px]" style={{ borderRadius: "var(--rw)" }}>
      <option value="best">Sort By Best</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Rating</option>
    </select>
  );
  const guest = (
    <label className="flex items-center gap-2 border border-divider bg-white px-3 py-2 text-[14px] cursor-pointer whitespace-nowrap" style={{ borderRadius: "var(--rw)" }}>
      <input type="checkbox" checked={f.byGuest} onChange={(e) => set({ ...f, byGuest: e.target.checked })} style={{ accentColor: "var(--accent)" }} /> Booked by Guest
    </label>
  );
  const n = <span className="text-[14px] text-sub whitespace-nowrap">{count} hotels</span>;
  if (v === "search") return <div className="space-y-2">{search("py-3")}<div className="flex items-center gap-2">{n}<div className="flex-1" />{sort}{guest}</div></div>;
  if (v === "minimal")
    return (
      <div className="flex items-center gap-2">{n}<div className="flex-1" />
        {q ? search("w-[260px]") : <button onClick={() => setQ(true)} className="w-9 h-9 border border-divider rounded-full flex items-center justify-center bg-white"><Search size={15} /></button>}
        {sort}{guest}
      </div>
    );
  return <div className="flex items-center gap-2 flex-wrap">{n}<div className="flex-1 min-w-[200px] max-w-[480px] ml-auto">{search()}</div>{sort}{guest}</div>;
}

// ─── Indicative-rates note ───
export const NOTE = "Rates are indicative until you open rooms. Exact rates can be lower (another supplier is cheaper) or higher (rooms we don't offer, like twin beds, are excluded).";
export function Notice({ v }) {
  if (v === "off" || v === "price") return null;
  if (v === "callout")
    return <div className="flex gap-2 text-[13px] bg-[#FFFAEB] border border-[#FEDF89] text-[#93370D] px-3 py-2.5" style={{ borderRadius: "var(--rw)" }}><Info size={16} className="shrink-0 mt-0.5" /> {NOTE}</div>;
  return <div className="flex gap-2 text-[12.5px] text-sub items-center"><Info size={14} className="shrink-0" /> {NOTE}</div>;
}

// ─── Tier group header ───
export function TierHeader({ tier, count }) {
  const t = TIER[tier];
  return (
    <div className="flex items-center gap-3 my-3">
      <span className="w-11 h-11 rounded-full flex items-center justify-center text-[8.5px] font-extrabold tracking-tight shadow" style={{ background: t.grad, color: t.fg }}>{t.label.toUpperCase()}</span>
      <div className="flex-1 px-4 py-2.5 text-[16px] font-bold" style={{ background: t.band, borderRadius: "var(--rw)", color: tier === "bronze" ? "#9C4A12" : "#181D27" }}>
        30 Sundays {t.label} Hotels <span className="text-[12.5px] font-semibold text-sub ml-1">{count}</span>
      </div>
    </div>
  );
}

// ─── Price details ───
export function PriceDetails({ v, trip, delta, onOpen }) {
  const rows = [["Hotels", trip.hotels], ["Add Ons", trip.addOns], ["Flights", trip.flights], ["Activities", trip.activities], ["GST", trip.gst], ["TCS", trip.tcs]];
  if (v === "bar")
    return (
      <div className="sticky bottom-0 z-20 bg-white border-t border-divider px-4 py-2.5 flex items-center gap-4 text-[13px] shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        {rows.slice(0, 4).map(([k, x]) => <span key={k} className="text-sub">{k} <b className="text-head">{inr(x)}</b></span>)}
        <span className="ml-auto text-[15px] font-extrabold" style={{ color: "var(--accent)" }}>Total {inr(trip.total)}</span>
        {onOpen}
      </div>
    );
  if (v === "card")
    return (
      <div className="bg-white border border-divider p-4" style={{ borderRadius: "var(--r)", boxShadow: "var(--shadow)" }}>
        <div className="text-[15px] font-bold mb-2">Price details</div>
        {rows.map(([k, x]) => <div key={k} className="flex justify-between text-[13px] py-0.5"><span className="text-sub">{k}</span><span className="font-semibold">{inr(x)}</span></div>)}
        <div className="flex justify-between text-[15px] font-extrabold border-t border-divider mt-2 pt-2"><span>Total</span><span style={{ color: "var(--accent)" }}>{inr(trip.total)}</span></div>
        {delta != null && delta !== 0 && (
          <div className="mt-2 text-[12px] font-semibold px-2 py-1.5" style={{ borderRadius: "var(--rw)", background: delta > 0 ? "#FEF3F2" : "#ECFDF3", color: delta > 0 ? "#B42318" : "#027A48" }}>
            Opened hotel would {delta > 0 ? "add" : "save"} {inr(delta)}
          </div>
        )}
      </div>
    );
  return (
    <div className="p-4 text-[13.5px] bg-[#FEDA99]" style={{ borderRadius: "var(--r)" }}>
      <div className="text-[16px] font-bold text-center mb-2">Price Details</div>
      {rows.map(([k, x]) => <div key={k}><b>{k}</b> : {inr(x)}</div>)}
      <div className="font-bold mt-0.5" style={{ color: "#E31B53" }}>Total : {inr(trip.total)}</div>
    </div>
  );
}

// ─── Hotel bookings per city ───
export function Bookings({ v, booked, bookedRate, byGuest, city, setCity }) {
  if (v === "stepper") return null;
  const items = TRIP_STAYS.map((s, i) => {
    if (i === 0) {
      if (byGuest) return { s, hotel: "Booked by guest", room: "", price: 0, done: true };
      return booked ? { s, hotel: booked.name, room: bookedRate.room.name, price: bookedRate.r.pricing.selling_price, done: true } : { s };
    }
    return s.booked ? { s, hotel: s.booked.hotel, room: s.booked.room, price: s.booked.price, done: true } : { s };
  });
  const n = items.filter((x) => x.done).length;
  if (v === "checklist")
    return (
      <div className="bg-white border border-divider p-3" style={{ borderRadius: "var(--r)" }}>
        <div className="text-[14px] font-bold mb-1.5">Hotel bookings <span className="text-[12px] font-normal text-sub">{n}/{items.length}</span></div>
        {items.map((x, i) => (
          <button key={x.s.city} onClick={() => setCity(i)} className="w-full flex items-center gap-2 py-1.5 text-[12.5px] text-left">
            <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: x.done ? "var(--accent)" : "#E9EAEB" }}>{x.done && <Check size={10} color="#fff" strokeWidth={3} />}</span>
            <b className="w-[78px] shrink-0">{x.s.city}</b><span className={`truncate ${x.done ? "" : "italic text-inact"}`}>{x.done ? x.hotel : "No room selected"}</span>
          </button>
        ))}
      </div>
    );
  return (
    <div className="bg-white border border-divider p-3" style={{ borderRadius: "var(--r)" }}>
      <div className="text-[16px] font-bold mb-2">Hotel Bookings <span className="text-[12px] font-normal text-sub">({n} selected)</span></div>
      <div className="space-y-2">
        {items.map((x, i) => (
          <button key={x.s.city} onClick={() => setCity(i)} className="w-full text-left border p-2.5 relative"
            style={{ borderRadius: "var(--rw)", borderColor: city === i && x.done ? "var(--accent)" : "#E9EAEB", borderWidth: city === i ? 2 : 1 }}>
            <span className="absolute top-2.5 right-2.5 w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: x.done ? "var(--accent)" : "#F2F4F7" }}>
              {x.done ? <Check size={11} color="#fff" strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-[#D0D5DD]" />}
            </span>
            <div className="text-[13px] font-semibold">{x.s.city}</div>
            {x.done ? (
              <>
                <div className="text-[12.5px] mt-0.5 pr-5">{x.hotel}</div>
                {x.room && <div className="text-[12px] text-sub">{x.room}</div>}
                {x.price > 0 && <div className="text-[14.5px] font-bold mt-0.5">{inr(x.price)}</div>}
              </>
            ) : (
              <div className="text-[12.5px] italic text-sub mt-0.5">No room selected</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Support({ v, absolute }) {
  if (v !== "fab") return null;
  return (
    <button className={`${absolute ? "absolute" : "fixed"} bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-[#1D2A5B] text-white flex items-center justify-center shadow-xl`} title="Support">
      <Headphones size={22} />
    </button>
  );
}
