// ─── Hotels the way the Itinerary Builder (IB) holds them ───
//
// Shapes are copied from atul491/IB-repo-copy:
//   • master list row      backend/utils.js calcAverageAndMap
//   • search API hotel     frontend/.../Hotels/SearchedHotelList.jsx mapSearchTabsToHotels
//   • room groups + rates  hotel.room_details (room_<std_room_id> → room_rates[])
//   • saved stay           formData.itinerary.hotels["0"] → 8-slot array (README.md)
//
// IB never carries photos, amenities, reviews or policies. Those live in the
// 30 Sundays app (hotelDetailData.js). `toUniversal` below joins the two so the
// seller and the couple read the same hotel.

import { HOTEL as RAW } from "./hotelDetailData";

// ─── Say each thing once ───
// The app's hotel repeats facts across blocks (breakfast in rooms, amenities,
// FAQs and About; "sea not swimmable" in the honest bit, About and FAQs...).
// Each fact keeps the one block where it belongs and is dropped elsewhere.
const drop = (list, test) => list.filter((x) => !test(x));
export const HOTEL = {
  ...RAW,
  // Honest bit owns "Good to know"; rooms own meal plans; Stay owns check-in times.
  aboutSections: drop(RAW.aboutSections, (s) => s.title === "Good to know"),
  facilityTop: drop(RAW.facilityTop, (f) => ["Breakfast included", "Adults only"].includes(f.label)),
  facilityGroups: RAW.facilityGroups.map((g) => ({ ...g, items: drop(g.items, (i) => /^Breakfast included|^Adults only/.test(i.label)) })),
  policies: drop(RAW.policies, (p) => p.key === "checkin"),
  faqs: drop(RAW.faqs, (f) => /swimmable|breakfast|airport/i.test(f.q)),
  // Honest bit has the building work; Payment policy has the tax; Children policy has age 16.
  legal: drop(RAW.legal, (l) => /^Construction|tax of 11|16 or older/.test(l)),
  // Location shows Indian restaurants; reviews show how many couples stayed.
  whyIndians: drop(RAW.whyIndians, (w) => ["footprints", "heart"].includes(w.icon)),
  // The video tile already shows the first photo as its poster.
  photos: RAW.photos.filter((p, i, a) => a.findIndex((q) => q.url === p.url) === i),
};

