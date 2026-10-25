/**
 * dagilma_ozelligi.js — Uzay 7. Sınıf Dağılma Özelliği Keşif Atölyesi Mantık Motoru
 */

(function () {
    'use strict';

    // 1. 3 Kademeli Dağılma Sınavı Soruları
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
                'D) $4 \\cdot (5 - 3) = 4 \\cdot 5 - 3$'
            ],
            correct: 0,
            explanation: 'Alan formülü: $a \\cdot (b + c) = a \\cdot b + a \\cdot c$\'dir. Burada $4 \\cdot (5 + 3) = 4 \\cdot 5 + 4 \\cdot 3 = 20 + 12 = 32$ m² olur.'
        },
        {
            id: 'd2',
            level: 2,
            targetSet: 'Z',
            question: '$-3 \\cdot (4 - 7)$ işleminin sonucu dağılma özelliği kullanılarak hesaplandığında aşağıdakilerden hangisi elde edilir?',
            options: [
                'A) $-12 - 21 = -33$',
                'B) $-12 - (-21) = -12 + 21 = +9$',
                'C) $-12 + (-21) = -33$',
                'D) $+12 - 21 = -9$'
            ],
            correct: 1,
            explanation: '$-3$ sayısını parantezin içindeki her terime dağıtırız:<br>' +
                         '$-3 \\cdot 4 - (-3 \\cdot 7) = -12 - (-21) = -12 + 21 = +9$.<br>' +
                         '⚠️ İşaret kuralı: Negatif ile negatifin çarpımı pozitif $+21$ yapar!'
        },
        {
            id: 'd3',
            level: 2,
            targetSet: 'Q',
            question: '<b>MEB 7. Sınıf Ders Kitabı Örneği:</b><br>$\\frac{4}{5} \\cdot \\left[\\frac{5}{6} + (-2)\\right]$ işleminde dağılma özelliği uygulandığında birinci terim $\\frac{4}{5} \\cdot \\frac{5}{6} = \\frac{2}{3}$ olduğuna göre, <b>ikinci terim ve sonuç</b> nedir?',
            options: [
                'A) İkinci terim: $-\\frac{8}{5}$, Sonuç: $-\\frac{14}{15}$',
                'B) İkinci terim: $+\\frac{8}{5}$, Sonuç: $+\\frac{34}{15}$',
                'C) İkinci terim: $-2$, Sonuç: $-\\frac{4}{3}$',
                'D) İkinci terim: $-\\frac{4}{5}$, Sonuç: $-\\frac{2}{15}$'
            ],
            correct: 0,
            explanation: 'İkinci terim: $\\frac{4}{5} \\cdot (-2) = -\\frac{8}{5}$.<br>' +
                         'Toplarsak: $\\frac{2}{3} + \\left(-\\frac{8}{5}\\right) = \\frac{10}{15} - \\frac{24}{15} = -\\frac{14}{15}$.<br>' +
                         'Parantez içinden yapsak da: $\\frac{5}{6} - \\frac{12}{6} = -\\frac{7}{6}$ ve $\\frac{4}{5} \\cdot \\left(-\\frac{7}{6}\\right) = -\\frac{28}{30} = -\\frac{14}{15}$. Sonuçlar tamamen eşittir!'
        },
        {
            id: 'd4',
            level: 3,
            targetSet: 'Z',
            question: '<b>Kavram Yanılgısı Kırıcı (Bölme Dağılır mı?):</b><br>$12 \\div (2 + 4)$ işlemini "dağıtarak" $12 \\div 2 + 12 \\div 4 = 6 + 3 = 9$ bulan bir öğrenci için aşağıdakilerden hangisi söylenebilir?',
            options: [
                'A) Doğru yapmıştır, bölme işlemi daima dağılır.',
                'B) Yanlış yapmıştır! Bölme işlemi SOLDAN parantez üzerine ASLA dağılmaz; $12 \\div (2+4) = 12 \\div 6 = 2$\'dir.',
                'C) Sadece sayılar negatif olduğunda dağılma yapılabilir.',
                'D) İşlemi ters çevirip çarpmalıydı.'
            ],
            correct: 1,
            explanation: '🚨 <b>En Büyük Matematik Tuzağı:</b> Bölünen sayı solda olduğunda bölme işlemi dağılmaz! $12 \\div 6 = 2$\'dir, fakat $12\\div 2 + 12\\div 4 = 9$\'dur ($2 \\neq 9$). Bölme ancak ve ancak SAĞDAN paylaştırma yaparken kesir gibi dağıtılabilir: $(b+c)/a = b/a + c/a$.'
        },
        {
            id: 'd5',
            level: 3,
            targetSet: 'Z',
            question: '<b>MEB 7. Sınıf Cebirsel Tuzak (DİKKAT Kutusu):</b><br>$2x - (x - 1)$ ifadesinin en sade eşiti aşağıdakilerden hangisidir?',
            options: [
                'A) $x - 1$',
                'B) $3x - 1$',
                'C) $x + 1$',
                'D) $2x$'
            ],
            correct: 2,
            explanation: 'Parantez önündeki eksi işareti, içeriye $-1$ katsayısının dağıtılması anlamına gelir:<br>' +
                         '$2x - (x - 1) = 2x - 1 \\cdot (x - 1) = 2x - 1 \\cdot x - 1 \\cdot (-1) = 2x - x + 1 = x + 1$.<br>' +
                         '⚠️ Eksi ile eksinin çarpımı $+1$ olur!'
        }
    ];

    // Dinamik Alan Modeli Hesaplayıcı
    function updateAreaModel() {
        var a = parseInt(document.getElementById('slider-a').value, 10) || 3;
        var b = parseInt(document.getElementById('slider-b').value, 10) || 4;
        var c = parseInt(document.getElementById('slider-c').value, 10) || 2;

        document.getElementById('val-a').textContent = a;
        document.getElementById('val-b').textContent = b;
        document.getElementById('val-c').textContent = c;

        var area1 = a * b;
        var area2 = a * c;
        var totalArea = a * (b + c);

        var rect1 = document.getElementById('rect-part1');
        var rect2 = document.getElementById('rect-part2');

        if (rect1 && rect2) {
            rect1.style.flex = b;
            rect2.style.flex = c;
            rect1.innerHTML = '<b>' + a + ' × ' + b + ' = ' + area1 + '</b>';
            rect2.innerHTML = '<b>' + a + ' × ' + c + ' = ' + area2 + '</b>';
        }

        var mathCalc = document.getElementById('area-math-calc');
        if (mathCalc) {
            mathCalc.innerHTML = '<b>Sol Yol (Parantez İçi):</b> ' + a + ' × (' + b + ' + ' + c + ') = ' + a + ' × ' + (b + c) + ' = <span class="highlight">' + totalArea + '</span><br>' +
                                 '<b>Sağ Yol (Dağılma):</b> (' + a + ' × ' + b + ') + (' + a + ' × ' + c + ') = ' + area1 + ' + ' + area2 + ' = <span class="highlight">' + (area1 + area2) + '</span><br>' +
                                 '🎉 <i>İki yol da tıpatıp aynı alanı verir!</i>';
        }
    }

    // Zihinden Kolay Çarpma Simülatörü
    function runMentalSim() {
        var n = parseInt(document.getElementById('mental-mult').value, 10) || 7;
        var out = document.getElementById('mental-out');
        if (!out) return;

        var step1 = 100 * n;
        var step2 = 1 * n;
        var res = step1 - step2;

        out.innerHTML = '<b>99 × ' + n + ' işlemini zihinden yapalım:</b><br>' +
                        '99 yerine (100 \u2212 1) yazalım: (100 \u2212 1) × ' + n + '<br>' +
                        '= 100 × ' + n + ' \u2212 1 × ' + n + '<br>' +
                        '= ' + step1 + ' \u2212 ' + step2 + ' = <b>' + res + '</b> 🎯';
    }

    // Sayfa Yüklendiğinde Başlat
    document.addEventListener('DOMContentLoaded', function () {
        // Alan sliderları
        ['slider-a', 'slider-b', 'slider-c'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('input', updateAreaModel);
        });
        updateAreaModel();

        // Zihinden çarpma
        var mInp = document.getElementById('mental-mult');
        if (mInp) {
            mInp.addEventListener('input', runMentalSim);
            runMentalSim();
        }

        // Quiz Motorunu Başlat
        if (typeof DersCekirdek !== 'undefined') {
            DersCekirdek.createQuizEngine('dagilma-quiz-container', DAGILMA_QUESTIONS);
        }
    });

})();
