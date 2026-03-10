const SUPA_URL = process.env.NEXT_PUBLIC_SUPA_URL || 'https://lzfgigiyqpuuxslsygjt.supabase.co'
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPA_ANON_KEY || ''

export interface LeadPayload {
  biz_key: string
  lead_type: string
  full_name: string
  email: string
  phone?: string
  company?: string
  role_title?: string
  message?: string
  source?: string
  campaign?: string
  landing_page?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  offer_code?: string
  consent_marketing: boolean
  consent_terms: boolean
  raw_payload?: Record<string, unknown>
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean; lead_id?: string; error?: string }> {
  try {
    // Parse UTM params from URL if in browser
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      payload.utm_source = payload.utm_source || params.get('utm_source') || undefined
      payload.utm_medium = payload.utm_medium || params.get('utm_medium') || undefined
      payload.utm_campaign = payload.utm_campaign || params.get('utm_campaign') || undefined
      payload.utm_term = payload.utm_term || params.get('utm_term') || undefined
      payload.utm_content = payload.utm_content || params.get('utm_content') || undefined
      payload.landing_page = window.location.pathname
    }

    payload.raw_payload = { ...payload, submitted_at: new Date().toISOString() }
    payload.source = payload.source || payload.biz_key

    const res = await fetch(`${SUPA_URL}/rest/v1/cap_leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPA_ANON,
        'Authorization': `Bearer ${SUPA_ANON}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        biz_key: payload.biz_key,
        lead_type: payload.lead_type,
        full_name: payload.full_name,
        name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company,
        role_title: payload.role_title,
        message: payload.message,
        source: payload.source,
        campaign: payload.campaign,
        landing_page: payload.landing_page,
        utm_source: payload.utm_source,
        utm_medium: payload.utm_medium,
        utm_campaign: payload.utm_campaign,
        utm_term: payload.utm_term,
        utm_content: payload.utm_content,
        offer_code: payload.offer_code,
        consent_marketing: payload.consent_marketing,
        consent_terms: payload.consent_terms,
        raw_payload: payload.raw_payload,
        lead_status: 'new',
        verification_status: 'pending'
      })
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `Submit failed: ${res.status} ${err}` }
    }

    const data = await res.json()
    const lead = Array.isArray(data) ? data[0] : data
    return { success: true, lead_id: lead?.id }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg }
  }
}
