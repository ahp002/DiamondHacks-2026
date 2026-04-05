export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Missing task' });
  }

  const response = await fetch('https://api.browser-use.com/api/v2/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Browser-Use-API-Key': process.env.BROWSER_USE_API_KEY
    },
    body: JSON.stringify({ task })
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