const U = (id, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const rate = (id, name, board, type, refundable, cost, sell, supplier, extra = {}) => ({
  rate_id: id,
  name,
  board_basis: { description: board, type },
  is_refundable: refundable,
  is_hold_allowed: !!extra.hold,
  is_PAN_mandatory: !!extra.pan,
  is_Passport_mandatory: !!extra.passport,
  pricing: { cost_price: cost, selling_price: sell },
  supplier,
});

export const IB_SEARCH_RESULTS = [
  {
    hotel_code: "57857138",
    tbo_code: "1368659",
    hotel: "Alila Seminyak",
    hotel_image: "",
    star_rating: "5",
    reviews: "9.2",
    contracted: true,
    recommended: true,
    tier: "gold",
    inclusions: ["Breakfast", "Welcome drink", "Free WiFi", "Express check-in", "Early check-in", "Pool access", "Honeymoon set-up"],
    private_sic: "Private",
    pricing: { selling_price: 13866 },
    // master-list columns that IB has but never shows
    master: {
      address: HOTEL.address,
      b_city: "Seminyak",
      state: "Bali",
      country: "Indonesia",
      collection: true,
      static_score: 91,
      g_rating: 4.6,
      g_review: 3120,
      number_of_reviews: 1840,
      beachfront: true,
      distance_from_beach_km: 0.2,
      distance_from_centre_km: 1.8,
      region: "South Bali",
      pdf_link: "https://cdn.30sundays.club/pdf/alila-seminyak.pdf",
    },
    room_details: {
      room_101: {
        std_room_id: "101",
        name: "Deluxe Suite, garden wing",
        room_rates: [
          rate("r-101-bb", "Deluxe Suite Garden", "Breakfast included", "BB", true, 11950, 13866, "Contracted", { hold: true }),
          rate("r-101-bb2", "Deluxe Suite Garden", "Breakfast included", "BB", true, 12180, 14120, "TBO"),
          rate("r-101-ro", "Deluxe Suite Garden", "Room only", "RO", false, 10400, 12070, "TBO", { pan: true }),
        ],
      },
      room_102: {
        std_room_id: "102",
        name: "Ocean Suite, upper floor",
        room_rates: [
          rate("r-102-bb", "Ocean Suite", "Breakfast included", "BB", true, 13150, 15266, "TBO", { pan: true }),
          rate("r-102-bb2", "Ocean Suite", "Breakfast included", "BB", true, 13400, 15540, "Travclan"),
          rate("r-102-hb", "Ocean Suite", "Breakfast + Dinner", "HB", true, 15900, 18440, "Travclan", { passport: true }),
        ],
      },
      room_103: {
        std_room_id: "103",
        name: "One Bedroom Pool Villa",
        room_rates: [
          rate("r-103-bb", "Pool Villa", "Breakfast included", "BB", false, 16600, 19466, "TBO", { pan: true, passport: true }),
        ],
      },
    },
  },
  {
    hotel_code: "40211877",
    tbo_code: "1199020",
    hotel: "W Bali Seminyak",
    hotel_image: "",
    star_rating: "5",
    reviews: "9.0",
    contracted: false,
    recommended: true,
    tier: "gold",
    inclusions: ["Breakfast", "Free WiFi", "Welcome drink", "Fitness centre", "Beach club access"],
    private_sic: "Private",
    pricing: { selling_price: 17999 },
    master: { address: "Jl. Petitenget, Seminyak, Bali", b_city: "Seminyak", distance_from_centre_km: 1.2, g_rating: 4.5, number_of_reviews: 4210, beachfront: true },
    image: U("1566073771259-6a8506099945"),
    room_details: {
      room_201: { std_room_id: "201", name: "Wonderful Garden Escape", room_rates: [rate("r-201-bb", "Wonderful Room", "Breakfast included", "BB", true, 15500, 17999, "TBO", { pan: true }), rate("r-201-bb2", "Wonderful Room", "Breakfast included", "BB", true, 15900, 18450, "Travclan")] },
    },
  },
  {
    hotel_code: "31877450",
    tbo_code: "1077310",
    hotel: "Katamama Suites",
    hotel_image: "",
    star_rating: "5",
    reviews: "9.4",
    contracted: false,
    recommended: null,
    tier: "silver",
    inclusions: ["Breakfast", "Coffee and tea", "Free WiFi", "Drinking water", "Pool access"],
    private_sic: "SIC",
    pricing: { selling_price: 21200 },
    master: { address: "Jl. Petitenget No.51B, Seminyak", b_city: "Seminyak", distance_from_centre_km: 1.6, g_rating: 4.7, number_of_reviews: 980 },
    image: U("1582719508461-905c673771fd"),
    room_details: {
      room_301: { std_room_id: "301", name: "Katamama Suite", room_rates: [rate("r-301-bb", "Suite", "Breakfast included", "BB", true, 18200, 21200, "Travclan")] },
    },
  },
  {
    hotel_code: "22018833",
    tbo_code: "",
    hotel: "Double-Six Luxury Hotel",
    hotel_image: "",
    star_rating: "4",
    reviews: "8.4",
    contracted: false,
    recommended: false,
    tier: "bronze",
    inclusions: ["Parking", "Free WiFi", "Drinking water", "Rooftop access"],
    private_sic: "Private",
    pricing: { selling_price: 9800 },
    master: { address: "Double Six Beach, Seminyak", b_city: "Seminyak", distance_from_centre_km: 0.9, g_rating: 4.4, number_of_reviews: 2650, beachfront: true },
    image: U("1564501049412-61c2a3083791"),
    room_details: {
      room_401: { std_room_id: "401", name: "Deluxe Ocean View", room_rates: [rate("r-401-ro", "Deluxe Ocean", "Room only", "RO", false, 8400, 9800, "TBO")] },
    },
  },
  {
    hotel_code: "61022417",
    tbo_code: "1402288",
    hotel: "The Haven Seminyak",
    hotel_image: "",
    star_rating: "4",
    reviews: "8.6",
    contracted: true,
    recommended: true,
    tier: "silver",
    inclusions: ["Breakfast", "Late check-in", "Parking", "Welcome drink", "Free WiFi", "Drinking water", "Pool access"],
    private_sic: "SIC",
    pricing: { selling_price: 7440 },
    master: { address: "Jl. Raya Seminyak No.500, Seminyak", b_city: "Seminyak", distance_from_centre_km: 0.6, g_rating: 4.5, number_of_reviews: 969 },
    image: U("1520250497591-112f2f40a3f4"),
    room_details: {
      room_501: { std_room_id: "501", name: "Superior Double Room", room_rates: [rate("r-501-bb", "Superior Double", "Breakfast included", "BB", false, 6400, 7440, "TBO"), rate("r-501-bbr", "Superior Double", "Breakfast included", "BB", true, 6550, 7601, "Travclan"), rate("r-501-bbr2", "Superior Double", "Breakfast included", "BB", true, 6700, 7780, "TBO")] },
      room_502: { std_room_id: "502", name: "Executive King Room", room_rates: [rate("r-502-bb", "Executive King", "Breakfast included", "BB", true, 6890, 7998, "TBO", { hold: true }), rate("r-502-bb2", "Executive King", "Breakfast included", "BB", true, 7000, 8120, "Travclan")] },
    },
  },
  {
    hotel_code: "70033120",
    tbo_code: "1500771",
    hotel: "Grandmas Plus Seminyak",
    hotel_image: "",
    star_rating: "3",
    reviews: "8.1",
    contracted: false,
    recommended: null,
    tier: "bronze",
    inclusions: ["Breakfast", "Parking", "Free WiFi", "Drinking water"],
    private_sic: "SIC",
    pricing: { selling_price: 4392 },
    master: { address: "Jl. Kunti, Seminyak", b_city: "Seminyak", distance_from_centre_km: 1.1, g_rating: 4.2, number_of_reviews: 1380 },
    image: U("1551882547-ff40c63fe5fa"),
    room_details: {
      room_601: { std_room_id: "601", name: "Deluxe Double Room", room_rates: [rate("r-601-ro", "Deluxe Double", "Room only", "RO", false, 3800, 4392, "TBO"), rate("r-601-bb", "Deluxe Double", "Breakfast included", "BB", true, 4300, 4999, "TBO", { pan: true })] },
    },
  },
];

// The stay as IB stores it on the itinerary. Slot meanings from README.md.
export const IB_SAVED_STAY = [
  57857138, // [0] travclan id
  3, // [1] nights
  "Seminyak", // [2] location
  13866, // [3] selling price / night
  "Alila Seminyak", // [4] name
  "Deluxe Suite, garden wing", // [5] room category
  true, // [6] dynamic price flag
  {
    tbo: "1368659",
    travClan: "57857138",
    supply_cost_inr: 11950,
    star_category: "5",
    bookingcom_ratings: "9.2",
    isHotelContracted: true,
    isRoomContracted: true,
    provider: "Contracted",
    meal_plan: "BB",
    std_room_id: "101",
    travclan_room_id: "r-101-bb",
    earlyCheckin: true,
    lateCheckout: false,
  }, // [7] extras
];

// The whole trip, one stay per city (the stepper in the IB top bar).
export const TRIP_STAYS = [
  { city: "Seminyak", nights: 3, from: "20 Jun", to: "23 Jun", demo: true },
  { city: "Ubud", nights: 2, from: "23 Jun", to: "25 Jun", booked: { hotel: "Komaneka at Bisma", room: "Deluxe Room", price: 9200 } },
  { city: "Nusa Penida", nights: 1, from: "25 Jun", to: "26 Jun" },
];
export const TRIP_PRICES = { addOns: 0, flights: 105156, activities: 86016, gstRate: 0.05, tcsRate: 0.02 };

export const IB_STAY_META = { city: "Seminyak", checkIn: "20 Jun 2026", nights: 3, adults: 2, deal: "Riya & Kabir · Bali honeymoon", phone: "+91 98•••• 4410" };

// ─── Join IB + app into one hotel the whole page reads from ───
// Every field records where it came from so the /universal page can badge it.
export function toUniversal(ib) {
  const isAlila = ib.hotel === HOTEL.name;
  const similar = HOTEL.similar.find((s) => s.name === ib.hotel);
  const base = HOTEL;
  const roomGroups = Object.values(ib.room_details || {});
  const rooms = roomGroups.map((g, i) => {
    const appRoom = isAlila ? base.rooms.find((r) => r.name === g.name) || base.rooms[i] : null;
    const r0 = base.rooms[i % base.rooms.length];
    return {
      ...(appRoom || { ...r0, name: g.name, id: g.std_room_id }),
      std_room_id: g.std_room_id,
      rates: [...g.room_rates].sort((a, b) => a.pricing.selling_price - b.pricing.selling_price),
    };
  });
  const lead = ib.image || base.photos[0].url;
  return {
    ...base,
    id: ib.hotel_code,
    name: ib.hotel,
    type: isAlila ? base.type : "Hotel",
    stars: Number(ib.star_rating),
    neighbourhood: isAlila ? base.neighbourhood : similar?.area || ib.master?.b_city,
    address: ib.master?.address || base.address,
    distanceFromCenter: ib.master?.distance_from_centre_km ?? base.distanceFromCenter,
    photos: isAlila ? base.photos : [{ url: lead, category: "Exterior", caption: ib.hotel }, ...base.photos.slice(1)],
    ratings: {
      ...base.ratings,
      booking: { ...base.ratings.booking, score: Number(ib.reviews), count: ib.master?.number_of_reviews ?? base.ratings.booking.count },
      google: { ...base.ratings.google, score: ib.master?.g_rating ?? base.ratings.google.score, count: ib.master?.g_review ?? base.ratings.google.count },
    },
    sundaysPick: Number(ib.reviews) >= 8.6,
    rooms,
    ib: {
      travclan_id: ib.hotel_code,
      tbo_id: ib.tbo_code,
      contracted: ib.contracted,
      recommended: ib.recommended,
      private_sic: ib.private_sic,
      tier: ib.tier,
      inclusions: ib.inclusions || [],
      fromPrice: ib.pricing.selling_price,
      master: ib.master,
    },
    contentComplete: isAlila,
  };
}

export const UNIVERSAL_HOTELS = IB_SEARCH_RESULTS.map(toUniversal);

// Where each block's data comes from. Drives the "Data source" legend on /universal.
export const FIELD_SOURCES = [
  { block: "Name, stars, Booking.com score", ib: "hotel, star_rating, reviews", app: "name, stars, ratings.booking", status: "both" },
  { block: "Contracted ©, Recommended 👍, Private/SIC", ib: "contracted, recommended, private_sic", app: "—", status: "ib" },
  { block: "Room groups and rates (supplier, cost, sell, refundable, hold, PAN/Passport)", ib: "room_details[].room_rates[]", app: "rooms[] (no rates)", status: "ib" },
  { block: "Photos, video, reels, gallery categories", ib: "hotel_image (unused)", app: "photos, video, reels", status: "app" },
  { block: "SUNDAYS PICK badge", ib: "—", app: "bookingScore ≥ 8.6", status: "app" },
  { block: "30 Sundays / Google / Tripadvisor scores", ib: "g_rating, g_review (master, hidden)", app: "ratings.*", status: "both" },
  { block: "The honest bit", ib: "—", app: "honest[]", status: "app" },
  { block: "Why Indian couples say yes", ib: "—", app: "whyIndians[]", status: "app" },
  { block: "About the stay", ib: "—", app: "aboutShort, aboutSections", status: "app" },
  { block: "Amenities / facilities", ib: "—", app: "facilityTop, facilityGroups", status: "app" },
  { block: "Location, distance, nearby", ib: "address, distance_from_centre_km, beachfront (master, hidden)", app: "address, coords, nearby", status: "both" },
  { block: "Reviews + AI summary", ib: "—", app: "reviews, reviewSummary, ratingBreakdown", status: "app" },
  { block: "Room detail (size, beds, view, in-room list)", ib: "room name only", app: "rooms[].size/beds/view/amenities", status: "app" },
  { block: "Check-in / check-out, early / late", ib: "earlyCheckin, lateCheckout (slot [7])", app: "stayBasics", status: "both" },
  { block: "Policies, legal info, FAQs", ib: "—", app: "policies, legal, faqs", status: "app" },
  { block: "Similar hotels", ib: "other search results in the same tab", app: "similar[]", status: "both" },
  { block: "Tier (30 Sundays Gold / Silver / Bronze)", ib: "collection tier (new IB listing)", app: "—", status: "ib" },
  { block: "Inclusions line (late check-in, breakfast, parking...)", ib: "rate inclusions (new IB listing)", app: "facilityTop (partly)", status: "both" },
  { block: "Hotel brochure PDF", ib: "pdf_link", app: "—", status: "ib" },
];
