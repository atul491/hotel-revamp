import { useState } from "react";
import { X, ExternalLink, Hotel } from "lucide-react";
import { useDesign } from "./design";
import { ViewCtx, inr } from "./kit";
import { ListCard } from "./blocks/ListCard";
import { Rooms } from "./blocks/commerce";
import { TopBar, Filters, Toolbar, Notice, TierHeader, PriceDetails, Bookings, Support, TIER } from "./blocks/screen";
import HotelPage from "./HotelPage";
import { Slot, usePickedUser } from "./user";
import { TRIP_STAYS } from "./data/ibHotels";

// ─── The IB hotel selection screen, every part switchable from /options ───
export default function Screen({ stay, onOpenHotel, sources = false, fixedSupport = true }) {
  const { picks, vars } = useDesign();
  const { list, ctx, h, openId, setOpenId, filters, setFilters, priceRange, wish, setWish, booking, setBooking, booked, bookedRate, trip, city, setCity } = stay;
  const [expanded, setExpanded] = useState({});
  const [drawer, setDrawer] = useState(false);
  const [tierTab, setTierTab] = useState("gold");
  const userGrouping = usePickedUser("grouping");
  const S = stay;

  const setF = (f) => {
    if (f.byGuest !== filters.byGuest) setBooking({ ...booking, byGuest: f.byGuest });
    setFilters(f);
  };
  const open = (x) => {
    setOpenId(x.id);
    onOpenHotel?.(x.id);
    if (picks.detail === "inline") setExpanded((e) => ({ ...e, [x.id]: "full" }));
    else setDrawer(true);
  };
  const ctxFor = (x) => ({ ...ctx, sel: ctx.selOf(x), setSel: (s) => ctx.setSelFor(x, s), open: (id) => open(list.find((y) => y.id === id) || x) });
  const openedDelta = (() => {
    const { r } = findSel(h, ctx.selOf(h).rateId);
    return (r.pricing.selling_price - ctx.baseNightly) * ctx.nights;
  })();

  const card = (x) => (
    <div key={x.id}>
      <Slot k="listCard" s={{ ...S, h: x }}>
      <ListCard
        h={x}
        v={picks.listCard}
        ctx={ctx}
        active={x.id === openId}
        onOpen={() => open(x)}
        wished={wish.includes(x.id)}
        onWish={() => setWish(wish.includes(x.id) ? wish.filter((y) => y !== x.id) : [...wish, x.id])}
        expanded={!!expanded[x.id]}
        onToggleRooms={() => { setOpenId(x.id); setExpanded((e) => ({ ...e, [x.id]: e[x.id] ? false : "rooms" })); }}
        onSelect={() => ctx.book(x)}
      />
      </Slot>
      {expanded[x.id] && (
        <div className="bg-white border border-divider border-t-0 px-4 pb-4 -mt-2 pt-4" style={{ borderRadius: "0 0 var(--r) var(--r)" }}>
          {expanded[x.id] === "full" ? (
            <div className="max-w-[760px]"><HotelPage h={x} ctx={ctxFor(x)} /></div>
          ) : (
            <>
              <Rooms h={x} v={picks.rooms} ctx={ctxFor(x)} />
              <button onClick={() => open(x)} className="mt-3 text-[13px] font-bold flex items-center gap-1" style={{ color: "var(--accent)" }}>
                View full hotel page <ExternalLink size={13} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const tiers = ["gold", "silver", "bronze"].map((t) => [t, list.filter((x) => x.ib.tier === t)]).filter(([, l]) => l.length);
  let body;
  if (city !== 0) {
    const s = TRIP_STAYS[city];
    body = (
      <div className="bg-white border border-dashed border-[#D5D7DA] p-10 text-center" style={{ borderRadius: "var(--r)" }}>
        <Hotel className="mx-auto text-inact" />
        <div className="text-[15px] font-bold mt-2">{s.city} · {s.nights}N · {s.from} – {s.to}</div>
        <div className="text-[13px] text-sub mt-1">{s.booked ? `${s.booked.hotel} · ${s.booked.room} is saved for this city.` : "No room selected yet."} This demo has hotels for Seminyak only.</div>
        <button onClick={() => setCity(0)} className="mt-3 text-[13px] font-bold" style={{ color: "var(--accent)" }}>Back to Seminyak</button>
      </div>
    );
  } else if (!list.length) {
    body = (
      <div className="text-center py-12 text-sub text-[14px]">
        Nothing matches those filters.{" "}
        <button className="font-bold underline" style={{ color: "var(--accent)" }} onClick={() => setFilters({ ...filters, type: [], refund: [], stars: [], min: 0, max: 0, q: "" })}>Clear filters</button>
      </div>
    );
  } else if (picks.grouping === "headers") {
    body = tiers.map(([t, l], i) => (
      <div key={t} className={i ? "pt-2 mt-4 border-t-2" : ""} style={{ borderColor: TIER[t].line }}>
        <TierHeader tier={t} count={l.length} />
        <div className="space-y-3">{l.map(card)}</div>
      </div>
    ));
  } else if (picks.grouping === "tabs") {
    const cur = tiers.find(([t]) => t === tierTab) || tiers[0];
    body = (
      <>
        <div className="flex gap-1.5 mb-3">
          {tiers.map(([t, l]) => (
            <button key={t} onClick={() => setTierTab(t)} className="px-4 py-1.5 text-[13px] font-bold border"
              style={{ borderRadius: "var(--rp)", background: cur[0] === t ? TIER[t].grad : "#fff", color: cur[0] === t ? TIER[t].fg : "#535862", borderColor: cur[0] === t ? "transparent" : "#E9EAEB" }}>
              {TIER[t].label} <span className="opacity-70">{l.length}</span>
            </button>
          ))}
        </div>
        <div className="space-y-3">{cur[1].map(card)}</div>
      </>
    );
  } else body = <div className="space-y-3">{list.map(card)}</div>;

  if (userGrouping && city === 0) body = <Slot k="grouping" s={S} />;

  const showRail = picks.rail !== "bar" || picks.bookings !== "stepper";
  const toolbarPanel = (
    <div className="p-3 space-y-2.5" style={{ background: "var(--band)", borderRadius: "var(--r)" }}>
      {picks.filters !== "column" && <Slot k="filters" s={S}><Filters v={picks.filters} f={filters} set={setF} range={priceRange} /></Slot>}
      <Slot k="toolbar" s={S}><Toolbar v={picks.toolbar} count={list.length} f={filters} set={setF} /></Slot>
      <Slot k="notice" s={S}><Notice v={picks.notice} /></Slot>
    </div>
  );

  return (
    <ViewCtx.Provider value={{ mode: "seller", sources }}>
      <div className="relative h-full flex flex-col min-h-0" style={{ ...vars, background: "var(--page)" }}>
        <Slot k="topBar" s={S}><TopBar v={picks.topBar} city={city} setCity={setCity} booked={booked} support={picks.support} /></Slot>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex gap-4 p-4 items-start">
            {picks.filters === "column" && (
              <div className="w-[240px] shrink-0 sticky top-4 hidden md:block"><Slot k="filters" s={S}><Filters v="column" f={filters} set={setF} range={priceRange} /></Slot></div>
            )}
            <div className="flex-1 min-w-0 space-y-3">
              {toolbarPanel}
              {filters.byGuest && city === 0 && (
                <div className="text-[13px] font-semibold px-3 py-2 bg-[#ECFDF3] text-[#027A48]" style={{ borderRadius: "var(--rw)" }}>
                  ✓ {TRIP_STAYS[0].city} is marked as booked by the guest. It is removed from the hotel total.
                </div>
              )}
              {body}
            </div>
            {showRail && (
              <div className="w-[270px] shrink-0 space-y-3 sticky top-4 hidden lg:block">
                {picks.rail !== "bar" && <Slot k="rail" s={S}><PriceDetails v={picks.rail} trip={trip} delta={h.id !== ctx.currentId ? openedDelta : null} /></Slot>}
                <Slot k="bookings" s={S}><Bookings v={picks.bookings} booked={booked} bookedRate={bookedRate} byGuest={booking.byGuest} city={city} setCity={setCity} /></Slot>
              </div>
            )}
          </div>
        </div>
        {picks.rail === "bar" && <PriceDetails v="bar" trip={trip} />}
        <Slot k="support" s={S}><Support v={picks.support} absolute={!fixedSupport} /></Slot>

        {drawer && picks.detail !== "inline" && (
          <div className={`absolute inset-0 z-40 bg-black/35 flex ${picks.detail === "modal" ? "items-center justify-center p-6" : "justify-end"}`} onClick={() => setDrawer(false)}>
            <div onClick={(e) => e.stopPropagation()}
              className={`bg-white flex flex-col ${picks.detail === "modal" ? "w-full max-w-[880px] max-h-full rounded-2xl overflow-hidden" : "w-[min(680px,100%)] h-full"}`}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-divider">
                <b className="text-[14px] truncate">{h.name}</b>
                <span className="text-[12px] text-sub">from {inr(h.ib.fromPrice)}/night</span>
                <button onClick={() => setDrawer(false)} className="ml-auto w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center"><X size={17} /></button>
              </div>
              <div className="flex-1 overflow-y-auto"><HotelPage h={h} ctx={ctxFor(h)} /></div>
            </div>
          </div>
        )}
      </div>
    </ViewCtx.Provider>
  );
}

function findSel(h, rateId) {
  for (const room of h.rooms) {
    const r = room.rates.find((x) => x.rate_id === rateId);
    if (r) return { room, r };
  }
  return { room: h.rooms[0], r: h.rooms[0].rates[0] };
}
