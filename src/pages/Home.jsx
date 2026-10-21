import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PAGES = [
  ["/ib", "1 · Hotels in IB today", "A copy of how a seller sees a hotel in the Itinerary Builder now: the form row, hotel cards, room groups, rate rows and the Price Details box."],
  ["/universal", "2 · Universal hotel page", "One hotel record that joins IB's rates with the app's photos, reviews, honest bit, amenities, location and policies. Seller and couple views side by side."],
  ["/options", "3 · Design options", "Every UI element with 3 to 5 ways it could look. Pick one per element, then preview the full page with your picks."],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDF8F5] px-4 py-12">
      <div className="max-w-[760px] mx-auto">
        <img src={`${import.meta.env.BASE_URL}logo.png`} className="w-10 h-10 object-contain bg-transparent" />
        <h1 className="text-[34px] font-extrabold tracking-tight mt-4">Hotel revamp</h1>
        <p className="text-[15px] text-sub mt-2 leading-relaxed">
          The seller picking a hotel in the Itinerary Builder and the couple reading it in the 30 Sundays app should see the same hotel. This site joins the two data sources and lets you try layouts until one feels right.
        </p>
        <div className="mt-8 space-y-3">
          {PAGES.map(([to, t, d]) => (
            <Link key={to} to={to} className="group flex items-center gap-4 bg-white border border-divider rounded-[14px] p-5 hover:border-fuchsia transition">
              <div className="flex-1">
                <div className="text-[17px] font-bold">{t} <span className="text-[13px] font-mono text-inact ml-1">{to}</span></div>
                <div className="text-[13.5px] text-sub mt-1 leading-relaxed">{d}</div>
              </div>
              <ArrowRight className="text-inact group-hover:text-fuchsia" />
            </Link>
          ))}
        </div>
        <p className="text-[12px] text-inact mt-8">Sources: atul491/IB-repo-copy (hotel models, SearchedHotelList) and kashyaptibrewal0103/30sundays-app (hotel_v3 detail page, hotelDetailData).</p>
      </div>
    </div>
  );
}
