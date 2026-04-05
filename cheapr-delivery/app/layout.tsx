import type { Metadata } from 'next';
import './globals.css';
import { Fraunces, Nunito } from 'next/font/google';

export const fraunces = Fraunces({ subsets: ['latin'], weight: ['600'] });
export const nunito = Nunito({ subsets: ['latin'], weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'BrokeBites — Find the lowest delivery price',
  description: 'Agents search GrubHub, DoorDash, and Uber Eats simultaneously to find the cheapest delivery option.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}