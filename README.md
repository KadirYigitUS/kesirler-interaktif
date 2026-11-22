# kesirler-interaktif

7. sınıf (12 yaş) MEB Türkiye Yüzyılı Maarif Modeli ile uyumlu, tamamen Türkçe ve çevrimdışı çalışan etkileşimli matematik öğrenme laboratuvarı: **tam sayılar**, **rasyonel sayılar**, **sayı kümeleri**, **dağılma özelliği**, **oran-orantı** ve **desen keşifleri** (`[−50, +50]` tanım aralığı, gerçek Unicode eksi `−` ve Türkçe ondalık virgül `,`).

Canlı Sayfa: <https://kadiryigitus.github.io/kesirler-interaktif/>

## Mevcut Etkileşimli Modüller

- **Temel Çekirdekler:** `rasyonel.js` (`I1`–`I6` kesin rasyonel aritmetik çekirdeği), `ders_cekirdek.js` (bilgi/dikkat kutuları ve 3 kademeli test motoru), `sayi_dogrusu_slider.js` (`[−50, +50]` etkileşimli sayı doğrusu), `sembolik_reel.js`.
- **Araçlar (`html/` ve kök):** `index.html`, `sayilar_rehberi.html`, `kume_teorisi.html`, `dagilma_ozelligi.html`, `numberline_interactive.html`, `operations_interactive.html`, `coordinate_interactive.html`, `division_zero_interactive.html`, `pizza_interactive.html`, `squares_interactive.html` ve sadeleştirilmiş alıştırma sayfaları.

## Desen Avı ve Matematiksel Gösterim Yol Haritası

1. **Faz 1 — Müfredat Temellendirme, Denetim ve Şartname (Tamamlandı):** 6. ve 7. sınıf kazanım haritası doğrulandı; HTML/JS gösterim kusurları (ham LaTeX kalıntıları, nokta/yüzde biçimleri, hatalı `<link>` etiketleri ve `operations_interactive.html` işaret gösterimi) satır bazında belgelendi; "Çarpım Tablosu Desen Avı" teknik şartnamesi Türkçe ve sıfır-CDN Vanilla JS mimarisine yükseltildi.
2. **Faz 2 — Yerel Matematik İşleyici ve Gösterim Düzeltmeleri (Planlandı):** `DersCekirdek.formatMath` / `renderPageMath` / `fmtTR` özyinelemeli matematik işleyicisinin eklenmesi ve tüm mevcut sayfalardaki gösterim hatalarının giderilmesi.
3. **Faz 3 — Çarpım Tablosu Desen Avı Laboratuvarı (Planlandı):** `carpim_tablosu_desen_avi.html/.js` ile 10 adımlı keşif döngüsü (*BAK → FARK ET → TAHMİN ET → TEST ET → AÇIKLA → GENELLE*), klasik `1..10` ve 4 bölgeli `[−10, +10]` işaretli ızgara, `"sıfır özelliği"` ayrımı ve `[−50, +50]` kesirli oran-orantı dikdörtgenleri.
4. **Faz 4 — Uçtan Uca Tarayıcı Doğrulama ve Yayım (Planlandı):** Otomatik birim ve başsız tarayıcı testlerinin tamamlanıp canlı yayına alınması.
