/*! referans_baglanti.js — her araçta sol altta "📘 Sayı Rehberi" kısayolu (sayilar_rehberi.html) */
(function () {
    if (/sayilar_rehberi\.html$/.test(location.pathname)) return;
    function ekle() {
        var a = document.createElement('a');
        a.href = 'sayilar_rehberi.html';
        a.id = 'sayiRehberiKisayol';
        a.title = 'Sayı kümeleri ve işlem özellikleri rehberi';
        a.setAttribute('aria-label', 'Sayı Rehberi: sayı kümeleri ve işlem özellikleri');
        a.textContent = '📘 Sayı Rehberi';
        a.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:9999;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;' +
            'font:600 14px/1 "Segoe UI",Tahoma,sans-serif;padding:10px 16px;border-radius:24px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.3)';
        document.body.appendChild(a);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ekle); else ekle();
}());
