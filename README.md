# Hotel revamp

One hotel record for both sides of a 30 Sundays booking: the seller picking a hotel in the Itinerary Builder (IB) and the couple reading it in the app.

Live on Vercel: https://hotel-revamp.vercel.app

The site has one page: [hotel-revamp.vercel.app/final](https://hotel-revamp.vercel.app/final). Every other address redirects there. The earlier pages (`/`, `/ib`, `/universal`, `/options`) were removed; they are in git history if needed.

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
| `OPENAI_API_KEY` | Turns on OpenAI (`OPENAI_MODEL`, default `gpt-6.1-sol`) |
| `AI_PROVIDER` | Optional default when both keys are set: `anthropic` or `openai` |
 Without it, requests are saved as drafts and can be built later with the card's **Build** button. Made versions are stored in the browser (localStorage) and drawn in a sandboxed iframe.
