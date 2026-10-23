import { createContext, useContext } from "react";
import {
  Ban, Bath, BedDouble, ConciergeBell, Flower2, Footprints, Hammer, Heart, IdCard, Info, Languages, Leaf,
  LogIn, PawPrint, Plug, Shield, Sun, Trees, Umbrella, Users, Utensils, Wallet, Waves, Wifi, Star, Check, X,
  Car, Coffee, GlassWater, Wine, Dumbbell, Clock, Zap, Soup, BedSingle, Sparkles, LogOut, Image as ImageIcon, MapPin,
} from "lucide-react";
import { useDesign } from "./design";

export const ICONS = {
  ban: Ban, bath: Bath, bed: BedDouble, concierge: ConciergeBell, flower: Flower2, footprints: Footprints,
  hammer: Hammer, heart: Heart, idcard: IdCard, info: Info, languages: Languages, leaf: Leaf, login: LogIn,
  paw: PawPrint, plug: Plug, shield: Shield, sun: Sun, trees: Trees, umbrella: Umbrella, users: Users,
  utensils: Utensils, wallet: Wallet, waves: Waves, wifi: Wifi,
  car: Car, coffee: Coffee, water: GlassWater, wine: Wine, dumbbell: Dumbbell, clock: Clock, zap: Zap,
  soup: Soup, roomonly: BedSingle, sparkles: Sparkles, logout: LogOut,
};

// ─── Amenities as icons (same icon set and stroke as the detail page) ───
const AMENITY_RULES = [
  [/breakfast \+ dinner|half board|\bhb\b/i, "soup", "Breakfast + Dinner"],
  [/all inclusive/i, "soup", "All inclusive"],
  [/breakfast|\bbb\b/i, "utensils", "Breakfast"],
  [/room only|\bro\b/i, "roomonly", "Room only"],
  [/wifi/i, "wifi", "Free WiFi"],
  [/parking/i, "car", "Parking"],
  [/welcome drink/i, "wine", "Welcome drink"],
  [/coffee|tea/i, "coffee", "Coffee and tea"],
  [/water/i, "water", "Drinking water"],
  [/pool|beach/i, "waves", null],
  [/fitness|gym/i, "dumbbell", "Fitness centre"],
  [/early check-in|express check-in/i, "login", null],
  [/late check-?in/i, "clock", "Late check-in"],
  [/late check-?out/i, "logout", "Late check-out"],
  [/spa/i, "flower", "Spa"],
  [/honeymoon/i, "heart", "Honeymoon set-up"],
  [/rooftop/i, "sun", "Rooftop access"],
];
export function amenityIcon(label) {
  const hit = AMENITY_RULES.find(([re]) => re.test(label));
  return { icon: hit?.[1] || "sparkles", label: hit?.[2] || label };
}

export function AmenityIcons({ items, size = 15, well = true, max, onMore }) {
  const seen = new Set();
  const list = items.map((x) => ({ ...amenityIcon(x), raw: x })).filter((a) => !seen.has(a.raw) && seen.add(a.raw));
  const shown = max && list.length > max + 1 ? list.slice(0, max) : list; // never "+1 more"
  const rest = list.slice(shown.length);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {shown.map((a) => (
        <span key={a.raw} title={a.raw} aria-label={a.raw}
          className={`inline-flex items-center justify-center text-sub ${well ? "w-6 h-6 bg-surface" : ""}`}
          style={well ? { borderRadius: "var(--rw)" } : undefined}>
          <Ico name={a.icon} size={size} />
        </span>
      ))}
      {rest.length > 0 && (
        <button type="button" onClick={(e) => { if (onMore) { e.stopPropagation(); onMore(); } }}
          title="See all amenities" className="h-6 px-1.5 inline-flex items-center text-[11px] font-semibold text-sub bg-surface whitespace-nowrap hover:text-[#E31B53] hover:bg-[#FFF1F3] transition-colors"
          style={{ borderRadius: "var(--rw)" }}>
          +{rest.length} more
        </button>
      )}
    </span>
  );
}

export function Ico({ name, size = 16, ...rest }) {
  const C = ICONS[name] || Info;
  return <C size={size} strokeWidth={1.8} {...rest} />;
}

