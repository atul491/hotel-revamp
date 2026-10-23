import { useState } from "react";
import { Database, X } from "lucide-react";
import Screen from "../Screen";
import { useStay } from "../stay";
import { FIELD_SOURCES } from "../data/ibHotels";

// The page /universal and /final share: the IB seller screen.
export function Workspace({ title = "Seller screen", right }) {
  const stay = useStay();
  const [sources, setSources] = useState(false);
  const [legend, setLegend] = useState(false);

  return (
    <div className="h-screen flex flex-col font-inter bg-[#EEF0F4] text-[#343C6A]">
      <header className="bg-[#101828] text-white px-4 py-2 flex items-center gap-3 flex-wrap text-[12.5px]">
        <span className="font-bold text-[14px]">Hotel Revamp</span>
        <span className="opacity-60">/ {title}</span>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer text-white/80"><input type="checkbox" checked={sources} onChange={(e) => setSources(e.target.checked)} /> Data source tags</label>
          <button onClick={() => setLegend(true)} className="font-semibold border border-white/25 rounded px-2.5 py-1 flex items-center gap-1"><Database size={13} /> IB ↔ App fields</button>
          {right}
        </div>
      </header>
      <div className="flex-1 min-h-0 p-3">
        <div className="h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
          <Screen stay={stay} sources={sources} fixedSupport={false} />
        </div>
      </div>
      {legend && <Legend onClose={() => setLegend(false)} />}
    </div>
  );
}

export default function Universal() {
  return <Workspace />;
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
        <p className="text-[13px] text-ib-muted mb-3">Everything tagged "App only" must be added to the IB hotel record (or fetched from the app's content store by TravClan id) for the seller to see what the couple sees.</p>
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
