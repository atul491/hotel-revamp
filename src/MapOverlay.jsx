import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
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

export default function MapOverlay({ city, centre, hotels, ctx, onClose }) {
  const box = useRef(null);

  useEffect(() => {
    const map = L.map(box.current, { zoomControl: true, attributionControl: true }).setView([centre.lat, centre.lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // City centre marker
    L.marker([centre.lat, centre.lng], {
      icon: L.divIcon({ className: "", iconSize: null, iconAnchor: [0, 0], html: `<div class="hr-centre"><span></span>${city} centre</div>` }),
      interactive: false,
      zIndexOffset: -100,
    }).addTo(map);

    const bounds = [[centre.lat, centre.lng]];
    hotels.forEach((h) => {
      if (!h.coords) return;
      const rate = h.rooms.flatMap((r) => r.rates).sort((a, b) => a.pricing.selling_price - b.pricing.selling_price)[0];
      const total = rate.pricing.selling_price * ctx.nights;
      const selected = h.id === ctx.currentId;
      const m = L.marker([h.coords.lat, h.coords.lng], { icon: pin(inr(total), selected), zIndexOffset: selected ? 1000 : 0 }).addTo(map);
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
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    setTimeout(() => map.invalidateSize(), 50);
    return () => map.remove();
  }, [city, centre, hotels, ctx.nights, ctx.currentId]);

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
        <div ref={box} className="flex-1 min-h-0" />
      </div>
      <style>{`
        .hr-pin { transform: translate(-50%, -100%); background: ${NAVY}; color: #fff; font: 600 13px/1 Figtree, Inter, system-ui, sans-serif; padding: 7px 10px; border-radius: 8px; white-space: nowrap; box-shadow: 0 2px 8px rgba(15,23,42,.35); position: relative; cursor: pointer; }
        .hr-pin::after { content: ""; position: absolute; left: 50%; bottom: -6px; transform: translateX(-50%); border: 6px solid transparent; border-top-color: ${NAVY}; border-bottom: 0; }
        .hr-pin:hover { background: ${PINK}; } .hr-pin:hover::after { border-top-color: ${PINK}; }
        .hr-pin-sel { background: ${PINK}; outline: 2px solid #fff; } .hr-pin-sel::after { border-top-color: ${PINK}; }
        .hr-centre { transform: translate(-50%, -50%); display: flex; align-items: center; gap: 6px; font: 600 12px/1 Figtree, Inter, system-ui, sans-serif; color: #181D27; background: rgba(255,255,255,.92); padding: 5px 9px; border-radius: 999px; white-space: nowrap; box-shadow: 0 1px 4px rgba(15,23,42,.25); }
        .hr-centre span { width: 10px; height: 10px; border-radius: 50%; background: ${PINK}; box-shadow: 0 0 0 4px rgba(253,1,79,.2); }
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
