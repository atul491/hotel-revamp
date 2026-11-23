import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, ChevronDown, ChevronLeft, Check, ExternalLink } from "lucide-react";
import { inr } from "./kit";
import { PLACES, KINDS, nearest, fmtKm } from "./data/places";
import { DistanceRows, fmtM } from "./blocks/screen";

// ─── Hotels on a map (Booking.com / MakeMyTrip style) ───
//
// Two modes:
//  • Overview: every hotel as a price pin, every place around the city, and a
//    hotel list on the left.
//  • Focus: one hotel picked (from the list or its pin, or the one already
//    selected for this city when the map opens). The map zooms to it, other
//    hotels fade, dashed lines run to its nearest meeting point, transit stop,
//    food place and activity, and the left panel lists every place by distance
//    from it. Clicking a row draws the line to that place.
// Tiles come from OpenStreetMap, so no API key is needed.

const NAVY = "#181e4c";
const PINK = "#fd014f";
const ORDER = ["airport", "meeting", "transit", "food", "activity"];

const GLYPH = {
  airport: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
  transit: '<path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm1.5-6H6V6h12v5z"/>',
  meeting: '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>',
  activity: '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>',
  food: '<path d="M11 2v8a3 3 0 0 1-2 2.8V22H7v-9.2A3 3 0 0 1 5 10V2h2v7h1V2h1v7h1V2h1zm6 0c1.7 0 3 1.8 3 4v6h-2v10h-2V2h1z"/>',
};
const glyph = (kind, size = 14, fill = "#fff") => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fill}">${GLYPH[kind]}</svg>`;
function placeIcon(kind) {
  return L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -12],
    html: `<div class="hr-poi" style="background:${KINDS[kind].colour}">${glyph(kind)}</div>`,
  });
}
function pin(label, cls) {
  return L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-pin ${cls}">${label}</div>` });
}
const lowest = (h) => h.rooms.flatMap((r) => r.rates).sort((a, b) => a.pricing.selling_price - b.pricing.selling_price)[0];
const placeKey = (p) => `${p.kind}|${p.name}`;

const TYPE_OPTS = ["Private", "SIC", "Gold", "Silver", "Bronze"];
const toggle = (arr, x) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);

