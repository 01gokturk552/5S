'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type SessionUser = {
  id: string;
  username: string;
  email: string;
};

export function AuthActions() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Oturum bilgisi alınamadı.');
        return (await response.json()) as { user: SessionUser | null };
      })
      .then((result) => {
        if (active) setUser(result.user);
      })
      .catch(() => {
        if (active) setError('Oturum bilgisi alınamadı.');
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    setError('');
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Çıkış yapılamadı.');
      setUser(null);
    } catch {
      setError('Çıkış yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!loaded) return <div className="header-actions" aria-label="Oturum yükleniyor" />;

  if (error && !user) {
    return (
      <div className="header-actions">
        <span className="header-auth-error" role="alert">{error}</span>
        <Link className="primary-button" href="/register">Kayıt ol</Link>
      </div>
    );
  }

  if (user) {
    return (
      <div className="header-actions">
        {error && <span className="header-auth-error" role="alert">{error}</span>}
        <Link className="profile-link" href="/profile" aria-label={`${user.username} profilini aç`}>
          <span className="profile-avatar" aria-hidden="true">
            {user.username.slice(0, 1).toLocaleUpperCase('tr')}
          </span>
          <span>{user.username}</span>
        </Link>
        <button
          className="text-button logout-button"
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Çıkış...' : 'Çıkış yap'}
        </button>
      </div>
    );
  }

  return (
    <div className="header-actions">
      <Link className="text-button" href="/login">Giriş yap</Link>
      <Link className="primary-button" href="/register">Kayıt ol</Link>
    </div>
  );
}
