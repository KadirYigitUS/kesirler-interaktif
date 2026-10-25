/**
 * ders_cekirdek.js — Uzay İnteraktif Matematik Öğretim Sistemi Ortak Ders Çekirdeği
 * 12 yaşındaki (7. Sınıf) Türk öğrenciler için MEB maarif modeline uygun interaktif ders motoru.
 * 
 * Özellikler:
 * 1. Bilgi Kutusu ve Dikkat Kutusu bileşenleri
 * 2. Kademeli Sınav / Alıştırma Motoru (K1: Temel, K2: Uygulama, K3: Beceri Temelli)
 * 3. Kapanma ve Sayı Kümesi Denetçisi (Domain Auditor)
 * 4. Tipografi yardımcısı (Unicode eksi '−', ondalık virgül ',')
 */

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.DersCekirdek = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    var MINUS = '\u2212'; // gerçek eksi işareti (−)

    // Sayı Kümesi Etiketleri ve Tanımları
    var SETS = {
        N_PLUS: { id: 'N_PLUS', symbol: 'ℕ⁺', name: 'Sayma Sayıları', min: 1 },
        N: { id: 'N', symbol: 'ℕ', name: 'Doğal Sayılar', min: 0 },
        Z: { id: 'Z', symbol: 'ℤ', name: 'Tam Sayılar' },
        Q: { id: 'Q', symbol: 'ℚ', name: 'Rasyonel Sayılar' },
        Q_PRIME: { id: 'Q_PRIME', symbol: 'ℚ′', name: 'İrrasyonel Sayılar', badge: '(8. Sınıf Ön İzleme)' },
        R: { id: 'R', symbol: 'ℝ', name: 'Gerçek Sayılar', badge: '(8. Sınıf Ön İzleme)' }
    };

    /**
     * Güvenli metin kaçırma
     */
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /**
     * Unicode eksi ve Türkçe ondalık virgül formatlayıcı
     */
    function formatSayi(val) {
        if (val === null || val === undefined) return '';
        var s = String(val);
        // Noktayı virgüle çevir (ondalık için)
        s = s.replace(/\./g, ',');
        // Tireyi Unicode eksiye çevir
        s = s.replace(/-/g, MINUS);
        return s;
    }

    /**
     * Domain Auditor: Verilen bir değerin ve işlemlerin hedef kümede kalıp kalmadığını denetler.
     * @param {number|object} value Kontrol edilecek değer veya {n, d} kesir nesnesi
     * @param {string} targetSet 'N_PLUS' | 'N' | 'Z' | 'Q' | 'R'
     * @returns {object} { ok: boolean, message: string }
     */
    function checkClosure(value, targetSet) {
        var num;
        var isFraction = false;
        var n = 0, d = 1;

        if (typeof value === 'object' && value !== null && 'n' in value && 'd' in value) {
            isFraction = true;
            n = Number(value.n);
            d = Number(value.d);
            if (d === 0) {
                return { ok: false, message: 'Payda sıfır olamaz! Tanımsız işlem.' };
            }
            num = n / d;
        } else {
            num = Number(value);
        }

        if (isNaN(num)) {
            return { ok: false, message: 'Geçersiz sayısal değer.' };
        }

        switch (targetSet) {
            case 'N_PLUS':
                if (isFraction && n % d !== 0) {
                    return { ok: false, message: 'Sonuç tam sayı olmalı ve 0\'dan büyük olmalıdır (ℕ⁺ dışına çıktı).' };
                }
                if (num <= 0 || !Number.isInteger(num)) {
                    return { ok: false, message: 'Sayma sayıları (ℕ⁺) 1\'den başlar, sıfır veya negatif olamaz.' };
                }
                return { ok: true, message: 'Değer ℕ⁺ (Sayma Sayıları) kümesindedir.' };

            case 'N':
                if (isFraction && n % d !== 0) {
                    return { ok: false, message: 'Sonuç tam sayı olmalıdır (ℕ dışına çıktı).' };
                }
                if (num < 0 || !Number.isInteger(num)) {
                    return { ok: false, message: 'Doğal sayılar (ℕ) negatif olamaz.' };
                }
                return { ok: true, message: 'Değer ℕ (Doğal Sayılar) kümesindedir.' };

            case 'Z':
                if (isFraction && n % d !== 0) {
                    return { ok: false, message: 'Bölme tam bölünmediği için sonuç tam sayılar (ℤ) kümesinin dışına çıktı.' };
                }
                if (!Number.isInteger(num)) {
                    return { ok: false, message: 'Değer bir tam sayı (ℤ) değildir.' };
                }
                return { ok: true, message: 'Değer ℤ (Tam Sayılar) kümesindedir.' };

            case 'Q':
                if (isFraction && d === 0) {
                    return { ok: false, message: 'Payda sıfır olamaz (Rasyonel sayı tanımsız).' };
                }
                return { ok: true, message: 'Değer ℚ (Rasyonel Sayılar) kümesindedir.' };

            case 'R':
                return { ok: true, message: 'Değer ℝ (Gerçek Sayılar) kümesindedir. (8. Sınıf Ön İzleme)' };

            default:
                return { ok: true, message: 'Bilinmeyen küme denetimi geçildi.' };
        }
    }

    /**
     * MEB Uyumlu Bilgi Kutusu HTML'i üretir
     */
    function renderBilgiKutusu(baslik, icerik, kaynakKitap) {
        var h = '<div class="bilgi-kutusu" role="region" aria-label="Bilgi Kutusu">';
        h += '  <div class="bilgi-baslik"><span class="bilgi-ikon">💡</span> <b>BİLGİ KUTUSU:</b> ' + esc(baslik) + '</div>';
        h += '  <div class="bilgi-govde">' + icerik + '</div>';
        if (kaynakKitap) {
            h += '  <div class="bilgi-kaynak">📚 Kaynak: MEB ' + esc(kaynakKitap) + '</div>';
        }
        h += '</div>';
        return h;
    }

    /**
     * MEB Uyumlu Dikkat Kutusu HTML'i üretir
     */
    function renderDikkatKutusu(baslik, icerik) {
        var h = '<div class="dikkat-kutusu" role="alert">';
        h += '  <div class="dikkat-baslik"><span class="dikkat-ikon">⚠️</span> <b>DİKKAT !</b> ' + esc(baslik) + '</div>';
        h += '  <div class="dikkat-govde">' + icerik + '</div>';
        h += '</div>';
        return h;
    }

    /**
     * 3 Kademeli Sınav / Test Soru Motoru
     * Her soru: { id, level: 1|2|3, question, options: [...], correct: 0..3, explanation, targetSet }
     */
    function createQuizEngine(containerId, questions, options) {
        options = options || {};
        var currentQIndex = 0;
        var score = 0;
        var answers = {};
        var container = typeof document !== 'undefined' ? document.getElementById(containerId) : null;

        function render() {
            if (!container) return;
            if (currentQIndex >= questions.length) {
                renderResult();
                return;
            }

            var q = questions[currentQIndex];
            var levelBadge = q.level === 1 ? '🟢 Kolay (Temel / Görsel)' :
                             q.level === 2 ? '🟡 Orta (Uygulama / İşlem)' :
                             '🔴 Zor (Beceri Temelli / Kavram Yanılgısı)';

            var setBadge = q.targetSet && SETS[q.targetSet] ? 
                '<span class="set-badge">' + SETS[q.targetSet].symbol + ' ' + SETS[q.targetSet].name + '</span>' : '';

            var h = '<div class="quiz-card">';
            h += '  <div class="quiz-header">';
            h += '    <span class="quiz-step">Soru ' + (currentQIndex + 1) + ' / ' + questions.length + '</span>';
            h += '    <span class="quiz-level">' + levelBadge + '</span>';
            h += '    ' + setBadge;
            h += '  </div>';

            h += '  <div class="quiz-question">' + q.question + '</div>';
            h += '  <div class="quiz-options">';
            q.options.forEach(function (opt, idx) {
                var isChecked = answers[q.id] === idx ? 'checked' : '';
                h += '    <label class="quiz-option" id="opt-lbl-' + idx + '">';
                h += '      <input type="radio" name="quiz_opt" value="' + idx + '" ' + isChecked + ' onchange="window._quizSelect(' + idx + ')">';
                h += '      <span class="opt-text">' + opt + '</span>';
                h += '    </label>';
            });
            h += '  </div>';

            h += '  <div id="quiz-feedback" class="quiz-feedback" style="display:none;"></div>';

            h += '  <div class="quiz-actions">';
            if (currentQIndex > 0) {
                h += '    <button class="btn btn-secondary" onclick="window._quizPrev()">⬅️ Önceki</button>';
            }
            h += '    <button id="btn-check" class="btn btn-primary" onclick="window._quizCheck()">Cevabı Kontrol Et 🎯</button>';
            h += '    <button id="btn-next" class="btn btn-success" style="display:none;" onclick="window._quizNext()">Sonraki Soru ➡️</button>';
            h += '  </div>';
            h += '</div>';

            container.innerHTML = h;
        }

        function check() {
            var q = questions[currentQIndex];
            var selected = answers[q.id];
            var fb = document.getElementById('quiz-feedback');
            var btnCheck = document.getElementById('btn-check');
            var btnNext = document.getElementById('btn-next');

            if (selected === undefined) {
                if (fb) {
                    fb.style.display = 'block';
                    fb.className = 'quiz-feedback warning';
                    fb.innerHTML = 'Lütfen bir şık işaretleyiniz!';
                }
                return;
            }

            var isCorrect = (selected === q.correct);
            if (isCorrect) {
                score++;
            }

            // Doğru ve yanlış şıkları renklendir
            q.options.forEach(function (opt, idx) {
                var lbl = document.getElementById('opt-lbl-' + idx);
                if (!lbl) return;
                if (idx === q.correct) {
                    lbl.classList.add('correct-choice');
                } else if (idx === selected && !isCorrect) {
                    lbl.classList.add('wrong-choice');
                }
            });

            if (fb) {
                fb.style.display = 'block';
                fb.className = 'quiz-feedback ' + (isCorrect ? 'success' : 'danger');
                fb.innerHTML = (isCorrect ? '🎉 <b>Tebrikler! Doğru Cevap.</b><br>' : '❌ <b>Cevabın Yanlış.</b><br>') +
                               '<div class="explanation-box">' + q.explanation + '</div>';
            }

            if (btnCheck) btnCheck.style.display = 'none';
            if (btnNext) btnNext.style.display = 'inline-block';
        }

        function renderResult() {
            if (!container) return;
            var pct = Math.round((score / questions.length) * 100);
            var h = '<div class="quiz-result-card">';
            h += '  <h2>🏁 Alıştırma Tamamlandı!</h2>';
            h += '  <div class="quiz-score-badge">' + score + ' / ' + questions.length + ' (' + pct + '%)</div>';
            h += '  <p>' + (pct >= 80 ? 'Harika bir kavrayış! Konuya ve işlem özelliklerine tamamen hakimsin.' :
                            pct >= 50 ? 'Güzel çalışma! Bazı soru ve kavram kutularını tekrar gözden geçirmeni öneririz.' :
                            'Önemli kavram yanılgıları var. Bilgi kutularındaki örnekleri adım adım tekrar inceleyelim.') + '</p>';
            h += '  <button class="btn btn-primary" onclick="window._quizRestart()">Yeniden Başla 🔄</button>';
            h += '</div>';
            container.innerHTML = h;
        }

        // Global köprüler
        if (typeof window !== 'undefined') {
            window._quizSelect = function (idx) {
                var q = questions[currentQIndex];
                answers[q.id] = idx;
            };
            window._quizCheck = check;
            window._quizNext = function () {
                currentQIndex++;
                render();
            };
            window._quizPrev = function () {
                if (currentQIndex > 0) currentQIndex--;
                render();
            };
            window._quizRestart = function () {
                currentQIndex = 0;
                score = 0;
                answers = {};
                render();
            };
        }

        render();

        return {
            getScore: function () { return score; },
            restart: function () { currentQIndex = 0; score = 0; answers = {}; render(); }
        };
    }

    return {
        MINUS: MINUS,
        SETS: SETS,
        esc: esc,
        formatSayi: formatSayi,
        checkClosure: checkClosure,
        renderBilgiKutusu: renderBilgiKutusu,
        renderDikkatKutusu: renderDikkatKutusu,
        createQuizEngine: createQuizEngine
    };
}));
