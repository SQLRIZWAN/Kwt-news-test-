/* ========== Kuwait News - Main JS ========== */
'use strict';

// ---- Service Worker Registration ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/kwt-news-test-/service-worker.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW error:', err));
  });
}

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initLiveClock();
  initPWAInstall();
  initScrollTop();
  initSearch();
  initCategoryFilter();
  initTicker();
  loadWeather();
  initNavActive();
  renderNews();
});

// ---- Loading Screen ----
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  setTimeout(() => screen.classList.add('hidden'), 1400);
  setTimeout(() => screen.remove(), 1900);
}

// ---- Live Clock ----
function initLiveClock() {
  const el = document.getElementById('live-time');
  if (!el) return;
  function update() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  update();
  setInterval(update, 1000);
}

// ---- PWA Install Prompt ----
let deferredPrompt = null;

function initPWAInstall() {
  const btnHeader = document.getElementById('btn-install');
  const banner = document.getElementById('install-banner');
  const btnBanner = document.getElementById('btn-add-home');
  const btnDismiss = document.getElementById('btn-dismiss-banner');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (btnHeader) btnHeader.classList.remove('hidden');
    if (banner) {
      setTimeout(() => banner.classList.add('show'), 3000);
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (btnHeader) btnHeader.classList.add('hidden');
    if (banner) banner.classList.remove('show');
    showToast('تم تثبيت التطبيق بنجاح! 🎉', 'success');
  });

  async function triggerInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') showToast('جاري التثبيت...', 'success');
    deferredPrompt = null;
    if (btnHeader) btnHeader.classList.add('hidden');
  }

  if (btnHeader) btnHeader.addEventListener('click', triggerInstall);
  if (btnBanner) btnBanner.addEventListener('click', triggerInstall);
  if (btnDismiss) btnDismiss.addEventListener('click', () => banner.classList.remove('show'));

  // iOS Safari instructions
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isIOS && !isStandalone && banner) {
    banner.classList.add('show');
    const p = banner.querySelector('p');
    if (p) p.textContent = 'اضغط على زر المشاركة ثم "إضافة إلى الشاشة الرئيسية"';
    if (btnBanner) btnBanner.style.display = 'none';
  }
}

// ---- Scroll To Top ----
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---- Search ----
function initSearch() {
  const input = document.querySelector('.search-bar input');
  const btn = document.querySelector('.search-bar button');
  if (!input) return;
  function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    showToast(`جاري البحث عن: ${q}`, 'info');
  }
  btn && btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

// ---- Category Filter Pills ----
function initCategoryFilter() {
  const pills = document.querySelectorAll('.pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.cat;
      filterNews(cat);
    });
  });
}

function filterNews(cat) {
  const cards = document.querySelectorAll('.news-card[data-cat]');
  cards.forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? '' : 'none';
  });
}

// ---- Ticker Duplicate ----
function initTicker() {
  ['.ticker-inner', '.breaking-scroll'].forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.innerHTML += el.innerHTML; // duplicate for seamless loop
  });
}

// ---- Toast ----
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- Weather (Kuwait City) ----
function loadWeather() {
  // Static Kuwait weather display - can be connected to a real API
  const data = {
    city: 'مدينة الكويت',
    temp: 34,
    desc: 'مشمس وجاف',
    icon: '☀️',
    humidity: '28%',
    wind: '18 كم/س',
    feels: '37°',
    uv: '9'
  };
  const w = document.getElementById('weather-widget');
  if (!w) return;
  w.innerHTML = `
    <div class="weather-city">${data.city}</div>
    <div class="weather-icon">${data.icon}</div>
    <div class="weather-temp">${data.temp}°</div>
    <div class="weather-desc">${data.desc}</div>
    <div class="weather-details">
      <div class="weather-detail"><strong>${data.humidity}</strong>رطوبة</div>
      <div class="weather-detail"><strong>${data.wind}</strong>رياح</div>
      <div class="weather-detail"><strong>${data.feels}</strong>يبدو</div>
      <div class="weather-detail"><strong>${data.uv}</strong>أشعة UV</div>
    </div>
  `;
}

