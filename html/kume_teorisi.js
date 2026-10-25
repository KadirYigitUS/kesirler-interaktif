/**
 * kume_teorisi.js — Uzay 7. Sınıf Küme Teorisi ve Sayı Kümeleri İnteraktif Mantık Motoru
 * Zenginleştirilmiş Soru Bankası (8 Soru: Boş küme vs {0}, Alt küme, Kesişim, Birleşim, Zincir)
 */

(function () {
    'use strict';

    var MINUS = '\u2212';

    // 1. Sayı Sürükle Bırak / Eşleştirme Veritabanı
    var NUM_CARDS = [
        { id: 'c1', label: '7', target: 'N_PLUS', hint: 'Pozitif tam sayma sayısı' },
        { id: 'c2', label: '0', target: 'N', hint: 'Saymaya dahil değildir ama doğal sayıdır' },
        { id: 'c3', label: MINUS + '15', target: 'Z', hint: 'Negatif tam sayı' },
        { id: 'c4', label: MINUS + '3/4', target: 'Q', hint: 'Negatif rasyonel kesir' },
        { id: 'c5', label: '0,25', target: 'Q', hint: 'Ondalık gösterimli rasyonel sayı' },
        { id: 'c6', label: '√2', target: 'R', hint: 'Virgülden sonrası devretmez (8. Sınıf Ön İzleme)', isPreview: true },
        { id: 'c7', label: 'π', target: 'R', hint: 'Çember oranı irrasyonel sayı (8. Sınıf Ön İzleme)', isPreview: true }
    ];

    // 2. 3 Kademeli Zenginleştirilmiş Soru Bankası (8 Soru)
    var KUME_QUESTIONS = [
        {
            id: 'q1',
            level: 1,
            targetSet: 'N_PLUS',
            question: 'Aşağıdaki ifadelerden hangisi matematiksel anlamda <b>bir küme belirtir</b>?',
            options: [
                'A) Sınıfımızdaki bazı çalışkan öğrenciler',
                'B) Okulumuzun en lezzetli yemekleri',
                'C) Haftanın "P" harfi ile başlayan günleri',
                'D) Türkiye\'nin en güzel şehirleri'
            ],
            correct: 2,
            explanation: 'Bir topluluğun küme belirtmesi için <b>iyi tanımlı</b> olması, yani kişiden kişiye değişmeyen kesin bir ölçüt taşıması gerekir. Haftanın P harfiyle başlayan günleri (Pazartesi, Perşembe, Pazar) herkes için aynıdır.'
        },
        {
            id: 'q2',
            level: 1,
            targetSet: 'N',
            question: '$A = \\{0, 2, 4, 6\\}$ kümesi için aşağıdakilerden hangisi <b>yanlıştır</b>?',
            options: [
                'A) $0 \\in A$',
                'B) $s(A) = 4$',
                'C) $5 \\notin A$',
                'D) $s(A) = 0$'
            ],
            correct: 3,
            explanation: '$A$ kümesinin 4 elemanı vardır: $0, 2, 4, 6$. Dolayısıyla eleman sayısı $s(A) = 4$\'tür. $s(A) = 0$ ifadesi yanlıştır.'
        },
        {
            id: 'q3',
            level: 1,
            targetSet: 'N',
            question: '<b>Boş Küme Kavramı:</b> Elemanı olmayan kümeye <b>boş küme</b> denir ve $\\emptyset$ veya $\\{\\}$ sembolüyle gösterilir.<br>Buna göre aşağıdakilerden hangisi bir <b>boş kümedir</b>?',
            options: [
                'A) Haftanın "Z" harfi ile başlayan günleri',
                'B) $\\{0\\}$',
                'C) $\\{\\emptyset\\}$',
                'D) Sıfırdan küçük doğal sayılar hariç sayılar'
            ],
            correct: 0,
            explanation: 'Haftada "Z" harfiyle başlayan gün yoktur; dolayısıyla bu kümenin hiç elemanı yoktur ve boş kümedir! <br>⚠️ Dikkat: $\\{0\\}$ kümesinin bir elemanı vardır (o da 0 sayısıdır). $\\{\\emptyset\\}$ kümesi de içinde boş küme sembolü barındıran 1 elemanlı bir kümedir.'
        },
        {
            id: 'q4',
            level: 2,
            targetSet: 'N_PLUS',
            question: '$A = \\{12\\text{ sayısının doğal sayı bölenleri}\\}$ ve $B = \\{18\\text{ sayısının doğal sayı bölenleri}\\}$ olduğuna göre, $A \\cap B$ (kesişim kümesi) aşağıdakilerden hangisidir?',
            options: [
                'A) $\\{1, 2, 3, 6\\}$',
                'B) $\\{12, 18\\}$',
                'C) $\\{1, 2, 3, 4, 6, 9, 12, 18\\}$',
                'D) $\\{6\\}$'
            ],
            correct: 0,
            explanation: '$A = \\{1, 2, 3, 4, 6, 12\\}$ ve $B = \\{1, 2, 3, 6, 9, 18\\}$. İkisinde de ortak olan elemanlar kesişimi oluşturur: $A \\cap B = \\{1, 2, 3, 6\\}$. Bu aynı zamanda 6. sınıfta öğrendiğin <b>ortak bölenler</b> kümesidir (En büyüğü EBOB = 6)!'
        },
        {
            id: 'q5',
            level: 2,
            targetSet: 'N',
            question: '$K = \\{a, b\\}$ ve $L = \\{a, b, c, d\\}$ kümeleri veriliyor. $K$ kümesinin her elemanı $L$ kümesinde de yer aldığına göre bu durum matematiksel olarak nasıl yazılır?',
            options: [
                'A) $K \\subset L$ ($K$ alt kümesidir $L$)',
                'B) $L \\subset K$',
                'C) $K \\in L$',
                'D) $K \\cap L = \\emptyset$'
            ],
            correct: 0,
            explanation: 'Bir kümenin bütün elemanları başka bir kümenin de elemanı ise o küme diğerinin <b>alt kümesidir</b> ve $\\subset$ sembolü ile gösterilir: $K \\subset L$.'
        },
        {
            id: 'q6',
            level: 2,
            targetSet: 'Z',
            question: 'Sayı kümeleri arasındaki kapsama ilişkisi düşünüldüğünde, ' + MINUS + '8 sayısı aşağıdaki kümelerden hangisinin <b>elemanı değildir</b>?',
            options: [
                'A) $\\mathbb{Z}$ (Tam Sayılar)',
                'B) $\\mathbb{Q}$ (Rasyonel Sayılar)',
                'C) $\\mathbb{N}$ (Doğal Sayılar)',
                'D) $\\mathbb{R}$ (Gerçek Sayılar)'
            ],
            correct: 2,
            explanation: MINUS + '8 negatif bir sayıdır. Doğal sayılar ($\\mathbb{N}$) $0, 1, 2, 3...$ şeklinde devam eder ve negatif sayı içermez. Bu yüzden ' + MINUS + '8 $\\notin \\mathbb{N}$\'dir.'
        },
        {
            id: 'q7',
            level: 3,
            targetSet: 'Q',
            question: '<b>Beceri Temelli / Kavram Yanılgısı Sorusu:</b><br>Boş küme ile ilgili aşağıda verilen iddialardan hangisi <b>kesinlikle doğrudur</b>?',
            options: [
                'A) $\\{\\emptyset\\}$ bir boş kümedir ve elemanı yoktur.',
                'B) $\\emptyset$ kümesinin eleman sayısı $s(\\emptyset) = 0$\'dır.',
                'C) $\\{0\\}$ kümesi hiçbir şey ifade etmediği için boş kümedir.',
                'D) Boş küme hiçbir kümenin alt kümesi olamaz.'
            ],
            correct: 1,
            explanation: 'Boş kümenin elemanı yoktur, yani $s(\\emptyset) = 0$\'dır! <br>⚠️ Tuzaklar: $\\{\\emptyset\\}$ kümesinin içinde boş küme sembolü olduğu için 1 elemanlıdır. $\\{0\\}$ kümesinin içinde "0" elemanı vardır ($s=1$), boş küme değildir. Boş küme her kümenin alt kümesidir.'
        },
        {
            id: 'q8',
            level: 3,
            targetSet: 'Q',
            question: '<b>Sayı Kümeleri Zinciri:</b><br>$\\mathbb{N}^+ \\subset \\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$ zincirinde yer alan bir $x$ sayısı için $x \\in \\mathbb{Q}$ fakat $x \\notin \\mathbb{Z}$ olduğu biliniyor. Buna göre $x$ sayısı aşağıdakilerden hangisi olabilir?',
            options: [
                'A) ' + MINUS + '5',
                'B) 0',
                'C) ' + MINUS + '3/4',
                'D) 8/2'
            ],
            correct: 2,
            explanation: MINUS + '5 ve 0 birer tam sayıdır ($x \\in \\mathbb{Z}$). $8/2 = 4$ de bir tam sayıdır. Fakat ' + MINUS + '3/4 kesirli bir rasyonel sayıdır ve tam sayı değildir ($x \\in \\mathbb{Q}$, $x \\notin \\mathbb{Z}$). Doğru yanıt C şıkkıdır.'
        }
    ];

    // Venn şeması etkileşimi: Bölenler hesaplama
    function getDivisors(n) {
        var d = [];
        for (var i = 1; i <= n; i++) {
            if (n % i === 0) d.push(i);
        }
        return d;
    }

    function updateVennDemo() {
        var inpA = document.getElementById('venn-num-a');
        var inpB = document.getElementById('venn-num-b');
        if (!inpA || !inpB) return;

        var numA = parseInt(inpA.value, 10) || 12;
        var numB = parseInt(inpB.value, 10) || 18;

        var divA = getDivisors(numA);
        var divB = getDivisors(numB);

        var onlyA = divA.filter(function (x) { return divB.indexOf(x) === -1; });
        var onlyB = divB.filter(function (x) { return divA.indexOf(x) === -1; });
        var intersect = divA.filter(function (x) { return divB.indexOf(x) !== -1; });

        var elOnlyA = document.getElementById('venn-only-a');
        var elOnlyB = document.getElementById('venn-only-b');
        var elIntersect = document.getElementById('venn-intersect');
        var elSummary = document.getElementById('venn-summary');

        if (elOnlyA) elOnlyA.innerHTML = onlyA.map(function(x){ return '<span class="v-tag">' + x + '</span>'; }).join(' ') || '<i>(Boş)</i>';
        if (elOnlyB) elOnlyB.innerHTML = onlyB.map(function(x){ return '<span class="v-tag">' + x + '</span>'; }).join(' ') || '<i>(Boş)</i>';
        if (elIntersect) elIntersect.innerHTML = intersect.map(function(x){ return '<span class="v-tag v-tag-inter">' + x + '</span>'; }).join(' ') || '<i>(Boş)</i>';

        if (elSummary) {
            var ebob = intersect.length > 0 ? Math.max.apply(null, intersect) : 1;
            elSummary.innerHTML = '<b>A Kümesi (' + numA + '\'nın bölenleri):</b> s(A) = ' + divA.length + '<br>' +
                                  '<b>B Kümesi (' + numB + '\'nın bölenleri):</b> s(B) = ' + divB.length + '<br>' +
                                  '<b>Kesişim A ∩ B (Ortak Bölenler):</b> {' + intersect.join(', ') + '} &rarr; <b>En Büyük Ortak Bölen (EBOB) = ' + ebob + '</b><br>' +
                                  '<b>Birleşim A ∪ B:</b> s(A ∪ B) = ' + (onlyA.length + onlyB.length + intersect.length);
        }
    }

    // Kart yerleştirme oyunu
    var placedCards = {};

    function renderCardsGame() {
        var cardBox = document.getElementById('cards-pool');
        if (!cardBox) return;

        var h = '';
        NUM_CARDS.forEach(function (c) {
            if (!placedCards[c.id]) {
                var previewBadge = c.isPreview ? ' <span class="badge-preview">8. Sınıf</span>' : '';
                h += '<div class="draggable-card" draggable="true" ondragstart="window._dragStart(event, \'' + c.id + '\')">' +
                     c.label + previewBadge + '</div>';
            }
        });
        cardBox.innerHTML = h || '<div class="all-placed">🎉 Harika! Bütün sayıları doğru yuvalarına yerleştirdin!</div>';
    }

    function initGame() {
        window._dragStart = function (ev, cardId) {
            ev.dataTransfer.setData('text/plain', cardId);
        };

        window._allowDrop = function (ev) {
            ev.preventDefault();
        };

        window._dropCard = function (ev, targetZone) {
            ev.preventDefault();
            var cardId = ev.dataTransfer.getData('text/plain');
            var card = NUM_CARDS.find(function (c) { return c.id === cardId; });
            var msgEl = document.getElementById('game-msg');

            if (!card) return;

            if (card.target === targetZone) {
                placedCards[card.id] = true;
                if (msgEl) {
                    msgEl.className = 'game-feedback success';
                    msgEl.innerHTML = '✅ <b>Doğru!</b> ' + card.label + ' en dar olarak ' + targetZone + ' kümesine aittir. (' + card.hint + ')';
                }
                var slotEl = document.getElementById('slot-' + targetZone);
                if (slotEl) {
                    var span = document.createElement('span');
                    span.className = 'placed-tag';
                    span.textContent = card.label;
                    slotEl.appendChild(span);
                }
                renderCardsGame();
            } else {
                if (msgEl) {
                    msgEl.className = 'game-feedback danger';
                    msgEl.innerHTML = '❌ <b>Tekrar dene:</b> ' + card.label + ' bu kümenin en uygun veya en dar yuvası değildir. İpucu: ' + card.hint;
                }
            }
        };

        window._resetCardsGame = function () {
            placedCards = {};
            ['N_PLUS', 'N', 'Z', 'Q', 'R'].forEach(function (z) {
                var slotEl = document.getElementById('slot-' + z);
                if (slotEl) slotEl.innerHTML = '';
            });
            var msgEl = document.getElementById('game-msg');
            if (msgEl) { msgEl.className = 'game-feedback'; msgEl.innerHTML = ''; }
            renderCardsGame();
        };

        renderCardsGame();
    }

    // Sayfa Yüklendiğinde Başlat
    document.addEventListener('DOMContentLoaded', function () {
        var inpA = document.getElementById('venn-num-a');
        var inpB = document.getElementById('venn-num-b');
        if (inpA && inpB) {
            inpA.addEventListener('input', updateVennDemo);
            inpB.addEventListener('input', updateVennDemo);
            updateVennDemo();
        }

        initGame();

        if (typeof DersCekirdek !== 'undefined') {
            DersCekirdek.createQuizEngine('kume-quiz-container', KUME_QUESTIONS);
        }
    });

})();
