import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    let targetUrl = url;
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const baseUrl = new URL(targetUrl);

    // --- Brand Name ---
    const ogSiteName = $('meta[property="og:site_name"]').attr('content');
    const title = $('title').text().trim();
    const brandName = ogSiteName || title.split(/[-|–—:]/)[0].trim() || 'Brand';

    // --- Logo ---
    let logo = '';
    const logoSelectors = [
      'img[class*="logo" i]', 'img[id*="logo" i]', 'img[alt*="logo" i]',
      'a[class*="logo" i] img', '.logo img', '#logo img',
      '[class*="brand" i] img', 'header img:first-of-type', 'nav img:first-of-type'
    ];
    for (const sel of logoSelectors) {
      const el = $(sel).first();
      const src = el.attr('src') || el.attr('data-src');
      if (src && !src.includes('pixel') && !src.includes('spacer')) {
        logo = src;
        break;
      }
    }
    if (!logo) {
      logo = $('link[rel="apple-touch-icon"]').attr('href') ||
             $('link[rel="icon"][sizes="192x192"]').attr('href') ||
             $('link[rel="icon"][type="image/png"]').attr('href') ||
             $('link[rel="icon"]').attr('href') ||
             $('link[rel="shortcut icon"]').attr('href') || '';
    }
    if (logo && !logo.startsWith('http') && !logo.startsWith('data:')) {
      try { logo = new URL(logo, baseUrl.origin).href; } catch { logo = ''; }
    }

    // --- Colors ---
    let primaryColor = '';
    let secondaryColor = '';

    const themeColor = $('meta[name="theme-color"]').attr('content');
    const msColor = $('meta[name="msapplication-TileColor"]').attr('content');
    if (themeColor) primaryColor = themeColor;
    else if (msColor) primaryColor = msColor;

    // Scan inline styles and style tags for CSS variables
    const cssTexts = [];
    $('style').each((_, el) => cssTexts.push($(el).text()));
    const allCSS = cssTexts.join('\n');

    if (!primaryColor) {
      const varPatterns = [
        /--(?:primary|brand|main|theme|accent)(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/i,
        /--color-(?:primary|brand|main|accent):\s*(#[0-9a-fA-F]{3,8})/i,
      ];
      for (const pat of varPatterns) {
        const m = allCSS.match(pat);
        if (m) { primaryColor = m[1]; break; }
      }
    }

    if (!secondaryColor) {
      const secMatch = allCSS.match(/--(?:secondary|dark|neutral)(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/i);
      if (secMatch) secondaryColor = secMatch[1];
    }

    // Try to extract from prominent elements
    if (!primaryColor) {
      const btnMatch = allCSS.match(/(?:btn|button|cta|primary)[^{]*\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/i);
      if (btnMatch) primaryColor = btnMatch[1];
    }

    // Extract link color
    if (!primaryColor) {
      const linkMatch = allCSS.match(/\ba\b[^{]*\{[^}]*color:\s*(#[0-9a-fA-F]{3,8})/);
      if (linkMatch) primaryColor = linkMatch[1];
    }

    if (!primaryColor) primaryColor = '#2563eb';
    if (!secondaryColor) secondaryColor = '#1e293b';

    // --- Description ---
    const description = $('meta[name="description"]').attr('content') ||
                        $('meta[property="og:description"]').attr('content') ||
                        $('p').first().text().trim().slice(0, 200) || '';

    // --- Key Messages ---
    const keyMessages = [];
    $('h1').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 3 && text.length < 200) keyMessages.push(text);
    });
    $('h2').slice(0, 6).each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 3 && text.length < 200) keyMessages.push(text);
    });

    // --- Products / Services ---
    const products = [];
    const productSelectors = [
      '[class*="product" i]', '[class*="service" i]', '[class*="feature" i]',
      '[class*="card" i]', '[class*="item" i]', '[class*="offering" i]'
    ];
    for (const sel of productSelectors) {
      $(sel).slice(0, 12).each((_, el) => {
        const heading = $(el).find('h2, h3, h4, [class*="title" i], [class*="name" i]').first().text().trim();
        const desc = $(el).find('p, [class*="desc" i]').first().text().trim();
        let img = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src') || '';
        if (img && !img.startsWith('http') && !img.startsWith('data:')) {
          try { img = new URL(img, baseUrl.origin).href; } catch { img = ''; }
        }
        if (heading && heading.length > 2 && heading.length < 120) {
          const exists = products.some(p => p.name === heading);
          if (!exists) products.push({ name: heading, description: desc.slice(0, 150), image: img });
        }
      });
      if (products.length >= 6) break;
    }

    // Fallback: use h3 headings as product/service names
    if (products.length === 0) {
      $('h3').slice(0, 8).each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length > 2 && text.length < 100) {
          products.push({ name: text, description: '', image: '' });
        }
      });
    }

    res.json({
      name: brandName,
      url: targetUrl,
      logo,
      primaryColor,
      secondaryColor,
      description: description.slice(0, 300),
      keyMessages: keyMessages.slice(0, 5),
      products: products.slice(0, 8)
    });
  } catch (err) {
    console.error('Scrape error:', err.message);
    res.status(500).json({ error: 'Failed to scrape: ' + err.message });
  }
});

// Proxy images to avoid CORS
app.get('/api/proxy-image', async (req, res) => {
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
});

// Generate Omni embed signed URL via Omni's API
app.post('/api/omni-embed-url', async (req, res) => {
  try {
    const { secret, contentPath, vanityDomain, customTheme, customThemeId, prefersDark, theme, connectionRoles, mode, linkAccess } = req.body;
    if (!secret || !contentPath) {
      return res.status(400).json({ error: 'secret and contentPath are required' });
    }

    const omniHost = vanityDomain || 'trial.omniapp.co';
    const nonce = crypto.randomBytes(16).toString('hex');

    // Use Omni's API to generate the signed URL
    const apiUrl = `https://${omniHost}/embed/sso/generate-url`;
    const payload = {
      contentPath,
      externalId: 'fishtank-user-1',
      name: 'Fishtank User',
      nonce,
      secret,
    };

    // Add optional params
    if (customThemeId) payload.customThemeId = customThemeId;
    else if (customTheme) payload.customTheme = typeof customTheme === 'string' ? customTheme : JSON.stringify(customTheme);
    if (theme) payload.theme = theme;
    if (prefersDark) payload.prefersDark = prefersDark;
    if (connectionRoles) payload.connectionRoles = typeof connectionRoles === 'string' ? connectionRoles : JSON.stringify(connectionRoles);
    if (mode) payload.mode = mode;
    if (linkAccess) payload.linkAccess = linkAccess;

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

    // Omni API returns { url: "https://..." }
    res.json({ url: data.url });
  } catch (err) {
    console.error('Omni embed error:', err.message);
    res.status(500).json({ error: 'Failed to generate embed URL: ' + err.message });
  }
});

// Fetch Omni dashboards/content list
app.post('/api/omni-dashboards', async (req, res) => {
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
});

// Fetch Omni connections list
app.post('/api/omni-connections', async (req, res) => {
  try {
    const { apiKey, vanityDomain } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'apiKey is required' });

    const omniHost = vanityDomain || 'trial.omniapp.co';
    const response = await fetch(`https://${omniHost}/api/v1/connections?sortField=name&sortDirection=asc`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || err.error || 'Failed to fetch connections' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Omni connections error:', err.message);
    res.status(500).json({ error: 'Failed to fetch connections: ' + err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
