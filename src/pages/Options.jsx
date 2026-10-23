import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, RotateCcw, ExternalLink, Shuffle, Save, Trash2, MessageSquarePlus, Award, Headphones, PanelRight, Rows3 } from "lucide-react";
import { GLOBALS, SCREEN, BLOCKS, PRESETS, DEFAULTS, FINAL, CARD_PARTS, TAG_KINDS, useDesign, DesignOverride } from "../design";
import { ViewCtx } from "../kit";
import { Media, Title, Scores, Stay } from "../blocks/top";
import { Honest, Why, About, Amenities, Location, Reviews } from "../blocks/content";
import { Rooms, Policies, Similar, Nav, Cta, SellerPanel, SECTIONS } from "../blocks/commerce";
import { ListCard } from "../blocks/ListCard";
import { TopBar, Filters, Toolbar, Notice, TierHeader, PriceDetails, Bookings, Tags, TIER } from "../blocks/screen";
import { useStay } from "../stay";
import { useUserVariants, UserVariantView, CreateOption, UserCardActions, elementData } from "../user";

const SCREEN_KEYS = SCREEN.map((o) => o.key);
const GLOBAL_KEYS = GLOBALS.map((g) => g.key);
const GROUPS = [["Global look", GLOBALS], ["Selection screen", SCREEN], ["Hotel page", BLOCKS]];

function Schematic({ kind }) {
  const box = "bg-[#EEF0F4] rounded";
  if (kind === "drawer")
    return <div className="relative h-[150px] p-2"><div className={`${box} h-full`} /><div className="absolute right-2 top-2 bottom-2 w-[55%] bg-white border-2 rounded shadow-lg p-2" style={{ borderColor: "var(--accent)" }}><div className={`${box} h-10 mb-1`} /><div className={`${box} h-3 mb-1 w-2/3`} /><div className={`${box} h-3 w-1/2`} /></div></div>;
  if (kind === "modal")
    return <div className="relative h-[150px] p-2"><div className={`${box} h-full`} /><div className="absolute inset-x-10 inset-y-5 bg-white border-2 rounded-lg shadow-lg p-2" style={{ borderColor: "var(--accent)" }}><div className={`${box} h-10 mb-1`} /><div className={`${box} h-3 w-2/3`} /></div></div>;
  return <div className="h-[150px] p-2 space-y-1.5"><div className={`${box} h-8`} /><div className="bg-white border-2 rounded p-2" style={{ borderColor: "var(--accent)" }}><div className={`${box} h-3 w-1/3 mb-1`} /><div className="grid grid-cols-3 gap-1"><div className={`${box} h-9`} /><div className={`${box} h-9`} /><div className={`${box} h-9`} /></div></div><div className={`${box} h-8`} /></div>;
}

