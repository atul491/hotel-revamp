import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, SlidersHorizontal, Database, Smartphone, Monitor, Columns2, X } from "lucide-react";
import { useDesign } from "../design";
import { ViewCtx } from "../kit";
import { ListCard } from "../blocks/ListCard";
import HotelPage from "../HotelPage";
import { useStay, STAY } from "../stay";
import { FIELD_SOURCES, IB_STAY_META } from "../data/ibHotels";

const MODES = [
  ["seller", "Seller", Monitor],
  ["customer", "Couple", Smartphone],
  ["both", "Side by side", Columns2],
];

export default function Universal() {
  const { picks, vars, shareQuery } = useDesign();
  const { h, ctx, openId, setOpenId, hotels } = useStay();
  const [mode, setMode] = useState("both");
  const [sources, setSources] = useState(false);
  const [legend, setLegend] = useState(false);
  const sellerRef = useRef(null);
  const custRef = useRef(null);
  const open = (id) => {
    setOpenId(id);
    sellerRef.current?.scrollTo({ top: 0 });
    custRef.current?.scrollTo({ top: 0 });
  };
  const c = { ...ctx, open };

  return (
    <div className="h-screen flex flex-col font-inter bg-[#F5F7FA] text-[#343C6A]">
      {/* IB-style top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-wrap">
        <Link to="/" className="font-bold text-[15px] text-ib-teal">Hotel Revamp</Link>
        <span className="text-[13px] text-ib-muted hidden md:inline">{IB_STAY_META.deal}</span>
        <div className="flex items-center gap-1.5 bg-ib-teal text-white text-[13px] font-semibold px-3 py-1.5 rounded">
          {STAY.city} | {IB_STAY_META.checkIn} | {STAY.nights}N <CheckCircle2 size={14} /> <span className="font-normal opacity-90 truncate max-w-[180px]">{h.name}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded p-0.5">
            {MODES.map(([k, l, I]) => (
              <button key={k} onClick={() => setMode(k)} className={`px-2.5 py-1 text-[12.5px] font-semibold rounded flex items-center gap-1 ${mode === k ? "bg-white shadow text-[#343C6A]" : "text-ib-muted"}`}>
                <I size={13} /> {l}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-[12.5px] text-ib-muted cursor-pointer">
            <input type="checkbox" checked={sources} onChange={(e) => setSources(e.target.checked)} /> Data source tags
          </label>
          <button onClick={() => setLegend(true)} className="text-[12.5px] font-semibold border border-gray-300 rounded px-2.5 py-1 flex items-center gap-1"><Database size={13} /> IB ↔ App fields</button>
          <Link to={`/options${shareQuery()}`} className="text-[12.5px] font-semibold border-2 border-ib-teal text-ib-teal hover:bg-ib-teal hover:text-white rounded px-2.5 py-1 flex items-center gap-1"><SlidersHorizontal size={13} /> Design options</Link>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* Results list */}
        <aside className="w-[380px] shrink-0 border-r border-gray-200 overflow-y-auto p-3 space-y-3 hidden lg:block" style={vars}>
          <div className="font-inter text-[13px] text-ib-muted px-1">{hotels.length} hotels in {STAY.city} · sorted contracted first</div>
          <ViewCtx.Provider value={{ mode: mode === "customer" ? "customer" : "seller", sources: false }}>
            {hotels.map((x) => (
              <ListCard key={x.id} h={x} v={picks.listCard} ctx={ctx} active={x.id === openId} onOpen={() => open(x.id)} />
            ))}
          </ViewCtx.Provider>
        </aside>

        {/* Detail */}
        <main className="flex-1 min-w-0 flex gap-4 p-4 overflow-hidden justify-center">
          {mode !== "customer" && (
            <Pane title="Seller sees (Itinerary Builder)" width={mode === "both" ? 560 : 720} innerRef={sellerRef}>
              <ViewCtx.Provider value={{ mode: "seller", sources }}>
                <div style={vars}><HotelPage h={h} ctx={c} scrollRef={sellerRef} /></div>
              </ViewCtx.Provider>
            </Pane>
          )}
          {mode !== "seller" && (
            <Pane title="Couple sees (30 Sundays app)" width={390} phone innerRef={custRef}>
              <ViewCtx.Provider value={{ mode: "customer", sources }}>
                <div style={vars}><HotelPage h={h} ctx={c} scrollRef={custRef} /></div>
              </ViewCtx.Provider>
            </Pane>
          )}
        </main>
      </div>

      {/* Mobile list switcher */}
      <div className="lg:hidden border-t border-gray-200 bg-white flex gap-2 overflow-x-auto p-2">
        {hotels.map((x) => (
          <button key={x.id} onClick={() => open(x.id)} className={`shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded border ${x.id === openId ? "border-ib-teal text-ib-teal" : "border-gray-200 text-ib-muted"}`}>{x.name}</button>
        ))}
      </div>

      {legend && <Legend onClose={() => setLegend(false)} />}
    </div>
  );
}

function Pane({ title, width, phone, children, innerRef }) {
  return (
    <div className="flex flex-col min-h-0 min-w-0" style={{ width, maxWidth: "100%" }}>
      <div className="text-[12px] font-bold uppercase tracking-wide text-ib-muted mb-2 flex items-center gap-1.5">{phone ? <Smartphone size={13} /> : <Monitor size={13} />} {title}</div>
      <div ref={innerRef} className={`flex-1 min-h-0 overflow-y-auto bg-white ${phone ? "rounded-[28px] border-[6px] border-[#1F2937]" : "rounded-lg border border-gray-200 shadow-sm"}`}>
        {children}
      </div>
    </div>
  );
}

function Legend({ onClose }) {
  const tag = { ib: ["IB only", "#E6F7F5", "#00857A"], app: ["App only", "#FFE6ED", "#C00840"], both: ["Both", "#EEF4FF", "#3538CD"] };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-[860px] w-full max-h-[85vh] overflow-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center mb-1">
          <h2 className="text-[18px] font-semibold">Where each block's data comes from</h2>
          <button onClick={onClose} className="ml-auto"><X size={18} /></button>
        </div>
        <p className="text-[13px] text-ib-muted mb-3">IB today shows name, ₹, Booking / star rating and rate rows only. Everything tagged "App only" must be added to the IB hotel record (or fetched from the app's content store by TravClan id) for the seller to see what the couple sees.</p>
        <table className="w-full text-[12.5px] border-collapse">
          <thead><tr className="bg-ib-teal text-white text-left"><th className="p-2">Block</th><th className="p-2">IB field</th><th className="p-2">App field</th><th className="p-2">Source</th></tr></thead>
          <tbody>
            {FIELD_SOURCES.map((f) => (
              <tr key={f.block} className="border-b border-gray-100">
                <td className="p-2 font-semibold">{f.block}</td><td className="p-2 font-mono text-[11.5px]">{f.ib}</td><td className="p-2 font-mono text-[11.5px]">{f.app}</td>
                <td className="p-2"><span className="px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap" style={{ background: tag[f.status][1], color: tag[f.status][2] }}>{tag[f.status][0]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
