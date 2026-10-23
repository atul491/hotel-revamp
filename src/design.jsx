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
      { id: "custom", label: "My colour", value: null, note: "Pick any colour below" },
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

// ─── The hotel selection screen around the page (IB listing) ───
export const SCREEN = [
  {
    key: "topBar",
    title: "Top bar and city stepper",
    where: "IB listing: Back, Wishlist, city tabs, Modify, Continue",
    variants: [
      { id: "stepper", label: "Arrow stepper", note: "IB today: cities as arrow segments, done ones ticked, active one filled" },
      { id: "pills", label: "Pill tabs", note: "Cities as rounded pills with nights and dates" },
      { id: "timeline", label: "Trip timeline", note: "Dots on a line, one per city, progress shown" },
      { id: "compact", label: "Compact dropdown", note: "One 'Seminyak · 3N ▾' switcher, most space for the list" },
    ],
  },
  {
    key: "filters",
    title: "Filters",
    where: "IB listing: left column",
    variants: [
      { id: "column", label: "Left column", note: "IB today: Hotel type, Room type, Star rating, Price range with slider" },
      { id: "chips", label: "Chip bar on top", note: "One row of quick chips above the list, More filters opens the rest" },
      { id: "drawer", label: "Filter button + drawer", note: "A single Filters button with a count; the full list slides in" },
    ],
  },
  {
    key: "toolbar",
    title: "Count, search, sort, booked by guest",
    where: "IB listing: above the list",
    variants: [
      { id: "row", label: "One row", note: "IB today: '96 hotels', search box, Sort by, Booked by Guest" },
      { id: "search", label: "Search first", note: "Big search on its own line, sort and count under it" },
      { id: "minimal", label: "Minimal", note: "Count and sort only, search behind an icon" },
    ],
  },
  {
    key: "notice",
    title: "Indicative-rates note",
    where: "IB listing: info line",
    variants: [
      { id: "line", label: "Info line", note: "IB today: grey line with an ⓘ under the toolbar" },
      { id: "callout", label: "Yellow callout", note: "Hard to miss, for new sellers" },
      { id: "price", label: "On the price only", note: "'Indicative' next to each price with the note on hover" },
      { id: "off", label: "Hide", note: "" },
    ],
  },
  {
    key: "grouping",
    title: "Grouping by tier",
    where: "IB listing: 30 Sundays Gold / Silver / Bronze Hotels",
    variants: [
      { id: "headers", label: "Tier headers", note: "IB today: medallion + '30 Sundays Silver Hotels' band per tier" },
      { id: "tabs", label: "Tier tabs", note: "Gold / Silver / Bronze tabs with counts, one tier at a time" },
      { id: "flat", label: "One list", note: "No grouping, sorted; the tier shows only as a tag" },
    ],
  },
  {
    key: "listCard",
    title: "Hotel card in the results list",
    where: "IB listing row · App change-hotel list",
    variants: [
      { id: "ibrow", label: "IB listing row", note: "Photo, name + stars + heart, room, size • bed, amenity icons, links; tier + SIC, reviews, ₹/night, total, Select / Show rooms" },
      { id: "row", label: "Seller row", note: "Photo left, dense facts right, from-price. Narrower" },
      { id: "reel", label: "App listing card", note: "Swipe photos, stars, score chip, area, inclusions, price delta" },
      { id: "stay", label: "App stay card", note: "The itinerary HotelStayCard: one photo, star line, name, room, cancellation" },
      { id: "ib", label: "IB classic", note: "Old IB card: name, ₹, Booking / Star rating text, Show Rooms" },
    ],
  },
  {
    key: "tags",
    title: "Tags up front",
    where: "Tier, SIC / Private, Refundable, Contracted, Recommended",
    variants: [
      { id: "pills", label: "Pills top-right", note: "IB today: SILVER and SIC pills above the score" },
      { id: "photo", label: "On the photo", note: "Tags sit on the photo corner, price side stays clean" },
      { id: "inline", label: "Under the name", note: "A tag row right below the hotel name" },
      { id: "text", label: "Plain text", note: "'Silver · SIC · Refundable' as one quiet line" },
    ],
  },
  {
    key: "detail",
    title: "How a hotel opens",
    where: "Show rooms / tap a hotel",
    variants: [
      { id: "drawer", label: "Side drawer", note: "The full hotel page slides in from the right, list stays behind" },
      { id: "inline", label: "Expand in the list", note: "IB today: Show rooms opens rooms under the card; full page below them" },
      { id: "modal", label: "Centre modal", note: "Large modal over the list" },
    ],
  },
  {
    key: "rail",
    title: "Price details",
    where: "IB listing: right column",
    variants: [
      { id: "box", label: "Yellow box", note: "IB today: Hotels, Add Ons, Flights, Activities, GST, TCS, Total" },
      { id: "card", label: "White card + delta", note: "Same lines, white card, shows the change this hotel makes" },
      { id: "bar", label: "Bottom bar", note: "Total in a sticky bar under the list, details on click" },
    ],
  },
  {
    key: "bookings",
    title: "Hotel bookings per city",
    where: "IB listing: right column",
    variants: [
      { id: "cards", label: "City cards", note: "IB today: one card per city, ticked when a room is chosen" },
      { id: "checklist", label: "Checklist", note: "Compact list: city, hotel, ✓ or 'No room selected'" },
      { id: "stepper", label: "In the stepper only", note: "No panel; the city tabs carry the tick and hotel name" },
    ],
  },
  {
    key: "support",
    title: "Support button",
    where: "IB listing: floating headset",
    variants: [
      { id: "fab", label: "Floating button", note: "IB today: round navy headset bottom-right" },
      { id: "link", label: "Link in the top bar", note: "'Need help?' next to Modify" },
      { id: "off", label: "Hide", note: "" },
    ],
  },
];

