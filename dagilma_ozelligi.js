/**
 * dagilma_ozelligi.js — Uzay 7. Sınıf Dağılma Özelliği Keşif Atölyesi Mantık Motoru
 * Zenginleştirilmiş Soru Bankası (8 Soru: Alan modeli, İşaret kuralları, Rasyonel, Eksi parantez, Bölme tuzağı)
 */

(function () {
    'use strict';

    var MINUS = '\u2212';

    // 1. 3 Kademeli Zenginleştirilmiş Soru Bankası (8 Soru)
    var DAGILMA_QUESTIONS = [
        {
            id: 'd1',
            level: 1,
            targetSet: 'N_PLUS',
            question: 'Bir bahçenin bir kenarı $4$ metredir. Diğer kenarı ise $5$ metre elma ve $3$ metre armut ağaçları için ayrılmıştır. Bahçenin toplam alanını <b>çarpma işleminin toplama üzerine dağılma özelliği</b> ile gösteren ifade hangisidir?',
            options: [
                'A) $4 \\cdot (5 + 3) = 4 \\cdot 5 + 4 \\cdot 3$',
                'B) $4 + (5 \\cdot 3) = (4 + 5) \\cdot (4 + 3)$',
                'C) $4 \\cdot (5 \\cdot 3) = (4 \\cdot 5) \\cdot 3$',
                'D) $4 \\cdot (5 − 3) = 4 \\cdot 5 − 3$'
            ],
            correct: 0,
            explanation: 'Alan formülü: $a \\cdot (b + c) = a \\cdot b + a \\cdot c$\'dir. Burada $4 \\cdot (5 + 3) = 4 \\cdot 5 + 4 \\cdot 3 = 20 + 12 = 32$ m² olur.'
        },
        {
            id: 'd2',
            level: 1,
            targetSet: 'N',
            question: '$6 \\cdot (10 + 2)$ işlemini dağılma özelliğini kullanarak zihinden hesaplamak isteyen bir öğrencinin yazması gereken işlem hangisidir?',
            options: [
                'A) $60 + 12 = 72$',
                'B) $60 + 2 = 62$',
                'C) $16 + 12 = 28$',
                'D) $60 \\cdot 12 = 720$'
            ],
            correct: 0,
            explanation: '$6 \\cdot (10 + 2) = (6 \\cdot 10) + (6 \\cdot 2) = 60 + 12 = 72$. Çarpma işlemini parçalara ayırarak zihinden kolayca yapabiliriz!'
        },
        {
            id: 'd3',
            level: 2,
            targetSet: 'Z',
            question: '$(−3) \\cdot (4 − 7)$ işleminin sonucu dağılma özelliği kullanılarak hesaplandığında aşağıdakilerden hangisi elde edilir?',
            options: [
                'A) $−12 − 21 = −33$',
                'B) $−12 − (−21) = −12 + 21 = +9$',
                'C) $−12 + (−21) = −33$',
                'D) $+12 − 21 = −9$'
            ],
            correct: 1,
            explanation: '$(−3)$ sayısını parantezin içindeki her terime dağıtırız:<br>' +
                         '$(−3) \\cdot 4 − [(−3) \\cdot 7] = −12 − (−21) = −12 + 21 = +9$.<br>' +
                         '⚠️ İşaret kuralı: Negatif ile negatifin çarpımı pozitif $+21$ yapar!'
        },
        {
            id: 'd4',
            level: 2,
            targetSet: 'Z',
            question: '$(−5) \\cdot [x + (−2)]$ ifadesinin dağılma özelliği uygulanmış biçimi aşağıdakilerden hangisidir?',
            options: [
                'A) $−5x − 10$',
                'B) $−5x + 10$',
                'C) $5x + 10$',
                'D) $−5x + (−2)$'
            ],
            correct: 1,
            explanation: '$(−5) \\cdot x + (−5) \\cdot (−2) = −5x + (+10) = −5x + 10$. Eksi ile eksinin çarpımı artıdır!'
        },
        {
            id: 'd5',
            level: 2,
            targetSet: 'Q',
            question: '<b>MEB 7. Sınıf Ders Kitabı Örneği:</b><br>$\\frac{4}{5} \\cdot \\left[\\frac{5}{6} + (−2)\\right]$ işleminde dağılma özelliği uygulandığında birinci terim $\\frac{4}{5} \\cdot \\frac{5}{6} = \\frac{2}{3}$ olduğuna göre, <b>ikinci terim ve sonuç</b> nedir?',
            options: [
                'A) İkinci terim: $−\\frac{8}{5}$, Sonuç: $−\\frac{14}{15}$',
                'B) İkinci terim: $+\\frac{8}{5}$, Sonuç: $+\\frac{34}{15}$',
                'C) İkinci terim: $−2$, Sonuç: $−\\frac{4}{3}$',
                'D) İkinci terim: $−\\frac{4}{5}$, Sonuç: $−\\frac{2}{15}$'
            ],
            correct: 0,
            explanation: 'İkinci terim: $\\frac{4}{5} \\cdot (−2) = −\\frac{8}{5}$.<br>' +
                         'Toplarsak: $\\frac{2}{3} + \\left(−\\frac{8}{5}\\right) = \\frac{10}{15} − \\frac{24}{15} = −\\frac{14}{15}$.<br>' +
                         'Parantez içinden yapsak da: $\\frac{5}{6} − \\frac{12}{6} = −\\frac{7}{6}$ ve $\\frac{4}{5} \\cdot \\left(−\\frac{7}{6}\\right) = −\\frac{28}{30} = −\\frac{14}{15}$. Sonuçlar tamamen eşittir!'
        },
        {
            id: 'd6',
            level: 3,
            targetSet: 'Z',
            question: '<b>Kavram Yanılgısı Kırıcı (Bölme Soldan Dağılır mı?):</b><br>$12 \\div (2 + 4)$ işlemini dağıtmaya kalkıp $12 \\div 2 + 12 \\div 4 = 6 + 3 = 9$ bulan bir öğrenci için aşağıdakilerden hangisi söylenebilir?',
            options: [
                'A) Doğru yapmıştır, bölme işlemi daima dağılır.',
                'B) Yanlış yapmıştır! Bölünen sayı solda ise bölme parantez üzerine ASLA dağılmaz; $12 \\div (2+4) = 12 \\div 6 = 2$\'dir ($2 \\neq 9$).',
                'C) Yalnızca sayılar rasyonel olduğunda dağılma yapılabilir.',
                'D) Sayıları ters çevirip toplamalıydı.'
            ],
            correct: 1,
            explanation: '🚨 <b>Önemli Dikkat Noktası:</b> Bölünen sayı solda olduğunda bölme işlemi dağılmaz! $12 \\div 6 = 2$\'dir, fakat $12\\div 2 + 12\\div 4 = 9$\'dur ($2 \\neq 9$). Bölme işlemi sadece bölen sağda ise ve paylaştırılıyorsa dağılır: $(b+c)/a = b/a + c/a$.'
        },
        {
            id: 'd7',
            level: 3,
            targetSet: 'Z',
            question: '<b>MEB 7. Sınıf Cebirsel Tuzak (DİKKAT Kutusu):</b><br>$2x − (x − 1)$ ifadesinin en sade eşiti aşağıdakilerden hangisidir?',
            options: [
                'A) $x − 1$',
                'B) $3x − 1$',
                'C) $x + 1$',
                'D) $2x$'
            ],
            correct: 2,
            explanation: 'Parantez önündeki eksi işareti, içeriye $−1$ katsayısının dağıtılması anlamına gelir:<br>' +
                         '$2x − (x − 1) = 2x − 1 \\cdot (x − 1) = 2x − 1 \\cdot x − 1 \\cdot (−1) = 2x − x + 1 = x + 1$.<br>' +
                         '⚠️ Eksi ile eksinin çarpımı $+1$ olur!'
        },
        {
            id: 'd8',
            level: 3,
            targetSet: 'Q',
            question: '<b>Zihinden Kolay Hesaplama:</b><br>$99 \\times 15$ işlemini dağılma özelliğini kullanarak en pratik şekilde yapmak isteyen biri aşağıdaki hangi yolu izlemelidir?',
            options: [
                'A) $(100 − 1) \\times 15 = 1500 − 15 = 1485$',
                'B) $(90 + 9) \\times 15 = 1350 + 135 = 1485$',
                'C) $(100 + 1) \\times 15 = 1500 + 15 = 1515$',
                'D) $(100 − 10) \\times 15 = 1500 − 150 = 1350$'
            ],
            correct: 0,
            explanation: '99 sayısını $100 − 1$ şeklinde yazmak en hızlı zihinden hesaplama stratejisidir: $(100 − 1) \\times 15 = 1500 − 15 = 1485$.'
        }
    ];

    function fmtVal(n) {
        if (typeof DersCekirdek !== 'undefined' && DersCekirdek.fmtTR) {
            return DersCekirdek.fmtTR(n);
        }
        return (n < 0 ? MINUS + Math.abs(n) : String(n)).replace(/\./g, ',');
    }

    function wrapNeg(n) {
        var s = fmtVal(n);
        return n < 0 ? '(' + s + ')' : s;
    }

    // Dinamik Alan Modeli Hesaplayıcı
    function updateAreaModel() {
        var inpA = document.getElementById('slider-a');
        var inpB = document.getElementById('slider-b');
        var inpC = document.getElementById('slider-c');
        if (!inpA || !inpB || !inpC) return;

        var a = parseInt(inpA.value, 10);
        if (isNaN(a)) a = 3;
        var b = parseInt(inpB.value, 10);
        if (isNaN(b)) b = 4;
        var c = parseInt(inpC.value, 10);
        if (isNaN(c)) c = 2;

        document.getElementById('val-a').textContent = fmtVal(a);
        document.getElementById('val-b').textContent = fmtVal(b);
        document.getElementById('val-c').textContent = fmtVal(c);

        var area1 = a * b;
        var area2 = a * c;
        var totalArea = a * (b + c);

        var rect1 = document.getElementById('rect-part1');
        var rect2 = document.getElementById('rect-part2');

        if (rect1 && rect2) {
            rect1.style.flex = Math.max(1, Math.abs(b));
            rect2.style.flex = Math.max(1, Math.abs(c));
            rect1.classList.toggle('rect-part-neg', area1 < 0);
            rect1.classList.toggle('rect-part-zero', b === 0 || area1 === 0);
            rect2.classList.toggle('rect-part-neg', area2 < 0);
            rect2.classList.toggle('rect-part-zero', c === 0 || area2 === 0);
            rect1.innerHTML = '<b>' + wrapNeg(a) + ' × ' + wrapNeg(b) + ' = ' + fmtVal(area1) + '</b>';
            rect2.innerHTML = '<b>' + wrapNeg(a) + ' × ' + wrapNeg(c) + ' = ' + fmtVal(area2) + '</b>';
        }

        var mathCalc = document.getElementById('area-math-calc');
        if (mathCalc) {
            mathCalc.innerHTML = '<b>Sol Yol (Parantez İçi):</b> ' + wrapNeg(a) + ' × (' + fmtVal(b) + ' + ' + wrapNeg(c) + ') = ' + wrapNeg(a) + ' × ' + wrapNeg(b + c) + ' = <span class="highlight">' + fmtVal(totalArea) + '</span><br>' +
                                 '<b>Sağ Yol (Dağılma):</b> (' + wrapNeg(a) + ' × ' + wrapNeg(b) + ') + (' + wrapNeg(a) + ' × ' + wrapNeg(c) + ') = ' + fmtVal(area1) + ' + ' + wrapNeg(area2) + ' = <span class="highlight">' + fmtVal(area1 + area2) + '</span><br>' +
                                 '🎉 <i>İki yol da tıpatıp aynı alanı verir!</i>';
        }
    }

    // Zihinden Kolay Çarpma Simülatörü
    function runMentalSim() {
        var inp = document.getElementById('mental-mult');
        if (!inp) return;
        var n = parseInt(inp.value, 10);
        if (isNaN(n)) n = 7;
        var out = document.getElementById('mental-out');
        if (!out) return;

        var step1 = 100 * n;
        var step2 = 1 * n;
        var res = step1 - step2;

        out.innerHTML = '<b>99 × ' + wrapNeg(n) + ' işlemini zihinden yapalım:</b><br>' +
                        '99 yerine (100 ' + MINUS + ' 1) yazalım: (100 ' + MINUS + ' 1) × ' + wrapNeg(n) + '<br>' +
                        '= 100 × ' + wrapNeg(n) + ' ' + MINUS + ' 1 × ' + wrapNeg(n) + '<br>' +
                        '= ' + fmtVal(step1) + ' ' + MINUS + ' ' + wrapNeg(step2) + ' = <b>' + fmtVal(res) + '</b> 🎯';
    }

    // Sayfa Yüklendiğinde Başlat
    document.addEventListener('DOMContentLoaded', function () {
        ['slider-a', 'slider-b', 'slider-c'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('input', updateAreaModel);
        });
        updateAreaModel();

        var mInp = document.getElementById('mental-mult');
        if (mInp) {
            mInp.addEventListener('input', runMentalSim);
            runMentalSim();
        }

        if (typeof DersCekirdek !== 'undefined') {
            DersCekirdek.createQuizEngine('dagilma-quiz-container', DAGILMA_QUESTIONS);
        }
    });

})();
