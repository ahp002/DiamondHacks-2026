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

  if (data.status === 'finished' && typeof data.result === 'string') {
    let result = data.result.trim();

    // browser-use returns double-encoded JSON: {\"key\":\"value\"}
    // Unescape it so the client gets a real object
    if (result.includes('\\"')) {
      result = result.replace(/\\"/g, '"');
    }

    try {
      data.result = JSON.parse(result);
    } catch (e) {
      // If parse still fails, send result as a plain notes string
      // so the client shows something meaningful instead of an error
      data.result = { subtotal: null, deliveryFee: null, serviceFee: null, total: null, notes: result.slice(0, 200) };
    }
  }

  res.status(response.status).json(data);
}
