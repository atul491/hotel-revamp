import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, ChevronDown, ChevronLeft, Check, ExternalLink, Search, MapPin } from "lucide-react";
import { inr, Ico, amenityIcon } from "./kit";
import { PLACES, KINDS, nearest, fmtKm, findPlace, placeName, span, tripText, trip, tripLegs } from "./data/places";
import { PlacePicker, ReachTag, clearNear } from "./blocks/NearPlace";
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
// Hover card for a place: name, kind, a one-line "what it is / famous for", and the distance when measured from a hotel.
function tipHtml(p, d) {
  const k = KINDS[p.kind];
  return `<div class="hr-tipcard"><b>${p.name.replace(/^Meeting point · /, "")}</b>`
    + `<span class="hr-tipkind" style="color:${k.colour}">${k.label.replace(/s$/, "")}${p.trailix ? " · Trailix activity" : ""}</span>`
    + (p.about ? `<span class="hr-tipabout">${p.about}</span>` : "")
    + (d && d.km != null ? `<span class="hr-tipdist">${tripText(d)} · ${fmtKm(d.km)} from the hotel${d.via ? ` (fast boat from ${d.via})` : ""}${d.road ? "" : " · straight line"}</span>` : "")
    + `</div>`;
}

// Strava-style route icon: a winding path from a hollow start dot to a solid finish dot.
function RouteIco({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5.5 18.5c2.5 0 3-2.2 4.4-4.6 1.3-2.2 2.7-1.7 3.8-.2 1.2 1.6 2.6 1.6 3.4-.6.8-2.1-.4-3.4-2.1-4.2-1.6-.8-1.9-2.4-.6-3.4" />
      <circle cx="4.2" cy="18.6" r="2" fill="none" />
      <circle cx="15.4" cy="4.6" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TYPE_OPTS = ["Private", "SIC", "Gold", "Silver", "Bronze"];
const SHORT = { airport: "Airport", transit: "Metro / bus stand", meeting: "Meeting", activity: "Activities", food: "Food" };
const toggle = (arr, x) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);

export default function MapOverlay({ city, centre, hotels, ctx, onClose, onSelected, onOpenDetails, filters, setFilters, priceRange }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const pinLayer = useRef(null);
  const lineLayer = useRef(null);
  const placeLayers = useRef({});
  const placeMarkers = useRef([]);
  const tileRef = useRef(null);
  const centreRef = useRef(null);
  const outlineRef = useRef(null);
  // "stops" = street map with every place; "route" = plain canvas with only the hotel, the places and the lines.
  const [view, setView] = useState("stops");
  const [show, setShow] = useState(Object.fromEntries(Object.keys(KINDS).map((k) => [k, true])));
  // Open focused on the hotel already selected for this city, if it is in the list.
  const [focusId, setFocusId] = useState(() => (hotels.some((h) => h.id === ctx.currentId && h.coords) ? ctx.currentId : null));
  const [picked, setPicked] = useState(null); // place row clicked in the focus panel
  const focus = hotels.find((h) => h.id === focusId && h.coords) || null;
  // "Near a place" (overview only): any landmark, activity, food place or stop, plus a radius (0 = any distance).
  // Shared with the list's filters: the list already arrives filtered, sorted and with each hotel's distance.
  const anchor = findPlace(city, filters?.near);
  const radius = filters?.nearR || 0;
  const nearList = useMemo(() => {
    const hs = hotels.filter((h) => h.coords);
    return anchor ? [...hs].sort((a, b) => (a.near?.km ?? 1e9) - (b.near?.km ?? 1e9)) : hs;
  }, [hotels, anchor]);

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
    tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    // Outline base for Route view: land, sea and coastline, no labels, streets only as faint traces.
    outlineRef.current = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19, maxNativeZoom: 16,
      attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
    });
    centreRef.current = L.marker([centre.lat, centre.lng], {
      icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-centre"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="#D70143" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg><b>${city} centre</b></div>` }),
      interactive: false,
      zIndexOffset: -100,
    }).addTo(map);
    placeLayers.current = {};
    placeMarkers.current = [];
    Object.keys(KINDS).forEach((kind) => {
      const g = L.layerGroup();
      (PLACES[city] || []).filter((p) => p.kind === kind).forEach((p) => {
        const mk = L.marker([p.lat, p.lng], { icon: placeIcon(kind), zIndexOffset: -50 });
        placeMarkers.current.push({ mk, p });
        mk.bindTooltip(tipHtml(p), { direction: "top", offset: [0, -12], className: "hr-tip" })
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

  const route = view === "route" && !!focus;

  // Hover cards on the city's places: once a hotel is picked, they also say how far it is from that hotel.
  useEffect(() => {
    placeMarkers.current.forEach(({ mk, p }) => mk.setTooltipContent(tipHtml(p, focus ? trip(focus.coords, p) : null)));
  }, [focus, city]);

  // Legend toggles; route view draws its own places, so the street-map layers go.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.entries(placeLayers.current).forEach(([kind, g]) => {
      if (show[kind] && !route) { if (!map.hasLayer(g)) g.addTo(map); } else if (map.hasLayer(g)) map.removeLayer(g);
    });
  }, [show, city, route]);

  // Route view: no streets, no labels, no city centre — just a plain canvas.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    [tileRef.current, centreRef.current].forEach((l) => {
      if (!l) return;
      if (route) { if (map.hasLayer(l)) map.removeLayer(l); } else if (!map.hasLayer(l)) l.addTo(map);
    });
    const o = outlineRef.current;
    if (o) { if (route) { if (!map.hasLayer(o)) o.addTo(map); } else if (map.hasLayer(o)) map.removeLayer(o); }
  }, [route, city]);

  // ─── Hotel price pins: the focused one stands out, the rest fade ───
  useEffect(() => {
    const layer = pinLayer.current;
    if (!layer) return;
    layer.clearLayers();
    (focusId ? hotels : nearList).forEach((h) => {
      if (!h.coords) return;
      if (focusId && h.id !== focusId) return; // at hotel level, other hotels and their prices go
      const total = lowest(h).pricing.selling_price * ctx.nights;
      const isFocus = h.id === focusId;
      const cls = isFocus ? "hr-pin-focus" : focusId ? "hr-pin-dim" : h.id === ctx.currentId ? "hr-pin-sel" : "";
      const icon = isFocus && route
        ? L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-dest"><span class="hr-ring"></span><span class="hr-ring hr-ring2"></span><svg viewBox="0 0 24 24" width="34" height="34"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="${NAVY}" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg><b>${h.name}</b></div>` })
        : pin(isFocus ? `★ ${h.name}` : h.near && !focusId ? `${inr(total)}<span class="hr-pin-km">${fmtKm(h.near.km)}</span>` : inr(total), cls);
      L.marker([h.coords.lat, h.coords.lng], { icon, zIndexOffset: isFocus ? 2000 : h.id === ctx.currentId ? 1000 : 0 })
        .on("click", () => setFocusId(h.id))
        .addTo(layer);
    });
  }, [hotels, nearList, focusId, ctx.nights, ctx.currentId, city, route]);

  // ─── Lines from the focused hotel, and where the camera goes ───
  useEffect(() => {
    const map = mapRef.current, layer = lineLayer.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const padL = 372; // room for the left panel
    if (!focus) {
      let pts = [[centre.lat, centre.lng], ...hotels.filter((h) => h.coords).map((h) => [h.coords.lat, h.coords.lng])];
      if (anchor) {
        const a = [anchor.lat, anchor.lng], c = KINDS[anchor.kind].colour;
        if (radius) L.circle(a, { radius, color: c, weight: 1.5, fillColor: c, fillOpacity: 0.08, dashArray: "4 4", interactive: false }).addTo(layer);
        L.marker(a, { zIndexOffset: 1500, icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-anchor" style="background:${c}">${glyph(anchor.kind, 13)}<span>${anchor.name.replace(/^Meeting point · /, "")}</span></div>` }) }).addTo(layer);
        nearList.forEach((h) => L.polyline([a, [h.coords.lat, h.coords.lng]], { color: c, weight: 1.5, opacity: 0.6, dashArray: "3 5", interactive: false }).addTo(layer));
        pts = [a, ...nearList.map((h) => [h.coords.lat, h.coords.lng])];
        if (radius) { const b = L.latLng(a).toBounds(radius * 2); pts.push([b.getNorth(), b.getEast()], [b.getSouth(), b.getWest()]); }
      }
      // Wait a tick so the map knows its real size before framing.
      const t = setTimeout(() => { map.invalidateSize(); if (pts.length > 1) map.fitBounds(pts, { paddingTopLeft: [padL, 40], paddingBottomRight: [200, 90], maxZoom: 15 }); }, 80);
      return () => clearTimeout(t);
    }
    const from = [focus.coords.lat, focus.coords.lng];
    const nameOf = (p) => p.name.replace(/^Meeting point · /, "");
    // ─── Route view: a "route tree" ───
    // Roads that several trips share form the glowing main line; where a trip leaves it there is a
    // white junction dot, and the rest of the way is a dotted branch to the stop (pulse ring + bracket label).
    function drawTree(list, target) {
      const key = (q) => `${q[0].toFixed(5)},${q[1].toFixed(5)}`;
      const items = list.map((p) => ({ p, legs: tripLegs(focus.coords, p) || [{ kind: "car", path: [from, [p.lat, p.lng]] }] }));
      const uses = new Map();
      items.forEach(({ legs }) => {
        const seen = new Set();
        legs.filter((l) => l.kind !== "boat").forEach((l) => l.path.forEach((q) => { const k = key(q); if (!seen.has(k)) { seen.add(k); uses.set(k, (uses.get(k) || 0) + 1); } }));
      });
      const glow = (path, strong) => {
        L.polyline(path, { color: "#5B7CFF", weight: strong ? 16 : 12, opacity: 0.12, lineCap: "round", lineJoin: "round", interactive: false }).addTo(layer);
        L.polyline(path, { color: "#3D5AFE", weight: strong ? 5 : 3.5, opacity: 1, lineCap: "round", lineJoin: "round", interactive: false }).addTo(layer);
      };
      const dotted = (path, colour = "#6172A8") => L.polyline(path, { color: colour, weight: 3, opacity: 0.95, dashArray: "1 7", lineCap: "round", interactive: false }).addTo(layer);
      const junctions = new Set();
      items.forEach(({ p, legs }) => {
        const isT = !!target && placeKey(p) === placeKey(target);
        legs.forEach((leg) => {
          if (leg.path.length < 2) return;
          if (leg.kind === "boat") { dotted(leg.path, "#1570EF"); return; }
          const path = leg.path;
          let j = 0;
          for (let i = 0; i < path.length; i++) if ((uses.get(key(path[i])) || 0) > 1) j = i;
          const solid = p.kind === "airport" || isT || j >= path.length - 2;
          if (solid) { glow(path, isT); return; }
          if (j > 0) glow(path.slice(0, j + 1), false);
          dotted(path.slice(j));
          if (j > 0) junctions.add(key(path[j]) + "|" + path[j][0] + "|" + path[j][1]);
        });
      });
      junctions.forEach((v) => {
        const [, lat, lng] = v.split("|");
        L.marker([+lat, +lng], { interactive: false, zIndexOffset: 300, icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: '<div class="hr-junction"></div>' }) }).addTo(layer);
      });
      items.forEach(({ p }) => {
        const isT = !!target && placeKey(p) === placeKey(target);
        L.marker([p.lat, p.lng], { zIndexOffset: 400, icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-stop" style="--c:${KINDS[p.kind].colour}"><span class="hr-ring"></span><span class="hr-ring hr-ring2"></span><i>${glyph(p.kind, 11)}</i></div>` }) })
          .bindTooltip(tipHtml(p, p), { direction: "top", offset: [0, -14], className: "hr-tip" })
          .on("click", () => setPicked(placeKey(p))).addTo(layer);
        L.marker([p.lat, p.lng], { zIndexOffset: isT ? 950 : 600, icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-brk${isT ? " hr-brk-on" : ""}"><small>${nameOf(p)}</small><b>${span(p)}</b><em>${fmtKm(p.km)} · ${p.mode === "walk" ? "walk" : p.mode === "boat + drive" ? "car + boat" : "drive"}</em></div>` }) })
          .bindTooltip(tipHtml(p, p), { direction: "top", offset: [0, -10], className: "hr-tip" })
          .on("click", () => setPicked(placeKey(p))).addTo(layer);
      });
    }

    // Both views draw the same road route and the same label (time · distance, at the same spot on the road);
    // Stops keeps the street map and a lighter dashed line, Route is the clean Strava-style view.
    const line = (p, strong) => {
      const c = KINDS[p.kind].colour;
      const legs = tripLegs(focus.coords, p) || [{ kind: "car", path: [from, [p.lat, p.lng]] }];
      legs.forEach((leg) => {
        if (leg.path.length < 2) return;
        const boat = leg.kind === "boat";
        L.polyline(leg.path, route
          ? { color: boat ? "#1570EF" : c, weight: strong ? 5 : 3.5, opacity: strong ? 1 : 0.9, dashArray: boat ? "8 7" : leg.kind === "foot" ? "1 7" : null, lineCap: "round", lineJoin: "round", interactive: false }
          : { color: boat ? "#1570EF" : c, weight: strong ? 4.5 : 2.5, opacity: strong ? 0.95 : 0.75, dashArray: strong && !boat ? null : "6 6", lineCap: "round", lineJoin: "round", interactive: false },
        ).addTo(layer);
      });
      const along = legs.reduce((a, b) => (b.path.length > a.path.length ? b : a)).path;
      if (route) {
        L.marker([p.lat, p.lng], { icon: placeIcon(p.kind), zIndexOffset: 400 })
          .bindTooltip(tipHtml(p, p), { direction: "top", offset: [0, -12], className: "hr-tip" })
          .on("click", () => setPicked(placeKey(p)))
          .addTo(layer);
        L.marker([p.lat, p.lng], { interactive: false, icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-rname">${nameOf(p)}</div>` }) }).addTo(layer);
      }
      // Label halfway along the road; the airport's stays about 1 km out from the hotel so it is in view.
      const t = p.kind === "airport" ? Math.min(0.5, 1.1 / p.km) : 0.5;
      const at = along.length > 2 ? along[Math.min(along.length - 1, Math.round((along.length - 1) * t))] : [from[0] + (p.lat - from[0]) * t, from[1] + (p.lng - from[1]) * t];
      const text = `${glyph(p.kind, 11, route ? c : c)}${span(p)} · ${fmtKm(p.km)}`;
      L.marker(at, {
        zIndexOffset: strong ? 900 : 500,
        icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: route
          ? `<div class="hr-dist hr-dist-route${strong ? " hr-dist-strong" : ""}">${text}</div>`
          : `<div class="hr-dist${strong ? " hr-dist-strong" : ""}" style="border-color:${c};color:${c}">${text}</div>` }),
      })
        .bindTooltip(tipHtml(p, p), { direction: "top", offset: [0, -10], className: "hr-tip" })
        .on("click", () => setPicked(placeKey(p)))
        .addTo(layer);
    };
    // Every place of each kind that is switched on in the bottom bar.
    const drawn = ORDER.flatMap((k) => around[k] || []).filter((p) => show[p.kind]);
    const target = picked ? Object.values(around).flat().find((p) => placeKey(p) === picked) : null;
    // Activities first, then food, bus stands and meeting points on top (they share roads); the picked one last.
    if (route) drawTree(drawn, target);
    else {
      [...drawn].reverse().forEach((p) => { if (!target || placeKey(p) !== placeKey(target)) line(p, false); });
      if (target) line(target, true);
    }
    // Frame everything drawn except the airport (it is far); a picked row frames just that pair.
    const near = drawn.filter((p) => p.kind !== "airport");
    const pts = [from, ...(target ? [[target.lat, target.lng]] : near.map((p) => [p.lat, p.lng]))];
    const tm = setTimeout(() => { map.invalidateSize(); map.fitBounds(pts, { paddingTopLeft: [padL, 60], paddingBottomRight: [200, 100], maxZoom: target ? 15 : 16 }); }, 80);
    return () => clearTimeout(tm);
  }, [focus, around, picked, hotels, centre, show, route, anchor, radius, nearList]);

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
          <div className="absolute left-3 top-3 bottom-[64px] w-[340px] z-[500] bg-white border border-divider rounded-xl shadow-lg flex flex-col overflow-hidden" style={{ fontFamily: "Figtree, Inter, system-ui, sans-serif" }}>
            {focus ? (
              <FocusPanel h={focus} ctx={ctx} around={around} picked={picked} setPicked={setPicked}
                onSelect={() => { const was = focus.id === ctx.currentId; ctx.book?.(focus); if (!was) onSelected?.(focus.id); }}
                onBack={() => setFocusId(null)} onOpenDetails={() => onOpenDetails?.(focus.id)} />
            ) : (
              <HotelList hotels={nearList} ctx={ctx} onPick={setFocusId} city={city} anchor={anchor} f={filters} set={setFilters} />
            )}
          </div>

          {filters && <FilterBar f={filters} set={setFilters} range={priceRange} count={focus ? shown.length : nearList.length}
            show={show} setShow={setShow} route={view === "route"} canRoute={!!focus} toggleRoute={() => setView((v) => (v === "route" ? "stops" : "route"))} />}
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
        .hr-dist-route, .hr-dist-route:hover, .hr-dist-route.hr-dist-strong { background: ${NAVY}; color: #fff; border: 1.5px solid #fff; font-size: 11.5px; padding: 3px 9px; box-shadow: 0 2px 6px rgba(15,23,42,.3); }
        .hr-rname { transform: translate(-50%, 16px); background: #fff; color: ${NAVY}; font: 700 11px/1.2 Figtree, Inter, system-ui, sans-serif; padding: 3px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 1px 4px rgba(15,23,42,.2); pointer-events: none; }
        .hr-pin-km { margin-left: 6px; padding-left: 6px; border-left: 1px solid rgba(255,255,255,.35); font-weight: 500; font-size: 11.5px; opacity: .9; }
        .hr-anchor { transform: translate(-13px, -13px); display: inline-flex; align-items: center; gap: 5px; color: #fff; font: 700 12px/1 Figtree, Inter, system-ui, sans-serif; padding: 6px 10px 6px 7px; border-radius: 999px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(15,23,42,.35); white-space: nowrap; }
        .z-\\[70\\] .leaflet-bottom { bottom: 50px; }
        .hr-dest { position: relative; transform: translate(-17px, -34px); display: flex; flex-direction: column; align-items: center; }
        .hr-dest svg { position: relative; filter: drop-shadow(0 3px 4px rgba(24,30,76,.35)); }
        .hr-dest b { margin-top: 2px; background: #fff; color: ${NAVY}; font: 700 11.5px/1.2 Figtree, Inter, system-ui, sans-serif; padding: 3px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 1px 4px rgba(15,23,42,.2); }
        .hr-dest .hr-ring { position: absolute; left: 50%; top: 30px; width: 44px; height: 18px; margin: -9px 0 0 -22px; border: 2px solid #3D5AFE; border-radius: 50%; opacity: .55; animation: hr-pulse 2.2s ease-out infinite; }
        .hr-stop { position: relative; transform: translate(-50%, -50%); width: 22px; height: 22px; }
        .hr-stop i { position: absolute; inset: 0; border-radius: 50%; background: var(--c); border: 2px solid #fff; box-shadow: 0 1px 4px rgba(15,23,42,.35); display: flex; align-items: center; justify-content: center; }
        .hr-stop .hr-ring { position: absolute; left: 50%; top: 50%; width: 34px; height: 34px; margin: -17px 0 0 -17px; border: 2px solid var(--c); border-radius: 50%; opacity: .5; animation: hr-pulse 2.2s ease-out infinite; }
        .hr-ring2 { animation-delay: 1.1s !important; }
        @keyframes hr-pulse { 0% { transform: scale(.6); opacity: .6; } 100% { transform: scale(1.7); opacity: 0; } }
        .hr-junction { transform: translate(-50%, -50%); width: 14px; height: 9px; border-radius: 50%; background: #fff; border: 1.5px solid #C7CEE8; box-shadow: 0 2px 3px rgba(24,30,76,.3); }
        .hr-brk { position: relative; transform: translate(14px, calc(-100% - 10px)); padding: 4px 10px 5px; font-family: Figtree, Inter, system-ui, sans-serif; color: ${NAVY}; background: rgba(255,255,255,.82); white-space: nowrap; cursor: pointer; display: flex; flex-direction: column; line-height: 1.15; border-left: 1.5px solid #8A94B8; border-right: 1.5px solid #8A94B8; }
        .hr-brk { border-image: linear-gradient(to bottom, #8A94B8 0 6px, transparent 6px calc(100% - 6px), #8A94B8 calc(100% - 6px)) 1; }
        .hr-brk small { font-size: 9.5px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: #667085; max-width: 160px; overflow: hidden; text-overflow: ellipsis; }
        .hr-brk b { font-size: 15px; font-weight: 600; }
        .hr-brk em { font-style: normal; font-size: 10.5px; color: #667085; }
        .hr-brk:hover, .hr-brk-on { background: #fff; box-shadow: 0 2px 8px rgba(24,30,76,.15); }
        .hr-brk-on b { color: #3D5AFE; }
        .hr-tipcard { display: flex; flex-direction: column; gap: 2px; width: 230px; white-space: normal; }
        .hr-tipkind { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; }
        .hr-tipabout { color: #475467; font-size: 12px; line-height: 1.35; }
        .hr-tipdist { color: #181e4c; font-weight: 700; font-size: 11.5px; margin-top: 1px; }
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
const RADII = [0, 500, 1000, 2000, 5000];
const PICK_ORDER = ["activity", "food", "transit", "meeting", "airport"];

function HotelList({ hotels, ctx, onPick, city, anchor, f, set }) {
  const name = (p) => placeName(p);
  return (
    <>
      <div className="px-3 py-2.5 border-b border-divider shrink-0">
        <div className="text-[14px] font-bold">Hotels on the map</div>
        <div className="text-[12px] text-sub">Pick one to see the airport, meeting points, food and activities around it</div>
        {f && set && (
          <div className="mt-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-sub mb-1">Near a place</div>
            <PlacePicker city={city} f={f} set={set} count={hotels.length} accent={NAVY} />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {hotels.length === 0 && <div className="p-4 text-[13px] text-sub">{anchor ? <>No hotels this close to {name(anchor)}. Try a bigger distance.</> : "No hotels match these filters."}</div>}
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
                {h.near ? (
                  <div className="flex items-center gap-1.5 min-w-0"><span className="text-[11.5px] font-semibold truncate" style={{ color: KINDS[h.near.place.kind].colour }}>{tripText(h.near)} · {fmtKm(h.near.km)} to {name(h.near.place)}</span><ReachTag d={h.near} /></div>
                ) : near && <div className="flex items-center gap-1.5 min-w-0"><span className="text-[11.5px] text-sub truncate">📍 {fmtKm(near.km)} to meeting point</span><ReachTag d={near} /></div>}
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
function FocusPanel({ h, ctx, around, picked, setPicked, onBack, onOpenDetails, onSelect }) {
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
          <button onClick={onSelect} title={sel ? "Click again to unselect" : "Select this hotel and go to its rooms to pick the room"} className="group/sel flex-1 h-8 rounded-full text-[12.5px] font-bold border" style={{ borderColor: "#E31B53", background: sel ? "#E31B53" : "#fff", color: sel ? "#fff" : "#E31B53" }}>{sel ? <><span className="group-hover/sel:hidden">✓ Selected</span><span className="hidden group-hover/sel:inline">✕ Unselect</span></> : "Select"}</button>
          <button onClick={onOpenDetails} className="flex-1 h-8 rounded-full text-[12.5px] font-semibold bg-[#F2F4F7] hover:bg-[#E4E7EC]">View details ›</button>
        </div>
        <div className="px-3 pb-2.5 -mt-1">
          <a href={h.ib.google_map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name}, ${h.city || ""}, Bali`)}`} target="_blank" rel="noopener noreferrer"
            title="Open this hotel in Google Maps (new tab)"
            className="w-full h-8 rounded-full text-[12.5px] font-semibold border border-divider hover:border-[#98A2B3] hover:bg-[#F9FAFB] inline-flex items-center justify-center gap-1.5 text-head">
            <MapPin size={13} style={{ color: "#1A73E8" }} /> Open in Google Maps <ExternalLink size={11} className="text-sub" />
          </a>
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
                  <button key={p.name} onClick={() => setPicked(on ? null : placeKey(p))} title={p.about || undefined}
                    className="w-full flex items-start gap-2 pl-8 pr-1.5 py-1 rounded-md text-left text-[12.5px] hover:bg-[#F9FAFB]"
                    style={{ background: on ? `${k.colour}14` : undefined, outline: on ? `1.5px solid ${k.colour}` : "none" }}>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{p.name.replace(/^Meeting point · /, "")}{i === 0 && <span className="ml-1 text-[10px] font-bold uppercase" style={{ color: k.colour }}>nearest</span>}</span>
                    </span>
                    <span className="text-right shrink-0 text-sub whitespace-nowrap flex flex-col items-end gap-0.5"><span>{tripText(p)} · <b className="text-head">{fmtKm(p.km)}</b></span><ReachTag d={p} /></span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <AmenityDock h={h} />
    </>
  );
}

// ─── Amenities, fixed at the bottom of the hotel card: answer "does it have…?" without leaving the map ───
function AmenityDock({ h }) {
  const [all, setAll] = useState(false);
  const r = lowest(h);
  const rate = [r.board_basis?.description, ...(h.ib.inclusions || []).filter((i) => !/breakfast/i.test(i))].filter(Boolean);
  const top = (h.facilityTop || []).map((f) => f.label);
  const groups = (h.facilityGroups || []).filter((g) => g.items.length);
  return (
    <div className="shrink-0 border-t-2 border-divider bg-[#FCFCFD] flex flex-col" style={{ maxHeight: all ? "55%" : 168 }}>
      <div className="flex items-center gap-2 px-3 pt-2 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-sub">Amenities</span>
        {groups.length > 0 && (
          <button onClick={() => setAll((x) => !x)} className="ml-auto text-[11.5px] font-bold hover:underline" style={{ color: PINK }}>
            {all ? "Show less" : `All ${groups.reduce((n, g) => n + g.items.length, 0)} ›`}
          </button>
        )}
      </div>
      <div className="overflow-y-auto px-3 pb-2.5 space-y-2">
        {rate.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-sub mb-1">In this rate</div>
            <div className="flex flex-wrap gap-1">
              {rate.map((x) => <span key={x} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#027A48] bg-[#ECFDF3] rounded-md px-1.5 py-0.5"><Ico name={amenityIcon(x).icon} size={12} />{x}</span>)}
            </div>
          </div>
        )}
        {!all ? (
          <div className="flex flex-wrap gap-1">
            {top.map((x) => <span key={x} className="inline-flex items-center gap-1 text-[11.5px] font-medium text-head bg-white border border-divider rounded-md px-1.5 py-0.5"><Ico name={amenityIcon(x).icon} size={12} />{x}</span>)}
          </div>
        ) : groups.map((g) => (
          <div key={g.key || g.title}>
            <div className="text-[11.5px] font-bold text-head mb-0.5">{g.title}</div>
            <div className="text-[11.5px] text-sub leading-snug">
              {g.items.map((i, n) => <span key={i.label}>{i.label}{i.note ? <span className="text-[#98A2B3]"> ({i.note})</span> : null}{n < g.items.length - 1 ? " · " : ""}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Filters along the bottom of the map: same state as the list's left column ───
function FilterBar({ f, set, range, count, show, setShow, route, canRoute, toggleRoute }) {
  const max = f.max || range[1];
  const active = f.type.length + f.refund.length + f.stars.length + (f.max ? 1 : 0) + (f.nearTransit ? 1 : 0) + (f.nearMeeting ? 1 : 0);
  return (
    <div className="absolute left-0 right-0 bottom-0 z-[500] flex items-center gap-2 flex-wrap bg-white border-t border-divider px-3 py-2 shadow-[0_-2px_8px_rgba(15,23,42,.08)]" style={{ fontFamily: "Figtree, Inter, system-ui, sans-serif" }}>
      <Dropdown label="Hotel Type" options={TYPE_OPTS} value={f.type} onToggle={(x) => set({ ...f, type: toggle(f.type, x) })} />
      <Dropdown label="Room Type" options={["Refundable", "Non Refundable"]} value={f.refund} onToggle={(x) => set({ ...f, refund: toggle(f.refund, x) })} />
      <Dropdown label="Star Rating" options={[5, 4, 3]} render={(n) => <span>{n} Star <span className="text-[#FDB022]">{"★".repeat(n)}</span></span>} value={f.stars} onToggle={(x) => set({ ...f, stars: toggle(f.stars, x) })} />
      <Dropdown label="Distance" badge={[f.nearTransit && `🚌 ${fmtM(f.nearTransit)}`, f.nearMeeting && `📍 ${fmtM(f.nearMeeting)}`].filter(Boolean).join(" · ")} value={[]} wide>
        <div className="p-2"><DistanceRows f={f} set={set} compact /></div>
      </Dropdown>
      <div className="flex items-center gap-2 pl-2 border-l border-divider">
        <span className="text-[12.5px] font-semibold text-head whitespace-nowrap" title="Per night">Price</span>
        <span className="text-[12.5px] text-sub whitespace-nowrap">₹0 – {inr(max)}</span>
        <input type="range" min={0} max={range[1]} step={100} value={max} onChange={(e) => set({ ...f, max: +e.target.value === range[1] ? 0 : +e.target.value })} className="w-[110px]" style={{ accentColor: "var(--accent)" }} />
      </div>
      {/* What's drawn on the map: each kind toggles on / off */}
      {show && (
        <div className="flex items-center gap-1 pl-2 border-l border-divider">
          <span className="text-[11px] font-bold uppercase tracking-wide text-sub mr-0.5">Show</span>
          {Object.entries(KINDS).map(([kind, k]) => (
            <button key={kind} onClick={() => setShow((x) => ({ ...x, [kind]: !x[kind] }))} title={`${show[kind] ? "Hide" : "Show"} ${k.label.toLowerCase()}`}
              className="flex items-center gap-1 h-7 px-2 rounded-full border text-[12px] font-semibold whitespace-nowrap transition-colors"
              style={{ borderColor: show[kind] ? k.colour : "#E9EAEB", background: show[kind] ? `${k.colour}14` : "#fff", color: show[kind] ? "#181D27" : "#98A2B3" }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: show[kind] ? k.colour : "#D0D5DD" }} /> {SHORT[kind]}
            </button>
          ))}
        </div>
      )}
      <span className="ml-auto text-[12.5px] text-sub whitespace-nowrap">{count} hotel{count === 1 ? "" : "s"}</span>
      {/* Route: plain outline map with only the hotel, its places and the distances. Click again to go back. */}
      {toggleRoute && (
        <button onClick={canRoute ? toggleRoute : undefined} disabled={!canRoute}
          title={canRoute ? (route ? "Back to the street map" : "Show only the routes from this hotel on a plain map") : "Pick a hotel first to see its routes"}
          className={`flex items-center gap-1.5 h-7 px-3 rounded-full border text-[12.5px] font-bold whitespace-nowrap transition-colors ${canRoute ? "" : "opacity-40 cursor-not-allowed"}`}
          style={route && canRoute ? { background: NAVY, borderColor: NAVY, color: "#fff" } : { borderColor: NAVY, color: NAVY, background: "#fff" }}>
          <RouteIco size={16} /> Route{route && canRoute && <Check size={12} strokeWidth={3} />}
        </button>
      )}
      {active > 0 && (
        <button onClick={() => set(clearNear({ ...f, type: [], refund: [], stars: [], min: 0, max: 0, nearTransit: 0, nearMeeting: 0 }))} className="text-[12.5px] font-semibold whitespace-nowrap" style={{ color: "var(--accent)" }}>Clear</button>
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

// ─── Small map at the top of the filter column (MakeMyTrip / Booking.com style) ───
// A still preview of the city with every hotel as a dot; clicking anywhere opens the full map.
export function MapCard({ city, centre, hotels, onOpen }) {
  const box = useRef(null);
  useEffect(() => {
    const map = L.map(box.current, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false })
      .setView([centre.lat, centre.lng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    const pts = hotels.filter((h) => h.coords).map((h) => [h.coords.lat, h.coords.lng]);
    pts.forEach((p) => L.circleMarker(p, { radius: 5, color: "#fff", weight: 1.5, fillColor: NAVY, fillOpacity: 1, interactive: false }).addTo(map));
    const t = setTimeout(() => { map.invalidateSize(); if (pts.length > 1) map.fitBounds(pts, { padding: [18, 18], maxZoom: 14, animate: false }); }, 60);
    return () => { clearTimeout(t); map.remove(); };
  }, [city, centre, hotels]);
  return (
    <button onClick={onOpen} title={`See ${city} hotels on a map`} className="group relative block w-full h-[132px] rounded-xl overflow-hidden border border-divider bg-white text-left">
      <div ref={box} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
      <span className="absolute left-3 right-3 bottom-3 z-[500] flex items-center justify-center gap-1.5 h-9 rounded-lg bg-white border-2 text-[13px] font-extrabold tracking-wide shadow-sm group-hover:shadow-md transition-shadow"
        style={{ borderColor: NAVY, color: NAVY }}>
        <MapPin size={15} /> EXPLORE ON MAP
      </span>
    </button>
  );
}
