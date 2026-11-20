import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SiteHeader } from '../components/site-header';
import { DiscordConnection } from '../components/discord-connection';
import {
  getDiscordAccount,
  getDiscordOAuthConfig,
  getSessionUser,
  getSiteRole,
  sessionCookieName,
} from '../lib/auth-store';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ discord?: string }>;
}) {
  const cookieStore = await cookies();
  const user = getSessionUser(cookieStore.get(sessionCookieName)?.value);
  if (!user) redirect('/login');

  const { discord: discordStatus } = await searchParams;
  const siteRole = getSiteRole(user.email);

  return (
    <>
      <SiteHeader />
      <main className="profile-layout">
        <section className="profile-heading">
          <div className="eyebrow">HESABIM</div>
          <h1>{user.username}</h1>
          <p>{user.email}</p>
        </section>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <div className="eyebrow">5S</div>
              <h2>Site yetkin</h2>
            </div>
            <span className={`role-badge${siteRole ? ' staff-role' : ''}`}>
              {siteRole?.name ?? 'Standart kullanıcı'}
            </span>
          </div>
          <p>
            {siteRole
              ? 'Site yönetim ekibindeki görevin bu hesap için tanımlı.'
              : 'Bu hesapta site yönetim ekibi görevi tanımlı değil.'}
          </p>
        </section>

        <DiscordConnection
          account={getDiscordAccount(user.id)}
          status={discordStatus}
          configured={Boolean(getDiscordOAuthConfig())}
        />
      </main>
    </>
  );
}
