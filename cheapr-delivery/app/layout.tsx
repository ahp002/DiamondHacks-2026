import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'cheapr.delivery — Find the lowest delivery price',
  description: 'Agents search GrubHub, DoorDash, and Uber Eats simultaneously to find the cheapest delivery option.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
