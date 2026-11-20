'use client';

import { useMemo, useState } from 'react';
import type { CfxServer } from '../lib/cfx';

export function ServerDirectory({ servers }: { servers: CfxServer[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'players' | 'name'>('players');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr');
    const result = servers.filter((server) =>
      !normalized ||
      server.name.toLocaleLowerCase('tr').includes(normalized) ||
      server.id.toLocaleLowerCase('tr').includes(normalized),
    );

    return [...result].sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name, 'tr')
        : b.players - a.players,
    );
  }, [servers, query, sort]);

  const applyQuery = (value: string) => {
    setQuery(value);
  };

  return (
    <>
      <div className="directory-toolbar">
        <div className="directory-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.1-2.4 5.9 5.9" />
          </svg>
          <input
            value={query}
            onChange={(event) => applyQuery(event.target.value)}
            aria-label="Sunucu ara"
            placeholder="Sunucu adı veya join kodu ara"
          />
        </div>
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value as 'players' | 'name');
          }}
          aria-label="Sunucuları sırala"
        >
          <option value="players">Oyuncu sayısına göre</option>
          <option value="name">Sunucu adına göre</option>
        </select>
      </div>

      <div className="directory-summary">
        <span>{filtered.length} sunucu</span>
        <span>Cfx public Türk sunucu listesi</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state directory-empty">
          <h3>Sunucu sonucu bulunamadı</h3>
          <p>Aradığınız isim veya join koduyla eşleşen bir sunucu yok.</p>
        </div>
      ) : (
        <>
          <div className="server-grid">
            {filtered.map((server) => {
            const fill =
              server.maxPlayers > 0
                ? Math.min(100, Math.round((server.players / server.maxPlayers) * 100))
                : 0;
            return (
              <article className="server-card" key={server.id}>
                <div className="server-card-cover">
                  {server.bannerUrl ? (
                    // Cfx-provided public metadata image
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={server.bannerUrl} alt="" />
                  ) : (
                    <div className="cover-placeholder" />
                  )}
                  {server.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="server-icon" src={server.iconUrl} alt="" />
                  ) : (
                    <span className="server-icon server-icon-fallback">
                      {server.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="server-card-body">
                  <div className="server-info">
                    <div className="server-card-topline">
                      <span className="status-dot">Çevrimiçi</span>
                      <span>{server.locale}</span>
                    </div>
                    <h3>{server.name}</h3>
                    <div className="tag-row">
                      {server.tags.map((tag, index) => (
                        <span className="tag" key={`${server.id}-${tag}-${index}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="server-metrics">
                    <div className="player-row">
                      <strong>{server.players}</strong>
                      <span>/ {server.maxPlayers} oyuncu</span>
                    </div>
                    <div className="capacity-track">
                      <span style={{ width: `${fill}%` }} />
                    </div>
                    <a
                      className="server-link"
                      href={`https://cfx.re/join/${server.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      FiveM'de aç
                    </a>
                  </div>
                </div>
              </article>
            );
            })}
          </div>
        </>
      )}
    </>
  );
}
