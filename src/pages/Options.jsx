import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, RotateCcw, ExternalLink, Shuffle, Monitor, Smartphone } from "lucide-react";
import { GLOBALS, BLOCKS, PRESETS, DEFAULTS, useDesign, DesignOverride } from "../design";
import { ViewCtx } from "../kit";
import { Media, Title, Scores, Stay } from "../blocks/top";
import { Honest, Why, About, Amenities, Location, Reviews } from "../blocks/content";
import { Rooms, Policies, Similar, Nav, Cta, SellerPanel, SECTIONS } from "../blocks/commerce";
import { ListCard } from "../blocks/ListCard";
import { useStay } from "../stay";

// What each element looks like with variant `v`. Globals preview a small slice of the page.
function preview(key, v, h, ctx) {
  const p = (node) => <div className="px-[var(--pad)] py-[var(--pad)]">{node}</div>;
  switch (key) {
    case "listCard": return p(<ListCard h={h} v={v} ctx={ctx} onOpen={() => {}} />);
    case "media": return <div className={v === "strip" ? "" : "p-[var(--pad)]"}><Media h={h} v={v} /></div>;
    case "title": return p(<Title h={h} v={v} />);
    case "scores": return p(<Scores h={h} v={v} />);
    case "stay": return p(<Stay h={h} v={v} ctx={ctx} />);
    case "honest": return p(<Honest h={h} v={v} />);
    case "why": return p(<Why h={h} v={v} />);
    case "about": return p(<About h={h} v={v} />);
    case "amenities": return p(<Amenities h={h} v={v} />);
    case "location": return p(<Location h={h} v={v} />);
    case "reviews": return p(<Reviews h={h} v={v} />);
    case "rooms": return p(<Rooms h={h} v={v} ctx={ctx} />);
    case "policies": return p(<Policies h={h} v={v} />);
    case "similar": return p(<Similar h={h} v={v} ctx={ctx} />);
    case "nav": return p(<><Nav v={v} ids={SECTIONS.map((s) => s[0])} scrollTo={() => {}} /><div className="h-16 mt-3 bg-surface" style={{ borderRadius: "var(--rw)" }} /></>);
    case "cta": return <div className="px-[var(--pad)]"><Cta h={h} v={v} ctx={ctx} /></div>;
    case "seller": return <ViewCtx.Provider value={{ mode: "seller", sources: false }}>{p(<><SellerPanel h={h} ctx={ctx} /><div className="mt-3"><Rooms h={h} v="hybrid" ctx={ctx} /></div></>)}</ViewCtx.Provider>;
    default:
      return p(<div className="space-y-3"><Title h={h} v="inline" /><Scores h={h} v="strip" /><Rooms h={{ ...h, rooms: h.rooms.slice(0, 1) }} v="app" ctx={ctx} /><Cta h={h} v="delta" ctx={ctx} /></div>);
  }
}

const GLOBAL_KEYS = GLOBALS.map((g) => g.key);

