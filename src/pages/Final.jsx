import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, X } from "lucide-react";
import { ALL, FINAL, DesignOverride, useDesign } from "../design";
import { Workspace } from "./Universal";

const O = FINAL.picks;

// My recommended page: one pick per element, frozen, with the reason for each.
export default function Final() {
  const { apply } = useDesign();
  const nav = useNavigate();
  const [why, setWhy] = useState(true);
  const right = (
    <>
      <button onClick={() => setWhy(!why)} className="font-semibold border border-white/25 rounded px-2.5 py-1 flex items-center gap-1"><ListChecks size={13} /> Why these picks</button>
      <button onClick={() => { apply(O); nav("/options"); }} className="font-semibold border border-white/25 rounded px-2.5 py-1">Edit from here</button>
    </>
  );
  return (
    <DesignOverride o={O} c={{ tags: ["tier", "transfer"], hiddenParts: [] }} replace>
      <Workspace title="Final (recommended)" right={right} />
      {why && (
        <div className="fixed left-3 bottom-3 z-50 w-[360px] max-h-[60vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200 p-4 font-sans text-head">
          <div className="flex items-center mb-2"><b className="text-[15px]">Why these picks</b><button onClick={() => setWhy(false)} className="ml-auto"><X size={16} /></button></div>
          <div className="space-y-2.5">
            {ALL.filter((o) => FINAL.why[o.key]).map((o) => (
              <div key={o.key} className="text-[12.5px] leading-snug">
                <div className="font-bold">{o.title}: <span style={{ color: "#FD014F" }}>{o.variants.find((v) => v.id === O[o.key])?.label}</span></div>
                <div className="text-sub">{FINAL.why[o.key]}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DesignOverride>
  );
}
