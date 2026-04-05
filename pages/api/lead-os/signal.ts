import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Lead OS — Signal Ingestion
 * POST /api/lead-os/signal  — webhook / manual trigger
 * GET  /api/lead-os/signal  — email pixel fire (returns 1x1 GIF)
 */

const BRIDGE_URL    = "https://m5oqj21chd.execute-api.ap-southeast-2.amazonaws.com/lambda/invoke";
const BRIDGE_KEY    = process.env.BRIDGE_API_KEY!;
const SIGNAL_SECRET = process.env.LEAD_OS_SIGNAL_SECRET;

const VALID_SIGNALS = new Set([
  "email_opened","link_clicked","replied","no_response_48h",
  "site_revisit","booking_completed","meeting_attended",
  "proposal_sent","proposal_viewed","unsubscribed",
]);

const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

async function fire(lead_id: string, signal_type: string, source: string) {
  return fetch(BRIDGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": BRIDGE_KEY },
    body: JSON.stringify({ fn: "lead-os-processor", action: "ingest_signal", data: { lead_id, signal_type, source } }),
  }).then((r) => r.json());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET — pixel
  if (req.method === "GET") {
    const { lead_id, type = "email_opened" } = req.query as Record<string, string>;
    if (lead_id) fire(lead_id, type, "email_pixel").catch((e) => console.error("[PIXEL]", e));
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(PIXEL);
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (SIGNAL_SECRET && req.headers["x-signal-secret"] !== SIGNAL_SECRET)
    return res.status(401).json({ error: "Unauthorized" });

  try {
    const { lead_id, signal_type, source = "api" } = req.body;
    if (!lead_id || !signal_type) return res.status(400).json({ error: "lead_id + signal_type required" });
    if (!VALID_SIGNALS.has(signal_type)) return res.status(400).json({ error: `Unknown signal: ${signal_type}` });

    const result = await fire(lead_id, signal_type, source);
    console.log(`[SIGNAL] ${signal_type} lead=${lead_id} val=${result.signal_value}`);
    return res.status(200).json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}
