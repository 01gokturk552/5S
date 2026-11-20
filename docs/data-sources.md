# Veri Kaynakları

## Cfx

Başlangıçta sadece Cfx'in erişime izin verdiği, belgelenmiş ve public server list
verileri kullanılmalıdır. Private endpoint, internal API veya reverse engineering
kullanılmayacaktır.

Her Cfx kaydı:

- internal UUID
- external Cfx identity
- kaynak adı
- gözlem zamanı
- başarı durumu
- freshness durumu

alanlarıyla saklanmalıdır.

## Provider izolasyonu

Provider arayüzleri provider hatalarını yalıtmalı ve paralel modüllerin
çalışmasını durdurmamalıdır.

Gerçek sağlayıcı bağlantısı kurulana kadar API gerçek veya demo sunucu verisi
üretmez.
