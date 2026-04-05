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

    platform_urls = {"doordash": "https://www.doordash.com", "grubhub": "https://www.grubhub.com", "uber eats": "https://www.ubereats.com"}
    url = platform_urls.get(platform.lower(), f"https://www.{platform.lower().replace(' ', '')}.com")

    task = f"""Go directly to {url} and immediately search for "{restaurant}" near "{address}". Do not click anything else first.
Add exactly ONE item to the cart (the first available item), then go to checkout.
At checkout, select "No tip" or $0 tip if the option is available.
Stop as soon as you have the subtotal, delivery fee, service fee, and total. Do not add more items.

YOUR ENTIRE RESPONSE MUST BE A SINGLE VALID JSON OBJECT — no text before or after it, no markdown, no backticks.
Use only double quotes. No trailing commas.

Output exactly this shape (total should reflect $0 tip):
{{"subtotal":15.00,"deliveryFee":3.99,"serviceFee":1.50,"total":20.49,"notes":"brief note, no tip"}}

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
