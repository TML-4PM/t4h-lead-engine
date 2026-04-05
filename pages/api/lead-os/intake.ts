import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Lead OS — Tally Webhook Intake
 * POST /api/lead-os/intake?brand=ahc
 * Invokes lead-os-processor Lambda via bridge.
 */

const BRIDGE_URL = "https://m5oqj21chd.execute-api.ap-southeast-2.amazonaws.com/lambda/invoke";
const BRIDGE_KEY = process.env.BRIDGE_API_KEY!;

const FIELD_MAP: Record<string, string> = {
  "What industry are you in?":   "industry",
  "Company size (employees)":    "company_size",
  "Where are you based?":        "geography",
  "What is your budget?":        "budget",
  "What is your main problem?":  "problem",
  "How high is the impact?":     "impact",
  "Hours wasted per week":       "hours_wasted",
  "Do you have an internal owner?": "has_owner",
  "Current tools / stack":       "stack_type",
  "When do you need a solution?":"timeline",
  "Your name":                   "name",
  "Your email":                  "email",
  "Company name":                "company",
  "Your role":                   "role",
};

function norm(key: string, raw: unknown): unknown {
  let v: unknown = Array.isArray(raw) ? (raw as string[]).join(", ") : raw;
  if (typeof v !== "string") return v;
  v = v.toLowerCase().trim();
  if (key === "company_size" || key === "hours_wasted") return parseInt(v as string) || 0;
  if (key === "timeline")   return (v as string).includes("now") || (v as string).includes("immediately") ? "now" : (v as string).includes("quarter") ? "this_quarter" : "later";
  if (key === "budget")     return (v as string).includes("confirm") ? "confirmed" : "unclear";
  if (key === "has_owner")  return (v as string).includes("yes") ? "yes" : "no";
  if (key === "stack_type") return (v as string).includes("modern") || (v as string).includes("cloud") ? "modern" : "legacy";
  return v;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const fields: Array<{ label: string; value: unknown }> = req.body?.data?.fields ?? [];
    if (!fields.length) return res.status(400).json({ error: "No fields" });

    const payload: Record<string, unknown> = {
      source_quality:    4,
      tally_response_id: req.body?.data?.responseId,
      tally_form_id:     req.body?.data?.formId,
    };

    for (const f of fields) {
      const key = FIELD_MAP[f.label];
      if (key) payload[key] = norm(key, f.value);
    }

    const brand = (req.query.brand as string) || "ahc";

    const bridgeRes = await fetch(BRIDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": BRIDGE_KEY },
      body: JSON.stringify({ fn: "lead-os-processor", action: "process_lead_v2", data: { brand, payload } }),
    });

    const result = await bridgeRes.json();
    console.log(`[LEAD-OS] brand=${brand} state=${result.state} score=${result.score} id=${result.lead_id}`);
    return res.status(200).json({ ok: true, lead_id: result.lead_id, state: result.state, score: result.score });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[LEAD-OS] intake:", msg);
    return res.status(500).json({ error: msg });
  }
}
