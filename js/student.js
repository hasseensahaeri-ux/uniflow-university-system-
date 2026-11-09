(function () {
  // الوضع الليلي
  var root = document.documentElement;
  try { root.dataset.theme = localStorage.getItem('uniflow_theme') || 'light'; } catch (e) {}

  var btn = document.getElementById('themeBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('uniflow_theme', root.dataset.theme); } catch (e) {}
    });
  }

  // الوقت: صورة الحرم والتحية
  var h = new Date().getHours();
  root.dataset.time = (h >= 6 && h < 17) ? 'day' : (h >= 17 && h < 19) ? 'sunset' : 'night';

  // التحية حسب ساعة الجهاز (تعمل دون إنترنت)
  var greet = document.querySelector('[data-greeting]');
  if (greet) {
    if (h >= 5 && h < 12) greet.textContent = 'صباح الخير ☀️';
    else if (h >= 12 && h < 17) greet.textContent = 'طاب يومك 🌤️';
    else greet.textContent = 'مساء الخير 🌙';
  }

  // بيانات المستخدم من الجلسة (تُكتب عند تسجيل الدخول)
  var u = null;
  try { u = JSON.parse(sessionStorage.getItem('uniflow_user') || 'null'); } catch (e) {}

  if (u && u.name) {
    var set = function (attr, text) {
      document.querySelectorAll('[' + attr + ']').forEach(function (n) { n.textContent = text; });
    };
    set('data-user-name', u.name);
    set('data-user-first', u.name.split(' ')[0]);
    set('data-user-initial', u.name.charAt(0));
  }

  // الصورة الشخصية: مخصصة (u.avatar) ثم حسب الجنس، وإلا صورة رمزية عامة
  var AVATARS = { male: 'images/student_male.webp', female: 'images/student_female.webp' };
  var DEFAULT_AVATAR = '<svg class="av-default" viewBox="0 0 40 40" aria-hidden="true">' +
    '<circle cx="20" cy="15" r="7"/><path d="M5 40c0-9 6.7-14 15-14s15 5 15 14z"/></svg>';
  var av = document.querySelector('[data-avatar]');
  if (av) {
    var showDefault = function () {
      av.classList.add('default');
      av.innerHTML = DEFAULT_AVATAR;
    };
    var ls = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
    var gen = ls('uniflow_gender'); if (gen === null) gen = u && u.gender;
    var src = (u && u.avatar) || ls('uniflow_avatar') || AVATARS[gen] || '';
    var img = av.querySelector('img');
    if (!src || !img) {
      showDefault();
    } else {
      img.onerror = showDefault;
      img.src = src;
    }
  }

  // عبارة تحفيزية تتغير عند كل فتح للصفحة
  var QUOTES = [
    'مستقبلك يبدأ بخطوة اليوم ✨',
    'استمر، فأنت تقترب من هدفك 🎓',
    'كل يوم فرصة جديدة للنجاح 📚',
    'اجعل طموحك أكبر من التحديات 🚀'
  ];
  var quote = document.querySelector('.user-quote');
  if (quote) {
    var i = Math.floor(Math.random() * QUOTES.length);
    try {
      var last = parseInt(localStorage.getItem('uniflow_quote'), 10);
      if (i === last) i = (i + 1) % QUOTES.length; // لا تكرر نفس العبارة مرتين متتاليتين
      localStorage.setItem('uniflow_quote', String(i));
    } catch (e) {}
    quote.textContent = QUOTES[i];
  }
  // ===== البانر: مشهد الوقت والطقس =====
  var hero = document.querySelector('.hero');
  var sky = document.querySelector('[data-sky]');
  var chip = document.querySelector('[data-wx-chip]');
  var wxNow = null;
  var rnd = function (i, m) { return (i * 47 + 13) % m; };

  function buildSky() {
    if (!sky) return;
    var t = root.dataset.time, s = wxNow && wxNow.state, o = '', i;
    var clear = !s || s === 'clear', cloudy = s === 'cloudy';
    if (clear || cloudy) o += t === 'night' ? '<i class="moon"></i>' : '<i class="sun"></i>';
    if (t === 'night' && clear) for (i = 0; i < 16; i++) o += '<i class="star" style="left:' + rnd(i, 95) + '%;top:' + rnd(i + 5, 70) + '%;animation-delay:' + (i % 5) * 0.6 + 's"></i>';
    var nc = clear ? 1 : (s === 'fog' ? 0 : 4);
    for (i = 0; i < nc; i++) o += '<i class="cloud" style="left:' + (8 + i * 22) + '%;top:' + (14 + (i % 3) * 22) + '%;animation-duration:' + (20 + i * 5) + 's"></i>';
    if (s === 'rain' || s === 'storm') for (i = 0; i < 22; i++) o += '<i class="drop" style="left:' + rnd(i, 98) + '%;animation-delay:-' + (i % 7) * 0.12 + 's;animation-duration:' + (s === 'storm' ? 0.55 : 0.85) + 's"></i>';
    if (s === 'fog') for (i = 0; i < 3; i++) o += '<i class="fog" style="top:' + (22 + i * 26) + '%;animation-delay:-' + i * 4 + 's"></i>';
    if (s === 'storm') o += '<i class="bolt"></i>';
    sky.innerHTML = o;
    if (hero) hero.dataset.wx = s || 'clear';
  }

  var LABEL = { clear: 'مشمس', cloudy: 'غائم', rain: 'ممطر', fog: 'ضبابي', storm: 'عاصف' };
  var ICON = { clear: '☀️', cloudy: '☁️', rain: '🌧️', fog: '🌫️', storm: '⛈️' };
  function mapWx(c, w) {
    if (c >= 95 || w >= 50) return 'storm';
    if (c === 45 || c === 48) return 'fog';
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rain';
    if (c === 2 || c === 3 || (c >= 71 && c <= 77) || c === 85 || c === 86) return 'cloudy';
    return 'clear';
  }
  function showWx(d) {
    wxNow = d; buildSky();
    if (!chip) return;
    var nightClear = root.dataset.time === 'night' && d.state === 'clear';
    chip.hidden = false; chip.disabled = true; chip.onclick = null;
    chip.textContent = (nightClear ? '🌙' : ICON[d.state]) + ' ' + d.temp + '° ' + (nightClear ? 'صافٍ' : LABEL[d.state]);
  }
  var WKEY = 'uniflow_wx';
  function cached(maxAge) {
    try { var c = JSON.parse(localStorage.getItem(WKEY)); if (c && Date.now() - c.t < maxAge) return c; } catch (e) {}
    return null;
  }
  function stale() { var o = cached(6 * 3600e3); if (o) showWx(o); else if (chip) chip.hidden = true; }
  function fetchWx(lat, lon) {
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    return fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto', ctl ? { signal: ctl.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (j) {
        clearTimeout(to);
        var c = j.current;
        var d = { t: Date.now(), state: mapWx(c.weather_code, c.wind_speed_10m), temp: Math.round(c.temperature_2m) };
        try { localStorage.setItem(WKEY, JSON.stringify(d)); } catch (e) {}
        showWx(d);
      })
      .catch(function () { clearTimeout(to); stale(); });
  }
  function locate() {
    navigator.geolocation.getCurrentPosition(
      function (p) { fetchWx(p.coords.latitude, p.coords.longitude); },
      stale, { timeout: 10000, maximumAge: 600000 });
  }
  function initWx() {
    var fresh = cached(30 * 60e3);
    if (fresh) { showWx(fresh); return; }
    if (!navigator.geolocation) { stale(); return; }
    var ask = function () {
      if (!chip) return;
      chip.hidden = false; chip.disabled = false; chip.textContent = '📍 فعّل طقس موقعك';
      chip.onclick = function () { chip.disabled = true; chip.textContent = '…'; locate(); };
    };
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (p) {
        if (p.state === 'granted') locate(); else if (p.state === 'prompt') ask(); else stale();
      }).catch(ask);
    } else ask();
  }
  buildSky();
  try { initWx(); } catch (e) { stale(); }
})();
