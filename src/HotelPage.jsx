import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { DetailLinks } from "./kit";
import { useDesign } from "./design";
import { Media, Title, Scores } from "./blocks/top";
import { Honest, About, Amenities, Location, Reviews } from "./blocks/content";
import { Policies, Nav, Cta, SellerPanel } from "./blocks/commerce";
import { Slot } from "./user";

function Sec({ id, children }) {
  return <div data-sec={id} className="scroll-mt-12">{children}</div>;
}

// Dates, check-in times and room choice live on the seller screen (stepper and
// Show rooms), so the page itself does not repeat them.
// One hotel page, assembled from whatever is picked on /options.
// Seller and couple get the same blocks; `mode` only adds seller notes.
export default function HotelPage({ h, ctx, scrollRef, jumpTo }) {
  const { picks } = useDesign();
  const local = useRef(null);
  const root = scrollRef || local;
  const on = (k) => picks[k] !== "off";
  const ids = ["about", "amenities", "honest", "location", "reviews", "policies"].filter((k) => k !== "honest" || on(k));
  // ─── Scroll spy: the tab for the section being read stays highlighted ───
  const [active, setActive] = useState(null);
  useEffect(() => {
    const page = local.current;
    if (!page) return;
    let box = page.parentElement;
    while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
    const target = box || window;
    const onScroll = () => {
      const top = box ? box.getBoundingClientRect().top : 0;
      const nav = page.querySelector("[data-nav]");
      const line = top + (nav ? nav.offsetHeight : 0) + 24;
      let cur = null;
      page.querySelectorAll("[data-sec]").forEach((el) => {
        if (el.getBoundingClientRect().top <= line) cur = el.dataset.sec;
      });
      // At the very bottom, the last section counts as read.
      if (box && box.scrollTop + box.clientHeight >= box.scrollHeight - 4) {
        const all = page.querySelectorAll("[data-sec]");
        cur = all[all.length - 1]?.dataset.sec || cur;
      }
      setActive(cur);
    };
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [h.id]);

  const scrollTo = (id) => {
    const el = root.current?.querySelector(`[data-sec="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const inset = picks.media === "strip";
  const S = { h, ctx };
  const [gallery, setGallery] = useState(false);
  // Opened from "+N more" on the list: land on that section.
  useEffect(() => {
    if (!jumpTo) return;
    const t = setTimeout(() => scrollTo(jumpTo), 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo, h.id]);
  const links = <DetailLinks onImages={() => setGallery(true)} mapUrl={h.ib?.google_map_link} />;

  return (
    <div ref={local} style={{ fontSize: 14 }}>
      <div className={inset ? "" : "px-[var(--pad)] pt-[var(--pad)]"}>
        <Slot k="media" s={S}><Media h={h} v={picks.media} /></Slot>
      </div>
      <div className="px-[var(--pad)] pb-2">
        <div className="pt-4 space-y-3.5">
          <Slot k="title" s={S}><Title h={h} v={picks.title} actions={links} /></Slot>
          <Slot k="scores" s={S}><Scores h={h} v={picks.scores} /></Slot>
          <Slot k="seller" s={S}><SellerPanel h={h} ctx={ctx} /></Slot>
        </div>
        <Slot k="nav" s={S}><Nav v={picks.nav} ids={ids} scrollTo={scrollTo} active={active} /></Slot>
        <div className="flex flex-col pt-5" style={{ gap: "var(--gap)" }}>
          <Sec id="about"><Slot k="about" s={S}><About h={h} v={picks.about} /></Slot></Sec>
          <Sec id="amenities"><Slot k="amenities" s={S}><Amenities h={h} v={picks.amenities} /></Slot></Sec>
          {on("honest") && <Sec id="honest"><Slot k="honest" s={S}><Honest h={h} v={picks.honest} /></Slot></Sec>}
          <Sec id="location"><Slot k="location" s={S}><Location h={h} v={picks.location} /></Slot></Sec>
          <Sec id="reviews"><Slot k="reviews" s={S}><Reviews h={h} v={picks.reviews} /></Slot></Sec>
          <Sec id="policies"><Slot k="policies" s={S}><Policies h={h} v={picks.policies} /></Slot></Sec>
        </div>
        <div className="h-4" />
        <Slot k="cta" s={S}><Cta h={h} v={picks.cta} ctx={ctx} /></Slot>
      </div>
      {gallery && <Gallery h={h} onClose={() => setGallery(false)} />}
    </div>
  );
}

// ─── Show Images: every photo, grouped by what it shows ───
function Gallery({ h, onClose }) {
  const cats = ["All", ...new Set(h.photos.map((p) => p.category))];
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? h.photos : h.photos.filter((p) => p.category === cat);
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[980px] max-h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-divider">
          <b className="text-[16px]">{h.name}</b><span className="text-[13px] text-sub">{h.photos.length} photos</span>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center"><X size={18} /></button>
        </div>
        <div className="shrink-0 flex gap-1.5 px-5 py-2.5 overflow-x-auto no-scrollbar">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className="px-3 py-1 text-[12.5px] font-semibold rounded-full border whitespace-nowrap"
              style={{ background: cat === c ? "#181D27" : "#fff", color: cat === c ? "#fff" : "#535862", borderColor: cat === c ? "#181D27" : "#E9EAEB" }}>
              {c} {c === "All" ? h.photos.length : h.photos.filter((p) => p.category === c).length}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5 grid grid-cols-2 md:grid-cols-3 gap-2">
          {list.map((p, i) => (
            <figure key={i} className="relative">
              <img src={p.url} className="w-full aspect-[4/3] object-cover rounded-lg" />
              {p.caption && <figcaption className="absolute bottom-1.5 left-1.5 text-[11px] text-white bg-black/55 px-2 py-0.5 rounded">{p.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
