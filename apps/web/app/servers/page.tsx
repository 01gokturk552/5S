import { SiteHeader } from '../components/site-header';
import { ServerDirectory } from '../components/server-directory';
import { getCfxTurkishServers } from '../lib/cfx';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function ServersPage() {
  const servers = await getCfxTurkishServers();

  return (
    <>
      <SiteHeader active="servers" />
      <main>
        <section className="section server-directory">
          <div className="eyebrow">SUNUCU DİZİNİ</div>
          <h1>Tüm sunucuları keşfet</h1>
          <div className="directory-tabs" aria-label="Sunucu listesi türleri">
            <Link className="directory-tab active" href="/servers">Sunucular</Link>
            <Link className="directory-tab" href="/servers/agreements">Anlaşmalı Sunucular</Link>
          </div>
          <ServerDirectory servers={servers} />
        </section>
      </main>
    </>
  );
}
