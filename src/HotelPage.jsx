import { useRef } from "react";
import { useDesign } from "./design";
import { Media, Title, Scores, Stay } from "./blocks/top";
import { Honest, Why, About, Amenities, Location, Reviews } from "./blocks/content";
import { Rooms, Policies, Similar, Nav, Cta, SellerPanel } from "./blocks/commerce";

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
  const ids = ["honest", "about", "amenities", "location", "reviews", "rooms", "policies", "similar"].filter(
    (k) => !["honest", "similar"].includes(k) || on(k),
  );
  const scrollTo = (id) => {
    const el = root.current?.querySelector(`[data-sec="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const inset = picks.media === "strip";

  return (
    <div ref={local} style={{ fontSize: 14 }}>
      <div className={inset ? "" : "px-[var(--pad)] pt-[var(--pad)]"}>
        <Media h={h} v={picks.media} />
      </div>
      <div className="px-[var(--pad)] pb-2">
        <div className="pt-4 space-y-3.5">
          <Title h={h} v={picks.title} />
          <Scores h={h} v={picks.scores} />
          <Stay h={h} v={picks.stay} ctx={ctx} />
          <SellerPanel h={h} ctx={ctx} />
        </div>
        <Nav v={picks.nav} ids={ids} scrollTo={scrollTo} />
        <div className="flex flex-col pt-5" style={{ gap: "var(--gap)" }}>
          {on("honest") && <Sec id="honest"><Honest h={h} v={picks.honest} /></Sec>}
          {on("why") && <Why h={h} v={picks.why} />}
          <Sec id="about"><About h={h} v={picks.about} /></Sec>
          <Sec id="amenities"><Amenities h={h} v={picks.amenities} /></Sec>
          <Sec id="location"><Location h={h} v={picks.location} /></Sec>
          <Sec id="reviews"><Reviews h={h} v={picks.reviews} /></Sec>
          <Sec id="rooms"><Rooms h={h} v={picks.rooms} ctx={ctx} /></Sec>
          <Sec id="policies"><Policies h={h} v={picks.policies} /></Sec>
          {on("similar") && <Sec id="similar"><Similar h={h} v={picks.similar} ctx={ctx} /></Sec>}
        </div>
        <div className="h-4" />
        <Cta h={h} v={picks.cta} ctx={ctx} />
      </div>
    </div>
  );
}
