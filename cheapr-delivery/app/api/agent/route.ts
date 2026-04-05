import { NextRequest, NextResponse } from 'next/server';

const BROWSER_USE_API_KEY = process.env.BROWSER_USE_API_KEY ?? 'bu_JbTEkVOb3w91bh-qCe8aGpDDs23x3yw7tkg5SY6Yek0';
const BROWSER_USE_BASE = 'https://api.browser-use.com/api/v2';

function buildBrowserTask(platformName: string, address: string, restaurant: string): string {
  return `You are a web automation agent. Go to the ${platformName} website. If prompted to sign in, log in with Google using the saved account. Once logged in, search for "${restaurant}" near "${address}". Find the delivery fee, service fee, and estimated total for a standard order (assume ~$15 subtotal).

YOUR ENTIRE RESPONSE MUST BE A SINGLE VALID JSON OBJECT — no text before it, no text after it, no markdown, no backticks, no code fences, no explanation. Use only double quotes (not single quotes). No trailing commas.

Output exactly this shape (replace placeholder values with real numbers or null):
{"subtotal":15.00,"deliveryFee":3.99,"serviceFee":1.50,"total":20.49,"notes":"Found pricing at the first result for this restaurant."}

If you cannot find the restaurant or pricing, output:
{"subtotal":null,"deliveryFee":null,"serviceFee":null,"total":null,"notes":"Could not find the restaurant or pricing on ${platformName}."}

Output the JSON object now:`;
}

function parseResult(text: string) {
  const clean = text.replace(/```(?:json)?/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in browser-use output');

  let raw = match[0];
  try {
    return JSON.parse(raw);
  } catch {
    const fixed = raw
      .replace(/'/g, '"')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
      .replace(/:\s*undefined/g, ': null');
    return JSON.parse(fixed);
  }
}

export async function POST(request: NextRequest) {
  const { platform, address, restaurant } = await request.json();
  const task = buildBrowserTask(platform, address, restaurant);

  // Submit the task
  const startResp = await fetch(`${BROWSER_USE_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Browser-Use-API-Key': BROWSER_USE_API_KEY,
    },
    body: JSON.stringify({ task }),
  });

  if (!startResp.ok) {
    const err = await startResp.text();
    return NextResponse.json({ error: `browser-use error ${startResp.status}: ${err}` }, { status: 500 });
  }

  const { id } = await startResp.json();
  if (!id) return NextResponse.json({ error: 'No task ID returned' }, { status: 500 });

  // Poll until done (max ~5 minutes)
  for (let i = 0; i < 100; i++) {
    await new Promise(r => setTimeout(r, 3000));

    const pollResp = await fetch(`${BROWSER_USE_BASE}/tasks/${id}`, {
      headers: { 'X-Browser-Use-API-Key': BROWSER_USE_API_KEY },
    });

    if (!pollResp.ok) return NextResponse.json({ error: `Poll error ${pollResp.status}` }, { status: 500 });

    const data = await pollResp.json();

    if (data.status === 'finished') {
      try {
        const result = parseResult(data.result || data.output || '');
        return NextResponse.json({ result });
      } catch (e) {
        return NextResponse.json({ error: `Parse failed: ${e instanceof Error ? e.message : e}` }, { status: 500 });
      }
    }

    if (data.status === 'failed' || data.status === 'stopped') {
      return NextResponse.json({ error: data.error || 'browser-use task failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Task timed out after 5 minutes' }, { status: 504 });
}
