import Link from 'next/link';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-slate-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <span className="text-xl font-black tracking-tighter text-blue-400">NEXTWAVES INDUSTRIES</span>
                <br />
                <div className="flex gap-4 text-sm font-medium">
                  <Link href="/" className="hover:text-blue-400 transition-colors">SCAN CARD</Link>
                  <Link href="/categories" className="hover:text-blue-400 transition-colors">CATEGORIES</Link>
                  <Link href="/products" className="hover:text-blue-400 transition-colors">PRODUCTS</Link>
                  <Link href="/tags" className="hover:text-blue-400 transition-colors">TAG MANAGEMENT</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}