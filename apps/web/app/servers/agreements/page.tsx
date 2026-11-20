import Link from 'next/link';
import { SiteHeader } from '../../components/site-header';

export default function AgreementsPage() {
  return (
    <>
      <SiteHeader active="servers" />
      <main>
        <section className="section server-directory">
          <div className="eyebrow">GÜVENİLİR SUNUCULAR</div>
          <h1>Anlaşmalı Sunucular</h1>
          <div className="directory-tabs" aria-label="Sunucu listesi türleri">
            <Link className="directory-tab" href="/servers">Türk Sunucuları</Link>
            <Link className="directory-tab active" href="/servers/agreements">Anlaşmalı Sunucular</Link>
          </div>
          <div className="empty-state directory-empty">
            <div className="empty-icon">A</div>
            <h3>Henüz anlaşmalı sunucu bulunmuyor</h3>
            <p>
              5S ile resmî anlaşma yapan ve bilgilerinin doğrulanmasına
              onay veren sunucular burada listelenecek. Sahte veya demo kayıt
              oluşturulmaz.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
