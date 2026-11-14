(function () {
  var D = window.UFDATA, $ = function (s) { return document.querySelector(s); };
  var home = $('#homeView'), view = $('#view'), nf = 'all';
  var CAT = { academic: ['أكاديمي', '#1d6be0', '#e4eeff', 'cal'], admin: ['إداري', '#8b5cf6', '#efe7ff', 'file'], finance: ['مالي', '#22a559', '#e1f6e9', 'wallet'] };
  var DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']; // ترتيب JavaScript (0=الأحد)
  var SDAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']; // ترتيب الجدول الرسمي (0=السبت)
  var demo = '<span class="demo-badge">بيانات تجريبية</span>';

  // ---- الإشعارات ----
  var memRead = [], memChat = [];
  function rd() { try { return JSON.parse(localStorage.getItem('uniflow_read')) || []; } catch (e) { return memRead; } }
  function wr(a) { memRead = a; try { localStorage.setItem('uniflow_read', JSON.stringify(a)); } catch (e) {} }
  function badge() {
    var r = rd(), c = D.notifications.filter(function (n) { return r.indexOf(n.id) < 0; }).length;
    document.querySelectorAll('[data-unread]').forEach(function (b) { b.hidden = !c; b.textContent = c; });
    return c;
  }
  function ago(m) { return m < 60 ? 'قبل ' + m + ' دقيقة' : m < 1440 ? 'قبل ' + Math.round(m / 60) + ' ساعة' : 'قبل ' + Math.round(m / 1440) + ' يوم'; }
  function vNotif() {
    var r = rd(), F = [['all', 'الكل'], ['unread', 'غير المقروءة'], ['academic', 'أكاديمي'], ['admin', 'إداري'], ['finance', 'مالي']];
    var L = D.notifications.filter(function (n) { return nf === 'all' || (nf === 'unread' ? r.indexOf(n.id) < 0 : n.cat === nf); });
    view.innerHTML = '<div class="pg-head"><h1>الإشعارات ' + demo + '</h1><button class="btn-s" data-act="readall">تعليم الكل كمقروء</button></div>' +
      '<div class="chips">' + F.map(function (f) { return '<button data-f="' + f[0] + '"' + (f[0] === nf ? ' class="on"' : '') + '>' + f[1] + '</button>'; }).join('') + '</div>' +
      '<div class="panel">' + (L.length ? L.map(function (n) {
        var c = CAT[n.cat], un = r.indexOf(n.id) < 0;
        return '<div class="nit' + (un ? ' un' : '') + '" data-id="' + n.id + '"><span class="ni" style="background:' + c[2] + ';color:' + c[1] + '"><svg><use href="#' + c[3] + '"/></svg></span><p>' + n.t + '<small>' + c[0] + ' · ' + n.f + '</small></p><time>' + ago(n.m) + '</time>' + (un ? '<i class="dot"></i>' : '') + '</div>';
      }).join('') : '<p class="empty">لا توجد إشعارات في هذا التصنيف</p>') + '</div>';
    badge();
  }

  // ---- المساعد الذكي (قواعد محلية، بلا نموذج ذكاء اصطناعي) ----
  function norm(s) { return String(s).replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase(); }
  function has(q, ws) { return ws.some(function (w) { return q.indexOf(norm(w)) >= 0; }); }
  function crs(q) { return D.courses.filter(function (c) { return [c.n].concat(c.al).some(function (a) { return q.indexOf(norm(a)) >= 0; }); })[0]; }
  // تحويل رقم يوم JavaScript (0=الأحد..6=السبت) إلى فهرس الجدول (0=السبت..5=الخميس؛ الجمعة=6 خارج الجدول)
  function js2s(d) { return d === 6 ? 0 : d + 1; }
  function day(d) {
    var si = js2s(d), L = [];
    D.courses.forEach(function (c) { c.slots.forEach(function (s) { if (s[0] === si) L.push([s[1], s[2], c]); }); });
    L.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    return L.length ? L.map(function (x) { return '• ' + x[2].n + ' (' + x[0] + ' - ' + x[1] + ' · ' + x[2].room + ' · ' + x[2].dr + ')'; }).join('\n') : null;
  }
  function ask(raw) {
    var q = norm(raw), c = crs(q), f = D.fees, d = new Date().getDay();
    if (has(q, ['السلام', 'مرحبا', 'اهلا'])) return 'أهلاً بك! أستطيع مساعدتك في الجدول والدرجات والحضور والرسوم والدكاترة. اسألني مثلاً: «ما جدول اليوم؟»';
    if (has(q, ['معدل', 'gpa', 'تراكمي'])) return 'معدلك التراكمي التجريبي هو ' + D.gpa + ' من 4.00.';
    if (has(q, ['رسوم', 'قسط', 'اقساط', 'متبقي', 'سداد', 'دفع', 'مدفوع'])) return 'إجمالي الرسوم ' + f.total.toLocaleString('ar') + ' ' + f.cur + '، المدفوع ' + f.paid.toLocaleString('ar') + '، والمتبقي ' + (f.total - f.paid).toLocaleString('ar') + '.\nالقسط القادم ' + f.nextAmt.toLocaleString('ar') + ' ' + f.cur + ' بعد ' + f.nextDays + ' يوماً.';
    if (has(q, ['حضور', 'غياب', 'غبت'])) {
      if (c) return 'حضورك في ' + c.n + ': ' + c.att[0] + ' من ' + c.att[1] + ' (' + Math.round(c.att[0] / c.att[1] * 100) + '%)، وغيابك ' + (c.att[1] - c.att[0]) + ' محاضرات.';
      return D.courses.map(function (x) { return '• ' + x.n + ': ' + Math.round(x.att[0] / x.att[1] * 100) + '%'; }).join('\n');
    }
    if (has(q, ['درجه', 'درجات', 'درجت', 'نتيج', 'نتايج', 'نتائج', 'علام'])) {
      if (c) return 'في ' + c.n + ': أعمال الفصل ' + c.w[0] + '/20 والنصفي ' + c.w[1] + '/30، والمجموع حتى الآن ' + (c.w[0] + c.w[1]) + ' من 50. النهائي لم يُرصد بعد.';
      return D.courses.map(function (x) { return '• ' + x.n + ': ' + (x.w[0] + x.w[1]) + '/50'; }).join('\n') + '\n(المجموع حتى الآن، دون النهائي)';
    }
    if (has(q, ['دكتور', 'مدرس', 'مكتب', 'مكتبيه'])) {
      if (c) return c.dr + ' يدرّس ' + c.n + '. المكتب والساعات المكتبية: ' + c.office + '.';
      return D.courses.map(function (x) { return '• ' + x.dr + ' (' + x.n + ')'; }).join('\n');
    }
    if (has(q, ['اشعار'])) return 'لديك ' + badge() + ' إشعارات غير مقروءة. افتح صفحة «الإشعارات» لعرضها.';
    if (has(q, ['جدول', 'محاضر', 'اليوم', 'غدا', 'بكره', 'موعد', 'متي'])) {
      if (c) { return c.n + ': ' + c.slots.map(function (s) { return SDAYS[s[0]] + ' ' + s[1] + ' - ' + s[2]; }).join('، ') + ' في ' + c.room + ' مع ' + c.dr + '.'; }
      // سؤال عن يوم محدد بالاسم: «ما جدول السبت؟»
      var dn = [['سبت', 6], ['احد', 0], ['اثنين', 1], ['ثلاثاء', 2], ['اربعاء', 3], ['خميس', 4], ['جمعه', 5]].filter(function (x) { return q.indexOf(x[0]) >= 0; })[0];
      if (dn) { var Ld = day(dn[1]); return Ld ? 'محاضرات يوم ' + DAYS[dn[1]] + ':\n' + Ld : 'لا توجد محاضرات يوم ' + DAYS[dn[1]] + '.'; }
      var tm = has(q, ['غدا', 'بكره']), dd = tm ? (d + 1) % 7 : d, L = day(dd);
      return L ? 'محاضرات ' + (tm ? 'غد' : 'اليوم') + ' (' + DAYS[dd] + '):\n' + L : 'لا توجد محاضرات ' + (tm ? 'غداً' : 'اليوم') + ' (' + DAYS[dd] + ').';
    }
    return 'لم أفهم سؤالك بعد. جرّب أحد الأسئلة المقترحة أعلاه، فأنا أجيب حالياً عن الجدول والدرجات والحضور والرسوم والدكاترة فقط.';
  }
  function chat() { try { return JSON.parse(sessionStorage.getItem('uniflow_chat')) || []; } catch (e) { return memChat; } }
  function keep(h) { memChat = h; try { sessionStorage.setItem('uniflow_chat', JSON.stringify(h)); } catch (e) {} }
  function bubble(box, r, t) { var m = document.createElement('div'); m.className = 'msg ' + r; m.textContent = t; box.appendChild(m); box.scrollTop = box.scrollHeight; return m; }
  function vChat() {
    var S = ['ما جدول اليوم؟', 'ما جدول السبت؟', 'ما درجاتي؟', 'كم نسبة حضوري؟', 'كم المتبقي من الرسوم؟', 'من دكتور التشفير؟'];
    view.innerHTML = '<div class="pg-head"><h1>المساعد الذكي ' + demo + '</h1></div><p class="meta">مساعد تجريبي يجيب من بيانات حسابك التجريبية فقط، وليس نموذج ذكاء اصطناعي حقيقياً.</p>' +
      '<div class="chips">' + S.map(function (s) { return '<button data-q="' + s + '">' + s + '</button>'; }).join('') + '</div>' +
      '<div class="panel"><div class="chat" id="chat"></div><div class="send"><input id="chatIn" type="text" placeholder="اكتب سؤالك هنا..." autocomplete="off"><button class="btn-s" data-act="send">إرسال</button></div></div>';
    var box = $('#chat'), h = chat();
    if (!h.length) h = [['b', 'أهلاً بك في مساعد UniFlow التجريبي. كيف أساعدك اليوم؟']];
    h.forEach(function (m) { bubble(box, m[0], m[1]); });
    keep(h);
  }
  function send(text) {
    text = String(text || '').trim(); var box = $('#chat'); if (!text || !box) return;
    var h = chat(); if (!h.length) h = [['b', 'أهلاً بك في مساعد UniFlow التجريبي. كيف أساعدك اليوم؟']];
    bubble(box, 'u', text); h.push(['u', text]);
    var t = bubble(box, 'b t', '…');
    setTimeout(function () {
      var a = ask(text); t.className = 'msg b'; t.textContent = a; box.scrollTop = box.scrollHeight; h.push(['b', a]);
      keep(h.slice(-40));
    }, 450);
    $('#chatIn').value = '';
  }

  // ---- التنقل بالمسارات ----
  function route() {
    var r = (location.hash.replace(/^#\/?/, '') || 'home').split('/')[0];
    var V = window.UFViews || {};
    if (['home', 'notifications', 'assistant'].indexOf(r) < 0 && !V[r]) r = 'home';
    home.hidden = r !== 'home'; view.hidden = r === 'home';
    if (r === 'notifications') vNotif(); else if (r === 'assistant') vChat(); else if (V[r]) view.innerHTML = V[r]();
    document.querySelectorAll('aside nav a,.bn a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#/' + r); });
    window.scrollTo(0, 0);
  }
  document.addEventListener('click', function (e) {
    var b;
    if ((b = e.target.closest('[data-go]'))) { location.hash = '#/' + b.dataset.go; return; }
    if (view.hidden) return;
    if ((b = e.target.closest('[data-f]'))) { nf = b.dataset.f; vNotif(); }
    else if ((b = e.target.closest('.nit'))) { var r = rd(), id = +b.dataset.id; if (r.indexOf(id) < 0) { r.push(id); wr(r); } vNotif(); }
    else if ((b = e.target.closest('[data-act="readall"]'))) { wr(D.notifications.map(function (n) { return n.id; })); vNotif(); }
    else if ((b = e.target.closest('[data-q]'))) send(b.dataset.q);
    else if (e.target.closest('[data-act="send"]')) send($('#chatIn').value);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.id === 'chatIn') send(e.target.value); });
  window.addEventListener('hashchange', route);
  window.UFPages = { ask: ask, render: route };
  badge(); route();

  // ---- محاضرات اليوم في الرئيسية (ديناميكية من الجدول الرسمي) ----
  function renderToday() {
    var box = document.getElementById('todayLecs');
    if (!box) return;
    var now = new Date(), d = now.getDay(), si = js2s(d), mins = now.getHours() * 60 + now.getMinutes(), L = [];
    if (si < 6) D.courses.forEach(function (c) {
      c.slots.forEach(function (s) {
        if (s[0] !== si) return;
        var st = parseInt(s[1], 10) * 60 + parseInt(s[1].slice(3), 10), en = parseInt(s[2], 10) * 60 + parseInt(s[2].slice(3), 10);
        L.push([st, en, c]);
      });
    });
    L.sort(function (a, b) { return a[0] - b[0]; });
    box.innerHTML = L.length ? L.map(function (x) {
      var st = x[0], en = x[1], c = x[2];
      var stT = String(Math.floor(st / 60)).padStart(2, '0') + ':' + String(st % 60).padStart(2, '0');
      var enT = String(Math.floor(en / 60)).padStart(2, '0') + ':' + String(en % 60).padStart(2, '0');
      var cls = mins >= en ? 'badge f' : mins >= st ? 'badge live' : 'badge';
      var lbl = mins >= en ? 'انتهت' : mins >= st ? 'جارية الآن' : 'قادمة';
      return '<div class="lec"><b>' + c.n + '</b><div class="sub"><span><svg><use href="#clock"/></svg><bdi dir="ltr">' + enT + ' - ' + stT + '</bdi></span><span><svg><use href="#pin"/></svg>' + c.room + '</span><span><svg><use href="#user"/></svg>' + c.dr + '</span></div><span class="' + cls + '">' + lbl + '</span></div>';
    }).join('') : '<p class="empty">لا توجد محاضرات اليوم (' + DAYS[d] + ') 🎉</p>';
  }
  renderToday();
})();
