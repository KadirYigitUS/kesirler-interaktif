/*!
 * carpim_tablosu_desen_avi.js — Uzay 7. Sınıf "Çarpım Tablosu Desen Avı" Keşif Laboratuvarı
 *
 * MEB Türkiye Yüzyılı Maarif Modeli (6. Sınıf Ön Öğrenme + 7. Sınıf Çekirdek):
 *  - Çift ızgara: Klasik 1–10 (ℕ⁺) ve İşaretli 4 Bölgeli −10…+10 (ℤ, 21×21 + sıfır şeridi)
 *  - Güvenlik kuralları G3 & G4 (Rasyonel çekirdeği I1–I6, A≠0, [-50,+50] çapraz çarpım sınırı)
 *  - 6 adımlı keşif kilidi: BAK → FARK ET → TAHMİN ET → TEST ET → AÇIKLA → GENELLE
 *  - 10 Desen Avı (9A–9K Gizli Dikdörtgenler & Oran-Orantı dahil), 8 soruluk K1–K3 sınav,
 *    [-50,+50] sayı doğrusu ve "Kendi Desenini Tasarla" analiz motoru.
 */
(function (root, factory) {
    var rasyonel = (root && root.Rasyonel) ||
        (typeof window !== 'undefined' && window.Rasyonel) ||
        (typeof require === 'function' ? require('./rasyonel.js') : null);
    var dersCekirdek = (root && root.DersCekirdek) ||
        (typeof window !== 'undefined' && window.DersCekirdek) ||
        (typeof require === 'function' ? require('./ders_cekirdek.js') : null);

    var api = factory(root, rasyonel, dersCekirdek);
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    if (root && typeof root === 'object') {
        root.DesenAviTool = api;
    }
    if (typeof window !== 'undefined' && window && window !== root) {
        window.DesenAviTool = api;
    }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function (root, Rasyonel, DersCekirdek) {
    'use strict';

    var MINUS = '\u2212';
    var DISCOVERY_STEPS = ['BAK', 'FARK ET', 'TAHMİN ET', 'TEST ET', 'AÇIKLA', 'GENELLE'];
    var RECT_SUBTABS = ['9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H', '9I', '9J', '9K'];

    var HUNTS = [
        { id: 1, num: 1, key: 'ayna', title: '1. Ayna (Değişme Özelliği)', shortTitle: '1. Ayna', concept: 'a × b = b × a ve bölme karşılaştırması', mebRef: '6. Sınıf (1. Kitap) s. 16–17; 7. Sınıf (1. Kitap) s. 94, 106, 201–210' },
        { id: 2, num: 2, key: 'ozel_kosegen', title: '2. Özel Köşegen (Sayının Karesi)', shortTitle: '2. Köşegen', concept: 'n² örüntüsü ve (−3)² ile −3² farkı', mebRef: '6. Sınıf (1. Kitap) s. 38; 7. Sınıf (1. Kitap) s. 75, 98–101' },
        { id: 3, num: 3, key: 'sayi_sicramalari', title: '3. Sayı Sıçramaları (Aritmetik Örüntü)', shortTitle: '3. Sıçramalar', concept: 'Sabit ortak fark ve adım kuralı', mebRef: '6. Sınıf (2. Kitap) s. 77–83; 7. Sınıf (1. Kitap) s. 73; 7. Sınıf (2. Kitap) s. 95–109' },
        { id: 4, num: 4, key: 'katlarin_sekilleri', title: '4. Katların Şekilleri (Bölünebilme)', shortTitle: '4. Katlar', concept: 'Bölünebilme {2,3,4,5,6,9,10} ve 7, 8 desen şeridi', mebRef: '6. Sınıf (1. Kitap) s. 21–37, 49–51' },
        { id: 5, num: 5, key: 'tek_cift', title: '5. Tek ve Çift Sayılar (Parite)', shortTitle: '5. Tek/Çift', concept: 'Parite yasaları ve 0 sıfır özelliği', mebRef: '7. Sınıf (2. Kitap) s. 150–157; 7. Sınıf (1. Kitap) s. 20, 73, 94' },
        { id: 6, num: 6, key: 'dokuzun_sirri', title: '6. 9\'un Sırrı (Rakamlar Toplamı)', shortTitle: '6. 9\'un Sırrı', concept: 'Rakamlar toplamı, 18/27 ve 3–9 farkı', mebRef: '6. Sınıf (1. Kitap) s. 32–33, 37; 7. Sınıf (1. Kitap) s. 74–75' },
        { id: 7, num: 7, key: 'cok_saklanan', title: '7. Çok Saklanan Sayılar (Çarpanlar)', shortTitle: '7. Çarpanlar', concept: 'Çarpan = bölen ve işaretli çiftler', mebRef: '6. Sınıf (1. Kitap) s. 16–20; 7. Sınıf (1. Kitap) s. 75' },
        { id: 8, num: 8, key: 'yalniz_sayilar', title: '8. Yalnız Sayılar (Sıklık ve Asallık)', shortTitle: '8. Yalnız Sayılar', concept: 'Görünme sıklığı F(n) ve asal ayrımı', mebRef: '6. Sınıf (1. Kitap) s. 38–48; 7. Sınıf (2. Kitap) s. 154' },
        { id: 9, num: 9, key: 'gizli_dikdortgenler', title: '9. Gizli Dikdörtgenler (9A–9K)', shortTitle: '9. Dikdörtgenler', concept: 'Oran, orantı, abcd ve eksik köşe x = BC/A', mebRef: '7. Sınıf (2. Kitap) s. 36–73, 110–130, 154–156' },
        { id: 10, num: 10, key: 'desen_dedektifi', title: '10. Desen Dedektifi ve Tasarım', shortTitle: '10. Dedektif', concept: 'Karma doğrulama, sınav ve kendi desenini tasarla', mebRef: '6. Sınıf (2. Kitap) s. 77–86; 7. Sınıf (2. Kitap) s. 150–166' }
    ];

    /* ---------- Temel Matematik Güvenlik Yardımcıları (G3, G4, I1–I6) ---------- */

    function normalizeZero(n) {
        return n === 0 ? 0 : n;
    }

    function isEven(n) {
        if (typeof n !== 'number' || !Number.isInteger(n)) return false;
        return ((n % 2) + 2) % 2 === 0;
    }

    function isOdd(n) {
        if (typeof n !== 'number' || !Number.isInteger(n)) return false;
        return ((n % 2) + 2) % 2 === 1;
    }

    function fmtSigned(n, showPlus) {
        if (n === null || n === undefined || Number.isNaN(n)) return '';
        var v = normalizeZero(Number(n));
        if (v === 0) return '0';
        if (v < 0) return MINUS + String(Math.abs(v));
        return (showPlus ? '+' : '') + String(v);
    }

    function wrapNeg(n) {
        var v = normalizeZero(Number(n));
        var s = fmtSigned(v);
        return v < 0 ? '(' + s + ')' : s;
    }

    function toRasyonel(q) {
        if (q === null || q === undefined) return null;
        if (typeof q === 'object' && 'n' in q && 'd' in q) {
            return Rasyonel.make(q.n, q.d);
        }
        if (typeof q === 'number') {
            if (!Number.isFinite(q)) return null;
            if (q === 0) return Rasyonel.make(0, 1);
            if (Number.isInteger(q)) return Rasyonel.make(q, 1);
            return Rasyonel.parse(String(q));
        }
        if (typeof q === 'string') {
            return Rasyonel.parse(q);
        }
        return null;
    }

    function fmtPercentPrefix(q) {
        var rq = toRasyonel(q);
        if (!rq) return '';
        var scaled = Rasyonel.mul(rq, Rasyonel.make(100, 1));
        var dec = Rasyonel.decimalStr(scaled, 8);
        if (dec.charAt(0) === MINUS) {
            return MINUS + '%' + dec.slice(1);
        }
        return '%' + dec;
    }

    function fmtRationalTR(q, includeDecimal) {
        var rq = toRasyonel(q);
        if (!rq) return '';
        var sq = Rasyonel.simplify(rq);
        var frac = Rasyonel.fmt(sq);
        if (includeDecimal && !Rasyonel.isInt(sq)) {
            return frac + ' (' + Rasyonel.decimalStr(sq) + ')';
        }
        return frac;
    }

    function fmtMath(str) {
        if (DersCekirdek && typeof DersCekirdek.formatMath === 'function') {
            return DersCekirdek.formatMath(str);
        }
        return String(str);
    }

    function bilgiKutusu(baslik, icerik, kaynak) {
        if (DersCekirdek && typeof DersCekirdek.renderBilgiKutusu === 'function') {
            return DersCekirdek.renderBilgiKutusu(baslik, icerik, kaynak);
        }
        return '<div class="bilgi-kutusu"><b>BİLGİ KUTUSU:</b> ' + baslik + '<br>' + icerik + '</div>';
    }

    function dikkatKutusu(baslik, icerik) {
        if (DersCekirdek && typeof DersCekirdek.renderDikkatKutusu === 'function') {
            return DersCekirdek.renderDikkatKutusu(baslik, icerik);
        }
        return '<div class="dikkat-kutusu"><b>DİKKAT !</b> ' + baslik + '<br>' + icerik + '</div>';
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ---------- Çift Izgara Motoru & Keşif İşlevleri ---------- */

    function buildGrid(mode) {
        var m = (mode === 'signed') ? 'signed' : 'classic';
        var rows = [];
        var cols = [];
        var i;
        if (m === 'signed') {
            for (i = -10; i <= 10; i++) {
                rows.push(i);
                cols.push(i);
            }
        } else {
            for (i = 1; i <= 10; i++) {
                rows.push(i);
                cols.push(i);
            }
        }
        var cells = [];
        var matrix = [];
        for (var r = 0; r < rows.length; r++) {
            var rowArr = [];
            for (var c = 0; c < cols.length; c++) {
                var rv = rows[r];
                var cv = cols[c];
                var prod = normalizeZero(rv * cv);
                var isZero = (rv === 0 || cv === 0);
                var qLabel;
                if (isZero) {
                    qLabel = 'sıfır özelliği';
                } else if (rv > 0 && cv > 0) {
                    qLabel = '(+ × + = +)';
                } else if (rv < 0 && cv > 0) {
                    qLabel = '(− × + = −)';
                } else if (rv > 0 && cv < 0) {
                    qLabel = '(+ × − = −)';
                } else {
                    qLabel = '(− × − = +)';
                }
                var cell = {
                    row: rv,
                    col: cv,
                    product: prod,
                    isZeroBand: isZero,
                    quadrant: qLabel
                };
                rowArr.push(cell);
                cells.push(cell);
            }
            matrix.push(rowArr);
        }
        return {
            mode: m,
            rows: rows,
            cols: cols,
            matrix: matrix,
            cells: cells
        };
    }

    function getMirrorPair(i, j, showRule) {
        var r = normalizeZero(Number(i));
        var c = normalizeZero(Number(j));
        var prod = normalizeZero(r * c);
        var same = (r === c);
        var divisionNote;
        if (r === 0 && c === 0) {
            divisionNote = 'Sıfır kendisiyle çarpıldığında 0 olur; ancak 0 ÷ 0 tanımsızdır, bölme yapılamaz.';
        } else if (r === 0 || c === 0) {
            divisionNote = showRule
                ? 'Sıfır çarpma işleminde yutan elemandır (' + wrapNeg(r) + ' × ' + wrapNeg(c) + ' = 0). Bölmede ise 0 bölen olamaz ("0\'a bölünemez"); değişme özelliği bölmede geçerli değildir.'
                : 'Sıfır çarpma işleminde yutan elemandır (' + wrapNeg(r) + ' × ' + wrapNeg(c) + ' = 0). Bölmede ise 0 bölen olamaz ("0\'a bölünemez"); sırayı değiştirmek bölmede geçerli değildir.';
        } else if (same) {
            divisionNote = showRule
                ? 'Bu hücre simetri ekseni üzerindedir (' + wrapNeg(r) + ' × ' + wrapNeg(c) + ' = ' + fmtSigned(prod) + '). Farklı iki sayıda (ör. 12 ÷ 3 = 4 iken 3 ÷ 12 = 1/4) bölme değişmeli değildir.'
                : 'Bu hücre köşegen üzerindedir (' + wrapNeg(r) + ' × ' + wrapNeg(c) + ' = ' + fmtSigned(prod) + '). Farklı iki sayıda (ör. 12 ÷ 3 = 4 iken 3 ÷ 12 = 1/4) sıra değişince bölme sonucu değişir.';
        } else {
            var q1 = Rasyonel.simplify(Rasyonel.make(r, c));
            var q2 = Rasyonel.simplify(Rasyonel.make(c, r));
            if (showRule) {
                divisionNote = 'Çarpmada değişme vardır: ' + wrapNeg(r) + ' × ' + wrapNeg(c) + ' = ' + wrapNeg(c) + ' × ' + wrapNeg(r) + ' = ' + fmtSigned(prod) +
                    '. Bölmede ise değişme yoktur: ' + wrapNeg(r) + ' ÷ ' + wrapNeg(c) + ' = ' + Rasyonel.fmt(q1) +
                    ' iken ' + wrapNeg(c) + ' ÷ ' + wrapNeg(r) + ' = ' + Rasyonel.fmt(q2) + ' olur.';
            } else {
                divisionNote = 'Gözlem: ' + wrapNeg(r) + ' × ' + wrapNeg(c) + ' ve ' + wrapNeg(c) + ' × ' + wrapNeg(r) + ' aynı sonucu (' + fmtSigned(prod) +
                    ') veriyor. Peki bölmede nasıl? ' + wrapNeg(r) + ' ÷ ' + wrapNeg(c) + ' = ' + Rasyonel.fmt(q1) +
                    ' iken ' + wrapNeg(c) + ' ÷ ' + wrapNeg(r) + ' = ' + Rasyonel.fmt(q2) + ' olur (eşit değiller!).';
            }
        }
        return {
            row: c,
            col: r,
            origRow: r,
            origCol: c,
            product: prod,
            sameCell: same,
            divisionNote: divisionNote
        };
    }

    function squareInfo(n) {
        var v = normalizeZero(Number(n));
        var sq = normalizeZero(v * v);
        var negNoParen = normalizeZero(-sq);
        var absN = Math.abs(v);
        var contrast = (v === 0)
            ? '0² = 0 × 0 = 0 (0 işaretsizdir)'
            : '(' + MINUS + absN + ')² = (' + MINUS + absN + ') × (' + MINUS + absN + ') = +' + sq +
              ' iken parantezsiz ' + MINUS + absN + '² = ' + MINUS + '(' + absN + ' × ' + absN + ') = ' + fmtSigned(negNoParen) + ' olur.';
        return {
            n: v,
            absN: absN,
            square: sq,
            parenPositive: sq,
            noParenNegative: negNoParen,
            contrastText: contrast
        };
    }

    function previewSqrt(n) {
        var badge = '(8. Sınıf Ön İzleme — MAT.8.1.2)';
        if (typeof n !== 'number' || !Number.isFinite(n)) {
            return {
                ok: false,
                blocked: true,
                badge: badge,
                message: 'Lütfen karekök ön izlemesi için geçerli bir sayı giriniz.'
            };
        }
        var v = normalizeZero(n);
        if (v < 0) {
            return {
                ok: false,
                blocked: true,
                badge: badge,
                message: 'Negatif sayının karekökü gerçek sayılar kümesinde tanımsızdır; giriş engellendi.'
            };
        }
        var r = Math.round(Math.sqrt(v));
        var isPerf = Number.isInteger(v) && (r * r === v);
        if (isPerf) {
            return {
                ok: true,
                blocked: false,
                isPerfectSquare: true,
                value: r,
                setKey: r === 0 ? 'N' : 'N_PLUS',
                badge: badge,
                message: 'Tam kare sayı ' + badge + ': √' + v + ' = ' + r + '. (7. sınıfta yalnızca sayının karesi n² incelenir.)'
            };
        }
        var vStr = (DersCekirdek && typeof DersCekirdek.fmtTR === 'function')
            ? DersCekirdek.fmtTR(v)
            : String(v).replace(/\./g, ',').replace(/-/g, MINUS);
        var approx = DersCekirdek && DersCekirdek.fmtTR
            ? DersCekirdek.fmtTR(Math.sqrt(v), 3)
            : String(Math.sqrt(v).toFixed(3)).replace('.', ',');
        return {
            ok: true,
            blocked: false,
            isPerfectSquare: false,
            value: null,
            approx: approx,
            setKey: 'Q_PRIME',
            badge: badge,
            message: vStr + ' tam kare değildir; √' + vStr + ' ≈ ' + approx +
                ' sayısı rasyonel sayılar (ℚ) dışına çıkarak irrasyonel sayılar (ℚ′ / ℝ) kümesine geçer ' + badge + '.'
        };
    }

    function getArithmeticRow(i, maxStep) {
        var factor = normalizeZero(Number(i));
        var count = (maxStep === undefined || maxStep === null) ? 10 : Math.max(1, Math.trunc(Number(maxStep)));
        var terms = [];
        var steps = [];
        for (var k = 1; k <= count; k++) {
            var val = normalizeZero(factor * k);
            terms.push(val);
            steps.push({ step: k, value: val });
        }
        return {
            factor: factor,
            terms: terms,
            steps: steps,
            commonDiff: factor,
            ruleText: 'Örüntü kuralı: M(' + fmtSigned(factor) + ', n) = ' + fmtSigned(factor) + ' × n (ardışık terim farkı: ' + fmtSigned(factor, true) + ')'
        };
    }

    function isMultiple(val, d) {
        if (typeof val !== 'number' || typeof d !== 'number') return false;
        if (!Number.isInteger(val) || !Number.isInteger(d) || d === 0) return false;
        var absD = Math.abs(d);
        return ((val % absD) + absD) % absD === 0;
    }

    var DIV_RULES_MEB = {
        2: { rule: 'Birler basamağı çift (0, 2, 4, 6, 8) olan tam sayılar 2 ile kalansız bölünür.', mebRef: '6. Sınıf (1. Kitap), s. 28–31' },
        3: { rule: 'Rakamları toplamı 3 veya 3\'ün katı olan tam sayılar 3 ile kalansız bölünür.', mebRef: '6. Sınıf (1. Kitap), s. 32–33' },
        4: { rule: 'Son iki basamağının oluşturduğu sayı 00 veya 4\'ün katı olan tam sayılar 4 ile kalansız bölünür.', mebRef: '6. Sınıf (1. Kitap), s. 35' },
        5: { rule: 'Birler basamağı 0 veya 5 olan tam sayılar 5 ile kalansız bölünür.', mebRef: '6. Sınıf (1. Kitap), s. 28–31' },
        6: { rule: 'Hem 2 ile hem de 3 ile kalansız bölünebilen tam sayılar 6 ile kalansız bölünür.', mebRef: '6. Sınıf (1. Kitap), s. 34' },
        9: { rule: 'Rakamları toplamı 9 veya 9\'un katı olan tam sayılar 9 ile kalansız bölünür.', mebRef: '6. Sınıf (1. Kitap), s. 32–33' },
        10: { rule: 'Birler basamağı 0 olan tam sayılar 10 ile kalansız bölünür.', mebRef: '6. Sınıf (1. Kitap), s. 28–31' }
    };

    function getDivisibilityRuleInfo(d) {
        var div = Math.trunc(Number(d));
        if (div === 7 || div === 8) {
            return {
                divisor: div,
                hasDigitRule: false,
                title: div + ' ile Bölünebilme (Tablo Deseni)',
                rule: 'MEB 6. ve 7. sınıf müfredatında ' + div + ' için ezberlenen bir basamak bölünebilme kuralı yoktur; bu sayının katları yalnızca tablodaki periyodik kat şeridinden gözlemlenir.',
                mebRef: '6. Sınıf (1. Kitap) s. 21–37 (Kapsam Sınırı)'
            };
        }
        var info = DIV_RULES_MEB[div];
        if (info) {
            return {
                divisor: div,
                hasDigitRule: true,
                title: div + ' ile Kalansız Bölünebilme Kuralı',
                rule: info.rule,
                mebRef: info.mebRef
            };
        }
        return {
            divisor: div,
            hasDigitRule: false,
            title: div + ' Katları',
            rule: 'Tablodaki periyodik kat şeridinden gözlemlenir.',
            mebRef: '6. Sınıf (1. Kitap) s. 21–26'
        };
    }

    function digitSumSteps(n) {
        var v = normalizeZero(Math.trunc(Number(n)));
        var absVal = Math.abs(v);
        var steps = [];
        var sums = [];
        var cur = absVal;
        while (true) {
            var digits = String(cur).split('').map(function (ch) { return parseInt(ch, 10); });
            var sum = 0;
            for (var i = 0; i < digits.length; i++) {
                sum += digits[i];
            }
            steps.push(digits);
            sums.push(sum);
            if (sum < 10) break;
            cur = sum;
        }
        var finalDigit = sums[sums.length - 1];
        var multiStepWarning = sums.length > 1;
        return {
            n: v,
            absVal: absVal,
            steps: steps,
            sums: sums,
            finalDigit: finalDigit,
            divisibleBy9: absVal === 0 || finalDigit === 9,
            divisibleBy3: isMultiple(absVal, 3),
            multiStepWarning: multiStepWarning,
            warningText: multiStepWarning
                ? 'Rakamlar toplamı ilk adımda ' + sums[0] + ' çıktı (9\'un bir katı); basamakları yeniden topladığımızda ' + finalDigit + ' değerine ulaşılır!'
                : ''
        };
    }

    function findFactorPairs(n, mode) {
        var target = normalizeZero(Number(n));
        var grid = buildGrid(mode);
        var pairs = [];
        for (var i = 0; i < grid.cells.length; i++) {
            var c = grid.cells[i];
            if (c.product === target) {
                pairs.push({ row: c.row, col: c.col, product: target });
            }
        }
        return pairs;
    }

    function computeFrequencyMap(mode) {
        var grid = buildGrid(mode);
        var map = {};
        for (var i = 0; i < grid.cells.length; i++) {
            var p = grid.cells[i].product;
            map[p] = (map[p] || 0) + 1;
        }
        return map;
    }

    function getFrequency(n, mode) {
        var target = normalizeZero(Number(n));
        var map = computeFrequencyMap(mode);
        return map[target] || 0;
    }

    function isPrime(n) {
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 2) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        for (var k = 3; k * k <= n; k += 2) {
            if (n % k === 0) return false;
        }
        return true;
    }

    /* ---------- Gizli Dikdörtgenler & Oran-Orantı Motoru (9A–9K, G3) ---------- */

    function buildRectangle(a, c, b, d) {
        var av = normalizeZero(Number(a));
        var cv = normalizeZero(Number(c));
        var bv = normalizeZero(Number(b));
        var dv = normalizeZero(Number(d));
        if (!Number.isInteger(av) || !Number.isInteger(cv) || !Number.isInteger(bv) || !Number.isInteger(dv)) {
            return { valid: false, reason: 'Satır ve sütun değerleri tam sayı olmalıdır.' };
        }
        if (av === cv || bv === dv) {
            return { valid: false, reason: 'İki farklı satır (a ≠ c) ve iki farklı sütun (b ≠ d) seçilmelidir.' };
        }
        var A = normalizeZero(av * bv);
        var B = normalizeZero(av * dv);
        var C = normalizeZero(cv * bv);
        var D = normalizeZero(cv * dv);
        var diag1 = normalizeZero(A * D);
        var diag2 = normalizeZero(B * C);
        var abcd = normalizeZero(av * bv * cv * dv);
        var hasZero = (av === 0 || bv === 0 || cv === 0 || dv === 0);
        var rowRatio = A !== 0 ? Rasyonel.simplify(Rasyonel.make(B, A)) : null;
        var colRatio = A !== 0 ? Rasyonel.simplify(Rasyonel.make(C, A)) : null;

        return {
            valid: true,
            a: av,
            c: cv,
            b: bv,
            d: dv,
            A: A,
            B: B,
            C: C,
            D: D,
            diag1: diag1,
            diag2: diag2,
            crossEqual: diag1 === diag2,
            abcd: abcd,
            hasZero: hasZero,
            rowRatio: rowRatio,
            colRatio: colRatio
        };
    }

    var RECT_PRESET_SPECS = [
        { id: 'p1', label: 'Örnek 1 (Satır 2, 4 · Sütun 3, 5)', mode: 'classic', a: 2, c: 4, b: 3, d: 5 },
        { id: 'p2', label: 'Örnek 2 (Satır 2, 5 · Sütun 3, 7)', mode: 'classic', a: 2, c: 5, b: 3, d: 7 },
        { id: 'p3', label: 'Örnek 3 (Satır 4, 9 · Sütun 3, 8)', mode: 'classic', a: 4, c: 9, b: 3, d: 8 },
        { id: 'p4', label: 'Örnek 4 (Satır 2, 6 · Sütun 4, 7)', mode: 'classic', a: 2, c: 6, b: 4, d: 7 },
        { id: 'p5', label: 'Örnek 5 (Satır 5, 10 · Sütun 3, 5)', mode: 'classic', a: 5, c: 10, b: 3, d: 5 },
        { id: 'p6', label: 'Mod 2 Örnek 6 (Satır −2, 4 · Sütun −3, 5)', mode: 'signed', a: -2, c: 4, b: -3, d: 5 },
        { id: 'p7', label: 'Mod 2 Örnek 7 (Satır −3, 6 · Sütun 2, −5)', mode: 'signed', a: -3, c: 6, b: 2, d: -5 }
    ];

    var RECT_PRESETS = RECT_PRESET_SPECS.map(function (spec) {
        var r = buildRectangle(spec.a, spec.c, spec.b, spec.d);
        return {
            id: spec.id,
            label: spec.label,
            mode: spec.mode,
            a: r.a,
            c: r.c,
            b: r.b,
            d: r.d,
            A: r.A,
            B: r.B,
            C: r.C,
            D: r.D,
            diag1: r.diag1,
            diag2: r.diag2,
            crossEqual: r.crossEqual
        };
    });

    function solveMissingCorner(A, B, C) {
        if (typeof A !== 'number' || typeof B !== 'number' || typeof C !== 'number' ||
            !Number.isInteger(A) || !Number.isInteger(B) || !Number.isInteger(C)) {
            return { ok: false, inBounds: false, reason: 'Köşe değerleri tam sayı olmalıdır', value: null };
        }
        A = normalizeZero(A);
        B = normalizeZero(B);
        C = normalizeZero(C);
        if (A === 0) {
            return { ok: false, inBounds: false, reason: "0'a bölünemez", value: null };
        }
        var bq = Rasyonel.make(B, 1);
        var cq = Rasyonel.make(C, 1);
        var aq = Rasyonel.make(A, 1);
        var xq = Rasyonel.simplify(Rasyonel.div(Rasyonel.mul(bq, cq), aq));
        var minQ = Rasyonel.make(-50, 1);
        var maxQ = Rasyonel.make(50, 1);
        var inBounds = Rasyonel.cmp(xq, minQ) >= 0 && Rasyonel.cmp(xq, maxQ) <= 0;
        return {
            ok: true,
            inBounds: inBounds,
            reason: inBounds ? '' : 'aralık dışı',
            value: xq,
            fmt: Rasyonel.fmt(xq),
            decimal: Rasyonel.decimalStr(xq),
            percentPrefix: fmtPercentPrefix(xq)
        };
    }

    function checkRectangleCandidate(A, B, C, D) {
        var av = normalizeZero(Number(A));
        var bv = normalizeZero(Number(B));
        var cv = normalizeZero(Number(C));
        var dv = normalizeZero(Number(D));
        var lhs = normalizeZero(av * dv);
        var rhs = normalizeZero(bv * cv);
        var valid = (lhs === rhs);
        var reason = valid
            ? 'Karşılıklı köşelerin çarpımı eşittir: ' + wrapNeg(av) + ' × ' + wrapNeg(dv) + ' = ' + wrapNeg(bv) + ' × ' + wrapNeg(cv) + ' = ' + fmtSigned(lhs) + '.'
            : 'Karşılıklı köşelerin çarpımı eşit değil: ' + wrapNeg(av) + ' × ' + wrapNeg(dv) + ' = ' + fmtSigned(lhs) + ' ≠ ' + wrapNeg(bv) + ' × ' + wrapNeg(cv) + ' = ' + fmtSigned(rhs) + '. Bu dörtlü geçerli bir çarpım dikdörtgeni oluşturmaz.';
        return {
            valid: valid,
            lhs: lhs,
            rhs: rhs,
            reason: reason
        };
    }

    /* ---------- Deterministik Üreteçler (Mulberry32) ---------- */

    function seededPRNG(seed) {
        var t = (Number(seed) || 0) >>> 0;
        return function () {
            t += 0x6D2B79F5;
            var r = Math.imul(t ^ (t >>> 15), 1 | t);
            r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
            return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
        };
    }

    function pickFrom(rng, arr) {
        return arr[Math.floor(rng() * arr.length)];
    }

    function getNonZeroAxis(mode) {
        var arr = [];
        if (mode === 'signed') {
            for (var i = -10; i <= 10; i++) {
                if (i !== 0) arr.push(i);
            }
        } else {
            for (var j = 1; j <= 10; j++) arr.push(j);
        }
        return arr;
    }

    function generateRectCoords(seed, mode, requireBounds50) {
        var m = mode === 'signed' ? 'signed' : 'classic';
        var rng = seededPRNG(seed);
        var axis = getNonZeroAxis(m);
        for (var attempt = 0; attempt < 250; attempt++) {
            var a = pickFrom(rng, axis);
            var c = pickFrom(rng, axis);
            var b = pickFrom(rng, axis);
            var d = pickFrom(rng, axis);
            if (a === c || b === d) continue;
            var rect = buildRectangle(a, c, b, d);
            if (!rect.valid || rect.A === 0) continue;
            if (requireBounds50) {
                var sol = solveMissingCorner(rect.A, rect.B, rect.C);
                if (!sol.ok || !sol.inBounds) continue;
            }
            return rect;
        }
        return m === 'signed' ? buildRectangle(-2, 4, -3, 5) : buildRectangle(2, 4, 3, 5);
    }

    function generateMissingCornerPuzzle(seed, mode) {
        var m = mode === 'signed' ? 'signed' : 'classic';
        var rect = generateRectCoords(seed, m, true);
        var sol = solveMissingCorner(rect.A, rect.B, rect.C);
        return {
            seed: Number(seed) || 0,
            mode: m,
            a: rect.a,
            c: rect.c,
            b: rect.b,
            d: rect.d,
            A: rect.A,
            B: rect.B,
            C: rect.C,
            expected: sol.value,
            expectedInt: rect.D,
            solution: sol
        };
    }

    function generateFindRectPuzzle(seed, mode) {
        var m = mode === 'signed' ? 'signed' : 'classic';
        var rect = generateRectCoords(seed, m, false);
        return {
            seed: Number(seed) || 0,
            mode: m,
            a: rect.a,
            c: rect.c,
            b: rect.b,
            d: rect.d,
            A: rect.A,
            B: rect.B,
            C: rect.C,
            D: rect.D,
            targetRow: rect.c,
            targetCol: rect.d,
            expected: rect.D,
            crossProduct: rect.diag1
        };
    }

    function generateCounterExamplePuzzle(seed) {
        var s = Number(seed) || 0;
        var rng = seededPRNG(s);
        var base = generateRectCoords(s + 17, 'classic', true);
        var deltas = [-3, -2, -1, 1, 2, 3];
        var delta = pickFrom(rng, deltas);
        var fakeD = base.D + delta;
        if (fakeD < 1) fakeD = base.D + 2;
        var chk = checkRectangleCandidate(base.A, base.B, base.C, fakeD);
        if (chk.valid) {
            fakeD = base.D + 1;
            chk = checkRectangleCandidate(base.A, base.B, base.C, fakeD);
        }
        return {
            seed: s,
            A: base.A,
            B: base.B,
            C: base.C,
            D: fakeD,
            trueD: base.D,
            lhs: chk.lhs,
            rhs: chk.rhs,
            valid: false,
            isCounterExample: true,
            reason: chk.reason
        };
    }

    function normalizeHuntId(huntId) {
        if (typeof huntId === 'number' && huntId >= 1 && huntId <= 10) return huntId;
        var str = String(huntId || '').toLowerCase();
        for (var i = 0; i < HUNTS.length; i++) {
            if (String(HUNTS[i].id) === str || HUNTS[i].key === str) return HUNTS[i].id;
        }
        return 1;
    }

    function generateHuntChallenge(huntId, seed, mode) {
        var id = normalizeHuntId(huntId);
        var m = mode === 'signed' ? 'signed' : 'classic';
        var s = Number(seed) || 0;
        var rng = seededPRNG(s + id * 97);
        var axis = getNonZeroAxis(m);
        var r, c, step, div, target, rect, sol;

        switch (id) {
            case 1:
                r = pickFrom(rng, axis);
                c = pickFrom(rng, axis);
                if (r === c) c = (r === 10 ? 3 : r + 1);
                return {
                    huntId: 1,
                    huntKey: 'ayna',
                    seed: s,
                    mode: m,
                    targetCell: { row: r, col: c },
                    mirrorCell: { row: c, col: r },
                    expected: normalizeZero(r * c),
                    prompt: wrapNeg(r) + ' × ' + wrapNeg(c) + ' hücresinin ayna eşi olan ' + wrapNeg(c) + ' × ' + wrapNeg(r) + ' hücresindeki çarpım kaçtır?'
                };
            case 2:
                r = m === 'signed' ? pickFrom(rng, [-9, -8, -7, -6, -5, -4, -3, 4, 5, 6, 7, 8, 9]) : pickFrom(rng, [4, 5, 6, 7, 8, 9, 10]);
                return {
                    huntId: 2,
                    huntKey: 'ozel_kosegen',
                    seed: s,
                    mode: m,
                    base: r,
                    expected: r * r,
                    prompt: wrapNeg(r) + '² ifadesinin değeri kaçtır? (Dikkat: parantezli kare daima pozitif veya 0 olur!)'
                };
            case 3:
                r = pickFrom(rng, m === 'signed' ? [-7, -5, -3, -2, 3, 4, 6, 7, 8] : [3, 4, 5, 6, 7, 8, 9]);
                step = 11;
                return {
                    huntId: 3,
                    huntKey: 'sayi_sicramalari',
                    seed: s,
                    mode: m,
                    factor: r,
                    step: step,
                    expected: normalizeZero(r * step),
                    prompt: fmtSigned(r) + ' satırında 10. terim ' + fmtSigned(r * 10) + ' olduğuna göre 11. terim kaçtır?'
                };
            case 4:
                div = pickFrom(rng, [2, 3, 4, 5, 6, 7, 8, 9, 10]);
                c = pickFrom(rng, [2, 3, 4, 5]);
                target = normalizeZero(div * c);
                return {
                    huntId: 4,
                    huntKey: 'katlarin_sekilleri',
                    seed: s,
                    mode: m,
                    divisor: div,
                    expected: target,
                    prompt: div + ' sayısının sıfırdan farklı bir katını yaz (ör. ' + div + ' × ' + c + ').'
                };
            case 5:
                r = pickFrom(rng, axis);
                c = pickFrom(rng, axis);
                var prod = normalizeZero(r * c);
                return {
                    huntId: 5,
                    huntKey: 'tek_cift',
                    seed: s,
                    mode: m,
                    a: r,
                    b: c,
                    expected: isOdd(prod) ? 'TEK' : 'ÇİFT',
                    prompt: wrapNeg(r) + ' × ' + wrapNeg(c) + ' işlemini hesaplamadan sonucun TEK mi ÇİFT mi olduğunu tahmin et.'
                };
            case 6:
                c = pickFrom(rng, [12, 18, 27, 36, 99]);
                target = 9 * c;
                return {
                    huntId: 6,
                    huntKey: 'dokuzun_sirri',
                    seed: s,
                    mode: m,
                    multiplier: c,
                    expected: 9,
                    product: target,
                    prompt: '9 × ' + c + ' = ' + target + ' sayısının basamaklarını tek basamağa inene kadar toplarsan sonuç kaç olur?'
                };
            case 7:
                target = pickFrom(rng, m === 'signed' ? [24, -24, 12, 18, 36] : [12, 18, 24, 36]);
                var count = findFactorPairs(target, m).length;
                return {
                    huntId: 7,
                    huntKey: 'cok_saklanan',
                    seed: s,
                    mode: m,
                    targetValue: target,
                    expected: count,
                    prompt: fmtSigned(target) + ' sayısı aktif tabloda (' + (m === 'signed' ? 'Mod 2: −10…+10' : 'Mod 1: 1–10') + ') toplam kaç hücrede görünür?'
                };
            case 8:
                return {
                    huntId: 8,
                    huntKey: 'yalniz_sayilar',
                    seed: s,
                    mode: m,
                    expected: 2,
                    prompt: 'Hem çift hem de asal olan tek sayıyı yaz (10×10 tabloda kaç kez göründüğünü hatırla!).'
                };
            case 9:
                rect = generateMissingCornerPuzzle(s, m);
                sol = rect.solution;
                return {
                    huntId: 9,
                    huntKey: 'gizli_dikdortgenler',
                    seed: s,
                    mode: m,
                    puzzle: rect,
                    expected: sol.fmt,
                    prompt: '[' + fmtSigned(rect.A) + ', ' + fmtSigned(rect.B) + ' / ' + fmtSigned(rect.C) + ', ?] dikdörtgeninde eksik köşe x kaçtır?'
                };
            case 10:
            default:
                rect = generateMissingCornerPuzzle(s + 5, m);
                return {
                    huntId: 10,
                    huntKey: 'desen_dedektifi',
                    seed: s,
                    mode: m,
                    puzzle: rect,
                    expected: rect.solution.fmt,
                    prompt: 'Desen Dedektifi Görevi: [' + fmtSigned(rect.A) + ', ' + fmtSigned(rect.B) + ' / ' + fmtSigned(rect.C) + ', ?] orantı dikdörtgeninde eksik köşeyi bul!'
                };
        }
    }

    /* ---------- Kendi Desenini Tasarla: Otomatik Kural Analizcisi ---------- */

    function analyzeCustomPattern(cells, mode) {
        var m = mode === 'signed' ? 'signed' : 'classic';
        var seen = {};
        var unique = [];
        var arr = Array.isArray(cells) ? cells : [];
        for (var i = 0; i < arr.length; i++) {
            var c = arr[i];
            if (!c || typeof c.row !== 'number' || typeof c.col !== 'number') continue;
            var rv = normalizeZero(Math.trunc(c.row));
            var cv = normalizeZero(Math.trunc(c.col));
            var key = rv + ':' + cv;
            if (!seen[key]) {
                seen[key] = true;
                unique.push({ row: rv, col: cv, product: normalizeZero(rv * cv) });
            }
        }
        unique.sort(function (a, b) {
            return a.row !== b.row ? a.row - b.row : a.col - b.col;
        });

        var products = unique.map(function (u) { return u.product; });
        var hasMirrorSymmetry = unique.length > 0 && unique.every(function (u) {
            return !!seen[u.col + ':' + u.row];
        });
        var allDiagonalSquares = unique.length >= 2 && unique.every(function (u) {
            return u.row === u.col;
        });

        // Aritmetik satır veya sütun sıçraması kontrolü
        var arithmeticSequence = { found: false };
        if (unique.length >= 3) {
            var sameRow = unique.every(function (u) { return u.row === unique[0].row; });
            var sameCol = unique.every(function (u) { return u.col === unique[0].col; });
            if (sameRow) {
                var sortedCols = unique.slice().sort(function (a, b) { return a.col - b.col; });
                var colStep = sortedCols[1].col - sortedCols[0].col;
                var constColStep = colStep > 0 && sortedCols.every(function (u, idx) {
                    return idx === 0 || (u.col - sortedCols[idx - 1].col) === colStep;
                });
                if (constColStep) {
                    var diffR = normalizeZero(sortedCols[1].product - sortedCols[0].product);
                    arithmeticSequence = {
                        found: true,
                        axis: 'row',
                        fixedVal: sortedCols[0].row,
                        commonDiff: diffR,
                        terms: sortedCols.map(function (u) { return u.product; })
                    };
                }
            } else if (sameCol) {
                var sortedRows = unique.slice().sort(function (a, b) { return a.row - b.row; });
                var rowStep = sortedRows[1].row - sortedRows[0].row;
                var constRowStep = rowStep > 0 && sortedRows.every(function (u, idx) {
                    return idx === 0 || (u.row - sortedRows[idx - 1].row) === rowStep;
                });
                if (constRowStep) {
                    var diffC = normalizeZero(sortedRows[1].product - sortedRows[0].product);
                    arithmeticSequence = {
                        found: true,
                        axis: 'col',
                        fixedVal: sortedRows[0].col,
                        commonDiff: diffC,
                        terms: sortedRows.map(function (u) { return u.product; })
                    };
                }
            }
        }

        // Ortak bölenler (2..10)
        var commonDivisors = [];
        if (unique.length >= 2) {
            for (var d = 2; d <= 10; d++) {
                var allDiv = true;
                for (var pIdx = 0; pIdx < products.length; pIdx++) {
                    if (!isMultiple(products[pIdx], d)) { allDiv = false; break; }
                }
                if (allDiv) commonDivisors.push(d);
            }
        }

        // Salt tek / salt çift
        var parityPattern = 'mixed';
        if (unique.length >= 2) {
            var allOdd = products.every(isOdd);
            var allEven = products.every(isEven);
            if (allOdd) parityPattern = 'pure_odd';
            else if (allEven) parityPattern = 'pure_even';
        }

        // Geçerli 2x2 dikdörtgen
        var isRectangle = false;
        var rectangle = null;
        if (unique.length === 4) {
            var rowSet = [];
            var colSet = [];
            unique.forEach(function (u) {
                if (rowSet.indexOf(u.row) === -1) rowSet.push(u.row);
                if (colSet.indexOf(u.col) === -1) colSet.push(u.col);
            });
            if (rowSet.length === 2 && colSet.length === 2) {
                rowSet.sort(function (x, y) { return x - y; });
                colSet.sort(function (x, y) { return x - y; });
                var r1 = rowSet[0], r2 = rowSet[1], c1 = colSet[0], c2 = colSet[1];
                if (seen[r1 + ':' + c1] && seen[r1 + ':' + c2] && seen[r2 + ':' + c1] && seen[r2 + ':' + c2]) {
                    isRectangle = true;
                    rectangle = buildRectangle(r1, r2, c1, c2);
                }
            }
        }

        // Deterministik FNV-1a paylaşılabilir desen kodu
        var canonical = m + '|' + unique.map(function (u) { return u.row + ',' + u.col; }).join(';');
        var hash = 2166136261;
        for (var h = 0; h < canonical.length; h++) {
            hash ^= canonical.charCodeAt(h);
            hash = Math.imul(hash, 16777619) >>> 0;
        }
        var shareCode = 'DA-' + (m === 'signed' ? 'D' : 'K') + '-' + unique.length + '-' + hash.toString(16).toUpperCase();

        var features = [];
        if (allDiagonalSquares) features.push('Köşegen kare sayılar dizilimi (n²)');
        if (hasMirrorSymmetry) features.push('Ana köşegene göre ayna simetrisi (a × b = b × a)');
        if (arithmeticSequence.found) {
            features.push('Sabit adımlı aritmetik sıçrama (ortak fark: ' + fmtSigned(arithmeticSequence.commonDiff, true) + ')');
        }
        if (commonDivisors.length > 0) {
            features.push('Ortak bölünebilme: tüm seçili çarpımlar {' + commonDivisors.join(', ') + '} ile tam bölünür');
        }
        if (parityPattern === 'pure_odd') features.push('Salt TEK sayılar kümesi');
        if (parityPattern === 'pure_even') features.push('Salt ÇİFT sayılar kümesi');
        if (isRectangle && rectangle) {
            features.push('Geçerli 2×2 Gizli Dikdörtgen: [' + fmtSigned(rectangle.A) + ', ' + fmtSigned(rectangle.B) + ' / ' + fmtSigned(rectangle.C) + ', ' + fmtSigned(rectangle.D) + '] (' + fmtSigned(rectangle.diag1) + ' = ' + fmtSigned(rectangle.diag2) + ')');
        }

        var report;
        if (unique.length === 0) {
            report = 'Henüz hücre seçilmedi. En az 2 hücre seçerek kendi örüntü kuralını sınayabilirsin.';
        } else if (unique.length === 1) {
            report = '1 hücre seçildi (' + wrapNeg(unique[0].row) + ' × ' + wrapNeg(unique[0].col) + ' = ' + fmtSigned(unique[0].product) + '). Bir desen yakalamak için en az 2 hücre seç!';
        } else if (features.length === 0) {
            report = unique.length + ' hücre seçildi; ancak klasik simetri, ortak bölen, aritmetik sıçrama veya 2×2 dikdörtgen özelliği bulunamadı. Farklı bir kural kurmayı veya karşıt örnek oluşturmayı dene!';
        } else {
            report = 'Bir desen yakaladın! (' + unique.length + ' hücre) Bulunan özellikler: ' + features.join(' · ') + '.';
        }

        return {
            mode: m,
            cellCount: unique.length,
            cells: unique,
            products: products,
            hasMirrorSymmetry: hasMirrorSymmetry,
            allDiagonalSquares: allDiagonalSquares,
            arithmeticSequence: arithmeticSequence,
            commonDivisors: commonDivisors,
            parityPattern: parityPattern,
            isRectangle: isRectangle,
            rectangle: rectangle,
            features: features,
            shareCode: shareCode,
            report: report
        };
    }

    /* ---------- 8 Soruluk 3 Kademeli Sınav Bankası (K1, K2, K3) ---------- */

    var DESEN_QUIZ_QUESTIONS = [
        {
            id: 'da1',
            level: 1,
            targetSet: 'N_PLUS',
            question: 'Çarpım tablosunda $3 \\times 7 = 21$ ve $7 \\times 3 = 21$ hücreleri köşegen aynasına göre simetriktir. Buna karşın $12 \\div 3$ ile $3 \\div 12$ işlemleri için aşağıdakilerden hangisi <b>doğrudur</b>?',
            options: [
                'A) Bölme işleminde de değişme özelliği vardır; sonuçları eşittir.',
                'B) $12 \\div 3 = 4$ iken $3 \\div 12 = \\frac{1}{4}$ olduğundan bölmede değişme özelliği <b>yoktur</b>.',
                'C) Yalnızca tek sayılarla bölmede değişme özelliği vardır.',
                'D) Çarpma işleminde çarpanların yeri değiştirilirse çarpım değişir.'
            ],
            correct: 1,
            explanation: 'Çarpma işleminde değişme özelliği vardır: $a \\times b = b \\times a$. Ancak bölmede $12 \\div 3 = 4$ iken $3 \\div 12 = \\frac{1}{4}$ ($4 \\neq \\frac{1}{4}$) olduğu için bölme işleminde değişme özelliği yoktur.'
        },
        {
            id: 'da2',
            level: 1,
            targetSet: 'Z',
            question: 'Özel köşegen örüntüsünde $(' + MINUS + '3)^{2}$ ve $' + MINUS + '3^{2}$ ifadeleri arasındaki ilişki için aşağıdakilerden hangisi <b>doğrudur</b>?',
            options: [
                'A) Her ikisi de $' + MINUS + '9$ değerine eşittir.',
                'B) Her ikisi de $+9$ değerine eşittir.',
                'C) $(' + MINUS + '3)^{2} = (' + MINUS + '3) \\times (' + MINUS + '3) = +9$ iken parantezsiz $' + MINUS + '3^{2} = ' + MINUS + '(3 \\times 3) = ' + MINUS + '9$ olur.',
                'D) $(' + MINUS + '3)^{2} = ' + MINUS + '6$ ve $' + MINUS + '3^{2} = +6$ olur.'
            ],
            correct: 2,
            explanation: 'Parantez çok önemlidir! $(' + MINUS + '3)^{2}$ ifadesinde üs tüm paranteze uygulanır: $(' + MINUS + '3) \\times (' + MINUS + '3) = +9$. Parantezsiz $' + MINUS + '3^{2}$ ifadesinde ise önce kare alınır, sonra eksi işareti eklenir: $' + MINUS + '(3 \\times 3) = ' + MINUS + '9$.'
        },
        {
            id: 'da3',
            level: 2,
            targetSet: 'Z',
            question: 'İşaretli çarpım tablosunda $' + MINUS + '7$ ve $0$ sayılarının tek/çift durumu (paritesi) hakkında hangi yargı <b>doğrudur</b>?',
            options: [
                'A) $' + MINUS + '7$ tek tam sayıdır; $0 = 2 \\times 0$ olduğundan $0$ çift tam sayıdır ama işaretsizdir.',
                'B) Negatif sayılar tek ya da çift olamaz.',
                'C) $0$ sayısı ne tektir ne çifttir.',
                'D) İki tek tam sayının çarpımı daima çift olur.'
            ],
            correct: 0,
            explanation: 'Parite tam sayılarda da geçerlidir: $' + MINUS + '7 = 2 \\times (' + MINUS + '4) + 1$ olduğu için tektir ve $(' + MINUS + '7) \\times (' + MINUS + '3) = +21$ (tek $\\times$ tek $=$ tek). $0 = 2 \\times 0$ biçiminde yazıldığı için $0$ çift tam sayıdır; ancak işaret yönünden ne pozitif ne negatiftir ve çarpmada yutan elemandır.'
        },
        {
            id: 'da4',
            level: 2,
            targetSet: 'N_PLUS',
            question: 'Bir öğrenci $9 \\times 99 = 891$ sayısının rakamlarını topluyor: $8 + 9 + 1 = 18$. Bu sonuç hakkında ne söylenebilir?',
            options: [
                'A) Rakamlar toplamı $9$ çıkmadığı için $891$, $9$\'a bölünmez.',
                'B) $18$ sayısı $9$\'un katıdır ($1 + 8 = 9$); bu yüzden $891$ sayısı $9$\'a kalansız bölünür. Ancak $12$ gibi $3$\'e bölünen her sayı $9$\'a bölünmez.',
                'C) $3$\'e bölünen her sayı mutlaka $9$\'a da bölünür.',
                'D) Çarpım $9$\'un katıysa rakamlar toplamı her zaman tek adımda $9$ çıkar.'
            ],
            correct: 1,
            explanation: 'Rakamlar toplamı büyük sayılarda $18, 27, 36$ gibi $9$\'un başka bir katı çıkabilir; basamakları yeniden toplayınca $1 + 8 = 9$ elde edilir. Ayrıca $9$\'a bölünen her sayı $3$\'e bölünür ama tersi doğru değildir (karşıt örnek: $12, 15, 21$).'
        },
        {
            id: 'da5',
            level: 2,
            targetSet: 'N_PLUS',
            question: '$10 \\times 10$ çarpım tablosunda $1$ ve $25$ sayıları yalnızca birer kez görünürken, $2$ sayısı iki kez ($1 \\times 2$ ve $2 \\times 1$) görünür. Buna göre asal sayılar hakkında hangisi <b>doğrudur</b>?',
            options: [
                'A) Tabloda $1$ kez görünen her sayı asal sayıdır.',
                'B) $1$ en küçük asal sayıdır.',
                'C) $1$ ve $25 = 5 \\times 5$ asal değildir; $2$ ise en küçük ve tek çift asal sayıdır.',
                'D) Çift sayılardan hiçbiri asal değildir.'
            ],
            correct: 2,
            explanation: 'Tabloda $1$ kez görünmek asal olmak demek değildir! $1$ sayısının yalnızca $1$ pozitif böleni olduğu için asal değildir; $25 = 5^{2}$, $49 = 7^{2}$ ve $100 = 10^{2}$ da bileşik kare sayılardır. $2, 3, 5, 7$ asaldır ve $2$ tek çift asal sayıdır.'
        },
        {
            id: 'da6',
            level: 3,
            targetSet: 'Q',
            question: 'Bir orantı dikdörtgeninde köşeler $[6, 5 / 4, x]$ biçimindedir (yani $6 \\times x = 5 \\times 4$). Eksik köşe $x$ değeri ve $A = 0$ durumu için hangisi <b>doğrudur</b>?',
            options: [
                'A) $x = \\frac{20}{6} = \\frac{10}{3} = 3,(3)$ olur; bölen $A = 0$ olsaydı $0$\'a bölme tanımsız olurdu.',
                'B) Toplamsal farkla $6 ' + MINUS + ' 1 = 5$ olduğundan $x = 4 ' + MINUS + ' 1 = 3$ olur.',
                'C) Yan yana çarparak $6 \\times 5 = 30$ ve $x = 30 \\div 4 = 7,5$ bulunur.',
                'D) $x = \\frac{6}{20} = 0,3$ olur.'
            ],
            correct: 0,
            explanation: 'Karşılıklı köşe çarpımı eşittir: $6x = 5 \\times 4 = 20 \\Rightarrow x = \\frac{20}{6} = \\frac{10}{3} = 3,(3) \\in \\mathbb{Q}$. Toplamsal fark ($4 ' + MINUS + ' 1 = 3$) ve yan yana çarpma ($6 \\times 5$) yaygın hatalardır; ayrıca paydadaki $A$ sıfır olursa bölme tanımsızdır.'
        },
        {
            id: 'da7',
            level: 3,
            targetSet: 'N_PLUS',
            question: 'Bir öğrenci $[4, 9 / 6, 13]$ dörtlüsünün bir çarpım tablosu dikdörtgeni oluşturduğunu iddia ediyor. Bu iddiayı çürütmek için hangi <b>karşıt örnek</b> kanıtı kullanılır?',
            options: [
                'A) $4 + 13 = 17$ ve $9 + 6 = 15$ olduğu için geçersizdir.',
                'B) Karşılıklı köşelerin çarpımı $4 \\times 13 = 52$ iken $9 \\times 6 = 54$ çıkar; $52 \\neq 54$ olduğundan geçerli bir dikdörtgen değildir.',
                'C) Sayıların ikisi tek ikisi çift olduğu için geçersizdir.',
                'D) $4 \\times 9 = 36$ iken $6 \\times 13 = 78$ olduğu için doğrudur.'
            ],
            correct: 1,
            explanation: 'Geçerli her dikdörtgende karşılıklı köşe çarpımları eşittir: $(ab)(cd) = (ad)(cb)$. Burada $4 \\times 13 = 52 \\neq 9 \\times 6 = 54$ olduğundan iddiayı çürüten bir karşıt örnektir.'
        },
        {
            id: 'da8',
            level: 3,
            targetSet: 'Q',
            question: '$[6, 14 / 15, 35]$ gizli dikdörtgeninde üst satırdan alt satıra geçişteki ölçek çarpanı ve bunun yüzde gösterimi aşağıdakilerden hangisidir?',
            options: [
                'A) $\\times 2,5$ yani %25',
                'B) $\\times \\frac{5}{2} = \\times 2,5$ yani %250',
                'C) $+9$ toplamsal artış yani %9',
                'D) $\\times \\frac{2}{5} = \\times 0,4$ yani %40'
            ],
            correct: 1,
            explanation: 'Ölçek çarpanı oran kurularak bulunur: $\\frac{15}{6} = \\frac{35}{14} = \\frac{5}{2} = 2,5$. Yüzde olarak $2,5 \\times 100 =$ %250 yazılır (ön ek % işareti sayının önüne gelir). Negatif ölçek çarpanı (ör. $\\times (' + MINUS + '2)$) ise sayı doğrusunda yönü tersine çevirir.'
        }
    ];

    /* ---------- Formül Başvurusu (DersCekirdek.formatMath uyumlu) ---------- */

    var FORMULA_REF_ITEMS = [
        {
            title: 'Çarpım Tablosu Tanımı',
            formula: '$M(i, j) = i \\times j$',
            note: 'Mod 1\'de $1 \\leq i, j \\leq 10$ ($\\mathbb{N}^+$), Mod 2\'de $' + MINUS + '10 \\leq i, j \\leq +10$ ($\\mathbb{Z}$).'
        },
        {
            title: 'Ayna Simetrisi (Değişme Özelliği)',
            formula: '$M(i, j) = M(j, i) \\Rightarrow a \\times b = b \\times a$',
            note: 'Bölmede geçerli değildir: $12 \\div 3 = 4 \\neq 3 \\div 12 = \\frac{1}{4}$.'
        },
        {
            title: 'Sıfır Özelliği (Yutan Eleman)',
            formula: '$0 \\times n = n \\times 0 = 0$',
            note: '$0$ işaretsizdir; ancak $0 = 2 \\times 0$ biçiminde yazılabildiği için çift tam sayıdır.'
        },
        {
            title: 'Sayının Karesi ve Parantez Kuralı',
            formula: '$M(i, i) = i^{2}$, $(' + MINUS + 'i)^{2} = i^{2} \\geq 0$, fakat $' + MINUS + 'i^{2} = ' + MINUS + '(i^{2})$',
            note: 'Tam kare ve $\\sqrt{n}$ ters geçişi (8. Sınıf Ön İzleme) kapsamındadır; negatif sayının karekökü engellenir.'
        },
        {
            title: 'Sabit Satır Farkı (Aritmetik Örüntü)',
            formula: '$M(i, n+1) ' + MINUS + ' M(i, n) = i$',
            note: 'Her satır ve sütun sabit ortak farkla ilerleyen bir aritmetik örüntüdür.'
        },
        {
            title: 'Parite Yasaları (Tek ve Çift)',
            formula: '$\\text{tek} \\times \\text{tek} = \\text{tek}$, $\\text{tek}^{2} = \\text{tek}$, $\\text{çift} \\times \\text{tam sayı} = \\text{çift}$',
            note: 'Mod 1\'de %25 tek ($25$ hücre), %75 çift ($75$ hücre) dağılımı oluşur.'
        },
        {
            title: 'Çarpan Çifti Konumları',
            formula: '$n = i \\times j$',
            note: 'Çarpan eşittir bölen; Mod 2\'de negatif çarpanlar nedeniyle görünüm sayısı iki katına çıkar.'
        },
        {
            title: 'Gizli Dikdörtgen Yapısı ve abcd Çarpımı',
            formula: '$(ab)(cd) = (ad)(cb) = abcd$',
            note: '$[ab, ad / cb, cd]$ dörtlüsünde $a \\neq c$ ve $b \\neq d$ iken karşılıklı köşe çarpımları eşittir.'
        },
        {
            title: 'Orantı ve İçler-Dışlar Çarpımı',
            formula: '$\\frac{a}{b} = \\frac{c}{d} \\Leftrightarrow a \\times d = b \\times c$',
            note: '$b \\neq 0$ ve $d \\neq 0$ iken geçerlidir.'
        },
        {
            title: 'Eksik Orantı / Köşe Değeri (G3)',
            formula: '$\\frac{A}{B} = \\frac{C}{x} \\Rightarrow x = \\frac{B \\times C}{A}$',
            note: '$A \\neq 0$ olmalıdır ($A = 0$ ise 0\'a bölünemez); sonuç $[' + MINUS + '50, +50]$ aralığında denetlenir.'
        }
    ];

    /* ---------- Etkileşimli Laboratuvar Durumu ve DOM Denetleyicisi ---------- */

    var state = {
        initialized: false,
        mode: 'classic',
        huntId: 1,
        stepIdx: 1, // 0: BAK, 1: FARK ET, 2: TAHMİN ET, 3: TEST ET, 4: AÇIKLA, 5: GENELLE
        discoveredHunts: {},
        soundEnabled: true,
        zeroBandHighlight: true,
        selectedCell: { row: 3, col: 7 },
        mirrorsTested: {},
        hintLevel: 0,
        // Av 2
        squareN: 4,
        sqrtPreviewInput: 16,
        // Av 3
        jumpRow: 7,
        // Av 4
        divisor: 4,
        // Av 5
        parityPair: { a: 3, b: 5 },
        // Av 6
        digitSumTarget: 891,
        hunt6Tested: false,
        // Av 7
        factorTarget: 24,
        // Av 8
        freqFilter: 1,
        // Av 9
        rectSubtab: '9A',
        rectCoords: { a: 2, c: 4, b: 3, d: 5 },
        rectSelectionQueue: [],
        rectTestedKeys: {},
        rect9BTestedKeys: {},
        rect9CTestedKeys: {},
        rect9EAttempted: false,
        rect9FTestedKeys: {},
        rect9HTestedKeys: {},
        rect9KTestedKeys: {},
        rect9EMode: 'preset',
        rect9EValues: { A: 6, B: 10, C: 12 },
        rect9ESeed: 101,
        rect9GScaleIdx: 0,
        rect9ISeed: 202,
        rect9IFound: false,
        rect9JIndex: 0,
        rect9JSeed: 303,
        rect9JCurrent: { A: 4, B: 9, C: 6, D: 13, valid: false },
        // Av 10
        challengeSeed: 404,
        // Sayı doğrusu
        numberLineZoomFull: false,
        numberLineValues: [{ label: '20', q: { n: 20, d: 1 } }],
        numberLineWarning: '',
        // Kendi desenini tasarla
        customCells: [],
        customAnalysis: null
    };

    var audioCtx = null;
    function playChime(type) {
        if (!state.soundEnabled) return;
        try {
            var AC = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext));
            if (!AC) return;
            if (!audioCtx) audioCtx = new AC();
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            var now = audioCtx.currentTime;
            if (type === 'ok') {
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.08);
            } else if (type === 'err') {
                osc.frequency.setValueAtTime(220, now);
            } else {
                osc.frequency.setValueAtTime(440, now);
            }
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.19);
        } catch (e) {
            // Ses bağlamı desteklenmiyorsa sessizce geç
        }
    }

    function $(id) {
        return typeof document !== 'undefined' ? document.getElementById(id) : null;
    }

    function isHuntUnlocked(huntId) {
        if (huntId === 9) {
            return !!state.discoveredHunts[9] && isHunt9RuleUnlocked();
        }
        return !!state.discoveredHunts[huntId];
    }

    function getTestedRectangleCount() {
        var combined = {};
        var k;
        for (k in state.rect9BTestedKeys) {
            if (Object.prototype.hasOwnProperty.call(state.rect9BTestedKeys, k)) combined[k] = true;
        }
        for (k in state.rectTestedKeys) {
            if (Object.prototype.hasOwnProperty.call(state.rectTestedKeys, k)) combined[k] = true;
        }
        return Object.keys(combined).length;
    }

    function isHunt9RuleUnlocked() {
        return Object.keys(state.rect9BTestedKeys).length >= 2 || getTestedRectangleCount() >= 2;
    }

    function countDiscovered() {
        var c = 0;
        for (var i = 1; i <= 10; i++) {
            if (state.discoveredHunts[i]) c++;
        }
        return c;
    }

    function renderProgressAndTabs() {
        var prog = $('av-ilerleme-cubugu');
        if (prog) {
            var done = countDiscovered();
            if (prog.tagName && prog.tagName.toUpperCase() === 'SPAN') {
                prog.textContent = 'Desen Avı ' + state.huntId + ' / 10 · Keşfedilen: ' + done + ' / 10';
            } else {
                var pct = state.huntId * 10;
                prog.innerHTML =
                    '<div class="progress-text">Desen Avı ' + state.huntId + ' / 10 · Keşfedilen: ' + done + ' / 10</div>' +
                    '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%;"></div></div>';
            }
        }

        var tabList = $('av-sekme-listesi');
        if (tabList) {
            var existing = tabList.querySelectorAll ? tabList.querySelectorAll('[data-hunt]') : [];
            if (existing && existing.length >= 10) {
                for (var i = 0; i < existing.length; i++) {
                    var btn = existing[i];
                    var hid = Number(btn.getAttribute('data-hunt'));
                    btn.classList.toggle('hunt-tab-active', hid === state.huntId);
                    btn.setAttribute('aria-selected', hid === state.huntId ? 'true' : 'false');
                    if (state.discoveredHunts[hid] && btn.textContent.indexOf('✓') === -1) {
                        btn.textContent = btn.textContent + ' ✓';
                    }
                    if (!btn._desenBound) {
                        btn._desenBound = true;
                        btn.addEventListener('click', (function (id) {
                            return function () { setHunt(id); };
                        }(hid)));
                    }
                }
            } else {
                var html = '';
                for (var j = 0; j < HUNTS.length; j++) {
                    var h = HUNTS[j];
                    var activeCls = h.id === state.huntId ? ' hunt-tab-active' : '';
                    var checkMark = state.discoveredHunts[h.id] ? ' ✓' : '';
                    html += '<button type="button" class="hunt-tab' + activeCls + '" data-hunt="' + h.id + '" aria-selected="' +
                        (h.id === state.huntId ? 'true' : 'false') + '">' + escapeHtml(h.shortTitle + checkMark) + '</button>';
                }
                tabList.innerHTML = html;
                var newBtns = tabList.querySelectorAll ? tabList.querySelectorAll('[data-hunt]') : [];
                for (var k = 0; k < newBtns.length; k++) {
                    var b = newBtns[k];
                    var idVal = Number(b.getAttribute('data-hunt'));
                    b.addEventListener('click', (function (id) {
                        return function () { setHunt(id); };
                    }(idVal)));
                }
            }
        }

        var btnK = $('btn-mod-klasik');
        var btnD = $('btn-mod-dort-bolge');
        if (btnK) {
            btnK.classList.toggle('active', state.mode === 'classic');
            btnK.classList.toggle('mode-btn-active', state.mode === 'classic');
            btnK.setAttribute('aria-pressed', state.mode === 'classic' ? 'true' : 'false');
        }
        if (btnD) {
            btnD.classList.toggle('active', state.mode === 'signed');
            btnD.classList.toggle('mode-btn-active', state.mode === 'signed');
            btnD.setAttribute('aria-pressed', state.mode === 'signed' ? 'true' : 'false');
        }
        var btnZero = $('btn-sifir-seridi');
        if (btnZero) {
            var zOn = (state.mode === 'signed' && state.zeroBandHighlight);
            btnZero.classList.toggle('active', zOn);
            btnZero.classList.toggle('mode-btn-active', zOn);
            btnZero.setAttribute('aria-pressed', zOn ? 'true' : 'false');
        }
        var btnAudio = $('ses-anahtari');
        if (btnAudio) {
            btnAudio.setAttribute('aria-pressed', state.soundEnabled ? 'true' : 'false');
            btnAudio.textContent = state.soundEnabled ? '🔊 Ses: Açık' : '🔇 Ses: Kapalı';
        }
    }

    function renderDiscoveryStepper() {
        var el = $('dongu-adim-gosterge');
        if (!el) return;
        var h = '';
        for (var i = 0; i < DISCOVERY_STEPS.length; i++) {
            var cls = 'dongu-step';
            if (i < state.stepIdx) cls += ' dongu-step-done';
            else if (i === state.stepIdx) cls += ' dongu-step-active';
            h += '<span class="' + cls + '">' + DISCOVERY_STEPS[i] + '</span>';
        }
        el.innerHTML = h;
    }

    function setFeedback(type, htmlMsg) {
        var el = $('geri-bildirim-alani');
        if (!el) return;
        var cls = 'feedback-box ';
        if (type === 'ok') cls += 'feedback-ok';
        else if (type === 'err') cls += 'feedback-err';
        else cls += 'feedback-warn';
        el.className = cls;
        el.innerHTML = htmlMsg;
    }

    /* ---------- SVG Katmanı & Görsel Yardımcılar ---------- */

    function getCellNormPos(rowVal, colVal, grid) {
        var rIdx = grid.rows.indexOf(rowVal);
        var cIdx = grid.cols.indexOf(colVal);
        if (rIdx === -1 || cIdx === -1) return null;
        var totalRows = grid.rows.length + 1;
        var totalCols = grid.cols.length + 1;
        return {
            x: ((cIdx + 1.5) / totalCols) * 1000,
            y: ((rIdx + 1.5) / totalRows) * 1000
        };
    }

    function renderSvgOverlay(grid) {
        var svg = $('desen-svg-katman');
        if (!svg) return;
        if (svg.setAttribute) {
            svg.setAttribute('viewBox', '0 0 1000 1000');
            svg.setAttribute('preserveAspectRatio', 'none');
        }
        var content = '';
        var hid = state.huntId;

        if (hid === 1) {
            var pFirst = getCellNormPos(grid.rows[0], grid.cols[0], grid);
            var pLast = getCellNormPos(grid.rows[grid.rows.length - 1], grid.cols[grid.cols.length - 1], grid);
            if (pFirst && pLast) {
                content += '<line x1="' + pFirst.x.toFixed(1) + '" y1="' + pFirst.y.toFixed(1) +
                    '" x2="' + pLast.x.toFixed(1) + '" y2="' + pLast.y.toFixed(1) +
                    '" stroke="#8e44ad" stroke-width="4" stroke-dasharray="10 6" opacity="0.85"></line>';
            }
            if (state.selectedCell) {
                var p1 = getCellNormPos(state.selectedCell.row, state.selectedCell.col, grid);
                var p2 = getCellNormPos(state.selectedCell.col, state.selectedCell.row, grid);
                if (p1 && p2 && (state.selectedCell.row !== state.selectedCell.col)) {
                    var mx = (p1.x + p2.x) / 2;
                    var my = (p1.y + p2.y) / 2 - 40;
                    content += '<path d="M ' + p1.x.toFixed(1) + ' ' + p1.y.toFixed(1) +
                        ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1) +
                        '" fill="none" stroke="#e67e22" stroke-width="4"></path>';
                    content += '<circle cx="' + p1.x.toFixed(1) + '" cy="' + p1.y.toFixed(1) + '" r="8" fill="#e67e22"></circle>';
                    content += '<circle cx="' + p2.x.toFixed(1) + '" cy="' + p2.y.toFixed(1) + '" r="8" fill="#16a085"></circle>';
                }
            }
        } else if (hid === 3) {
            var rVal = state.jumpRow;
            if (grid.rows.indexOf(rVal) === -1) rVal = grid.rows[0];
            for (var cIdx = 0; cIdx < grid.cols.length - 1; cIdx++) {
                var curP = getCellNormPos(rVal, grid.cols[cIdx], grid);
                var nxtP = getCellNormPos(rVal, grid.cols[cIdx + 1], grid);
                if (curP && nxtP) {
                    var midX = (curP.x + nxtP.x) / 2;
                    var midY = curP.y - 26;
                    content += '<path d="M ' + curP.x.toFixed(1) + ' ' + curP.y.toFixed(1) +
                        ' Q ' + midX.toFixed(1) + ' ' + midY.toFixed(1) + ' ' + nxtP.x.toFixed(1) + ' ' + nxtP.y.toFixed(1) +
                        '" fill="none" stroke="#2980b9" stroke-width="2.8" opacity="0.85"></path>';
                }
            }
        } else if (hid === 9) {
            var rc = state.rectCoords;
            var pA = getCellNormPos(rc.a, rc.b, grid);
            var pB = getCellNormPos(rc.a, rc.d, grid);
            var pC = getCellNormPos(rc.c, rc.b, grid);
            var pD = getCellNormPos(rc.c, rc.d, grid);
            if (pA && pB && pC && pD) {
                var minX = Math.min(pA.x, pB.x, pC.x, pD.x);
                var minY = Math.min(pA.y, pB.y, pC.y, pD.y);
                var w = Math.max(pA.x, pB.x, pC.x, pD.x) - minX;
                var h = Math.max(pA.y, pB.y, pC.y, pD.y) - minY;
                content += '<rect x="' + minX.toFixed(1) + '" y="' + minY.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) +
                    '" fill="rgba(52, 152, 219, 0.12)" stroke="#2980b9" stroke-width="4" rx="8"></rect>';
                if (state.rectSubtab === '9H') {
                    // Yol A: A -> B -> D (turuncu), Yol B: A -> C -> D (yeşil)
                    content += '<polyline points="' + pA.x.toFixed(1) + ',' + pA.y.toFixed(1) + ' ' +
                        pB.x.toFixed(1) + ',' + pB.y.toFixed(1) + ' ' + pD.x.toFixed(1) + ',' + pD.y.toFixed(1) +
                        '" fill="none" stroke="#e67e22" stroke-width="5"></polyline>';
                    content += '<polyline points="' + pA.x.toFixed(1) + ',' + pA.y.toFixed(1) + ' ' +
                        pC.x.toFixed(1) + ',' + pC.y.toFixed(1) + ' ' + pD.x.toFixed(1) + ',' + pD.y.toFixed(1) +
                        '" fill="none" stroke="#27ae60" stroke-width="5" stroke-dasharray="10 5"></polyline>';
                } else {
                    content += '<line x1="' + pA.x.toFixed(1) + '" y1="' + pA.y.toFixed(1) + '" x2="' + pD.x.toFixed(1) + '" y2="' + pD.y.toFixed(1) +
                        '" stroke="#e67e22" stroke-width="3.5" stroke-dasharray="8 4"></line>';
                    content += '<line x1="' + pB.x.toFixed(1) + '" y1="' + pB.y.toFixed(1) + '" x2="' + pC.x.toFixed(1) + '" y2="' + pC.y.toFixed(1) +
                        '" stroke="#27ae60" stroke-width="3.5" stroke-dasharray="8 4"></line>';
                }
            }
        }
        svg.innerHTML = content;
    }

    /* ---------- Çarpım Izgarası Oluşturma ve Klavye Erişilebilirliği ---------- */

    function updateLiveReadout(cell) {
        var el = $('hucre-canli-okuma');
        if (!el || !cell) return;
        var setLabel = state.mode === 'classic' ? 'ℕ⁺ (Sayma Sayıları)' : (cell.isZeroBand ? 'ℤ · Sıfır Özelliği' : 'ℤ (Tam Sayılar)');
        el.innerHTML = '<strong>Canlı Okuma:</strong> ' + wrapNeg(cell.row) + ' × ' + wrapNeg(cell.col) +
            ' = <span class="live-prod">' + fmtSigned(cell.product) + '</span> · Bölge: <em>' + escapeHtml(cell.quadrant) + '</em> · Küme: ' + setLabel;
    }

    function renderGrid() {
        var container = $('desen-izgara-tablo');
        if (!container) return;
        var grid = buildGrid(state.mode);
        var hid = state.huntId;
        var freqMap = hid === 8 ? computeFrequencyMap(state.mode) : null;
        var factorPairs = hid === 7 ? findFactorPairs(state.factorTarget, state.mode) : [];
        var factorLookup = {};
        for (var fp = 0; fp < factorPairs.length; fp++) {
            factorLookup[factorPairs[fp].row + ':' + factorPairs[fp].col] = true;
        }

        // 4 bölge açıklaması (SVG hizalamasını bozmamak için kapsayıcının dışında, üstüne yerleştir)
        var cap = $('desen-izgara-kapsayici');
        if (cap) {
            var leg = $('bolge-aciklama-cubugu');
            if (!leg && typeof document.createElement === 'function') {
                leg = document.createElement('div');
                leg.id = 'bolge-aciklama-cubugu';
                leg.className = 'quadrant-legend';
                if (cap.parentNode && cap.parentNode.insertBefore) {
                    cap.parentNode.insertBefore(leg, cap);
                } else {
                    cap.appendChild(leg);
                }
            }
            if (leg) {
                if (state.mode === 'signed') {
                    leg.innerHTML =
                        '<span class="q-badge">(+ × + = +)</span> ' +
                        '<span class="q-badge">(− × + = −)</span> ' +
                        '<span class="q-badge">(+ × − = −)</span> ' +
                        '<span class="q-badge">(− × − = +)</span> ' +
                        '<span class="q-badge q-zero">sıfır özelliği (0 × n = 0)</span>';
                } else {
                    leg.innerHTML = '<span class="q-badge">(+ × + = +) · Klasik 1–10 (ℕ⁺)</span>';
                }
            }
        }

        var rc = state.rectCoords;
        var rMin = Math.min(rc.a, rc.c), rMax = Math.max(rc.a, rc.c);
        var cMin = Math.min(rc.b, rc.d), cMax = Math.max(rc.b, rc.d);

        var tHead = '<thead><tr><th class="desen-th" scope="col" aria-label="Çarpım sembolü">×</th>';
        for (var ci = 0; ci < grid.cols.length; ci++) {
            var ch = grid.cols[ci];
            var hZeroCls = ch === 0 ? ' sifir-serit' : '';
            tHead += '<th class="desen-th' + hZeroCls + '" scope="col">' + fmtSigned(ch) + '</th>';
        }
        tHead += '</tr></thead>';

        var focusRow = state.selectedCell ? state.selectedCell.row : grid.rows[0];
        var focusCol = state.selectedCell ? state.selectedCell.col : grid.cols[0];
        if (grid.rows.indexOf(focusRow) === -1) focusRow = grid.rows[0];
        if (grid.cols.indexOf(focusCol) === -1) focusCol = grid.cols[0];

        var tBody = '<tbody>';
        for (var rIdx = 0; rIdx < grid.rows.length; rIdx++) {
            var rv = grid.rows[rIdx];
            var rhZeroCls = rv === 0 ? ' sifir-serit' : '';
            tBody += '<tr><th class="desen-th' + rhZeroCls + '" scope="row">' + fmtSigned(rv) + '</th>';
            for (var cIdx = 0; cIdx < grid.cols.length; cIdx++) {
                var cell = grid.matrix[rIdx][cIdx];
                var cv = cell.col;
                var classes = ['desen-cell'];
                if (cell.isZeroBand && state.zeroBandHighlight) classes.push('sifir-serit');

                var isSel = state.selectedCell && state.selectedCell.row === rv && state.selectedCell.col === cv;
                if (isSel) classes.push('desen-cell-selected');

                if (hid === 1) {
                    if (rv === cv) classes.push('desen-cell-diag');
                    if (state.selectedCell && state.selectedCell.row === cv && state.selectedCell.col === rv && rv !== cv) {
                        classes.push('desen-cell-mirror');
                    }
                } else if (hid === 2) {
                    if (rv === cv || (state.mode === 'signed' && rv === -cv)) {
                        classes.push('desen-cell-diag');
                    }
                } else if (hid === 3) {
                    if (rv === state.jumpRow) classes.push('desen-cell-jump');
                } else if (hid === 4) {
                    if (isMultiple(cell.product, state.divisor) && !cell.isZeroBand) {
                        classes.push('desen-cell-mult');
                    }
                } else if (hid === 5) {
                    if (!cell.isZeroBand) {
                        classes.push(isOdd(cell.product) ? 'desen-cell-odd' : 'desen-cell-even');
                    }
                } else if (hid === 6) {
                    if (isMultiple(cell.product, 9) && !cell.isZeroBand) classes.push('desen-cell-mult');
                } else if (hid === 7) {
                    if (factorLookup[rv + ':' + cv]) classes.push('desen-cell-mirror');
                } else if (hid === 8) {
                    var fq = freqMap[cell.product] || 0;
                    var matchesFilter = (state.freqFilter >= 4) ? (fq >= 4) : (fq === state.freqFilter);
                    if (matchesFilter && !cell.isZeroBand) classes.push('desen-cell-mult');
                } else if (hid === 9) {
                    var inRect = (rv >= rMin && rv <= rMax && cv >= cMin && cv <= cMax);
                    var isCorner = (rv === rc.a || rv === rc.c) && (cv === rc.b || cv === rc.d);
                    if (inRect) classes.push('desen-cell-rect');
                    if (isCorner) {
                        if (state.rectSubtab === '9I' && !state.rect9IFound && rv === rc.c && cv === rc.d) {
                            // 9I oyununda gizli 4. köşe önceden vurgulanmaz
                        } else {
                            classes.push('desen-cell-corner');
                        }
                    }
                }

                var inner = fmtSigned(cell.product);
                if (hid === 9 && state.rectSubtab === '9I' && !state.rect9IFound && rv === rc.c && cv === rc.d) {
                    inner = '?';
                } else if (hid === 5) {
                    inner += cell.isZeroBand
                        ? ' <span class="cift-rozet">0</span>'
                        : (isOdd(cell.product) ? ' <span class="tek-rozet">TEK</span>' : ' <span class="cift-rozet">ÇİFT</span>');
                }

                var tabIdx = (rv === focusRow && cv === focusCol) ? '0' : '-1';
                var ariaLbl = cell.isZeroBand
                    ? 'Sıfır özelliği hücresi: ' + fmtSigned(rv) + ' çarpı ' + fmtSigned(cv) + ' eşittir 0'
                    : fmtSigned(rv) + ' çarpı ' + fmtSigned(cv) + ' eşittir ' + fmtSigned(cell.product) + ', ' + cell.quadrant;

                tBody += '<td class="' + classes.join(' ') + '" role="gridcell" tabindex="' + tabIdx +
                    '" data-row="' + rv + '" data-col="' + cv + '" data-ridx="' + rIdx + '" data-cidx="' + cIdx +
                    '" aria-label="' + escapeHtml(ariaLbl) + '">' + inner + '</td>';
            }
            tBody += '</tr>';
        }
        tBody += '</tbody>';

        if (container.tagName && container.tagName.toUpperCase() === 'TABLE') {
            container.className = 'desen-grid-table';
            container.setAttribute('role', 'grid');
            container.innerHTML = tHead + tBody;
        } else {
            container.innerHTML = '<table class="desen-grid-table" role="grid">' + tHead + tBody + '</table>';
        }

        // Hücre olaylarını bağla (hover, click, klavye ok tuşları)
        var tdList = container.querySelectorAll ? container.querySelectorAll('td.desen-cell') : [];
        for (var idx = 0; idx < tdList.length; idx++) {
            (function (td) {
                var rNum = Number(td.getAttribute('data-row'));
                var cNum = Number(td.getAttribute('data-col'));
                var rI = Number(td.getAttribute('data-ridx'));
                var cI = Number(td.getAttribute('data-cidx'));
                var cellObj = grid.matrix[rI][cI];
                td.addEventListener('mouseenter', function () { updateLiveReadout(cellObj); });
                td.addEventListener('focus', function () { updateLiveReadout(cellObj); });
                td.addEventListener('click', function () { selectCell(rNum, cNum); });
                td.addEventListener('keydown', function (ev) {
                    var nr = rI, nc = cI;
                    if (ev.key === 'ArrowRight') nc = Math.min(grid.cols.length - 1, cI + 1);
                    else if (ev.key === 'ArrowLeft') nc = Math.max(0, cI - 1);
                    else if (ev.key === 'ArrowDown') nr = Math.min(grid.rows.length - 1, rI + 1);
                    else if (ev.key === 'ArrowUp') nr = Math.max(0, rI - 1);
                    else if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        selectCell(rNum, cNum);
                        return;
                    } else {
                        return;
                    }
                    ev.preventDefault();
                    var nextTd = container.querySelector ? container.querySelector('td[data-ridx="' + nr + '"][data-cidx="' + nc + '"]') : null;
                    if (nextTd) {
                        td.setAttribute('tabindex', '-1');
                        nextTd.setAttribute('tabindex', '0');
                        if (nextTd.focus) nextTd.focus();
                    }
                });
            }(tdList[idx]));
        }

        renderSvgOverlay(grid);
        if (state.selectedCell) {
            var sr = grid.rows.indexOf(state.selectedCell.row);
            var sc = grid.cols.indexOf(state.selectedCell.col);
            if (sr >= 0 && sc >= 0) updateLiveReadout(grid.matrix[sr][sc]);
        }
    }

    /* ---------- 4 Kademeli İpucu Merdiveni ---------- */

    var HUNT_HINTS = {
        1: [
            'Ana köşegendeki (1×1, 2×2, …) çizgiye bir ayna gibi bak.',
            'Bir hücrenin satır ve sütun numarasını yer değiştirerek karşı hücreye bak.',
            'Örneğin 3 × 7 = 21 iken 7 × 3 hücresindeki sayı da 21 çıkıyor.',
            'Kuralı açmak için en az 3 farklı ayna çiftine tıkla ve bölme örneğini incele!'
        ],
        2: [
            'Köşegendeki sayılara dikkatlice bak: 1, 4, 9, 16, 25, 36, 49…',
            'Ardışık karelerin farklarını hesapla: 4−1=3, 9−4=5, 16−9=7…',
            'Sıradaki tek farkı ekleyerek veya sayıyı kendisiyle çarparak sonraki kareyi bul.',
            'Mod 2\'de (−n)² ile −n² arasındaki parantez farkına çok dikkat et!'
        ],
        3: [
            'Seçtiğin satırdaki sayıların soldan sağa nasıl arttığına (veya azaldığına) bak.',
            'İki komşu hücre arasındaki fark her adımda sabit mi?',
            '10. adımda 10 × i olduğuna göre 11. adım bunun bir i fazlasıdır.',
            'Negatif satırda (ör. −2) her adımda −2 eklendiğini unutma.'
        ],
        4: [
            'Seçili bölenin katı olan hücrelerin tabloda çizdiği geometrik şeritlere bak.',
            '5 veya 7 yalnızca kendi satır ve sütun şeritlerinde yanar; peki 4 veya 6 neden dışarı taşar?',
            '6 = 2 × 3 olduğundan bir çarpan 2\'nin, diğeri 3\'ün katıysa çarpım da 6\'ya bölünür.',
            '7 ve 8 için basamak ezberi yoktur; yalnızca tablodaki periyodik deseni kullan!'
        ],
        5: [
            'TEK ve ÇİFT rozetlerinin tabloda oluşturduğu dama tahtası desenine bak.',
            'Her iki çarpan da tek olduğunda sonuç ne oluyor?',
            'Çarpanlardan yalnızca biri bile çiftse sonuç mutlaka çift olur.',
            '0 = 2 × 0 olduğundan çifttir ama işaretsizdir ve çarpmada yutan elemandır.'
        ],
        6: [
            '9 satırındaki sayıların basamaklarını topla: 1+8, 2+7, 3+6…',
            'Büyük sayılarda (ör. 891) ilk toplam 18 çıkabilir; 18\'in basamaklarını tekrar topla!',
            'Rakamlar toplamı 9\'un katıysa sayı 9\'a bölünür.',
            '12 gibi 3\'e bölünen her sayının 9\'a bölünmediğine dikkat et.'
        ],
        7: [
            'Hedef sayının ayna ekseninin iki yanında nasıl göründüğüne bak.',
            'Bir kare sayı (36 = 6 × 6) köşegen üzerinde tek bir hücreye oturur.',
            'Mod 2\'de hem (+ × +) hem (− × −) aynı pozitif çarpımı verir!',
            'Bu yüzden 24\'ün Mod 2\'deki konum sayısı Mod 1\'in tam 2 katıdır.'
        ],
        8: [
            'Tabloda yalnızca 1 kez görünen sayıların tamamına dikkatlice bak: 1, 25, 49, 100…',
            '25 = 5 × 5 ve 49 = 7 × 7 birer asal sayı mıdır? Bölenlerini say!',
            '1 sayısının yalnızca 1 pozitif böleni vardır, bu yüzden asal değildir.',
            '2, 3, 5, 7 asal sayılardır ve tabloda 1×p ile p×1 olarak 2 kez görünürler.'
        ],
        9: [
            'Karşılıklı duran iki köşeye dikkatlice bak.',
            'Sol üst köşe ile sağ alt köşeyi çarpmayı dene (A × D).',
            'Şimdi diğer iki çapraz köşeyi çarp (B × C).',
            'İki çarpım birbirine eşit! Bu eşitlikten eksik köşeyi x = (B × C) / A ile bulabilirsin.'
        ],
        10: [
            'Görevdeki sayılar arasında değişme, parite, bölünebilme veya orantı ilişkisi ara.',
            'Karşılıklı köşe sorularında toplamsal fark değil çarpımsal oran kur.',
            'A = 0 olursa bölme tanımsızdır; negatiflerde Unicode eksi işaretine dikkat et.',
            'Aşağıdaki 8 soruluk sınav ve kendi desenini tasarla bölümünde tüm becerilerini test et!'
        ]
    };

    function renderHintDrawer() {
        var el = $('ipucu-cekmecesi');
        if (!el) return;
        var list = HUNT_HINTS[state.huntId] || HUNT_HINTS[1];
        var shown = Math.min(state.hintLevel, list.length);
        var h = '<button type="button" class="hint-btn" id="btn-ipucu-ac">💡 İpucu Al (' + shown + ' / ' + list.length + ')</button>';
        if (shown > 0) {
            h += '<div class="hint-list">';
            for (var i = 0; i < shown; i++) {
                h += '<div class="hint-step"><strong>İpucu ' + (i + 1) + ':</strong> ' + escapeHtml(list[i]) + '</div>';
            }
            h += '</div>';
        }
        el.innerHTML = h;
        var btn = $('btn-ipucu-ac');
        if (btn) {
            btn.addEventListener('click', function () {
                if (state.hintLevel < list.length) {
                    state.hintLevel++;
                    renderHintDrawer();
                }
            });
        }
    }

    /* ---------- [−50, +50] Etkileşimli Sayı Doğrusu (#sayi-dogrusu-alani) ---------- */

    function renderNumberLine(values, warningMsg) {
        if (values !== undefined) state.numberLineValues = values;
        if (warningMsg !== undefined) state.numberLineWarning = warningMsg;

        var el = $('sayi-dogrusu-alani');
        if (!el) return;
        var pts = state.numberLineValues || [];
        var minV = -50, maxV = 50;
        var validPts = [];
        var outWarning = state.numberLineWarning || '';

        for (var i = 0; i < pts.length; i++) {
            var p = pts[i];
            var q = toRasyonel(p.q !== undefined ? p.q : p.value);
            if (!q) continue;
            var sq = Rasyonel.simplify(q);
            var inB = Rasyonel.cmp(sq, Rasyonel.make(-50, 1)) >= 0 && Rasyonel.cmp(sq, Rasyonel.make(50, 1)) <= 0;
            if (!inB) {
                outWarning = 'Sonuç (' + fmtRationalTR(sq, true) + ') [−50, +50] aralığı dışındadır (aralık dışı).';
            } else {
                validPts.push({ label: p.label || fmtRationalTR(sq), q: sq, num: Rasyonel.toNumber(sq) });
            }
        }

        if (!state.numberLineZoomFull && validPts.length > 0) {
            var loNum = 0, hiNum = 0;
            for (var j = 0; j < validPts.length; j++) {
                if (validPts[j].num < loNum) loNum = validPts[j].num;
                if (validPts[j].num > hiNum) hiNum = validPts[j].num;
            }
            minV = Math.max(-50, Math.floor(loNum) - 3);
            maxV = Math.min(50, Math.ceil(hiNum) + 3);
            if (maxV - minV < 8) {
                minV = Math.max(-50, minV - 3);
                maxV = Math.min(50, maxV + 3);
            }
        }

        var W = 640, H = 120, P = 36, Y = 58;
        var span = Math.max(1, maxV - minV);
        function xPos(v) { return P + ((v - minV) / span) * (W - 2 * P); }
        var zx = xPos(0);

        var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="nl-svg" role="img" aria-label="Sayı doğrusu aralığı eksi 50 ile artı 50">';
        if (minV < 0) {
            var negEnd = Math.min(zx, W - P);
            svg += '<rect x="' + P + '" y="' + (Y - 22) + '" width="' + Math.max(0, negEnd - P).toFixed(1) + '" height="44" fill="rgba(231,76,60,0.08)"></rect>';
        }
        if (maxV > 0) {
            var posStart = Math.max(zx, P);
            svg += '<rect x="' + posStart.toFixed(1) + '" y="' + (Y - 22) + '" width="' + Math.max(0, W - P - posStart).toFixed(1) + '" height="44" fill="rgba(46,204,113,0.09)"></rect>';
        }
        svg += '<line x1="' + P + '" y1="' + Y + '" x2="' + (W - P) + '" y2="' + Y + '" stroke="#2c3e50" stroke-width="3"></line>';

        var step = Math.max(1, Rasyonel.niceStep(span / 8));
        for (var k = Math.ceil(minV / step) * step; k <= maxV; k += step) {
            var tx = xPos(k);
            svg += '<line x1="' + tx.toFixed(1) + '" y1="' + (Y - 8) + '" x2="' + tx.toFixed(1) + '" y2="' + (Y + 8) + '" stroke="' + (k === 0 ? '#c0392b' : '#2c3e50') + '" stroke-width="' + (k === 0 ? 3 : 1.5) + '"></line>';
            svg += '<text x="' + tx.toFixed(1) + '" y="' + (Y + 24) + '" text-anchor="middle" font-size="12" fill="#2c3e50">' + fmtSigned(k) + '</text>';
        }

        for (var pIdx = 0; pIdx < validPts.length; pIdx++) {
            var pt = validPts[pIdx];
            var px = xPos(pt.num);
            var col = pt.num < 0 ? '#c0392b' : (pt.num > 0 ? '#27ae60' : '#2c3e50');
            svg += '<line x1="' + zx.toFixed(1) + '" y1="' + (Y + 38) + '" x2="' + px.toFixed(1) + '" y2="' + (Y + 38) + '" stroke="#8e44ad" stroke-width="2"></line>';
            svg += '<circle cx="' + px.toFixed(1) + '" cy="' + Y + '" r="7" fill="' + col + '" stroke="#fff" stroke-width="2"></circle>';
            svg += '<text x="' + px.toFixed(1) + '" y="' + (Y - 16) + '" text-anchor="middle" font-size="13" font-weight="bold" fill="' + col + '">' + escapeHtml(fmtRationalTR(pt.q, true)) + '</text>';
        }
        svg += '</svg>';

        var warnHtml = outWarning ? '<div class="feedback-box feedback-warn">' + escapeHtml(outWarning) + '</div>' : '';
        var toggleLabel = state.numberLineZoomFull ? '🔎 Odak görünümü' : '↔ Tüm doğru (−50 … +50)';
        var descHtml = validPts.map(function (pt) {
            return '<span><strong>' + escapeHtml(fmtRationalTR(pt.q, true)) + '</strong> (0\'a uzaklığı |x| = ' + escapeHtml(Rasyonel.fmt(Rasyonel.abs(pt.q))) + ')</span>';
        }).join(' · ');

        el.innerHTML =
            '<div class="nl-header"><strong>Sayı Doğrusu [−50, +50]</strong> ' +
            '<button type="button" class="subtab-btn" id="btn-nl-zoom">' + toggleLabel + '</button></div>' +
            warnHtml + svg + (descHtml ? '<div class="nl-desc">' + descHtml + '</div>' : '');

        var zoomBtn = $('btn-nl-zoom');
        if (zoomBtn) {
            zoomBtn.addEventListener('click', function () {
                state.numberLineZoomFull = !state.numberLineZoomFull;
                renderNumberLine();
            });
        }
    }

    /* ---------- Keşif Kilidi ve Bilgi / Dikkat Kutuları ---------- */

    function renderKnowledgeArea() {
        var box = $('bilgi-ve-dikkat-alani');
        if (!box) return;
        var hid = state.huntId;
        if (!isHuntUnlocked(hid)) {
            if (hid === 9) {
                box.innerHTML = '<div class="feedback-box feedback-warn">🔒 <strong>Keşif Kilidi Aktif:</strong> Genel <code>abcd</code> ve orantı bilgi kutusunu açmak için <strong>9B</strong> veya dikdörtgen görevlerinde en az <strong>2 farklı dikdörtgen</strong> doğrula (' + getTestedRectangleCount() + ' / 2)!</div>';
            } else {
                box.innerHTML = '<div class="feedback-box feedback-warn">🔒 <strong>Keşif Kilidi Aktif:</strong> Kuralın adını ve formülünü görmeden önce gözlem yapıp tahminini <strong>TEST ET</strong>!</div>';
            }
            return;
        }

        var h = '';
        if (hid === 1) {
            h += bilgiKutusu(
                'Çarpma İşleminin Değişme Özelliği',
                'İki tam sayının çarpımında çarpanların sırası değişse de çarpım değişmez: $a \\times b = b \\times a$.<br>Ancak bölme işleminde değişme özelliği <b>yoktur</b>: $12 \\div 3 = 4$ iken $3 \\div 12 = \\frac{1}{4}$.',
                '6. Sınıf (1. Kitap) s. 16–17; 7. Sınıf (1. Kitap) s. 94, 106'
            );
        } else if (hid === 2) {
            h += bilgiKutusu(
                'Sayının Karesi (n²)',
                'Bir sayının kendisiyle çarpımına o sayının karesi denir: $n \\times n = n^{2}$. Negatif bir sayının parantez içindeki karesi pozitiftir: $(' + MINUS + 'n)^{2} = n^{2} \\geq 0$.',
                '6. Sınıf (1. Kitap) s. 38; 7. Sınıf (1. Kitap) s. 75, 98–101'
            );
            h += dikkatKutusu(
                'Parantez Farkı: (−3)² ile −3² Aynı Değildir!',
                '$(' + MINUS + '3)^{2} = (' + MINUS + '3) \\times (' + MINUS + '3) = +9$ olurken, parantezsiz $' + MINUS + '3^{2} = ' + MINUS + '(3 \\times 3) = ' + MINUS + '9$ olur!'
            );
            h += renderSqrtPreviewBox();
        } else if (hid === 3) {
            h += bilgiKutusu(
                'Aritmetik Örüntü ve Sabit Ortak Fark',
                'Çarpım tablosundaki her satır ve sütun sabit farkla ilerleyen bir aritmetik örüntüdür: $M(i, n) = i \\times n$ ve $M(i, n+1) ' + MINUS + ' M(i, n) = i$.',
                '6. Sınıf (2. Kitap) s. 77–83; 7. Sınıf (1. Kitap) s. 73; 7. Sınıf (2. Kitap) s. 95–109'
            );
        } else if (hid === 4) {
            var divInfo = getDivisibilityRuleInfo(state.divisor);
            h += bilgiKutusu(divInfo.title, escapeHtml(divInfo.rule), divInfo.mebRef);
            if (!divInfo.hasDigitRule) {
                h += dikkatKutusu('Müfredat Kalkanı (7 ve 8)', 'MEB 6. ve 7. sınıfta 7 ve 8 için basamak bölünebilme kuralı ezberletilmez; katlar yalnızca tablodaki periyodik desen şeridinden incelenir.');
            }
        } else if (hid === 5) {
            h += bilgiKutusu(
                'Parite Yasaları (Tek ve Çift Tam Sayılar)',
                '$\\text{tek} \\times \\text{tek} = \\text{tek}$, $\\text{tek}^{2} = \\text{tek}$, $\\text{çift} \\times \\text{tam sayı} = \\text{çift}$ ($2a \\times b = 2(ab)$).<br>Mod 1\'de 100 hücrenin 25\'i (%25) tek, 75\'i (%75) çifttir; Mod 2\'de 0 hariç 400 hücrenin 100\'ü (%25) tektir.',
                '7. Sınıf (2. Kitap) s. 150–157; 7. Sınıf (1. Kitap) s. 20, 73, 94'
            );
            h += dikkatKutusu('Sıfır Özelliği (0 Çifttir Ama İşaretsizdir)', '$0 = 2 \\times 0$ biçiminde yazılabildiği için $0$ çift tam sayıdır; ancak ne pozitif ne negatiftir ve çarpmada yutan elemandır ($0 \\times n = 0$).');
        } else if (hid === 6) {
            h += bilgiKutusu(
                '9 ile Bölünebilme Kuralı',
                'Rakamları toplamı $9$ veya $9$\'un katı olan tam sayılar $9$\'a kalansız bölünür. Negatif tam sayılarda mutlak değerin basamakları toplanır.',
                '6. Sınıf (1. Kitap) s. 32–33, 37; 7. Sınıf (1. Kitap) s. 74–75'
            );
            h += dikkatKutusu(
                'Çok Adımlı Toplam ve 3–9 Farkı',
                '1) $9 \\times 99 = 891$ gibi büyük sayılarda rakamlar toplamı önce $18, 27, 36$ çıkar; yeniden toplanınca $1+8=9$ olur.<br>2) $9$\'a bölünen her sayı $3$\'e bölünür, ancak $3$\'e bölünen her sayı $9$\'a bölünmez (karşıt örnek: $12, 15, 21$).'
            );
        } else if (hid === 7) {
            h += bilgiKutusu(
                'Çarpan Çiftleri (Çarpan = Bölen)',
                'Bir sayının tablodaki tüm konumları $n = i \\times j$ çarpan çiftlerini verir. Mod 2\'de negatif çarpanlar eklendiği için görünüm sayısı 2 katına çıkar (ör. $24$: Mod 1\'de $4$, Mod 2\'de $8$ konum).',
                '6. Sınıf (1. Kitap) s. 16–20; 7. Sınıf (1. Kitap) s. 75'
            );
        } else if (hid === 8) {
            h += bilgiKutusu(
                'Tablo Görünme Sıklığı F(n) ve Asal Sayılar',
                'Köşegen kare sayılar tabloda simetri çiftine sahip olmadığı için daha az yerde görünür; asallar yalnızca $1 \\times p$ ve $p \\times 1$ olarak $2$ kez yer alır.',
                '6. Sınıf (1. Kitap) s. 38–48; 7. Sınıf (2. Kitap) s. 154'
            );
            h += dikkatKutusu(
                'Tabloda 1 Kez Görünmek = Asal Olmak DEĞİLDİR!',
                '$1$ asal değildir (yalnızca $1$ böleni vardır). $25 = 5^{2}$, $49 = 7^{2}$ ve $100 = 10^{2}$ bileşik sayılardır. Buna karşılık $2, 3, 5, 7$ asal sayılardır ve $2$ tek çift asal sayıdır.'
            );
        } else if (hid === 9) {
            h += bilgiKutusu(
                'Gizli Dikdörtgenler: abcd, Orantı ve İçler-Dışlar Çarpımı',
                'Her geçerli çarpım dikdörtgeninde $(ab)(cd) = (ad)(cb) = abcd$ eşittir. Buradan $\\frac{A}{B} = \\frac{C}{x} \\Rightarrow A \\times x = B \\times C \\Rightarrow x = \\frac{B \\times C}{A}$ ($A \\neq 0$) elde edilir.',
                '7. Sınıf (2. Kitap) s. 36–73, 110–130'
            );
            h += dikkatKutusu(
                'İki Yaygın Kavram Yanılgısı',
                '1) <b>Toplamsal fark hatası:</b> $[6, 10 / 12, ?]$ sorusunda $6 + 4 = 10$ deyip $12 + 4 = 16$ demek YANLIŞTIR; ilişki çarpımsaldır ($\\times 2 \\Rightarrow 20$).<br>2) <b>Yan yana çarpma hatası:</b> $6 \\times 10 = 12 \\times ?$ değil, <b>karşılıklı köşeler</b> çarpılır: $6 \\times ? = 10 \\times 12$.'
            );
        } else if (hid === 10) {
            h += bilgiKutusu(
                'Desen Dedektifi: Varsayım, İspat ve Karşıt Örnek',
                'Matematikte bir kuralı doğrulamak için genel yapıyı ($abcd$, $2a$, $a \\times b = b \\times a$) göstermek, çürütmek içinse tek bir karşıt örnek bulmak yeterlidir.',
                '7. Sınıf (2. Kitap) s. 150–166'
            );
        }

        box.innerHTML = h;
        bindKnowledgeDynamicEvents();
    }

    function renderSqrtPreviewBox() {
        var pre = previewSqrt(state.sqrtPreviewInput);
        var cls = pre.blocked ? 'feedback-box feedback-err' : 'feedback-box feedback-ok';
        return '<div class="preview-card" id="karekok-on-izleme">' +
            '<div><span class="preview-badge-8">(8. Sınıf Ön İzleme — MAT.8.1.2)</span> <strong>Karekök Ters Geçişi</strong></div>' +
            '<p class="muted-note">Tam kare ve kareköklü ifadeler 8. sınıf konusudur; 7. sınıfta yalnızca sayının karesini (n²) inceliyoruz.</p>' +
            '<div class="inline-controls">' +
            '<label for="inp-sqrt-preview">Sayı dene:</label>' +
            '<input type="number" id="inp-sqrt-preview" value="' + state.sqrtPreviewInput + '">' +
            '<button type="button" class="subtab-btn" id="btn-sqrt-test">Karekökü Sına</button>' +
            '</div>' +
            '<div id="sqrt-preview-msg" class="' + cls + '">' + escapeHtml(pre.message) + '</div>' +
            '</div>';
    }

    function bindKnowledgeDynamicEvents() {
        var inp = $('inp-sqrt-preview');
        var btn = $('btn-sqrt-test');
        var msg = $('sqrt-preview-msg');
        if (inp && btn && msg) {
            var run = function () {
                var val = Number(inp.value);
                state.sqrtPreviewInput = Number.isFinite(val) ? val : 0;
                var res = previewSqrt(val);
                msg.className = res.blocked ? 'feedback-box feedback-err' : 'feedback-box feedback-ok';
                msg.textContent = res.message;
            };
            btn.addEventListener('click', run);
            inp.addEventListener('input', run);
        }
    }

    /* ---------- Görev Alanı (#av-gorev-alani) & 10 Av Mantığı ---------- */

    function renderHunt1Panel(el) {
        var testedCount = Object.keys(state.mirrorsTested).length;
        var unlocked1 = isHuntUnlocked(1) || testedCount >= 3;
        var sc = state.selectedCell || { row: 3, col: 7 };
        var mp = getMirrorPair(sc.row, sc.col, unlocked1);
        el.innerHTML =
            '<h3>1. Av: Ayna Simetrisi (Keşif)</h3>' +
            '<p><em>"Ne fark ediyorsun? Çarpanların yeri değiştiği hâlde çarpım neden aynı çıkıyor?"</em></p>' +
            '<p>Tabloda köşegen dışı en az <strong>3 farklı hücre</strong> seç (veya sağdaki kutuya ayna çarpımını yazıp <strong>TEST ET</strong>).</p>' +
            '<div class="feedback-box feedback-warn">Seçili hücre: <strong>' + wrapNeg(sc.row) + ' × ' + wrapNeg(sc.col) + ' = ' + fmtSigned(mp.product) +
            '</strong> ↔ Ayna eşi: <strong>' + wrapNeg(mp.row) + ' × ' + wrapNeg(mp.col) + ' = ' + fmtSigned(mp.product) + '</strong><br>' +
            'Keşfedilen farklı çift sayısı: <strong>' + testedCount + ' / 3</strong></div>' +
            '<div class="inline-controls"><button type="button" class="subtab-btn" id="btn-bolme-karsilastir">Bölme Karşılaştırması: 12 ÷ 3 ile 3 ÷ 12</button></div>' +
            '<div id="bolme-karsilastir-sonuc">' + escapeHtml(mp.divisionNote) + '</div>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = wrapNeg(mp.row) + ' × ' + wrapNeg(mp.col) + ' çarpımını tahmin et';

        var divBtn = $('btn-bolme-karsilastir');
        if (divBtn) {
            divBtn.addEventListener('click', function () {
                var out = $('bolme-karsilastir-sonuc');
                if (out) {
                    out.innerHTML = unlocked1
                        ? '<div class="feedback-box feedback-warn">12 ÷ 3 = <strong>4</strong> iken 3 ÷ 12 = <strong>1/4 (0,25)</strong> olur. 4 ≠ 1/4 olduğundan <strong>bölme işleminde değişme özelliği yoktur!</strong></div>'
                        : '<div class="feedback-box feedback-warn">12 ÷ 3 = <strong>4</strong> iken 3 ÷ 12 = <strong>1/4 (0,25)</strong> olur. 4 ≠ 1/4! Çarpmadaki ayna simetrisi bölmede çalışmıyor.</div>';
                }
            });
        }
    }

    function renderHunt2Panel(el) {
        var n = Math.min(10, Math.max(1, Math.abs(state.squareN) || 4));
        var sq = squareInfo(state.squareN);
        var dots = '<div class="dot-square-grid" style="grid-template-columns:repeat(' + n + ',18px);">';
        for (var i = 0; i < n * n; i++) {
            dots += '<span class="dot-cell"></span>';
        }
        dots += '</div>';

        var opts = '';
        var list = state.mode === 'signed' ? [-6, -5, -4, -3, 1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        for (var j = 0; j < list.length; j++) {
            var v = list[j];
            opts += '<button type="button" class="subtab-btn' + (v === state.squareN ? ' subtab-btn-active' : '') + '" data-sq="' + v + '">' + wrapNeg(v) + '²</button>';
        }

        el.innerHTML =
            '<h3>2. Av: Özel Köşegen ve Kare Dizilimi</h3>' +
            '<p><em>"Köşegen üzerindeki sayıları diğer hücrelerden ayıran ne? Ardışık kareler arasındaki farklara (+3, +5, +7…) bak!"</em></p>' +
            '<div class="inline-controls">' + opts + '</div>' +
            '<div class="square-visual-wrap">' + dots +
            '<div><strong>' + wrapNeg(sq.n) + ' × ' + wrapNeg(sq.n) + ' = ' + fmtSigned(sq.square) + '</strong> (' + n + '×' + n + ' kare dizisi)</div></div>' +
            '<p><strong>Tahmin Görevi:</strong> 7×7 = 49 olduğuna göre sıradaki köşegen değeri olan <strong>8 × 8 = ?</strong> değerini yaz ve TEST ET.</p>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = '8 × 8 = ? değerini gir';

        var btns = el.querySelectorAll ? el.querySelectorAll('[data-sq]') : [];
        for (var k = 0; k < btns.length; k++) {
            btns[k].addEventListener('click', (function (val) {
                return function () {
                    state.squareN = val;
                    state.selectedCell = { row: val, col: val };
                    renderAll();
                };
            }(Number(btns[k].getAttribute('data-sq')))));
        }
    }

    function renderHunt3Panel(el) {
        var ar = getArithmeticRow(state.jumpRow, 10);
        var rowBtns = '';
        var choices = state.mode === 'signed' ? [-7, -2, 3, 5, 7] : [2, 3, 4, 5, 6, 7, 8, 9];
        for (var i = 0; i < choices.length; i++) {
            var c = choices[i];
            rowBtns += '<button type="button" class="subtab-btn' + (c === state.jumpRow ? ' subtab-btn-active' : '') + '" data-jrow="' + c + '">' + fmtSigned(c) + ' satırı</button>';
        }
        el.innerHTML =
            '<h3>3. Av: Sayı Sıçramaları</h3>' +
            '<p><em>"Bir sonraki sayıyı hesaplamadan tahmin edebilir misin?"</em></p>' +
            '<div class="inline-controls">' + rowBtns + '</div>' +
            '<p><strong>Terimler:</strong> ' + ar.terms.map(fmtSigned).join(' → ') + '</p>' +
            '<p><strong>Tahmin Görevi:</strong> 10. adımda 10 × ' + wrapNeg(state.jumpRow) + ' = ' + fmtSigned(state.jumpRow * 10) +
            ' olduğuna göre <strong>11. adımda</strong> hangi terim gelir?</p>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = '11. terimi tahmin et';

        var btns = el.querySelectorAll ? el.querySelectorAll('[data-jrow]') : [];
        for (var k = 0; k < btns.length; k++) {
            btns[k].addEventListener('click', (function (r) {
                return function () {
                    state.jumpRow = r;
                    renderAll();
                };
            }(Number(btns[k].getAttribute('data-jrow')))));
        }
    }

    function renderHunt4Panel(el) {
        var divs = [2, 3, 4, 5, 6, 7, 8, 9, 10];
        var btnsHtml = '';
        for (var i = 0; i < divs.length; i++) {
            var d = divs[i];
            btnsHtml += '<button type="button" class="subtab-btn' + (d === state.divisor ? ' subtab-btn-active' : '') + '" data-div="' + d + '">' + d + '\'nin katları</button>';
        }
        var zeroBadge = state.mode === 'signed'
            ? '<div class="feedback-box feedback-warn"><strong>Sıfır Özelliği:</strong> Mod 2\'de 0 satır ve sütunu ayrılmıştır: <strong>sıfır özelliği (0, sıfırdan farklı her tam sayının katıdır)</strong>.</div>'
            : '';

        el.innerHTML =
            '<h3>4. Av: Katların Şekilleri</h3>' +
            '<p><em>"5 veya 7\'nin katları dümdüz şeritler oluştururken 4 veya 6\'nın katlarında neden şeritlerin dışında da hücreler yanıyor?"</em></p>' +
            '<div class="inline-controls">' + btnsHtml + '</div>' + zeroBadge +
            '<p><strong>Tahmin Görevi:</strong> Seçili <strong>' + state.divisor + '</strong> sayısının tabloda görünen sıfırdan farklı herhangi bir katını yaz ve TEST ET.</p>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = state.divisor + ' sayısının bir katını yaz';

        var btns = el.querySelectorAll ? el.querySelectorAll('[data-div]') : [];
        for (var k = 0; k < btns.length; k++) {
            btns[k].addEventListener('click', (function (dVal) {
                return function () {
                    state.divisor = dVal;
                    renderAll();
                };
            }(Number(btns[k].getAttribute('data-div')))));
        }
    }

    function renderHunt5Panel(el) {
        var p = state.parityPair;
        var pairs = state.mode === 'signed'
            ? [{ a: -7, b: -3 }, { a: -4, b: 5 }, { a: 0, b: 9 }, { a: 6, b: -8 }]
            : [{ a: 3, b: 5 }, { a: 4, b: 7 }, { a: 9, b: 9 }, { a: 6, b: 8 }];
        var btns = '';
        for (var i = 0; i < pairs.length; i++) {
            var pr = pairs[i];
            var active = (pr.a === p.a && pr.b === p.b) ? ' subtab-btn-active' : '';
            btns += '<button type="button" class="subtab-btn' + active + '" data-pa="' + pr.a + '" data-pb="' + pr.b + '">' + wrapNeg(pr.a) + ' × ' + wrapNeg(pr.b) + '</button>';
        }
        el.innerHTML =
            '<h3>5. Av: Tek ve Çift Sayılar (Parite)</h3>' +
            '<p><em>"Çarpmayı hesaplamadan sonucun tek mi çift mi olacağını tahmin edebilir misin?"</em></p>' +
            '<div class="inline-controls">' + btns + '</div>' +
            '<p>Seçili işlem: <strong>' + wrapNeg(p.a) + ' × ' + wrapNeg(p.b) + '</strong></p>' +
            '<div class="inline-controls">' +
            '<button type="button" class="subtab-btn" id="btn-pick-tek"><span class="tek-rozet">TEK</span> Seç</button>' +
            '<button type="button" class="subtab-btn" id="btn-pick-cift"><span class="cift-rozet">ÇİFT</span> Seç</button>' +
            '</div>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = 'TEK veya ÇİFT yaz';

        var pBtns = el.querySelectorAll ? el.querySelectorAll('[data-pa]') : [];
        for (var k = 0; k < pBtns.length; k++) {
            pBtns[k].addEventListener('click', (function (aVal, bVal) {
                return function () {
                    state.parityPair = { a: aVal, b: bVal };
                    renderAll();
                };
            }(Number(pBtns[k].getAttribute('data-pa')), Number(pBtns[k].getAttribute('data-pb')))));
        }
        var bTek = $('btn-pick-tek');
        var bCift = $('btn-pick-cift');
        if (bTek) bTek.addEventListener('click', function () { if (inp) inp.value = 'TEK'; submitPrediction('TEK'); });
        if (bCift) bCift.addEventListener('click', function () { if (inp) inp.value = 'ÇİFT'; submitPrediction('ÇİFT'); });
    }

    function renderHunt6Panel(el) {
        var ds = digitSumSteps(state.digitSumTarget);
        var stepTexts = [];
        for (var i = 0; i < ds.steps.length; i++) {
            stepTexts.push(ds.steps[i].join(' + ') + ' = ' + ds.sums[i]);
        }
        var samples = [18, 108, 243, 891];
        if (state.mode === 'signed') samples = [-18, 108, -243, 891];
        var sBtns = '';
        for (var j = 0; j < samples.length; j++) {
            sBtns += '<button type="button" class="subtab-btn' + (samples[j] === state.digitSumTarget ? ' subtab-btn-active' : '') + '" data-ds="' + samples[j] + '">' + fmtSigned(samples[j]) + '</button>';
        }
        var showSteps6 = state.hunt6Tested || isHuntUnlocked(6);
        var stepBlock6 = showSteps6
            ? '<div class="step-flow">Sayı: <strong>' + fmtSigned(state.digitSumTarget) + '</strong> (|n| = ' + ds.absVal + ') → ' + stepTexts.join(' → ') + '</div>' +
              (ds.multiStepWarning ? '<p class="muted-note">⚠️ ' + escapeHtml(ds.warningText) + '</p>' : '')
            : '<div class="feedback-box feedback-warn">🔒 <strong>Gözlem:</strong> Seçili sayı: <strong>' + fmtSigned(state.digitSumTarget) + '</strong>. Rakamlar toplamı çözümlemesi tahminini <strong>TEST ET</strong> düğmesiyle sınadıktan sonra açılır!</div>';

        el.innerHTML =
            '<h3>6. Av: 9\'un Sırrı</h3>' +
            '<p><em>"9 satırındaki sayıların basamaklarını topladığında ne fark ediyorsun?"</em></p>' +
            '<div class="inline-controls">' + sBtns + '</div>' +
            stepBlock6 +
            '<p><strong>Tahmin Görevi:</strong> 9 × 99 = 891 sayısının basamaklarını tek basamağa inene kadar toplarsan sonuç kaç çıkar?</p>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = 'Basamaklar toplamı tek basamağa inince kaç olur?';

        var btns = el.querySelectorAll ? el.querySelectorAll('[data-ds]') : [];
        for (var k = 0; k < btns.length; k++) {
            btns[k].addEventListener('click', (function (v) {
                return function () { state.digitSumTarget = v; renderAll(); };
            }(Number(btns[k].getAttribute('data-ds')))));
        }
    }

    function renderHunt7Panel(el) {
        var targets = state.mode === 'signed' ? [24, -24, 36, 12, 18] : [24, 36, 12, 18, 50];
        var tBtns = '';
        for (var i = 0; i < targets.length; i++) {
            var tv = targets[i];
            tBtns += '<button type="button" class="subtab-btn' + (tv === state.factorTarget ? ' subtab-btn-active' : '') + '" data-ft="' + tv + '">' + fmtSigned(tv) + '</button>';
        }
        var pairs = findFactorPairs(state.factorTarget, state.mode);
        var chips = pairs.map(function (p) {
            return '<span class="factor-chip">' + wrapNeg(p.row) + ' × ' + wrapNeg(p.col) + '</span>';
        }).join(' ');
        var extra50 = state.factorTarget === 50
            ? '<p class="muted-note">50\'nin tüm pozitif çarpan çiftleri (6. Sınıf s. 18): 1×50, 2×25, 5×10 (10×10 tabloda 5×10 ve 10×5 yer alır).</p>'
            : '';

        el.innerHTML =
            '<h3>7. Av: Çok Saklanan Sayılar</h3>' +
            '<p><em>"Tabloda en çok saklanan sayılar hangileri? Neden 24\'ün Mod 2\'de saklandığı yer sayısı Mod 1\'in tam 2 katına çıkıyor?"</em></p>' +
            '<div class="inline-controls">' + tBtns + '</div>' +
            '<div><strong>Aktif tablodaki konumlar:</strong> ' + (chips || '10×10 sınırları dışında') + '</div>' + extra50 +
            '<p><strong>Tahmin Görevi:</strong> <strong>' + fmtSigned(state.factorTarget) + '</strong> sayısı şu anki tabloda toplam kaç hücrede görünüyor?</p>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = fmtSigned(state.factorTarget) + ' sayısı kaç hücrede görünür?';

        var btns = el.querySelectorAll ? el.querySelectorAll('[data-ft]') : [];
        for (var k = 0; k < btns.length; k++) {
            btns[k].addEventListener('click', (function (v) {
                return function () { state.factorTarget = v; renderAll(); };
            }(Number(btns[k].getAttribute('data-ft')))));
        }
    }

    function renderHunt8Panel(el) {
        var filters = [
            { val: 1, label: '1 kez (F=1)' },
            { val: 2, label: '2 kez (F=2)' },
            { val: 3, label: '3 kez (F=3)' },
            { val: 4, label: '≥ 4 kez (F≥4)' }
        ];
        var fBtns = '';
        for (var i = 0; i < filters.length; i++) {
            var f = filters[i];
            fBtns += '<button type="button" class="subtab-btn' + (f.val === state.freqFilter ? ' subtab-btn-active' : '') + '" data-fq="' + f.val + '">' + f.label + '</button>';
        }
        el.innerHTML =
            '<h3>8. Av: Yalnız Sayılar (Sıklık ve Asallık)</h3>' +
            '<p><em>"Bazı sayılar tablonun her yerinde karşımıza çıkarken bazıları neden bu kadar yalnız? 1 kez görünmek asal olmak demek midir?"</em></p>' +
            '<div class="inline-controls">' + fBtns + '</div>' +
            '<p><strong>Tahmin Görevi:</strong> Hem çift hem de asal olan <strong>tek</strong> sayı kaçtır? (Bu sayı 10×10 tabloda 2 kez görünür!)</p>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = 'Tek çift asal sayıyı yaz';

        var btns = el.querySelectorAll ? el.querySelectorAll('[data-fq]') : [];
        for (var k = 0; k < btns.length; k++) {
            btns[k].addEventListener('click', (function (v) {
                return function () { state.freqFilter = v; renderAll(); };
            }(Number(btns[k].getAttribute('data-fq')))));
        }
    }

    function renderHunt9Panel(el) {
        var subBtns = '<div class="subtab-bar">';
        for (var i = 0; i < RECT_SUBTABS.length; i++) {
            var st = RECT_SUBTABS[i];
            subBtns += '<button type="button" class="subtab-btn' + (st === state.rectSubtab ? ' subtab-btn-active' : '') + '" data-subtab="' + st + '">' + st + '</button>';
        }
        subBtns += '</div>';

        var rc = state.rectCoords;
        var rect = buildRectangle(rc.a, rc.c, rc.b, rc.d);
        var rKey = rc.a + ',' + rc.c + ',' + rc.b + ',' + rc.d;
        var testedTotal9 = getTestedRectangleCount();
        var rule9Unlocked = isHunt9RuleUnlocked() || isHuntUnlocked(9);
        var body = '';
        var sub = state.rectSubtab;

        if (sub === '9A') {
            body = '<h4>9A — Görsel Dikdörtgen Seçimi</h4>' +
                '<p>Izgaradan iki farklı hücre seçerek veya satır/sütun değerlerini değiştirerek dikdörtgen oluştur.</p>' +
                '<div class="rect-preview-grid">[' + fmtSigned(rect.A) + ', ' + fmtSigned(rect.B) + ' / ' + fmtSigned(rect.C) + ', ' + fmtSigned(rect.D) + ']</div>' +
                '<p>Satırlar: <strong>' + fmtSigned(rc.a) + ', ' + fmtSigned(rc.c) + '</strong> · Sütunlar: <strong>' + fmtSigned(rc.b) + ', ' + fmtSigned(rc.d) + '</strong></p>';
        } else if (sub === '9B') {
            var testedR = Object.keys(state.rect9BTestedKeys).length;
            body = '<h4>9B — Karşılıklı Köşe Çarpımı</h4>' +
                '<p><em>"Karşılıklı köşeleri çarp. Ne fark ediyorsun?"</em> (Genel cebirsel formülü açmak için en az <strong>2 farklı dikdörtgen</strong> test et.)</p>' +
                '<div class="step-flow">Köşeler: [' + fmtSigned(rect.A) + ', ' + fmtSigned(rect.B) + ' / ' + fmtSigned(rect.C) + ', ' + fmtSigned(rect.D) + ']<br>' +
                'Yol A: ' + wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ' = ? &nbsp;|&nbsp; Yol B: ' + wrapNeg(rect.B) + ' × ' + wrapNeg(rect.C) + ' = ?<br>' +
                'Test edilen farklı dikdörtgen: <strong>' + testedR + ' / 2</strong></div>';
            var inp9b = $('tahmin-girdisi');
            if (inp9b) inp9b.placeholder = wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ' çarpımını gir';
        } else if (sub === '9C') {
            body = '<h4>9C — Doğrulanmış 7 Örnek Seti</h4><div class="preset-list">';
            for (var pIdx = 0; pIdx < RECT_PRESETS.length; pIdx++) {
                var pr = RECT_PRESETS[pIdx];
                body += '<button type="button" class="subtab-btn" data-preset="' + pr.id + '">' + escapeHtml(pr.label) + '</button> ';
            }
            if (state.rect9CTestedKeys[rKey] || isHuntUnlocked(9)) {
                body += '</div><div class="step-flow">Doğrulanan Örnek: [' + fmtSigned(rect.A) + ', ' + fmtSigned(rect.B) + ' / ' + fmtSigned(rect.C) + ', ' + fmtSigned(rect.D) + '] → ' +
                    wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ' = ' + wrapNeg(rect.B) + ' × ' + wrapNeg(rect.C) + ' = <strong>' + fmtSigned(rect.diag1) + '</strong></div>';
            } else {
                body += '</div><div class="feedback-box feedback-warn">Aktif Örnek: <strong>[' + fmtSigned(rect.A) + ', ' + fmtSigned(rect.B) + ' / ' + fmtSigned(rect.C) + ', ' + fmtSigned(rect.D) + ']</strong>. Önce karşılıklı köşelerin çarpımını (' + wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ') hesaplayıp <strong>TEST ET</strong>!</div>';
            }
            var inp9c = $('tahmin-girdisi');
            if (inp9c) inp9c.placeholder = wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ' çarpımını tahmin et';
        } else if (sub === '9D') {
            var tilesHtml = '<div class="abcd-row">' +
                '<span class="abcd-tile">a = ' + fmtSigned(rc.a) + '</span>' +
                '<span class="abcd-tile">b = ' + fmtSigned(rc.b) + '</span>' +
                '<span class="abcd-tile">c = ' + fmtSigned(rc.c) + '</span>' +
                '<span class="abcd-tile">d = ' + fmtSigned(rc.d) + '</span>' +
                '</div>';
            var idBox9d = rule9Unlocked
                ? '<div class="step-flow">Sol-üst × Sağ-alt: (' + wrapNeg(rc.a) + '×' + wrapNeg(rc.b) + ')(' + wrapNeg(rc.c) + '×' + wrapNeg(rc.d) + ') = ' + fmtSigned(rect.abcd) + '<br>' +
                  'Sağ-üst × Sol-alt: (' + wrapNeg(rc.a) + '×' + wrapNeg(rc.d) + ')(' + wrapNeg(rc.c) + '×' + wrapNeg(rc.b) + ') = ' + fmtSigned(rect.abcd) + '<br>' +
                  '<strong>(ab)(cd) = (ad)(cb) = abcd</strong></div>'
                : '<div class="feedback-box feedback-warn">🔒 <strong>Keşif Kilidi:</strong> Genel <code>abcd</code> çarpan özdeşliğini açmak için önce <strong>9B</strong> sekmesinde en az <strong>2 farklı dikdörtgen</strong> test et (' + testedTotal9 + ' / 2)!</div>';
            body = '<h4>9D — abcd Çarpan Ayrışımı Keşfi</h4>' + tilesHtml + idBox9d;
        } else if (sub === '9E') {
            var ev = state.rect9EValues;
            var sol = solveMissingCorner(ev.A, ev.B, ev.C);
            var stepHtml = '';
            if (!sol.ok) {
                stepHtml = '<div class="feedback-box feedback-err"><strong>' + escapeHtml(sol.reason) + '</strong> (A = 0 iken bölme tanımsızdır ve TEST ET devre dışı bırakılır).</div>';
            } else if (state.rect9EAttempted) {
                var prodBC = normalizeZero(ev.B * ev.C);
                stepHtml = '<div class="step-flow">' +
                    wrapNeg(ev.A) + ' × ? = ' + wrapNeg(ev.B) + ' × ' + wrapNeg(ev.C) + ' ↓<br>' +
                    wrapNeg(ev.A) + ' × ? = ' + fmtSigned(prodBC) + ' ↓<br>' +
                    '? = ' + fmtSigned(prodBC) + ' ÷ ' + wrapNeg(ev.A) + '</div>' +
                    (!sol.inBounds ? '<div class="feedback-box feedback-warn">Uyarı: Çözüm <strong>aralık dışı</strong> ([−50, +50] dışında).</div>' : '');
            } else {
                stepHtml = '<div class="feedback-box feedback-warn">🔒 Çözüm adımları gizlidir. Karşılıklı köşeleri çarpıp eksik köşe <strong>?</strong> değerini tahmin ederek <strong>TEST ET</strong>!</div>';
            }
            body = '<h4>9E — Eksik Köşe Bulmacası (x = (B × C) / A)</h4>' +
                '<div class="rect-preview-grid">[' + fmtSigned(ev.A) + ', ' + fmtSigned(ev.B) + ' / ' + fmtSigned(ev.C) + ', ?]</div>' +
                '<div class="inline-controls">' +
                '<button type="button" class="subtab-btn" data-e9="6,10,12">[6, 10 / 12, ?]</button>' +
                '<button type="button" class="subtab-btn" data-e9="4,-6,-10">[4, −6 / −10, ?]</button>' +
                '<button type="button" class="subtab-btn" data-e9="6,5,4">[6, 5 / 4, ?] (Rasyonel)</button>' +
                '<button type="button" class="subtab-btn" data-e9="-4,3,2">[−4, 3 / 2, ?] (Negatif Rasyonel)</button>' +
                '<button type="button" class="subtab-btn" data-e9="0,6,8">[0, 6 / 8, ?] (A=0 Test)</button>' +
                '<button type="button" class="subtab-btn" id="btn-e9-new">🎲 Yeni Bulmaca</button>' +
                '</div>' +
                '<div class="inline-controls">' +
                '<label for="inp-9e-a">A:</label><input type="number" id="inp-9e-a" value="' + ev.A + '" style="width:68px;">' +
                '<label for="inp-9e-b">B:</label><input type="number" id="inp-9e-b" value="' + ev.B + '" style="width:68px;">' +
                '<label for="inp-9e-c">C:</label><input type="number" id="inp-9e-c" value="' + ev.C + '" style="width:68px;">' +
                '</div>' + stepHtml;
            var inp9e = $('tahmin-girdisi');
            if (inp9e) inp9e.placeholder = 'Eksik köşe x (ör. 20, 10/3, −1,5)';
        } else if (sub === '9F') {
            var rr = rect.rowRatio ? fmtRationalTR(rect.rowRatio, true) : 'tanımsız (A = 0)';
            var cr = rect.colRatio ? fmtRationalTR(rect.colRatio, true) : 'tanımsız (A = 0)';
            if (state.rect9FTestedKeys[rKey] || isHuntUnlocked(9)) {
                body = '<h4>9F — Oran ve Orantı Keşfi (ad = bc)</h4>' +
                    '<div class="step-flow">' +
                    'Satır oranı: ' + fmtSigned(rect.B) + '/' + fmtSigned(rect.A) + ' = ' + fmtSigned(rect.D) + '/' + fmtSigned(rect.C) + ' = <strong>' + escapeHtml(rr) + '</strong><br>' +
                    'Sütun oranı: ' + fmtSigned(rect.C) + '/' + fmtSigned(rect.A) + ' = ' + fmtSigned(rect.D) + '/' + fmtSigned(rect.B) + ' = <strong>' + escapeHtml(cr) + '</strong><br>' +
                    'İçler-dışlar çarpımı: ' + wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ' = ' + wrapNeg(rect.B) + ' × ' + wrapNeg(rect.C) + ' = <strong>' + fmtSigned(rect.diag1) + '</strong></div>';
            } else {
                body = '<h4>9F — Oran ve Orantı Keşfi</h4>' +
                    '<p>Satır oranları: <strong>' + fmtSigned(rect.B) + '/' + fmtSigned(rect.A) + '</strong> ve <strong>' + fmtSigned(rect.D) + '/' + fmtSigned(rect.C) + '</strong> · ' +
                    'Sütun oranları: <strong>' + fmtSigned(rect.C) + '/' + fmtSigned(rect.A) + '</strong> ve <strong>' + fmtSigned(rect.D) + '/' + fmtSigned(rect.B) + '</strong></p>' +
                    '<div class="feedback-box feedback-warn">🔒 En sade satır oranını (ör. 5/3), sütun oranını veya karşılıklı çarpımı yazıp <strong>TEST ET</strong>!</div>';
            }
            var inp9f = $('tahmin-girdisi');
            if (inp9f) inp9f.placeholder = 'En sade oran (ör. 5/3 veya 2) ya da çarpım';
        } else if (sub === '9G') {
            var scales = [
                { label: '[6, 10 / 12, 20] · ×2 (%200)', q: { n: 2, d: 1 }, pts: [{ label: 'Ölçek', q: { n: 2, d: 1 } }, { label: 'Hedef 20', q: { n: 20, d: 1 } }] },
                { label: '[6, 14 / 15, 35] · ×5/2 (%250)', q: { n: 5, d: 2 }, pts: [{ label: 'Ölçek 5/2', q: { n: 5, d: 2 } }, { label: 'Hedef 35', q: { n: 35, d: 1 } }] },
                { label: 'Negatif Ölçek · ×(−2) (−%200)', q: { n: -2, d: 1 }, pts: [{ label: 'Ölçek −2', q: { n: -2, d: 1 } }, { label: '6→−12', q: { n: -12, d: 1 } }, { label: '−10→+20', q: { n: 20, d: 1 } }] }
            ];
            var curSc = scales[state.rect9GScaleIdx] || scales[0];
            var sb = '';
            for (var si = 0; si < scales.length; si++) {
                sb += '<button type="button" class="subtab-btn' + (si === state.rect9GScaleIdx ? ' subtab-btn-active' : '') + '" data-g9="' + si + '">' + escapeHtml(scales[si].label) + '</button> ';
            }
            body = '<h4>9G — Görsel Orantılı Ölçekleme ([−50, +50])</h4>' +
                '<div class="inline-controls">' + sb + '</div>' +
                '<div class="step-flow">Ölçek çarpanı: <strong>' + escapeHtml(fmtRationalTR(curSc.q, true)) + '</strong> · Ön ek yüzde: <strong>' + escapeHtml(fmtPercentPrefix(curSc.q)) + '</strong></div>';
        } else if (sub === '9H') {
            var rR = rect.rowRatio ? fmtRationalTR(rect.rowRatio) : '?';
            var cR = rect.colRatio ? fmtRationalTR(rect.colRatio) : '?';
            if (state.rect9HTestedKeys[rKey] || isHuntUnlocked(9)) {
                body = '<h4>9H — "Aynı Köşeye İki Yol"</h4>' +
                    '<div class="step-flow">' +
                    '<strong>Yol A (Sağa, sonra Aşağı):</strong> ' + fmtSigned(rect.A) + ' → ' + fmtSigned(rect.B) + ' → ' + fmtSigned(rect.D) + ' (önce ×(' + escapeHtml(rR) + '), sonra ×(' + escapeHtml(cR) + '))<br>' +
                    '<strong>Yol B (Aşağı, sonra Sağa):</strong> ' + fmtSigned(rect.A) + ' → ' + fmtSigned(rect.C) + ' → ' + fmtSigned(rect.D) + ' (önce ×(' + escapeHtml(cR) + '), sonra ×(' + escapeHtml(rR) + '))<br>' +
                    'Her iki yol da <strong>' + fmtSigned(rect.D) + '</strong> köşesinde buluşur: (' + escapeHtml(rR) + ') × (' + escapeHtml(cR) + ') = (' + escapeHtml(cR) + ') × (' + escapeHtml(rR) + ')</div>';
            } else {
                body = '<h4>9H — "Aynı Köşeye İki Yol"</h4>' +
                    '<p><strong>Yol A (Sağa, sonra Aşağı):</strong> ' + fmtSigned(rect.A) + ' → ' + fmtSigned(rect.B) + ' → ?<br>' +
                    '<strong>Yol B (Aşağı, sonra Sağa):</strong> ' + fmtSigned(rect.A) + ' → ' + fmtSigned(rect.C) + ' → ?</p>' +
                    '<div class="inline-controls"><button type="button" class="subtab-btn" id="btn-h9-animate">▶ İki Yolu Canlandır ve Test Et</button></div>' +
                    '<p class="muted-note">İki yolun da hangi köşe değerinde buluştuğunu yazıp <strong>TEST ET</strong> veya yolları canlandır!</p>';
                var inp9h = $('tahmin-girdisi');
                if (inp9h) inp9h.placeholder = 'İki yolun buluştuğu köşeyi (' + fmtSigned(rect.D) + '?) gir';
            }
        } else if (sub === '9I') {
            body = '<h4>9I — Dikdörtgeni Bul Oyunu</h4>' +
                '<p>Üç köşe verildi: <strong>' + fmtSigned(rect.A) + ', ' + fmtSigned(rect.B) + ', ' + fmtSigned(rect.C) +
                '</strong>. Dördüncü köşe (' + fmtSigned(rc.c) + '. satır, ' + fmtSigned(rc.d) + '. sütun) tabloda nerede? Izgaradan tıkla veya değeri yazıp <strong>TEST ET</strong>!</p>' +
                '<button type="button" class="subtab-btn" id="btn-i9-new">🎲 Yeni Dikdörtgen Üret</button>';
            var inp9i = $('tahmin-girdisi');
            if (inp9i) inp9i.placeholder = '4. köşe değerini gir veya ızgarada tıkla';
        } else if (sub === '9J') {
            var c9 = state.rect9JCurrent;
            body = '<h4>9J — Kuralı Bozma / Karşıt Örnek Avı</h4>' +
                '<p>Aşağıdaki dörtlü geçerli bir çarpım tablosu dikdörtgeni oluşturuyor mu?</p>' +
                '<div class="rect-preview-grid">[' + fmtSigned(c9.A) + ', ' + fmtSigned(c9.B) + ' / ' + fmtSigned(c9.C) + ', ' + fmtSigned(c9.D) + ']</div>' +
                '<div class="inline-controls">' +
                '<button type="button" class="subtab-btn" id="btn-j9-valid">Geçerli Dikdörtgen</button>' +
                '<button type="button" class="subtab-btn" id="btn-j9-invalid">Karşıt Örnek (Geçersiz)</button>' +
                '<button type="button" class="subtab-btn" id="btn-j9-new">🎲 Yeni Dörtlü</button>' +
                '</div>';
            var inp9j = $('tahmin-girdisi');
            if (inp9j) inp9j.placeholder = '"geçersiz" (karşıt örnek) veya "geçerli" yaz';
        } else if (sub === '9K') {
            var axis = state.mode === 'signed' ? [-5, -3, -2, 0, 1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            function makeSel(idSel, curVal) {
                var o = '<select id="' + idSel + '">';
                for (var ai = 0; ai < axis.length; ai++) {
                    o += '<option value="' + axis[ai] + '"' + (axis[ai] === curVal ? ' selected' : '') + '>' + fmtSigned(axis[ai]) + '</option>';
                }
                return o + '</select>';
            }
            var zeroNote = rect.hasZero
                ? '<div class="feedback-box feedback-err"><strong>sıfır özelliği:</strong> Satır veya sütunlardan biri 0! Çarpım 0 olur ve A = 0 ise orantı kurulamaz ("0\'a bölünemez").</div>'
                : '';
            var cornerLive = '<div class="rect-preview-grid">[' + fmtSigned(rect.A) + ', ' + fmtSigned(rect.B) + ' / ' + fmtSigned(rect.C) + ', ' + fmtSigned(rect.D) + ']</div>';
            var kUnlocked = rule9Unlocked || !!state.rect9KTestedKeys[rKey];
            var kFormulaBox = kUnlocked
                ? '<div class="step-flow">(ab)(cd) = ' + wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ' = <strong>' + fmtSigned(rect.diag1) + '</strong><br>' +
                  '(ad)(cb) = ' + wrapNeg(rect.B) + ' × ' + wrapNeg(rect.C) + ' = <strong>' + fmtSigned(rect.diag2) + '</strong><br>' +
                  'abcd = ' + fmtSigned(rect.abcd) + '</div>'
                : '<div class="feedback-box feedback-warn">🔒 Köşeler canlı güncellendi. Genel <code>(ab)(cd) = (ad)(cb) = abcd</code> özdeşliğini açmak için bu dikdörtgenin köşe çarpımını <strong>TEST ET</strong> veya 9B\'de 2 farklı dikdörtgen doğrula (' + testedTotal9 + ' / 2)!</div>';
            body = '<h4>9K — Kendi Dikdörtgenini Üret</h4>' +
                '<div class="inline-controls">' +
                '<label for="sel-9k-a">a:</label>' + makeSel('sel-9k-a', rc.a) +
                '<label for="sel-9k-c">c:</label>' + makeSel('sel-9k-c', rc.c) +
                '<label for="sel-9k-b">b:</label>' + makeSel('sel-9k-b', rc.b) +
                '<label for="sel-9k-d">d:</label>' + makeSel('sel-9k-d', rc.d) +
                '</div>' + cornerLive + zeroNote + kFormulaBox;
        }

        el.innerHTML = '<h3>9. Av: Gizli Dikdörtgenler ve Orantı Laboratuvarı</h3>' + subBtns + body;

        // Alt sekme ve alt olayları bağla
        var sBtns = el.querySelectorAll ? el.querySelectorAll('[data-subtab]') : [];
        for (var si2 = 0; si2 < sBtns.length; si2++) {
            sBtns[si2].addEventListener('click', (function (stCode) {
                return function () { setRectSubtab(stCode); };
            }(sBtns[si2].getAttribute('data-subtab'))));
        }

        var pBtns = el.querySelectorAll ? el.querySelectorAll('[data-preset]') : [];
        for (var pi = 0; pi < pBtns.length; pi++) {
            pBtns[pi].addEventListener('click', (function (pid) {
                return function () {
                    for (var q = 0; q < RECT_PRESETS.length; q++) {
                        if (RECT_PRESETS[q].id === pid) {
                            var found = RECT_PRESETS[q];
                            if (found.mode === 'signed' && state.mode !== 'signed') state.mode = 'signed';
                            state.rectCoords = { a: found.a, c: found.c, b: found.b, d: found.d };
                            renderNumberLine([{ label: fmtSigned(found.D), q: { n: found.D, d: 1 } }], '');
                            renderAll();
                            break;
                        }
                    }
                };
            }(pBtns[pi].getAttribute('data-preset'))));
        }

        var e9Btns = el.querySelectorAll ? el.querySelectorAll('[data-e9]') : [];
        for (var ei = 0; ei < e9Btns.length; ei++) {
            e9Btns[ei].addEventListener('click', (function (csv) {
                return function () {
                    var parts = csv.split(',').map(Number);
                    state.rect9EValues = { A: parts[0], B: parts[1], C: parts[2] };
                    state.rect9EAttempted = false;
                    renderAll();
                };
            }(e9Btns[ei].getAttribute('data-e9'))));
        }

        var btnE9New = $('btn-e9-new');
        if (btnE9New) {
            btnE9New.addEventListener('click', function () {
                state.rect9ESeed += 13;
                var puz = generateMissingCornerPuzzle(state.rect9ESeed, state.mode);
                state.rect9EValues = { A: puz.A, B: puz.B, C: puz.C };
                state.rectCoords = { a: puz.a, c: puz.c, b: puz.b, d: puz.d };
                state.rect9EAttempted = false;
                renderAll();
            });
        }

        ['inp-9e-a', 'inp-9e-b', 'inp-9e-c'].forEach(function (idStr, idxPos) {
            var inpEl = $(idStr);
            if (inpEl) {
                inpEl.addEventListener('input', function () {
                    var parsed = Rasyonel.readInt(inpEl);
                    if (parsed === null) return;
                    if (idxPos === 0) state.rect9EValues.A = parsed;
                    else if (idxPos === 1) state.rect9EValues.B = parsed;
                    else state.rect9EValues.C = parsed;
                    state.rect9EAttempted = false;
                    syncTestButtonGuard();
                    if (state.rect9EValues.A === 0) {
                        setFeedback('err', "<strong>0'a bölünemez:</strong> A = 0 olduğunda orantı denklemi çözülemez.");
                    } else {
                        renderHunt9Panel(el);
                    }
                });
            }
        });

        var btnH9Anim = $('btn-h9-animate');
        if (btnH9Anim) {
            btnH9Anim.addEventListener('click', function () {
                state.rect9HTestedKeys[rKey] = true;
                unlockCurrentHunt('🎉 <strong>İki yol da ' + fmtSigned(rect.D) + ' köşesinde buluştu!</strong> Çarpmada sıra değişse de sonuç aynıdır.');
            });
        }

        var g9Btns = el.querySelectorAll ? el.querySelectorAll('[data-g9]') : [];
        for (var gi = 0; gi < g9Btns.length; gi++) {
            g9Btns[gi].addEventListener('click', (function (gIdx) {
                return function () {
                    state.rect9GScaleIdx = gIdx;
                    if (gIdx === 0) {
                        state.rectCoords = { a: 2, c: 4, b: 3, d: 5 };
                        renderNumberLine([{ label: '2', q: { n: 2, d: 1 } }, { label: '20', q: { n: 20, d: 1 } }], '');
                    } else if (gIdx === 1) {
                        state.rectCoords = { a: 2, c: 5, b: 3, d: 7 };
                        renderNumberLine([{ label: '5/2', q: { n: 5, d: 2 } }, { label: '35', q: { n: 35, d: 1 } }], '');
                    } else {
                        state.mode = 'signed';
                        state.rectCoords = { a: -2, c: 4, b: -3, d: 5 };
                        renderNumberLine([{ label: '−2', q: { n: -2, d: 1 } }, { label: '−12', q: { n: -12, d: 1 } }, { label: '20', q: { n: 20, d: 1 } }], '');
                    }
                    renderAll();
                };
            }(Number(g9Btns[gi].getAttribute('data-g9')))));
        }

        var btnI9New = $('btn-i9-new');
        if (btnI9New) {
            btnI9New.addEventListener('click', function () {
                state.rect9ISeed += 19;
                var puz = generateFindRectPuzzle(state.rect9ISeed, state.mode);
                state.rectCoords = { a: puz.a, c: puz.c, b: puz.b, d: puz.d };
                state.rect9IFound = false;
                renderAll();
            });
        }

        var btnJ9Valid = $('btn-j9-valid');
        var btnJ9Invalid = $('btn-j9-invalid');
        var btnJ9New = $('btn-j9-new');
        if (btnJ9Valid) btnJ9Valid.addEventListener('click', function () { submitPrediction('geçerli'); });
        if (btnJ9Invalid) btnJ9Invalid.addEventListener('click', function () { submitPrediction('geçersiz'); });
        if (btnJ9New) {
            btnJ9New.addEventListener('click', function () {
                state.rect9JSeed += 23;
                state.rect9JCurrent = generateCounterExamplePuzzle(state.rect9JSeed);
                renderAll();
            });
        }

        ['sel-9k-a', 'sel-9k-c', 'sel-9k-b', 'sel-9k-d'].forEach(function (sid, sPos) {
            var selEl = $(sid);
            if (selEl) {
                selEl.addEventListener('change', function () {
                    var v = Number(selEl.value);
                    var next = { a: state.rectCoords.a, c: state.rectCoords.c, b: state.rectCoords.b, d: state.rectCoords.d };
                    if (sPos === 0) next.a = v;
                    else if (sPos === 1) next.c = v;
                    else if (sPos === 2) next.b = v;
                    else next.d = v;
                    if (next.a === next.c || next.b === next.d) {
                        setFeedback('warn', 'İki farklı satır (a ≠ c) ve iki farklı sütun (b ≠ d) seçmelisin.');
                        return;
                    }
                    state.rectCoords = next;
                    state.rect9EValues = { A: next.a * next.b, B: next.a * next.d, C: next.c * next.b };
                    state.rect9EAttempted = false;
                    renderAll();
                });
            }
        });
    }

    function renderHunt10Panel(el) {
        var ch = generateHuntChallenge(10, state.challengeSeed, state.mode);
        el.innerHTML =
            '<h3>10. Av: Desen Dedektifi Final Mücadelesi</h3>' +
            '<p><em>"Şimdi tüm öğrendiklerini birleştirerek karma meydan okumayı çöz, ardından aşağıdaki 3 kademeli sınavı ve kendi desen atölyeni dene!"</em></p>' +
            '<div class="step-flow">' + escapeHtml(ch.prompt) + '</div>' +
            '<div class="inline-controls">' +
            '<button type="button" class="subtab-btn" id="btn-ch10-new">🎲 Yeni Meydan Okuma</button>' +
            '<a class="subtab-btn" href="#desen-sinav-alani">📝 8 Soruluk Sınava Geç</a>' +
            '<a class="subtab-btn" href="#kendi-desenini-tasarla">🎨 Kendi Desenini Tasarla</a>' +
            '</div>';

        var inp = $('tahmin-girdisi');
        if (inp) inp.placeholder = 'Eksik değeri gir ve TEST ET';

        var btn = $('btn-ch10-new');
        if (btn) {
            btn.addEventListener('click', function () {
                state.challengeSeed += 31;
                renderAll();
            });
        }
    }

    function renderMissionArea() {
        var el = $('av-gorev-alani');
        if (!el) return;
        switch (state.huntId) {
            case 1: renderHunt1Panel(el); break;
            case 2: renderHunt2Panel(el); break;
            case 3: renderHunt3Panel(el); break;
            case 4: renderHunt4Panel(el); break;
            case 5: renderHunt5Panel(el); break;
            case 6: renderHunt6Panel(el); break;
            case 7: renderHunt7Panel(el); break;
            case 8: renderHunt8Panel(el); break;
            case 9: renderHunt9Panel(el); break;
            case 10: default: renderHunt10Panel(el); break;
        }
        syncTestButtonGuard();
    }

    function syncTestButtonGuard() {
        var btn = $('btn-test-et');
        if (!btn) return;
        var shouldDisable = false;
        if (state.huntId === 9 && state.rectSubtab === '9E' && state.rect9EValues.A === 0) {
            shouldDisable = true;
            setFeedback('err', "<strong>0'a bölünemez:</strong> Sol üst köşe A = 0 olduğunda bölme tanımsızdır; TEST ET düğmesi kilitlendi.");
        } else if (state.huntId === 9 && (state.rectSubtab === '9K' || state.rectSubtab === '9F')) {
            var rc = state.rectCoords;
            if (rc.a === 0 || rc.b === 0) {
                shouldDisable = true;
            }
        }
        btn.disabled = shouldDisable;
        btn.setAttribute('aria-disabled', shouldDisable ? 'true' : 'false');
    }

    /* ---------- Tahmin Test Etme & Keşif Kilidi Açma ---------- */

    function unlockCurrentHunt(msg) {
        if (state.huntId === 9 && !isHunt9RuleUnlocked()) {
            state.stepIdx = Math.max(state.stepIdx, 3);
            playChime('ok');
            setFeedback('ok', msg + '<br><em>🔒 Genel <code>abcd</code> ve orantı bilgi kutusunu açmak için <strong>9B</strong> veya dikdörtgen modlarında en az <strong>2 farklı dikdörtgen</strong> doğrulamalısın (' + getTestedRectangleCount() + ' / 2).</em>');
            renderDiscoveryStepper();
            renderProgressAndTabs();
            renderMissionArea();
            renderKnowledgeArea();
            return;
        }
        state.discoveredHunts[state.huntId] = true;
        if (state.huntId === 6) state.hunt6Tested = true;
        state.stepIdx = 5; // GENELLE
        playChime('ok');
        setFeedback('ok', msg);
        renderDiscoveryStepper();
        renderProgressAndTabs();
        renderMissionArea();
        renderKnowledgeArea();
    }

    function submitPrediction(rawInput) {
        var inp = $('tahmin-girdisi');
        var raw = rawInput !== undefined ? String(rawInput) : (inp ? String(inp.value) : '');
        var trimmed = raw.trim();
        var hid = state.huntId;

        if (hid === 9 && state.rectSubtab === '9E' && state.rect9EValues.A === 0) {
            playChime('err');
            syncTestButtonGuard();
            return { ok: false, reason: "0'a bölünemez" };
        }

        if (!trimmed) {
            playChime('err');
            setFeedback('warn', 'Lütfen önce tahminini kutuya yaz (boş girdi 0 sayılmaz!).');
            return { ok: false, reason: 'boş girdi' };
        }

        var parsedQ = Rasyonel.parse(trimmed);

        if (hid === 1) {
            var sc = state.selectedCell || { row: 3, col: 7 };
            var mp = getMirrorPair(sc.row, sc.col);
            if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(mp.product, 1))) {
                state.mirrorsTested[Math.min(sc.row, sc.col) + ':' + Math.max(sc.row, sc.col)] = true;
                var cnt = Object.keys(state.mirrorsTested).length;
                if (cnt >= 3) {
                    unlockCurrentHunt('🎉 <strong>Bir desen yakaladın!</strong> ' + cnt + ' farklı ayna çiftini doğruladın: ' +
                        wrapNeg(sc.row) + ' × ' + wrapNeg(sc.col) + ' = ' + wrapNeg(mp.row) + ' × ' + wrapNeg(mp.col) + ' = ' + fmtSigned(mp.product) + '.');
                } else {
                    state.stepIdx = 3;
                    playChime('ok');
                    setFeedback('ok', '✅ Doğru! Ayna eşi de ' + fmtSigned(mp.product) + ' çıkar. Kuralı açmak için tablodan <strong>' + (3 - cnt) + '</strong> farklı ayna çifti daha dene.');
                    renderDiscoveryStepper();
                    renderMissionArea();
                }
                return { ok: true };
            }
            playChime('err');
            setFeedback('err', 'Tekrar dene! ' + wrapNeg(sc.row) + ' × ' + wrapNeg(sc.col) + ' ile yer değiştirmiş ayna eşi aynı çarpımı verir.');
            return { ok: false };
        }

        if (hid === 2) {
            if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(64, 1))) {
                unlockCurrentHunt('🎉 <strong>Harika!</strong> 8 × 8 = 8² = 64 (49 + 15 = 64). Sayının karesi örüntüsünü keşfettin!');
                return { ok: true };
            }
            playChime('err');
            setFeedback('err', 'İpucu: 7² = 49 üzerine sıradaki tek fark olan +15 ekle veya 8 × 8 değerini hesapla.');
            return { ok: false };
        }

        if (hid === 3) {
            var exp3 = normalizeZero(state.jumpRow * 11);
            if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(exp3, 1))) {
                renderNumberLine([{ label: '11. terim', q: { n: exp3, d: 1 } }], '');
                unlockCurrentHunt('🎉 <strong>Kesin isabet!</strong> 10 × ' + wrapNeg(state.jumpRow) + ' üzerine sabit fark ' + fmtSigned(state.jumpRow, true) + ' eklediğinde 11. terim ' + fmtSigned(exp3) + ' olur.');
                return { ok: true };
            }
            playChime('err');
            setFeedback('err', 'Tekrar düşün: 10. terim ' + fmtSigned(state.jumpRow * 10) + ' üzerine her adımdaki sabit fark ' + fmtSigned(state.jumpRow, true) + ' eklenir.');
            return { ok: false };
        }

        if (hid === 4) {
            if (parsedQ && Rasyonel.isInt(parsedQ)) {
                var val4 = Rasyonel.toNumber(parsedQ);
                if (val4 !== 0 && isMultiple(val4, state.divisor)) {
                    unlockCurrentHunt('🎉 <strong>Doğru kat!</strong> ' + fmtSigned(val4) + ' sayısı ' + state.divisor + ' ile kalansız bölünür.');
                    return { ok: true };
                }
            }
            playChime('err');
            setFeedback('err', escapeHtml(trimmed) + ' değeri ' + state.divisor + ' sayısının sıfırdan farklı bir tam katı değil. Seçili şeritlerden birini dene!');
            return { ok: false };
        }

        if (hid === 5) {
            var normTxt = trimmed.toUpperCase().replace(/İ/g, 'I').replace(/Ç/g, 'C');
            var prod5 = normalizeZero(state.parityPair.a * state.parityPair.b);
            var expectedOdd = isOdd(prod5);
            var userOdd = (normTxt === 'TEK' || normTxt === 'T');
            var userEven = (normTxt === 'CIFT' || normTxt === 'ÇİFT' || normTxt === 'Ç' || normTxt === 'C');
            if ((expectedOdd && userOdd) || (!expectedOdd && userEven)) {
                unlockCurrentHunt('🎉 <strong>Doğru tahmin!</strong> ' + wrapNeg(state.parityPair.a) + ' × ' + wrapNeg(state.parityPair.b) + ' = ' + fmtSigned(prod5) + ' (' + (expectedOdd ? 'TEK' : 'ÇİFT') + ').');
                return { ok: true };
            }
            playChime('err');
            setFeedback('err', 'Çarpanların paritesine bak: yalnız tek × tek sonucu TEK olur; çarpanlardan biri çiftse (veya 0 ise) sonuç ÇİFT olur.');
            return { ok: false };
        }

        if (hid === 6) {
            if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(9, 1))) {
                unlockCurrentHunt('🎉 <strong>9\'un sırrını çözdün!</strong> 8 + 9 + 1 = 18 → 1 + 8 = 9!');
                return { ok: true };
            }
            playChime('err');
            setFeedback('err', '891\'in rakamları toplamı 18 olur; 18\'in rakamlarını (1 + 8) tekrar toplarsan kaça ulaşırsın?');
            return { ok: false };
        }

        if (hid === 7) {
            var expectedCount = findFactorPairs(state.factorTarget, state.mode).length;
            if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(expectedCount, 1))) {
                unlockCurrentHunt('🎉 <strong>Tam isabet!</strong> ' + fmtSigned(state.factorTarget) + ' sayısı bu tabloda tam ' + expectedCount + ' yerde saklanıyor.');
                return { ok: true };
            }
            playChime('err');
            setFeedback('err', 'İpucu: Tabloda parlayan tüm ' + fmtSigned(state.factorTarget) + ' hücrelerini (ve ayna eşlerini) say.');
            return { ok: false };
        }

        if (hid === 8) {
            if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(2, 1))) {
                unlockCurrentHunt('🎉 <strong>Doğru!</strong> 2 en küçük asal sayı ve tek çift asal sayıdır. 1 ve 25 ise asal değildir!');
                return { ok: true };
            }
            playChime('err');
            setFeedback('err', 'Dikkat: 1 asal değildir! Hem 2\'ye bölünen hem asal olan tek sayıyı düşün.');
            return { ok: false };
        }

        if (hid === 9) {
            var rc = state.rectCoords;
            var rect = buildRectangle(rc.a, rc.c, rc.b, rc.d);
            var rKey = rc.a + ',' + rc.c + ',' + rc.b + ',' + rc.d;
            if (state.rectSubtab === '9E') {
                var ev = state.rect9EValues;
                var sol = solveMissingCorner(ev.A, ev.B, ev.C);
                if (!sol.ok) {
                    playChime('err');
                    setFeedback('err', sol.reason);
                    return { ok: false };
                }
                state.rect9EAttempted = true;
                if (parsedQ && Rasyonel.eq(parsedQ, sol.value)) {
                    renderNumberLine([{ label: 'x', q: sol.value }], sol.inBounds ? '' : 'aralık dışı');
                    unlockCurrentHunt('🎉 <strong>Kesin çözüm!</strong> x = (' + wrapNeg(ev.B) + ' × ' + wrapNeg(ev.C) + ') / ' + wrapNeg(ev.A) + ' = <strong>' + escapeHtml(fmtRationalTR(sol.value, true)) + '</strong>.');
                    return { ok: true };
                }
                playChime('err');
                // Yaygın kavram yanılgısı teşhisi
                var addTrap = ev.C + (ev.B - ev.A);
                var hasAdjTrap = ev.C !== 0 && parsedQ && Rasyonel.eq(parsedQ, Rasyonel.simplify(Rasyonel.make(ev.A * ev.B, ev.C)));
                if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(addTrap, 1))) {
                    setFeedback('err', '⚠️ <strong>Toplamsal fark tuzağına düştün!</strong> Çarpım dikdörtgeninde fark eklenmez, <strong>karşılıklı köşeler çarpılır</strong>: ' + wrapNeg(ev.A) + ' × x = ' + wrapNeg(ev.B) + ' × ' + wrapNeg(ev.C) + '.');
                } else if (hasAdjTrap) {
                    setFeedback('err', '⚠️ <strong>Yan yana çarpma tuzağı!</strong> Üst satırdaki komşuları (' + wrapNeg(ev.A) + ' × ' + wrapNeg(ev.B) + ') değil, <strong>karşılıklı köşeleri</strong> çarp: ' + wrapNeg(ev.A) + ' × x = ' + wrapNeg(ev.B) + ' × ' + wrapNeg(ev.C) + '.');
                } else {
                    setFeedback('err', 'Çarpraz köşeleri çarpıp A\'ya böl: x = (' + wrapNeg(ev.B) + ' × ' + wrapNeg(ev.C) + ') ÷ ' + wrapNeg(ev.A) + '.');
                }
                renderMissionArea();
                return { ok: false };
            }
            if (state.rectSubtab === '9F') {
                if (rect.A === 0) {
                    playChime('err');
                    setFeedback('err', "0'a bölünemez: Oran kurmak için sıfır içermeyen bir dikdörtgen seç.");
                    return { ok: false, reason: "0'a bölünemez" };
                }
                var matchRow = !!(parsedQ && rect.rowRatio && Rasyonel.eq(parsedQ, rect.rowRatio));
                var matchCol = !!(parsedQ && rect.colRatio && Rasyonel.eq(parsedQ, rect.colRatio));
                var matchCross = !!(parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(rect.diag1, 1)));
                if (matchRow || matchCol || matchCross) {
                    state.rect9FTestedKeys[rKey] = true;
                    unlockCurrentHunt('🎉 <strong>Orantı doğrulandı!</strong> Satır oranı: <strong>' + escapeHtml(fmtRationalTR(rect.rowRatio, true)) +
                        '</strong> · Sütun oranı: <strong>' + escapeHtml(fmtRationalTR(rect.colRatio, true)) +
                        '</strong> · İçler-dışlar çarpımı: ' + wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ' = ' + wrapNeg(rect.B) + ' × ' + wrapNeg(rect.C) + ' = ' + fmtSigned(rect.diag1) + '.');
                    return { ok: true };
                }
                playChime('err');
                setFeedback('err', 'Satır oranı ' + fmtSigned(rect.B) + '/' + fmtSigned(rect.A) + ' veya sütun oranı ' + fmtSigned(rect.C) + '/' + fmtSigned(rect.A) + ' kesrini en sade hâline getir (ya da ad = bc çarpımını yaz)!');
                return { ok: false };
            }
            if (state.rectSubtab === '9H') {
                var matchCorner = !!(parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(rect.D, 1)));
                var matchDiag = !!(parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(rect.diag1, 1)));
                if (matchCorner || matchDiag) {
                    state.rect9HTestedKeys[rKey] = true;
                    unlockCurrentHunt('🎉 <strong>İki yol da ' + fmtSigned(rect.D) + ' köşesinde buluştu!</strong> Yol A ve Yol B aynı sonucu verir.');
                    return { ok: true };
                }
                playChime('err');
                setFeedback('err', 'Yol A (' + fmtSigned(rect.A) + ' → ' + fmtSigned(rect.B) + ' → ?) ile Yol B (' + fmtSigned(rect.A) + ' → ' + fmtSigned(rect.C) + ' → ?) hangi köşede buluşuyor?');
                return { ok: false };
            }
            if (state.rectSubtab === '9J') {
                var c9 = state.rect9JCurrent;
                var low = trimmed.toLowerCase();
                var guessedInvalid = (low.indexOf('geçersiz') !== -1 || low.indexOf('gecersiz') !== -1 || low.indexOf('karşıt') !== -1 || low.indexOf('hayır') !== -1 || low.indexOf('boz') !== -1);
                var guessedValid = !guessedInvalid && (low.indexOf('geçerli') !== -1 || low.indexOf('gecerli') !== -1 || low.indexOf('evet') !== -1);
                var chk = checkRectangleCandidate(c9.A, c9.B, c9.C, c9.D);
                if ((chk.valid && guessedValid) || (!chk.valid && guessedInvalid)) {
                    unlockCurrentHunt('🎉 <strong>Harika eleştirel bakış!</strong> ' + escapeHtml(chk.reason));
                    return { ok: true };
                }
                playChime('err');
                setFeedback('err', 'Karşılıklı köşeleri çarp: ' + wrapNeg(c9.A) + ' × ' + wrapNeg(c9.D) + ' ile ' + wrapNeg(c9.B) + ' × ' + wrapNeg(c9.C) + ' eşit mi kontrol et!');
                return { ok: false };
            }
            if (state.rectSubtab === '9I') {
                if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(rect.D, 1))) {
                    state.rect9IFound = true;
                    renderNumberLine([{ label: '4. köşe', q: { n: rect.D, d: 1 } }], '');
                    unlockCurrentHunt('🎉 <strong>4. köşeyi buldun!</strong> ' + fmtSigned(rect.D) + ' (' + wrapNeg(rc.c) + ' × ' + wrapNeg(rc.d) + ') ile ' + fmtSigned(rect.diag1) + ' = ' + fmtSigned(rect.diag2) + '.');
                    renderGrid();
                    return { ok: true };
                }
                playChime('err');
                setFeedback('err', 'Orantıyı kullan: (' + wrapNeg(rect.B) + ' × ' + wrapNeg(rect.C) + ') ÷ ' + wrapNeg(rect.A) + ' veya ızgaradaki satır-sütun kesişimine bak.');
                return { ok: false };
            }
            // 9A, 9B, 9C, 9D, 9G, 9K ortak çarpraz çarpım doğrulaması
            if (parsedQ && Rasyonel.eq(parsedQ, Rasyonel.make(rect.diag1, 1))) {
                state.rectTestedKeys[rKey] = true;
                if (state.rectSubtab === '9C') state.rect9CTestedKeys[rKey] = true;
                if (state.rectSubtab === '9K') state.rect9KTestedKeys[rKey] = true;
                if (state.rectSubtab === '9B') state.rect9BTestedKeys[rKey] = true;
                var totalR = getTestedRectangleCount();
                if (!isHunt9RuleUnlocked()) {
                    state.stepIdx = 3;
                    playChime('ok');
                    setFeedback('ok', '✅ Doğru! ' + wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + ' = ' + wrapNeg(rect.B) + ' × ' + wrapNeg(rect.C) + ' = ' + fmtSigned(rect.diag1) + '. Genel abcd formülünü açmak için <strong>bir farklı dikdörtgen daha</strong> seç ve test et (' + totalR + ' / 2)!');
                    renderDiscoveryStepper();
                    renderMissionArea();
                    renderKnowledgeArea();
                    return { ok: true };
                }
                unlockCurrentHunt('🎉 <strong>Dikdörtgen doğrulandı!</strong> (' + wrapNeg(rect.A) + ')(' + wrapNeg(rect.D) + ') = (' + wrapNeg(rect.B) + ')(' + wrapNeg(rect.C) + ') = ' + fmtSigned(rect.diag1) + '.');
                return { ok: true };
            }
            playChime('err');
            setFeedback('err', 'Karşılıklı köşelerin çarpımını dene: ' + wrapNeg(rect.A) + ' × ' + wrapNeg(rect.D) + '.');
            return { ok: false };
        }

        // Av 10: Karma meydan okuma
        var ch10 = generateHuntChallenge(10, state.challengeSeed, state.mode);
        if (parsedQ && Rasyonel.eq(parsedQ, ch10.puzzle.solution.value)) {
            renderNumberLine([{ label: 'x', q: ch10.puzzle.solution.value }], '');
            unlockCurrentHunt('🎉 <strong>Tebrikler Desen Dedektifi!</strong> Tüm adımları başarıyla tamamladın.');
            return { ok: true };
        }
        playChime('err');
        setFeedback('err', 'İpucu: x = (' + wrapNeg(ch10.puzzle.B) + ' × ' + wrapNeg(ch10.puzzle.C) + ') ÷ ' + wrapNeg(ch10.puzzle.A) + ' oranını tekrar kontrol et.');
        return { ok: false };
    }

    /* ---------- Hücre Seçimi Etkileşimi ---------- */

    function selectCell(row, col) {
        var r = normalizeZero(Number(row));
        var c = normalizeZero(Number(col));
        state.selectedCell = { row: r, col: c };
        playChime('click');

        if (state.huntId === 1) {
            if (r !== c) {
                state.mirrorsTested[Math.min(r, c) + ':' + Math.max(r, c)] = true;
            }
            var cnt = Object.keys(state.mirrorsTested).length;
            if (cnt >= 3 && !isHuntUnlocked(1)) {
                unlockCurrentHunt('🎉 <strong>3 farklı ayna çiftini kendin keşfettin!</strong> Artık kuralın adını ve formülünü görebilirsin.');
            } else if (r !== c) {
                state.stepIdx = Math.max(state.stepIdx, 2);
                var mp = getMirrorPair(r, c);
                setFeedback('ok', wrapNeg(r) + ' × ' + wrapNeg(c) + ' = ' + fmtSigned(mp.product) + ' ve ayna eşi ' + wrapNeg(mp.row) + ' × ' + wrapNeg(mp.col) + ' = ' + fmtSigned(mp.product) + '! (' + cnt + ' / 3 çift)');
            }
        } else if (state.huntId === 2) {
            if (r === c) {
                state.squareN = r;
            }
        } else if (state.huntId === 3) {
            state.jumpRow = r;
        } else if (state.huntId === 6) {
            state.digitSumTarget = normalizeZero(r * c);
        } else if (state.huntId === 9) {
            if (state.rectSubtab === '9I' && !state.rect9IFound) {
                var rcI = state.rectCoords;
                if (r === rcI.c && c === rcI.d) {
                    var prod = normalizeZero(r * c);
                    state.rect9IFound = true;
                    renderNumberLine([{ label: '4. köşe', q: { n: prod, d: 1 } }], '');
                    unlockCurrentHunt('🎉 <strong>Tam isabet!</strong> 4. köşe (' + wrapNeg(r) + ' × ' + wrapNeg(c) + ' = ' + fmtSigned(prod) + ') hücresini buldun!');
                } else {
                    playChime('err');
                    setFeedback('err', 'Bu hücre (' + wrapNeg(r) + ' × ' + wrapNeg(c) + ') aranan 4. köşe değil; ' + fmtSigned(rcI.c) + '. satır ve ' + fmtSigned(rcI.d) + '. sütun kesişimini bul!');
                }
            } else {
                // 2 hücre seçerek dinamik dikdörtgen oluşturma
                state.rectSelectionQueue.push({ row: r, col: c });
                if (state.rectSelectionQueue.length >= 2) {
                    var p1 = state.rectSelectionQueue[0];
                    var p2 = state.rectSelectionQueue[1];
                    if (p1.row !== p2.row && p1.col !== p2.col) {
                        var newRect = buildRectangle(p1.row, p2.row, p1.col, p2.col);
                        if (newRect.valid) {
                            state.rectCoords = { a: newRect.a, c: newRect.c, b: newRect.b, d: newRect.d };
                            state.rect9EValues = { A: newRect.A, B: newRect.B, C: newRect.C };
                            state.rect9EAttempted = false;
                            var selKey = newRect.a + ',' + newRect.c + ',' + newRect.b + ',' + newRect.d;
                            if (state.rectSubtab === '9B') {
                                state.rect9BTestedKeys[selKey] = true;
                                state.rectTestedKeys[selKey] = true;
                                if (isHunt9RuleUnlocked()) {
                                    unlockCurrentHunt('🎉 <strong>2 farklı dikdörtgen doğrulandı!</strong> Genel abcd kuralı açıldı.');
                                } else {
                                    setFeedback('ok', 'Yeni dikdörtgen seçildi: [' + fmtSigned(newRect.A) + ', ' + fmtSigned(newRect.B) + ' / ' + fmtSigned(newRect.C) + ', ' + fmtSigned(newRect.D) + '] (' + getTestedRectangleCount() + ' / 2).');
                                }
                            } else {
                                setFeedback('ok', 'Yeni dikdörtgen seçildi: [' + fmtSigned(newRect.A) + ', ' + fmtSigned(newRect.B) + ' / ' + fmtSigned(newRect.C) + ', ' + fmtSigned(newRect.D) + ']. Karşılıklı köşe çarpımını veya oranını TEST ET!');
                            }
                        }
                    } else {
                        setFeedback('warn', 'Dikdörtgen için farklı satır ve farklı sütundan ikinci bir köşe seç.');
                    }
                    state.rectSelectionQueue = [];
                } else {
                    setFeedback('warn', 'İlk köşe (' + wrapNeg(r) + ', ' + wrapNeg(c) + ') seçildi; şimdi çapraz köşe için farklı satır ve sütundan bir hücreye tıkla.');
                }
            }
        }
        renderAll();
    }

    /* ---------- Formül Başvurusu & Kendi Desenini Tasarla ---------- */

    function renderFormulaReference() {
        var innerTarget = $('formul-referans-icerik');
        if (innerTarget) {
            if (!innerTarget.innerHTML || !innerTarget.innerHTML.trim()) {
                var cards = '';
                for (var c = 0; c < FORMULA_REF_ITEMS.length; c++) {
                    var it = FORMULA_REF_ITEMS[c];
                    cards += '<div class="formul-kart"><h3>' + escapeHtml(it.title) + '</h3><p>' +
                        fmtMath(it.formula) + ' ' + fmtMath(it.note) + '</p></div>';
                }
                innerTarget.innerHTML = cards;
            }
            return;
        }
        var el = $('formul-referans');
        if (!el) return;
        var itemsHtml = '<div class="formula-ref-list">';
        for (var i = 0; i < FORMULA_REF_ITEMS.length; i++) {
            var item = FORMULA_REF_ITEMS[i];
            itemsHtml += '<div class="formula-ref-item">' +
                '<strong>' + escapeHtml(item.title) + ':</strong> ' +
                '<span class="formula-expr">' + fmtMath(item.formula) + '</span>' +
                '<div class="formula-note">' + fmtMath(item.note) + '</div>' +
                '</div>';
        }
        itemsHtml += '</div>';

        if (el.tagName && el.tagName.toUpperCase() === 'DETAILS') {
            el.innerHTML = '<summary class="formul-summary">📐 Desenlerin Arkasındaki Matematik (Formül Başvurusu)</summary>' + itemsHtml;
        } else {
            el.innerHTML = '<details><summary class="formul-summary">📐 Desenlerin Arkasındaki Matematik (Formül Başvurusu)</summary>' + itemsHtml + '</details>';
        }
    }

    function renderCustomDesigner() {
        var el = $('kendi-desenini-tasarla');
        if (!el) return;
        var grid = buildGrid(state.mode);
        var selectedMap = {};
        for (var i = 0; i < state.customCells.length; i++) {
            selectedMap[state.customCells[i].row + ':' + state.customCells[i].col] = true;
        }

        var tableHtml = '<table class="desen-grid-table custom-design-table"><thead><tr><th class="desen-th">×</th>';
        for (var ci = 0; ci < grid.cols.length; ci++) {
            tableHtml += '<th class="desen-th">' + fmtSigned(grid.cols[ci]) + '</th>';
        }
        tableHtml += '</tr></thead><tbody>';
        for (var rIdx = 0; rIdx < grid.rows.length; rIdx++) {
            var rv = grid.rows[rIdx];
            tableHtml += '<tr><th class="desen-th">' + fmtSigned(rv) + '</th>';
            for (var cIdx = 0; cIdx < grid.cols.length; cIdx++) {
                var cv = grid.cols[cIdx];
                var prod = grid.matrix[rIdx][cIdx].product;
                var isOn = !!selectedMap[rv + ':' + cv];
                tableHtml += '<td class="desen-cell' + (isOn ? ' desen-cell-selected' : '') +
                    '" data-custom-r="' + rv + '" data-custom-c="' + cv + '" role="button" tabindex="0" aria-pressed="' + (isOn ? 'true' : 'false') + '">' +
                    fmtSigned(prod) + '</td>';
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';

        var analysisHtml = '';
        if (state.customAnalysis) {
            analysisHtml = '<div class="feedback-box feedback-ok">' +
                '<div>' + escapeHtml(state.customAnalysis.report) + '</div>' +
                '<div><strong>Paylaşılabilir Desen Kodu:</strong> <code>' + escapeHtml(state.customAnalysis.shareCode) + '</code></div>' +
                '</div>';
        }

        el.innerHTML =
            '<p class="module-intro">Aşağıdaki ızgaradan istediğin hücrelere tıklayıp boya, sonra kuralını sına ve arkadaşınla paylaş!</p>' +
            '<div class="custom-grid-scroll">' + tableHtml + '</div>' +
            '<div class="inline-controls">' +
            '<button type="button" class="btn btn-primary" id="btn-desen-analiz">Desenimi Analiz Et</button>' +
            '<button type="button" class="subtab-btn" id="btn-desen-temizle">Izgarayı Temizle</button>' +
            '</div>' +
            '<div id="custom-pattern-report">' + analysisHtml + '</div>' +
            '<blockquote class="closing-quote">' +
            '<p><strong>"Sıra sende: Başkasının keşfetmesi gereken bir desen tasarla."</strong></p>' +
            '<p>Matematik yalnızca doğru cevabı bulmak değildir. Henüz kimsenin fark etmediği bağlantıları fark edebilmektir.</p>' +
            '</blockquote>';

        var cells = el.querySelectorAll ? el.querySelectorAll('[data-custom-r]') : [];
        for (var k = 0; k < cells.length; k++) {
            (function (td) {
                var rV = Number(td.getAttribute('data-custom-r'));
                var cV = Number(td.getAttribute('data-custom-c'));
                var toggleCell = function () {
                    var foundIdx = -1;
                    for (var idx = 0; idx < state.customCells.length; idx++) {
                        if (state.customCells[idx].row === rV && state.customCells[idx].col === cV) {
                            foundIdx = idx;
                            break;
                        }
                    }
                    if (foundIdx >= 0) state.customCells.splice(foundIdx, 1);
                    else state.customCells.push({ row: rV, col: cV });
                    renderCustomDesigner();
                };
                td.addEventListener('click', toggleCell);
                td.addEventListener('keydown', function (ev) {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        toggleCell();
                    }
                });
            }(cells[k]));
        }

        var btnAnalyze = $('btn-desen-analiz');
        var btnClear = $('btn-desen-temizle');
        if (btnAnalyze) {
            btnAnalyze.addEventListener('click', function () {
                state.customAnalysis = analyzeCustomPattern(state.customCells, state.mode);
                renderCustomDesigner();
            });
        }
        if (btnClear) {
            btnClear.addEventListener('click', function () {
                state.customCells = [];
                state.customAnalysis = null;
                renderCustomDesigner();
            });
        }
    }

    /* ---------- Mod / Av / Alt-Sekme Geçişleri & Başlatma ---------- */

    function renderAll() {
        renderProgressAndTabs();
        renderDiscoveryStepper();
        renderGrid();
        renderMissionArea();
        renderHintDrawer();
        renderKnowledgeArea();
    }

    function setMode(mode) {
        state.mode = (mode === 'signed') ? 'signed' : 'classic';
        state.customCells = [];
        state.customAnalysis = null;
        if (state.mode === 'classic') {
            if (state.selectedCell && (state.selectedCell.row < 1 || state.selectedCell.col < 1)) {
                state.selectedCell = { row: 3, col: 7 };
            }
            if (state.jumpRow < 1) state.jumpRow = 7;
            if (state.factorTarget < 1) state.factorTarget = 24;
            if (state.rectCoords.a < 1 || state.rectCoords.c < 1 || state.rectCoords.b < 1 || state.rectCoords.d < 1) {
                state.rectCoords = { a: 2, c: 4, b: 3, d: 5 };
            }
        } else {
            if (state.huntId === 3) state.jumpRow = -2;
        }
        renderAll();
        renderCustomDesigner();
        return state.mode;
    }

    function setHunt(huntId) {
        var id = normalizeHuntId(huntId);
        state.huntId = id;
        state.stepIdx = isHuntUnlocked(id) ? 5 : 1; // FARK ET adımından başla, kuralı gizli tut!
        state.hintLevel = 0;
        if (id === 3 && state.mode === 'signed') state.jumpRow = -2;
        if (id === 3 && state.mode === 'classic') state.jumpRow = 7;
        var inp = $('tahmin-girdisi');
        if (inp) inp.value = '';
        setFeedback('warn', 'Önce ızgaraya bak, ne fark ettiğini gözlemle ve tahminini <strong>TEST ET</strong>!');
        renderAll();
        return id;
    }

    function setRectSubtab(subtab) {
        if (RECT_SUBTABS.indexOf(subtab) !== -1) {
            state.rectSubtab = subtab;
            if (subtab === '9I') state.rect9IFound = false;
            if (subtab === '9G') {
                if (state.rect9GScaleIdx === 0) {
                    renderNumberLine([{ label: '2', q: { n: 2, d: 1 } }, { label: '20', q: { n: 20, d: 1 } }], '');
                } else if (state.rect9GScaleIdx === 1) {
                    renderNumberLine([{ label: '5/2', q: { n: 5, d: 2 } }, { label: '35', q: { n: 35, d: 1 } }], '');
                } else {
                    renderNumberLine([{ label: '−2', q: { n: -2, d: 1 } }, { label: '−12', q: { n: -12, d: 1 } }, { label: '20', q: { n: 20, d: 1 } }], '');
                }
            }
            renderAll();
        }
        return state.rectSubtab;
    }

    function toggleZeroStrip() {
        if (state.mode !== 'signed') {
            state.mode = 'signed';
            state.zeroBandHighlight = true;
            setFeedback('warn', '<strong>sıfır özelliği:</strong> Mod 2 (−10…+10) açıldı. 0 satır ve sütununda her çarpım 0\'dır (yutan eleman).');
        } else {
            state.zeroBandHighlight = !state.zeroBandHighlight;
        }
        renderAll();
        renderCustomDesigner();
        return state.zeroBandHighlight;
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;
        renderProgressAndTabs();
        return state.soundEnabled;
    }

    function getState() {
        return {
            initialized: state.initialized,
            mode: state.mode,
            huntId: state.huntId,
            stepIdx: state.stepIdx,
            stepName: DISCOVERY_STEPS[state.stepIdx],
            rectSubtab: state.rectSubtab,
            unlocked: isHuntUnlocked(state.huntId),
            discoveredCount: countDiscovered(),
            soundEnabled: state.soundEnabled
        };
    }

    function init() {
        if (typeof document === 'undefined') return false;
        state.initialized = true;

        var btnK = $('btn-mod-klasik');
        var btnD = $('btn-mod-dort-bolge');
        var btnZ = $('btn-sifir-seridi');
        var btnS = $('ses-anahtari');
        var btnTest = $('btn-test-et');
        var inp = $('tahmin-girdisi');

        if (btnK && !btnK._desenBound) {
            btnK._desenBound = true;
            btnK.addEventListener('click', function () { setMode('classic'); });
        }
        if (btnD && !btnD._desenBound) {
            btnD._desenBound = true;
            btnD.addEventListener('click', function () { setMode('signed'); });
        }
        if (btnZ && !btnZ._desenBound) {
            btnZ._desenBound = true;
            btnZ.addEventListener('click', toggleZeroStrip);
        }
        if (btnS && !btnS._desenBound) {
            btnS._desenBound = true;
            btnS.addEventListener('click', toggleSound);
        }
        if (btnTest && !btnTest._desenBound) {
            btnTest._desenBound = true;
            btnTest.addEventListener('click', function () { submitPrediction(); });
        }
        if (inp && !inp._desenBound) {
            inp._desenBound = true;
            inp.addEventListener('keydown', function (ev) {
                if (ev.key === 'Enter') {
                    ev.preventDefault();
                    submitPrediction();
                }
            });
        }

        renderAll();
        renderNumberLine();
        renderFormulaReference();
        renderCustomDesigner();

        if (DersCekirdek && typeof DersCekirdek.createQuizEngine === 'function' && $('desen-sinav-alani')) {
            DersCekirdek.createQuizEngine('desen-sinav-alani', DESEN_QUIZ_QUESTIONS);
        }
        if (DersCekirdek && typeof DersCekirdek.renderPageMath === 'function' && document.body) {
            DersCekirdek.renderPageMath(document.body);
        }
        return true;
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            if (document.getElementById('desen-izgara-tablo')) {
                init();
            }
        } else if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', function () {
                if (document.getElementById('desen-izgara-tablo')) {
                    init();
                }
            });
        }
    }

    return {
        MINUS: MINUS,
        DISCOVERY_STEPS: DISCOVERY_STEPS,
        RECT_SUBTABS: RECT_SUBTABS,
        HUNTS: HUNTS,
        RECT_PRESETS: RECT_PRESETS,
        DESEN_QUIZ_QUESTIONS: DESEN_QUIZ_QUESTIONS,
        FORMULA_REF_ITEMS: FORMULA_REF_ITEMS,
        normalizeZero: normalizeZero,
        isEven: isEven,
        isOdd: isOdd,
        fmtSigned: fmtSigned,
        fmtPercentPrefix: fmtPercentPrefix,
        fmtRationalTR: fmtRationalTR,
        buildGrid: buildGrid,
        getMirrorPair: getMirrorPair,
        squareInfo: squareInfo,
        previewSqrt: previewSqrt,
        getArithmeticRow: getArithmeticRow,
        isMultiple: isMultiple,
        getDivisibilityRuleInfo: getDivisibilityRuleInfo,
        digitSumSteps: digitSumSteps,
        findFactorPairs: findFactorPairs,
        computeFrequencyMap: computeFrequencyMap,
        getFrequency: getFrequency,
        isPrime: isPrime,
        buildRectangle: buildRectangle,
        solveMissingCorner: solveMissingCorner,
        checkRectangleCandidate: checkRectangleCandidate,
        seededPRNG: seededPRNG,
        generateMissingCornerPuzzle: generateMissingCornerPuzzle,
        generateFindRectPuzzle: generateFindRectPuzzle,
        generateCounterExamplePuzzle: generateCounterExamplePuzzle,
        generateHuntChallenge: generateHuntChallenge,
        analyzeCustomPattern: analyzeCustomPattern,
        init: init,
        getState: getState,
        setMode: setMode,
        setHunt: setHunt,
        setRectSubtab: setRectSubtab,
        toggleZeroStrip: toggleZeroStrip,
        toggleSound: toggleSound,
        submitPrediction: submitPrediction,
        selectCell: selectCell,
        renderNumberLine: renderNumberLine
    };
}));
