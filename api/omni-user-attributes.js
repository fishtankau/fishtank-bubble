// Ensure an Omni user attribute exists. The public docs currently only
// document GET /api/v1/user-attributes, but we also attempt POST in case
// the endpoint is live — falling back to instructions if it isn't.
//
// Request:
//   POST /api/omni-user-attributes
//   { apiKey, vanityDomain?, name, type? }
//
// Response:
//   { exists: bool, created: bool, created_via: 'api'|null,
//     attribute?: {...}, instructions?: string, error?: string }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { apiKey, vanityDomain, name, type } = req.body || {};
    if (!apiKey || !name) {
      return res.status(400).json({ error: 'apiKey and name are required' });
    }

    const omniHost = vanityDomain || 'trial.omniapp.co';
    const base = `https://${omniHost}/api/v1/user-attributes`;
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // 1) List existing attributes to see if the one we want is already there.
    const listRes = await fetch(base, { headers, signal: AbortSignal.timeout(10000) });
    if (!listRes.ok) {
      const err = await listRes.json().catch(() => ({}));
      return res.status(listRes.status).json({
        error: err.message || err.error || `Failed to list user attributes (${listRes.status})`,
      });
    }
    const listData = await listRes.json();
    const attrs = Array.isArray(listData) ? listData
                : listData.records || listData.userAttributes || listData.data || [];

    const existing = attrs.find(a =>
      (a.name || '').toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      return res.json({ exists: true, created: false, created_via: null, attribute: existing });
    }

    // 2) Attempt POST — docs don't list this, so be ready for it to 404.
    const createRes = await fetch(base, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, type: type || 'string' }),
      signal: AbortSignal.timeout(10000),
    });

    if (createRes.ok) {
      const created = await createRes.json().catch(() => ({}));
      return res.json({ exists: false, created: true, created_via: 'api', attribute: created });
    }

    // 3) Creation isn't supported via API — give the user a concrete next step.
    let apiMsg = '';
    try { const j = await createRes.json(); apiMsg = j.message || j.error || ''; } catch {}
    return res.status(200).json({
      exists: false,
      created: false,
      created_via: null,
      error: `Omni API did not accept the create request (${createRes.status}${apiMsg ? `: ${apiMsg}` : ''}).`,
      instructions:
        `Create it manually: Omni → Settings → Attributes → New Attribute. ` +
        `Name: "${name}", Type: ${type || 'string'}. ` +
        `Link: https://${omniHost}/settings/attributes`,
    });
  } catch (err) {
    console.error('Omni user-attribute error:', err.message);
    res.status(500).json({ error: 'Failed to ensure user attribute: ' + err.message });
  }
}
