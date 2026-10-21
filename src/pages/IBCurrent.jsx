import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronDown, Star, ThumbsUp } from "lucide-react";
import { IB_SEARCH_RESULTS, IB_SAVED_STAY, IB_STAY_META } from "../data/ibHotels";

// ─── Today's IB, as close to the repo as possible ───
// Recreates HotelSectionWithTwoButton (form row) and SearchedHotelList
// (HotelListCard + GroupedRoomCard + Price Details) with IB's own tokens:
// Inter, teal #00A898, blue #333C6A, yellow #FDA201, muted #848aa5.

export default function IBCurrent() {
  const [open, setOpen] = useState({ [IB_SEARCH_RESULTS[0].hotel_code]: true });
  const [sel, setSel] = useState(IB_SAVED_STAY[7].travclan_room_id);
  const [acc, setAcc] = useState(false);
  const all = IB_SEARCH_RESULTS.flatMap((h) => Object.values(h.room_details).flatMap((g) => g.room_rates.map((r) => ({ h, g, r }))));
  const chosen = all.find((x) => x.r.rate_id === sel);
  const hotelsTotal = chosen ? chosen.r.pricing.selling_price * IB_SAVED_STAY[1] : 0;

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-inter text-[#343C6A]">
      <div className="bg-white border-b px-4 py-2 flex items-center gap-3 text-[13px]">
        <Link to="/" className="font-bold text-ib-teal">Hotel Revamp</Link>
        <span className="text-ib-muted">/ How a hotel looks in IB today (recreated from IB-repo-copy)</span>
        <Link to="/universal" className="ml-auto font-semibold border-2 border-ib-teal text-ib-teal hover:bg-ib-teal hover:text-white rounded px-3 py-1">See the universal version →</Link>
      </div>

      {/* 1. Form card: HotelSectionWithTwoButton */}
      <div className="p-4">
        <div className="text-[12px] font-bold uppercase tracking-wide text-ib-muted mb-2">1 · Itinerary form → Hotel Details (HotelSectionWithTwoButton.jsx)</div>
        <div className="bg-white rounded-lg shadow-md py-6 px-4 max-w-[1100px]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[22px] font-semibold">Hotel Details</div>
            <div className="flex gap-2">
              {["Search Hotels", "Select Rooms"].map((b) => <button key={b} className="border-2 border-ib-teal hover:bg-ib-teal hover:text-white px-3 py-2 rounded text-[14px]">{b}</button>)}
            </div>
          </div>
          <div className="grid grid-cols-[4rem_8rem_8rem_17rem_1fr_6rem_2rem] gap-2 text-[13px] text-[#718EBF] font-semibold px-1 mb-1">
            <span>Nights</span><span>Check-In</span><span>Location</span><span>Hotel Name</span><span>Room Type</span><span>Price</span><span />
          </div>
          <div className="grid grid-cols-[4rem_8rem_8rem_17rem_1fr_6rem_2rem] gap-2 text-[14px] items-center">
            {[IB_SAVED_STAY[1], IB_STAY_META.checkIn, IB_SAVED_STAY[2], IB_SAVED_STAY[4], IB_SAVED_STAY[5], IB_SAVED_STAY[3]].map((x, i) => (
              <div key={i} className="border border-gray-300 rounded px-2 py-2 truncate">{x}</div>
            ))}
            <button onClick={() => setAcc(!acc)}><ChevronDown size={18} className={acc ? "rotate-180" : ""} /></button>
          </div>
          {acc && (
            <div className="bg-gray-200 mt-2 rounded p-3 text-[13px] grid grid-cols-3 gap-1">
              {["bookingcom_ratings", "star_category", "manualEntry", "earlyCheckin", "lateCheckout", "meal_plan"].map((k) => (
                <div key={k}><span className="text-ib-muted">{k}:</span> <b>{String(IB_SAVED_STAY[7][k] ?? false)}</b></div>
              ))}
            </div>
          )}
          <div className="mt-3 text-[13px] font-semibold text-ib-teal">0 Nights Remaining</div>
        </div>
      </div>

      {/* 2. Searched hotel list */}
      <div className="px-4 pb-8">
        <div className="text-[12px] font-bold uppercase tracking-wide text-ib-muted mb-2">2 · Room selection page /searched-hotel-list/:id (SearchedHotelList.jsx)</div>
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-2 border-b p-2">
            <div className="bg-ib-teal text-white rounded px-3 py-2 text-[14px] font-semibold flex items-center gap-1.5">
              {IB_STAY_META.city} | {IB_STAY_META.checkIn} | {IB_STAY_META.nights}N <CheckCircle2 size={15} />
              <span className="font-normal text-[12px]">{chosen?.h.hotel} – {chosen?.g.name}</span>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="bg-ib-teal text-white px-4 py-2 rounded text-[14px]">Submit</button>
              <button className="border-2 border-ib-teal px-4 py-2 rounded text-[14px]">Edit</button>
            </div>
          </div>
          <div className="flex gap-2 p-2">
            {/* Sidebar */}
            <aside className="w-[16rem] shrink-0 border rounded p-3 text-[13px] space-y-3">
              <div className="text-[16px] font-semibold">Hotel Selection</div>
              <details open><summary className="font-semibold cursor-pointer">Personal Details</summary>
                <div className="text-ib-muted mt-1 space-y-0.5"><div>{IB_STAY_META.deal}</div><div>{IB_STAY_META.phone}</div><div>D/N: 4D/3N · From: Delhi</div><div>Destination: Bali</div></div>
              </details>
              <details open><summary className="font-semibold cursor-pointer">Filters</summary>
                <div className="mt-2 space-y-2">
                  <input placeholder="Search hotel" className="w-full border rounded px-2 py-1" />
                  <div><div className="font-semibold mb-1">Type</div>{["Private", "SIC"].map((t) => <label key={t} className="mr-3"><input type="checkbox" className="mr-1" />{t}</label>)}</div>
                  <div><div className="font-semibold mb-1">Star Rating</div>{[5, 4, 3].map((s) => <label key={s} className="flex items-center gap-1"><input type="checkbox" />{s} <Star size={12} fill="#FDA201" color="#FDA201" /></label>)}</div>
                  <div><div className="font-semibold mb-1">Price Range</div><div className="flex gap-1"><input placeholder="₹ min" className="w-1/2 border rounded px-2 py-1" /><input placeholder="₹ max" className="w-1/2 border rounded px-2 py-1" /></div></div>
                </div>
              </details>
            </aside>

            {/* Cards */}
            <div className="flex-1 min-w-0">
              <label className="flex items-center gap-2 bg-white shadow rounded-md p-3 m-4 text-[14px]"><input type="radio" name="hbbg" /> Hotel Booked By Guest</label>
              {IB_SEARCH_RESULTS.map((h) => (
                <div key={h.hotel_code} className="flex flex-col max-w-[48rem] bg-white shadow-lg rounded-md p-4 m-4">
                  <div className="flex justify-between">
                    <div>
                      <h1 className="flex items-center gap-1 text-[22px] font-semibold">
                        {h.hotel}{h.contracted && " ©"}
                        {h.recommended === true && <ThumbsUp size={17} fill="#00A898" color="#00A898" />}
                        {h.recommended === false && <ThumbsUp size={17} fill="#ff0000" color="#ff0000" className="rotate-180" />}
                      </h1>
                      <h4 className="text-lg font-bold text-ib-blue">₹ {h.pricing.selling_price.toLocaleString()}</h4>
                      <div><span className="font-medium text-ib-muted">Booking Rating:</span> {Number(h.reviews).toFixed(1)}/10</div>
                      <div><span className="font-medium text-ib-muted">Star Rating:</span> {Number(h.star_rating).toFixed(1)}/5</div>
                      <p className="font-medium text-ib-muted">{h.private_sic === "SIC" ? "SIC" : "Private"}</p>
                    </div>
                    <button onClick={() => setOpen({ ...open, [h.hotel_code]: !open[h.hotel_code] })} className="self-end border py-2 px-4 rounded-md text-ib-teal">{open[h.hotel_code] ? "Hide Rooms ▲" : "Show Rooms ▼"}</button>
                  </div>
                  {open[h.hotel_code] && (
                    <div className="mt-3">
                      <div className="font-semibold mb-2">Available Rooms:</div>
                      {Object.values(h.room_details).map((g) => (
                        <div key={g.std_room_id} className="flex border rounded-md p-3 mb-2 gap-3">
                          <div className="w-1/3 font-semibold" style={{ color: h.contracted ? "#00A898" : "#FDA201" }}>{g.name}{h.contracted && " ©"}</div>
                          <div className="w-2/3 space-y-1.5">
                            <div className="text-[13px] text-ib-muted">Lowest Price: ₹{Math.min(...g.room_rates.map((r) => r.pricing.selling_price)).toLocaleString()}</div>
                            {g.room_rates.map((r) => (
                              <label key={r.rate_id} className={`flex items-center cursor-pointer text-ib-muted justify-between border rounded-md p-2 text-[13px] ${sel === r.rate_id ? "border-2 border-ib-teal bg-gray-50" : "border-gray-200"}`}>
                                <span className="font-medium">{r.name.slice(0, 30)} – {r.board_basis.description} ({r.board_basis.type})</span>
                                <span className="flex gap-2 items-center">
                                  {r.is_refundable ? <span className="text-ib-teal">Free Cancellation</span> : <span className="text-ib-dpink">Non-refundable</span>}
                                  {r.is_hold_allowed && <span className="text-blue-600">Hold Booking Allowed</span>}
                                  {r.is_PAN_mandatory && <span className="text-indigo-600">PAN Required</span>}
                                  {r.is_Passport_mandatory && <span className="text-indigo-600">Passport Required</span>}
                                  <span className="text-sm font-semibold text-ib-blue">₹{r.pricing.selling_price.toLocaleString()}</span>
                                  <input type="radio" checked={sel === r.rate_id} onChange={() => setSel(r.rate_id)} />
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button className="mx-4 border-2 border-ib-teal rounded px-4 py-2 text-[14px]">See More</button>
            </div>

            {/* Price details */}
            <div className="w-[16rem] shrink-0 hidden xl:block">
              <div className="bg-[#FEDA99] rounded-[12px] p-4 text-[14px] space-y-1.5 sticky top-2">
                <div className="font-semibold text-[16px]">Price Details</div>
                {[["Hotels", hotelsTotal], ["Add Ons", 0], ["Flights", 38400], ["Activities", 12600]].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span>{k}</span><span>₹{v.toLocaleString()}</span></div>
                ))}
                <div className="flex justify-between"><span>GST</span><span>₹{Math.round((hotelsTotal + 51000) * 0.05).toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-ib-dpink border-t border-black/10 pt-1.5"><span>Total</span><span>₹{Math.round((hotelsTotal + 51000) * 1.05).toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1100px] mt-4 text-[13px] bg-white border-l-4 border-ib-yellow rounded p-3 leading-relaxed">
          <b>What the seller is missing today:</b> no photos (the &lt;img&gt; in HotelListCard is commented out), no amenities, no reviews beyond one Booking.com number, no location, no room size / bed / view, no policies, no honest bit. The couple sees all of this in the app. <Link to="/universal" className="text-ib-teal font-semibold underline">/universal</Link> shows both on one record.
        </div>
      </div>
    </div>
  );
}
