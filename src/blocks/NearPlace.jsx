import { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, X, Search } from "lucide-react";
import { PLACES, KINDS, placeKey, placeName, findPlace, reach } from "../data/places";

// ─── "Near a place": pick any activity, restaurant, stop or landmark in the city, then how far ───
// Lives in the filters (f.near = "kind|name", f.nearR = metres, 0 = any distance), so the
// left column, the sort and the map all share it. Picking a place also sorts by nearest.
export const NEAR_RADII = [0, 500, 1000, 2000, 5000];
const PICK_ORDER = ["activity", "food", "transit", "meeting", "airport"];
const fmtM = (m) => (m >= 1000 ? `${m / 1000} km` : `${m} m`);

const GLYPH = {
  airport: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
  transit: '<path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm1.5-6H6V6h12v5z"/>',
  meeting: '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>',
  activity: '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>',
  food: '<path d="M11 2v8a3 3 0 0 1-2 2.8V22H7v-9.2A3 3 0 0 1 5 10V2h2v7h1V2h1v7h1V2h1zm6 0c1.7 0 3 1.8 3 4v6h-2v10h-2V2h1z"/>',
};
export function KindDot({ kind, size = 18 }) {
  return (
    <span className="rounded-full flex items-center justify-center shrink-0" style={{ width: size, height: size, background: KINDS[kind].colour }}
      dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" width="${Math.round(size * 0.55)}" height="${Math.round(size * 0.55)}" fill="#fff">${GLYPH[kind]}</svg>` }} />
  );
}

// Walkable / Short ride / Need a car, as a small pill.
export function ReachTag({ d, className = "" }) {
  if (!d) return null;
  const r = reach(d);
  return <span title={r.tip} className={`inline-flex items-center text-[10.5px] font-bold rounded px-1.5 py-[1px] whitespace-nowrap shrink-0 ${className}`} style={{ color: r.colour, background: r.bg }}>{r.label}</span>;
}

export const clearNear = (f) => ({ ...f, near: null, nearR: 0, sort: f.sort === "near" ? "best" : f.sort });

export function PlacePicker({ city, f, set, count, accent = "var(--accent)" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", off);
    return () => document.removeEventListener("mousedown", off);
  }, [open]);
  const anchor = findPlace(city, f.near);
  const places = (PLACES[city] || []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={`w-full flex items-center gap-2 border rounded-lg px-2.5 py-2 text-left text-[13px] bg-white ${anchor ? "" : "border-divider hover:border-[#98A2B3]"}`}
        style={anchor ? { borderColor: accent } : undefined}>
        {anchor ? <KindDot kind={anchor.kind} /> : <MapPin size={16} className="text-sub shrink-0" />}
        <span className={`flex-1 truncate ${anchor ? "font-bold text-head" : "text-sub"}`}>{anchor ? placeName(anchor) : "Activity, restaurant, metro, landmark…"}</span>
        {anchor
          ? <X size={15} className="text-sub hover:text-head shrink-0" onClick={(e) => { e.stopPropagation(); set(clearNear(f)); }} />
          : <ChevronDown size={15} className="text-sub shrink-0" />}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-divider rounded-lg shadow-xl overflow-hidden min-w-[240px]">
          <div className="flex items-center gap-2 px-2.5 py-2 border-b border-divider">
            <Search size={14} className="text-sub" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search places in ${city}`} className="flex-1 text-[13px] outline-none" />
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1">
            {PICK_ORDER.map((k) => {
              const ps = places.filter((p) => p.kind === k);
              if (!ps.length) return null;
              return (
                <div key={k}>
                  <div className="px-3 pt-2 pb-1 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: KINDS[k].colour }}>{KINDS[k].label}</div>
                  {ps.map((p) => (
                    <button type="button" key={p.name} onClick={() => { set({ ...f, near: placeKey(p), nearR: f.nearR || 1000, sort: "near" }); setOpen(false); setQ(""); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-left hover:bg-[#F9FAFB]">
                      <KindDot kind={k} size={16} />
                      <span className="truncate">{placeName(p)}</span>
                      {p.trailix && <span className="ml-auto text-[10px] font-bold text-[#7F56D9] shrink-0">Trailix</span>}
                    </button>
                  ))}
                </div>
              );
            })}
            {!places.length && <div className="px-3 py-3 text-[12.5px] text-sub">No place called "{q}"</div>}
          </div>
        </div>
      )}
      {anchor && (
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          <span className="text-[11.5px] text-sub mr-0.5">within</span>
          {NEAR_RADII.map((m) => {
            const on = (f.nearR || 0) === m;
            return (
              <button type="button" key={m} onClick={() => set({ ...f, nearR: m })} className="px-2 py-0.5 text-[11.5px] font-semibold border whitespace-nowrap rounded-full"
                style={{ borderColor: on ? accent : "#E9EAEB", background: on ? accent : "#fff", color: on ? "#fff" : "#535862" }}>
                {m ? fmtM(m) : "Any"}
              </button>
            );
          })}
        </div>
      )}
      {anchor && count != null && (
        <div className="mt-1.5 text-[12px] font-semibold text-head">{count} hotel{count === 1 ? "" : "s"} {f.nearR ? `within ${fmtM(f.nearR)}` : "sorted by distance"}</div>
      )}
    </div>
  );
}
