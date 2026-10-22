import { useState } from "react";
import { ChevronLeft, Share2, Images, Play, MapPin, CalendarDays, Users, LogIn, LogOut, Moon } from "lucide-react";
import { Stars, BookingB, SourceLogo, SOURCE_NAME, DataSource, SellerNote } from "../kit";

// ─── Media ───
export function Media({ h, v }) {
  const photos = h.photos;
  const total = photos.length + (h.reels?.length || 0);
  const chrome = (
    <>
      <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none">
        <span className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow"><ChevronLeft size={18} /></span>
        <span className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow"><Share2 size={15} /></span>
      </div>
      <span className="absolute bottom-3 right-3 bg-black/70 text-white text-[11.5px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
        <Images size={13} /> View gallery {total}
      </span>
    </>
  );

  if (v === "mosaic")
    return (
      <div className="relative grid grid-cols-4 grid-rows-2 gap-1 h-[260px] overflow-hidden" style={{ borderRadius: "var(--r)" }}>
        <img src={photos[0].url} className="col-span-2 row-span-2 w-full h-full object-cover" />
        {photos.slice(1, 5).map((p, i) => (
          <div key={i} className="relative">
            <img src={p.url} className="w-full h-full object-cover" />
            {i === 3 && <div className="absolute inset-0 bg-black/45 text-white font-bold text-sm flex items-center justify-center">+{photos.length - 5} photos</div>}
          </div>
        ))}
      </div>
    );

  if (v === "carousel") return <Carousel photos={photos} chrome={chrome} />;

  if (v === "tabs") {
    const cats = ["All", ...new Set(photos.map((p) => p.category))];
    return <TabsMedia photos={photos} cats={cats} />;
  }

  // strip (app default)
  const poster = h.video?.poster?.split("?")[0];
  const rest = photos.filter((p) => p.url.split("?")[0] !== poster);
  const pairs = [];
  for (let i = 0; i < rest.length; i += 2) pairs.push(rest.slice(i, i + 2));
  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto no-scrollbar h-[288px]">
        <div className="relative shrink-0 w-[172px] h-full">
          <img src={h.video?.poster || photos[0].url} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <div className="text-[10px] font-bold opacity-80 flex items-center gap-1"><Play size={10} fill="#fff" /> {h.video?.duration}</div>
            <div className="text-[13px] font-bold leading-tight">{h.video?.label}</div>
          </div>
        </div>
        {pairs.slice(0, 6).map((pair, i) => (
          <div key={i} className="shrink-0 w-[150px] h-full flex flex-col gap-1">
            {pair.map((p, j) => <img key={j} src={p.url} className="w-full flex-1 min-h-0 object-cover" />)}
          </div>
        ))}
      </div>
      {chrome}
    </div>
  );
}

function Carousel({ photos, chrome }) {
  const [i, setI] = useState(0);
  return (
    <div className="relative h-[260px] overflow-hidden" style={{ borderRadius: "var(--r)" }}>
      <div className="flex h-full transition-transform duration-300" style={{ transform: `translateX(-${i * 100}%)` }}>
        {photos.slice(0, 8).map((p, k) => <img key={k} src={p.url} className="w-full h-full object-cover shrink-0" />)}
      </div>
      <button className="absolute inset-y-0 left-0 w-1/3" onClick={() => setI(Math.max(0, i - 1))} />
      <button className="absolute inset-y-0 right-0 w-1/3" onClick={() => setI(Math.min(7, i + 1))} />
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {photos.slice(0, 8).map((_, k) => <span key={k} className="h-1.5 rounded-full bg-white transition-all" style={{ width: k === i ? 16 : 6, opacity: k === i ? 1 : 0.6 }} />)}
      </div>
      {chrome}
    </div>
  );
}