export default function MapOverlay({ city, centre, hotels, ctx, onClose, onOpenDetails, filters, setFilters, priceRange }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const pinLayer = useRef(null);
  const lineLayer = useRef(null);
  const placeLayers = useRef({});
  const [show, setShow] = useState(Object.fromEntries(Object.keys(KINDS).map((k) => [k, true])));
  // Open focused on the hotel already selected for this city, if it is in the list.
  const [focusId, setFocusId] = useState(() => (hotels.some((h) => h.id === ctx.currentId && h.coords) ? ctx.currentId : null));
  const [picked, setPicked] = useState(null); // place row clicked in the focus panel
  const focus = hotels.find((h) => h.id === focusId && h.coords) || null;

  // A filter that hides the focused hotel drops back to the overview.
  useEffect(() => { if (focusId && !focus) setFocusId(null); }, [focusId, focus]);
  useEffect(() => setPicked(null), [focusId]);

  // Every place around the focused hotel, nearest first, per kind.
  const around = useMemo(() => {
    if (!focus) return {};
    return Object.fromEntries(ORDER.map((k) => [k, nearest(city, k, focus.coords, 99)]));
  }, [focus, city]);

  // ─── Map, tiles, city centre, place layers: once per city ───
  useEffect(() => {
    const map = L.map(box.current, { zoomControl: false, attributionControl: true }).setView([centre.lat, centre.lng], 14);
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.marker([centre.lat, centre.lng], {
      icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-centre"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="#D70143" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg><b>${city} centre</b></div>` }),
      interactive: false,
      zIndexOffset: -100,
    }).addTo(map);
    placeLayers.current = {};
    Object.keys(KINDS).forEach((kind) => {
      const g = L.layerGroup();
      (PLACES[city] || []).filter((p) => p.kind === kind).forEach((p) => {
        L.marker([p.lat, p.lng], { icon: placeIcon(kind), zIndexOffset: -50 })
          .bindTooltip(`<b>${p.name}</b><br><span style="color:${KINDS[kind].colour}">${KINDS[kind].label}${p.trailix ? " · Trailix activity" : ""}</span>`, { direction: "top", offset: [0, -12], className: "hr-tip" })
          .bindPopup(`<div class="hr-poi-pop"><b>${p.name}</b><span style="color:${KINDS[kind].colour}">${KINDS[kind].label}</span></div>`, { closeButton: false })
          .addTo(g);
      });
      placeLayers.current[kind] = g;
      g.addTo(map);
    });
    lineLayer.current = L.layerGroup().addTo(map);
    pinLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);
    return () => { map.remove(); mapRef.current = null; };
  }, [city, centre]);

  // Legend toggles.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.entries(placeLayers.current).forEach(([kind, g]) => {
      if (show[kind]) { if (!map.hasLayer(g)) g.addTo(map); } else if (map.hasLayer(g)) map.removeLayer(g);
    });
  }, [show, city]);

  // ─── Hotel price pins: the focused one stands out, the rest fade ───
  useEffect(() => {
    const layer = pinLayer.current;
    if (!layer) return;
    layer.clearLayers();
    hotels.forEach((h) => {
      if (!h.coords) return;
      const total = lowest(h).pricing.selling_price * ctx.nights;
      const isFocus = h.id === focusId;
      const cls = isFocus ? "hr-pin-focus" : focusId ? "hr-pin-dim" : h.id === ctx.currentId ? "hr-pin-sel" : "";
      L.marker([h.coords.lat, h.coords.lng], { icon: pin(isFocus ? `★ ${h.name}` : inr(total), cls), zIndexOffset: isFocus ? 2000 : h.id === ctx.currentId ? 1000 : 0 })
        .on("click", () => setFocusId(h.id))
        .addTo(layer);
    });
  }, [hotels, focusId, ctx.nights, ctx.currentId, city]);

  // ─── Lines from the focused hotel, and where the camera goes ───
  useEffect(() => {
    const map = mapRef.current, layer = lineLayer.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const padL = 372; // room for the left panel
    if (!focus) {
      const pts = [[centre.lat, centre.lng], ...hotels.filter((h) => h.coords).map((h) => [h.coords.lat, h.coords.lng])];
      // Wait a tick so the map knows its real size before framing.
      const t = setTimeout(() => { map.invalidateSize(); if (pts.length > 1) map.fitBounds(pts, { paddingTopLeft: [padL, 40], paddingBottomRight: [200, 90], maxZoom: 15 }); }, 80);
      return () => clearTimeout(t);
    }
    const from = [focus.coords.lat, focus.coords.lng];
    const line = (p, strong) => {
      const c = KINDS[p.kind].colour;
      L.polyline([from, [p.lat, p.lng]], { color: c, weight: strong ? 4 : 2, opacity: strong ? 0.95 : 0.7, dashArray: strong ? null : "5 6", interactive: false }).addTo(layer);
      // Label sits next to the place it measures (so labels spread out with the places);
      // the airport is far, so its label stays about 1 km out from the hotel, in view.
      const t = p.kind === "airport" ? Math.min(0.5, 1.1 / p.km) : 0.82;
      const at = [from[0] + (p.lat - from[0]) * t, from[1] + (p.lng - from[1]) * t];
      L.marker(at, {
        zIndexOffset: strong ? 900 : 500,
        icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-dist${strong ? " hr-dist-strong" : ""}" style="border-color:${c};color:${c}">${glyph(p.kind, 11, c)}${fmtKm(p.km)} · ${p.min} min</div>` }),
      })
        .bindTooltip(`<b>${p.name.replace(/^Meeting point · /, "")}</b><br>${fmtKm(p.km)} · ${p.min} min ${p.mode}${p.trailix ? "<br><span style='color:#7F56D9'>Trailix activity</span>" : ""}`, { direction: "top", offset: [0, -10], className: "hr-tip" })
        .on("click", () => setPicked(placeKey(p)))
        .addTo(layer);
    };
    const drawn = [
      ...(around.airport || []).slice(0, 1),
      ...(around.meeting || []).slice(0, 1),
      ...(around.transit || []).slice(0, 1),
      ...(around.food || []).slice(0, 3),
      ...(around.activity || []),
    ].filter((p) => show[p.kind]);
    const target = picked ? Object.values(around).flat().find((p) => placeKey(p) === picked) : null;
    drawn.forEach((p) => { if (!target || placeKey(p) !== placeKey(target)) line(p, false); });
    if (target) line(target, true);
    // Frame everything drawn except the airport (it is far); a picked row frames just that pair.
    const near = drawn.filter((p) => p.kind !== "airport");
    const pts = [from, ...(target ? [[target.lat, target.lng]] : near.map((p) => [p.lat, p.lng]))];
    const tm = setTimeout(() => { map.invalidateSize(); map.fitBounds(pts, { paddingTopLeft: [padL, 60], paddingBottomRight: [200, 100], maxZoom: target ? 15 : 16 }); }, 80);
    return () => clearTimeout(tm);
  }, [focus, around, picked, hotels, centre, show]);

  useEffect(() => {
    const onKey = (e) => { if (e.key !== "Escape") return; if (focusId) setFocusId(null); else onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, focusId]);

  const shown = hotels.filter((h) => h.coords);

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl" style={{ width: "90vw", height: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-divider shrink-0">
          <b className="text-[15px]">{city} on the map</b>
          <span className="text-[13px] text-sub">
            {focus ? <>Showing everything around <b className="text-head">{focus.name}</b></> : <>{shown.length} hotels · prices for {ctx.nights} nights · pick a hotel to see what's around it</>}
          </span>
          <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full hover:bg-surface flex items-center justify-center" title="Close map"><X size={18} /></button>
        </div>
        <div className="flex-1 min-h-0 relative">
          <div ref={box} className="absolute inset-0" />

          {/* Left panel: hotel list (overview) or what's around the hotel (focus) */}
          <div className="absolute left-3 top-3 bottom-[68px] w-[340px] z-[500] bg-white border border-divider rounded-xl shadow-lg flex flex-col overflow-hidden" style={{ fontFamily: "Figtree, Inter, system-ui, sans-serif" }}>
            {focus ? (
              <FocusPanel h={focus} ctx={ctx} around={around} picked={picked} setPicked={setPicked}
                onBack={() => setFocusId(null)} onOpenDetails={() => onOpenDetails?.(focus.id)} />
            ) : (
              <HotelList hotels={shown} ctx={ctx} onPick={setFocusId} />
            )}
          </div>

          {/* Legend: what kinds of places are drawn */}
          <div className="absolute right-3 top-[88px] z-[500] flex flex-col gap-0.5 bg-white/95 backdrop-blur border border-divider rounded-xl p-2 shadow-lg" style={{ fontFamily: "Figtree, Inter, system-ui, sans-serif" }}>
            <div className="text-[11px] font-bold uppercase tracking-wide text-sub px-1 mb-0.5">Show on map</div>
            {Object.entries(KINDS).map(([kind, k]) => (
              <button key={kind} onClick={() => setShow((x) => ({ ...x, [kind]: !x[kind] }))} className="flex items-center gap-2 px-2 py-1 rounded-md text-[12.5px] font-semibold hover:bg-surface text-left" style={{ opacity: show[kind] ? 1 : 0.45 }}>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white shadow" style={{ background: k.colour }} /> {k.label}
              </button>
            ))}
            <div className="flex items-center gap-2 px-2 py-1 text-[12.5px] font-semibold"><span className="w-3.5 h-3.5 rounded-sm" style={{ background: NAVY }} /> Hotels</div>
            <div className="flex items-center gap-2 px-2 py-1 text-[12.5px] font-semibold"><span className="w-3.5 h-3.5 rounded-full" style={{ background: "#D70143" }} /> City centre</div>
          </div>

          {filters && <FilterBar f={filters} set={setFilters} range={priceRange} count={shown.length} />}
        </div>
      </div>
      <style>{`
        .hr-pin { transform: translate(-50%, -100%); background: ${NAVY}; color: #fff; font: 600 13px/1 Figtree, Inter, system-ui, sans-serif; padding: 7px 10px; border-radius: 8px; white-space: nowrap; box-shadow: 0 2px 8px rgba(15,23,42,.35); position: relative; cursor: pointer; transition: opacity .15s; }
        .hr-pin::after { content: ""; position: absolute; left: 50%; bottom: -6px; transform: translateX(-50%); border: 6px solid transparent; border-top-color: ${NAVY}; border-bottom: 0; }
        .hr-pin:hover { background: ${PINK}; opacity: 1; } .hr-pin:hover::after { border-top-color: ${PINK}; }
        .hr-pin-sel { background: ${PINK}; outline: 2px solid #fff; } .hr-pin-sel::after { border-top-color: ${PINK}; }
        .hr-pin-dim { opacity: .45; font-size: 12px; padding: 5px 8px; }
        .hr-pin-focus { background: rgba(253,1,79,.72); font-size: 11.5px; font-weight: 700; padding: 4px 8px; border-radius: 6px; outline: 1.5px solid rgba(255,255,255,.9); box-shadow: 0 2px 8px rgba(253,1,79,.3); backdrop-filter: blur(1px); } .hr-pin-focus::after { border-top-color: rgba(253,1,79,.72); }
        .hr-dist { transform: translate(-50%, -50%); display: inline-flex; align-items: center; gap: 3px; background: rgba(255,255,255,.88); border: 1.5px solid; border-radius: 999px; padding: 1px 6px; font: 700 10.5px/1.3 Figtree, Inter, system-ui, sans-serif; white-space: nowrap; box-shadow: 0 1px 3px rgba(15,23,42,.18); cursor: pointer; }
        .hr-dist:hover, .hr-dist-strong { background: #fff; font-size: 11.5px; z-index: 1; }
        .hr-tip { font: 12px/1.35 Figtree, Inter, system-ui, sans-serif; padding: 5px 8px; border-radius: 8px; }
        .hr-centre { transform: translate(-14px, -28px); display: flex; flex-direction: column; align-items: center; gap: 2px; font: 700 12px/1 Figtree, Inter, system-ui, sans-serif; color: #D70143; white-space: nowrap; filter: drop-shadow(0 2px 3px rgba(15,23,42,.35)); }
        .hr-centre b { background: rgba(255,255,255,.95); padding: 3px 8px; border-radius: 999px; }
        .leaflet-popup-content-wrapper { border-radius: 10px; padding: 0; overflow: hidden; } .leaflet-popup-content { margin: 0; }
        .hr-poi { width: 26px; height: 26px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(15,23,42,.35); display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .hr-poi-pop { font: 12.5px/1.3 Figtree, Inter, system-ui, sans-serif; padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; } .hr-poi-pop span { font-size: 11px; font-weight: 600; }
      `}</style>
    </div>
  );
}

