export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  const response = await fetch(`https://api.browser-use.com/api/v2/tasks/${id}`, {
    headers: {
      'X-Browser-Use-API-Key': process.env.BROWSER_USE_API_KEY
    }
  });

  const data = await response.json();

  // browser-use sometimes returns result as a double-encoded JSON string
  // e.g. data.result = '{\"subtotal\":15.00,...}' with literal backslashes
  // Parse it into an object here so the client always gets clean data
  if (data.status === 'finished' && typeof data.result === 'string') {
    try {
      // Try direct parse first (handles normally-encoded strings)
      data.result = JSON.parse(data.result);
    } catch (e) {
      try {
        // Handle double-encoded strings: treat as JSON string value to unescape
        data.result = JSON.parse(JSON.parse('"' + data.result + '"'));
      } catch (e2) {
        // Leave as-is and let the client handle it
      }
    }
  }

  res.status(response.status).json(data);
}
