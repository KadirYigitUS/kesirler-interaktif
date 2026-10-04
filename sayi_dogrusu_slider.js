/*!
 * sayi_dogrusu_slider.js — kaydırıcılı basit sayı doğrusu araçları için ortak çizim/mantık.
 * numberline_simple.html ve numberline_x.html tarafından kullanılır.
 * Pay: −50 … +50 (negatif olabilir). Payda: 1 … 12 (işaret paya taşınmıştır).
 * Çizilen aralık değere göre otomatik uyarlanır ve her zaman [−50, +50] içinde kalır.
 */
(function (root) {
    'use strict';
    var R = root.Rasyonel, MINUS = R.MINUS;
    var F = '"Segoe UI", Tahoma, Arial, sans-serif';

    function init(cfg) {
        var $ = function (id) { return id ? document.getElementById(id) : null; };
        var canvas = $(cfg.canvas), ctx = canvas.getContext('2d');
        var numS = $(cfg.numSlider), denS = $(cfg.denSlider);
        var full = false;
        var W = canvas.width, H = canvas.height;
        var dpr = Math.max(1, Math.min(3, root.devicePixelRatio || 1));
        canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        canvas.style.maxWidth = '100%'; canvas.style.height = 'auto';
        function set(id, t) { var e = $(id); if (e) e.textContent = t; }
        function sg(v) { return v < 0 ? MINUS + Math.abs(v) : String(v); }

        function draw() {
            var n = parseInt(numS.value, 10), d = parseInt(denS.value, 10);
            var q = R.make(n, d), v = R.toNumber(q);
            // görünüm
            var lo = Math.floor(Math.min(v, 0)) - 1, hi = Math.ceil(Math.max(v, 0)) + 1;
            if (hi - lo < 4) { var c = (lo + hi) / 2; lo = Math.floor(c - 2); hi = lo + 4; }
            if (full) { lo = R.MIN; hi = R.MAX; }
            lo = Math.max(lo, R.MIN); hi = Math.min(hi, R.MAX);
            ctx.clearRect(0, 0, W, H);
            var P = 50, Y = Math.round(H * 0.5), ppu = (W - 2 * P) / (hi - lo);
            function X(x) { return P + (x - lo) * ppu; }
            // bölge zemini
            var zx = X(0);
            ctx.fillStyle = 'rgba(231,76,60,0.07)'; ctx.fillRect(P, Y - 55, Math.max(0, Math.min(zx, W - P) - P), 110);
            ctx.fillStyle = 'rgba(46,204,113,0.08)'; ctx.fillRect(Math.max(zx, P), Y - 55, Math.max(0, W - P - Math.max(zx, P)), 110);
            // çizgi
            ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(P, Y); ctx.lineTo(W - P, Y); ctx.stroke();
            ctx.fillStyle = '#2c3e50';
            ctx.beginPath(); ctx.moveTo(W - P, Y); ctx.lineTo(W - P - 15, Y - 10); ctx.lineTo(W - P - 15, Y + 10); ctx.fill();
            ctx.beginPath(); ctx.moveTo(P, Y); ctx.lineTo(P + 15, Y - 10); ctx.lineTo(P + 15, Y + 10); ctx.fill();
            // payda bölümleri
            if (d > 1 && ppu / d >= 6) {
                ctx.strokeStyle = '#16a085'; ctx.lineWidth = 1.5;
                for (var s = Math.ceil(lo * d); s <= Math.floor(hi * d); s++) {
                    if (s % d === 0) continue;
                    var sx = X(s / d); ctx.beginPath(); ctx.moveTo(sx, Y - 10); ctx.lineTo(sx, Y + 10); ctx.stroke();
                }
            }
            // tam sayılar
            var step = Math.max(1, R.niceStep(52 / ppu));
            ctx.textAlign = 'center';
            for (var k = Math.ceil(lo / step); k <= Math.floor(hi / step); k++) {
                var val = k * step, x = X(val);
                ctx.strokeStyle = val === 0 ? '#c0392b' : '#2c3e50'; ctx.lineWidth = val === 0 ? 4 : 3;
                ctx.beginPath(); ctx.moveTo(x, Y - 20); ctx.lineTo(x, Y + 20); ctx.stroke();
                ctx.font = 'bold 17px ' + F; ctx.fillStyle = val === 0 ? '#c0392b' : (val < 0 ? '#a93226' : '#1e8449');
                ctx.fillText(sg(val), x, Y + 45);
            }
            if (lo <= R.MIN) { ctx.fillStyle = '#c0392b'; ctx.font = 'bold 11px ' + F; ctx.textAlign = 'left'; ctx.fillText('sınır −50', P + 2, Y - 60); }
            if (hi >= R.MAX) { ctx.fillStyle = '#27ae60'; ctx.font = 'bold 11px ' + F; ctx.textAlign = 'right'; ctx.fillText('sınır +50', W - P - 2, Y - 60); }
            // 0 ile sayı arası renkli alan (işaretli)
            var px = X(v);
            ctx.fillStyle = v < 0 ? 'rgba(231,76,60,0.30)' : 'rgba(9,132,227,0.30)';
            ctx.fillRect(Math.min(zx, px), Y - 15, Math.abs(px - zx), 30);
            // nokta
            ctx.beginPath(); ctx.arc(px, Y, 14, 0, 7); ctx.fillStyle = '#e74c3c'; ctx.fill();
            ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 3; ctx.stroke();
            ctx.textAlign = 'center'; ctx.font = 'bold 19px ' + F; ctx.fillStyle = '#e74c3c';
            ctx.fillText(R.fmt(q), px, Y - 36);
            ctx.font = '13px ' + F; ctx.fillStyle = '#666';
            ctx.fillText('≈ ' + R.decimalStr(q, 4).replace(/\.\.\.$/, ''), px, Y + 70);
            // |x| göstergesi
            if (v !== 0) {
                ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 2.5;
                var by = Y + 90;
                if (by < H - 6) {
                    ctx.beginPath(); ctx.moveTo(zx, by); ctx.lineTo(px, by); ctx.moveTo(zx, by - 5); ctx.lineTo(zx, by + 5); ctx.moveTo(px, by - 5); ctx.lineTo(px, by + 5); ctx.stroke();
                }
            }

            // Metinsel çıktılar
            set(cfg.numVal, sg(n)); set(cfg.denVal, String(d));
            set(cfg.bigNum, sg(n)); set(cfg.bigDen, String(d));
            set(cfg.decimal, R.decimalStr(q));
            set(cfg.percent, R.percentStr(q).replace(/^(\u2212?)(.*)%$/, '$1%$2'));
            set(cfg.whole, sg(Math.trunc(v)));
            var lo2 = R.floor(q), hi2 = R.ceil(q);
            var pos = n === 0 ? '0 (başlangıç noktası)' : R.isInt(q) ? sg(n / d) + ' (tam sayı)' : sg(lo2) + ' ile ' + sg(hi2) + ' arası';
            set(cfg.position, pos);
            var badge = $(cfg.typeBadge);
            if (badge) {
                var bas = Math.abs(n) < d;
                badge.textContent = (n < 0 ? 'Negatif ' : '') + (bas ? 'Basit Kesir' : 'Bileşik Kesir');
                badge.className = 'type-badge ' + (bas && n >= 0 ? 'type-basit' : 'type-bilesik');
            }
            var info = $(cfg.infoText);
            if (info) info.innerHTML = R.describe(q).map(function (l) { return l; }).join(' ') +
                (n < 0 ? ' <br><em>Negatif rasyonel sayılar sayı doğrusunda 0\'ın soluna yerleşir; |' + R.fmt(q, true) + '| = ' + R.fmt(R.abs(q), true) + ' birim uzaklıktadır.</em>' : '');
            canvas.setAttribute('aria-label', 'Sayı doğrusu: ' + R.fmt(q) + ' sayısı gösteriliyor');
        }

        root.setFraction = function (n, d) { numS.value = n; denS.value = d; draw(); };
        root.toggleFullLine = function (btn) { full = !full; if (btn) btn.textContent = full ? '🔎 Sayıya uyarla' : '↔ Tüm doğru (−50 … +50)'; draw(); };
        numS.addEventListener('input', draw); denS.addEventListener('input', draw);
        draw();
        return { draw: draw };
    }
    root.SliderNumberLine = { init: init };
}(window));