function TabsMedia({ photos, cats }) {
  const [c, setC] = useState("All");
  const list = c === "All" ? photos : photos.filter((p) => p.category === c);
  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {cats.map((k) => (
          <button key={k} onClick={() => setC(k)} className="px-3 py-1 text-[12px] font-semibold border whitespace-nowrap"
            style={{ borderRadius: "var(--rp)", background: c === k ? "#181D27" : "#fff", color: c === k ? "#fff" : "#535862", borderColor: c === k ? "#181D27" : "#E9EAEB" }}>
            {k} {k === "All" ? photos.length : photos.filter((p) => p.category === k).length}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar h-[210px]">
        {list.map((p, i) => (
          <div key={i} className="relative shrink-0 w-[240px] h-full overflow-hidden" style={{ borderRadius: "var(--rw)" }}>
            <img src={p.url} className="w-full h-full object-cover" />
            <span className="absolute bottom-2 left-2 text-[11px] text-white bg-black/55 px-2 py-0.5 rounded">{p.caption || p.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Title ───
function SundaysPick() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-[3px] rounded-md text-[9.5px] font-extrabold tracking-wide text-[#C00840] align-middle"
      style={{ background: "linear-gradient(135deg, #FFF0F4 0%, #FEF6E9 100%)", border: "1px solid #F8D8E1" }}>
      <img src={`${import.meta.env.BASE_URL}logo.png`} className="w-3 h-3 object-contain" /> SUNDAYS PICK
    </span>
  );
}

export function Title({ h, v }) {
  const type = h.type === "Resort" ? "resort" : "hotel";
  const seller = [
    ["TravClan", h.ib?.travclan_id],
    ["TBO", h.ib?.tbo_id || "—"],
    ["Contracted", h.ib?.contracted ? "Yes ©" : "No"],
    ["Recommended", h.ib?.recommended === true ? "👍" : h.ib?.recommended === false ? "👎" : "—"],
    ["Transfers", h.ib?.private_sic],
  ];
  if (v === "center")
    return (
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-sub">{h.neighbourhood}</div>
        <h1 className="mt-1" style={{ fontFamily: "var(--head-font)", fontSize: 28, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>{h.name}</h1>
        <div className="mt-2 flex justify-center items-center gap-2"><Stars n={h.stars} size={14} /> {h.sundaysPick && <SundaysPick />}</div>
        <DataSource s="both" />
        <SellerNote items={seller} />
      </div>
    );
  if (v === "eyebrow")
    return (
      <div>
        <div className="text-[10.5px] font-extrabold uppercase tracking-[0.9px] text-sub flex items-center gap-1"><MapPin size={11} /> {h.neighbourhood}</div>
        <h1 className="mt-1" style={{ fontFamily: "var(--head-font)", fontSize: 24, fontWeight: 700, letterSpacing: -0.4 }}>{h.name}<DataSource s="both" /></h1>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#B54708] bg-[#FFF4E0] px-2 py-0.5" style={{ borderRadius: "var(--rp)" }}>{h.stars} star {type}</span>
          {h.sundaysPick && <SundaysPick />}
        </div>
        <SellerNote items={seller} />
      </div>
    );
  return (
    <div>
      <h1 style={{ fontFamily: "var(--head-font)", fontSize: 22, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.25 }}>
        {h.name} {h.sundaysPick && <SundaysPick />}<DataSource s="both" />
      </h1>
      <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-sub">
        <Stars n={h.stars} /> {h.stars} star {type} · {h.neighbourhood}
      </div>
      <SellerNote items={seller} />
    </div>
  );
}

// ─── Scores ───
export function Scores({ h, v }) {
  const r = h.ratings;
  const pct = Math.round((r.sundays.score / 5) * 100 - 4);
  const others = ["booking", "google", "tripadvisor"];
  if (v === "cards")
    return (
      <div className="grid grid-cols-2 gap-2">
        {["sundays", ...others].map((k) => (
          <div key={k} className="border border-divider p-3" style={{ borderRadius: "var(--rw)", background: k === "sundays" ? "var(--accent-soft)" : "#fff" }}>
            <div className="flex items-center gap-1.5 text-[11.5px] text-sub font-semibold"><SourceLogo s={k} size={16} /> {SOURCE_NAME[k]}</div>
            <div className="mt-1 text-[20px] font-extrabold">{r[k].score}<span className="text-[12px] text-inact font-semibold">/{r[k].outOf}</span></div>
            <div className="text-[11.5px] text-sub">{r[k].label} · {r[k].count.toLocaleString("en-IN")} ratings</div>
          </div>
        ))}
      </div>
    );
  if (v === "hero")
    return (
      <div className="border border-divider p-4 flex items-center gap-4" style={{ borderRadius: "var(--r)" }}>
        <div className="text-center shrink-0">
          <div className="text-[34px] font-extrabold leading-none" style={{ color: "var(--accent)" }}>{pct}%</div>
          <div className="text-[10.5px] font-bold text-sub mt-1">enjoyed it</div>
        </div>
        <div className="flex-1 border-l border-divider pl-4">
          <div className="text-[13px] font-bold flex items-center gap-1.5"><SourceLogo s="sundays" size={16} /> {r.sundays.count} couples who went with us</div>
          <div className="flex gap-3 mt-2 text-[12px] text-sub">
            {others.map((k) => <span key={k} className="flex items-center gap-1"><SourceLogo s={k} size={14} /> <b className="text-head">{r[k].score}</b>/{r[k].outOf}</span>)}
          </div>
        </div>
      </div>
    );
  if (v === "chips")
    return (
      <div className="flex flex-wrap gap-1.5">
        {["sundays", ...others].map((k) => (
          <span key={k} className="inline-flex items-center gap-1 border border-divider px-2 py-1 text-[12px]" style={{ borderRadius: "var(--rp)" }}>
            <SourceLogo s={k} size={14} /> <b>{r[k].score}</b><span className="text-inact">/{r[k].outOf}</span>
          </span>
        ))}
      </div>
    );
  return (
    <div className="border border-divider flex items-stretch divide-x divide-divider text-[12.5px]" style={{ borderRadius: "var(--rw)" }}>
      <div className="flex-1 flex items-center gap-2 px-3 py-2.5">
        <SourceLogo s="sundays" size={20} />
        <span><b className="text-[#2E8B60]">{pct}%</b> of travellers enjoyed it</span>
      </div>
      <div className="flex items-center gap-1.5 px-3"><BookingB /> <b>{r.booking.score}</b>/10</div>
      <div className="flex items-center gap-1.5 px-3"><SourceLogo s="google" size={16} /> <b>{r.google.score}</b>/5</div>
    </div>
  );
}

// ─── Stay ───
export function Stay({ h, v, ctx }) {
  const sb = h.stayBasics;
  const perk = [sb.earlyCheckIn?.included && "Early check-in included", sb.lateCheckOut?.included && "Late check-out included"].filter(Boolean).join(" · ");
  if (v === "columns")
    return (
      <div className="border border-divider" style={{ borderRadius: "var(--r)" }}>
        <div className="grid grid-cols-2 divide-x divide-divider">
          {[["CHECK-IN", sb.checkIn, ctx.checkIn], ["CHECK-OUT", sb.checkOut, ctx.checkOut]].map(([l, t, d]) => (
            <div key={l} className="p-3.5">
              <div className="text-[10px] font-extrabold tracking-[0.9px] text-sub">{l}</div>
              <div className="text-[18px] font-extrabold mt-0.5">{t}</div>
              <div className="text-[12px] text-sub">{d}</div>
            </div>
          ))}
        </div>
        {perk && <div className="border-t border-divider px-3.5 py-2 text-[12.5px] font-semibold text-[#027A48] bg-[#ECFDF3]" style={{ borderRadius: "0 0 var(--r) var(--r)" }}>✓ {perk}</div>}
      </div>
    );
  if (v === "timeline")
    return (
      <div className="flex items-center gap-2 text-[12.5px]">
        <div className="flex items-center gap-1.5"><LogIn size={15} className="text-sub" /><div><b>{ctx.checkIn}</b><div className="text-sub text-[11px]">from {sb.checkIn}</div></div></div>
        <div className="flex-1 flex items-center gap-1 text-sub text-[11.5px]"><span className="flex-1 border-t border-dashed border-[#D5D7DA]" /> <Moon size={12} /> {ctx.nights} nights · {ctx.adults} adults <span className="flex-1 border-t border-dashed border-[#D5D7DA]" /></div>
        <div className="flex items-center gap-1.5 text-right"><div><b>{ctx.checkOut}</b><div className="text-sub text-[11px]">until {sb.checkOut}</div></div><LogOut size={15} className="text-sub" /></div>
      </div>
    );
  return (
    <div className="border border-divider p-3.5" style={{ borderRadius: "var(--r)" }}>
      <div className="flex items-center gap-2 text-[13.5px] font-semibold flex-wrap">
        <CalendarDays size={15} className="text-sub" /> {ctx.checkIn} – {ctx.checkOut} • {ctx.nights} nights • <Users size={14} className="text-sub" /> {ctx.adults} travellers
      </div>
      <div className="text-[12.5px] text-sub mt-1">Check-In: {sb.checkIn} • Check-Out: {sb.checkOut}</div>
      {perk && <div className="text-[12px] font-semibold text-[#027A48] mt-1">✓ {perk}</div>}
    </div>
  );
}
