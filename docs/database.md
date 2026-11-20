# Veritabanı Tasarımı

PostgreSQL ve Prisma kullanılacaktır.

İlk çekirdek model:

- User ve server membership
- Server external identity ve observations
- Invite ve audit log
- Feature catalog
- Subscription plans
- Server subscriptions
- Server feature overrides
- Discord guild connection

Büyük zaman serisi tabloları gerektikçe partition veya TimescaleDB ile
ölçeklendirilmelidir.
