import asyncio
import sys
import json
import re
import os

async def main():
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: scrape.py <platform> <address> <restaurant>"}))
        sys.exit(1)

    platform   = sys.argv[1]
    address    = sys.argv[2]
    restaurant = sys.argv[3]

    from browser_use.agent.service import Agent
    from browser_use.browser.profile import BrowserProfile
    from browser_use.llm.browser_use import ChatBrowserUse

    llm = ChatBrowserUse()

    # Connect to your local Chrome running with --remote-debugging-port=9222
    port_map = {"doordash": 9222, "grubhub": 9223, "uber eats": 9224}
    port = port_map.get(platform.lower(), 9222)
    profile = BrowserProfile(cdp_url=f"http://localhost:{port}")

    task = f"""You are a price comparison agent. Go to the {platform} website.
You should already be logged in. Search for "{restaurant}" near "{address}".
Open the restaurant page and find the delivery fee, service fee, subtotal, and estimated total for a ~$15 order.

YOUR ENTIRE RESPONSE MUST BE A SINGLE VALID JSON OBJECT — no text before or after it, no markdown, no backticks.
Use only double quotes. No trailing commas.

Output exactly this shape:
{{"subtotal":15.00,"deliveryFee":3.99,"serviceFee":1.50,"total":20.49,"notes":"brief note"}}

If you cannot find the restaurant or fees:
{{"subtotal":null,"deliveryFee":null,"serviceFee":null,"total":null,"notes":"reason"}}"""

    try:
        agent = Agent(task=task, llm=llm, browser_profile=profile)
        history = await agent.run(max_steps=100)
        text = history.final_result() or ""
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        raw = match.group(0)
        for candidate in [raw, raw.replace('\\"', '"')]:
            try:
                print(json.dumps(json.loads(candidate)))
                return
            except json.JSONDecodeError:
                pass

    print(json.dumps({
        "subtotal": None,
        "deliveryFee": None,
        "serviceFee": None,
        "total": None,
        "notes": text[:200] if text else "No result returned"
    }))

asyncio.run(main())
