/*!
 * sayilar_rehberi.js — "Sayıların Dünyası" referans sayfasının etkileşimli kısımları
 *  1) Sayı Dedektifi   : girilen sayının hangi kümelere ait olduğunu nedenleriyle söyler
 *  2) Çarpan/Asal Aracı: çarpanlar, asal çarpanlara ayırma, bölünebilme, EBOB-EKOK
 *  3) Kapalılık tablosu, sayı doğrusu haritası, hızlı kontrol (quiz)
 * Tüm hesaplar tam sayı (BigInt) ile yapılır; yaklaşık ondalık değer hiçbir sınıflandırmada kullanılmaz.
 * Tarayıcıda global `SayilarRehberi`, Node'da module.exports (yalnızca saf fonksiyonlar) olarak sunulur.
 */
(function (root) {
    'use strict';
    var MINUS = '\u2212';

    /* ---------- BigInt yardımcıları ---------- */
    function absB(a) { return a < 0n ? -a : a; }
    function gcdB(a, b) { a = absB(a); b = absB(b); while (b) { var t = a % b; a = b; b = t; } return a; }
    function isqrtB(n) {
        if (n < 2n) return n;
        var x = BigInt(Math.floor(Math.sqrt(Number(n))));
        while (x * x > n) x--;
        while ((x + 1n) * (x + 1n) <= n) x++;
        return x;
    }
    function fmtB(n) { return (n < 0n ? MINUS : '') + absB(n).toString(); }
    function fracStr(n, d) { return d === 1n ? fmtB(n) : fmtB(n) + '/' + d.toString(); }
    function mk(n, d) {                       // sadeleşmiş rasyonel, payda > 0
        if (d < 0n) { n = -n; d = -d; }
        var g = gcdB(n, d) || 1n;
        return { n: n / g, d: d / g };
    }

    /* ---------- Ondalık açılım ---------- */
    /** n/d (d>0) için {kind: 'tam'|'sonlu'|'devirli', str, ...}. Tür, kuramdan (paydanın asal çarpanları) gelir. */
    function decimalOf(n, d) {
        var neg = n < 0n; if (neg) n = -n;
        var whole = n / d, rem = n % d, sgn = neg ? MINUS : '';
        if (rem === 0n) return { kind: 'tam', str: sgn + whole.toString() };
        var dd = d; while (dd % 2n === 0n) dd /= 2n; while (dd % 5n === 0n) dd /= 5n;
        var finite = dd === 1n;
        var digits = [], seen = {}, rep = -1, steps = 0;
        while (rem !== 0n && steps < 120) {
            var key = rem.toString();
            if (seen[key] !== undefined) { rep = seen[key]; break; }
            seen[key] = digits.length;
            rem *= 10n; digits.push((rem / d).toString()); rem %= d; steps++;
        }
        var str;
        if (finite) str = sgn + whole + ',' + digits.join('');
        else if (rep >= 0) str = sgn + whole + ',' + digits.slice(0, rep).join('') + '(' + digits.slice(rep).join('') + ')';
        else str = sgn + whole + ',' + digits.slice(0, 40).join('') + '…';
        return { kind: finite ? 'sonlu' : 'devirli', str: str, period: rep >= 0 ? digits.length - rep : null };
    }

    /* ---------- Girdi ayrıştırma ---------- */
    function norm(s) {
        return String(s).trim()
            .replace(/[\u2212\u2013\u2014]/g, '-').replace(/\s+/g, '')
            .replace(/sqrt/gi, '\u221a').replace(/pi/gi, '\u03c0').replace(/,/g, '.');
    }
    /** Dönüş: {error} | {type:'rasyonel', n, d, form, src} | {type:'irrasyonel', kind, text, approx, why} */
    function parseSayi(input, depth) {
        depth = depth || 0;
        var s = norm(input), m;
        if (!s) return { error: 'Bir sayı yaz. Örnek: −3, 3/4, 0,25, 0,(3), √2, π' };

        if ((m = /^([+-]?)(\d{1,15})$/.exec(s))) {
            var v = BigInt(m[2]); if (m[1] === '-') v = -v;
            return { type: 'rasyonel', n: v, d: 1n, form: 'tam', src: s };
        }
        if ((m = /^([+-]?)(\d{1,15})\/([+-]?)(\d{1,15})$/.exec(s))) {
            var a = BigInt(m[2]), b = BigInt(m[4]);
            if (b === 0n) return { error: 'Payda 0 olamaz! ' + m[2] + '/0 tanımsızdır: hiçbir sayıyı 0 ile çarpınca ' + m[2] + ' elde edemeyiz.' };
            var neg = (m[1] === '-') !== (m[3] === '-');
            var r = mk(neg ? -a : a, b);
            return { type: 'rasyonel', n: r.n, d: r.d, form: 'kesir', src: s, rawN: a, rawD: b };
        }
        if ((m = /^([+-]?)(\d{1,15})\.(\d{0,15})(?:\((\d{1,12})\))?$/.exec(s))) {
            var w = m[2], f = m[3], rp = m[4];
            if (!f && !rp) return { error: 'Ondalık kısmı eksik. Örnek: 2,5 veya 0,(3)' };
            var num, den;
            if (rp) {
                num = BigInt(w + f + rp) - BigInt(w + f);
                den = (10n ** BigInt(f.length)) * (10n ** BigInt(rp.length) - 1n);
            } else {
                num = BigInt(w + f); den = 10n ** BigInt(f.length);
            }
            if (m[1] === '-') num = -num;
            var q = mk(num, den);
            return { type: 'rasyonel', n: q.n, d: q.d, form: rp ? 'devirli' : 'ondalik', src: s };
        }
        if ((m = /^([+-]?)(\d*)\u03c0$/.exec(s))) {
            if (m[2] !== '' && BigInt(m[2]) === 0n) return { type: 'rasyonel', n: 0n, d: 1n, form: 'tam', src: s, note: '0·π = 0' };
            var coef = m[2] === '' ? '' : m[2];
            return {
                type: 'irrasyonel', kind: 'pi', text: (m[1] === '-' ? MINUS : '') + coef + 'π',
                approx: ((m[1] === '-' ? -1 : 1) * (coef === '' ? 1 : Number(coef)) * Math.PI).toFixed(8).replace('.', ','),
                why: 'π, bir çemberin çevresinin çapına oranıdır. Ondalık açılımı sonsuza gider ve hiçbir yerde tekrar etmez (3,14159265358979…). Bu yüzden iki tam sayının oranı olarak yazılamaz. (π ile bir rasyonel sayının sıfırdan farklı çarpımı da irrasyoneldir.) 22/7 ve 3,14 yalnızca π’ye yakın rasyonel sayılardır; π değildir.'
            };
        }
        if ((m = /^([+-]?)\u221a(.+)$/.exec(s))) {
            if (depth > 0) return { error: 'İç içe kök desteklenmiyor.' };
            var inner = m[2];
            if (/^\(.*\)$/.test(inner)) inner = inner.slice(1, -1);
            var p = parseSayi(inner, depth + 1);
            if (p.error) return p;
            if (p.type !== 'rasyonel') return { error: 'Kökün içine bir rasyonel sayı yaz (örnek: √2, √(9/4)).' };
            if (p.n < 0n) return { error: 'Negatif sayının karekökü reel sayı değildir (' + MINUS + '4 gibi bir sayıyı kendisiyle çarpınca negatif sonuç çıkmaz). Bu yüzden √' + fmtB(p.n) + ' reel sayılarda tanımsızdır.' };
            var sn = isqrtB(p.n), sd = isqrtB(p.d);
            var sg = m[1] === '-';
            if (sn * sn === p.n && sd * sd === p.d) {
                var rr = mk(sg ? -sn : sn, sd);
                return { type: 'rasyonel', n: rr.n, d: rr.d, form: 'kok', src: s, note: '√' + fracStr(p.n, p.d) + ' = ' + fracStr(sn, sd) + ' (tam kare olduğu için kök rasyoneldir)' };
            }
            var approx = Math.sqrt(Number(p.n) / Number(p.d));
            return {
                type: 'irrasyonel', kind: 'kok', text: (sg ? MINUS : '') + '√' + (p.d === 1n ? p.n.toString() : '(' + fracStr(p.n, p.d) + ')'),
                approx: ((sg ? -1 : 1) * approx).toFixed(8).replace('.', ','),
                why: 'Karesi ' + fracStr(p.n, p.d) + ' olan pozitif sayıya √' + fracStr(p.n, p.d) + ' denir. ' +
                    (p.d === 1n ? p.n.toString() + ' bir tam kare (1, 4, 9, 16, 25, …) olmadığı' : 'Sadeleşmiş kesirde pay ve paydanın ikisi birden tam kare olmadığı') +
                    ' için √' + fracStr(p.n, p.d) + ' iki tam sayının oranı olarak yazılamaz → irrasyoneldir. Ondalık açılımı sonsuz ve devirsizdir.'
            };
        }
        return { error: 'Bu yazılışı anlayamadım. Deneyebileceklerin: −3, 3/4, 0,25, 0,(3), 1,2(45), √2, √(9/4), π' };
    }

    /* ---------- Sınıflandırma ---------- */
    var SETLIST = [
        { k: 'np', ad: 'Sayma sayıları', sim: 'ℕ⁺' },
        { k: 'n', ad: 'Doğal sayılar', sim: 'ℕ' },
        { k: 'z', ad: 'Tam sayılar', sim: 'ℤ' },
        { k: 'q', ad: 'Rasyonel sayılar', sim: 'ℚ' },
        { k: 'i', ad: 'İrrasyonel sayılar', sim: 'ℚ′' },
        { k: 'r', ad: 'Reel (gerçel) sayılar', sim: 'ℝ' }
    ];
    /** Üyelik: {np,n,z,q,i,r: {yes, why}} */
    function classify(p) {
        var c = {};
        if (p.type === 'irrasyonel') {
            c.np = { yes: false, why: 'Sayma sayıları 1, 2, 3 … gibi tam sayılardır; bu sayı bir tam sayı değildir.' };
            c.n = { yes: false, why: 'Doğal sayılar 0, 1, 2, 3 … tam sayılarıdır; bu sayı kesirli/ondalıklı bir sayıdır.' };
            c.z = { yes: false, why: 'Tam sayı olsaydı ondalık kısmı olmazdı.' };
            c.q = { yes: false, why: 'a/b (a, b tam sayı, b≠0) biçiminde yazılamaz.' };
            c.i = { yes: true, why: 'Kesir olarak yazılamıyor ve ondalık açılımı sonsuz–devirsiz.' };
            c.r = { yes: true, why: 'Sayı doğrusunda bir noktaya karşılık gelir (rasyonel + irrasyonel = reel).' };
            return c;
        }
        var n = p.n, d = p.d, isInt = d === 1n;
        c.np = isInt && n >= 1n ? { yes: true, why: 'Pozitif bir tam sayı: 1, 2, 3 … dizisinde yer alır.' } :
            { yes: false, why: !isInt ? 'Tam sayı bile değil.' : n === 0n ? 'Sayma 1’den başlar; 0 sayma sayısı değildir.' : 'Negatif sayılar saymada kullanılmaz.' };
        c.n = isInt && n >= 0n ? { yes: true, why: 'Sıfır ya da pozitif bir tam sayı.' } :
            { yes: false, why: !isInt ? 'Tam sayı bile değil.' : 'Negatif tam sayılar doğal sayı değildir.' };
        c.z = isInt ? { yes: true, why: 'Paydası 1 olan (sadeleşmiş hâli tam sayı olan) sayı.' } :
            { yes: false, why: 'Sadeleştirilince ' + fracStr(n, d) + ' kalıyor; paydası 1 olmadığı için tam sayı değil.' };
        c.q = { yes: true, why: fracStr(n, d) + ' biçiminde yazılabiliyor: pay tam sayı, payda 0’dan farklı.' };
        c.i = { yes: false, why: 'Rasyonel olduğu için irrasyonel olamaz (bir sayı ikisi birden olamaz).' };
        c.r = { yes: true, why: 'Her rasyonel sayı aynı zamanda reel sayıdır.' };
        return c;
    }

    /* ---------- Sayı Dedektifi arayüzü ---------- */
    function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    function dedektifCalistir(input) {
        var out = document.getElementById('detSonuc');
        var p = parseSayi(input);
        if (p.error) {
            out.innerHTML = '<div class="det-hata" role="alert">⚠️ ' + esc(p.error) + '</div>';
            return p;
        }
        var cls = classify(p), html = '';
        var title, lines = [];
        if (p.type === 'rasyonel') {
            var dec = decimalOf(p.n, p.d);
            title = fracStr(p.n, p.d);
            if (p.form === 'ondalik' || p.form === 'devirli') lines.push('<b>Yazılış:</b> ' + esc(input.trim()) + ' = ' + esc(fracStr(p.n, p.d)) + (p.form === 'devirli' ? ' (devirli ondalık gösterim bir kesre dönüştürülebilir)' : ''));
            if (p.form === 'kesir' && !(p.rawD === p.d && p.rawN === absB(p.n))) lines.push('<b>Sadeleştirme:</b> ' + esc(input.trim()) + ' = ' + esc(fracStr(p.n, p.d)));
            if (p.note) lines.push(esc(p.note));
            if (p.d === 1n) lines.push('<b>Ondalık gösterim:</b> ' + dec.str + ' (paydası 1 olan rasyonel sayı = tam sayı)');
            else {
                lines.push('<b>Ondalık açılım:</b> ' + esc(dec.str) + ' → <b>' + (dec.kind === 'sonlu' ? 'sonlu (biten) ondalık' : 'devirli ondalık') + '</b>');
                lines.push(dec.kind === 'sonlu'
                    ? '<b>Neden?</b> Sadeleşmiş paydanın (' + p.d + ') asal çarpanları yalnız 2 ve/veya 5 olduğu için kesir 10, 100, 1000 … paydalı bir kesre genişletilebilir; bu yüzden ondalık açılım biter.'
                    : '<b>Neden?</b> Sadeleşmiş paydanın (' + p.d + ') 2 ve 5’ten başka asal çarpanı olduğu için ondalık açılım bitmez; kalanlar tekrar edince basamaklar devreder.');
            }
            if (p.n === 0n) lines.push('<b>Dikkat:</b> 0 ne pozitif ne negatiftir; ama 0 = 0/1 olduğu için rasyonel sayıdır.');
            if (p.d === 1n && p.n === 1n && p.form === 'devirli') lines.push('<b>İlginç:</b> 0,(9) = 1 ! Çünkü 1/3 = 0,(3) ve 3 × 0,(3) = 0,(9) ama 3 × 1/3 = 1.');
        } else {
            title = p.text;
            lines.push('<b>Yaklaşık değeri:</b> ' + p.approx + '… (tam değeri değil, yalnızca yaklaşımıdır)');
            lines.push('<b>Neden irrasyonel?</b> ' + esc(p.why));
        }
        html += '<div class="det-baslik">' + esc(title) + '</div>';
        html += '<ul class="det-satir">' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>';
        html += '<div class="det-grid">';
        SETLIST.forEach(function (s) {
            var c = cls[s.k];
            html += '<div class="det-chip ' + (c.yes ? 'evet' : 'hayir') + '" data-set="' + s.k + '"><div class="det-chip-ust"><span class="sim">' + s.sim + '</span> ' + s.ad + ' <span class="tik">' + (c.yes ? '✔' : '✘') + '</span></div><div class="det-chip-alt">' + esc(c.why) + '</div></div>';
        });
        html += '</div>';
        var yes = SETLIST.filter(function (s) { return cls[s.k].yes; }).map(function (s) { return s.sim; });
        html += '<div class="det-ozet">Özet: <b>' + esc(title) + '</b> sayısı şu kümelerin elemanıdır: <b>' + yes.join(', ') + '</b></div>';
        out.innerHTML = html;
        return { parsed: p, cls: cls };
    }

    /* ---------- Çarpan / Asal / Bölünebilme ---------- */
    function factorize(n) {
        var f = [], x = n;
        for (var p = 2; p * p <= x; p += (p === 2 ? 1 : 2)) {
            var e = 0; while (x % p === 0) { x /= p; e++; }
            if (e) f.push([p, e]);
        }
        if (x > 1) f.push([x, 1]);
        return f;
    }
    function divisorsOf(f) {
        var ds = [1];
        f.forEach(function (pe) {
            var cur = ds.slice(), pw = 1;
            for (var i = 1; i <= pe[1]; i++) { pw *= pe[0]; cur.forEach(function (d) { ds.push(d * pw); }); }
        });
        return ds.sort(function (a, b) { return a - b; });
    }
    function sup(e) { var m = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }; return String(e).split('').map(function (c) { return m[c]; }).join(''); }
    function factStr(f) { return f.map(function (pe) { return pe[1] > 1 ? pe[0] + sup(pe[1]) : String(pe[0]); }).join(' × '); }
    function digitsOf(n) { return String(n).split('').map(Number); }
    function divisibilityRows(n) {
        var s = String(n), dg = digitsOf(n), sum = dg.reduce(function (a, b) { return a + b; }, 0);
        var last2 = Number(s.slice(-2)), last3 = Number(s.slice(-3));
        var alt = 0; dg.slice().reverse().forEach(function (d, i) { alt += (i % 2 === 0 ? d : -d); });
        var ok2 = n % 2 === 0, ok3 = sum % 3 === 0;
        return [
            [2, ok2, 'Son rakam ' + s.slice(-1) + ' → ' + (ok2 ? 'çift' : 'tek')],
            [3, ok3, 'Rakamlar toplamı ' + sum + ' → ' + (ok3 ? '3’ün katı' : '3’ün katı değil')],
            [4, last2 % 4 === 0, 'Son iki basamak ' + last2 + (last2 % 4 === 0 ? ', 4’e bölünür' : ', 4’e bölünmez')],
            [5, n % 5 === 0, 'Son rakam ' + s.slice(-1) + (n % 5 === 0 ? ' (0 veya 5)' : ' (0 veya 5 değil)')],
            [6, ok2 && ok3, '2’ye ve 3’e birlikte bölünmeli: ' + (ok2 ? '2 ✔' : '2 ✘') + ', ' + (ok3 ? '3 ✔' : '3 ✘')],
            [8, last3 % 8 === 0, 'Son üç basamak ' + last3 + (last3 % 8 === 0 ? ', 8’e bölünür' : ', 8’e bölünmez')],
            [9, sum % 9 === 0, 'Rakamlar toplamı ' + sum + (sum % 9 === 0 ? ' → 9’un katı' : ' → 9’un katı değil')],
            [10, n % 10 === 0, 'Son rakam ' + s.slice(-1) + (n % 10 === 0 ? ' (0)' : ' (0 değil)')],
            [11, alt % 11 === 0, 'Sağdan başlayıp +,−,+,− ile rakam toplamı: ' + (alt < 0 ? MINUS + (-alt) : alt) + (alt % 11 === 0 ? ' → 11’in katı' : ' → 11’in katı değil')]
        ];
    }
    function carpanCalistir(raw) {
        var out = document.getElementById('carpanSonuc');
        var t = String(raw).trim();
        if (!/^\d{1,9}$/.test(t)) {
            out.innerHTML = '<div class="det-hata" role="alert">⚠️ 0 ile 999 999 999 arasında bir doğal sayı yaz (negatif ya da kesirli sayıların doğal sayı olmadığını unutma).</div>';
            return null;
        }
        var n = Number(t), h = '';
        if (n === 0) {
            out.innerHTML = '<div class="det-baslik">0</div><ul class="det-satir"><li>0 bir doğal sayıdır; ama <b>asal değildir, bileşik de değildir</b>.</li><li>Her doğal sayı 0’ı böler (0 = 5 × 0), bu yüzden 0’ın çarpanları sonsuz tanedir.</li><li>0 sayısı her sayının katıdır: 0 = 0 × 7.</li><li>0 çift sayıdır (2’ye bölünür).</li></ul>';
            return { n: 0 };
        }
        var f = factorize(n), ds = divisorsOf(f);
        var asal = ds.length === 2;
        var tur = n === 1 ? '1 ne asal ne bileşiktir (yalnızca 1 çarpanı var).' : asal ? n + ' bir <b>asal sayıdır</b>: tam olarak iki farklı çarpanı var (1 ve ' + n + ').' : n + ' bir <b>bileşik sayıdır</b>: ikiden çok çarpanı var.';
        h += '<div class="det-baslik">' + n + '</div><ul class="det-satir">';
        h += '<li>' + tur + '</li>';
        h += '<li><b>Çarpanları (' + ds.length + ' tane):</b> ' + (ds.length <= 60 ? ds.join(', ') : ds.slice(0, 30).join(', ') + ' … ' + ds.slice(-10).join(', ')) + '</li>';
        if (n > 1) h += '<li><b>Asal çarpanlara ayırma:</b> ' + n + ' = ' + factStr(f) + (asal ? ' (kendisi asal)' : '') + '</li>';
        if (n > 1) h += '<li><b>Asal çarpanları:</b> ' + f.map(function (x) { return x[0]; }).join(', ') + '</li>';
        h += '<li><b>Çift/tek:</b> ' + (n % 2 === 0 ? 'çift' : 'tek') + (n === 2 ? ' (2, tek çift asal sayıdır)' : '') + '</li>';
        h += '</ul><div class="div-grid">';
        divisibilityRows(n).forEach(function (r) { h += '<div class="div-kutu ' + (r[1] ? 'evet' : 'hayir') + '"><b>' + r[0] + '</b> ile ' + (r[1] ? 'bölünür ✔' : 'bölünmez ✘') + '<small>' + r[2] + '</small></div>'; });
        h += '</div>';
        out.innerHTML = h;
        return { n: n, asal: asal, carpanSayisi: ds.length, f: f };
    }
    function ebobEkokCalistir(ra, rb) {
        var out = document.getElementById('ebobSonuc');
        if (!/^\d{1,9}$/.test(String(ra).trim()) || !/^\d{1,9}$/.test(String(rb).trim()) || Number(ra) < 1 || Number(rb) < 1) {
            out.innerHTML = '<div class="det-hata" role="alert">⚠️ İki sayı da 1 ile 999 999 999 arasında doğal sayı olmalı.</div>';
            return null;
        }
        var a = Number(ra), b = Number(rb), A = BigInt(a), B = BigInt(b);
        var g = gcdB(A, B), l = A / g * B;
        var fa = factorize(a), fb = factorize(b);
        var h = '<ul class="det-satir"><li>' + a + ' = ' + (a === 1 ? '1' : factStr(fa)) + ' ; ' + b + ' = ' + (b === 1 ? '1' : factStr(fb)) + '</li>';
        h += '<li><b>EBOB(' + a + ', ' + b + ') = ' + g + '</b> (ortak çarpanlardan en küçük üslülerle)</li>';
        h += '<li><b>EKOK(' + a + ', ' + b + ') = ' + l + '</b> (tüm asal çarpanlardan en büyük üslülerle)</li>';
        h += '<li>Kontrol: EBOB × EKOK = ' + (g * l) + ' = ' + a + ' × ' + b + ' = ' + (A * B) + ' ' + (g * l === A * B ? '✔' : '✘') + '</li>';
        if (g === 1n) h += '<li>EBOB 1 olduğu için <b>' + a + ' ile ' + b + ' aralarında asaldır</b> (ikisi de asal olmak zorunda değil).</li>';
        h += '</ul>';
        out.innerHTML = h;
        return { ebob: Number(g), ekok: l.toString() };
    }

    /* ---------- Kapalılık tablosu ---------- */
    var OPS = ['+', '−', '×', '÷'];
    var OPNAME = ['Toplama', 'Çıkarma', 'Çarpma', 'Bölme'];
    var KAPALI = {
        np: [[1, '3 + 5 = 8. İki sayma sayısının toplamı yine sayma sayısıdır.'],
            [0, '3 − 5 = −2 ve 4 − 4 = 0: sonuç sayma sayısı değil. Karşı örnek yeter!'],
            [1, '3 × 5 = 15. İki sayma sayısının çarpımı yine sayma sayısıdır.'],
            [0, '1 ÷ 2 = 1/2: sonuç sayma sayısı değil.']],
        n: [[1, '0 + 7 = 7, 3 + 5 = 8. Toplam yine doğal sayıdır.'],
            [0, '3 − 5 = −2 doğal sayı değildir.'],
            [1, '0 × 9 = 0, 3 × 5 = 15. Çarpım yine doğal sayıdır.'],
            [0, '1 ÷ 2 = 1/2 doğal sayı değildir (ayrıca 0’a bölme tanımsızdır).']],
        z: [[1, '(−3) + 5 = 2. Tam sayıların toplamı tam sayıdır.'],
            [1, '3 − 5 = −2 ve (−4) − (−6) = 2. Çıkarma, karşıtını toplamaktır; karşıt de tam sayı olduğundan sonuç tam sayıdır. İşte negatif sayıların gerekçesi!'],
            [1, '(−3) × 4 = −12. Çarpım tam sayıdır.'],
            [0, '1 ÷ 2 = 1/2 tam sayı değildir. Bölmenin sonucu için rasyonel sayılara ihtiyaç var.']],
        q: [[1, '1/2 + 1/3 = 5/6. Pay ve payda tam sayı, payda ≠ 0.'],
            [1, '1/2 − 3/4 = −1/4.'],
            [1, '(−2/3) × (3/4) = −1/2.'],
            [1, '(a/b) ÷ (c/d) = (a·d)/(b·c); c ≠ 0 ise bölen 0 değildir, sonuç yine rasyoneldir. (Bölen 0 olamaz!)']],
        i: [[0, '√2 + (−√2) = 0 ve 0 rasyoneldir. İki irrasyonelin toplamı irrasyonel olmak zorunda değil. (Ama √2 + √3 yine irrasyoneldir.)'],
            [0, '√2 − √2 = 0 rasyoneldir.'],
            [0, '√2 × √2 = 2 rasyoneldir.'],
            [0, '√2 ÷ √2 = 1 rasyoneldir.']],
        r: [[1, 'Reel sayılar toplamaya göre kapalıdır: π + 1, √2 + 3, …'],
            [1, 'Reel sayıların farkı reeldir.'],
            [1, 'Reel sayıların çarpımı reeldir: √2 × π.'],
            [1, 'Sıfırdan farklı bir reel sayıya bölünce sonuç reeldir. (Bölen 0 olamaz.)']]
    };
    function kapaliTabloKur() {
        var tbl = document.getElementById('kapaliTablo');
        if (!tbl) return;
        var h = '<thead><tr><th>Küme</th>' + OPNAME.map(function (o, i) { return '<th>' + o + ' (' + OPS[i] + ')</th>'; }).join('') + '</tr></thead><tbody>';
        SETLIST.forEach(function (s) {
            h += '<tr><th scope="row"><span class="sim">' + s.sim + '</span> ' + s.ad + '</th>';
            KAPALI[s.k].forEach(function (c, j) {
                h += '<td><button type="button" class="kapali-hucre ' + (c[0] ? 'evet' : 'hayir') + '" data-k="' + s.k + '" data-j="' + j + '" aria-label="' + s.ad + ' ' + OPNAME[j] + ': ' + (c[0] ? 'kapalı' : 'kapalı değil') + '">' + (c[0] ? '✔' : '✘') + '</button></td>';
            });
            h += '</tr>';
        });
        tbl.innerHTML = h + '</tbody>';
        var box = document.getElementById('kapaliAciklama');
        tbl.addEventListener('click', function (e) {
            var b = e.target.closest('.kapali-hucre'); if (!b) return;
            var k = b.getAttribute('data-k'), j = Number(b.getAttribute('data-j')), c = KAPALI[k][j];
            var s = SETLIST.filter(function (x) { return x.k === k; })[0];
            tbl.querySelectorAll('.secili').forEach(function (x) { x.classList.remove('secili'); });
            b.classList.add('secili');
            box.className = 'kapali-aciklama ' + (c[0] ? 'evet' : 'hayir');
            box.innerHTML = '<b>' + s.sim + ' kümesi, ' + OPNAME[j].toLowerCase() + ' işlemine göre ' + (c[0] ? 'kapalıdır ✔' : 'kapalı DEĞİLDİR ✘') + '.</b><br>' + esc(c[1]);
        });
    }

    /* ---------- Sayı doğrusu haritası ---------- */
    function sayiDogrusuKur() {
        var host = document.getElementById('haritaDogru'); if (!host) return;
        var L = -4, R = 4, W = 900, X0 = 40, sc = (W - 2 * X0) / (R - L);
        function X(v) { return X0 + (v - L) * sc; }
        var COLOR = { n: '#e67e22', z: '#2980b9', q: '#16a085', i: '#c0392b' };
        var pts = [
            [-3, '−3', 'z', 'Tam sayı (negatif)'], [-1.5, '−3/2', 'q', 'Rasyonel (tam sayı değil)'], [0, '0', 'n', 'Doğal sayı (sayma sayısı değil)'],
            [0.5, '1/2', 'q', 'Rasyonel'], [1, '1', 'n', 'Sayma sayısı'], [Math.SQRT2, '√2', 'i', 'İrrasyonel ≈ 1,41421356…'],
            [2, '2', 'n', 'Sayma sayısı'], [Math.PI, 'π', 'i', 'İrrasyonel ≈ 3,14159265…'], [3.75, '15/4', 'q', 'Rasyonel']
        ];
        var s = '<svg viewBox="0 0 ' + W + ' 170" role="img" aria-label="Sayı doğrusunda tam, rasyonel ve irrasyonel sayı örnekleri" style="width:100%;height:auto">';
        s += '<line x1="' + (X0 - 15) + '" y1="85" x2="' + (W - X0 + 15) + '" y2="85" stroke="#34495e" stroke-width="3"/>';
        s += '<polygon points="' + (W - X0 + 15) + ',85 ' + (W - X0 + 4) + ',79 ' + (W - X0 + 4) + ',91" fill="#34495e"/><polygon points="' + (X0 - 15) + ',85 ' + (X0 - 4) + ',79 ' + (X0 - 4) + ',91" fill="#34495e"/>';
        for (var t = L; t <= R; t++) {
            s += '<line x1="' + X(t) + '" y1="78" x2="' + X(t) + '" y2="92" stroke="#34495e" stroke-width="2"/><text x="' + X(t) + '" y="112" text-anchor="middle" font-size="14" fill="#7f8c8d">' + (t < 0 ? MINUS + Math.abs(t) : t) + '</text>';
        }
        pts.forEach(function (p, idx) {
            var up = idx % 2 === 0, y = up ? 52 : 140;
            s += '<g class="harita-nokta"><title>' + p[1] + ': ' + p[3] + '</title><line x1="' + X(p[0]) + '" y1="85" x2="' + X(p[0]) + '" y2="' + (up ? 62 : 128) + '" stroke="' + COLOR[p[2]] + '" stroke-width="2" stroke-dasharray="3 3"/>' +
                '<circle cx="' + X(p[0]) + '" cy="85" r="7" fill="' + COLOR[p[2]] + '" stroke="#fff" stroke-width="2"/><text x="' + X(p[0]) + '" y="' + y + '" text-anchor="middle" font-size="19" font-weight="700" fill="' + COLOR[p[2]] + '">' + p[1] + '</text></g>';
        });
        s += '</svg>';
        host.innerHTML = s;
    }

    /* ---------- Hızlı kontrol (quiz) ---------- */
    var SORULAR = [
        ['Aşağıdakilerden hangisi doğal sayıdır ama sayma sayısı değildir?', ['1', '0', '−1', '1/2'], 1, '0 doğal sayıdır (ℕ = {0, 1, 2, …}); sayma sayıları ise 1’den başlar.'],
        ['−7 sayısı aşağıdaki kümelerden hangisine ait DEĞİLDİR?', ['Tam sayılar', 'Rasyonel sayılar', 'Doğal sayılar', 'Reel sayılar'], 2, 'Negatif sayılar doğal sayı değildir; ama tam, rasyonel (−7/1) ve reel sayıdır.'],
        ['5/0 için hangisi doğrudur?', ['Rasyonel sayıdır', 'Tanımsızdır; payda 0 olamaz', '0’a eşittir', '5’e eşittir'], 1, 'Hiçbir sayıyı 0 ile çarpınca 5 elde edilmez; bu yüzden 5 ÷ 0 tanımsızdır.'],
        ['0,(3) hangi kesre eşittir?', ['3/10', '1/3', '33/100', '3/100'], 1, 'x = 0,333… ise 10x − x = 3 → 9x = 3 → x = 1/3.'],
        ['√9 için hangisi doğrudur?', ['İrrasyoneldir, çünkü kök işareti var', '3’tür; bir tam sayıdır (dolayısıyla rasyoneldir)', 'Reel sayı değildir', 'Negatiftir'], 1, '9 tam kare olduğu için √9 = 3. Kök işareti görmek irrasyonel demek değildir!'],
        ['π için hangisi doğrudur?', ['22/7’ye eşittir', '3,14’e eşittir', 'İrrasyoneldir; 22/7 ve 3,14 yaklaşık değerlerdir', 'Devirli ondalık bir sayıdır'], 2, 'π’nin ondalık açılımı sonsuz ve devirsizdir; 22/7 ve 3,14 yalnızca yakın rasyonel sayılardır.'],
        ['Hangi küme çıkarma işlemine göre kapalıdır?', ['Doğal sayılar', 'Sayma sayıları', 'Tam sayılar', 'İrrasyonel sayılar'], 2, 'Tam sayılarda 3 − 5 = −2 yine tam sayıdır. Diğerlerinde karşı örnek var (3 − 5, 4 − 4, √2 − √2).'],
        ['√2 × √2 işleminin sonucu hangisidir?', ['√4 yani irrasyonel', '2; rasyonel bir sayı', 'Tanımsız', '4'], 1, 'Karekökün tanımı: √2 × √2 = 2. İrrasyonellerin çarpımı rasyonel olabilir; irrasyoneller çarpmaya göre kapalı değildir.'],
        ['−3 − (−5) = ?', ['−8', '−2', '2', '8'], 2, 'Çıkarma = karşıtını toplama: −3 + 5 = 2.'],
        ['Hangisi asal sayı DEĞİLDİR?', ['2', '11', '1', '13'], 2, 'Asal sayının tam iki farklı çarpanı olur. 1’in yalnız bir çarpanı (kendisi) vardır, bu yüzden asal değildir.'],
        ['(−4) × (−3) = ?', ['−12', '−7', '7', '12'], 3, 'Eksi × eksi = artı; 4 × 3 = 12.'],
        ['Hangisi rasyonel sayı DEĞİLDİR?', ['0,125', '0,(7)', '−8', '√7'], 3, '0,125 = 1/8; 0,(7) = 7/9; −8 = −8/1. 7 tam kare olmadığı için √7 irrasyoneldir.']
    ];
    function quizKur() {
        var host = document.getElementById('quizAlan'); if (!host) return;
        var h = '';
        SORULAR.forEach(function (q, i) {
            h += '<div class="soru" id="soru' + i + '"><div class="soru-baslik">' + (i + 1) + '. ' + q[0] + '</div><div class="secenekler">';
            q[1].forEach(function (o, j) { h += '<button type="button" class="secenek" data-q="' + i + '" data-o="' + j + '">' + String.fromCharCode(65 + j) + ') ' + o + '</button>'; });
            h += '</div><div class="geri-bildirim" id="gb' + i + '" aria-live="polite"></div></div>';
        });
        host.innerHTML = h;
        var dogru = 0, cevap = {};
        host.addEventListener('click', function (e) {
            var b = e.target.closest('.secenek'); if (!b) return;
            var i = Number(b.getAttribute('data-q')), j = Number(b.getAttribute('data-o'));
            if (cevap[i] !== undefined) return;
            cevap[i] = j;
            var ok = j === SORULAR[i][2]; if (ok) dogru++;
            document.querySelectorAll('#soru' + i + ' .secenek').forEach(function (x, k) {
                x.disabled = true; if (k === SORULAR[i][2]) x.classList.add('dogru'); else if (k === j) x.classList.add('yanlis');
            });
            var gb = document.getElementById('gb' + i);
            gb.className = 'geri-bildirim ' + (ok ? 'evet' : 'hayir');
            gb.textContent = (ok ? '✔ Doğru! ' : '✘ Doğru cevap: ' + String.fromCharCode(65 + SORULAR[i][2]) + '. ') + SORULAR[i][3];
            var n = Object.keys(cevap).length;
            document.getElementById('quizSkor').textContent = 'Cevaplanan: ' + n + '/' + SORULAR.length + ' — Doğru: ' + dogru;
        });
    }

    /* ---------- Sayfa bağlantıları ---------- */
    function sekmeSec(k) {
        document.querySelectorAll('.set-sekme').forEach(function (b) { var on = b.getAttribute('data-set') === k; b.classList.toggle('aktif', on); b.setAttribute('aria-selected', on); });
        document.querySelectorAll('.set-panel').forEach(function (p) { p.classList.toggle('aktif', p.id === 'set-' + k); });
        document.querySelectorAll('.harita-kutu').forEach(function (b) { b.classList.toggle('secili', b.getAttribute('data-set') === k); });
    }
    function baslat() {
        var $ = function (id) { return document.getElementById(id); };
        document.querySelectorAll('.set-sekme').forEach(function (b) { b.addEventListener('click', function () { sekmeSec(b.getAttribute('data-set')); }); });
        document.querySelectorAll('.harita-kutu').forEach(function (b) {
            b.addEventListener('click', function (e) { e.stopPropagation(); sekmeSec(b.getAttribute('data-set')); var t = $('kumeler'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
        });
        $('detBtn').addEventListener('click', function () { dedektifCalistir($('detGiris').value); });
        $('detGiris').addEventListener('keydown', function (e) { if (e.key === 'Enter') dedektifCalistir(this.value); });
        document.querySelectorAll('.ornek-chip').forEach(function (b) { b.addEventListener('click', function () { $('detGiris').value = b.getAttribute('data-v'); dedektifCalistir(b.getAttribute('data-v')); }); });
        $('carpanBtn').addEventListener('click', function () { carpanCalistir($('carpanGiris').value); });
        $('carpanGiris').addEventListener('keydown', function (e) { if (e.key === 'Enter') carpanCalistir(this.value); });
        $('ebobBtn').addEventListener('click', function () { ebobEkokCalistir($('ebobA').value, $('ebobB').value); });
        kapaliTabloKur(); sayiDogrusuKur(); quizKur();
        dedektifCalistir($('detGiris').value);
        carpanCalistir($('carpanGiris').value);
        ebobEkokCalistir($('ebobA').value, $('ebobB').value);
        sekmeSec('np');
    }

    var api = { parseSayi: parseSayi, classify: classify, decimalOf: decimalOf, factorize: factorize, divisorsOf: divisorsOf, divisibilityRows: divisibilityRows, KAPALI: KAPALI, SORULAR: SORULAR, SETLIST: SETLIST };
    if (typeof module === 'object' && module.exports) { module.exports = api; return; }
    root.SayilarRehberi = api;
    root.SayilarRehberi.dedektif = dedektifCalistir;
    root.SayilarRehberi.carpan = carpanCalistir;
    root.SayilarRehberi.ebob = ebobEkokCalistir;
    root.SayilarRehberi.sekmeSec = sekmeSec;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', baslat); else baslat();
}(typeof self !== 'undefined' ? self : this));
