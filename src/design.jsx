// ─── Every knob on /options ───
//
// Each entry is one UI element. `variants` are the ways it can look; the first
// is the default. The chosen set is kept in localStorage and can be shared as
// a ?d= link, and /universal renders whatever is picked here.

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const GLOBALS = [
  {
    key: "accent",
    title: "Accent colour",
    hint: "Buttons, selected states, links. App CLAUDE.md says pink for buttons and small accents only.",
    variants: [
      { id: "fuchsia", label: "Sunset Fuchsia", value: { accent: "#FD014F", soft: "#FFE6ED", ink: "#C00840" }, note: "App hotel screens" },
      { id: "p600", label: "App pink p-600", value: { accent: "#E31B53", soft: "#FFE4E8", ink: "#89123E" }, note: "Tailwind p-600" },
      { id: "teal", label: "IB teal", value: { accent: "#00A898", soft: "#E6F7F5", ink: "#00857A" }, note: "IB --primary-color" },
      { id: "forest", label: "Tropical forest", value: { accent: "#254342", soft: "#E8EFEE", ink: "#254342" }, note: "Brand board" },
      { id: "ink", label: "Midnight ink", value: { accent: "#181E4C", soft: "#ECEDF6", ink: "#181E4C" }, note: "Home screen ink" },
    ],
  },
  {
    key: "font",
    title: "Typeface",
    hint: "App uses Figtree, IB uses Inter.",
    variants: [
      { id: "figtree", label: "Figtree", value: { body: "Figtree", head: "Figtree" }, note: "30 Sundays app" },
      { id: "inter", label: "Inter", value: { body: "Inter", head: "Inter" }, note: "Itinerary builder" },
      { id: "poppins", label: "Poppins", value: { body: "Figtree", head: "Poppins" }, note: "Figtree body, Poppins headings" },
      { id: "serif", label: "DM Serif headings", value: { body: "Figtree", head: "DM Serif Display" }, note: "Editorial, hotel-magazine feel" },
    ],
  },
  {
    key: "radius",
    title: "Corner radius",
    variants: [
      { id: "soft", label: "Soft 14", value: { card: 14, well: 10, pill: 999 }, note: "App tokens R.card" },
      { id: "tight", label: "Tight 6", value: { card: 6, well: 4, pill: 6 }, note: "IB rounded-md" },
      { id: "round", label: "Round 20", value: { card: 20, well: 14, pill: 999 }, note: "Hero radius everywhere" },
      { id: "sharp", label: "Sharp 0", value: { card: 0, well: 0, pill: 0 }, note: "Print / PDF look" },
    ],
  },
  {
    key: "shadow",
    title: "Card elevation",
    variants: [
      { id: "soft", label: "Soft shadow", value: "0 4px 16px rgba(15,23,42,0.06)", note: "App SHADOW.card" },
      { id: "line", label: "Hairline only", value: "none", note: "Border, no shadow" },
      { id: "raised", label: "Raised", value: "0 10px 30px rgba(16,24,40,0.10)", note: "App SHADOW.raised" },
      { id: "ib", label: "IB shadow-lg", value: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)", note: "IB cards" },
    ],
  },
  {
    key: "density",
    title: "Density",
    variants: [
      { id: "comfy", label: "Comfortable", value: { pad: 16, gap: 28, scale: 1 }, note: "App PAD 16 / GAP 24" },
      { id: "compact", label: "Compact", value: { pad: 12, gap: 18, scale: 0.94 }, note: "More on screen for sellers" },
      { id: "airy", label: "Airy", value: { pad: 20, gap: 40, scale: 1.04 }, note: "Editorial spacing" },
    ],
  },
  {
    key: "surface",
    title: "Page surface",
    variants: [
      { id: "white", label: "White", value: { page: "#FFFFFF", band: "#F4F5F6" }, note: "App rule: white backgrounds" },
      { id: "cream", label: "Cream", value: { page: "#FDF8F5", band: "#F6EEE8" }, note: "Home screen cream" },
      { id: "grey", label: "Cool grey", value: { page: "#F7F8FA", band: "#FFFFFF" }, note: "Cards on grey, IB-like" },
    ],
  },
];

