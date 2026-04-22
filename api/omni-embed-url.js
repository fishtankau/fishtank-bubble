import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { secret, contentPath, vanityDomain, customTheme, customThemeId, prefersDark, theme, connectionRoles, mode, linkAccess, filterSearchParam, externalId, name, userAttributes } = req.body;
    if (!secret || !contentPath) {
      return res.status(400).json({ error: 'secret and contentPath are required' });
    }

    const omniHost = vanityDomain || 'trial.omniapp.co';
    const nonce = crypto.randomBytes(16).toString('hex');

    const apiUrl = `https://${omniHost}/embed/sso/generate-url`;
    const payload = {
      contentPath,
      externalId: externalId || 'fishtank-user-1',
      name: name || 'Fishtank User',
      nonce,
      secret,
    };

    if (userAttributes && typeof userAttributes === 'object' && Object.keys(userAttributes).length > 0) {
      // Omni expects userAttributes as a URL-encoded JSON string
      payload.userAttributes = encodeURIComponent(JSON.stringify(userAttributes));
    } else if (typeof userAttributes === 'string' && userAttributes) {
      payload.userAttributes = userAttributes;
    }

    if (customThemeId) payload.customThemeId = customThemeId;
    else if (customTheme) payload.customTheme = typeof customTheme === 'string' ? customTheme : JSON.stringify(customTheme);
    if (theme) payload.theme = theme;
    if (prefersDark) payload.prefersDark = prefersDark;
    if (connectionRoles) payload.connectionRoles = typeof connectionRoles === 'string' ? connectionRoles : JSON.stringify(connectionRoles);
    if (mode) payload.mode = mode;
    if (linkAccess) payload.linkAccess = linkAccess;
    if (filterSearchParam) payload.filterSearchParam = filterSearchParam;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || data.message || 'Omni API error' });
    }

    res.json({ url: data.url });
  } catch (err) {
    console.error('Omni embed error:', err.message);
    res.status(500).json({ error: 'Failed to generate embed URL: ' + err.message });
  }
}
