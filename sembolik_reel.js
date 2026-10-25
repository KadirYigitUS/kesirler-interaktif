/**
 * sembolik_reel.js — Uzay İnteraktif Matematik Öğretim Sistemi
 * 8. Sınıf Ön İzleme: Gerçek Sayılar (ℝ) ve İrrasyonel Sayılar (ℚ′) için Tam Sembolik Hesaplayıcı.
 * 
 * Amaç: Float yuvarlama hataları olmadan a + b√2 ve kπ sembolik ifadelerini tam tutmak,
 * dağılma özelliğini sembolik olarak göstermek.
 * Harici CDN ve harici bağımlılık İÇERMEZ.
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SembolikReel = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    var MINUS = '\u2212';

    function gcd(a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { var t = a % b; a = b; b = t; }
        return a;
    }

    /**
     * a + b√d formundaki cebirsel reel sayıyı temsil eder (burada a ve b rasyoneldir {n, d}).
     * d varsayılan olarak 2'dir (karekök 2).
     */
    function CebirselReel(a_n, a_d, b_n, b_d, d_val) {
        this.d_val = d_val || 2; // √2

        // Sadeleştir a
        var gA = gcd(a_n, a_d) || 1;
        var sA = a_d < 0 ? -1 : 1;
        this.a_n = (a_n / gA) * sA;
        this.a_d = Math.abs(a_d / gA);

        // Sadeleştir b
        var gB = gcd(b_n, b_d) || 1;
        var sB = b_d < 0 ? -1 : 1;
        this.b_n = (b_n / gB) * sB;
        this.b_d = Math.abs(b_d / gB);
    }

    CebirselReel.prototype.toString = function () {
        var parts = [];

        // Rasyonel kısım a
        if (this.a_n !== 0) {
            var aStr = '';
            if (this.a_n < 0) aStr += MINUS;
            aStr += Math.abs(this.a_n);
            if (this.a_d !== 1) aStr += '/' + this.a_d;
            parts.push(aStr);
        }

        // İrrasyonel kısım b√d
        if (this.b_n !== 0) {
            var bStr = '';
            var isNeg = this.b_n < 0;
            var absN = Math.abs(this.b_n);

            if (parts.length > 0) {
                bStr += isNeg ? ' ' + MINUS + ' ' : ' + ';
            } else if (isNeg) {
                bStr += MINUS;
            }

            if (absN === 1 && this.b_d === 1) {
                bStr += '√' + this.d_val;
            } else if (this.b_d === 1) {
                bStr += absN + '√' + this.d_val;
            } else {
                bStr += '(' + absN + '/' + this.b_d + ')√' + this.d_val;
            }
            parts.push(bStr);
        }

        if (parts.length === 0) return '0';
        return parts.join('');
    };

    /**
     * İki CebirselReel sayının toplamı: (a1 + b1√d) + (a2 + b2√d)
     */
    function add(x, y) {
        if (x.d_val !== y.d_val) throw new Error('Farklı kök dereceleri toplanamaz');
        var a_n = x.a_n * y.a_d + y.a_n * x.a_d;
        var a_d = x.a_d * y.a_d;
        var b_n = x.b_n * y.b_d + y.b_n * x.b_d;
        var b_d = x.b_d * y.b_d;
        return new CebirselReel(a_n, a_d, b_n, b_d, x.d_val);
    }

    /**
     * İki CebirselReel sayının çarpımı (Dağılma Özelliği):
     * (a1 + b1√d) * (a2 + b2√d) = (a1*a2 + b1*b2*d) + (a1*b2 + a2*b1)√d
     */
    function mul(x, y) {
        if (x.d_val !== y.d_val) throw new Error('Farklı kök dereceleri çarpılamaz');
        var d = x.d_val;

        // a1 * a2
        var a1a2_n = x.a_n * y.a_n, a1a2_d = x.a_d * y.a_d;
        // b1 * b2 * d
        var b1b2d_n = x.b_n * y.b_n * d, b1b2d_d = x.b_d * y.b_d;

        // Yeni a = a1*a2 + b1*b2*d
        var new_a_n = a1a2_n * b1b2d_d + b1b2d_n * a1a2_d;
        var new_a_d = a1a2_d * b1b2d_d;

        // a1 * b2
        var a1b2_n = x.a_n * y.b_n, a1b2_d = x.a_d * y.b_d;
        // a2 * b1
        var a2b1_n = y.a_n * x.b_n, a2b1_d = y.a_d * x.b_d;

        // Yeni b = a1*b2 + a2*b1
        var new_b_n = a1b2_n * a2b1_d + a2b1_n * a1b2_d;
        var new_b_d = a1b2_d * a2b1_d;

        return new CebirselReel(new_a_n, new_a_d, new_b_n, new_b_d, d);
    }

    /**
     * Tam sayı veya rasyonel sayıdan CebirselReel üretir
     */
    function fromRational(n, d) {
        return new CebirselReel(n, d || 1, 0, 1, 2);
    }

    /**
     * Saf k√d üretir
     */
    function fromRoot(k_n, k_d, d_val) {
        return new CebirselReel(0, 1, k_n, k_d || 1, d_val || 2);
    }

    return {
        MINUS: MINUS,
        CebirselReel: CebirselReel,
        add: add,
        mul: mul,
        fromRational: fromRational,
        fromRoot: fromRoot
    };
}));
