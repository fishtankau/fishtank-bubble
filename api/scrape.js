import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

    const ogSiteName = $('meta[property="og:site_name"]').attr('content');
    const title = $('title').text().trim();
    const brandName = ogSiteName || title.split(/[-|–—:]/)[0].trim() || 'Brand';

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

    let primaryColor = '';
    let secondaryColor = '';
    const themeColor = $('meta[name="theme-color"]').attr('content');
    const msColor = $('meta[name="msapplication-TileColor"]').attr('content');
    if (themeColor) primaryColor = themeColor;
    else if (msColor) primaryColor = msColor;

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
    if (!primaryColor) {
      const btnMatch = allCSS.match(/(?:btn|button|cta|primary)[^{]*\{[^}]*background(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/i);
      if (btnMatch) primaryColor = btnMatch[1];
    }
    if (!primaryColor) {
      const linkMatch = allCSS.match(/\ba\b[^{]*\{[^}]*color:\s*(#[0-9a-fA-F]{3,8})/);
      if (linkMatch) primaryColor = linkMatch[1];
    }
    if (!primaryColor) primaryColor = '#2563eb';
    if (!secondaryColor) secondaryColor = '#1e293b';

    const description = $('meta[name="description"]').attr('content') ||
                        $('meta[property="og:description"]').attr('content') ||
                        $('p').first().text().trim().slice(0, 200) || '';

    const keyMessages = [];
    $('h1').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 3 && text.length < 200) keyMessages.push(text);
    });
    $('h2').slice(0, 6).each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 3 && text.length < 200) keyMessages.push(text);
    });

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
    if (products.length === 0) {
      $('h3').slice(0, 8).each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length > 2 && text.length < 100) {
          products.push({ name: text, description: '', image: '' });
        }
      });
    }

    res.json({
      name: brandName, url: targetUrl, logo, primaryColor, secondaryColor,
      description: description.slice(0, 300),
      keyMessages: keyMessages.slice(0, 5),
      products: products.slice(0, 8)
    });
  } catch (err) {
    console.error('Scrape error:', err.message);
    res.status(500).json({ error: 'Failed to scrape: ' + err.message });
  }
}
