import { SiteHeader } from '../components/site-header';

export default function ComparePage() {
  return (
    <>
      <SiteHeader active="compare" />
      <main>
        <section className="section server-directory">
          <div className="eyebrow">SUNUCU KARŞILAŞTIRMASI</div>
          <h1>Sunucuları yan yana karşılaştır</h1>
          <div className="empty-state directory-empty">
            <h3>Karşılaştırma verileri bekleniyor</h3>
            <p>Canlı sunucu sağlayıcısı bağlanınca seçtiğiniz sunucuların oyuncu, doluluk, uptime ve doğrulama verileri burada karşılaştırılabilecek.</p>
          </div>
        </section>
      </main>
    </>
  );
}
