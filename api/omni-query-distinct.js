export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { apiKey, vanityDomain, modelId, table, field, limit, filters } = req.body;
    if (!apiKey || !modelId || !table || !field) {
      return res.status(400).json({ error: 'apiKey, modelId, table, and field are required' });
    }

    const omniHost = vanityDomain || 'trial.omniapp.co';
    const query = { modelId, table, fields: [field], limit: limit || 1000 };
    if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
      query.filters = filters;
    }
    const response = await fetch(`https://${omniHost}/api/v1/query/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, resultType: 'json' }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || err.error || 'Failed to run query' });
    }

    const data = await response.json();
    // Extract the single column values, dedupe, and drop empties
    const values = [];
    const seen = new Set();
    for (const row of (Array.isArray(data) ? data : [])) {
      const v = Object.values(row)[0];
      if (v && typeof v === 'string' && !seen.has(v)) {
        seen.add(v);
        values.push(v);
      }
    }
    values.sort();
    res.json({ values });
  } catch (err) {
    console.error('Omni query error:', err.message);
    res.status(500).json({ error: 'Failed to run query: ' + err.message });
  }
}
