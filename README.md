# Hotel revamp

One hotel record for both sides of a 30 Sundays booking: the seller picking a hotel in the Itinerary Builder (IB) and the couple reading it in the app.

Live on Vercel: https://hotel-revamp.vercel.app

| Route | Link | What it is |
|---|---|---|
| `/ib` | [hotel-revamp.vercel.app/ib](https://hotel-revamp.vercel.app/ib) | How a hotel looks in IB today, recreated from `atul491/IB-repo-copy`. |
| `/universal` | [hotel-revamp.vercel.app/universal](https://hotel-revamp.vercel.app/universal) | The IB seller screen: city stepper, filters, toolbar, tier groups, hotel rows with tags up front, price details, hotel bookings, support. Opening a hotel shows the full joined hotel page. |
| `/options` | [hotel-revamp.vercel.app/options](https://hotel-revamp.vercel.app/options) | Every element (6 global, 11 selection-screen, 16 hotel-page) with 3 to 5 versions. **Make your own**: any colour, which card parts and tags show (and their order), a note per element, saved presets. Share link carries all of it. Each element also has **Create my own version**: text and/or a screenshot go to `/api/variant`, Claude builds a new version from the element's real data, and it can be picked like any other. |
| `/final` | [hotel-revamp.vercel.app/final](https://hotel-revamp.vercel.app/final) | My recommended combination with the reason for each pick. "Edit from here" loads it into /options. |

## Data

- `src/data/hotelDetailData.js`: the app's fully written hotel (Alila Seminyak), copied from `kashyaptibrewal0103/30sundays-app`.
- `src/data/ibHotels.js`: the same hotels in IB's shapes (search API hotel, `room_details` → `room_rates`, the 8-slot saved stay), plus `toUniversal()` which joins them, and `FIELD_SOURCES`, which records which block comes from where.
- `src/design.jsx`: every option and variant (`GLOBALS`, `SCREEN`, `BLOCKS`), the custom settings, and `FINAL`. Add a variant there and render it in the matching block under `src/blocks/` (`screen.jsx` for the selection screen).

## Run

```bash
npm install
npm run dev
```

## Create-your-own versions

`api/variant.js` is a Vercel function that sends the element, its data, and the seller's text and screenshot to an AI model and returns an HTML fragment that renders from `window.DATA`. It supports both providers; the create box has a Claude / OpenAI switch showing which keys are set.

| Vercel env var | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Turns on Claude (`ANTHROPIC_MODEL`, default `claude-opus-5-5`) |
| `OPENAI_API_KEY` | Turns on OpenAI (`OPENAI_MODEL`, default `gpt-5.5`) |
| `AI_PROVIDER` | Optional default when both keys are set: `anthropic` or `openai` |
 Without it, requests are saved as drafts and can be built later with the card's **Build** button. Made versions are stored in the browser (localStorage) and drawn in a sandboxed iframe.