// ---- Nav Active ----
function initNavActive() {
  const links = document.querySelectorAll('.nav-list a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// ---- News Data ----
const NEWS_DATA = [
  { id:1, cat:'محلي', title:'مجلس الوزراء يعتمد خطة التنمية الاقتصادية للسنة القادمة', desc:'أعلن مجلس الوزراء الكويتي عن اعتماد خطة التنمية الاقتصادية الشاملة للعام القادم، والتي تتضمن مشاريع بنية تحتية ضخمة.', time:'منذ ساعة', views:'4.2K', emoji:'🏛️' },
  { id:2, cat:'رياضة', title:'المنتخب الكويتي يحقق فوزاً ساحقاً في تصفيات كأس الخليج', desc:'سجل المنتخب الكويتي لكرة القدم فوزاً كبيراً بثلاثة أهداف مقابل هدف واحد في مباراة التصفيات.', time:'منذ ساعتين', views:'8.7K', emoji:'⚽' },
  { id:3, cat:'اقتصاد', title:'ارتفاع أسعار النفط الكويتي إلى 88 دولاراً للبرميل', desc:'شهدت أسواق النفط العالمية ارتفاعاً ملحوظاً في أسعار النفط الكويتي وسط تراجع المخزونات العالمية.', time:'منذ 3 ساعات', views:'6.1K', emoji:'🛢️' },
  { id:4, cat:'تقنية', title:'الكويت تطلق منصة حكومية رقمية لتسهيل الخدمات الإلكترونية', desc:'كشفت الحكومة الكويتية عن منصة رقمية متكاملة تجمع كافة الخدمات الحكومية في مكان واحد.', time:'منذ 4 ساعات', views:'3.9K', emoji:'💻' },
  { id:5, cat:'صحة', title:'وزارة الصحة تعلن عن حملة تطعيم شاملة في جميع المناطق', desc:'أطلقت وزارة الصحة الكويتية حملة تطعيم موسعة تستهدف الفئات الأكثر عرضة للخطر في المجتمع.', time:'منذ 5 ساعات', views:'5.3K', emoji:'🏥' },
  { id:6, cat:'محلي', title:'افتتاح أكبر مركز تجاري في منطقة السالمية', desc:'شهدت منطقة السالمية افتتاح أضخم مركز تجاري في تاريخ الكويت بحضور رجال الأعمال والمسؤولين.', time:'منذ 6 ساعات', views:'7.8K', emoji:'🏬' },
  { id:7, cat:'عالمي', title:'الكويت تشارك في مؤتمر المناخ الدولي بجنيف', desc:'وفد كويتي رفيع المستوى يشارك في مؤتمر المناخ الدولي للتفاوض حول تقليل الانبعاثات الكربونية.', time:'أمس', views:'2.1K', emoji:'🌍' },
  { id:8, cat:'اقتصاد', title:'بورصة الكويت تسجل مكاسب قوية بدعم من قطاع البنوك', desc:'أغلقت بورصة الكويت على ارتفاع ملحوظ بدعم من الأداء القوي لأسهم القطاع البنكي والمالي.', time:'أمس', views:'4.5K', emoji:'📈' },
  { id:9, cat:'رياضة', title:'نادي الكويت يتأهل إلى نهائي كأس الأمير', desc:'تأهل نادي الكويت لكرة القدم إلى نهائي كأس الأمير بعد فوزه على منافسه بهدفين.', time:'أمس', views:'9.2K', emoji:'🏆' },
];

function renderNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  grid.innerHTML = NEWS_DATA.map(n => `
    <article class="news-card" data-cat="${n.cat}" onclick="openArticle(${n.id})">
      <div class="thumb">
        <span>${n.emoji}</span>
        <span class="cat-tag">${n.cat}</span>
      </div>
      <div class="body">
        <h3>${n.title}</h3>
        <p>${n.desc}</p>
        <div class="meta">
          <span>🕐 ${n.time}</span>
          <span class="views">${n.views}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function openArticle(id) {
  const article = NEWS_DATA.find(n => n.id === id);
  if (article) showToast(`تفتح: ${article.title.substring(0, 40)}...`, 'info');
}
