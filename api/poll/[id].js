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
  try {
    let parsed = JSON.parse(data.result);

    // Handle double-encoded JSON (string inside a string)
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    data.result = parsed;
  } catch (e) {
    data.result = { notes: data.result.slice(0, 200) };
  }
}

  res.status(response.status).json(data);
}
