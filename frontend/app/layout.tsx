import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ThemeToggle } from "../components/ThemeToggle";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Can I Afford This? | Make confident money decisions",
    template: "%s | Can I Afford This?"
  },
  description: "A calm, explainable affordability calculator for your next big purchase.",
  openGraph: {
    title: "Can I Afford This?",
    description: "Know what you can afford before you buy.",
    type: "website",
    siteName: "Can I Afford This?"
  },
  twitter: { card: "summary_large_image", title: "Can I Afford This?" },
  robots: { index: true, follow: true }
};

const nav = [
  ["Home", "/"],
  ["Tools", "/tools"],
  ["Guides", "/guides"]
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
        <div className="site-shell">
          <header className="topbar">
            <Link className="brand" href="/" aria-label="Can I Afford This? home">
              <span className="brand-mark">₹</span>
              <span>Can I Afford This<span className="brand-dot">?</span></span>
            </Link>
            <nav className="topnav" aria-label="Primary navigation">
              {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </nav>
            <ThemeToggle />
            <Link className="topbar-cta" href="/#calculator">Check affordability <span>↗</span></Link>
          </header>
          {children}
          <footer className="footer">
            <div className="footer-main">
              <div>
                <Link className="brand footer-brand" href="/"><span className="brand-mark">₹</span><span>Can I Afford This<span className="brand-dot">?</span></span></Link>
                <p className="footer-note">Make money decisions with a little more clarity.</p>
              </div>
              <div className="footer-links">
                <div><p className="footer-label">Explore</p><Link href="/tools">All tools</Link><Link href="/guides">Money guides</Link><Link href="/about">About us</Link></div>
                <div><p className="footer-label">Trust & privacy</p><Link href="/privacy">Privacy policy</Link><Link href="/disclaimer">Disclaimer</Link><Link href="/terms">Terms of use</Link></div>
              </div>
            </div>
            <div className="footer-bottom"><span>© 2026 Can I Afford This?</span><span>Built for better decisions, not perfect predictions.</span></div>
          </footer>
        </div>
      </body>
    </html>
  );
}
