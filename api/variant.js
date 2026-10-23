// ─── Make a new design option from a seller's words and/or screenshot ───
//
// GET  → { providers: ["anthropic", "openai"], default: "anthropic" }  (only the ones with a key)
// POST { element: {key, title, where, variants:[{label, note}]}, data, text, image?, previous?, provider? }
//   image    = data URL (png / jpeg / webp) of a screenshot or sketch
//   previous = { html } when the user is refining an option they already made
//   provider = "anthropic" | "openai"; defaults to AI_PROVIDER, then whichever key is set
// → 200 { label, note, html, provider, model }
//
// Keys come from the Vercel project's environment variables:
//   ANTHROPIC_API_KEY  → Claude (model: ANTHROPIC_MODEL, default claude-opus-5-5)
//   OPENAI_API_KEY     → OpenAI (model: OPENAI_MODEL, default gpt-6.1-sol)

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const config = { maxDuration: 300 };

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-6.1-sol";

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

function available() {
  const out = [];
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) out.push("anthropic");
  if (process.env.OPENAI_API_KEY) out.push("openai");
  return out;
}

function pickProvider(asked) {
  const have = available();
  if (asked && have.includes(asked)) return asked;
  const pref = process.env.AI_PROVIDER;
  if (pref && have.includes(pref)) return pref;
  return have[0] || null;
}

function parseImage(dataUrl) {
  const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/.exec(dataUrl || "");
  return m ? { mediaType: m[1], data: m[2], url: dataUrl } : null;
}

function promptText({ element, data, text, previous }) {
  return [
    `Element: ${element.title} (${element.where || ""})`,
    `Existing versions:\n${(element.variants || []).map((v) => `- ${v.label}: ${v.note || ""}`).join("\n")}`,
    `window.DATA for this element:\n${JSON.stringify(data, null, 1).slice(0, 60000)}`,
    previous?.html ? `The seller is changing a version they made earlier. Its current HTML:\n${previous.html}` : "",
    `Seller's request:\n${text || "(see the screenshot)"}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

class Fail extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// ─── Claude ───
async function viaAnthropic(body) {
  const client = new Anthropic();
  const content = [];
  const img = parseImage(body.image);
  if (img) content.push({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.data } });
  content.push({ type: "text", text: promptText(body) });
  try {
    const stream = client.beta.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: "user", content }],
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") throw new Fail(422, "refused", "Claude declined this request.");
    if (msg.stop_reason === "max_tokens") throw new Fail(502, "too_long", "The design came out too long. Try a simpler request.");
    const block = msg.content.find((b) => b.type === "text");
    return { ...JSON.parse(block?.text || "{}"), model: msg.model };
  } catch (err) {
    if (err instanceof Fail || err instanceof SyntaxError) throw err;
    if (err instanceof Anthropic.AuthenticationError) throw new Fail(501, "bad_key", "The ANTHROPIC_API_KEY on Vercel was rejected.");
    if (err instanceof Anthropic.RateLimitError) throw new Fail(429, "rate_limited", "Claude is rate limited. Try again in a minute.");
    if (err instanceof Anthropic.BadRequestError) throw new Fail(400, "bad_request", err.message);
    if (err instanceof Anthropic.APIError) throw new Fail(502, "api", `Claude API error ${err.status}`);
    throw err;
  }
}

// ─── OpenAI ───
async function viaOpenAI(body) {
  const client = new OpenAI();
  const content = [{ type: "input_text", text: promptText(body) }];
  const img = parseImage(body.image);
  if (img) content.unshift({ type: "input_image", detail: "auto", image_url: img.url });
  try {
    const r = await client.responses.create({
      model: OPENAI_MODEL,
      instructions: SYSTEM,
      input: [{ role: "user", content }],
      reasoning: { effort: "medium" },
      max_output_tokens: 32000,
      text: { format: { type: "json_schema", name: "design_option", schema: SCHEMA, strict: true } },
    });
    if (r.status === "incomplete") {
      const why = r.incomplete_details?.reason;
      if (why === "content_filter") throw new Fail(422, "refused", "OpenAI declined this request.");
      throw new Fail(502, "too_long", "The design came out too long. Try a simpler request.");
    }
    return { ...JSON.parse(r.output_text || "{}"), model: r.model };
  } catch (err) {
    if (err instanceof Fail || err instanceof SyntaxError) throw err;
    if (err instanceof OpenAI.AuthenticationError) throw new Fail(501, "bad_key", "The OPENAI_API_KEY on Vercel was rejected.");
    if (err instanceof OpenAI.RateLimitError) throw new Fail(429, "rate_limited", "OpenAI is rate limited or out of credit. Try again later.");
    if (err instanceof OpenAI.NotFoundError) throw new Fail(400, "bad_model", `OpenAI model "${OPENAI_MODEL}" isn't available on this key. Set OPENAI_MODEL in Vercel.`);
    if (err instanceof OpenAI.BadRequestError) throw new Fail(400, "bad_request", err.message);
    if (err instanceof OpenAI.APIError) throw new Fail(502, "api", `OpenAI API error ${err.status}`);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") return res.status(200).json({ providers: available(), default: pickProvider() });
  if (req.method !== "POST") return res.status(405).json({ error: "GET or POST only" });

  const body = req.body || {};
  const provider = pickProvider(body.provider);
  if (!provider) return res.status(501).json({ error: "no_key", message: "Add ANTHROPIC_API_KEY or OPENAI_API_KEY in the Vercel project settings to turn on generation." });
  if (!body.element?.key || (!body.text && !body.image)) return res.status(400).json({ error: "Send element plus text and/or image." });

  try {
    const out = provider === "openai" ? await viaOpenAI(body) : await viaAnthropic(body);
    if (!out.html) return res.status(502).json({ error: "empty", message: "No HTML came back. Try again." });
    return res.status(200).json({ ...out, provider });
  } catch (err) {
    if (err instanceof Fail) return res.status(err.status).json({ error: err.code, message: err.message, provider });
    if (err instanceof SyntaxError) return res.status(502).json({ error: "parse", message: "The answer was not valid JSON. Try again.", provider });
    return res.status(500).json({ error: "server", message: String(err?.message || err), provider });
  }
}
