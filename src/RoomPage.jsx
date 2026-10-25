import { useState } from "react";
import { ChevronLeft, ChevronRight, Ruler, BedDouble, Users, Eye, Check, Ban, ImageOff, Building2 } from "lucide-react";
import { Ico, amenityIcon } from "./kit";

// ─── Room detail panel (Booking.com style, Sunday colours) ───
//
// Opens in the same right-hand drawer as the hotel page when a seller clicks a
// room card. Photos, size, beds, guests, view, description and grouped
// facilities come from Trailix (HotelRoom + Media); meal plan, refundable and
// the refund policy from the live rate the seller clicked. Prices stay on the
// room cards and are not repeated here. A room with no Trailix match still
// opens and shows what the supplier gave us.

const IB = { navy: "#181e4c", body: "#1e293b", secondary: "#334155", label: "#94a3b8", divider: "#e0e2eb", bg: "#f9f9fb", pink: "#fd014f", pinkDivider: "#f8bacc", green: "#4eac7e", greenBg: "#f1f9f5", red: "#d70143", redBg: "#fff1f1" };
const BATHROOM = /bath|shower|toilet|towel|hairdryer|toiletries|robe|slipper|bidet|vanity/i;

const chipIcon = (label) => {
  if (/balcony|terrace/i.test(label)) return "sun";
  if (/air ?con/i.test(label)) return "zap";
  if (/bath|shower/i.test(label)) return "bath";
  if (/tv|screen/i.test(label)) return "sparkles";
  if (/wifi/i.test(label)) return "wifi";
  if (/pool/i.test(label)) return "waves";
  if (/safe/i.test(label)) return "shield";
  if (/coffee|tea|kettle|minibar/i.test(label)) return "coffee";
  return amenityIcon(label).icon;
};

export default function RoomPage({ h, room, ctx, onOpenHotel, highlightRateId }) {
  const [i, setI] = useState(0);
  const photos = room.images || [];
  const amenities = room.amenities || [];
  const bathroom = amenities.filter((a) => BATHROOM.test(a));
  const facilities = amenities.filter((a) => !BATHROOM.test(a));
  const chips = [room.size && `${room.size} m²`, ...amenities.filter((a) => /balcony|air ?con|private bathroom|flat-screen|tv|pool|wifi/i.test(a)).slice(0, 4)].filter(Boolean);
  const matched = photos.length > 0 || amenities.length > 0 || room.description;
  // The card the seller clicked is one room + meal plan + refund policy; the panel names that policy.
  const opened = room.rates.find((r) => r.rate_id === highlightRateId) || room.rates[0];
  const refundable = !!opened?.is_refundable;

  return (
    <div className="px-5 pb-6" style={{ fontFamily: "Geist, Inter, system-ui, sans-serif", color: IB.body }}>
      {/* Photos */}
      {photos.length > 0 ? (
        <div className="pt-4">
          <div className="relative overflow-hidden rounded-xl bg-[#f4f2f0]" style={{ aspectRatio: "16 / 10" }}>
            <img src={photos[i]} alt="" className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={() => setI((i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center"><ChevronLeft size={18} /></button>
                <button onClick={() => setI((i + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center"><ChevronRight size={18} /></button>
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {photos.map((_, k) => <span key={k} className="w-2 h-2 rounded-full bg-white" style={{ opacity: k === i ? 1 : 0.5 }} />)}
                </div>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
              {photos.map((p, k) => (
                <button key={k} onClick={() => setI(k)} className="shrink-0 w-[72px] h-[54px] rounded-md overflow-hidden" style={{ outline: k === i ? `2px solid ${IB.pink}` : "1px solid #e0e2eb", outlineOffset: -1 }}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed flex items-center gap-3 px-4 py-5 text-[13px]" style={{ borderColor: IB.divider, color: IB.secondary, background: IB.bg }}>
          <ImageOff size={18} className="shrink-0" style={{ color: IB.label }} />
          Photos not available yet for this room. Showing the details the supplier sent.
        </div>
      )}

      {/* Title + chips */}
      <div className="mt-4 flex items-center gap-2.5 flex-wrap">
        <h2 style={{ fontSize: 22, lineHeight: "28px", fontWeight: 700, color: IB.navy }}>{room.name}</h2>
        {opened && (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5" style={{ fontSize: 12.5, fontWeight: 500, color: refundable ? IB.green : IB.red, background: refundable ? IB.greenBg : IB.redBg }}>
            {refundable ? <Check size={12} /> : <Ban size={12} />} {refundable ? "Refundable" : "Non Refundable"}
          </span>
        )}
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {chips.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 border bg-white" style={{ borderColor: IB.divider, fontSize: 12.5, color: IB.body }}>
              <Ico name={/m²/.test(c) ? "ruler" : chipIcon(c)} size={13} /> {c}
            </span>
          ))}
        </div>
      )}

      {/* Facts */}
      <div className="mt-4 space-y-2 text-[14px]">
        {room.size && <div className="flex items-center gap-2"><Ruler size={16} style={{ color: IB.label }} /><b>Room size</b> {room.size} m²{room.sizeTip && <span className="ml-1 text-[12px] font-medium rounded-full px-2 py-0.5" style={{ color: IB.green, background: IB.greenBg }}>{room.sizeTip}</span>}</div>}
        {room.beds && <div className="flex items-center gap-2"><BedDouble size={16} style={{ color: IB.label }} />{room.beds}</div>}
        {room.sleeps && <div className="flex items-center gap-2"><Users size={16} style={{ color: IB.label }} />Sleeps {room.sleeps}</div>}
        {room.view && <div className="flex items-center gap-2"><Eye size={16} style={{ color: IB.label }} />{room.view}</div>}
      </div>

      {room.description && <p className="mt-4 text-[14px] leading-[22px]" style={{ color: IB.secondary }}>{room.description}</p>}

      {/* Facilities, grouped like Booking.com */}
      {bathroom.length > 0 && <Group title="In your private bathroom" items={bathroom} />}
      {facilities.length > 0 && <Group title="Facilities" items={facilities} />}
      {matched && (
        <div className="mt-4 text-[14px]"><b>Smoking:</b> <span style={{ color: IB.secondary }}>{room.smoking ? "Smoking allowed" : "No smoking"}</span></div>
      )}

      <div className="mt-6 pt-4 border-t" style={{ borderColor: IB.divider }} />
      <button onClick={onOpenHotel} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: IB.pink }}>
        <Building2 size={14} /> View {h.name} details <ChevronRight size={13} />
      </button>
    </div>
  );
}

function Group({ title, items }) {
  return (
    <div className="mt-5">
      <div className="text-[14px] font-bold mb-2">{title}:</div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {items.map((a) => (
          <div key={a} className="flex items-center gap-2 text-[14px]"><Check size={14} style={{ color: "#64748b" }} /> {a}</div>
        ))}
      </div>
    </div>
  );
}
