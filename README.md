# 5S

FiveM sunucularını Cfx'in izinli ve herkese açık veri kaynaklarıyla keşfetmek ve
sunucu sahipleri için doğrulanmış yönetim özellikleri sunmak üzere tasarlanan
5S, FiveM sunucuları için bağımsız bir sunucu istihbarat platformudur.

## Durum

İlk proje iskeleti hazırlanmıştır:

- Next.js web uygulaması
- NestJS REST API
- PostgreSQL Prisma şeması
- Redis ve BullMQ için altyapı hazırlığı
- Cfx provider interface'i
- Temel server entitlement resolver
- Docker Compose yapılandırması
- API/OpenAPI başlangıç noktaları

Web uygulamasında Discord hesabı OAuth ile bağlanabilir. Discord sunucu rol
eşitlemesi ve ödeme bağlantısı henüz yapılandırılmamıştır.

## Yerel geliştirme

```powershell
npm install
npm run prisma:generate
npm run dev
```

Docker Desktop mevcut olduğunda:

```powershell
docker compose up --build
```

API: `http://localhost:4000/api/v1`
Swagger: `http://localhost:4000/docs`
Web: `http://localhost:3000`

## Discord hesabı bağlantısı

Discord Developer Portal'da bir uygulama oluşturup OAuth2 Redirects listesine
`http://localhost:3000/api/auth/discord/callback` adresini ekleyin. Uygulama
çalışırken `apps/web/.env.local` dosyasında şu değerleri tanımlayın:

```env
FIVEMYB_DISCORD_CLIENT_ID="Discord uygulama ID'si"
FIVEMYB_DISCORD_CLIENT_SECRET="Discord uygulama gizli anahtarı"
FIVEMYB_DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/discord/callback"
```

Web sunucusunu yeniden başlatıp oturum açtıktan sonra `/profile` sayfasındaki
Discord bağlantı düğmesini kullanın. Kullanıcıdan `identify` ve
`guilds.members.read` izinleri istenir. Uygulama Discord erişim belirtecini
saklamaz; yalnızca Discord kullanıcı ID'sini ve görünen adını saklar. Bağlantı
profil sayfasından kaldırılabilir. Sunucu rolü göstermek için Discord sunucu
eşleştirmesi ayrıca yapılandırılmalıdır.

## Veri ilkesi

Platform gerçek olmayan sunucu, oyuncu, Discord veya abonelik verisi üretmez.
Sunucu verileri yalnızca yapılandırılmış ve erişime izin verilmiş kaynaklardan
toplanmalı, kaynak ve güncellik bilgisiyle birlikte saklanmalıdır.
