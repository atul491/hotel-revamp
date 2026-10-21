import { useState } from "react";
import { ChevronDown, ChevronRight, MapPin, Sparkles, BadgeCheck, Navigation, Plane, Waves as WavesIco } from "lucide-react";
import { H2, Ico, GoodBad, SourceLogo, SOURCE_NAME, Stars, DataSource, SellerNote } from "../kit";

const well = (bg, fg) => ({ background: bg, color: fg, borderRadius: "var(--rw)" });

// ─── The honest bit ───
export function Honest({ h, v }) {
  const items = h.honest;
  if (v === "split") {
    const good = items.filter((i) => i.good);
    const bad = items.filter((i) => !i.good);
    return (
      <section>
        <H2 sub="Sent to you before you book, not after you land.">The honest bit<DataSource s="app" /></H2>
        <div className="grid grid-cols-2 gap-2">
          {[["Travellers love", good, "#ECFDF3", "#027A48"], ["Know before you go", bad, "#FFFAEB", "#B54708"]].map(([t, list, bg, fg]) => (
            <div key={t} className="p-3" style={{ background: bg, borderRadius: "var(--rw)" }}>
              <div className="text-[11px] font-extrabold uppercase tracking-wide mb-2" style={{ color: fg }}>{t}</div>
              {list.map((i) => (
                <div key={i.title} className="flex gap-1.5 text-[12.5px] mb-1.5 leading-snug"><span className="mt-[2px]"><GoodBad good={i.good} /></span>{i.short}</div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (v === "cards")
    return (
      <section>
        <H2 sub="Sent to you before you book, not after you land.">The honest bit<DataSource s="app" /></H2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-[var(--pad)] px-[var(--pad)]">
          {items.map((i) => (
            <div key={i.title} className="shrink-0 w-[230px] border border-divider p-3" style={{ borderRadius: "var(--r)" }}>
              <div className="w-8 h-8 flex items-center justify-center" style={i.good ? well("#ECFDF3", "#027A48") : well("#FFFAEB", "#B54708")}><Ico name={i.icon} /></div>
              <div className="text-[13.5px] font-bold mt-2 leading-snug">{i.title}</div>
              <p className="text-[12px] text-sub mt-1 leading-relaxed line-clamp-4">{i.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  return (
    <section>
      <H2 sub="Sent to you before you book, not after you land.">The honest bit<DataSource s="app" /></H2>
      <div className="relative p-4 pr-16 border border-[#EADFC4]" style={{ background: "#FCF6E7", borderRadius: "var(--r)" }}>
        <img src={`${import.meta.env.BASE_URL}stamp-honest.png`} className="absolute top-3 right-3 w-14 rotate-6 opacity-90" />
        <div className="font-hand text-[24px] text-[#6B4E16] leading-none mb-3">Know before you go</div>
        {items.map((i) => (
          <div key={i.title} className="flex gap-2 text-[13px] text-[#3D3424] mb-2 leading-snug"><span className="mt-[2px]"><GoodBad good={i.good} /></span>{i.short}</div>
        ))}
        <div className="font-hand text-[19px] text-[#6B4E16] mt-3 leading-tight">Happy travels, with love.<br />30 Sundays</div>
      </div>
    </section>
  );
}

// ─── Why Indian couples say yes ───
export function Why({ h, v }) {
  const list = h.whyIndians;
  const title = <H2>Why Indian couples say yes<DataSource s="app" /></H2>;
  if (v === "chips")
    return (
      <section>{title}
        <div className="flex flex-wrap gap-1.5">
          {list.map((i) => (
            <span key={i.text} className="inline-flex items-center gap-1.5 border border-divider px-2.5 py-1.5 text-[12px]" style={{ borderRadius: "var(--rp)" }}>
              <Ico name={i.icon} size={13} /> {i.text.split(",")[0]}
            </span>
          ))}
        </div>
      </section>
    );
  if (v === "highlight")
    return (
      <section>
        <div className="p-4" style={{ background: "linear-gradient(135deg, #FFF0F4 0%, #FEF6E9 100%)", border: "1px solid #F8D8E1", borderRadius: "var(--r)" }}>
          {title}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            {list.map((i) => (
              <div key={i.text} className="flex gap-2 text-[12px] leading-snug"><span style={{ color: "var(--accent)" }}><Ico name={i.icon} size={15} /></span>{i.text}</div>
            ))}
          </div>
        </div>
      </section>
    );
  return (
    <section>{title}
      <div className="space-y-2.5">
        {list.map((i) => (
          <div key={i.text} className="flex gap-3 items-start text-[13px] leading-snug">
            <span className="w-8 h-8 shrink-0 flex items-center justify-center" style={well("var(--accent-soft)", "var(--accent)")}><Ico name={i.icon} /></span>
            <span className="pt-1.5">{i.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── About ───
export function About({ h, v }) {
  const [open, setOpen] = useState(v === "sections" ? 0 : false);
  const title = <H2>About the stay<DataSource s="app" /></H2>;
  if (v === "sections")
    return (
      <section>{title}
        <p className="text-[13.5px] text-sub leading-relaxed mb-2">{h.aboutShort}</p>
        <div className="border border-divider divide-y divide-divider" style={{ borderRadius: "var(--rw)" }}>
          {h.aboutSections.map((s, i) => (
            <div key={s.title}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex justify-between items-center px-3 py-2.5 text-[13.5px] font-bold">
                {s.title} <ChevronDown size={16} className={`transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-3 pb-3 text-[13px] text-sub leading-relaxed">{s.body}</p>}
            </div>
          ))}
        </div>
      </section>
    );
  if (v === "cards")
    return (
      <section>{title}
        <p className="text-[13.5px] text-sub leading-relaxed">{h.aboutShort}</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3">
          {h.aboutCards.map((c) => (
            <div key={c.caption} className="shrink-0 w-[180px]">
              <img src={c.url} className="w-full h-[120px] object-cover" style={{ borderRadius: "var(--rw)" }} />
              <div className="text-[12px] font-semibold mt-1.5">{c.caption}</div>
            </div>
          ))}
        </div>
      </section>
    );
  const full = [h.aboutShort, ...h.aboutSections.map((s) => s.body)].join("\n\n");
  return (
    <section>{title}
      <p className={`text-[13.5px] text-sub leading-relaxed whitespace-pre-line ${open ? "" : "line-clamp-5"}`}>{full}</p>
      <button onClick={() => setOpen(!open)} className="text-[13px] font-bold mt-1.5 underline" style={{ color: "var(--accent)" }}>{open ? "Read less" : "Read more"}</button>
    </section>
  );
}

// ─── Amenities ───
export function Amenities({ h, v }) {
  const total = h.facilityGroups.reduce((n, g) => n + g.items.length, 0);
  const title = <H2>What this place offers<DataSource s="app" /></H2>;
  const more = <button className="mt-3 text-[13px] font-bold flex items-center gap-0.5" style={{ color: "var(--accent)" }}>View all {total} amenities <ChevronRight size={15} /></button>;
  if (v === "grid")
    return (
      <section>{title}
        <div className="grid grid-cols-3 gap-2">
          {h.facilityTop.map((f) => (
            <div key={f.label} className="border border-divider p-2.5 text-center" style={{ borderRadius: "var(--rw)" }}>
              <div className="flex justify-center" style={{ color: "var(--accent)" }}><Ico name={f.icon} size={20} /></div>
              <div className="text-[11.5px] font-semibold mt-1.5 leading-tight">{f.label}</div>
            </div>
          ))}
        </div>{more}
      </section>
    );
  if (v === "grouped")
    return (
      <section>{title}
        <div className="space-y-3">
          {h.facilityGroups.slice(0, 5).map((g) => (
            <div key={g.key}>
              <div className="text-[13px] font-bold flex items-center gap-1.5 mb-1"><Ico name={g.icon} size={15} /> {g.title}</div>
              <div className="text-[12.5px] text-sub leading-relaxed">{g.items.slice(0, 5).map((i) => i.label).join(" · ")}</div>
            </div>
          ))}
        </div>{more}
      </section>
    );
  if (v === "chips")
    return (
      <section>{title}
        <div className="flex flex-wrap gap-1.5">
          {h.facilityGroups.flatMap((g) => g.items.slice(0, 3)).slice(0, 16).map((i) => (
            <span key={i.label} className="bg-surface text-[12px] px-2.5 py-1" style={{ borderRadius: "var(--rp)" }}>{i.label}</span>
          ))}
        </div>{more}
      </section>
    );
  return (
    <section>{title}
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {h.facilityTop.map((f) => (
          <div key={f.label} className="flex gap-2 items-start text-[13px]">
            <Ico name={f.icon} size={18} className="text-sub shrink-0" />
            <div>{f.label}{f.note && <div className="text-[11px] text-inact">{f.note}</div>}</div>
          </div>
        ))}
      </div>{more}
    </section>
  );
}

// ─── Location ───
export function Location({ h, v }) {
  const [tab, setTab] = useState(Object.keys(h.nearby)[0]);
  const m = h.ib?.master || {};
  const title = <H2>Where you'll be<DataSource s="both" /></H2>;
  const seller = <SellerNote items={[["Region", m.region || "—"], ["Beachfront", m.beachfront ? "Yes" : "No"], ["Beach", m.distance_from_beach_km != null ? `${m.distance_from_beach_km} km` : "—"]]} />;
  const address = (
    <div className="flex gap-2.5 items-start">
      <span className="w-9 h-9 shrink-0 flex items-center justify-center" style={well("#EAF2FE", "#1570EF")}><MapPin size={17} /></span>
      <div className="text-[13px]">
        <div className="font-semibold leading-snug">{h.address}</div>
        <div className="text-sub text-[12px] mt-0.5">{h.distanceFromCenter} km from {h.city || "city"} centre</div>
      </div>
    </div>
  );
  if (v === "chips")
    return (
      <section>{title}{address}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[[Navigation, `${h.distanceFromCenter} km to centre`], [WavesIco, `${m.distance_from_beach_km ?? 0.2} km to the beach`], [Plane, "40 min to airport"]].map(([I, t]) => (
            <span key={t} className="inline-flex items-center gap-1 border border-divider px-2.5 py-1 text-[12px]" style={{ borderRadius: "var(--rp)" }}><I size={13} /> {t}</span>
          ))}
        </div>{seller}
      </section>
    );
  if (v === "map")
    return (
      <section>{title}
        <div className="relative h-[170px] overflow-hidden border border-divider" style={{ borderRadius: "var(--r)" }}>
          <img src={`https://tile.openstreetmap.org/14/${lon2tile(h.coords.lng, 14)}/${lat2tile(h.coords.lat, 14)}.png`} className="absolute inset-0 w-full h-full object-cover scale-[1.6]" />
          <div className="absolute inset-0 flex items-center justify-center"><span className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg" style={{ background: "var(--accent)" }}><MapPin size={18} /></span></div>
        </div>
        <div className="mt-3">{address}</div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {Object.entries(h.nearby).map(([g, list]) => (
            <div key={g} className="text-[12px] bg-surface p-2" style={{ borderRadius: "var(--rw)" }}><b>{g}</b><div className="text-sub">{list[0].name} · {list[0].distance}</div></div>
          ))}
        </div>{seller}
      </section>
    );
  return (
    <section>{title}{address}
      <div className="flex gap-4 border-b border-divider mt-3 text-[13px] overflow-x-auto no-scrollbar">
        {Object.keys(h.nearby).map((k) => (
          <button key={k} onClick={() => setTab(k)} className="pb-2 font-semibold whitespace-nowrap" style={{ color: tab === k ? "var(--accent)" : "#535862", borderBottom: tab === k ? "2px solid var(--accent)" : "2px solid transparent" }}>{k}</button>
        ))}
      </div>
      <div className="divide-y divide-divider">
        {h.nearby[tab].slice(0, 4).map((n) => (
          <div key={n.name} className="flex gap-2.5 py-2.5 items-center">
            <img src={n.image} className="w-[58px] h-[58px] object-cover shrink-0" style={{ borderRadius: "var(--rw)" }} />
            <div className="text-[12.5px] min-w-0">
              <div className="font-bold text-[13px] truncate">{n.name}</div>
              <div className="text-sub">★ {n.rating} ({n.count?.toLocaleString("en-IN")}) · {n.distance} · {n.time}</div>
              <div className="flex gap-1 mt-0.5">
                {n.tags?.includes("indian") && <span className="text-[10.5px] font-bold px-1.5 rounded bg-[#FFF4E0] text-[#B54708]">Indian</span>}
                {n.tags?.includes("pureveg") && <span className="text-[10.5px] font-bold px-1.5 rounded bg-[#ECFDF3] text-[#027A48]">Pure veg</span>}
                {n.tags?.includes("hotel") && <span className="text-[10.5px] font-bold px-1.5 rounded bg-[#EAF2FE] text-[#1570EF]">At the hotel</span>}
              </div>
            </div>
          </div>
        ))}
      </div>{seller}
    </section>
  );
}
const lon2tile = (lon, z) => Math.floor(((lon + 180) / 360) * 2 ** z);
const lat2tile = (lat, z) => Math.floor(((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** z);

// ─── Reviews ───
function ReviewCard({ r, w = "w-[260px]" }) {
  return (
    <div className={`shrink-0 ${w} bg-white border border-divider p-3`} style={{ borderRadius: "var(--r)" }}>
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>{r.name[0]}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold flex items-center gap-1">{r.name} {r.verified && <BadgeCheck size={13} color="#1570EF" />}</div>
          <div className="text-[11px] text-sub truncate">{r.meta || r.date}</div>
        </div>
        <SourceLogo s={r.source} />
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-sub">
        {r.outOf === 5 ? <Stars n={Math.round(r.score)} size={12} /> : <b className="text-white bg-[#003580] px-1 rounded text-[11px]">{r.score}</b>} {r.date}
      </div>
      <p className="text-[12.5px] leading-relaxed mt-1.5 line-clamp-5">{r.text}</p>
    </div>
  );
}

export function Reviews({ h, v }) {
  const s = h.reviewSummary;
  const ai = (
    <div className="p-3.5 border border-[#E9E3FC]" style={{ background: "#F6F3FE", borderRadius: "var(--r)" }}>
      <div className="flex items-center gap-1.5 text-[13.5px] font-bold">What travellers are saying <span className="text-[10px] font-extrabold text-[#6941C6] bg-white px-1.5 py-0.5 rounded flex items-center gap-0.5"><Sparkles size={10} /> AI</span></div>
      <div className="text-[11px] text-[#6941C6] mt-0.5">Written by AI from {Object.values(h.ratings).reduce((n, r) => n + r.count, 0).toLocaleString("en-IN")} ratings across all 4 sources</div>
      <p className="text-[13px] leading-relaxed mt-2 line-clamp-4">{s.text}</p>
      <div className="text-[11px] text-inact mt-1.5">{s.updated}</div>
    </div>
  );
  const title = <H2>Ratings and reviews<DataSource s="app" /></H2>;
  if (v === "bars")
    return (
      <section>{title}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {h.ratingBreakdown.booking.map((b) => (
            <div key={b.label} className="text-[12px]">
              <div className="flex justify-between"><span className="text-sub">{b.label}</span><b>{b.score}</b></div>
              <div className="h-1.5 bg-surface rounded-full mt-1"><div className="h-full rounded-full" style={{ width: `${b.score * 10}%`, background: "var(--accent)" }} /></div>
            </div>
          ))}
        </div>
        <div className="text-[11px] text-inact mt-1.5 flex items-center gap-1"><SourceLogo s="booking" size={12} /> Booking.com categories</div>
        <div className="space-y-2 mt-3">{h.reviews.slice(0, 3).map((r) => <ReviewCard key={r.id} r={r} w="w-full" />)}</div>
      </section>
    );
  if (v === "summary")
    return (
      <section>{title}{ai}<div className="mt-2"><ReviewCard r={h.reviews[0]} w="w-full" /></div>
        <button className="mt-2 text-[13px] font-bold" style={{ color: "var(--accent)" }}>Read all {h.reviews.length} reviews</button>
      </section>
    );
  return (
    <section className="-mx-[var(--pad)] px-[var(--pad)] py-4" style={{ background: "var(--band)" }}>
      {title}
      <div className="bg-white border border-divider mb-3" style={{ borderRadius: "var(--r)" }}>
        <div className="px-3 py-2.5 flex items-center gap-2 border-b border-divider text-[13px]">
          <SourceLogo s="sundays" size={20} /><b>30 Sundays</b><span className="text-sub">· {h.ratings.sundays.count} ratings</span>
          <span className="ml-auto font-bold text-[#2E8B60]">{h.ratings.sundays.score}/5</span>
        </div>
        <div className="grid grid-cols-3 divide-x divide-divider">
          {["booking", "google", "tripadvisor"].map((k) => (
            <div key={k} className="p-2.5 text-center">
              <div className="flex justify-center"><SourceLogo s={k} size={16} /></div>
              <div className="text-[15px] font-extrabold mt-1">{h.ratings[k].score}<span className="text-[11px] text-inact">/{h.ratings[k].outOf}</span></div>
              <div className="text-[10.5px] text-sub">{h.ratings[k].count.toLocaleString("en-IN")} ratings</div>
            </div>
          ))}
        </div>
      </div>
      {ai}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3">{h.reviews.map((r) => <ReviewCard key={r.id} r={r} />)}</div>
      <button className="mt-3 text-[13px] font-bold" style={{ color: "var(--accent)" }}>Read all reviews</button>
    </section>
  );
}

export { SOURCE_NAME };
