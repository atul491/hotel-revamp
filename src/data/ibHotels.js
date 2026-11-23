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
import { nearest } from "./places";

// ─── Say each thing once ───
// The app's hotel repeats facts across blocks (breakfast in rooms, amenities,
// FAQs and About; "sea not swimmable" in the honest bit, About and FAQs...).
// Each fact keeps the one block where it belongs and is dropped elsewhere.
const drop = (list, test) => list.filter((x) => !test(x));
export const HOTEL = {
  ...RAW,
  // Honest bit owns "Good to know"; rooms own meal plans; Stay owns check-in times.
  aboutSections: drop(RAW.aboutSections, (s) => s.title === "Good to know"),
  facilityTop: drop(RAW.facilityTop, (f) => ["Breakfast included", "Adults only"].includes(f.label)).map(({ note, ...f }) => f),
  facilityGroups: RAW.facilityGroups.map((g) => ({ ...g, items: drop(g.items, (i) => /^Breakfast included|^Adults only/.test(i.label)) })),
  policies: drop(RAW.policies, (p) => p.key === "checkin" || p.key === "ids"),
  faqs: drop(RAW.faqs, (f) => /swimmable|breakfast|airport/i.test(f.q)),
  // Honest bit has the building work; Payment policy has the tax; Children policy has age 16.
  legal: drop(RAW.legal, (l) => /^Construction|tax of 11|16 or older/.test(l)),
  // Location shows Indian restaurants; reviews show how many couples stayed.
  whyIndians: drop(RAW.whyIndians, (w) => ["footprints", "heart"].includes(w.icon)),
  // The video tile already shows the first photo as its poster.
  photos: RAW.photos.filter((p, i, a) => a.findIndex((q) => q.url === p.url) === i),
  nearby: Object.fromEntries(Object.entries(RAW.nearby).filter(([k]) => k !== "Essentials")),
  rooms: RAW.rooms.map(({ sizeTip, ...r }) => r),
};