export const BLOCKS = [
  {
    key: "listCard",
    title: "Hotel card in the results list",
    where: "IB search results · App change-hotel list",
    variants: [
      { id: "reel", label: "App listing card", note: "Swipe photos, stars, score chip, area, inclusions, price delta" },
      { id: "row", label: "Seller row", note: "Photo left, dense facts right, rate from price. Fits 48rem IB column" },
      { id: "stay", label: "App stay card", note: "The itinerary HotelStayCard: one photo, star line, name, room, cancellation" },
      { id: "ib", label: "IB classic", note: "Today's IB card: name, ₹, Booking / Star rating text, Show Rooms" },
    ],
  },
  {
    key: "media",
    title: "Photos and video header",
    where: "App MediaHeader + GalleryScreen",
    variants: [
      { id: "strip", label: "Video + paired strip", note: "App today: video tile then photos stacked two high, scrolls sideways" },
      { id: "mosaic", label: "Hero + 4 mosaic", note: "One big photo with a 2x2 grid, 'View all N' on the last" },
      { id: "carousel", label: "Full-bleed carousel", note: "One photo per swipe with dots and a count" },
      { id: "tabs", label: "Category tabs", note: "Gallery chips (Rooms, Pool, Dining...) above a strip" },
    ],
  },
  {
    key: "title",
    title: "Name, stars and badges",
    where: "App H1 + SUNDAYS PICK",
    variants: [
      { id: "inline", label: "Inline badge", note: "App: name with SUNDAYS PICK beside it, star icons + type · area" },
      { id: "eyebrow", label: "Eyebrow", note: "Area as eyebrow above the name, stars as a chip, badge on its own line" },
      { id: "center", label: "Centred", note: "Centred hotel name, stars under it, magazine style" },
    ],
  },
  {
    key: "scores",
    title: "Ratings summary",
    where: "App ScoreStrip / ScoreCard",
    variants: [
      { id: "strip", label: "Score strip", note: "App: one bordered row, 30 Sundays %, Booking 9.2/10, Google 4.6/5" },
      { id: "cards", label: "Four score cards", note: "2x2 grid, each source with score, label and count" },
      { id: "hero", label: "30 Sundays first", note: "Big 30 Sundays score, other sources small underneath" },
      { id: "chips", label: "Compact chips", note: "One line of small source chips. Least space" },
    ],
  },
  {
    key: "stay",
    title: "Your stay (dates, guests, check-in)",
    where: "App stay slot + StayBasicsCrisp · IB tab header",
    variants: [
      { id: "card", label: "Stay card", note: "App: dates · nights · travellers, then check-in / check-out line" },
      { id: "columns", label: "Check-in / out columns", note: "Two columns with big times, early / late line" },
      { id: "timeline", label: "Timeline", note: "Arrive → nights → leave on one line" },
    ],
  },
  {
    key: "honest",
    title: "The honest bit",
    where: "App HonestBit",
    variants: [
      { id: "postcard", label: "Postcard", note: "App: cream postcard, Caveat handwriting, stamp, ✓ / ✗ lines" },
      { id: "split", label: "Loved / Know before", note: "Two columns, good on the left, heads-up on the right" },
      { id: "cards", label: "Swipe cards", note: "One card per point with the full explanation" },
      { id: "off", label: "Hide", note: "" },
    ],
  },
  {
    key: "why",
    title: "Why Indian couples say yes",
    where: "App whyIndians",
    variants: [
      { id: "list", label: "Icon list", note: "One line each with an icon well" },
      { id: "chips", label: "Chips", note: "Short chips, wraps" },
      { id: "highlight", label: "Highlight box", note: "Pink-gold gradient box, 2 columns" },
      { id: "off", label: "Hide", note: "" },
    ],
  },
  {
    key: "about",
    title: "About the stay",
    where: "App About",
    variants: [
      { id: "clamp", label: "Clamped + Read more", note: "App: 5 lines then Read more" },
      { id: "sections", label: "Sections", note: "The stay / Eating here / Getting around / Good to know as an accordion" },
      { id: "cards", label: "Photo cards", note: "Short text with three captioned photo cards" },
    ],
  },
  {
    key: "amenities",
    title: "Amenities",
    where: "App 'What this place offers'",
    variants: [
      { id: "list", label: "Two-column list", note: "App: top icons + View all N amenities" },
      { id: "grid", label: "Icon tiles", note: "3-up tiles with icon above label" },
      { id: "grouped", label: "Grouped, open", note: "Every group (Wellness, Food...) shown with first items" },
      { id: "chips", label: "Chips", note: "Inline chips, densest" },
    ],
  },
  {
    key: "location",
    title: "Location",
    where: "App 'Where you'll be' · IB master distance fields",
    variants: [
      { id: "tabs", label: "Address + nearby tabs", note: "App: address row, tabs (Food, Attractions...), rows with photos" },
      { id: "map", label: "Map card", note: "Static map tile with pin, distances underneath" },
      { id: "chips", label: "Distance chips", note: "Centre / beach / airport chips, nothing else" },
    ],
  },
  {
    key: "reviews",
    title: "Reviews",
    where: "App Ratings & reviews",
    variants: [
      { id: "carousel", label: "AI summary + carousel", note: "App: lavender AI box then swipe review cards" },
      { id: "bars", label: "Breakdown bars + list", note: "Category bars (Cleanliness, Staff...) and stacked reviews" },
      { id: "summary", label: "Summary only", note: "AI summary and one top review" },
    ],
  },
  {
    key: "rooms",
    title: "Rooms and rates",
    where: "App 'Select your room' · IB GroupedRoomCard",
    variants: [
      { id: "hybrid", label: "Room card + rate rows", note: "App room card with IB rate rows under it (meal, refund, hold, PAN). Same for both" },
      { id: "app", label: "App room cards", note: "Photo, tags, meal, cancellation, + ₹ delta, Select pill" },
      { id: "table", label: "Comparison table", note: "Rooms as columns: size, beds, view, meals, price" },
      { id: "ib", label: "IB rate list", note: "Today's IB: room name left, Lowest Price and radio rate rows right" },
    ],
  },
  {
    key: "policies",
    title: "Policies, legal and FAQs",
    where: "App Policies + LegalInfo + Questions",
    variants: [
      { id: "list", label: "Short list + See all", note: "App: 3 policies, then See all" },
      { id: "accordion", label: "Accordion", note: "Every policy, legal note and FAQ folds open" },
      { id: "grid", label: "Icon grid", note: "Policies as tiles with the first line only" },
    ],
  },
  {
    key: "similar",
    title: "Similar hotels",
    where: "App SimilarHotels · IB other results",
    variants: [
      { id: "cards", label: "Swipe cards", note: "App: 220px cards with photo, why line and price pill" },
      { id: "list", label: "Compact list", note: "Thumb + name + delta rows" },
      { id: "off", label: "Hide", note: "" },
    ],
  },
  {
    key: "nav",
    title: "Section navigation",
    where: "App SectionNav",
    variants: [
      { id: "tabs", label: "Sticky tabs", note: "App: tabs stick to the top while scrolling" },
      { id: "pills", label: "Pill row", note: "Rounded pills, active one filled" },
      { id: "off", label: "None", note: "" },
    ],
  },
  {
    key: "cta",
    title: "Price and action bar",
    where: "App replace bar · IB Price Details box",
    variants: [
      { id: "bar", label: "Replace bar", note: "App: old total struck, new total, ± delta, Replace hotel" },
      { id: "delta", label: "Delta only", note: "Just '+₹4,200 for 3 nights' and the button" },
      { id: "box", label: "Price details box", note: "IB style breakdown: room × nights, taxes, total" },
    ],
  },
  {
    key: "seller",
    title: "Seller-only details",
    where: "IB: supplier, cost, margin, contracted, PDF",
    variants: [
      { id: "strip", label: "Inline strip", note: "A dashed strip inside each block, visible only to sellers" },
      { id: "panel", label: "Side panel", note: "All seller data in one card at the top" },
      { id: "hover", label: "Hover chips", note: "Small grey chips; detail on hover" },
    ],
  },
];

