import Link from 'next/link';
import { SiteHeader } from '../components/site-header';
import { AuthForm } from '../components/auth-form';

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="auth-layout">
        <section className="auth-card">
          <div className="eyebrow">HESAP</div>
          <h1>Tekrar hoş geldiniz</h1>
          <p>Sunucunuzu ve kaydettiğiniz kayıtları yönetmek için giriş yapın.</p>
          <AuthForm mode="login" />
          <p className="auth-footer">
            5S'de yeni misiniz? <Link href="/register">Hesap oluştur</Link>
          </p>
        </section>
      </main>
    </>
  );
}
