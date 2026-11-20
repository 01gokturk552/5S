import { SiteHeader } from '../components/site-header';

export default function LivePage() {
  return (
    <>
      <SiteHeader active="live" />
      <main>
        <section className="section server-directory">
          <div className="eyebrow">CANLI YAYINLAR</div>
          <h1>Sunucuyla ilişkili yayınları keşfet</h1>
          <div className="empty-state directory-empty">
            <h3>Yayın sağlayıcısı bağlı değil</h3>
            <p>Twitch veya YouTube bağlantısı kurulduğunda canlı yayınlar ve doğrulanmış sunucu ilişkileri gerçek verilerle gösterilecek.</p>
          </div>
        </section>
      </main>
    </>
  );
}