const ALL = [...GLOBALS, ...BLOCKS];
export const DEFAULTS = Object.fromEntries(ALL.map((o) => [o.key, o.variants[0].id]));

export const PRESETS = [
  { id: "app", label: "Same as the app", picks: {} },
  {
    id: "ib",
    label: "Close to today's IB",
    picks: { accent: "teal", font: "inter", radius: "tight", shadow: "ib", density: "compact", surface: "grey", listCard: "ib", rooms: "ib", cta: "box", honest: "off", why: "off", nav: "off", seller: "strip" },
  },
  {
    id: "dense",
    label: "Seller dense",
    picks: { density: "compact", listCard: "row", media: "mosaic", scores: "chips", stay: "timeline", honest: "split", why: "chips", about: "sections", amenities: "chips", location: "chips", reviews: "summary", rooms: "table", policies: "accordion", similar: "list", nav: "pills", cta: "delta", seller: "panel" },
  },
  {
    id: "editorial",
    label: "Editorial",
    picks: { font: "serif", radius: "round", shadow: "raised", density: "airy", surface: "cream", accent: "forest", media: "carousel", title: "center", scores: "hero", honest: "cards", why: "highlight", about: "cards", amenities: "grid", location: "map", reviews: "bars", rooms: "app", similar: "cards" },
  },
];

