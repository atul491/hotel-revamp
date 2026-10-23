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
      {r.is_hold_allowed && <span className="text-[#1570EF]">Hold allowed</span>}
      {r.is_PAN_mandatory && <span className="text-[#4F46E5]">PAN required</span>}
      {r.is_Passport_mandatory && <span className="text-[#4F46E5]">Passport required</span>}
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

// ─── Rooms and rates: IB rate cards ───
// One card per room + meal plan + refund policy. Each supplier quoting that
// exact room is a radio row ("Sup A", "Sup B"), cheapest shown first, the rest
// behind "N other provider". Meal plans are icons, as on the detail page.
export function Rooms({ h, ctx, bare }) {
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
  // Suppliers are named Sup A, Sup B... in order of who is cheapest at this hotel.
  const letters = {};
  cards.flatMap((c) => c.rates).sort((a, b) => a.pricing.selling_price - b.pricing.selling_price)
    .forEach((r) => { if (!(r.supplier in letters)) letters[r.supplier] = String.fromCharCode(65 + Object.keys(letters).length); });

  return (
    <section>
      {!bare && <H2>Select your room<DataSource s="both" /></H2>}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {cards.map((c) => <RateCard key={c.k} c={c} h={h} ctx={ctx} nights={nights} letters={letters} />)}
      </div>
    </section>
  );
}

function RateCard({ c, h, ctx, nights, letters }) {
  const booked = ctx.currentId === h.id ? c.rates.find((r) => r.rate_id === ctx.bookedRateId) : null;
  const [pickId, setPickId] = useState((booked || c.rates[0]).rate_id);
  const [open, setOpen] = useState(false);
  const chosen = c.rates.find((r) => r.rate_id === pickId) || c.rates[0];
  const selected = !!booked;
  const others = c.rates.length - 1;
  const eyebrow = "text-[12px] font-semibold uppercase tracking-[0.5px] text-[#7A86A8]";
  const row = (r, withRadio) => {
    const on = r.rate_id === chosen.rate_id;
    return (
      <button key={r.rate_id} onClick={() => setPickId(r.rate_id)}
        className="w-full flex items-center gap-3 border px-3 py-2.5 text-left"
        style={{ borderRadius: "var(--rw)", borderColor: on || !withRadio ? "#1B2559" : "#E4E7EC", borderWidth: on && withRadio ? 1.5 : 1 }}>
        {withRadio && (
          <span className="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: on ? "#101828" : "#D0D5DD" }}>
            {on && <span className="w-2.5 h-2.5 rounded-full bg-[#101828]" />}
          </span>
        )}
        <span className="flex-1 text-[14.5px]">Sup {letters[r.supplier]}</span>
        <b className="text-[17px]">{inr(r.pricing.selling_price)} <span className="font-semibold">/night</span></b>
      </button>
    );
  };
  return (
    <div className="flex flex-col bg-white border p-5 text-[#1B2559]"
      style={{ borderRadius: "var(--r)", boxShadow: "var(--shadow)", borderColor: selected ? "#1570EF" : "#E9EAEB", borderWidth: selected ? 2 : 1 }}>
      <div className="text-[21px] font-bold leading-snug" style={{ fontFamily: "var(--head-font)" }}>{c.room.name}</div>
      <div className={`${eyebrow} mt-3`}>Room features</div>
      <div className="flex items-center justify-between gap-2 mt-1.5">
        <AmenityIcons items={[c.rates[0].board_basis.description]} size={17} />
        {c.rates[0].is_refundable
          ? <span className="text-[14px] font-semibold px-2.5 py-0.5 text-[#2E9E5B] bg-[#ECFDF3]" style={{ borderRadius: "var(--rp)" }}>Refundable</span>
          : <span className="text-[14px] font-semibold px-2.5 py-0.5 text-[#E31B53] bg-[#FFF1F3]" style={{ borderRadius: "var(--rp)" }}>Non Refundable</span>}
      </div>
      <div className={`${eyebrow} mt-4 mb-2`}>Pricing</div>
      {open ? (
        <div className="space-y-2">{c.rates.map((r) => row(r, true))}</div>
      ) : (
        row(chosen, false)
      )}
      {others > 0 && (
        <button onClick={() => setOpen(!open)} className="mt-2.5 text-[14px] font-semibold flex items-center gap-1 self-start" style={{ color: "#E31B53" }}>
          {open ? <><ChevronDown size={15} /> Hide</> : <><ChevronRight size={15} /> {others} other provider{others > 1 ? "s" : ""}</>}
        </button>
      )}
      <div className="flex-1" />
      <div className="flex items-center justify-between mt-6 text-[14.5px]">
        <span>Total ({nights} nights):</span>
        <b className="text-[24px]">{inr(chosen.pricing.selling_price * nights)}</b>
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={() => ctx.book?.(h, chosen.rate_id)}
          className="px-5 py-2 text-[15px] font-bold border-[1.5px]"
          style={{ borderRadius: "var(--rp)", borderColor: "#E31B53", background: selected && booked.rate_id === chosen.rate_id ? "#E31B53" : "#fff", color: selected && booked.rate_id === chosen.rate_id ? "#fff" : "#E31B53" }}>
          {selected && booked.rate_id === chosen.rate_id ? "Selected" : "Select"}
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
  ["rooms", "Rooms"], ["about", "About"], ["amenities", "Amenities"], ["honest", "Honest bit"],
  ["location", "Location"], ["reviews", "Reviews"], ["policies", "Policies"], ["similar", "Similar"],
];
export function Nav({ v, ids, scrollTo }) {
  const [act, setAct] = useState(ids[0]);
  if (v === "off") return null;
  const go = (id) => { setAct(id); scrollTo(id); };
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-divider -mx-[var(--pad)] px-[var(--pad)]">
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