// What each element looks like with variant `v`.
function preview(key, v, s) {
  const { h, ctx, filters, setFilters, priceRange, list, booked, bookedRate, booking, trip, city, setCity, wish } = s;
  const p = (node) => <div className="px-[var(--pad)] py-[var(--pad)]">{node}</div>;
  const ctxFor = (x) => ({ ...ctx, sel: ctx.selOf(x), setSel: (q) => ctx.setSelFor(x, q) });
  switch (key) {
    case "topBar": return <TopBar v={v} city={city} setCity={setCity} booked={booked} support="fab" />;
    case "filters": return p(<div className="max-w-[270px]"><Filters v={v} f={filters} set={setFilters} range={priceRange} /></div>);
    case "toolbar": return p(<Toolbar v={v} count={list.length} f={filters} set={setFilters} />);
    case "notice": return p(v === "price" ? <ListCard h={h} v="ibrow" ctx={ctx} wished={false} /> : <Notice v={v} />);
    case "grouping":
      if (v === "tabs") return p(<div className="flex gap-1.5">{["gold", "silver", "bronze"].map((t, i) => <span key={t} className="px-4 py-1.5 text-[13px] font-bold border" style={{ borderRadius: "var(--rp)", background: i === 0 ? TIER[t].grad : "#fff", color: i === 0 ? TIER[t].fg : "#535862", borderColor: i ? "#E9EAEB" : "transparent" }}>{TIER[t].label}</span>)}</div>);
      if (v === "flat") return p(<div className="space-y-2">{list.slice(0, 4).map((x) => <div key={x.id} className="flex items-center gap-2 text-[13px] border border-divider p-2" style={{ borderRadius: "var(--rw)" }}><b className="flex-1">{x.name}</b><Tags h={x} v="pills" /></div>)}</div>);
      return p(<>{["gold", "silver", "bronze"].map((t) => <TierHeader key={t} tier={t} count={list.filter((x) => x.ib.tier === t).length} />)}</>);
    case "listCard": return p(<ListCard h={h} v={v} ctx={ctx} wished={wish.includes(h.id)} onOpen={() => {}} />);
    case "tags": return p(<ListCard h={list.find((x) => x.ib.tier === "silver") || h} v="ibrow" ctx={ctx} wished={false} />);
    case "detail": return <Schematic kind={v} />;
    case "rail": return p(<PriceDetails v={v} trip={trip} delta={4200} />);
    case "bookings": return p(v === "stepper" ? <div className="text-[13px] text-sub">No panel. The city tabs in the top bar carry the ✓.</div> : <Bookings v={v} booked={booked} bookedRate={bookedRate} byGuest={booking.byGuest} city={city} setCity={setCity} />);
    case "support":
      return <div className="relative h-[120px] bg-[#F7F8FA]">{v === "fab" && <span className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#1D2A5B] text-white flex items-center justify-center"><Headphones size={20} /></span>}{v === "link" && <span className="absolute top-4 right-4 text-[13px] font-semibold text-sub flex items-center gap-1"><Headphones size={14} /> Need help?</span>}</div>;
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
    case "rooms": return p(<Rooms h={h} v={v} ctx={ctxFor(h)} />);
    case "policies": return p(<Policies h={h} v={v} />);
    case "similar": return p(<Similar h={h} v={v} ctx={ctx} />);
    case "nav": return p(<><Nav v={v} ids={SECTIONS.map((x) => x[0])} scrollTo={() => {}} /><div className="h-16 mt-3 bg-surface" style={{ borderRadius: "var(--rw)" }} /></>);
    case "cta": return <div className="px-[var(--pad)]"><Cta h={h} v={v} ctx={ctx} /></div>;
    case "seller": return <ViewCtx.Provider value={{ mode: "seller", sources: false }}>{p(<><SellerPanel h={h} ctx={ctx} /><div className="mt-3"><Rooms h={h} v="hybrid" ctx={ctxFor(h)} /></div></>)}</ViewCtx.Provider>;
    default:
      return p(<div className="space-y-3"><Title h={h} v="inline" /><Scores h={h} v="strip" /><Rooms h={{ ...h, rooms: h.rooms.slice(0, 1) }} v="app" ctx={ctxFor(h)} /><Cta h={h} v="delta" ctx={ctx} /></div>);
  }
}

export default function Options() {
  const { picks, pick, apply, reset, shareQuery, custom, setCustom, myPresets, savePreset, deletePreset } = useDesign();
  const stay = useStay();
  const as = "seller";
  const u = useUserVariants();
  const [copied, setCopied] = useState(false);
  const all = [...GLOBALS, ...SCREEN, ...BLOCKS];
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
        <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <Link to="/" className="font-extrabold text-[15px]">Hotel Revamp</Link>
          <span className="text-[13px] text-sub">/ Design options</span>
          <span className="text-[12px] font-semibold bg-surface px-2 py-0.5 rounded-full">{changed} changed</span>
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            {PRESETS.map((pr) => (
              <button key={pr.id} onClick={() => apply(pr.picks || FINAL.picks)} className="text-[12px] font-semibold border border-divider bg-white rounded-md px-2.5 py-1 hover:border-head">{pr.label}</button>
            ))}
            {myPresets.map((pr) => (
              <button key={pr.name} onClick={() => apply(pr.picks, pr.custom)} className="text-[12px] font-semibold border border-fuchsia text-fuchsia bg-white rounded-md px-2.5 py-1">★ {pr.name}</button>
            ))}
            <button onClick={shuffle} title="Random mix" className="border border-divider rounded-md p-1.5 bg-white"><Shuffle size={14} /></button>
            <button onClick={reset} title="Reset" className="border border-divider rounded-md p-1.5 bg-white"><RotateCcw size={14} /></button>
            <button onClick={copy} className="text-[12px] font-semibold border border-divider bg-white rounded-md px-2.5 py-1 flex items-center gap-1">{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Share link"}</button>
            <Link to="/final" className="text-[12px] font-semibold border border-divider bg-white rounded-md px-2.5 py-1 flex items-center gap-1"><Award size={13} /> Final</Link>
            <Link to={`/universal${shareQuery()}`} className="text-[12px] font-bold bg-head text-white rounded-md px-3 py-1.5 flex items-center gap-1">Preview full screen <ExternalLink size={13} /></Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-[250px] shrink-0 hidden md:block sticky top-[49px] self-start h-[calc(100vh-49px)] overflow-y-auto border-r border-divider bg-white py-3">
          <button onClick={() => jump("custom")} className="w-full text-left px-4 py-1.5 mb-2 text-[13px] font-bold text-fuchsia">✦ Make your own</button>
          {GROUPS.map(([g, list]) => (
            <div key={g} className="mb-3">
              <div className="px-4 text-[10.5px] font-extrabold uppercase tracking-[0.9px] text-inact mb-1">{g}</div>
              {list.map((o) => (
                <button key={o.key} onClick={() => jump(o.key)} className="w-full text-left px-4 py-1.5 hover:bg-surface">
                  <div className="text-[13px] font-semibold leading-tight">{o.title}</div>
                  <div className={`text-[11.5px] ${picks[o.key] !== DEFAULTS[o.key] ? "text-fuchsia font-semibold" : "text-sub"}`}>
                    {o.variants.find((v) => v.id === picks[o.key])?.label || (u.find(o.key, picks[o.key])?.label ? `★ ${u.find(o.key, picks[o.key]).label}` : o.variants[0].label)}{u.list(o.key).length ? ` · ${u.list(o.key).length} yours` : ""}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <main className="flex-1 min-w-0 p-4 md:p-6 space-y-10">
          <div className="max-w-[920px]">
            <h1 className="text-[26px] font-extrabold tracking-tight">Build the hotel selection screen, one element at a time</h1>
            <p className="text-[14px] text-sub mt-1 leading-relaxed">
              The screen is broken into <b>{GLOBALS.length} global settings</b>, <b>{SCREEN.length} selection-screen elements</b> (top bar, filters, list, tags, price panel...) and <b>{BLOCKS.length} hotel-page blocks</b>. Every card is the real element with real data; click one to use it. At the end of each row, <b>Create my own version</b>: write what you want and/or add a screenshot, and it becomes a new option you can pick. Under <b>Make your own</b> you can set any colour, choose which card parts and tags show, and save your mix as a preset. Each element also takes a note for a version you want that isn't here. <b>Preview full screen</b> opens /universal with your picks; <b>Final</b> is my recommendation.
            </p>
          </div>

          <MakeYourOwn {...{ custom, setCustom, pick, picks, savePreset, deletePreset, myPresets }} />

          <ViewCtx.Provider value={{ mode: as, sources: false }}>
            {GROUPS.map(([g, list]) => (
              <div key={g} className="space-y-10">
                <div className="text-[12px] font-extrabold uppercase tracking-[1px] text-inact border-b border-divider pb-1">{g}</div>
                {list.map((o) => {
                  const wide = SCREEN_KEYS.includes(o.key) && !["filters", "rail", "bookings", "support", "detail"].includes(o.key);
                  return (
                    <section key={o.key} id={`opt-${o.key}`} className="scroll-mt-16">
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h2 className="text-[18px] font-bold">{o.title}</h2>
                          {o.where && <span className="text-[12px] text-sub">{o.where}</span>}
                        </div>
                        {o.hint && <p className="text-[12.5px] text-sub">{o.hint}</p>}
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 items-start">
                        {!GLOBAL_KEYS.includes(o.key) && <CreateOption o={o} data={elementData(o.key, { ...stay, custom })} onCreated={(id) => pick(o.key, id)} />}
                        {o.variants.map((v) => {
                          const on = picks[o.key] === v.id;
                          const isGlobal = GLOBAL_KEYS.includes(o.key);
                          return (
                            <div key={v.id} className={`shrink-0 ${wide ? "w-[660px]" : "w-[390px]"}`}>
                              <button onClick={() => pick(o.key, v.id)} className="w-full text-left mb-2 flex items-start gap-2">
                                <span className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? "bg-fuchsia border-fuchsia" : "border-[#D5D7DA] bg-white"}`}>{on && <Check size={12} color="#fff" strokeWidth={3} />}</span>
                                <span>
                                  <span className="text-[14px] font-bold">{v.label}</span>
                                  {v.id === DEFAULTS[o.key] && <span className="ml-1.5 text-[10px] font-bold text-white bg-head rounded px-1">CURRENT /FINAL</span>}
                                  {v.note && <span className="block text-[12px] text-sub leading-snug">{v.note}</span>}
                                </span>
                              </button>
                              <div onClick={() => pick(o.key, v.id)} className={`cursor-pointer bg-white rounded-xl overflow-hidden border-2 transition ${on ? "border-fuchsia shadow-lg" : "border-transparent hover:border-[#D5D7DA]"}`}>
                                {v.id === "off" ? (
                                  <div className="h-[120px] flex items-center justify-center text-[13px] text-inact">Hidden</div>
                                ) : (
                                  <DesignOverride o={{ [o.key]: v.id }}>
                                    <div className="max-h-[560px] overflow-y-auto overflow-x-hidden relative">
                                      {isGlobal && <Swatch k={o.key} v={v} custom={custom} />}
                                      {preview(isGlobal ? "_global" : o.key, v.id, stay)}
                                    </div>
                                  </DesignOverride>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {!GLOBAL_KEYS.includes(o.key) && u.list(o.key).map((v) => {
                          const on = picks[o.key] === v.id;
                          const data = elementData(o.key, { ...stay, custom });
                          return (
                            <div key={v.id} className={`shrink-0 ${wide ? "w-[660px]" : "w-[390px]"}`}>
                              <button onClick={() => pick(o.key, v.id)} className="w-full text-left mb-2 flex items-start gap-2">
                                <span className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? "bg-fuchsia border-fuchsia" : "border-[#D5D7DA] bg-white"}`}>{on && <Check size={12} color="#fff" strokeWidth={3} />}</span>
                                <span>
                                  <span className="text-[14px] font-bold">{v.label}</span>
                                  <span className="ml-1.5 text-[10px] font-bold text-white bg-fuchsia rounded px-1">YOURS</span>
                                  {v.status === "building" && <span className="ml-1.5 text-[10px] font-bold text-sub">building...</span>}
                                  {v.note && <span className="block text-[12px] text-sub leading-snug">{v.note}</span>}
                                </span>
                              </button>
                              <div onClick={() => pick(o.key, v.id)} className={`cursor-pointer bg-white rounded-xl overflow-hidden border-2 transition ${on ? "border-fuchsia shadow-lg" : "border-transparent hover:border-[#D5D7DA]"}`}>
                                <div className="max-h-[560px] overflow-y-auto overflow-x-hidden p-[var(--pad)]" style={{ "--pad": "12px" }}>
                                  <UserVariantView v={v} data={data} />
                                </div>
                              </div>
                              <UserCardActions o={o} v={v} data={data} />
                            </div>
                          );
                        })}
                      </div>
                      {GLOBAL_KEYS.includes(o.key) && <Note k={o.key} custom={custom} setCustom={setCustom} />}
                    </section>
                  );
                })}
              </div>
            ))}
          </ViewCtx.Provider>
          <Summary picks={picks} all={all} custom={custom} />
        </main>
      </div>
    </div>
  );
}

// ─── Make your own ───
function MakeYourOwn({ custom, setCustom, pick, picks, savePreset, deletePreset, myPresets }) {
  const [name, setName] = useState("");
  const togglePart = (k) => setCustom({ hiddenParts: custom.hiddenParts.includes(k) ? custom.hiddenParts.filter((x) => x !== k) : [...custom.hiddenParts, k] });
  const toggleTag = (k) => setCustom({ tags: custom.tags.includes(k) ? custom.tags.filter((x) => x !== k) : [...custom.tags, k] });
  const moveTag = (k, d) => {
    const t = [...custom.tags];
    const i = t.indexOf(k);
    if (i < 0 || i + d < 0 || i + d >= t.length) return;
    [t[i], t[i + d]] = [t[i + d], t[i]];
    setCustom({ tags: t });
  };
  const setColour = (c) => { setCustom({ accent: c }); pick("accent", "custom"); };
  const card = "bg-white border border-divider rounded-xl p-4";
  return (
    <section id="opt-custom" className="scroll-mt-16 max-w-[1240px]">
      <h2 className="text-[18px] font-bold mb-3">✦ Make your own</h2>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className={card}>
          <div className="text-[13.5px] font-bold mb-2">My colour</div>
          <div className="flex items-center gap-2">
            <input type="color" value={custom.accent} onChange={(e) => setColour(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-divider" />
            <input defaultValue={custom.accent} key={custom.accent} onBlur={(e) => /^#[0-9a-f]{6}$/i.test(e.target.value) && setColour(e.target.value)} className="w-[100px] border border-divider rounded px-2 py-1.5 text-[13px] font-mono" />
          </div>
          <button onClick={() => pick("accent", "custom")} className={`mt-2 text-[12px] font-semibold px-2.5 py-1 rounded border ${picks.accent === "custom" ? "bg-head text-white border-head" : "border-divider"}`}>{picks.accent === "custom" ? "✓ Using my colour" : "Use my colour"}</button>
          <p className="text-[11.5px] text-sub mt-2">The light and dark tints are made from it.</p>
        </div>
        <div className={card}>
          <div className="text-[13.5px] font-bold mb-2 flex items-center gap-1.5"><Rows3 size={14} /> Hotel card parts</div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {CARD_PARTS.map(([k, l]) => (
              <label key={k} className="flex items-center gap-1.5 text-[12.5px] cursor-pointer"><input type="checkbox" checked={!custom.hiddenParts.includes(k)} onChange={() => togglePart(k)} style={{ accentColor: "#FD014F" }} /> {l}</label>
            ))}
          </div>
          <p className="text-[11.5px] text-sub mt-2">Applies to the IB listing row.</p>
        </div>
        <div className={card}>
          <div className="text-[13.5px] font-bold mb-2 flex items-center gap-1.5"><PanelRight size={14} /> Tags up front, in this order</div>
          {TAG_KINDS.map(([k, l]) => {
            const on = custom.tags.includes(k);
            return (
              <div key={k} className="flex items-center gap-1.5 text-[12.5px] py-0.5">
                <input type="checkbox" checked={on} onChange={() => toggleTag(k)} style={{ accentColor: "#FD014F" }} />
                <span className="flex-1">{on && <b className="text-fuchsia mr-1">{custom.tags.indexOf(k) + 1}.</b>}{l}</span>
                {on && <><button onClick={() => moveTag(k, -1)} className="px-1 text-sub">↑</button><button onClick={() => moveTag(k, 1)} className="px-1 text-sub">↓</button></>}
              </div>
            );
          })}
        </div>
        <div className={card}>
          <div className="text-[13.5px] font-bold mb-2 flex items-center gap-1.5"><Save size={14} /> Save my mix as a preset</div>
          <div className="flex gap-1.5">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales team v1" className="flex-1 min-w-0 border border-divider rounded px-2 py-1.5 text-[13px]" />
            <button onClick={() => { if (name.trim()) { savePreset(name.trim()); setName(""); } }} className="bg-head text-white text-[12.5px] font-semibold rounded px-3">Save</button>
          </div>
          <div className="mt-2 space-y-1">
            {myPresets.length === 0 && <p className="text-[11.5px] text-sub">Saved presets appear here and in the top bar. They are kept in this browser; use Share link to send one to someone else.</p>}
            {myPresets.map((p) => (
              <div key={p.name} className="flex items-center text-[12.5px]"><span className="flex-1 font-semibold">★ {p.name}</span><button onClick={() => deletePreset(p.name)} className="text-sub p-1"><Trash2 size={13} /></button></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Note({ k, custom, setCustom }) {
  const [open, setOpen] = useState(!!custom.notes[k]);
  if (!open)
    return <button onClick={() => setOpen(true)} className="mt-1 text-[12px] font-semibold text-sub flex items-center gap-1 hover:text-head"><MessageSquarePlus size={13} /> Add a note or describe a version you want</button>;
  return (
    <textarea
      value={custom.notes[k] || ""}
      onChange={(e) => setCustom({ notes: { ...custom.notes, [k]: e.target.value } })}
      placeholder="What would you change? e.g. 'Arrow stepper, but show the chosen hotel name under each city'"
      className="mt-1 w-full max-w-[660px] h-[64px] border border-divider rounded-lg px-3 py-2 text-[13px] bg-white"
    />
  );
}

function Swatch({ k, v, custom }) {
  if (k === "accent") {
    const val = v.value || { accent: custom.accent, soft: "#fff", ink: custom.accent };
    return <div className="flex gap-1.5 px-4 pt-3">{[val.accent, val.soft, val.ink].map((c, i) => <span key={i} className="w-6 h-6 rounded-full border border-black/5" style={{ background: c }} title={c} />)}<span className="text-[11px] text-sub self-center ml-1 font-mono">{val.accent}</span></div>;
  }
  if (k === "font") return <div className="px-4 pt-3 text-[22px]" style={{ fontFamily: `'${v.value.head}'` }}>Aa Alila Seminyak</div>;
  return null;
}

function Summary({ picks, all, custom }) {
  const json = JSON.stringify({ picks, custom }, null, 2);
  return (
    <section className="max-w-[920px]">
      <h2 className="text-[18px] font-bold mb-2">Your picks</h2>
      <div className="bg-white border border-divider rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <tbody>
            {all.map((o) => (
              <tr key={o.key} className="border-b border-divider last:border-0 align-top">
                <td className="px-3 py-2 text-sub w-1/3">{o.title}</td>
                <td className={`px-3 py-2 font-semibold ${picks[o.key] !== DEFAULTS[o.key] ? "text-fuchsia" : ""}`}>{o.variants.find((v) => v.id === picks[o.key])?.label || "★ Your own version"}</td>
                <td className="px-3 py-2 text-[12px] text-sub">{custom.notes[o.key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="mt-3">
        <summary className="text-[13px] font-semibold cursor-pointer">Config JSON for engineering (picks, colour, card parts, tags, notes)</summary>
        <pre className="mt-2 bg-head text-white text-[12px] p-3 rounded-lg overflow-auto">{json}</pre>
      </details>
    </section>
  );
}
