'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CfxServer } from '../lib/cfx';

function ServerLogo({ server }: { server: CfxServer }) {
  return (
    <span className="server-logo-frame">
      <span className="server-logo-fallback" aria-hidden="true">
        {server.name.trim().slice(0, 1).toLocaleUpperCase('tr') || '5'}
      </span>
      {server.iconUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="server-logo"
          src={server.iconUrl}
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      )}
    </span>
  );
}

export function ServerDirectory({ servers }: { servers: CfxServer[] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'players' | 'name'>('players');
  const [selectedServer, setSelectedServer] = useState<CfxServer | null>(null);
  const detailsDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = detailsDialog.current;
    if (!selectedServer || !dialog) return;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [selectedServer]);

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
        <span>Cfx public sunucu listesi</span>
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
                  <div className="server-main">
                    <ServerLogo server={server} />
                    <div className="server-info">
                      <div className="server-title-row">
                        <h3>{server.name}</h3>
                        <span className="status-dot" aria-label="Çevrimiçi" />
                      </div>
                      <p className="server-subtitle">{server.locale}</p>
                    </div>
                  </div>
                  <div className="tag-row server-tags">
                    {server.tags.map((tag, index) => (
                      <span className="tag" key={`${server.id}-${tag}-${index}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="server-stats">
                    <div className="server-player-count">
                      <strong>{server.players}</strong>
                      <span> / {server.maxPlayers}</span>
                    </div>
                    <div
                      className="capacity-track"
                      role="meter"
                      aria-label="Oyuncu kapasitesi"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={fill}
                    >
                      <span style={{ width: `${fill}%` }} />
                    </div>
                  </div>
                  <div className="server-card-actions">
                    <button
                      type="button"
                      className="server-link server-details-button"
                      onClick={() => setSelectedServer(server)}
                    >
                      Bilgileri görüntüle
                    </button>
                    <a
                      className="server-link server-join-button"
                      href={`https://cfx.re/join/${server.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      FiveM'de aç
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
      {selectedServer && (
        <dialog
          className="server-detail-dialog"
          ref={detailsDialog}
          aria-labelledby="server-detail-title"
          onClose={() => setSelectedServer(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              detailsDialog.current?.close();
            }
          }}
        >
          <div className="server-detail-heading">
            <ServerLogo server={selectedServer} />
            <div>
              <div className="eyebrow">SUNUCU BİLGİLERİ</div>
              <h2 id="server-detail-title">{selectedServer.name}</h2>
            </div>
            <button
              type="button"
              className="server-detail-close"
              aria-label="Bilgi penceresini kapat"
              onClick={() => detailsDialog.current?.close()}
            >
              ×
            </button>
          </div>
          <dl className="server-detail-list">
            <div>
              <dt>Durum</dt>
              <dd>Çevrimiçi</dd>
            </div>
            <div>
              <dt>Dil</dt>
              <dd>{selectedServer.locale}</dd>
            </div>
            <div>
              <dt>Oyuncular</dt>
              <dd>{selectedServer.players} / {selectedServer.maxPlayers}</dd>
            </div>
            <div>
              <dt>Sunucu kodu</dt>
              <dd>{selectedServer.id}</dd>
            </div>
            {selectedServer.tags.length > 0 && (
              <div>
                <dt>Etiketler</dt>
                <dd>{selectedServer.tags.join(', ')}</dd>
              </div>
            )}
          </dl>
          <a
            className="server-link server-join-button"
            href={`https://cfx.re/join/${selectedServer.id}`}
            target="_blank"
            rel="noreferrer"
          >
            FiveM'de aç
          </a>
        </dialog>
      )}
    </>
  );
}
