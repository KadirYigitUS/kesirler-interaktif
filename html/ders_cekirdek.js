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
     * Unicode eksi ve Türkçe ondalık virgül formatlayıcı (eski API, korunur)
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
     * Güvenli Türkçe sayı formatlayıcı:
     * - null / undefined / NaN -> ''
     * - ±Infinity -> '∞' / '−∞'
     * - -0 veya -0.00 -> '0' / '0,00' (asla '−0,00' üretmez)
     * - Ondalık nokta -> ',', ASCII '-' -> Unicode '−' (\u2212)
     */
    function fmtTR(x, digits) {
        if (x === null || x === undefined) return '';
        if (typeof x === 'number') {
            if (Number.isNaN(x)) return '';
            if (x === Infinity) return '∞';
            if (x === -Infinity) return MINUS + '∞';
            if (Object.is(x, -0) || x === 0) x = 0;
            var numStr = (digits !== undefined && digits !== null) ? x.toFixed(digits) : String(x);
            if (/^-0(?:\.0+)?$/.test(numStr)) numStr = numStr.slice(1);
            return numStr.replace(/\./g, ',').replace(/-/g, MINUS);
        }
        var s = String(x);
        if (/^(?:-|−)0(?:[.,]0+)?$/.test(s)) s = s.slice(1);
        return s.replace(/\./g, ',').replace(/-/g, MINUS);
    }

    /* ---------- Özyinelemeli Matematik Biçimlendirici (G1 / G2) ---------- */

    var BB_MAP = { N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ' };

    var MATH_SYMBOLS = {
        '\\cdot': '·',
        '\\times': '×',
        '\\div': '÷',
        '\\pm': '±',
        '\\mp': '∓',
        '\\neq': '≠',
        '\\ne': '≠',
        '\\leq': '≤',
        '\\le': '≤',
        '\\geq': '≥',
        '\\ge': '≥',
        '\\approx': '≈',
        '\\equiv': '≡',
        '\\in': '∈',
        '\\notin': '∉',
        '\\subset': '⊂',
        '\\subseteq': '⊆',
        '\\supset': '⊃',
        '\\supseteq': '⊇',
        '\\cup': '∪',
        '\\cap': '∩',
        '\\emptyset': '∅',
        '\\varnothing': '∅',
        '\\pi': 'π',
        '\\infty': '∞',
        '\\rightarrow': '→',
        '\\to': '→',
        '\\leftarrow': '←',
        '\\Rightarrow': '⇒',
        '\\Leftrightarrow': '⇔',
        '\\dots': '…',
        '\\ldots': '…',
        '\\cdots': '⋯',
        '\\quad': '&emsp;',
        '\\qquad': '&emsp;&emsp;',
        '\\prime': '′'
    };

    function escapeMathInput(s) {
        return String(s)
            .replace(/&(?!(?:lt|gt|amp|quot|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function formatMathTextToken(txt) {
        if (!txt) return '';
        // 1. Üç noktayı ondalık noktasından önce elips yap (1, 2, 3... -> 1, 2, 3…)
        txt = txt.replace(/\.\.\./g, '…');
        // 2. Ondalık noktalarını virgüle çevir
        txt = txt.replace(/(\d)\.(\d)/g, '$1,$2');
        txt = txt.replace(/(^|[^\d.])\.(\d)/g, '$1,$2');
        // 3. Matematiksel eksi işaretini Unicode eksiye çevir
        txt = txt.replace(/-/g, MINUS);
        return txt;
    }

    function skipWS(s, pos) {
        while (pos < s.length && /\s/.test(s[pos])) pos++;
        return pos;
    }

    function readBracedRaw(s, pos) {
        var depth = 0;
        var start = pos;
        var i = pos;
        while (i < s.length) {
            var ch = s[i];
            if (ch === '\\' && i + 1 < s.length) {
                i += 2;
                continue;
            }
            if (ch === '{') {
                depth++;
            } else if (ch === '}') {
                depth--;
                if (depth === 0) {
                    return { content: s.slice(start + 1, i), next: i + 1 };
                }
            }
            i++;
        }
        return { content: s.slice(start + 1), next: s.length };
    }

    function readArgRaw(s, pos) {
        pos = skipWS(s, pos);
        if (pos >= s.length) return { content: '', next: pos };
        if (s[pos] === '{') return readBracedRaw(s, pos);
        if (s[pos] === '\\') {
            var m = s.slice(pos).match(/^\\(?:[a-zA-Z]+|.)/);
            if (m) return { content: m[0], next: pos + m[0].length };
        }
        return { content: s[pos], next: pos + 1 };
    }

    function normalizeFracI1(rawNum, rawDen) {
        var tn = rawNum.trim();
        var td = rawDen.trim();
        var denM = td.match(/^(?:-|−)(\d+(?:[.,]\d+)?)$/);
        if (!denM) return { num: rawNum, den: rawDen };
        var posDen = denM[1];
        var numM = tn.match(/^(-|−|\+)?(\d+(?:[.,]\d+)?)$/);
        if (numM) {
            var isZero = /^0+(?:[.,]0+)?$/.test(numM[2]);
            var isNegNum = (numM[1] === '-' || numM[1] === '−');
            var newNum = isZero ? numM[2] : (isNegNum ? numM[2] : '-' + numM[2]);
            return { num: newNum, den: posDen };
        }
        var monoM = tn.match(/^(-|−|\+)?(\d*[a-zA-Z]+)$/);
        if (monoM) {
            var isNegMono = (monoM[1] === '-' || monoM[1] === '−');
            return { num: isNegMono ? monoM[2] : '-' + monoM[2], den: posDen };
        }
        return { num: rawNum, den: rawDen };
    }

    function parseMathSeq(s) {
        var out = '';
        var textBuf = '';
        var pos = 0;

        function flushText() {
            if (textBuf) {
                out += formatMathTextToken(textBuf);
                textBuf = '';
            }
        }

        while (pos < s.length) {
            var ch = s[pos];

            if (ch === '{') {
                flushText();
                var grp = readBracedRaw(s, pos);
                pos = grp.next;
                out += parseMathSeq(grp.content);
                continue;
            }

            if (ch === '}') {
                pos++;
                continue;
            }

            if (ch === '^' || ch === '_') {
                flushText();
                var tag = ch === '^' ? 'sup' : 'sub';
                var scriptArg = readArgRaw(s, pos + 1);
                pos = scriptArg.next;
                out += '<' + tag + '>' + parseMathSeq(scriptArg.content) + '</' + tag + '>';
                continue;
            }

            if (ch === '\\') {
                flushText();
                if (pos + 1 >= s.length) {
                    out += '\\';
                    pos++;
                    continue;
                }
                var nextCh = s[pos + 1];

                if (nextCh === '{' || nextCh === '}' || nextCh === '$' || nextCh === '%' || nextCh === '_') {
                    out += nextCh;
                    pos += 2;
                    continue;
                }
                if (nextCh === ',') { out += '&thinsp;'; pos += 2; continue; }
                if (nextCh === ';') { out += ' '; pos += 2; continue; }
                if (nextCh === ':') { out += '&thinsp;'; pos += 2; continue; }
                if (nextCh === ' ') { out += ' '; pos += 2; continue; }
                if (nextCh === '\\') { out += '<br>'; pos += 2; continue; }

                var cmdMatch = s.slice(pos).match(/^\\[a-zA-Z]+/);
                if (cmdMatch) {
                    var cmd = cmdMatch[0];
                    pos += cmd.length;

                    if (cmd === '\\frac') {
                        var numArg = readArgRaw(s, pos);
                        var denArg = readArgRaw(s, numArg.next);
                        pos = denArg.next;
                        var norm = normalizeFracI1(numArg.content, denArg.content);
                        out += '<span class="m-frac"><span class="m-num">' + parseMathSeq(norm.num) + '</span><span class="m-den">' + parseMathSeq(norm.den) + '</span></span>';
                        continue;
                    }

                    if (cmd === '\\sqrt') {
                        var idxHtml = '';
                        var pOpt = skipWS(s, pos);
                        if (pOpt < s.length && s[pOpt] === '[') {
                            var bDepth = 0, bi = pOpt;
                            while (bi < s.length) {
                                if (s[bi] === '\\' && bi + 1 < s.length) { bi += 2; continue; }
                                if (s[bi] === '[') bDepth++;
                                else if (s[bi] === ']') {
                                    bDepth--;
                                    if (bDepth === 0) break;
                                }
                                bi++;
                            }
                            if (bi < s.length && s[bi] === ']') {
                                idxHtml = '<sup class="m-root-idx">' + parseMathSeq(s.slice(pOpt + 1, bi)) + '</sup>';
                                pos = bi + 1;
                            }
                        }
                        var radArg = readArgRaw(s, pos);
                        pos = radArg.next;
                        out += '<span class="m-sqrt">' + idxHtml + '<span class="m-rad">√</span><span class="m-radicand">' + parseMathSeq(radArg.content) + '</span></span>';
                        continue;
                    }

                    if (cmd === '\\mathbb') {
                        var bbArg = readArgRaw(s, pos);
                        pos = bbArg.next;
                        var bbChars = bbArg.content.trim().split('').map(function (c) {
                            return BB_MAP[c] || c;
                        }).join('');
                        out += '<span class="m-bb">' + bbChars + '</span>';
                        continue;
                    }

                    if (cmd === '\\text' || cmd === '\\textrm' || cmd === '\\textbf') {
                        var txtArg = readArgRaw(s, pos);
                        pos = txtArg.next;
                        var verbatim = txtArg.content.replace(/\\([{}$%_])/g, '$1');
                        out += '<span class="m-text">' + verbatim + '</span>';
                        continue;
                    }

                    if (cmd === '\\boxed') {
                        var boxArg = readArgRaw(s, pos);
                        pos = boxArg.next;
                        out += '<span class="m-boxed">' + parseMathSeq(boxArg.content) + '</span>';
                        continue;
                    }

                    if (cmd === '\\left' || cmd === '\\right') {
                        pos = skipWS(s, pos);
                        if (pos < s.length) {
                            var dch = s[pos];
                            if (dch === '(' || dch === ')' || dch === '[' || dch === ']' || dch === '|') {
                                out += dch;
                                pos += 1;
                            } else if (dch === '.') {
                                pos += 1;
                            } else if (dch === '\\' && pos + 1 < s.length) {
                                var escDelim = s[pos + 1];
                                if (escDelim === '{' || escDelim === '}' || escDelim === '|') {
                                    out += (escDelim === '|' ? '‖' : escDelim);
                                    pos += 2;
                                }
                            }
                        }
                        continue;
                    }

                    if (Object.prototype.hasOwnProperty.call(MATH_SYMBOLS, cmd)) {
                        out += MATH_SYMBOLS[cmd];
                        continue;
                    }

                    if (typeof console !== 'undefined' && console.warn) {
                        console.warn('DersCekirdek.formatMath: bilinmeyen komut:', cmd);
                    }
                    out += cmd;
                    continue;
                }

                // Diğer tek karakter kaçışları
                out += nextCh;
                pos += 2;
                continue;
            }

            textBuf += ch;
            pos++;
        }

        flushText();
        return out;
    }

    function renderMathInner(rawTex) {
        return parseMathSeq(escapeMathInput(rawTex));
    }

    function splitMathSegments(str, allowHtmlTags) {
        var segments = [];
        var buf = '';
        var i = 0;
        var len = str.length;

        function flushText() {
            if (buf) {
                segments.push({ type: 'text', raw: buf });
                buf = '';
            }
        }

        while (i < len) {
            if (allowHtmlTags && str[i] === '<') {
                var tagMatch = str.slice(i).match(/^<\/?[a-zA-Z!][a-zA-Z0-9:-]*(?:\s(?:"[^"]*"|'[^']*'|[^>"'])*)?>/);
                if (tagMatch) {
                    buf += tagMatch[0];
                    i += tagMatch[0].length;
                    continue;
                }
            }

            if (str[i] === '\\') {
                if (i + 1 < len && str[i + 1] === '$') {
                    flushText();
                    segments.push({ type: 'esc_dollar', raw: '$' });
                    i += 2;
                    continue;
                }
                if (i + 1 < len && str[i + 1] === '\\') {
                    buf += '\\\\';
                    i += 2;
                    continue;
                }
                buf += str[i];
                i += 1;
                continue;
            }

            if (str[i] === '$' && i + 1 < len && str[i + 1] === '$') {
                var jDisp = i + 2;
                var foundDisp = false;
                while (jDisp < len) {
                    if (str[jDisp] === '\\' && jDisp + 1 < len) {
                        jDisp += 2;
                        continue;
                    }
                    if (str[jDisp] === '$' && jDisp + 1 < len && str[jDisp + 1] === '$') {
                        foundDisp = true;
                        break;
                    }
                    jDisp++;
                }
                if (foundDisp) {
                    flushText();
                    segments.push({ type: 'display', raw: str.slice(i + 2, jDisp) });
                    i = jDisp + 2;
                    continue;
                }
                buf += '$$';
                i += 2;
                continue;
            }

            if (str[i] === '$') {
                var jIn = i + 1;
                var foundIn = false;
                while (jIn < len) {
                    if (str[jIn] === '\\' && jIn + 1 < len) {
                        jIn += 2;
                        continue;
                    }
                    if (str[jIn] === '\n' && jIn + 1 < len && str[jIn + 1] === '\n') {
                        break;
                    }
                    if (str[jIn] === '$') {
                        foundIn = true;
                        break;
                    }
                    jIn++;
                }
                if (foundIn) {
                    flushText();
                    segments.push({ type: 'inline', raw: str.slice(i + 1, jIn) });
                    i = jIn + 1;
                    continue;
                }
                buf += '$';
                i += 1;
                continue;
            }

            buf += str[i];
            i += 1;
        }

        flushText();
        return segments;
    }

    /**
     * $...$ ve $$...$$ LaTeX ifadelerini saf HTML/CSS matematik biçimlendirmesine çevirir.
     * Matematik blokları dışındaki HTML etiketlerine ve Türkçe metinlere dokunmaz.
     */
    function formatMath(str) {
        if (str === null || str === undefined) return '';
        str = String(str);
        if (str.indexOf('$') === -1) return str;

        var segments = splitMathSegments(str, true);
        var out = '';
        for (var k = 0; k < segments.length; k++) {
            var seg = segments[k];
            if (seg.type === 'text') {
                out += seg.raw;
            } else if (seg.type === 'esc_dollar') {
                out += '$';
            } else if (seg.type === 'display') {
                out += '<span class="m-math m-block" data-math-done="1">' + renderMathInner(seg.raw) + '</span>';
            } else {
                out += '<span class="m-math" data-math-done="1">' + renderMathInner(seg.raw) + '</span>';
            }
        }
        return out;
    }

    function ensureMathStyles() {
        if (typeof document === 'undefined' || !document.head) return;
        if (document.getElementById('ders-cekirdek-math-style')) return;
        var st = document.createElement('style');
        st.id = 'ders-cekirdek-math-style';
        st.textContent =
            '.m-math{font-family:"Cambria Math","STIX Two Math","Times New Roman",serif;}' +
            '.m-math.m-block{display:block;text-align:center;margin:10px 0;font-size:1.12em;}' +
            '.m-frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 3px;line-height:1.15;white-space:nowrap;}' +
            '.m-num{border-bottom:1.5px solid currentColor;padding:0 4px 2px;font-size:0.92em;}' +
            '.m-den{padding:2px 4px 0;font-size:0.92em;}' +
            '.m-sqrt{display:inline-flex;align-items:baseline;vertical-align:middle;white-space:nowrap;}' +
            '.m-root-idx{font-size:0.7em;margin-right:1px;}' +
            '.m-rad{font-weight:600;margin-right:1px;}' +
            '.m-radicand{border-top:1.5px solid currentColor;padding:0 2px;line-height:1.15;}' +
            '.m-bb{font-weight:700;}' +
            '.m-text{font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;font-style:normal;}' +
            '.m-boxed{display:inline-block;border:1.5px solid currentColor;padding:2px 6px;border-radius:4px;}';
        document.head.appendChild(st);
    }

    var MATH_SKIP_TAGS = {
        SCRIPT: true, STYLE: true, TEXTAREA: true, INPUT: true,
        CODE: true, PRE: true, SVG: true, CANVAS: true
    };

    function shouldSkipElement(el) {
        if (!el || el.nodeType !== 1) return false;
        var tag = el.tagName ? el.tagName.toUpperCase() : '';
        if (MATH_SKIP_TAGS[tag]) return true;
        if (el.classList && el.classList.contains('m-math')) return true;
        if (el.getAttribute && el.getAttribute('data-math-done') === '1') return true;
        return false;
    }

    /**
     * Sayfadaki (veya verilen kök düğümdeki) tüm $...$ ve $$...$$ metin düğümlerini işler (idempotent).
     */
    function renderPageMath(root) {
        ensureMathStyles();
        if (typeof document === 'undefined') return root;
        root = root || document.body;
        if (!root) return root;

        var anc = root;
        while (anc && anc.nodeType === 1) {
            if (shouldSkipElement(anc)) return root;
            anc = anc.parentNode;
        }

        var textNodes = [];
        function collect(node) {
            if (!node) return;
            if (node.nodeType === 3) {
                if (node.nodeValue && node.nodeValue.indexOf('$') !== -1) {
                    textNodes.push(node);
                }
                return;
            }
            if (node.nodeType === 1 && shouldSkipElement(node)) return;
            for (var c = node.firstChild; c; c = c.nextSibling) {
                collect(c);
            }
        }
        collect(root);

        for (var i = 0; i < textNodes.length; i++) {
            var tn = textNodes[i];
            if (!tn.parentNode) continue;
            var segs = splitMathSegments(tn.nodeValue, false);
            var hasMathOrEsc = false;
            for (var s = 0; s < segs.length; s++) {
                if (segs[s].type !== 'text') { hasMathOrEsc = true; break; }
            }
            if (!hasMathOrEsc) continue;

            var frag = document.createDocumentFragment();
            for (var k = 0; k < segs.length; k++) {
                var seg = segs[k];
                if (seg.type === 'text') {
                    frag.appendChild(document.createTextNode(seg.raw));
                } else if (seg.type === 'esc_dollar') {
                    var escSpan = document.createElement('span');
                    escSpan.setAttribute('data-math-done', '1');
                    escSpan.textContent = '$';
                    frag.appendChild(escSpan);
                } else {
                    var span = document.createElement('span');
                    span.className = seg.type === 'display' ? 'm-math m-block' : 'm-math';
                    span.setAttribute('data-math-done', '1');
                    span.innerHTML = renderMathInner(seg.raw);
                    frag.appendChild(span);
                }
            }
            tn.parentNode.replaceChild(frag, tn);
        }

        return root;
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
        h += '  <div class="bilgi-govde">' + formatMath(icerik) + '</div>';
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
        h += '  <div class="dikkat-govde">' + formatMath(icerik) + '</div>';
        h += '</div>';
        return h;
    }

    /**
     * 3 Kademeli Sınav / Test Soru Motoru
     * Her soru: { id, level: 1|2|3, question, options: [...], correct: 0..3, explanation, targetSet }
     */
    function createQuizEngine(containerId, questions, options) {
        options = options || {};
        ensureMathStyles();
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

            h += '  <div class="quiz-question">' + formatMath(q.question) + '</div>';
            h += '  <div class="quiz-options">';
            q.options.forEach(function (opt, idx) {
                var isChecked = answers[q.id] === idx ? 'checked' : '';
                h += '    <label class="quiz-option" id="opt-lbl-' + idx + '">';
                h += '      <input type="radio" name="quiz_opt" value="' + idx + '" ' + isChecked + ' onchange="window._quizSelect(' + idx + ')">';
                h += '      <span class="opt-text">' + formatMath(opt) + '</span>';
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
                               '<div class="explanation-box">' + formatMath(q.explanation) + '</div>';
            }

            if (btnCheck) btnCheck.style.display = 'none';
            if (btnNext) btnNext.style.display = 'inline-block';
        }

        function renderResult() {
            if (!container) return;
            var pct = Math.round((score / questions.length) * 100);
            var h = '<div class="quiz-result-card">';
            h += '  <h2>🏁 Alıştırma Tamamlandı!</h2>';
            h += '  <div class="quiz-score-badge">' + score + ' / ' + questions.length + ' (%' + pct + ')</div>';
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

    if (typeof document !== 'undefined' && document.addEventListener) {
        document.addEventListener('DOMContentLoaded', function () {
            renderPageMath(document.body);
        });
    }

    return {
        MINUS: MINUS,
        SETS: SETS,
        esc: esc,
        formatSayi: formatSayi,
        fmtTR: fmtTR,
        formatMath: formatMath,
        renderPageMath: renderPageMath,
        checkClosure: checkClosure,
        renderBilgiKutusu: renderBilgiKutusu,
        renderDikkatKutusu: renderDikkatKutusu,
        createQuizEngine: createQuizEngine
    };
}));
