import Link from 'next/link';
import { SiteHeader } from '../components/site-header';
import { AuthForm } from '../components/auth-form';

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-layout">
        <section className="auth-card">
          <div className="eyebrow">HESAP OLUŞTUR</div>
          <h1>5S'e katıl</h1>
          <p>Sunucuları kaydet, toplulukları takip et ve hesabını yönet.</p>
          <AuthForm mode="register" />
          <p className="auth-footer">
            Zaten hesabınız var mı? <Link href="/login">Giriş yap</Link>
          </p>
        </section>
      </main>
    </>
  );
}
