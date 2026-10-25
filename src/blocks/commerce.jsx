import { useState } from "react";
import { Check, ChevronDown, ChevronRight, ArrowLeftRight, FileText, Ruler, BedDouble, Eye, Utensils } from "lucide-react";
import { H2, Ico, Stars, BookingB, inr, DataSource, SellerNote, useView, Btn, AmenityIcons } from "../kit";
import { useDesign } from "../design";

const MEAL = { BB: "Breakfast included", RO: "Room only", HB: "Breakfast + Dinner", FB: "Full board", AI: "All inclusive" };
const deltaOf = (rate, ctx) => (rate.pricing.selling_price - ctx.baseNightly) * ctx.nights;

function DeltaText({ d, nights }) {
  if (d === 0) return <span className="text-sub font-semibold">No extra cost</span>;
  return <span className="font-extrabold" style={{ color: d > 0 ? "#181D27" : "#027A48" }}>{d > 0 ? "+ " : "− "}{inr(d)}<span className="text-[11px] text-sub font-medium"> for {nights} nights</span></span>;
}

function RateFlags({ r }) {
  return (
    <span className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11.5px] font-semibold">
      {r.is_refundable ? <span className="text-[#027A48]">✓ Free cancellation</span> : <span className="text-[#B42318]">Non-refundable</span>}
    </span>
  );
}

function rateSeller(r) {
  const margin = ((r.pricing.selling_price - r.pricing.cost_price) / r.pricing.cost_price) * 100;
  return [["Supplier", r.supplier], ["Cost/night", inr(r.pricing.cost_price)], ["Sell/night", inr(r.pricing.selling_price)], ["Margin", `${margin.toFixed(1)}%`]];
}

function Radio({ on }) {
  return (
    <span className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: on ? "var(--accent)" : "#D5D7DA" }}>
      {on && <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />}
    </span>
  );
}

// ─── Rooms and rates: copy of the live IB "Show rooms" cards ───
// Sizes and colours from couple_trails_itinerary_builder (production)
// SearchedHotelList/HotelListCard.jsx and its tokens: title 18/600 navy,
// 11px uppercase labels, 13px features, 16/600 price, 18/700 total, sm pill.
// The supplier box and "N other provider" follow the live screen.
const IB = {
  navy: "#181e4c", body: "#1e293b", secondary: "#334155", label: "#94a3b8",
  divider: "#e0e2eb", bg: "#f9f9fb", pink: "#fd014f", pinkDivider: "#f8bacc",
  green: "#4eac7e", greenBg: "#f1f9f5", red: "#d70143", redBg: "#fff1f1",
};
const MEAL_SHORT = { BB: "Breakfast", RO: "Room Only", HB: "Half Board", FB: "Full Board", AI: "All Inclusive" };

export function Rooms({ h, ctx, bare, onOpenRoom }) {
  const { nights } = ctx;
  const cards = [];
  const byKey = {};
  h.rooms.forEach((room) =>
    room.rates.forEach((r) => {
      const k = `${room.id}|${r.board_basis.type}|${r.is_refundable}`;
      if (!byKey[k]) cards.push((byKey[k] = { k, room, rates: [] }));
      byKey[k].rates.push(r);
    }),
  );
  cards.forEach((c) => c.rates.sort((a, b) => a.pricing.selling_price - b.pricing.selling_price));
  cards.sort((a, b) => a.rates[0].pricing.selling_price - b.rates[0].pricing.selling_price);
  return (
    <section style={{ fontFamily: "Geist, Inter, system-ui, sans-serif" }}>
      {!bare && <H2>Select your room<DataSource s="both" /></H2>}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {cards.map((c) => <RateCard key={c.k} c={c} h={h} ctx={ctx} nights={nights} onOpenRoom={onOpenRoom} />)}
      </div>
    </section>
  );
}

