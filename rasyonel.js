/*!
 * rasyonel.js — Kesirler İnteraktif için ortak rasyonel sayı çekirdeği
 *
 * Tasarım ilkeleri (7. Sınıf Matematik Ders Kitabı, 1. Tema: Sayılar ve Nicelikler):
 *  I1  Normal biçim: payda > 0, işaret payda taşınır  (-3/5 = 3/-5 = -(3/5)).
 *  I2  Payda 0 ASLA kabul edilmez (sessizce 1'e çevrilmez).
 *  I3  Boş / geçersiz girdi "0" sayılmaz; null döner ve arayüz uyarı verir.
 *  I4  Sayı doğrusu tanım aralığı: [-50, +50].
 *  I5  Karşılaştırma çapraz çarpımla yapılır (ondalık eşitliği yok): a/b < c/d  <=>  a*d < c*b  (b,d>0).
 *  I6  Mutlak değer = sayının 0'a (başlangıç noktasına) uzaklığı.
 *
 * Tarayıcıda global `Rasyonel`, Node'da module.exports olarak kullanılır.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.Rasyonel = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var MIN = -50, MAX = 50;
    var MINUS = '\u2212'; // gerçek eksi işareti (−)

    function gcd(a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { var t = a % b; a = b; b = t; }
        return a;
    }
    function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

    /** Rasyonel sayı oluştur: {n, d}, d>0. Payda 0 ise RangeError. */
    function make(n, d) {
        if (d === undefined) d = 1;
        if (!Number.isInteger(n) || !Number.isInteger(d)) throw new TypeError('Pay ve payda tam sayı olmalı');
        if (d === 0) throw new RangeError('Payda 0 olamaz');
        if (d < 0) { n = -n; d = -d; }
        if (n === 0) n = 0; // -0 temizle
        return { n: n, d: d };
    }
    function simplify(q) {
        var g = gcd(q.n, q.d) || 1;
        return make(q.n / g, q.d / g);
    }
    function add(a, b) { var L = lcm(a.d, b.d); return make(a.n * (L / a.d) + b.n * (L / b.d), L); }
    function neg(a) { return make(-a.n, a.d); }
    function sub(a, b) { return add(a, neg(b)); }
    function mul(a, b) { return make(a.n * b.n, a.d * b.d); }
    /** a ÷ b; b = 0 ise RangeError (0'a bölme tanımsız). */
    function div(a, b) {
        if (b.n === 0) throw new RangeError('0\'a bölünemez');
        return make(a.n * b.d, a.d * b.n);
    }
    function abs(a) { return make(Math.abs(a.n), a.d); }
    function cmp(a, b) { var l = a.n * b.d, r = b.n * a.d; return l < r ? -1 : l > r ? 1 : 0; }
    function eq(a, b) { return cmp(a, b) === 0; }
    function sign(a) { return a.n > 0 ? 1 : a.n < 0 ? -1 : 0; }
    function isInt(a) { return a.n % a.d === 0; }
    function toNumber(a) { return a.n / a.d; }
    function floor(a) { return Math.floor(a.n / a.d); }   // -7/3 -> -3
    function ceil(a) { return Math.ceil(a.n / a.d); }     // -7/3 -> -2
    function inRange(a, lo, hi) { lo = lo === undefined ? MIN : lo; hi = hi === undefined ? MAX : hi; return toNumber(a) >= lo && toNumber(a) <= hi; }

    /** "−3/4", tam sayıysa "−3". simp=true ise önce sadeleştirir. */
    function fmt(q, simp) {
        if (simp) q = simplify(q);
        var s = q.n < 0 ? MINUS : '';
        var n = Math.abs(q.n);
        return q.d === 1 ? s + n : s + n + '/' + q.d;
    }
    /** Girdi gibi göster: pay işaretli, payda olduğu gibi (örn. 3/-4 girildiyse "−3/4" olur — normal biçim). */
    function fmtPlain(n, d) { return fmt(make(n, d)); }

    /** Tam sayılı kesir: -7/3 -> {sign:-1, whole:2, n:1, d:3}  =>  "−2 1/3" */
    function mixed(q) {
        q = simplify(q);
        var s = sign(q), an = Math.abs(q.n);
        return { sign: s, whole: Math.floor(an / q.d), n: an % q.d, d: q.d };
    }
    function fmtMixed(q) {
        var m = mixed(q), s = m.sign < 0 ? MINUS : '';
        if (m.n === 0) return s + m.whole;
        if (m.whole === 0) return s + m.n + '/' + m.d;
        return s + m.whole + ' ' + m.n + '/' + m.d;
    }

    /** Tam bölme ile ondalık açılım; devreden kısım parantezle: 1/3 -> "0,(3)", -7/6 -> "−1,1(6)". */
    function decimalStr(q, maxDigits) {
        maxDigits = maxDigits || 12;
        var s = q.n < 0 ? MINUS : '';
        var n = Math.abs(q.n), d = q.d;
        var whole = Math.floor(n / d), rem = n % d;
        if (rem === 0) return s + whole;
        var digits = [], seen = {}, rep = -1;
        while (rem !== 0 && digits.length < maxDigits) {
            if (seen[rem] !== undefined) { rep = seen[rem]; break; }
            seen[rem] = digits.length;
            rem *= 10;
            digits.push(Math.floor(rem / d));
            rem = rem % d;
        }
        var out;
        if (rep >= 0) out = digits.slice(0, rep).join('') + '(' + digits.slice(rep).join('') + ')';
        else out = digits.join('') + (rem !== 0 ? '…' : '');
        return s + whole + ',' + out;
    }
    function percentStr(q) { return decimalStr(mul(q, make(100, 1)), 8) + '%'; }

    /**
     * Metin -> rasyonel. Kabul: "-3/4", "3/-4", "−3/4", "-1,5", "1.5", "2", "-2 1/3". Hatalıysa null.
     */
    function parse(str) {
        if (typeof str !== 'string') return null;
        var t = str.trim().replace(/\u2212/g, '-').replace(/\s+/g, ' ');
        var m;
        if ((m = t.match(/^(-?)(\d+) (\d+)\/(\d+)$/))) {          // tam sayılı
            var d0 = parseInt(m[4], 10); if (d0 === 0) return null;
            var v = make(parseInt(m[2], 10) * d0 + parseInt(m[3], 10), d0);
            return m[1] ? neg(v) : v;
        }
        if ((m = t.match(/^(-?\d+)\/(-?\d+)$/))) {
            var d1 = parseInt(m[2], 10); if (d1 === 0) return null;
            return make(parseInt(m[1], 10), d1);
        }
        if ((m = t.match(/^(-?)(\d+)(?:[.,](\d+))?$/))) {
            var frac = m[3] || '';
            var den = Math.pow(10, frac.length);
            var num = parseInt(m[2] + frac, 10);
            return make(m[1] ? -num : num, den);
        }
        return null;
    }

    /** <input> değerini tam sayı olarak oku; boş/ondalık ise null (I3). */
    function readInt(el) {
        var v = typeof el === 'string' ? el : el.value;
        if (v === '' || v === null || v === undefined) return null;
        var x = Number(v);
        return Number.isInteger(x) ? x : null;
    }

    /**
     * Payda kutusunda ok tuşları 1 → 0 → -1 geçerken 0'ı atlat (I2).
     * Kullanım: Rasyonel.skipZero(inputEl)  (bir kez bağlanır)
     */
    function skipZero(el) {
        var prev = el.value === '' ? 1 : Number(el.value);
        el.addEventListener('input', function (e) {
            var cur = el.value === '' ? null : Number(el.value);
            // Yazılan karakterler (insertText, silme, yapıştırma…) InputEvent+inputType taşır; ok tuşu/spinner taşımaz.
            var typed = !!(e && e.inputType && e.inputType !== 'insertReplacementText');
            if (!typed && cur === 0 && (prev === 1 || prev === -1)) {
                el.value = String(-prev); // 1 → 0 → -1,  -1 → 0 → 1
                cur = -prev;
            }
            if (cur !== null && cur !== 0) prev = cur;
        }, true);
    }

    /** "Güzel" adım: 1, 2, 5 × 10^k (raw'dan küçük olmayan en yakın). */
    function niceStep(raw) {
        var p = Math.pow(10, Math.floor(Math.log10(raw)));
        var f = raw / p;
        var m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
        return m * p;
    }

    /** Sayı doğrusundaki konumu Türkçe anlatan, işaretle uyumlu metin. */
    function describe(q) {
        var s = simplify(q), a = abs(s);
        var lines = [];
        var name = fmt(s);
        if (s.n === 0) return ['0 sayısı pozitif de negatif de değildir; sayı doğrusunda başlangıç noktasıdır.'];
        lines.push(name + (s.n > 0 ? ' pozitif (0\'ın sağında)' : ' negatif (0\'ın solunda)') + ' bir rasyonel sayıdır.');
        if (isInt(s)) lines.push(name + ' aynı zamanda bir tam sayıdır (paydası 1\'e eşitlenebilir).');
        else {
            var lo = floor(s), hi = ceil(s);
            var dl = sub(s, make(lo, 1)), dh = sub(make(hi, 1), s);
            var near = cmp(dl, dh) < 0 ? lo : cmp(dl, dh) > 0 ? hi : null;
            var mm = (lo < 0 ? MINUS + Math.abs(lo) : lo), hh = (hi < 0 ? MINUS + Math.abs(hi) : hi);
            lines.push(name + ', ' + mm + ' ile ' + hh + ' arasındadır' +
                (near === null ? ' ve ikisine de eşit uzaklıktadır.' : '; ' + (near < 0 ? MINUS + Math.abs(near) : near) + '\'e daha yakındır.'));
        }
        lines.push('Mutlak değeri |' + name + '| = ' + fmt(a) + ' (0\'a uzaklığı). Karşıtı (zıt işaretlisi) ' + fmt(neg(s)) + ' sayısıdır.');
        return lines;
    }

    return {
        MIN: MIN, MAX: MAX, MINUS: MINUS,
        gcd: gcd, lcm: lcm, make: make, simplify: simplify,
        add: add, sub: sub, mul: mul, div: div, neg: neg, abs: abs,
        cmp: cmp, eq: eq, sign: sign, isInt: isInt, toNumber: toNumber,
        floor: floor, ceil: ceil, inRange: inRange,
        fmt: fmt, fmtPlain: fmtPlain, mixed: mixed, fmtMixed: fmtMixed,
        decimalStr: decimalStr, percentStr: percentStr,
        parse: parse, readInt: readInt, skipZero: skipZero, niceStep: niceStep, describe: describe
    };
}));
