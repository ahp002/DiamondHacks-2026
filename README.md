# BrokeBites
> DiamondHacks 2026

BrokeBites is a web app that helps users find the cheapest way to order their favorite meals by comparing prices across food delivery platforms.

---

## Overview

Ordering food online often comes with hidden costs — delivery fees, service charges, and price markups. BrokeBites solves this by scraping and comparing prices from multiple sources so users can make smarter, cheaper decisions.

Simply search for your address and a restaurant name, and the app will show you where it costs the least across platforms like Uber Eats and DoorDash.

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | Next.js, React, TypeScript, TailwindCSS |
| Backend | Supabase (database + backend services) |
| Web Scraping | Playwright, Browser.Use, JSON scraping scripts |
| AI | Claude (powers agents and assists scraping logic) |

---

## How It Works

1. User searches for their address and a restaurant name
2. Agent-based scripts launch automated browsers via Playwright
3. The system navigates delivery platforms (Uber Eats, DoorDash, etc.)
4. Data is extracted per platform:
   - Menu item price
   - Delivery and service fees
   - Final checkout total
5. Results are normalized and stored via Supabase
6. The frontend displays a clean comparison with the cheapest option highlighted

---

## Future Improvements

- Automatically apply coupons and discounts during checkout
- Expand support to additional delivery platforms
- Build a Chrome extension for seamless in-browser price comparison

---

## Note

This project runs locally because it relies on real-time browser automation and scraping, which require a controlled environment to function reliably.

---

## Contributors

- Daniella Benigno
- Audrey Miller
- Andy Phan
- Alicia Pham

## License

MIT © 2026 Daniella Benigno, Audrey Miller, Andy Phan, Alicia Pham
