import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import ClientShell from "./components/ClientShell";

export const metadata: Metadata = {
  title: "Halacha AI \u2014 Halakhic Research",
  description: "RAG-based halakhic research system for scholars and learners",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-to-main">Skip to main content</a>
        <main id="main-content" role="main" aria-label="Main content">
          {children}
        </main>
        <ClientShell />
        {/* Mobile bottom navigation */}
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <div className="mobile-nav-inner" role="navigation">
            <Link href="/" className="mobile-nav-item" aria-label="Home">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Home</span>
            </Link>
            <Link href="/reader" className="mobile-nav-item" aria-label="Text Library">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span>Library</span>
            </Link>
            <Link href="/search" className="mobile-nav-item" aria-label="Search">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <span>Search</span>
            </Link>
            <Link href="/halacha" className="mobile-nav-item" aria-label="AI Research">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4c0 2 1.5 3.5 3 4.5V12h2v-1.5c1.5-1 3-2.5 3-4.5a4 4 0 0 0-4-4z"/>
                <path d="M9 18h6M10 22h4"/>
                <path d="M12 12v4"/>
              </svg>
              <span>AI</span>
            </Link>
            <Link href="/bookmarks" className="mobile-nav-item" aria-label="Bookmarks">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Saved</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
