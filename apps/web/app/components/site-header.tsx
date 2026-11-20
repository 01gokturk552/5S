import Link from 'next/link';
import { AuthActions } from './auth-actions';

export function SiteHeader({ active }: { active?: 'servers' | 'compare' | 'live' | 'resources' }) {
  const linkStyle = (name: typeof active) =>
    active === name ? { color: 'white' } : undefined;

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="5S ana sayfa">
        <span className="brand-mark">5</span>
        <span>5S</span>
      </Link>
      <nav className="main-nav" aria-label="Ana gezinme">
        <Link href="/servers" style={linkStyle('servers')}>Sunucular</Link>
        <Link href="/compare" style={linkStyle('compare')}>Karşılaştır</Link>
        <Link href="/live" style={linkStyle('live')}>Canlı yayınlar</Link>
        <Link href="/resources" style={linkStyle('resources')}>Kaynaklar</Link>
      </nav>
      <AuthActions />
    </header>
  );
}
