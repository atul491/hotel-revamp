import { useRef } from "react";
import { useDesign } from "./design";
import { Media, Title, Scores, Stay } from "./blocks/top";
import { Honest, Why, About, Amenities, Location, Reviews } from "./blocks/content";
import { Rooms, Policies, Similar, Nav, Cta, SellerPanel } from "./blocks/commerce";
import { Slot } from "./user";

function Sec({ id, children }) {
  return <div data-sec={id} className="scroll-mt-12">{children}</div>;
}

// One hotel page, assembled from whatever is picked on /options.
// Seller and couple get the same blocks; `mode` only adds seller notes.
export default function HotelPage({ h, ctx, scrollRef }) {
  const { picks } = useDesign();
  const local = useRef(null);
  const root = scrollRef || local;
  const on = (k) => picks[k] !== "off";
  const ids = ["rooms", "about", "amenities", "honest", "location", "reviews", "policies", "similar"].filter(
    (k) => !["honest", "similar"].includes(k) || on(k),
  );
  const scrollTo = (id) => {
    const el = root.current?.querySelector(`[data-sec="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const inset = picks.media === "strip";
  const S = { h, ctx };

  return (
    <div ref={local} style={{ fontSize: 14 }}>
      <div className={inset ? "" : "px-[var(--pad)] pt-[var(--pad)]"}>
        <Slot k="media" s={S}><Media h={h} v={picks.media} /></Slot>
      </div>
      <div className="px-[var(--pad)] pb-2">
        <div className="pt-4 space-y-3.5">
          <Slot k="title" s={S}><Title h={h} v={picks.title} /></Slot>
          <Slot k="scores" s={S}><Scores h={h} v={picks.scores} /></Slot>
          <Slot k="stay" s={S}><Stay h={h} v={picks.stay} ctx={ctx} /></Slot>
          <Slot k="seller" s={S}><SellerPanel h={h} ctx={ctx} /></Slot>
        </div>
        <Slot k="nav" s={S}><Nav v={picks.nav} ids={ids} scrollTo={scrollTo} /></Slot>
        <div className="flex flex-col pt-5" style={{ gap: "var(--gap)" }}>
          <Sec id="rooms"><Slot k="rooms" s={S}><Rooms h={h} v={picks.rooms} ctx={ctx} /></Slot></Sec>
          <Sec id="about"><Slot k="about" s={S}><About h={h} v={picks.about} /></Slot></Sec>
          <Sec id="amenities"><Slot k="amenities" s={S}><Amenities h={h} v={picks.amenities} /></Slot></Sec>
          {on("honest") && <Sec id="honest"><Slot k="honest" s={S}><Honest h={h} v={picks.honest} /></Slot></Sec>}
          {on("why") && <Slot k="why" s={S}><Why h={h} v={picks.why} /></Slot>}
          <Sec id="location"><Slot k="location" s={S}><Location h={h} v={picks.location} /></Slot></Sec>
          <Sec id="reviews"><Slot k="reviews" s={S}><Reviews h={h} v={picks.reviews} /></Slot></Sec>
          <Sec id="policies"><Slot k="policies" s={S}><Policies h={h} v={picks.policies} /></Slot></Sec>
          {on("similar") && <Sec id="similar"><Slot k="similar" s={S}><Similar h={h} v={picks.similar} ctx={ctx} /></Slot></Sec>}
        </div>
        <div className="h-4" />
        <Slot k="cta" s={S}><Cta h={h} v={picks.cta} ctx={ctx} /></Slot>
      </div>
    </div>
  );
}
