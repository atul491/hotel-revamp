# Hotel revamp

One hotel record for both sides of a 30 Sundays booking: the seller picking a hotel in the Itinerary Builder (IB) and the couple reading it in the app.

Live on Vercel: https://hotel-revamp.vercel.app

| Route | Link | What it is |
|---|---|---|
| `/ib` | [hotel-revamp.vercel.app/ib](https://hotel-revamp.vercel.app/ib) | How a hotel looks in IB today, recreated from `atul491/IB-repo-copy` (`HotelSectionWithTwoButton`, `SearchedHotelList`, `GroupedRoomCard`, Price Details). |
| `/universal` | [hotel-revamp.vercel.app/universal](https://hotel-revamp.vercel.app/universal) | The joined hotel page. IB rates and seller data plus every app block (photos, honest bit, why Indian couples, about, amenities, location, reviews, rooms, policies, FAQs, similar). Seller and couple views side by side, with data-source tags and an IB ↔ App field map. |
| `/options` | [hotel-revamp.vercel.app/options](https://hotel-revamp.vercel.app/options) | Design options. Every UI element with 3 to 5 variants rendered with real data. Pick one per element (or a preset), then **Preview full page** opens `/universal` with those picks. Picks persist in the browser and can be shared as a `?d=` link. |

## Data

- `src/data/hotelDetailData.js`: the app's fully written hotel (Alila Seminyak), copied from `kashyaptibrewal0103/30sundays-app`.
- `src/data/ibHotels.js`: the same hotels in IB's shapes (search API hotel, `room_details` → `room_rates`, the 8-slot saved stay), plus `toUniversal()` which joins them, and `FIELD_SOURCES`, which records which block comes from where.
- `src/design.jsx`: the list of options and variants. Add a variant there and render it in the matching block under `src/blocks/`.

## Run

```bash
npm install
npm run dev
```