function RateCard({ c, h, ctx, nights, onOpenRoom }) {
  const booked = ctx.currentId === h.id ? c.rates.find((r) => r.rate_id === ctx.bookedRateId) : null;
  const [pickId, setPickId] = useState((booked || c.rates[0]).rate_id);
  const [open, setOpen] = useState(false);
  const chosen = c.rates.find((r) => r.rate_id === pickId) || c.rates[0];
  const selected = !!booked && booked.rate_id === chosen.rate_id;
  const others = c.rates.length - 1;
  const refundable = c.rates[0].is_refundable;
  const label = { fontSize: 11, lineHeight: "16px", fontWeight: 500, color: IB.label, letterSpacing: "0.05em" };
  const box = (r, radio) => {
    const on = r.rate_id === chosen.rate_id;
    return (
      <button key={r.rate_id} onClick={(e) => { e.stopPropagation(); setPickId(r.rate_id); }}
        className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-left bg-white"
        style={{ border: `1px solid ${on || !radio ? IB.navy : IB.divider}` }}>
        {radio && (
          <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${on ? IB.navy : "#cbd5e1"}` }}>
            {on && <span className="w-2 h-2 rounded-full" style={{ background: IB.navy }} />}
          </span>
        )}
        <span className="flex-1 uppercase" style={{ fontSize: 12, lineHeight: "16px", color: IB.body }}>{r.supplier}</span>
        <span style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: IB.navy }}>₹{r.pricing.selling_price.toLocaleString("en-IN")} /night</span>
      </button>
    );
  };
  return (
    // Click anywhere on the card for room details; Select and the supplier rows do their own thing.
    <div onClick={() => onOpenRoom?.(c.room.id, chosen.rate_id)} title={onOpenRoom ? "Open room details" : undefined}
      className={`group/room flex flex-col rounded-lg p-4 transition-all duration-150 ${onOpenRoom ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:border-[#D0D5DD]" : "hover:shadow-md"}`}
      style={{
        background: selected ? IB.bg : "#fff",
        border: selected ? `2px solid ${IB.pinkDivider}` : `1px solid ${IB.divider}`,
        boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
      }}>
      <h4 className="line-clamp-2 transition-colors text-[#181e4c] group-hover/room:text-[#E31B53]" title={c.room.name} style={{ fontSize: 18, lineHeight: "24px", fontWeight: 600 }}>{c.room.name}</h4>
      {(c.room.size || c.room.beds) && (
        <div className="mt-0.5" style={{ fontSize: 13, lineHeight: "18px", color: IB.secondary }}>{[c.room.size && `${c.room.size} m²`, c.room.beds].filter(Boolean).join(" • ")}</div>
      )}
      <div className="uppercase mt-2" style={label}>Room Features</div>
      <div className="flex items-center justify-between gap-2 mt-1">
        <span style={{ fontSize: 13, lineHeight: "18px", color: IB.body }}>{MEAL_SHORT[c.rates[0].board_basis.type] || c.rates[0].board_basis.description}</span>
        <span className="rounded-full px-2 py-0.5" style={{ fontSize: 12, lineHeight: "16px", fontWeight: 500, color: refundable ? IB.green : IB.red, background: refundable ? IB.greenBg : IB.redBg }}>
          {refundable ? "Refundable" : "Non Refundable"}
        </span>
      </div>
      <div className="uppercase mt-3 mb-2" style={label}>Pricing</div>
      {open ? <div className="space-y-1.5">{c.rates.map((r) => box(r, true))}</div> : box(chosen, false)}
      {others > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="mt-2 flex items-center gap-1 self-start" style={{ fontSize: 12, lineHeight: "16px", fontWeight: 500, color: IB.pink }}>
          {open ? <><ChevronDown size={13} /> Hide</> : <><ChevronRight size={13} /> {others} other provider{others > 1 ? "s" : ""}</>}
        </button>
      )}
      <div className="flex-1 min-h-[16px]" />
      <div className="flex items-center justify-between mt-3">
        <span style={{ fontSize: 12, lineHeight: "16px", color: IB.secondary }}>Total ({nights} nights):</span>
        <span style={{ fontSize: 18, lineHeight: "22px", fontWeight: 700, color: IB.navy }}>₹{(chosen.pricing.selling_price * nights).toLocaleString("en-IN")}</span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-4">
        {onOpenRoom ? (
          <button onClick={(e) => { e.stopPropagation(); onOpenRoom(c.room.id, chosen.rate_id); }} className="rounded-full px-3 inline-flex items-center gap-1 bg-[#F2F4F7] hover:bg-[#E4E7EC] transition-colors"
            style={{ height: 30, fontSize: 13, fontWeight: 600, color: IB.body }}>
            Room details <ChevronRight size={13} />
          </button>
        ) : <span />}
        <button onClick={(e) => { e.stopPropagation(); ctx.book?.(h, chosen.rate_id); }} className="rounded-full px-4"
          style={{ height: 30, fontSize: 13, fontWeight: 600, border: `1px solid ${IB.pink}`, background: selected ? IB.pink : "#fff", color: selected ? "#fff" : IB.pink }}>
          {selected ? "Selected" : "Select"}
        </button>
      </div>
    </div>
  );
}

// ─── Policies, legal, FAQs ───
export function Policies({ h, v }) {
  const [open, setOpen] = useState(null);
  const [all, setAll] = useState(false);
  if (v === "accordion") {
    const items = [
      ...h.policies.map((p) => ({ k: p.key, t: p.title, icon: p.icon, body: p.lines.join(" ") })),
      { k: "legal", t: "Important and legal info", icon: "info", body: h.legal.join(" ") },
      ...h.faqs.map((f, i) => ({ k: `faq${i}`, t: f.q, icon: "info", body: f.a })),
    ];
    return (
      <section>
        <H2>Policies, legal and FAQs<DataSource s="app" /></H2>
        <div className="border border-divider divide-y divide-divider" style={{ borderRadius: "var(--rw)" }}>
          {items.map((i) => (
            <div key={i.k}>
              <button onClick={() => setOpen(open === i.k ? null : i.k)} className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold text-left">
                <Ico name={i.icon} size={15} className="text-sub shrink-0" /> <span className="flex-1">{i.t}</span>
                <ChevronDown size={15} className={`transition ${open === i.k ? "rotate-180" : ""}`} />
              </button>
              {open === i.k && <p className="px-3 pb-3 pl-9 text-[12.5px] text-sub leading-relaxed">{i.body}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (v === "grid")
    return (
      <section>
        <H2>Hotel policies<DataSource s="app" /></H2>
        <div className="grid grid-cols-2 gap-2">
          {h.policies.map((p) => (
            <div key={p.key} className="border border-divider p-2.5" style={{ borderRadius: "var(--rw)" }}>
              <div className="text-[12.5px] font-bold flex items-center gap-1.5"><Ico name={p.icon} size={14} /> {p.title}</div>
              <div className="text-[11.5px] text-sub mt-1 line-clamp-3 leading-snug">{p.lines[0]}</div>
            </div>
          ))}
        </div>
        <FaqList h={h} />
      </section>
    );
  const shown = all ? h.policies : h.policies.filter((p) => ["cancel", "children", "payment"].includes(p.key));
  return (
    <section>
      <H2>Hotel policies<DataSource s="app" /></H2>
      <div className="space-y-3">
        {shown.map((p) => (
          <div key={p.key} className="flex gap-2.5">
            <Ico name={p.icon} size={17} className="text-sub shrink-0 mt-0.5" />
            <div><div className="text-[13.5px] font-bold">{p.title}</div>{p.lines.slice(0, 2).map((l) => <div key={l} className="text-[12.5px] text-sub leading-relaxed">{l}</div>)}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setAll(!all)} className="mt-2 text-[13px] font-bold underline" style={{ color: "var(--accent)" }}>{all ? "Show less" : "See all policies"}</button>
      <div className="mt-5"><H2>Important and legal info</H2>
        <ul className="list-disc pl-4 text-[12.5px] text-sub space-y-1 leading-relaxed">{h.legal.slice(0, 3).map((l) => <li key={l}>{l}</li>)}</ul>
      </div>
      <FaqList h={h} />
    </section>
  );
}

function FaqList({ h }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="mt-5">
      <H2>Frequently asked questions</H2>
      <div className="divide-y divide-divider border-y border-divider">
        {h.faqs.map((f, i) => (
          <div key={f.q}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex justify-between items-center py-2.5 text-[13px] font-semibold text-left gap-2">{f.q}<ChevronDown size={15} className={`shrink-0 transition ${open === i ? "rotate-180" : ""}`} /></button>
            {open === i && <p className="pb-3 text-[12.5px] text-sub leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Similar hotels ───
export function Similar({ h, v, ctx }) {
  const list = ctx.others || [];
  if (!list.length) return null;
  const pill = (d) => (
    <span className="text-[11.5px] font-bold px-2 py-0.5" style={{ borderRadius: "var(--rp)", background: d > 0 ? "#FEF3F2" : "#ECFDF3", color: d > 0 ? "#B42318" : "#027A48" }}>
      {d > 0 ? "More by" : "Lesser by"} {inr(d)}
    </span>
  );
  const dOf = (o) => (o.ib.fromPrice - ctx.baseNightly) * ctx.nights;
  if (v === "list")
    return (
      <section>
        <H2>Similar hotels<DataSource s="both" /></H2>
        <div className="divide-y divide-divider">
          {list.map((o) => (
            <button key={o.id} onClick={() => ctx.open?.(o.id)} className="w-full flex items-center gap-2.5 py-2.5 text-left">
              <img src={o.photos[0].url} className="w-14 h-14 object-cover" style={{ borderRadius: "var(--rw)" }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold truncate">{o.name}</div>
                <div className="text-[12px] text-sub flex items-center gap-1"><Stars n={o.stars} size={11} /> · <BookingB size={13} /> {o.ratings.booking.score}</div>
              </div>
              {pill(dOf(o))}<ChevronRight size={16} className="text-inact" />
            </button>
          ))}
        </div>
      </section>
    );
  return (
    <section>
      <H2>Similar hotels<DataSource s="both" /></H2>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
        {list.map((o) => (
          <button key={o.id} onClick={() => ctx.open?.(o.id)} className="shrink-0 w-[220px] bg-white border border-divider text-left overflow-hidden" style={{ borderRadius: "var(--r)", boxShadow: "var(--shadow)" }}>
            <img src={o.photos[0].url} className="w-full h-[124px] object-cover" />
            <div className="p-2.5">
              <div className="text-[13.5px] font-bold truncate">{o.name}</div>
              <div className="text-[12px] text-sub flex items-center gap-1 mt-0.5"><Stars n={o.stars} size={11} /> <BookingB size={13} /> {o.ratings.booking.score} Rated</div>
              <div className="text-[11.5px] text-sub mt-1 truncate">{o.neighbourhood} · {o.distanceFromCenter} km from the centre</div>
              <div className="mt-2">{pill(dOf(o))}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Section nav ───
export const SECTIONS = [
  ["about", "About"], ["amenities", "Amenities"], ["honest", "Honest bit"],
  ["location", "Location"], ["reviews", "Reviews"], ["policies", "Policies"],
];
export function Nav({ v, ids, scrollTo, active }) {
  const [clicked, setClicked] = useState(ids[0]);
  if (v === "off") return null;
  // `active` comes from the page's scroll position; clicking just scrolls there.
  const act = active || clicked;
  const go = (id) => { setClicked(id); scrollTo(id); };
  return (
    <div data-nav className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-divider -mx-[var(--pad)] px-[var(--pad)]">
      <div className={`flex overflow-x-auto no-scrollbar ${v === "pills" ? "gap-1.5 py-2" : "gap-4"}`}>
        {SECTIONS.filter(([id]) => ids.includes(id)).map(([id, l]) =>
          v === "pills" ? (
            <button key={id} onClick={() => go(id)} className="px-3 py-1 text-[12px] font-semibold whitespace-nowrap" style={{ borderRadius: "var(--rp)", background: act === id ? "#181D27" : "#F5F5F5", color: act === id ? "#fff" : "#535862" }}>{l}</button>
          ) : (
            <button key={id} onClick={() => go(id)} className="py-2.5 text-[12.5px] font-semibold whitespace-nowrap" style={{ color: act === id ? "var(--accent)" : "#535862", borderBottom: act === id ? "2px solid var(--accent)" : "2px solid transparent" }}>{l}</button>
          ),
        )}
      </div>
    </div>
  );
}

// ─── Price / action bar ───
export function Cta({ h, v, ctx }) {
  const { mode } = useView();
  const room = h.rooms.find((r) => r.id === ctx.sel.roomId) || h.rooms[0];
  const rate = room.rates.find((r) => r.rate_id === ctx.sel.rateId) || room.rates[0];
  const d = deltaOf(rate, ctx);
  const oldTotal = ctx.baseNightly * ctx.nights;
  const newTotal = rate.pricing.selling_price * ctx.nights;
  const isCurrent = h.id === ctx.currentId;
  const label = isCurrent ? (mode === "seller" ? "Save room to itinerary" : "Replace room") : mode === "seller" ? "Select for itinerary" : "Replace hotel";
  const wrap = "sticky bottom-0 z-20 bg-white border-t border-divider -mx-[var(--pad)] px-[var(--pad)] py-3";
  if (v === "delta")
    return (
      <div className={`${wrap} flex items-center gap-3`}>
        <div className="flex-1 text-[14px]"><DeltaText d={d} nights={ctx.nights} /><div className="text-[11.5px] text-sub truncate">{room.name} · {MEAL[rate.board_basis.type]}</div></div>
        <Btn onClick={() => ctx.book?.(h, rate.rate_id)}>{label}</Btn>
      </div>
    );
  if (v === "box") {
    const tax = Math.round(newTotal * 0.05);
    return (
      <div className={wrap}>
        <div className="p-3 text-[12.5px]" style={{ background: "#FEDA99", borderRadius: "var(--r)" }}>
          <div className="font-bold text-[14px] mb-1.5">Price Details</div>
          <div className="flex justify-between"><span>{room.name} × {ctx.nights}N</span><span>{inr(newTotal)}</span></div>
          <div className="flex justify-between"><span>GST (5%)</span><span>{inr(tax)}</span></div>
          <div className="flex justify-between font-bold text-[14px] mt-1 pt-1 border-t border-black/10"><span>Total</span><span style={{ color: "#FD3472" }}>{inr(newTotal + tax)}</span></div>
          {mode === "seller" && <div className="flex justify-between text-[11.5px] mt-1 text-[#6B4E16]"><span>Cost {inr(rate.pricing.cost_price * ctx.nights)} · {rate.supplier}</span><span>Profit {inr((rate.pricing.selling_price - rate.pricing.cost_price) * ctx.nights)}</span></div>}
        </div>
        <Btn className="w-full mt-2" onClick={() => ctx.book?.(h, rate.rate_id)}>{label}</Btn>
      </div>
    );
  }
  return (
    <div className={wrap}>
      {!isCurrent && <div className="text-[11.5px] text-sub flex items-center gap-1 mb-1"><ArrowLeftRight size={12} /> Replacing {ctx.currentName}</div>}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {d !== 0 && <div className="text-[12px] text-inact line-through">{inr(oldTotal)}</div>}
          <div className="text-[18px] font-extrabold leading-tight">{inr(newTotal)} <span className="text-[12px] font-semibold" style={{ color: d > 0 ? "#B42318" : "#027A48" }}>{d === 0 ? "" : `${d > 0 ? "+" : "−"}${inr(d)}`}</span></div>
          <div className="text-[11px] text-sub">for {ctx.nights} nights · {ctx.adults} travellers</div>
        </div>
        <Btn onClick={() => ctx.book?.(h, rate.rate_id)}>{label}</Btn>
      </div>
    </div>
  );
}

// ─── All seller data in one card (seller variant "panel") ───
export function SellerPanel({ h, ctx }) {
  const { mode } = useView();
  const { picks } = useDesign();
  if (mode !== "seller" || picks.seller !== "panel") return null;
  const room = h.rooms.find((r) => r.id === ctx.sel.roomId) || h.rooms[0];
  const rate = room.rates.find((r) => r.rate_id === ctx.sel.rateId) || room.rates[0];
  const m = h.ib.master || {};
  const rows = [
    ["TravClan / TBO", `${h.ib.travclan_id} / ${h.ib.tbo_id || "—"}`],
    ["Contracted", h.ib.contracted ? "Yes ©" : "No"],
    ["Recommended", h.ib.recommended === true ? "👍 Yes" : h.ib.recommended === false ? "👎 No" : "—"],
    ["Transfers", h.ib.private_sic],
    ["Selected rate", `${rate.name} (${rate.board_basis.type})`],
    ...rateSeller(rate),
    ["Static score", m.static_score ?? "—"],
    ["Beachfront", m.beachfront ? "Yes" : "No"],
  ];
  return (
    <div className="border border-dashed border-[#98A2B3] bg-[#F9FAFB] p-3" style={{ borderRadius: "var(--r)" }}>
      <div className="text-[12px] font-extrabold text-[#344054] mb-2 flex items-center gap-1.5">SELLER ONLY · not shown to the couple
        {m.pdf_link && <a href={m.pdf_link} className="ml-auto font-semibold text-[#1570EF] flex items-center gap-1"><FileText size={12} /> Brochure PDF</a>}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-2"><span className="text-[#667085]">{k}</span><b className="text-right">{v}</b></div>)}
      </div>
    </div>
  );
}