export default function Options() {
  const { picks, pick, apply, reset, shareQuery } = useDesign();
  const { h, ctx } = useStay();
  const [as, setAs] = useState("customer");
  const [copied, setCopied] = useState(false);
  const all = [...GLOBALS, ...BLOCKS];
  const changed = useMemo(() => Object.keys(picks).filter((k) => picks[k] !== DEFAULTS[k]).length, [picks]);

  const copy = () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}universal${shareQuery()}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  const shuffle = () => apply(Object.fromEntries(all.map((o) => [o.key, o.variants[Math.floor(Math.random() * o.variants.length)].id])));
  const jump = (k) => document.getElementById(`opt-${k}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-head font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-divider">
        <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <Link to="/" className="font-extrabold text-[15px]">Hotel Revamp</Link>
          <span className="text-[13px] text-sub">/ Design options</span>
          <span className="text-[12px] font-semibold bg-surface px-2 py-0.5 rounded-full">{changed} changed from app default</span>
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            <div className="flex bg-surface rounded-md p-0.5 mr-1">
              {[["customer", "As couple", Smartphone], ["seller", "As seller", Monitor]].map(([k, l, I]) => (
                <button key={k} onClick={() => setAs(k)} className={`px-2.5 py-1 text-[12px] font-semibold rounded flex items-center gap-1 ${as === k ? "bg-white shadow" : "text-sub"}`}><I size={13} /> {l}</button>
              ))}
            </div>
            {PRESETS.map((pr) => (
              <button key={pr.id} onClick={() => apply(pr.picks)} className="text-[12px] font-semibold border border-divider bg-white rounded-md px-2.5 py-1 hover:border-head">{pr.label}</button>
            ))}
            <button onClick={shuffle} title="Random mix" className="border border-divider rounded-md p-1.5 bg-white"><Shuffle size={14} /></button>
            <button onClick={reset} title="Reset to app default" className="border border-divider rounded-md p-1.5 bg-white"><RotateCcw size={14} /></button>
            <button onClick={copy} className="text-[12px] font-semibold border border-divider bg-white rounded-md px-2.5 py-1 flex items-center gap-1">{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Share link"}</button>
            <Link to={`/universal${shareQuery()}`} className="text-[12px] font-bold bg-head text-white rounded-md px-3 py-1.5 flex items-center gap-1">Preview full page <ExternalLink size={13} /></Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-[250px] shrink-0 hidden md:block sticky top-[49px] self-start h-[calc(100vh-49px)] overflow-y-auto border-r border-divider bg-white py-3">
          {[["Global look", GLOBALS], ["Page elements", BLOCKS]].map(([g, list]) => (
            <div key={g} className="mb-3">
              <div className="px-4 text-[10.5px] font-extrabold uppercase tracking-[0.9px] text-inact mb-1">{g}</div>
              {list.map((o) => (
                <button key={o.key} onClick={() => jump(o.key)} className="w-full text-left px-4 py-1.5 hover:bg-surface">
                  <div className="text-[13px] font-semibold leading-tight">{o.title}</div>
                  <div className={`text-[11.5px] ${picks[o.key] !== DEFAULTS[o.key] ? "text-fuchsia font-semibold" : "text-sub"}`}>{o.variants.find((v) => v.id === picks[o.key])?.label}</div>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className="flex-1 min-w-0 p-4 md:p-6 space-y-10">
          <div className="max-w-[900px]">
            <h1 className="text-[26px] font-extrabold tracking-tight">Pick how each part of the hotel page looks</h1>
            <p className="text-[14px] text-sub mt-1 leading-relaxed">
              Every card below is the real block, rendered with the Alila Seminyak data that both the IB seller and the couple will see. Click a card to use it. Picks are saved in this browser, and <b>Preview full page</b> opens /universal with them. Global choices (colour, type, corners) re-theme every preview.
            </p>
          </div>
          <ViewCtx.Provider value={{ mode: as, sources: false }}>
            {all.map((o) => (
              <section key={o.key} id={`opt-${o.key}`} className="scroll-mt-16">
                <div className="mb-3">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h2 className="text-[18px] font-bold">{o.title}</h2>
                    {o.where && <span className="text-[12px] text-sub">{o.where}</span>}
                  </div>
                  {o.hint && <p className="text-[12.5px] text-sub">{o.hint}</p>}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 items-start">
                  {o.variants.map((v) => {
                    const on = picks[o.key] === v.id;
                    const isGlobal = GLOBAL_KEYS.includes(o.key);
                    return (
                      <div key={v.id} className="shrink-0 w-[390px]">
                        <button onClick={() => pick(o.key, v.id)} className="w-full text-left mb-2 flex items-start gap-2">
                          <span className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? "bg-fuchsia border-fuchsia" : "border-[#D5D7DA] bg-white"}`}>{on && <Check size={12} color="#fff" strokeWidth={3} />}</span>
                          <span>
                            <span className="text-[14px] font-bold">{v.label}</span>
                            {v.id === o.variants[0].id && <span className="ml-1.5 text-[10px] font-bold text-sub bg-white border border-divider rounded px-1">DEFAULT</span>}
                            {v.note && <span className="block text-[12px] text-sub leading-snug">{v.note}</span>}
                          </span>
                        </button>
                        <div onClick={() => pick(o.key, v.id)}
                          className={`cursor-pointer bg-white rounded-xl overflow-hidden border-2 transition ${on ? "border-fuchsia shadow-lg" : "border-transparent hover:border-[#D5D7DA]"}`}>
                          {v.id === "off" ? (
                            <div className="h-[120px] flex items-center justify-center text-[13px] text-inact">This block is hidden from the page</div>
                          ) : (
                            <DesignOverride o={{ [o.key]: v.id }}>
                              <div className="max-h-[560px] overflow-y-auto overflow-x-hidden relative">
                                {isGlobal && <Swatch k={o.key} v={v} />}
                                {preview(isGlobal ? "_global" : o.key, v.id, h, ctx)}
                              </div>
                            </DesignOverride>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </ViewCtx.Provider>
          <Summary picks={picks} all={all} />
        </main>
      </div>
    </div>
  );
}

function Swatch({ k, v }) {
  if (k === "accent")
    return <div className="flex gap-1.5 px-4 pt-3">{[v.value.accent, v.value.soft, v.value.ink].map((c, i) => <span key={i} className="w-6 h-6 rounded-full border border-black/5" style={{ background: c }} title={c} />)}<span className="text-[11px] text-sub self-center ml-1 font-mono">{v.value.accent}</span></div>;
  if (k === "font") return <div className="px-4 pt-3 text-[22px]" style={{ fontFamily: `'${v.value.head}'` }}>Aa Alila Seminyak</div>;
  return null;
}

function Summary({ picks, all }) {
  const json = JSON.stringify(picks, null, 2);
  return (
    <section className="max-w-[900px]">
      <h2 className="text-[18px] font-bold mb-2">Your picks</h2>
      <div className="bg-white border border-divider rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <tbody>
            {all.map((o) => (
              <tr key={o.key} className="border-b border-divider last:border-0">
                <td className="px-3 py-2 text-sub w-1/2">{o.title}</td>
                <td className={`px-3 py-2 font-semibold ${picks[o.key] !== DEFAULTS[o.key] ? "text-fuchsia" : ""}`}>{o.variants.find((v) => v.id === picks[o.key])?.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="mt-3">
        <summary className="text-[13px] font-semibold cursor-pointer">Config JSON for engineering</summary>
        <pre className="mt-2 bg-head text-white text-[12px] p-3 rounded-lg overflow-auto">{json}</pre>
      </details>
    </section>
  );
}
