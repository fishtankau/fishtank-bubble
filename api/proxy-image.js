export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL required');

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000)
    });

    const contentType = response.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch {
    res.status(500).send('Failed to proxy image');
  }
}
