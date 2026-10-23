// ─── Options the seller makes themselves ───
//
// Each element on /options has a box: write what you want and/or drop a
// screenshot, and /api/variant asks Claude for a new version built from the
// element's real data. The result is kept in this browser and can be picked
// like any other version; /universal then draws it in place of the block.

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Sparkles, X, Loader2, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { useDesign } from "./design";
import { TRIP_STAYS } from "./data/ibHotels";
import { NOTE, tagList } from "./blocks/screen";

const KEY = "hotel-revamp:user-variants:v1";
const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

const UCtx = createContext(null);

export function UserVariantsProvider({ children }) {
  const [all, setAll] = useState(load);
  const [warn, setWarn] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(all));
      setWarn("");
    } catch {
      setWarn("This browser's storage is full. Delete an option with a large screenshot to keep new ones.");
    }
  }, [all]);
  const value = useMemo(
    () => ({
      all,
      warn,
      list: (k) => all[k] || [],
      find: (k, id) => (all[k] || []).find((v) => v.id === id),
      put: (k, v) => setAll((a) => ({ ...a, [k]: [...(a[k] || []).filter((x) => x.id !== v.id), v] })),
      patch: (k, id, p) => setAll((a) => ({ ...a, [k]: (a[k] || []).map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      remove: (k, id) => setAll((a) => ({ ...a, [k]: (a[k] || []).filter((x) => x.id !== id) })),
    }),
    [all, warn],
  );
  return <UCtx.Provider value={value}>{children}</UCtx.Provider>;
}

export const useUserVariants = () => useContext(UCtx);

// The user-made version picked for element `k`, if any.
export function usePickedUser(k) {
  const { picks } = useDesign();
  const u = useUserVariants();
  const id = picks[k];
  return typeof id === "string" && id.startsWith("u-") ? u.find(k, id) : null;
}

// ─── The data each element shows (window.DATA inside a made version) ───
const hotelCard = (h, ctx) => {
  const rates = h.rooms.flatMap((r) => r.rates.map((x) => ({ ...x, room: r.name })));
  const r0 = [...rates].sort((a, b) => a.pricing.selling_price - b.pricing.selling_price)[0];
  return {
    name: h.name,
    stars: h.stars,
    area: h.neighbourhood,
    distanceFromCentreKm: h.distanceFromCenter,
    photo: h.photos[0].url,
    photos: h.photos.slice(0, 6).map((p) => p.url),
    tier: h.ib.tier,
    transfer: h.ib.private_sic,
    refundable: rates.some((x) => x.is_refundable),
    contracted: h.ib.contracted,
    recommended: h.ib.recommended,
    sundaysPick: h.sundaysPick,
    room: r0.room,
    mealPlan: r0.board_basis.description,
    inclusions: h.ib.inclusions,
    reviews: { bookingScore: h.ratings.booking.score, bookingCount: h.ratings.booking.count, google: h.ratings.google.score },
    pricePerNight: r0.pricing.selling_price,
    nights: ctx.nights,
    total: r0.pricing.selling_price * ctx.nights,
    isCurrent: h.id === ctx.currentId,
    indicativeNote: NOTE,
  };
};

export function elementData(k, s) {
  const { h, ctx, list = [], trip, priceRange, booked, bookedRate, custom } = s;
  switch (k) {
    case "topBar": return { stays: TRIP_STAYS.map((x, i) => ({ ...x, done: i === 0 ? !!booked : !!x.booked })), activeIndex: s.city ?? 0, buttons: ["Back", "Wishlist", "Modify", "Continue"] };
    case "filters": return { groups: { "Hotel Type": ["Private", "SIC", "Gold", "Silver", "Bronze", "Wishlisted"], "Room Type": ["Refundable", "Non Refundable"], "Star Rating": [5, 4, 3] }, priceRangePerNight: priceRange };
    case "toolbar": return { count: list.length, sortOptions: ["Sort By Best", "Price: low to high", "Price: high to low", "Rating"], bookedByGuest: false };
    case "notice": return { text: NOTE };
    case "grouping": return { tiers: ["gold", "silver", "bronze"].map((t) => ({ tier: t, title: `30 Sundays ${t[0].toUpperCase()}${t.slice(1)} Hotels`, hotels: list.filter((x) => x.ib.tier === t).map((x) => hotelCard(x, ctx)) })) };
    case "listCard": return hotelCard(h, ctx);
    case "tags": return { tags: tagList(h, custom, "seller").map((t) => ({ kind: t.k, text: t.t })) };
    case "detail": return { hotel: hotelCard(h, ctx) };
    case "rail": return { lines: trip, currency: "INR" };
    case "bookings": return { cities: TRIP_STAYS.map((x, i) => (i === 0 ? { city: x.city, nights: x.nights, hotel: booked?.name, room: bookedRate?.room.name, price: bookedRate?.r.pricing.selling_price } : { city: x.city, nights: x.nights, ...(x.booked || {}) })) };
    case "support": return { label: "Support" };
    case "media": return { photos: h.photos.map((p) => ({ url: p.url, category: p.category, caption: p.caption })), video: h.video, reels: h.reels?.length || 0 };
    case "title": return { name: h.name, stars: h.stars, type: h.type, area: h.neighbourhood, sundaysPick: h.sundaysPick, tags: tagList(h, custom, "seller").map((t) => t.t) };
    case "scores": return { ratings: h.ratings };
    case "stay": return { checkIn: ctx.checkIn, checkOut: ctx.checkOut, nights: ctx.nights, adults: ctx.adults, ...h.stayBasics };
    case "honest": return { items: h.honest };
    case "why": return { items: h.whyIndians };
    case "about": return { short: h.aboutShort, sections: h.aboutSections, cards: h.aboutCards };
    case "amenities": return { top: h.facilityTop, groups: h.facilityGroups };
    case "location": return { address: h.address, distanceFromCentreKm: h.distanceFromCenter, nearby: h.nearby };
    case "reviews": return { ratings: h.ratings, summary: h.reviewSummary, breakdown: h.ratingBreakdown, reviews: h.reviews };
    case "rooms": return { nights: ctx.nights, rooms: h.rooms.map((r) => ({ name: r.name, size: r.size, beds: r.beds, view: r.view, images: r.images, amenities: r.amenities, rates: r.rates.map((x) => ({ meal: x.board_basis.description, refundable: x.is_refundable, holdAllowed: x.is_hold_allowed, supplier: x.supplier, pricePerNight: x.pricing.selling_price, total: x.pricing.selling_price * ctx.nights })) })) };
    case "policies": return { policies: h.policies, legal: h.legal, faqs: h.faqs };
    case "similar": return { hotels: (ctx.others || []).map((x) => hotelCard(x, ctx)) };
    case "nav": return { sections: ["Rooms", "About", "Amenities", "Honest bit", "Location", "Reviews", "Policies", "Similar"] };
    case "cta": return { currentHotel: ctx.currentName, nights: ctx.nights, currentTotal: ctx.baseNightly * ctx.nights, hotel: hotelCard(h, ctx) };
    case "seller": return { travclanId: h.ib.travclan_id, tboId: h.ib.tbo_id, contracted: h.ib.contracted, recommended: h.ib.recommended, transfer: h.ib.private_sic, rates: h.rooms.flatMap((r) => r.rates.map((x) => ({ room: r.name, supplier: x.supplier, cost: x.pricing.cost_price, sell: x.pricing.selling_price }))) };
    default: return { hotel: hotelCard(h, ctx) };
  }
}

// ─── Draw a made version: sandboxed iframe that sizes itself ───
export function UserVariantView({ v, data, minHeight = 60 }) {
  const { vars } = useDesign();
  const ref = useRef(null);
  const [height, setHeight] = useState(minHeight);
  const id = useMemo(() => Math.random().toString(36).slice(2), []);
  useEffect(() => {
    const on = (e) => {
      if (e.source === ref.current?.contentWindow && e.data?.hrSize === id) setHeight(Math.max(minHeight, Math.ceil(e.data.h)));
    };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [id, minHeight]);

  if (!v.html) {
    // A request that hasn't been built yet: show what was asked for.
    return (
      <div className="p-3 bg-[#FFFAEB] border border-dashed border-[#FEC84B] text-[12.5px] text-[#93370D]" style={{ borderRadius: "var(--rw)" }}>
        <div className="font-bold mb-1">Your version (not built yet)</div>
        {v.image && <img src={v.image} className="w-full max-h-[260px] object-contain bg-white rounded mb-1.5" />}
        {v.text && <div className="whitespace-pre-line text-[#344054]">{v.text}</div>}
      </div>
    );
  }
  const cssVars = Object.entries(vars).filter(([k]) => k.startsWith("--")).map(([k, val]) => `${k}:${val}`).join(";");
  const doc = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300..800&display=swap" rel="stylesheet">
<style>:root{${cssVars}}html,body{margin:0;background:transparent;font-family:Figtree,system-ui,sans-serif;color:#181D27;overflow:hidden}</style>
<script>window.DATA=${JSON.stringify(data).replace(/</g, "\\u003c")};</script></head><body><div id="hr-root">${v.html}</div>
<script>(function(){var s=function(){parent.postMessage({hrSize:${JSON.stringify(id)},h:document.getElementById('hr-root').getBoundingClientRect().height},'*')};new ResizeObserver(s).observe(document.getElementById('hr-root'));window.addEventListener('load',s);setTimeout(s,300);setTimeout(s,1200);})();</script></body></html>`;
  return <iframe ref={ref} title={v.label} sandbox="allow-scripts" srcDoc={doc} className="w-full block border-0" style={{ height }} />;
}

// ─── Shrink a screenshot so it travels and stores well ───
function shrink(file, max = 1400) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

// Which AI providers have a key on the server (asked once per page load).
const PROVIDER_LABEL = { anthropic: "Claude", openai: "OpenAI" };
let providersPromise;
function useProviders() {
  const [p, setP] = useState({ providers: [], default: null, loaded: false });
  useEffect(() => {
    providersPromise ||= fetch(`${import.meta.env.BASE_URL}api/variant`).then((r) => (r.ok ? r.json() : { providers: [] })).catch(() => ({ providers: [] }));
    providersPromise.then((x) => setP({ providers: x.providers || [], default: x.default || null, loaded: true }));
  }, []);
  return p;
}
const PKEY = "hotel-revamp:provider";
const savedProvider = () => {
  try {
    return localStorage.getItem(PKEY);
  } catch {
    return null;
  }
};

async function generate(payload) {
  const res = await fetch(`${import.meta.env.BASE_URL}api/variant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let body = {};
  try {
    body = await res.json();
  } catch {
    body = { error: "network", message: res.status === 404 ? "The generator isn't deployed here (run on Vercel)." : `Request failed (${res.status}).` };
  }
  if (!res.ok) throw Object.assign(new Error(body.message || "Failed"), { code: body.error });
  return body;
}

const describe = (o) => ({ key: o.key, title: o.title, where: o.where, variants: o.variants.map((v) => ({ label: v.label, note: v.note })) });

// ─── The box under each element ───
export function CreateOption({ o, data, onCreated }) {
  const u = useUserVariants();
  const prov = useProviders();
  const [choice, setChoice] = useState(savedProvider);
  const provider = prov.providers.includes(choice) ? choice : prov.default;
  const choose = (x) => {
    setChoice(x);
    try {
      localStorage.setItem(PKEY, x);
    } catch {
      /* fine */
    }
  };
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  const addFile = async (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    try {
      setImage(await shrink(f));
    } catch {
      setErr("Couldn't read that image.");
    }
  };
  const submit = async () => {
    if (!text.trim() && !image) return;
    const id = `u-${Date.now().toString(36)}`;
    const base = { id, label: "My version", note: text.slice(0, 120), text, image, status: "building", createdAt: Date.now(), provider };
    u.put(o.key, base);
    onCreated?.(id);
    setBusy(true);
    setErr("");
    try {
      const out = await generate({ element: describe(o), data, text, image, provider });
      u.patch(o.key, id, { ...out, status: "ready" });
      setText("");
      setImage(null);
    } catch (e) {
      u.patch(o.key, id, { status: "draft", error: e.message, label: "My version (draft)" });
      setErr(e.code === "no_key" ? "Saved as a draft. To build it automatically, add ANTHROPIC_API_KEY or OPENAI_API_KEY in Vercel → Project → Settings → Environment Variables, then press Build on the card." : e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); addFile(e.dataTransfer.files?.[0]); }}
      className={`shrink-0 w-[390px] self-stretch flex flex-col rounded-xl border-2 border-dashed p-3 bg-white ${drag ? "border-fuchsia bg-[#FFF5F8]" : "border-[#D5D7DA]"}`}
    >
      <div className="text-[14px] font-bold flex items-center gap-1.5">
        <Sparkles size={15} className="text-fuchsia" /> Create my own version
        {prov.providers.length > 0 && (
          <span className="ml-auto flex bg-surface rounded-md p-0.5 text-[11.5px] font-semibold">
            {["anthropic", "openai"].map((x) => {
              const ok = prov.providers.includes(x);
              return (
                <button key={x} disabled={!ok} onClick={() => choose(x)} title={ok ? `Build with ${PROVIDER_LABEL[x]}` : `No ${PROVIDER_LABEL[x]} key on Vercel`}
                  className={`px-2 py-0.5 rounded ${provider === x ? "bg-white shadow text-head" : "text-sub"} disabled:opacity-35`}>
                  {PROVIDER_LABEL[x]}
                </button>
              );
            })}
          </span>
        )}
      </div>
      <p className="text-[12px] text-sub mt-0.5 mb-2">Describe it, paste or drop a screenshot, or both. Claude builds it with this element's real data.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={(e) => { const f = [...(e.clipboardData?.files || [])][0]; if (f) { e.preventDefault(); addFile(f); } }}
        placeholder={`e.g. "${o.title}: like the first one, but put the price and Select on one line and show the tier as a ribbon"`}
        className="w-full flex-1 min-h-[110px] border border-divider rounded-lg px-3 py-2 text-[13px] outline-none focus:border-fuchsia"
      />
      {image ? (
        <div className="relative mt-2">
          <img src={image} className="w-full max-h-[160px] object-contain bg-surface rounded-lg" />
          <button onClick={() => setImage(null)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={13} /></button>
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()} className="mt-2 flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-sub border border-divider rounded-lg py-2 hover:border-head">
          <ImagePlus size={14} /> Add screenshot (or paste / drop it)
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => addFile(e.target.files?.[0])} />
      <button onClick={submit} disabled={busy || (!text.trim() && !image)} className="mt-2 bg-fuchsia text-white text-[13.5px] font-bold rounded-lg py-2 flex items-center justify-center gap-1.5 disabled:opacity-40">
        {busy ? <><Loader2 size={15} className="animate-spin" /> Building with {PROVIDER_LABEL[provider] || "AI"} (up to a minute)...</> : <><Wand2 size={15} /> Create option{provider ? ` with ${PROVIDER_LABEL[provider]}` : ""}</>}
      </button>
      {err && <p className="text-[11.5px] text-[#B54708] mt-1.5 leading-snug">{err}</p>}
      {u.warn && <p className="text-[11.5px] text-[#B42318] mt-1.5">{u.warn}</p>}
    </div>
  );
}

// ─── A made version's own card actions: rebuild, change, delete ───
export function UserCardActions({ o, v, data }) {
  const u = useUserVariants();
  const prov = useProviders();
  const provider = prov.providers.includes(v.provider) ? v.provider : prov.default;
  const [change, setChange] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (instruction) => {
    setBusy(true);
    u.patch(o.key, v.id, { status: "building", error: "" });
    try {
      const out = await generate({ element: describe(o), data, text: instruction || v.text, image: instruction ? null : v.image, previous: instruction && v.html ? { html: v.html } : null, provider });
      u.patch(o.key, v.id, { ...out, status: "ready", text: instruction ? `${v.text}\n\nThen: ${instruction}` : v.text });
      setChange("");
    } catch (e) {
      u.patch(o.key, v.id, { status: v.html ? "ready" : "draft", error: e.message });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
      {v.error && <p className="text-[11.5px] text-[#B54708] leading-snug">{v.error}</p>}
      {v.model && <p className="text-[11px] text-inact">Built with {PROVIDER_LABEL[v.provider] || v.provider} · {v.model}</p>}
      <div className="flex gap-1.5">
        <input value={change} onChange={(e) => setChange(e.target.value)} placeholder={v.html ? "Change it, e.g. 'bigger price, no inclusions'" : "Add detail (optional)"} className="flex-1 min-w-0 border border-divider rounded-md px-2 py-1 text-[12px]" />
        <button disabled={busy} onClick={() => run(change.trim() || null)} className="text-[12px] font-semibold border border-divider rounded-md px-2 py-1 flex items-center gap-1 disabled:opacity-40">
          {busy || v.status === "building" ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} {v.html ? (change.trim() ? "Change" : "Rebuild") : "Build"}
        </button>
        <button onClick={() => u.remove(o.key, v.id)} className="text-sub border border-divider rounded-md px-1.5" title="Delete"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

// ─── Wrap any element: draws the user-made version when one is picked ───
export function Slot({ k, s, children, min }) {
  const v = usePickedUser(k);
  const { custom } = useDesign();
  if (!v) return children ?? null;
  return <UserVariantView v={v} data={elementData(k, { ...s, custom })} minHeight={min} />;
}
