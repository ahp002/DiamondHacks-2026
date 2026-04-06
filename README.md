# BrokeBites (DiamondHacks 2026)

BrokeBites is a web app that helps users find the cheapest way to order their favorite meals by comparing prices across food delivery platforms.

## Overview
Ordering food online often comes with hidden cost delivery fees, service charges, and price markups. This project solves that problem by scraping and comparing prices from multiple sources so users can make smarter and cheaper decisions.
Simply search for your address, and the app will show you where it costs the least through platforms like Uber Eats or DoorDash.

## Tech Stack
Frontend: Next.js, React, TypeScript, TailwindCSS
Backend: Supabase (database + backend services)
Web Scraping: Playwright (browser automation), Browser.Use (agent-based browsing), JSON scripts for structured scraping workflows
AI Integration: Claude (power agents and assist scraping logic)

## How it works
1. User searches for their exact address and restaurant name
2. Agent-based scripts launch automated browsers using Playwright
3. The system navigates:
    Delivery platforms (Uber Eats, DoorDash, etc.)
4. Data is extracted:
    Menu item price
    Delivery/service fees
    Final checkout total
5. Results are normalized and stored via Supabase
6. The frontend displays a clean comparison with the cheapest option highlighted

## Future Improvements
- Automatically apply coupons and discounts during checkout
- Expand support to additional food delivery platforms
- Build a Chrome extension for seamless, in-browser price comparison
## Note: This project runs locally because it relies on real-time browser automation and scraping, which require a controlled environment to function reliably.

## Contributors
- Daniella Benigno
- Audrey Miller
- Andy Phan
- Alicia Pham
