export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { apiKey, vanityDomain } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'apiKey is required' });

    const omniHost = vanityDomain || 'trial.omniapp.co';
    const headers = { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' };

    const response = await fetch(`https://${omniHost}/api/v1/content?path=/&pageSize=100`, {
      headers, signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || err.error || 'Failed to fetch dashboards' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Omni dashboards error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboards: ' + err.message });
  }
}
