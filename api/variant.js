// ─── Make a new design option from a seller's words and/or screenshot ───
//
// POST { element: {key, title, where, variants:[{label, note}]}, data, text, image?, previous? }
//   image    = data URL (png / jpeg / webp) of a screenshot or sketch
//   previous = { html } when the user is refining an option they already made
// → 200 { label, note, html }
//
// Needs ANTHROPIC_API_KEY in the Vercel project's environment variables.

import Anthropic from "@anthropic-ai/sdk";

export const config = { maxDuration: 300 };

const SYSTEM = `You design UI elements for the hotel selection screen of 30 Sundays' Itinerary Builder, the desktop tool travel sellers use to pick hotels for honeymoon itineraries. The couple later sees the same hotel in the 30 Sundays app, so what the seller sees should be honest and complete.

You will get one element of that screen (its name, where it sits, and the versions that already exist), the real data it shows, and the seller's request as text and/or a screenshot. Build one new version of that element that does what they asked. If they sent a screenshot, match its layout, hierarchy, density and labels closely, but fill it with the provided data.

Output rules for "html":
- One self-contained HTML fragment: markup plus an optional <style> and a <script>. No <html>, <head> or <body>.
- Tailwind CSS (CDN) and the Figtree font are already loaded. Brand CSS variables are set on :root: --accent (buttons, selected states), --accent-soft (light tint), --accent-ink (dark text on the tint), --r (card radius), --rw (small radius), --rp (pill radius). Use them for brand colour and corners.
- The data is in window.DATA. Render from it in your <script> (build the DOM from DATA), never hard-code values, because the same fragment is reused for other hotels with the same data shape.
- Plain JavaScript only, no frameworks, no imports, no network requests. Images may only use URLs from DATA.
- It is drawn inside a container of variable width (about 360px to 1100px). Fill the width; no fixed outer width; no horizontal page scroll.
- Interactions (tabs, expand, hover) are fine and should work inside the fragment.
- Indian rupee prices formatted like ₹13,866 (en-IN grouping).
- No em dashes in visible copy.

"label" is a 2 to 4 word name for the version. "note" is one short sentence saying what is different about it.`;

const SCHEMA = {
  type: "object",
  properties: {
    label: { type: "string" },
    note: { type: "string" },
    html: { type: "string" },
  },
  required: ["label", "note", "html"],
  additionalProperties: false,
};

function imageBlock(dataUrl) {
  const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/.exec(dataUrl || "");
  if (!m) return null;
  return { type: "image", source: { type: "base64", media_type: m[1], data: m[2] } };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    return res.status(501).json({ error: "no_key", message: "Add ANTHROPIC_API_KEY in the Vercel project settings to turn on generation." });
  }
  const { element, data, text, image, previous } = req.body || {};
  if (!element?.key || (!text && !image)) return res.status(400).json({ error: "Send element plus text and/or image." });

  const content = [];
  const img = imageBlock(image);
  if (img) content.push(img);
  content.push({
    type: "text",
    text: [
      `Element: ${element.title} (${element.where || ""})`,
      `Existing versions:\n${(element.variants || []).map((v) => `- ${v.label}: ${v.note || ""}`).join("\n")}`,
      `window.DATA for this element:\n${JSON.stringify(data, null, 1).slice(0, 60000)}`,
      previous?.html ? `The seller is changing a version they made earlier. Its current HTML:\n${previous.html}` : "",
      `Seller's request:\n${text || "(see the screenshot)"}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
  });

  const client = new Anthropic();
  try {
    const stream = client.beta.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: "user", content }],
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") return res.status(422).json({ error: "refused", message: "Claude declined this request." });
    if (msg.stop_reason === "max_tokens") return res.status(502).json({ error: "too_long", message: "The design came out too long. Try a simpler request." });
    const textBlock = msg.content.find((b) => b.type === "text");
    const out = JSON.parse(textBlock?.text || "{}");
    if (!out.html) return res.status(502).json({ error: "empty", message: "No HTML came back. Try again." });
    return res.status(200).json(out);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return res.status(501).json({ error: "bad_key", message: "The ANTHROPIC_API_KEY on Vercel was rejected." });
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "rate_limited", message: "Too many requests. Try again in a minute." });
    if (err instanceof Anthropic.BadRequestError) return res.status(400).json({ error: "bad_request", message: err.message });
    if (err instanceof Anthropic.APIError) return res.status(502).json({ error: "api", message: `Claude API error ${err.status}` });
    if (err instanceof SyntaxError) return res.status(502).json({ error: "parse", message: "The answer was not valid JSON. Try again." });
    return res.status(500).json({ error: "server", message: String(err?.message || err) });
  }
}
