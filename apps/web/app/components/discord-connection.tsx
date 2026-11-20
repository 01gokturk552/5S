'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type DiscordAccount = {
  discord_id: string | null;
  discord_username: string | null;
};

const statusMessages: Record<string, string> = {
  connected: 'Discord hesabın başarıyla bağlandı.',
  not_configured: 'Discord OAuth ayarları henüz yapılmadı.',
  denied: 'Discord bağlantı izni verilmedi.',
  invalid_state: 'Güvenlik doğrulaması başarısız oldu. Lütfen yeniden deneyin.',
  already_linked: 'Bu Discord hesabı başka bir 5S hesabına bağlı.',
  failed: 'Discord hesabı bağlanamadı. Lütfen yeniden deneyin.',
};

export function DiscordConnection({
  account,
  status,
  configured,
}: {
  account: DiscordAccount | null;
  status?: string;
  configured: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isUnlinking, setIsUnlinking] = useState(false);
  const isConnected = Boolean(account?.discord_id);

  async function unlink() {
    setError('');
    setIsUnlinking(true);
    try {
      const response = await fetch('/api/auth/discord/unlink', {
        method: 'POST',
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || 'Discord bağlantısı kaldırılamadı.');
      }
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Discord bağlantısı kaldırılamadı.',
      );
    } finally {
      setIsUnlinking(false);
    }
  }

  return (
    <section className="profile-card">
      <div className="profile-card-heading">
        <div>
          <div className="eyebrow">SUNUCU ERİŞİMLERİ</div>
          <h2>Discord hesabı</h2>
        </div>
        <span className={`role-badge${isConnected ? ' staff-role' : ' pending-role'}`}>
          {isConnected ? 'Bağlı' : 'Bağlı değil'}
        </span>
      </div>
      {isConnected ? (
        <>
          <p>
            Bağlı hesap: <strong>{account?.discord_username}</strong>
          </p>
          <p>
            Bu adım Discord hesabını doğrular. Sunucu yetkilerini göstermek için
            ilgili Discord sunucularının ayrıca siteye tanıtılması gerekir.
          </p>
          <button
            className="discord-action secondary-action"
            type="button"
            onClick={unlink}
            disabled={isUnlinking}
          >
            {isUnlinking ? 'Bağlantı kaldırılıyor...' : 'Discord bağlantısını kaldır'}
          </button>
        </>
      ) : (
        <>
          <p>
            Discord hesabını güvenli şekilde bağla. Sunucu üyeliği ve rol
            doğrulaması için gereken izin, Discord onay ekranında açıkça gösterilir.
          </p>
          {configured ? (
            <Link className="discord-action" href="/api/auth/discord/authorize">
              Discord hesabını bağla
            </Link>
          ) : (
            <p className="auth-error" role="status">
              Bağlantıyı açmak için site yöneticisinin Discord OAuth ayarlarını
              tamamlaması gerekiyor.
            </p>
          )}
        </>
      )}
      {status && statusMessages[status] && (
        <p className="auth-error" role="alert">{statusMessages[status]}</p>
      )}
      {error && <p className="auth-error" role="alert">{error}</p>}
    </section>
  );
}
