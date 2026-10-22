import { useState } from "react";
import { Check, ChevronDown, ChevronRight, ArrowLeftRight, FileText, Ruler, BedDouble, Eye, Utensils } from "lucide-react";
import { H2, Ico, Stars, BookingB, inr, DataSource, SellerNote, useView, Btn } from "../kit";
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

// ─── Rooms and rates ───
export function Rooms({ h, v, ctx }) {
  const { mode } = useView();
  const { sel, setSel, nights } = ctx;
  const title = <H2 sub={`${h.rooms.length} room types. Any extra cost is for all ${nights} nights.`}>Select your room<DataSource s="both" /></H2>;

  if (v === "grid") {
    // One card per rate, cheapest first, the way IB's live-price screen lays them out.
    const short = { BB: "Breakfast", RO: "Room only", HB: "Breakfast + Dinner", FB: "Full board", AI: "All inclusive" };
    const cards = h.rooms
      .flatMap((room) => room.rates.map((r) => ({ room, r })))
      .sort((a, b) => a.r.pricing.selling_price - b.r.pricing.selling_price);
    const suppliers = [...new Set(cards.map((c) => c.r.supplier))].filter((x) => x !== "Contracted");
    const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.6px] text-[#7A86A8]";
    return (
      <section>{title}
        <div className="flex items-center gap-2.5 text-[13px] text-[#343C6A] mb-3">
          <span className="w-5 h-5 rounded-full border-2 border-[#E9EAEB] animate-spin" style={{ borderTopColor: "var(--accent)" }} />
          {mode === "seller" ? `Checking ${suppliers.map((x) => x.toUpperCase()).join(", ") || "suppliers"}...` : "Checking live prices..."} · prices may still change
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {cards.map(({ room, r }) => {
            const on = sel.rateId === r.rate_id;
            return (
              <div key={r.rate_id} className="flex flex-col border p-4 text-[#1B2559]"
                style={{ borderRadius: "var(--r)", boxShadow: "var(--shadow)", borderColor: on ? "#F5A3B7" : "#E9EAEB", borderWidth: on ? 2 : 1, background: on ? "#F9FAFB" : "#fff" }}>
                <div className="text-[17px] font-bold leading-snug" style={{ fontFamily: "var(--head-font)" }}>{room.name}</div>
                <div className={`${eyebrow} mt-2.5`}>Room features</div>
                <div className="flex items-center justify-between gap-2 mt-1 text-[13.5px]">
                  <span>{short[r.board_basis.type] || r.board_basis.description}</span>
                  {r.is_refundable
                    ? <span className="text-[12.5px] font-semibold px-2 py-0.5 text-[#2E9E5B] bg-[#ECFDF3]" style={{ borderRadius: "var(--rp)" }}>Refundable</span>
                    : <span className="text-[12.5px] font-semibold px-2 py-0.5 text-[#E31B53] bg-[#FFF1F3]" style={{ borderRadius: "var(--rp)" }}>Non Refundable</span>}
                </div>
                <div className={`${eyebrow} mt-3`}>Pricing</div>
                <div className="mt-1.5 border border-[#1B2559] px-3 py-2 flex items-center justify-between text-[13px]" style={{ borderRadius: "var(--rw)" }}>
                  <span>{mode === "seller" ? r.supplier.toUpperCase() : "Per night"}</span>
                  <b className="text-[15px]">{inr(r.pricing.selling_price)} <span className="font-semibold">/night</span></b>
                </div>
                <div className="flex items-center justify-between mt-3 text-[13px]">
                  <span>Total ({nights} nights):</span>
                  <b className="text-[19px]">{inr(r.pricing.selling_price * nights)}</b>
                </div>
                <SellerNote items={rateSeller(r)} />
                <div className="flex-1" />
                <div className="flex justify-end mt-3">
                  <button onClick={() => setSel({ roomId: room.id, rateId: r.rate_id })}
                    className="px-4 py-1.5 text-[13.5px] font-bold border-[1.5px] inline-flex items-center gap-1"
                    style={{ borderRadius: "var(--rp)", borderColor: "var(--accent)", background: on ? "var(--accent)" : "#fff", color: on ? "#fff" : "var(--accent)" }}>
                    {on ? <><Check size={13} strokeWidth={3} /> Selected</> : "Select"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (v === "ib")
    return (
      <section>{title}
        <div className="space-y-3 font-inter">
          {h.rooms.map((room) => (
            <div key={room.id} className="flex border border-gray-200 rounded-md p-3 gap-3">
              <div className="w-1/3 font-semibold text-[14px]" style={{ color: h.ib?.contracted ? "#00A898" : "#FDA201" }}>{room.name}{h.ib?.contracted && " ©"}</div>
              <div className="w-2/3 space-y-1.5">
                <div className="text-[12.5px] text-ib-muted">Lowest Price: <b className="text-ib-blue">{inr(room.rates[0].pricing.selling_price)}</b></div>
                {room.rates.map((r) => (
                  <button key={r.rate_id} onClick={() => setSel({ roomId: room.id, rateId: r.rate_id })}
                    className="w-full flex items-center justify-between gap-2 border rounded-md p-2 text-[12.5px] text-ib-muted text-left"
                    style={{ borderColor: sel.rateId === r.rate_id ? "var(--accent)" : "#E5E7EB", borderWidth: sel.rateId === r.rate_id ? 2 : 1 }}>
                    <span><b>{r.name}</b> – {r.board_basis.description} ({r.board_basis.type})<br /><RateFlags r={r} /></span>
                    <span className="flex items-center gap-2 font-semibold text-ib-blue">{inr(r.pricing.selling_price)}<Radio on={sel.rateId === r.rate_id} /></span>
                  </button>
                ))}
                {mode === "seller" && room.rates.map((r) => <SellerNote key={r.rate_id} items={rateSeller(r)} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
    );

  if (v === "table") {
    const rows = [
      ["Photo", (r) => <img src={r.images[0]} className="w-full h-[70px] object-cover" style={{ borderRadius: "var(--rw)" }} />],
      ["Size", (r) => `${r.size} m²`],
      ["Beds", (r) => r.beds],
      ["View", (r) => r.view],
      ["Meals", (r) => MEAL[r.rates[0].board_basis.type] || r.mealPlan],
      ["Cancellation", (r) => (r.rates[0].is_refundable ? <span className="text-[#027A48] font-semibold">Free</span> : <span className="text-[#B42318] font-semibold">Non-refundable</span>)],
      ["Price", (r) => <DeltaText d={deltaOf(r.rates[0], ctx)} nights={nights} />],
    ];
    return (
      <section>{title}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-[12px] border-collapse min-w-[420px]">
            <thead>
              <tr><th className="w-[84px]" />{h.rooms.map((r) => <th key={r.id} className="text-left font-bold text-[12.5px] p-1.5 align-bottom">{r.name}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(([l, f]) => (
                <tr key={l} className="border-t border-divider">
                  <td className="text-sub p-1.5 font-semibold">{l}</td>
                  {h.rooms.map((r) => <td key={r.id} className="p-1.5 align-top">{f(r)}</td>)}
                </tr>
              ))}
              <tr>
                <td />
                {h.rooms.map((r) => {
                  const on = sel.roomId === r.id;
                  return <td key={r.id} className="p-1.5"><Pick on={on} onClick={() => setSel({ roomId: r.id, rateId: r.rates[0].rate_id })} /></td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
        {mode === "seller" && h.rooms.map((r) => <SellerNote key={r.id} items={[["Room", r.name], ...rateSeller(r.rates[0])]} />)}
      </section>
    );
  }

  return (
    <section>{title}
      <div className="space-y-3">
        {h.rooms.map((room) => {
          const on = sel.roomId === room.id;
          const r0 = room.rates.find((r) => r.rate_id === sel.rateId) || room.rates[0];
          return (
            <div key={room.id} className="bg-white border p-3" style={{ borderRadius: "var(--r)", borderColor: on ? "var(--accent)" : "#E9EAEB", borderWidth: on ? 1.5 : 1 }}>
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <img src={room.images[0]} className="w-[108px] h-[96px] object-cover" style={{ borderRadius: "var(--rw)" }} />
                  <span className="absolute bottom-1 left-1 text-[10px] text-white bg-black/60 px-1.5 rounded">{room.images.length} photos</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold leading-snug">{room.name}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[[Ruler, `${room.size} m²`], [BedDouble, room.beds], [Eye, room.view]].map(([I, t]) => (
                      <span key={t} className="inline-flex items-center gap-1 text-[11px] bg-surface px-1.5 py-0.5 rounded text-sub"><I size={11} /> {t}</span>
                    ))}
                  </div>
                  {v === "app" && (
                    <div className="mt-1.5 text-[12px] space-y-0.5">
                      <div className="font-semibold text-[#027A48]">✓ {MEAL[r0.board_basis.type] || room.mealPlan}</div>
                      {r0.is_refundable ? <div className="font-semibold text-[#027A48]">✓ Free cancellation</div> : <div className="text-inact">Non-refundable</div>}
                    </div>
                  )}
                </div>
              </div>
              {v === "app" ? (
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-divider text-[13px]">
                  <DeltaText d={deltaOf(r0, ctx)} nights={nights} />
                  <Pick on={on} onClick={() => setSel({ roomId: room.id, rateId: r0.rate_id })} />
                </div>
              ) : (
                <div className="mt-2.5 space-y-1.5">
                  {room.rates.map((r) => {
                    const onR = sel.rateId === r.rate_id;
                    return (
                      <div key={r.rate_id}>
                        <button onClick={() => setSel({ roomId: room.id, rateId: r.rate_id })}
                          className="w-full flex items-center gap-2.5 border px-2.5 py-2 text-left"
                          style={{ borderRadius: "var(--rw)", borderColor: onR ? "var(--accent)" : "#E9EAEB", background: onR ? "var(--accent-soft)" : "#fff" }}>
                          <Radio on={onR} />
                          <span className="flex-1 min-w-0">
                            <span className="text-[13px] font-bold flex items-center gap-1"><Utensils size={12} className="text-sub" /> {MEAL[r.board_basis.type] || r.board_basis.description}</span>
                            <RateFlags r={r} />
                          </span>
                          <span className="text-[12.5px] text-right"><DeltaText d={deltaOf(r, ctx)} nights={nights} /></span>
                        </button>
                        <SellerNote items={rateSeller(r)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Pick({ on, onClick }) {
  return (
    <button onClick={onClick} className="px-4 py-1.5 text-[12.5px] font-bold border-[1.5px] inline-flex items-center gap-1"
      style={{ borderRadius: "var(--rp)", borderColor: "var(--accent)", background: on ? "var(--accent)" : "#fff", color: on ? "#fff" : "var(--accent)" }}>
      {on ? <><Check size={13} strokeWidth={3} /> Selected</> : "Select"}
    </button>
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