export function option(key) {
  return ALL.find((o) => o.key === key);
}

function resolveTokens(picks) {
  const val = (k) => option(k).variants.find((v) => v.id === picks[k])?.value ?? option(k).variants[0].value;
  const accent = val("accent");
  const font = val("font");
  const radius = val("radius");
  const density = val("density");
  const surface = val("surface");
  return { ...accent, font, radius, shadow: val("shadow"), ...density, ...surface };
}

// CSS variables the blocks read, so one wrapper re-themes everything under it.
export function cssVars(t) {
  return {
    "--accent": t.accent,
    "--accent-soft": t.soft,
    "--accent-ink": t.ink,
    "--r": `${t.radius.card}px`,
    "--rw": `${t.radius.well}px`,
    "--rp": `${t.radius.pill}px`,
    "--shadow": t.shadow,
    "--pad": `${t.pad}px`,
    "--gap": `${t.gap}px`,
    "--page": t.page,
    "--band": t.band,
    "--head-font": `'${t.font.head}', system-ui, sans-serif`,
    fontFamily: `'${t.font.body}', system-ui, sans-serif`,
    background: t.page,
    color: "#181D27",
  };
}

const KEY = "hotel-revamp:design";

function fromUrl() {
  try {
    const d = new URLSearchParams(window.location.search).get("d");
    return d ? JSON.parse(atob(d)) : null;
  } catch {
    return null;
  }
}

function fromStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

const Ctx = createContext(null);

export function DesignProvider({ children }) {
  const [picks, setPicks] = useState(() => ({ ...DEFAULTS, ...(fromStore() || {}), ...(fromUrl() || {}) }));
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(picks));
    } catch {
      /* private window: picks just won't persist */
    }
  }, [picks]);
  const value = useMemo(() => {
    const t = resolveTokens(picks);
    return {
      picks,
      t,
      vars: cssVars(t),
      pick: (key, id) => setPicks((p) => ({ ...p, [key]: id })),
      apply: (obj) => setPicks({ ...DEFAULTS, ...obj }),
      reset: () => setPicks(DEFAULTS),
      shareQuery: () => {
        const diff = Object.fromEntries(Object.entries(picks).filter(([k, v]) => DEFAULTS[k] !== v));
        return Object.keys(diff).length ? `?d=${btoa(JSON.stringify(diff))}` : "";
      },
    };
  }, [picks]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Re-theme a subtree with some picks swapped (used by /options previews).
export function DesignOverride({ o, children }) {
  const parent = useContext(Ctx);
  const value = useMemo(() => {
    const picks = { ...parent.picks, ...o };
    const t = resolveTokens(picks);
    return { ...parent, picks, t, vars: cssVars(t) };
  }, [parent, o]);
  return (
    <Ctx.Provider value={value}>
      <div style={value.vars}>{children}</div>
    </Ctx.Provider>
  );
}

export function useDesign() {
  return useContext(Ctx);
}
