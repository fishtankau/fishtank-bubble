export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { apiKey, vanityDomain, dashboardId } = req.body;
    if (!apiKey || !dashboardId) return res.status(400).json({ error: 'apiKey and dashboardId are required' });

    const omniHost = vanityDomain || 'trial.omniapp.co';
    const response = await fetch(`https://${omniHost}/api/v1/dashboards/${dashboardId}/filters`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || err.error || 'Failed to fetch dashboard filters' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Omni dashboard filters error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard filters: ' + err.message });
  }
}