export const inr = (n) => `₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;

export function Stars({ n, size = 13, color = "#FBBC05" }) {
  return (
    <span className="inline-flex items-center gap-[1px]">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={size} fill={color} color={color} strokeWidth={0} />
      ))}
    </span>
  );
}

export function BookingB({ size = 16 }) {
  return (
    <span
      className="inline-flex items-center justify-center font-bold text-white"
      style={{ width: size, height: size, borderRadius: 3, background: "#003580", fontSize: size * 0.62 }}
    >
      B
    </span>
  );
}

const SRC = {
  sundays: { bg: "#FFE6ED", fg: "#C00840", t: "30S" },
  booking: { bg: "#003580", fg: "#fff", t: "B" },
  google: { bg: "#F4F7FE", fg: "#4285F4", t: "G" },
  tripadvisor: { bg: "#EDFBF5", fg: "#00AA6C", t: "TA" },
};
export function SourceLogo({ s, size = 18 }) {
  if (s === "sundays") return <img src={`${import.meta.env.BASE_URL}logo.png`} alt="30 Sundays" style={{ width: size, height: size, borderRadius: 4, objectFit: "contain" }} />;
  const c = SRC[s] || SRC.google;
  return (
    <span className="inline-flex items-center justify-center font-bold" style={{ width: size, height: size, borderRadius: 4, background: c.bg, color: c.fg, fontSize: size * 0.5 }}>
      {c.t}
    </span>
  );
}

export const SOURCE_NAME = { sundays: "30 Sundays", booking: "Booking.com", google: "Google", tripadvisor: "Tripadvisor" };

export function scoreColor(s) {
  return s >= 9 ? "#027A48" : s >= 8 ? "#0E9384" : "#B54708";
}

export function H2({ children, sub }) {
  return (
    <div className="mb-3">
      <h2 style={{ fontFamily: "var(--head-font)", fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>{children}</h2>
      {sub && <p className="text-[12.5px] text-sub mt-0.5">{sub}</p>}
    </div>
  );
}

export function Card({ children, className = "", style = {} }) {
  return (
    <div className={`bg-white border border-divider ${className}`} style={{ borderRadius: "var(--r)", boxShadow: "var(--shadow)", ...style }}>
      {children}
    </div>
  );
}

export function Pill({ children, active, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[12.5px] font-semibold border whitespace-nowrap ${className}`}
      style={{
        borderRadius: "var(--rp)",
        borderColor: active ? "var(--accent)" : "#E9EAEB",
        background: active ? "var(--accent-soft)" : "#fff",
        color: active ? "var(--accent-ink)" : "#535862",
      }}
    >
      {children}
    </button>
  );
}

export function Btn({ children, outline, className = "", onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-[14px] font-bold ${className}`}
      style={{
        borderRadius: "var(--rw)",
        background: outline ? "#fff" : "var(--accent)",
        color: outline ? "var(--accent)" : "#fff",
        border: "1.5px solid var(--accent)",
      }}
    >
      {children}
    </button>
  );
}

export function GoodBad({ good }) {
  return good ? <Check size={15} color="#1E7F4B" strokeWidth={2.6} /> : <X size={15} color="#B45309" strokeWidth={2.6} />;
}

// ─── Who is looking ───
// "seller" shows IB-only data (supplier, cost, margin...). "customer" never does.
export const ViewCtx = createContext({ mode: "customer", sources: false });
export const useView = () => useContext(ViewCtx);

export function SellerNote({ items }) {
  const { mode } = useView();
  const { picks } = useDesign();
  if (mode !== "seller" || !items?.length) return null;
  if (picks.seller === "panel") return null; // gathered in SellerPanel instead
  if (picks.seller === "hover")
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {items.map(([k, v]) => (
          <span key={k} title={`${k}: ${v}`} className="text-[10.5px] px-1.5 py-0.5 rounded bg-[#F2F4F7] text-[#475467] cursor-help">
            {k}
          </span>
        ))}
      </div>
    );
  return (
    <div className="mt-2 border border-dashed border-[#98A2B3] bg-[#F9FAFB] rounded-md px-2.5 py-1.5 text-[11.5px] text-[#475467] flex flex-wrap gap-x-3 gap-y-0.5">
      <span className="font-bold text-[#344054]">Seller</span>
      {items.map(([k, v]) => (
        <span key={k}>
          {k}: <b className="text-[#101828]">{v}</b>
        </span>
      ))}
    </div>
  );
}

const SRC_STYLE = {
  ib: { bg: "#E6F7F5", fg: "#00857A", t: "IB" },
  app: { bg: "#FFE6ED", fg: "#C00840", t: "App" },
  both: { bg: "#EEF4FF", fg: "#3538CD", t: "IB + App" },
};
export function DataSource({ s }) {
  const { sources } = useView();
  if (!sources) return null;
  const c = SRC_STYLE[s];
  return (
    <span className="ml-2 align-middle text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: c.bg, color: c.fg }}>
      {c.t}
    </span>
  );
}

// ─── The only badge next to a hotel's name: shown when 30 Sundays has a contract ───
export function ContractedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-[2px] text-[10px] font-bold tracking-wide align-middle whitespace-nowrap"
      style={{ background: "#E6F7F5", color: "#00857A", border: "1px solid #B7E6E0" }} title="30 Sundays has a contract with this hotel">
      © CONTRACTED
    </span>
  );
}

// ─── Show Images | Show on Map, at the right of the name line on the detail page ───
export function DetailLinks({ onImages, mapUrl }) {
  const cls = "text-[14px] font-medium flex items-center gap-1.5 hover:underline whitespace-nowrap";
  return (
    <div className="flex items-center gap-3 shrink-0" style={{ color: "#E31B53" }}>
      <button type="button" onClick={onImages} className={cls}><ImageIcon size={15} /> Show Images</button>
      {mapUrl && (
        <>
          <span className="text-[#414651]">|</span>
          {/* Opens Google Maps in a new tab, as the live IB does. */}
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={cls} onClick={(e) => e.stopPropagation()}>
            <MapPin size={15} /> Show on Map
          </a>
        </>
      )}
    </div>
  );
}
