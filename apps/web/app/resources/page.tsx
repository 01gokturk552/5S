import { SiteHeader } from '../components/site-header';

export default function ResourcesPage() {
  return (
    <>
      <SiteHeader active="resources" />
      <main>
        <section className="section server-directory">
          <div className="eyebrow">RESOURCE VE PAKETLER</div>
          <h1>Kaynakları ve paketleri keşfet</h1>
          <div className="empty-state directory-empty">
            <h3>Katalog henüz oluşturulmadı</h3>
            <p>Sunucu sahipleri doğrulanmış resource, paket, geliştirici ve fiyat bilgilerini eklediğinde katalog burada listelenecek.</p>
          </div>
        </section>
      </main>
    </>
  );
}
