'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function AuthForm({ mode }: { mode: 'register' | 'login' }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === 'register';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || 'İşlem tamamlanamadı. Lütfen tekrar deneyin.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {isRegister && (
        <>
          <label htmlFor="username">Kullanıcı adı</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            minLength={3}
            maxLength={32}
            required
            placeholder="Benzersiz bir kullanıcı adı seçin"
          />
        </>
      )}
      <label htmlFor="email">E-posta adresi</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        maxLength={254}
        required
        placeholder="ornek@mail.com"
      />
      <label htmlFor="password">Parola</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        minLength={isRegister ? 10 : undefined}
        maxLength={128}
        required
        placeholder={isRegister ? 'En az 10 karakter' : 'Parolanızı girin'}
      />
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? 'Lütfen bekleyin...'
          : isRegister
            ? 'Hesap oluştur'
            : 'Giriş yap'}
      </button>
    </form>
  );
}
