# Mimari

## Uygulama katmanları

- `apps/web`: Next.js public site, owner dashboard ve admin dashboard.
- `apps/api`: NestJS REST API, auth, RBAC, feature guards ve provider orchestration.
- `apps/worker`: BullMQ scheduled provider jobs ve aggregation jobs.
- `packages/database`: Prisma schema, migrations ve generated client.
- `packages/contracts`: Ortak DTO ve API kontratları.
- `packages/feature-engine`: Abonelik ve override çözümleme.

## Runtime

```text
Web -> API -> PostgreSQL
           -> Redis/BullMQ
           -> Provider adapters
           -> S3-compatible storage
```

## Kimlik

Sunucu identity'si UUID'dir. Cfx ID, join code ve Discord snowflake değerleri
external identity olarak saklanır.

## Durum modeli

Server status değerleri `ONLINE`, `OFFLINE`, `DEGRADED`, `UNKNOWN` ve `STALE`
olarak tutulur. Tek hata stale veya unknown kararı gerektirebilir; tek hata ile
offline kararına kesin olarak geçilmez.
