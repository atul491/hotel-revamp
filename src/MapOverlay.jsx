import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, ChevronDown, Check } from "lucide-react";
import { inr } from "./kit";

// ─── Hotels on a map (Booking.com / MakeMyTrip style) ───
//
// Opens over the seller screen at 90% size, centred on the city centre. Every
// hotel in the current list gets a price pin (the same total shown on its row).
// Clicking a pin shows the hotel card with its Google coordinates and a link to
// Google Maps. Tiles come from OpenStreetMap, so no API key is needed.

const NAVY = "#181e4c";
const PINK = "#fd014f";

function pin(label, selected) {
  return L.divIcon({
    className: "",
    iconSize: null,
    iconAnchor: [0, 0],
    html: `<div class="hr-pin${selected ? " hr-pin-sel" : ""}">${label}</div>`,
  });
}

const TYPE_OPTS = ["Private", "SIC", "Gold", "Silver", "Bronze"];
const toggle = (arr, x) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);

export default function MapOverlay({ city, centre, hotels, ctx, onClose, filters, setFilters, priceRange }) {
  const box = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const fitted = useRef(false);

  // Map and tiles once; the centre marker never moves while the overlay is open.
  useEffect(() => {
    const map = L.map(box.current, { zoomControl: true, attributionControl: true }).setView([centre.lat, centre.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    L.marker([centre.lat, centre.lng], {
      icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-centre"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="#D70143" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="9" r="2.6" fill="#fff"/></svg><b>${city} centre</b></div>` }),
      interactive: false,
      zIndexOffset: -100,
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 50);
    return () => { map.remove(); mapRef.current = null; fitted.current = false; };
  }, [city, centre]);

  // Price pins follow the filtered list; the view is fitted only the first time.
  useEffect(() => {
    const map = mapRef.current, layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const bounds = [[centre.lat, centre.lng]];
    hotels.forEach((h) => {
      if (!h.coords) return;
      const rate = h.rooms.flatMap((r) => r.rates).sort((a, b) => a.pricing.selling_price - b.pricing.selling_price)[0];
      const total = rate.pricing.selling_price * ctx.nights;
      const selected = h.id === ctx.currentId;
      const m = L.marker([h.coords.lat, h.coords.lng], { icon: pin(inr(total), selected), zIndexOffset: selected ? 1000 : 0 }).addTo(layer);
      const lat = h.coords.lat.toFixed(5);
      const lng = h.coords.lng.toFixed(5);
      const stars = "★".repeat(h.stars);
      m.bindPopup(
        `<div class="hr-card">
          <img src="${h.photos[0].url}" alt="" />
          <div class="hr-body">
            <div class="hr-name">${h.name}</div>
            <div class="hr-meta"><span class="hr-stars">${stars}</span> <span class="hr-score">${h.ratings.booking.score.toFixed(1)}</span> ${h.ratings.booking.count.toLocaleString("en-IN")} reviews</div>
            <div class="hr-area">${h.neighbourhood} · ${h.distanceFromCenter} km from centre</div>
            <div class="hr-price">${inr(total)} <span>(${ctx.nights} nights) · ${inr(rate.pricing.selling_price)}/night</span></div>
            <div class="hr-coords">📍 ${lat}, ${lng}
              <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener noreferrer">Open in Google Maps ›</a>
            </div>
          </div>
        </div>`,
        { maxWidth: 360, minWidth: 340, closeButton: true, offset: [0, -34] },
      );
      bounds.push([h.coords.lat, h.coords.lng]);
    });
    if (!fitted.current && bounds.length > 1) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      fitted.current = true;
    }
  }, [hotels, ctx.nights, ctx.currentId, centre]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl" style={{ width: "90vw", height: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-divider shrink-0">
          <b className="text-[15px]">{city} on the map</b>
          <span className="text-[13px] text-sub">{hotels.filter((h) => h.coords).length} hotels · prices for {ctx.nights} nights · click a pin for details</span>
          <button onClick={onClose} className="ml-auto w-9 h-9 rounded-full hover:bg-surface flex items-center justify-center" title="Close map"><X size={18} /></button>
        </div>
        <div className="flex-1 min-h-0 relative">
          <div ref={box} className="absolute inset-0" />
          {filters && <FilterBar f={filters} set={setFilters} range={priceRange} count={hotels.length} />}
        </div>
      </div>
      <style>{`
        .hr-pin { transform: translate(-50%, -100%); background: ${NAVY}; color: #fff; font: 600 13px/1 Figtree, Inter, system-ui, sans-serif; padding: 7px 10px; border-radius: 8px; white-space: nowrap; box-shadow: 0 2px 8px rgba(15,23,42,.35); position: relative; cursor: pointer; }
        .hr-pin::after { content: ""; position: absolute; left: 50%; bottom: -6px; transform: translateX(-50%); border: 6px solid transparent; border-top-color: ${NAVY}; border-bottom: 0; }
        .hr-pin:hover { background: ${PINK}; } .hr-pin:hover::after { border-top-color: ${PINK}; }
        .hr-pin-sel { background: ${PINK}; outline: 2px solid #fff; } .hr-pin-sel::after { border-top-color: ${PINK}; }
        .hr-centre { transform: translate(-14px, -28px); display: flex; flex-direction: column; align-items: center; gap: 2px; font: 700 12px/1 Figtree, Inter, system-ui, sans-serif; color: #D70143; white-space: nowrap; filter: drop-shadow(0 2px 3px rgba(15,23,42,.35)); }
        .hr-centre b { background: rgba(255,255,255,.95); padding: 3px 8px; border-radius: 999px; }
        .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; } .leaflet-popup-content { margin: 0; }
        .hr-card { display: flex; gap: 12px; padding: 12px; width: 340px; box-sizing: border-box; font-family: Figtree, Inter, system-ui, sans-serif; color: #181D27; }
        .hr-card img { width: 104px; height: 104px; object-fit: cover; border-radius: 8px; flex: none; }
        .hr-body { min-width: 0; } .hr-name { font-size: 15px; font-weight: 700; line-height: 1.25; }
        .hr-meta { font-size: 12px; color: #535862; margin-top: 3px; display: flex; align-items: center; gap: 6px; } .hr-stars { color: #FDB022; letter-spacing: -1px; }
        .hr-score { background: #003580; color: #fff; font-weight: 700; padding: 2px 6px; border-radius: 6px 6px 6px 2px; }
        .hr-area { font-size: 12px; color: #535862; margin-top: 3px; }
        .hr-price { font-size: 17px; font-weight: 800; color: ${NAVY}; margin-top: 6px; } .hr-price span { font-size: 11.5px; font-weight: 500; color: #535862; }
        .hr-coords { font-size: 11.5px; color: #535862; margin-top: 6px; } .hr-coords a { display: block; color: ${PINK}; font-weight: 600; text-decoration: none; margin-top: 2px; }
      `}</style>
    </div>
  );
}

// ─── Filters along the bottom of the map: same state as the list's left column ───
function FilterBar({ f, set, range, count }) {
  const max = f.max || range[1];
  const active = f.type.length + f.refund.length + f.stars.length + (f.max ? 1 : 0);
  return (
    <div className="absolute left-3 right-3 bottom-3 z-[500] flex items-center gap-2 flex-wrap bg-white/95 backdrop-blur border border-divider rounded-xl px-3 py-2 shadow-lg" style={{ fontFamily: "Figtree, Inter, system-ui, sans-serif" }}>
      <Dropdown label="Hotel Type" options={TYPE_OPTS} value={f.type} onToggle={(x) => set({ ...f, type: toggle(f.type, x) })} />
      <Dropdown label="Room Type" options={["Refundable", "Non Refundable"]} value={f.refund} onToggle={(x) => set({ ...f, refund: toggle(f.refund, x) })} />
      <Dropdown label="Star Rating" options={[5, 4, 3]} render={(n) => <span>{n} Star <span className="text-[#FDB022]">{"★".repeat(n)}</span></span>} value={f.stars} onToggle={(x) => set({ ...f, stars: toggle(f.stars, x) })} />
      <div className="flex items-center gap-2 pl-2 border-l border-divider">
        <span className="text-[12.5px] font-semibold text-head whitespace-nowrap">Price <span className="text-sub font-normal">(per night)</span></span>
        <span className="text-[12.5px] text-sub whitespace-nowrap">₹0 – {inr(max)}</span>
        <input type="range" min={0} max={range[1]} step={100} value={max} onChange={(e) => set({ ...f, max: +e.target.value === range[1] ? 0 : +e.target.value })} className="w-[160px]" style={{ accentColor: "var(--accent)" }} />
      </div>
      <span className="ml-auto text-[12.5px] text-sub whitespace-nowrap">{count} hotel{count === 1 ? "" : "s"} shown</span>
      {active > 0 && (
        <button onClick={() => set({ ...f, type: [], refund: [], stars: [], min: 0, max: 0 })} className="text-[12.5px] font-semibold whitespace-nowrap" style={{ color: "var(--accent)" }}>Clear</button>
      )}
    </div>
  );
}

function Dropdown({ label, options, value, onToggle, render }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const n = value.length;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="h-8 px-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold border bg-white whitespace-nowrap"
        style={{ borderRadius: "var(--rp)", borderColor: n ? "var(--accent)" : "#D5D7DA", color: n ? "var(--accent-ink)" : "#181D27", background: n ? "var(--accent-soft)" : "#fff" }}>
        {label}{n > 0 && <span className="text-[11px] text-white rounded-full px-1.5" style={{ background: "var(--accent)" }}>{n}</span>}<ChevronDown size={13} className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div className="absolute bottom-full mb-1.5 left-0 min-w-[180px] bg-white border border-divider rounded-lg shadow-xl p-1.5 z-10">
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