// ─── Overview panel: the hotels on the map ───
function HotelList({ hotels, ctx, onPick }) {
  return (
    <>
      <div className="px-3 py-2.5 border-b border-divider shrink-0">
        <div className="text-[14px] font-bold">Hotels on the map</div>
        <div className="text-[12px] text-sub">Pick one to see the airport, meeting points, food and activities around it</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {hotels.length === 0 && <div className="p-4 text-[13px] text-sub">No hotels match these filters.</div>}
        {hotels.map((h) => {
          const r = lowest(h);
          const sel = h.id === ctx.currentId;
          const near = nearest(h.city, "meeting", h.coords, 1)[0];
          return (
            <button key={h.id} onClick={() => onPick(h.id)} className="w-full flex gap-2.5 px-3 py-2.5 border-b border-divider text-left hover:bg-[#F9FAFB] transition-colors group">
              <img src={h.photos[0].url} alt="" className="w-[64px] h-[64px] rounded-md object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-bold truncate group-hover:text-[#E31B53]">{h.name}</span>
                  {sel && <span className="text-[10px] font-bold text-white bg-[#E31B53] rounded px-1 shrink-0">SELECTED</span>}
                </div>
                <div className="text-[11.5px] text-sub flex items-center gap-1">
                  <span className="text-[#FDB022]">{"★".repeat(h.stars)}</span>
                  <span className="text-white bg-[#003580] rounded px-1 font-bold">{h.ratings.booking.score.toFixed(1)}</span>
                  <span className="truncate">{h.neighbourhood}</span>
                </div>
                {near && <div className="text-[11.5px] text-sub truncate">📍 {fmtKm(near.km)} to meeting point</div>}
                <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>{inr(r.pricing.selling_price * ctx.nights)} <span className="text-[11px] font-medium text-sub">({ctx.nights} nights)</span></div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Focus panel: one hotel and everything around it ───
function FocusPanel({ h, ctx, around, picked, setPicked, onBack, onOpenDetails }) {
  const r = lowest(h);
  const sel = h.id === ctx.currentId;
  const lat = h.coords.lat.toFixed(5), lng = h.coords.lng.toFixed(5);
  const [open, setOpen] = useState({ airport: true, meeting: true, transit: true, food: true, activity: true });
  return (
    <>
      <div className="shrink-0 border-b border-divider">
        <button onClick={onBack} className="flex items-center gap-1 px-3 pt-2.5 text-[12.5px] font-semibold" style={{ color: "var(--accent)" }}><ChevronLeft size={15} /> All hotels</button>
        <div className="flex gap-2.5 px-3 py-2.5">
          <img src={h.photos[0].url} alt="" className="w-[76px] h-[76px] rounded-md object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-bold leading-tight">{h.name}</div>
            <div className="text-[11.5px] text-sub flex items-center gap-1 mt-0.5">
              <span className="text-[#FDB022]">{"★".repeat(h.stars)}</span>
              <span className="text-white bg-[#003580] rounded px-1 font-bold">{h.ratings.booking.score.toFixed(1)}</span>
              {h.ratings.booking.count.toLocaleString("en-IN")} reviews
            </div>
            <div className="text-[14px] font-extrabold mt-0.5" style={{ color: NAVY }}>{inr(r.pricing.selling_price * ctx.nights)} <span className="text-[11px] font-medium text-sub">({ctx.nights} nights)</span></div>
            <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-sub hover:underline inline-flex items-center gap-1">📍 {lat}, {lng} <ExternalLink size={10} /></a>
          </div>
        </div>
        <div className="flex gap-2 px-3 pb-2.5">
          <button onClick={() => ctx.book?.(h)} title={sel ? "Click again to unselect" : "Choose this hotel for the itinerary"} className="group/sel flex-1 h-8 rounded-full text-[12.5px] font-bold border" style={{ borderColor: "#E31B53", background: sel ? "#E31B53" : "#fff", color: sel ? "#fff" : "#E31B53" }}>{sel ? <><span className="group-hover/sel:hidden">✓ Selected</span><span className="hidden group-hover/sel:inline">✕ Unselect</span></> : "Select"}</button>
          <button onClick={onOpenDetails} className="flex-1 h-8 rounded-full text-[12.5px] font-semibold bg-[#F2F4F7] hover:bg-[#E4E7EC]">View details ›</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-2">
        <div className="px-3 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wide text-sub">Distance from this hotel</div>
        {ORDER.map((kind) => {
          const list = around[kind] || [];
          if (!list.length) return null;
          const k = KINDS[kind];
          return (
            <div key={kind} className="px-2">
              <button onClick={() => setOpen((o) => ({ ...o, [kind]: !o[kind] }))} className="w-full flex items-center gap-2 px-1.5 py-1.5 text-[12.5px] font-bold">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: k.colour }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" width="11" height="11" fill="#fff">${GLYPH[kind]}</svg>` }} />
                {k.label} <span className="text-sub font-normal">{list.length}</span>
                <ChevronDown size={13} className={`ml-auto text-sub ${open[kind] ? "rotate-180" : ""}`} />
              </button>
              {open[kind] && list.map((p, i) => {
                const on = picked === placeKey(p);
                return (
                  <button key={p.name} onClick={() => setPicked(on ? null : placeKey(p))}
                    className="w-full flex items-start gap-2 pl-8 pr-1.5 py-1 rounded-md text-left text-[12.5px] hover:bg-[#F9FAFB]"
                    style={{ background: on ? `${k.colour}14` : undefined, outline: on ? `1.5px solid ${k.colour}` : "none" }}>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{p.name.replace(/^Meeting point · /, "")}{i === 0 && <span className="ml-1 text-[10px] font-bold uppercase" style={{ color: k.colour }}>nearest</span>}</span>
                    </span>
                    <span className="text-right shrink-0 text-sub whitespace-nowrap"><b className="text-head">{fmtKm(p.km)}</b> · {p.min} min {p.mode}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Filters along the bottom of the map: same state as the list's left column ───
function FilterBar({ f, set, range, count }) {
  const max = f.max || range[1];
  const active = f.type.length + f.refund.length + f.stars.length + (f.max ? 1 : 0) + (f.nearTransit ? 1 : 0) + (f.nearMeeting ? 1 : 0);
  return (
    <div className="absolute left-3 right-3 bottom-3 z-[500] flex items-center gap-2 flex-wrap bg-white/95 backdrop-blur border border-divider rounded-xl px-3 py-2 shadow-lg" style={{ fontFamily: "Figtree, Inter, system-ui, sans-serif" }}>
      <Dropdown label="Hotel Type" options={TYPE_OPTS} value={f.type} onToggle={(x) => set({ ...f, type: toggle(f.type, x) })} />
      <Dropdown label="Room Type" options={["Refundable", "Non Refundable"]} value={f.refund} onToggle={(x) => set({ ...f, refund: toggle(f.refund, x) })} />
      <Dropdown label="Star Rating" options={[5, 4, 3]} render={(n) => <span>{n} Star <span className="text-[#FDB022]">{"★".repeat(n)}</span></span>} value={f.stars} onToggle={(x) => set({ ...f, stars: toggle(f.stars, x) })} />
      <Dropdown label="Distance" badge={[f.nearTransit && `🚌 ${fmtM(f.nearTransit)}`, f.nearMeeting && `📍 ${fmtM(f.nearMeeting)}`].filter(Boolean).join(" · ")} value={[]} wide>
        <div className="p-2"><DistanceRows f={f} set={set} compact /></div>
      </Dropdown>
      <div className="flex items-center gap-2 pl-2 border-l border-divider">
        <span className="text-[12.5px] font-semibold text-head whitespace-nowrap">Price <span className="text-sub font-normal">(per night)</span></span>
        <span className="text-[12.5px] text-sub whitespace-nowrap">₹0 – {inr(max)}</span>
        <input type="range" min={0} max={range[1]} step={100} value={max} onChange={(e) => set({ ...f, max: +e.target.value === range[1] ? 0 : +e.target.value })} className="w-[160px]" style={{ accentColor: "var(--accent)" }} />
      </div>
      <span className="ml-auto text-[12.5px] text-sub whitespace-nowrap">{count} hotel{count === 1 ? "" : "s"} shown</span>
      {active > 0 && (
        <button onClick={() => set({ ...f, type: [], refund: [], stars: [], min: 0, max: 0, nearTransit: 0, nearMeeting: 0 })} className="text-[12.5px] font-semibold whitespace-nowrap" style={{ color: "var(--accent)" }}>Clear</button>
      )}
    </div>
  );
}

function Dropdown({ label, options = [], value = [], onToggle, render, children, badge, wide }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const n = badge ? 1 : value.length;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="h-8 px-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold border bg-white whitespace-nowrap"
        style={{ borderRadius: "var(--rp)", borderColor: n ? "var(--accent)" : "#D5D7DA", color: n ? "var(--accent-ink)" : "#181D27", background: n ? "var(--accent-soft)" : "#fff" }}>
        {label}{badge ? <span className="text-[11px] font-semibold" style={{ color: "var(--accent-ink)" }}>{badge}</span> : n > 0 && <span className="text-[11px] text-white rounded-full px-1.5" style={{ background: "var(--accent)" }}>{n}</span>}<ChevronDown size={13} className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div className={`absolute bottom-full mb-1.5 left-0 ${wide ? "min-w-[300px]" : "min-w-[180px]"} bg-white border border-divider rounded-lg shadow-xl p-1.5 z-10`}>
          {children}
          {options.map((o) => {
            const on = value.includes(o);
            return (
              <button key={o} onClick={() => onToggle(o)} className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded hover:bg-surface text-left">
                <span className="w-4 h-4 border rounded flex items-center justify-center shrink-0" style={{ borderColor: on ? "var(--accent)" : "#D5D7DA", background: on ? "var(--accent)" : "#fff" }}>{on && <Check size={11} color="#fff" strokeWidth={3} />}</span>
                {render ? render(o) : o}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