export const BLOCKS = [
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
    key: "rooms",
    title: "Rooms and rates",
    where: "Show rooms · IB rate cards",
    variants: [
      { id: "grid", label: "IB rate cards", note: "One card per room and meal plan: meal as an icon, Refundable pill, suppliers as Sup A / Sup B radio rows, total, Select" },
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

export const ALL = [...GLOBALS, ...SCREEN, ...BLOCKS];
export const DEFAULTS = Object.fromEntries(ALL.map((o) => [o.key, o.variants[0].id]));

export const PRESETS = [
  { id: "app", label: "Defaults", picks: {} },
  { id: "final", label: "My recommendation", picks: null },
  {
    id: "ib",
    label: "Close to today's IB",
    picks: { accent: "teal", font: "inter", radius: "tight", shadow: "ib", density: "compact", surface: "grey", listCard: "ibrow", rail: "box", cta: "box", honest: "off", why: "off", nav: "off", seller: "strip" },
  },
  {
    id: "dense",
    label: "Seller dense",
    picks: { density: "compact", listCard: "row", media: "mosaic", scores: "chips", honest: "split", why: "chips", about: "sections", amenities: "chips", location: "chips", reviews: "summary", policies: "accordion", similar: "list", nav: "pills", cta: "delta", seller: "panel" },
  },
  {
    id: "editorial",
    label: "Editorial",
    picks: { font: "serif", radius: "round", shadow: "raised", density: "airy", surface: "cream", accent: "forest", media: "carousel", title: "center", scores: "hero", honest: "cards", why: "highlight", about: "cards", amenities: "grid", location: "map", reviews: "bars", similar: "cards" },
  },
];

export function option(key) {
  return ALL.find((o) => o.key === key);
}

// ─── Your own settings, beyond the fixed variants ───
export const CARD_PARTS = [
  ["photo", "Photo"], ["wishlist", "Wishlist heart"], ["stars", "Stars"], ["room", "Room name"], ["roomFacts", "Size • bed"],
  ["amenities", "Amenity icons"], ["links", "Show images / Show on map"], ["tags", "Tags"], ["reviews", "Reviews + score"],
  ["perNight", "₹ per night"], ["total", "Total for the stay"], ["actions", "Select / Show rooms"],
];
export const TAG_KINDS = [
  ["tier", "Tier (Gold / Silver / Bronze)"], ["transfer", "SIC / Private"], ["refund", "Refundable"],
  ["pick", "Sundays pick"], ["contracted", "Contracted © (seller only)"], ["recommended", "Recommended 👍 (seller only)"],
];
export const CUSTOM_DEFAULTS = {
  accent: "#7F56D9",
  hiddenParts: [],
  tags: ["tier", "transfer"],
  notes: {},
};

function mix(hex, to, amt) {
  const n = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [n(hex), n(to)];
  return `#${a.map((x, i) => Math.round(x + (b[i] - x) * amt).toString(16).padStart(2, "0")).join("")}`;
}

function resolveTokens(picks, custom = CUSTOM_DEFAULTS) {
  const val = (k) => option(k).variants.find((v) => v.id === picks[k])?.value ?? option(k).variants[0].value;
  const c = custom.accent || CUSTOM_DEFAULTS.accent;
  const accent = picks.accent === "custom" ? { accent: c, soft: mix(c, "#ffffff", 0.88), ink: mix(c, "#000000", 0.25) } : val("accent");
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

const KEY = "hotel-revamp:design:v4";
const CKEY = "hotel-revamp:custom:v2";
const PKEY = "hotel-revamp:presets:v1";

function fromUrl() {
  try {
    const d = new URLSearchParams(window.location.search).get("d");
    if (!d) return null;
    const o = JSON.parse(decodeURIComponent(escape(atob(d))));
    return o.p || o.c ? o : { p: o };
  } catch {
    return null;
  }
}

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
function save(key, v) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* private window: just won't persist */
  }
}

const Ctx = createContext(null);

export function DesignProvider({ children }) {
  const url = useMemo(fromUrl, []);
  const [picks, setPicks] = useState(() => ({ ...DEFAULTS, ...(load(KEY) || {}), ...(url?.p || {}) }));
  const [custom, setCustom] = useState(() => ({ ...CUSTOM_DEFAULTS, ...(load(CKEY) || {}), ...(url?.c || {}) }));
  const [mine, setMine] = useState(() => load(PKEY) || []);
  useEffect(() => save(KEY, picks), [picks]);
  useEffect(() => save(CKEY, custom), [custom]);
  useEffect(() => save(PKEY, mine), [mine]);
  const value = useMemo(() => {
    const t = resolveTokens(picks, custom);
    return {
      picks,
      custom,
      t,
      vars: cssVars(t),
      pick: (key, id) => setPicks((p) => ({ ...p, [key]: id })),
      apply: (obj, c) => {
        setPicks({ ...DEFAULTS, ...obj });
        if (c) setCustom({ ...CUSTOM_DEFAULTS, ...c });
      },
      reset: () => {
        setPicks(DEFAULTS);
        setCustom(CUSTOM_DEFAULTS);
      },
      setCustom: (patch) => setCustom((c) => ({ ...c, ...patch })),
      myPresets: mine,
      savePreset: (name) => setMine((m) => [...m.filter((x) => x.name !== name), { name, picks, custom }]),
      deletePreset: (name) => setMine((m) => m.filter((x) => x.name !== name)),
      shareQuery: () => {
        const p = Object.fromEntries(Object.entries(picks).filter(([k, v]) => DEFAULTS[k] !== v));
        const c = JSON.stringify(custom) === JSON.stringify(CUSTOM_DEFAULTS) ? undefined : custom;
        if (!Object.keys(p).length && !c) return "";
        return `?d=${btoa(unescape(encodeURIComponent(JSON.stringify({ p, c }))))}`;
      },
    };
  }, [picks, custom, mine]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Re-theme a subtree with some picks swapped (used by /options previews and /final).
export function DesignOverride({ o, c, children, replace }) {
  const parent = useContext(Ctx);
  const value = useMemo(() => {
    const picks = replace ? { ...DEFAULTS, ...o } : { ...parent.picks, ...o };
    const custom = c ? { ...parent.custom, ...c } : parent.custom;
    const t = resolveTokens(picks, custom);
    return { ...parent, picks, custom, t, vars: cssVars(t) };
  }, [parent, o, c, replace]);
  return (
    <Ctx.Provider value={value}>
      <div style={value.vars}>{children}</div>
    </Ctx.Provider>
  );
}

export function useDesign() {
  return useContext(Ctx);
}

// ─── My recommended final page ───
// One pick per element, with the reason. /final renders exactly this.
export const FINAL = {
  picks: {
    accent: "fuchsia", font: "figtree", radius: "soft", shadow: "soft", density: "compact", surface: "white",
    topBar: "stepper", filters: "column", toolbar: "row", notice: "price", grouping: "headers", listCard: "ibrow",
    tags: "pills", detail: "drawer", rail: "card", bookings: "cards", support: "fab",
    media: "mosaic", title: "inline", scores: "strip", rooms: "grid", about: "clamp",
    amenities: "list", honest: "postcard", why: "chips", location: "tabs", reviews: "carousel",
    policies: "accordion", similar: "list", nav: "tabs", cta: "bar", seller: "strip",
  },
  why: {
    topBar: "Sellers already know the arrow stepper; ticks show which cities are done at a glance.",
    filters: "A left column keeps every filter visible while sellers compare; it is how they work today.",
    toolbar: "Count, search, sort and Booked by Guest on one row saves vertical space for hotels.",
    notice: "The note matters at the price, not as a banner people stop reading after day one.",
    grouping: "Tier bands mirror how 30 Sundays sells (Gold / Silver / Bronze) and stop sellers mixing tiers.",
    listCard: "The wide IB row shows the most per hotel: room, inclusions, tags, reviews and both prices.",
    tags: "Tier and SIC / Private sit top-right next to the price, the first thing sellers check.",
    detail: "A drawer keeps the list and price panel in view, so comparing hotels is one click each.",
    rail: "White card with the change this hotel makes, so the total never surprises the seller.",
    bookings: "City cards make it obvious which stays still need a room before Continue.",
    media: "Hero plus mosaic fits a desktop drawer better than the phone strip.",
    rooms: "Your IB rate cards: one card per room and meal plan, suppliers as radio rows, meal as an icon.",
    honest: "The postcard is the most 30 Sundays thing on the page; couples remember it.",
    why: "Chips keep the Indian-couple reasons short since the honest bit already sits above.",
    policies: "One accordion for policies, legal and FAQs avoids three separate long lists.",
    similar: "A compact list; the full list is already on the left for sellers.",
    cta: "The replace bar shows old and new totals, which is what the couple needs to say yes.",
  },
};