const U = (id, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

const rate = (id, name, board, type, refundable, cost, sell, supplier, extra = {}) => ({
  rate_id: id,
  name,
  board_basis: { description: board, type },
  is_refundable: refundable,
  pricing: { cost_price: cost, selling_price: sell },
  supplier,
});

export const IB_SEARCH_RESULTS = [
  {
    hotel_code: "57857138",
    tbo_code: "1368659",
    hotel: "Alila Seminyak",
    city: "Seminyak",
    hotel_image: "",
    coords: { lat: -8.6772, lng: 115.1553 },
    metro: { name: "Seminyak Station", walkMin: 4, meters: 300 },
    meetingPoint: { name: "Petitenget bus stop", walkMin: 6, meters: 450 },
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
          rate("r-101-bb", "Deluxe Suite Garden", "Breakfast included", "BB", true, 11950, 13866, "Contracted"),
          rate("r-101-bb2", "Deluxe Suite Garden", "Breakfast included", "BB", true, 12180, 14120, "TBO"),
          rate("r-101-ro", "Deluxe Suite Garden", "Room only", "RO", false, 10400, 12070, "TBO"),
        ],
      },
      room_102: {
        std_room_id: "102",
        name: "Ocean Suite, upper floor",
        room_rates: [
          rate("r-102-bb", "Ocean Suite", "Breakfast included", "BB", true, 13150, 15266, "TBO"),
          rate("r-102-bb2", "Ocean Suite", "Breakfast included", "BB", true, 13400, 15540, "Travclan"),
          rate("r-102-hb", "Ocean Suite", "Breakfast + Dinner", "HB", true, 15900, 18440, "Travclan"),
        ],
      },
      room_103: {
        std_room_id: "103",
        name: "One Bedroom Pool Villa",
        room_rates: [
          rate("r-103-bb", "Pool Villa", "Breakfast included", "BB", false, 16600, 19466, "TBO"),
        ],
      },
    },
  },
  {
    hotel_code: "40211877",
    tbo_code: "1199020",
    hotel: "W Bali Seminyak",
    city: "Seminyak",
    hotel_image: "",
    coords: { lat: -8.6797, lng: 115.1517 },
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
      room_201: { std_room_id: "201", name: "Wonderful Garden Escape", room_rates: [rate("r-201-bb", "Wonderful Room", "Breakfast included", "BB", true, 15500, 17999, "TBO"), rate("r-201-bb2", "Wonderful Room", "Breakfast included", "BB", true, 15900, 18450, "Travclan")] },
    },
  },
  {
    hotel_code: "31877450",
    tbo_code: "1077310",
    hotel: "Katamama Suites",
    city: "Seminyak",
    hotel_image: "",
    coords: { lat: -8.6823, lng: 115.1548 },
    meetingPoint: { name: "Petitenget bus stop", walkMin: 9, meters: 700 },
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
    city: "Seminyak",
    hotel_image: "",
    coords: { lat: -8.6975, lng: 115.1618 },
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
    city: "Seminyak",
    hotel_image: "",
    coords: { lat: -8.6896, lng: 115.1602 },
    metro: { name: "Seminyak Square Station", walkMin: 3, meters: 220 },
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
      room_502: { std_room_id: "502", name: "Executive King Room", room_rates: [rate("r-502-bb", "Executive King", "Breakfast included", "BB", true, 6890, 7998, "TBO"), rate("r-502-bb2", "Executive King", "Breakfast included", "BB", true, 7000, 8120, "Travclan")] },
    },
  },
  {
    hotel_code: "70033120",
    tbo_code: "1500771",
    hotel: "Grandmas Plus Seminyak",
    city: "Seminyak",
    hotel_image: "",
    coords: { lat: -8.6915, lng: 115.1660 },
    roomContent: false, // no Trailix room match yet: no room photos / facilities
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
      room_601: { std_room_id: "601", name: "Deluxe Double Room", room_rates: [rate("r-601-ro", "Deluxe Double", "Room only", "RO", false, 3800, 4392, "TBO"), rate("r-601-bb", "Deluxe Double", "Breakfast included", "BB", true, 4300, 4999, "TBO")] },
    },
  },
  // ─── Ubud and Nusa Penida ───
  // Placeholder rows in Trailix's shape (Hotel.name / city / latitude / longitude /
  // starCategory / bookingComRating / numberOfReviews). Hotel names are real;
  // coordinates and scores are approximate until Trailix's database is wired in.
  {
    hotel_code: "ub-komaneka", tbo_code: "1510022", hotel: "Komaneka at Bisma", city: "Ubud", area: "Bisma, Ubud", hotel_image: "",
    coords: { lat: -8.5107, lng: 115.2548 }, star_rating: "5", reviews: "9.3", contracted: true, recommended: true, tier: "gold",
    inclusions: ["Breakfast", "Welcome drink", "Free WiFi", "Afternoon tea", "Yoga class", "Shuttle to Ubud centre"], private_sic: "Private",
    pricing: { selling_price: 9200 }, image: U("1540541338287-41700207dee6"),
    master: { address: "Jl. Bisma, Ubud, Gianyar, Bali", b_city: "Ubud", distance_from_centre_km: 1.1, g_rating: 4.7, number_of_reviews: 1120, pdf_link: "" },
    room_details: {
      room_ub1: { std_room_id: "ub1", name: "Deluxe Room", room_rates: [rate("r-ub1-bb", "Deluxe Room", "Breakfast included", "BB", true, 7900, 9200, "Travclan"), rate("r-ub1-bb2", "Deluxe Room", "Breakfast included", "BB", true, 8100, 9450, "TBO")] },
      room_ub2: { std_room_id: "ub2", name: "Bisma Suite", room_rates: [rate("r-ub2-bb", "Bisma Suite", "Breakfast included", "BB", true, 11200, 13050, "Travclan")] },
    },
  },
  {
    hotel_code: "ub-kayon", tbo_code: "1522810", hotel: "The Kayon Jungle Resort", city: "Ubud", area: "Bresela, Ubud", hotel_image: "",
    coords: { lat: -8.4615, lng: 115.2781 }, star_rating: "5", reviews: "9.4", contracted: false, recommended: true, tier: "gold",
    inclusions: ["Breakfast", "Free WiFi", "Welcome drink", "Infinity pool", "Shuttle to Ubud centre"], private_sic: "Private",
    pricing: { selling_price: 16800 }, image: U("1571896349842-33c89424de2d"),
    master: { address: "Banjar Bresela, Payangan, Gianyar, Bali", b_city: "Ubud", distance_from_centre_km: 7.4, g_rating: 4.8, number_of_reviews: 980 },
    room_details: { room_ub3: { std_room_id: "ub3", name: "Jungle Pool Villa", room_rates: [rate("r-ub3-bb", "Pool Villa", "Breakfast included", "BB", true, 14500, 16800, "TBO"), rate("r-ub3-hb", "Pool Villa", "Breakfast + Dinner", "HB", true, 16900, 19600, "TBO")] } },
  },
  {
    hotel_code: "ub-kamandalu", tbo_code: "1366120", hotel: "Kamandalu Ubud", city: "Ubud", area: "Tegallalang Road, Ubud", hotel_image: "",
    coords: { lat: -8.4849, lng: 115.2693 }, star_rating: "5", reviews: "9.2", contracted: true, recommended: true, tier: "gold",
    inclusions: ["Breakfast", "Free WiFi", "Afternoon tea", "Rice paddy walk", "Shuttle to Ubud centre"], private_sic: "Private",
    pricing: { selling_price: 12400 }, image: U("1520250497591-112f2f40a3f4"),
    master: { address: "Jl. Andong, Banjar Nagi, Ubud, Bali", b_city: "Ubud", distance_from_centre_km: 3.2, g_rating: 4.7, number_of_reviews: 1430 },
    room_details: { room_ub4: { std_room_id: "ub4", name: "Garden Villa", room_rates: [rate("r-ub4-bb", "Garden Villa", "Breakfast included", "BB", true, 10700, 12400, "Contracted"), rate("r-ub4-bb2", "Garden Villa", "Breakfast included", "BB", false, 10200, 11850, "TBO")] } },
  },
  {
    hotel_code: "ub-alaya", tbo_code: "1398772", hotel: "Alaya Resort Ubud", city: "Ubud", area: "Hanoman Street, Ubud", hotel_image: "",
    coords: { lat: -8.5162, lng: 115.2640 }, star_rating: "4", reviews: "9.0", contracted: false, recommended: true, tier: "silver",
    inclusions: ["Breakfast", "Free WiFi", "Welcome drink", "Pool access"], private_sic: "SIC",
    pricing: { selling_price: 7600 }, image: U("1582719508461-905c673771fd"),
    master: { address: "Jl. Hanoman, Ubud, Gianyar, Bali", b_city: "Ubud", distance_from_centre_km: 0.9, g_rating: 4.6, number_of_reviews: 2210 },
    room_details: { room_ub5: { std_room_id: "ub5", name: "Deluxe Room", room_rates: [rate("r-ub5-bb", "Deluxe", "Breakfast included", "BB", true, 6500, 7600, "TBO"), rate("r-ub5-ro", "Deluxe", "Room only", "RO", false, 5800, 6750, "Travclan")] } },
  },
  {
    hotel_code: "ub-bisma8", tbo_code: "1456031", hotel: "Bisma Eight", city: "Ubud", area: "Bisma, Ubud", hotel_image: "",
    coords: { lat: -8.5100, lng: 115.2560 }, star_rating: "4", reviews: "9.1", contracted: false, recommended: null, tier: "silver",
    inclusions: ["Breakfast", "Free WiFi", "Drinking water", "Pool access"], private_sic: "SIC",
    pricing: { selling_price: 8900 }, image: U("1566073771259-6a8506099945"),
    master: { address: "Jl. Bisma, Ubud, Gianyar, Bali", b_city: "Ubud", distance_from_centre_km: 1.0, g_rating: 4.6, number_of_reviews: 760 },
    room_details: { room_ub6: { std_room_id: "ub6", name: "Canopy Suite", room_rates: [rate("r-ub6-bb", "Canopy Suite", "Breakfast included", "BB", true, 7700, 8900, "TBO")] } },
  },
  {
    hotel_code: "ub-village", tbo_code: "1211947", hotel: "Ubud Village Hotel at Monkey Forest", city: "Ubud", area: "Monkey Forest Road, Ubud", hotel_image: "",
    coords: { lat: -8.5190, lng: 115.2600 }, star_rating: "3", reviews: "8.5", contracted: false, recommended: false, tier: "bronze",
    inclusions: ["Breakfast", "Free WiFi", "Parking"], private_sic: "SIC", roomContent: false,
    pricing: { selling_price: 4150 }, image: U("1551882547-ff40c63fe5fa"),
    master: { address: "Jl. Monkey Forest, Ubud, Gianyar, Bali", b_city: "Ubud", distance_from_centre_km: 0.7, g_rating: 4.3, number_of_reviews: 1980 },
    room_details: { room_ub7: { std_room_id: "ub7", name: "Superior Room", room_rates: [rate("r-ub7-bb", "Superior", "Breakfast included", "BB", false, 3600, 4150, "TBO")] } },
  },
  {
    hotel_code: "np-warnakali", tbo_code: "1600221", hotel: "Adiwana Warnakali Resort", city: "Nusa Penida", area: "Toya Pakeh, Nusa Penida", hotel_image: "",
    coords: { lat: -8.6730, lng: 115.4786 }, star_rating: "4", reviews: "9.4", contracted: true, recommended: true, tier: "gold",
    inclusions: ["Breakfast", "Free WiFi", "Harbour pickup", "Snorkelling gear", "Infinity pool"], private_sic: "Private",
    pricing: { selling_price: 11800 }, image: U("1540541338287-41700207dee6"),
    master: { address: "Jl. Raya Toya Pakeh, Nusa Penida, Klungkung, Bali", b_city: "Nusa Penida", distance_from_centre_km: 6.8, g_rating: 4.8, number_of_reviews: 640 },
    room_details: { room_np1: { std_room_id: "np1", name: "Ocean View Suite", room_rates: [rate("r-np1-bb", "Ocean Suite", "Breakfast included", "BB", true, 10200, 11800, "Contracted"), rate("r-np1-bb2", "Ocean Suite", "Breakfast included", "BB", true, 10600, 12300, "TBO")] } },
  },
  {
    hotel_code: "np-semabu", tbo_code: "1633108", hotel: "Semabu Hills Hotel Nusa Penida", city: "Nusa Penida", area: "Semabu, Nusa Penida", hotel_image: "",
    coords: { lat: -8.6922, lng: 115.5248 }, star_rating: "4", reviews: "8.6", contracted: false, recommended: true, tier: "silver",
    inclusions: ["Breakfast", "Free WiFi", "Harbour pickup", "Pool access"], private_sic: "SIC",
    pricing: { selling_price: 6900 }, image: U("1520250497591-112f2f40a3f4"),
    master: { address: "Jl. Semabu, Batununggul, Nusa Penida, Bali", b_city: "Nusa Penida", distance_from_centre_km: 2.9, g_rating: 4.5, number_of_reviews: 1310 },
    room_details: { room_np2: { std_room_id: "np2", name: "Deluxe Hill View", room_rates: [rate("r-np2-bb", "Deluxe", "Breakfast included", "BB", true, 5900, 6900, "TBO"), rate("r-np2-ro", "Deluxe", "Room only", "RO", false, 5200, 6050, "TBO")] } },
  },
  {
    hotel_code: "np-bambu", tbo_code: "1641775", hotel: "Penida Bambu Green Suites", city: "Nusa Penida", area: "Toya Pakeh, Nusa Penida", hotel_image: "",
    coords: { lat: -8.6708, lng: 115.4848 }, star_rating: "3", reviews: "9.0", contracted: false, recommended: null, tier: "silver",
    inclusions: ["Breakfast", "Free WiFi", "Harbour pickup", "Drinking water"], private_sic: "SIC",
    pricing: { selling_price: 5400 }, image: U("1582719508461-905c673771fd"),
    master: { address: "Toya Pakeh, Nusa Penida, Klungkung, Bali", b_city: "Nusa Penida", distance_from_centre_km: 6.3, g_rating: 4.6, number_of_reviews: 520 },
    room_details: { room_np3: { std_room_id: "np3", name: "Bamboo Suite", room_rates: [rate("r-np3-bb", "Bamboo Suite", "Breakfast included", "BB", true, 4600, 5400, "Travclan")] } },
  },
  {
    hotel_code: "np-atuh", tbo_code: "1655309", hotel: "Atuh Forest Cottage", city: "Nusa Penida", area: "Pejukutan, Nusa Penida", hotel_image: "",
    coords: { lat: -8.7595, lng: 115.6100 }, star_rating: "3", reviews: "8.9", contracted: false, recommended: null, tier: "bronze",
    inclusions: ["Breakfast", "Free WiFi", "Parking"], private_sic: "SIC", roomContent: false,
    pricing: { selling_price: 3800 }, image: U("1566073771259-6a8506099945"),
    master: { address: "Pejukutan, Nusa Penida, Klungkung, Bali", b_city: "Nusa Penida", distance_from_centre_km: 12.5, g_rating: 4.6, number_of_reviews: 410 },
    room_details: { room_np4: { std_room_id: "np4", name: "Forest Cottage", room_rates: [rate("r-np4-bb", "Cottage", "Breakfast included", "BB", false, 3200, 3800, "TBO")] } },
  },
  {
    hotel_code: "np-pandawa", tbo_code: "1660912", hotel: "Pandawa Beach Villas", city: "Nusa Penida", area: "Sampalan, Nusa Penida", hotel_image: "",
    coords: { lat: -8.6770, lng: 115.5330 }, star_rating: "3", reviews: "8.4", contracted: false, recommended: false, tier: "bronze",
    inclusions: ["Breakfast", "Free WiFi", "Beach access"], private_sic: "SIC", roomContent: false,
    pricing: { selling_price: 4400 }, image: U("1551882547-ff40c63fe5fa"),
    master: { address: "Sampalan, Nusa Penida, Klungkung, Bali", b_city: "Nusa Penida", distance_from_centre_km: 0.8, g_rating: 4.3, number_of_reviews: 690 },
    room_details: { room_np5: { std_room_id: "np5", name: "Beach Villa", room_rates: [rate("r-np5-bb", "Beach Villa", "Breakfast included", "BB", true, 3700, 4400, "TBO")] } },
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
// A city has a hotel only once the seller presses Select (saved: null = nothing chosen yet).
export const TRIP_STAYS = [
  { city: "Seminyak", nights: 3, from: "20 Jun", to: "23 Jun", checkIn: "Sat, 20 Jun", checkOut: "Tue, 23 Jun", dayRange: "Day 1–4", saved: null },
  { city: "Ubud", nights: 2, from: "23 Jun", to: "25 Jun", checkIn: "Tue, 23 Jun", checkOut: "Thu, 25 Jun", dayRange: "Day 4–6", saved: null },
  { city: "Nusa Penida", nights: 1, from: "25 Jun", to: "26 Jun", checkIn: "Thu, 25 Jun", checkOut: "Fri, 26 Jun", dayRange: "Day 6–7", saved: null },
];
export const TRIP_PRICES = { addOns: 0, flights: 105156, activities: 86016, gstRate: 0.05, tcsRate: 0.02 };

// Where the map opens: the city centre (Trailix Region / legacy city centre).
// City centres (Trailix Region.latitude / longitude; Ubud from its sample row).
export const CITY_CENTRE = {
  Seminyak: { lat: -8.6905, lng: 115.1655 },
  Ubud: { lat: -8.5069, lng: 115.2625 },
  "Nusa Penida": { lat: -8.6780, lng: 115.5440 },
};

export const IB_STAY_META = { city: "Seminyak", checkIn: "20 Jun 2026", nights: 3, adults: 2, deal: "Riya & Kabir · Bali honeymoon", phone: "+91 98•••• 4410" };

// ─── Join IB + app into one hotel the whole page reads from ───
// Every field records where it came from so the /universal page can badge it.
// Shape the list row reads: name, minutes, metres, and whether that is a walk or a drive.
const toLine = (p) => (p ? { name: p.name.replace(/^Meeting point · /, ""), walkMin: p.min, mode: p.mode, meters: Math.round(p.km * 1000) } : null);

export function toUniversal(ib) {
  const isAlila = ib.hotel === HOTEL.name;
  const similar = HOTEL.similar.find((s) => s.name === ib.hotel);
  const base = HOTEL;
  const roomGroups = Object.values(ib.room_details || {});
  const rooms = roomGroups.map((g, i) => {
    const appRoom = isAlila ? base.rooms.find((r) => r.name === g.name) || base.rooms[i] : null;
    const r0 = base.rooms[i % base.rooms.length];
    const full = appRoom || { ...r0, name: g.name, id: g.std_room_id };
    // Supplier-only room: what TBO / TravClan send (name, size, bed), nothing from Trailix.
    const bare = { ...full, images: [], description: null, amenities: [], view: null, sleeps: null, sizeTip: null };
    return {
      ...(ib.roomContent === false ? bare : full),
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
    city: ib.city,
    neighbourhood: isAlila ? base.neighbourhood : ib.area || similar?.area || ib.master?.b_city,
    address: ib.master?.address || base.address,
    distanceFromCenter: ib.master?.distance_from_centre_km ?? base.distanceFromCenter,
    coords: ib.coords || null,
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
      // Nearest metro (Trailix nearby "transport" group) and the group pickup /
      // meeting point (fleet feed). Each is optional; the row skips a missing one.
      metro: ib.metro || toLine(nearest(ib.city, "transit", ib.coords)[0]),
      meetingPoint: ib.meetingPoint || toLine(nearest(ib.city, "meeting", ib.coords)[0]),
      // Same field the live IB reads (hotel.__rawHotel.google_map_link); when a
      // hotel has none, fall back to a Google Maps search like the app does.
      google_map_link:
        ib.google_map_link ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ib.hotel}, ${ib.master?.address || base.address}`)}`,
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
  { block: "Room groups and rates (supplier, cost, sell, refundable)", ib: "room_details[].room_rates[]", app: "rooms[] (no rates)", status: "ib" },
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
