# Veri Kalitesi

## Temel kurallar

- Bilinmeyen veri tahmin edilmez.
- Eksik alanlar sıfır veya false olarak gösterilmez.
- Her public veri alanı kaynağını ve son güncellemesini gösterebilir.
- Owner-submitted ve inferred information ayrı tutulur.
- Tek hata anında server offline sayılmaz.
- Unique server identity UUID'dir.

## Stale veri

Verinin güncelliği sağlayıcının beklenen polling aralığına göre hesaplanır.
Stale veri public sayfada korunabilir fakat güncel veri olarak sunulmamalıdır.
