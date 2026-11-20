import Link from 'next/link';
import { SiteHeader } from './components/site-header';
import { ServerDirectory } from './components/server-directory';
import { getCfxTurkishServers } from './lib/cfx';

export default async function HomePage() {
  const servers = await getCfxTurkishServers();
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-copy">
            <div className="eyebrow">5S · FIVEM SUNUCU İSTİHBARATI</div>
            <h1>Sunucuyu bul.<br /><span>Verileri gör.</span></h1>
            <p className="hero-subtitle">
              FiveM topluluklarını keşfet, canlı performansı karşılaştır ve
              doğrulanmış sunucu verilerine tek profesyonel platformdan ulaş.
            </p>
            <form className="search-form" action="/servers">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.1-2.4 5.9 5.9" />
              </svg>
              <input name="q" aria-label="Sunucu ara" placeholder="Sunucu adı veya join kodu ara" />
              <button type="submit">Sunucuları keşfet</button>
            </form>
          </div>
        </section>

        <section className="stats-strip" aria-label="Platform istatistikleri">
          <div>
            <span className="stat-value">--</span>
            <span className="stat-label">Kayıtlı sunucu</span>
          </div>
          <div>
            <span className="stat-value">--</span>
            <span className="stat-label">Şu anda çevrimiçi</span>
          </div>
          <div>
            <span className="stat-value">--</span>
            <span className="stat-label">Aktif oyuncu</span>
          </div>
          <div>
            <span className="stat-value">--</span>
            <span className="stat-label">Maksimum kapasite</span>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">KEŞFET</div>
              <h2>Sunucuları keşfet</h2>
            </div>
            <Link className="outline-button" href="/servers">Tüm sunucular</Link>
          </div>

          {servers.length === 0 ? (
            <div className="empty-state">
              <h3>Cfx sunucu verisi alınamadı</h3>
              <p>
                Public sağlayıcı geçici olarak ulaşılamıyor. Aynı veri kaynağı
                yeniden kullanılabilir olduğunda sunucular burada görünür.
              </p>
            </div>
          ) : (
            <ServerDirectory servers={servers.slice(0, 6)} />
          )}
        </section>

        <section className="section capability-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">PLATFORM</div>
              <h2>Sunucu toplulukları için tasarlandı</h2>
            </div>
          </div>
          <div className="capability-grid">
            <article>
              <span>01</span>
              <h3>Canlı keşif</h3>
              <p>Herkese açık FiveM sunucularını ara, filtrele ve karşılaştır.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Oyuncu analitiği</h3>
              <p>Zaman ağırlıklı geçmiş ölçülerle trafik davranışını incele.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Sunucu yönetimi</h3>
              <p>Doğrulanmış ekipler profil, personel ve entegrasyonları yönetebilir.</p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
