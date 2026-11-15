(function () {
  var D = window.UFDATA, root = document.documentElement, view = document.getElementById('view');
  var DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  var u = null; try { u = JSON.parse(sessionStorage.getItem('uniflow_user') || 'null'); } catch (e) {}
  // حارس واجهة فقط؛ الحماية الحقيقية تتطلب Backend (انظر التقرير)
  if (!u || u.role !== 'doctor') { location.replace('index.html'); return; }
  var MY = D.courses.filter(function (c) { return c.dr === u.name; });
  var R = function (k) { return (window.UFROSTER || {})[k] || []; };
  var st = { k: MY[0] && MY[0].k, date: new Date().toISOString().slice(0, 10), q: '', chat: null }, files = {};
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var S = (function () { try { return JSON.parse(localStorage.getItem('uf_shared') || '{}'); } catch (e) { return {}; } })();
  ['lectures', 'ann', 'tasks', 'log', 'chats'].forEach(function (k) { S[k] = S[k] || []; }); S.att = S.att || {}; S.gr = S.gr || {};
  function save() { try { localStorage.setItem('uf_shared', JSON.stringify(S)); } catch (e) { alert('تعذّر الحفظ: ' + e.message); } }
  var own = function (k) { return MY.some(function (c) { return c.k === k; }); }; // فحص الملكية قبل أي كتابة
  var cn = function (k) { return (MY.filter(function (c) { return c.k === k; })[0] || {}).n || k; };
  var sel = function (name) { return '<select data-f="' + name + '">' + MY.map(function (c) { return '<option value="' + c.k + '"' + (c.k === st.k ? ' selected' : '') + '>' + c.n + '</option>'; }).join('') + '</select>'; };
  var hd = function (t) { return '<div class="pg-head"><h1>' + t + '</h1></div>'; };
  var tm = function (d) { return new Date(d).toLocaleDateString('ar', { day: 'numeric', month: 'long' }); };
  var attPct = function (k, id) { var n = 0, a = 0; Object.keys(S.att).forEach(function (key) { if (key.split('|')[0] === k && S.att[key][id]) { n++; if (S.att[key][id] !== 'غ') a++; } }); return n ? Math.round(a / n * 100) : null; };
  var sc = function (k) { var c = MY.filter(function (x) { return x.k === k; })[0]; return c && c.ty === 'عملي' ? { w: 10, m: 15, f: 25, t: 50 } : { w: 20, m: 30, f: 0, t: 50 }; };
  var total = function (k, id) { var g = (S.gr[k] || {})[id], c = sc(k); if (!g || g.w === undefined || g.m === undefined || (c.f && g.f === undefined)) return null; return +g.w + +g.m + (c.f ? +g.f : 0); };
  Object.keys(window.UFROSTER || {}).forEach(function (k) { if (!own(k)) return; var d = (S.gr[k] = S.gr[k] || {}); window.UFROSTER[k].forEach(function (x) { if (!d[x.id]) { var o = {}, any = false; ['w', 'm', 'f'].forEach(function (f) { if (x[f] !== undefined) { o[f] = x[f]; any = true; } }); if (any) d[x.id] = o; } }); });
  var has = function (k, id) { var g = (S.gr[k] || {})[id]; return !!g && ['w', 'm', 'f'].some(function (f) { return g[f] !== undefined; }); };
  var noR = '<p class="warn">لم يُرفع كشف طلاب لهذا المقرر بعد.</p>';
  function nextLec() {
    var now = new Date(), d0 = (now.getDay() + 1) % 7, hm = now.getHours() * 60 + now.getMinutes(), best = null;
    MY.forEach(function (c) { c.slots.forEach(function (s) { var p = s[1].split(':'), diff = ((s[0] - d0 + 7) % 7) * 1440 + (+p[0]) * 60 + (+p[1]) - hm; if (diff < 0) diff += 7 * 1440; if (!best || diff < best.d) best = { d: diff, c: c, s: s }; }); });
    return best;
  }
  function empty() { return hd('بوابة الدكتور') + '<p class="warn">لا توجد مقررات مسندة لهذا الحساب.</p>'; }

  var V = {
    home: function () {
      var wk = 0; MY.forEach(function (c) { wk += c.slots.length; });
      var mine = function (a) { return own(a.k); }, anns = S.ann.filter(mine), ts = S.tasks.filter(mine), nx = nextLec();
      var ps = []; MY.forEach(function (c) { R(c.k).forEach(function (s) { var p = attPct(c.k, s.id); if (p !== null) ps.push(p); }); });
      var avg = ps.length ? Math.round(ps.reduce(function (a, b) { return a + b; }, 0) / ps.length) + '%' : 'لا سجل بعد';
      var stat = function (t, v, h, c) { return '<a class="stat" href="#/' + h + '"><div class="row"><span class="ico" style="background:' + c + '"><svg><use href="#book"/></svg></span>' + t + '</div><div class="big">' + v + '</div></a>'; };
      return '<h1>مرحباً دكتور، ' + esc(u.name) + ' 👋</h1><p class="meta">الأمن السيبراني · المستوى الثاني · الفصل الثاني ' + (MY.some(function (c) { return !R(c.k).length; }) ? '<span class="demo-badge">بعض المقررات بلا كشف طلاب بعد</span>' : '') + '</p>' +
        '<section class="stats">' + stat('المقررات', MY.length, 'courses', '#f59e2b') + stat('الطلاب', Object.keys(MY.reduce(function (o, c) { R(c.k).forEach(function (x) { o[x.id] = 1; }); return o; }, {})).length, 'students', '#8b5cf6') + stat('محاضرات الأسبوع', wk, 'schedule', '#1d6be0') + stat('واجبات واختبارات', ts.length, 'tasks', '#22a559') + '</section>' +
        '<section class="cols"><div class="panel"><div class="ph"><h3>المحاضرة القادمة</h3></div>' + (nx ? '<div class="ev"><b>' + nx.c.n + '</b><span>' + DAYS[nx.s[0]] + ' ' + nx.s[1] + ' - ' + nx.s[2] + '</span><span>' + nx.c.room + '</span></div>' : '<p class="empty">—</p>') + '<div class="ph"><h3>ملخص الحضور</h3></div><p>متوسط الحضور المسجّل: <b>' + avg + '</b></p></div>' +
        '<div class="panel"><div class="ph"><h3>أحدث الإعلانات والأنشطة</h3></div>' + (anns.slice(-3).reverse().map(function (a) { return '<div class="nit"><p>' + esc(a.t) + '<small>' + esc(a.cn) + '</small></p><time>' + tm(a.ts) + '</time></div>'; }).join('') || '<p class="empty">لا إعلانات بعد</p>') +
        S.log.filter(mine).slice(-3).reverse().map(function (l) { return '<div class="nit"><p>' + esc(l.t) + '</p><time>' + tm(l.ts) + '</time></div>'; }).join('') + '</div></section>';
    },
    courses: function () {
      return hd('مقرراتي') + '<div class="gr">' + MY.map(function (c) { return '<div class="panel cd"><h3>' + c.n + ' <span class="ty-chip' + (c.ty === 'عملي' ? ' lab' : '') + '">' + c.ty + '</span></h3><p>المستوى الثاني · الشعبة: غير محددة في البيانات</p><p>عدد الطلاب: ' + R(c.k).length + (R(c.k).length ? '' : ' — لم يُرفع كشف الطلاب بعد') + '</p><p>' + c.room + ' · ' + c.slots.map(function (s) { return DAYS[s[0]] + ' ' + s[1] + '-' + s[2]; }).join('، ') + '</p></div>'; }).join('') + '</div>';
    },
    schedule: function () {
      var rows = []; MY.forEach(function (c) { c.slots.forEach(function (s) { rows.push([s, c]); }); }); rows.sort(function (a, b) { return a[0][0] - b[0][0] || (a[0][1] < b[0][1] ? -1 : 1); });
      return hd('جدولي الأسبوعي') + '<div class="panel wrapx"><table><thead><tr><th>اليوم</th><th>المادة</th><th>الوقت</th><th>القاعة/المعمل</th><th>المستوى</th><th>النوع</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + DAYS[r[0][0]] + '</td><td>' + r[1].n + '</td><td dir="ltr">' + r[0][1] + ' - ' + r[0][2] + '</td><td>' + r[1].room + '</td><td>الثاني</td><td>' + r[1].ty + '</td></tr>'; }).join('') + '</tbody></table></div>';
    },
    lectures: function () {
      var L = S.lectures.filter(function (l) { return own(l.k); });
      return hd('المحاضرات') + '<div class="panel cd"><div class="fm">' + sel('k') + '<input data-f="lt" placeholder="عنوان المحاضرة"><input data-f="ld" placeholder="الوصف"><input type="file" data-f="lf" accept=".pdf,.ppt,.pptx,.docx"></div><button class="btn-p" data-act="addLec">رفع المحاضرة</button> <small>الملف يُحفظ اسمه وحجمه فقط في المتصفح؛ تخزين الملف الفعلي يحتاج Backend.</small></div>' +
        '<div class="panel">' + (L.map(function (l) { return '<div class="nit"><span class="ni" style="background:#efe7ff;color:#8b5cf6;font-size:11px;font-weight:800">' + l.x + '</span><p>' + esc(l.t) + '<small>' + cn(l.k) + ' · ' + l.sz + ' · ' + tm(l.ts) + ' · ' + (l.pub ? 'منشورة للطلاب' : 'مسودة') + (l.d ? ' · ' + esc(l.d) : '') + '</small></p>' + (files[l.id] ? '<button class="btn-s" data-act="prev" data-id="' + l.id + '">معاينة</button> ' : '') + '<button class="btn-s" data-act="pub" data-id="' + l.id + '">' + (l.pub ? 'إلغاء النشر' : 'نشر') + '</button> <button class="btn-d" data-act="delLec" data-id="' + l.id + '">حذف</button></div>'; }).join('') || '<p class="empty">لا محاضرات</p>') + '</div>';
    },
    students: function () {
      var rows = R(st.k).filter(function (s) { return !st.q || s.n.indexOf(st.q) > -1 || s.id.indexOf(st.q) > -1; });
      return hd('الطلاب') + '<div class="fm">' + sel('k') + '<input data-f="q" placeholder="بحث بالاسم أو الرقم" value="' + esc(st.q) + '"><button class="btn-p" data-act="csv">تصدير CSV</button></div><div class="panel wrapx"><table><thead><tr><th>الاسم</th><th>م</th><th>الحضور</th><th>الدرجة</th></tr></thead><tbody>' + rows.map(function (s) { var p = attPct(st.k, s.id), t = total(st.k, s.id); return '<tr><td>' + s.n + '</td><td>' + s.id + '</td><td>' + (p === null ? '—' : p + '%') + '</td><td>' + (t === null ? (has(st.k, s.id) ? 'غير مكتملة' : '—') : t + ' / ' + sc(st.k).t) + '</td></tr>'; }).join('') + '</tbody></table></div>' + (R(st.k).length ? '<p class="meta">المصدر: كشف رصد الدرجات المرفوع. «م» رقم التسلسل في الكشف وليس الرقم الأكاديمي. المنقطعون (بلا أي درجة) غير مُدرجين.</p>' : noR);
    },
    attendance: function () {
      var key = st.k + '|' + st.date, rec = S.att[key] || {};
      return hd('الحضور والغياب') + '<div class="fm">' + sel('k') + '<input type="date" data-f="date" value="' + st.date + '"></div><div class="panel wrapx"><table><thead><tr><th>الطالب</th><th>الحالة</th><th>نسبة الحضور</th></tr></thead><tbody>' + R(st.k).map(function (s) { var p = attPct(st.k, s.id); return '<tr><td>' + s.n + '</td><td class="seg">' + ['ح:حاضر', 'غ:غائب', 'م:متأخر'].map(function (o) { var v = o.split(':'); return '<button data-act="mark" data-id="' + s.id + '" data-v="' + v[0] + '" class="' + (rec[s.id] === v[0] ? 'on' : '') + '">' + v[1] + '</button>'; }).join('') + '</td><td>' + (p === null ? '—' : p + '%') + '</td></tr>'; }).join('') + '</tbody></table></div>' + (R(st.k).length ? '' : noR);
    },
    tasks: function () {
      var L = S.tasks.filter(function (t) { return own(t.k); });
      return hd('الواجبات والاختبارات') + '<div class="panel cd"><div class="fm">' + sel('k') + '<select data-f="tk"><option>واجب</option><option>اختبار</option></select><input data-f="tt" placeholder="العنوان"><input data-f="tdsc" placeholder="الوصف والتعليمات"><input type="date" data-f="tdue"><input type="number" data-f="tdur" placeholder="مدة الاختبار (دقيقة)"><input type="number" data-f="tmax" placeholder="الدرجة العظمى"></div><button class="btn-p" data-act="addTask">إنشاء</button></div><div class="panel">' + (L.map(function (t) { return '<div class="nit"><p>' + t.kind + ': ' + esc(t.t) + '<small>' + cn(t.k) + ' · التسليم ' + (t.due || '—') + (t.dur ? ' · ' + t.dur + ' د' : '') + ' · الدرجة ' + (t.max || '—') + ' · تسليمات الطلاب: 0</small></p><button class="btn-d" data-act="delTask" data-id="' + t.id + '">حذف</button></div>'; }).join('') || '<p class="empty">لا شيء بعد</p>') + '</div><p class="meta">استقبال إجابات الطلاب يحتاج رفعاً من جهة الطالب وBackend؛ غير مفعّل.</p>';
    },
    grades: function () {
      var g = S.gr[st.k] || {}, c = sc(st.k), L = R(st.k);
      var inp = function (f, mx, id, v) { return '<input class="cell" type="number" min="0" max="' + mx + '" data-g="' + f + '" data-id="' + id + '" value="' + (v === undefined ? '' : v) + '">'; };
      return hd('الدرجات') + '<div class="fm">' + sel('k') + '</div>' + (L.length ? '<div class="panel wrapx"><table><thead><tr><th>م</th><th>الطالب</th><th>أعمال /' + c.w + '</th><th>نصفي /' + c.m + '</th>' + (c.f ? '<th>نهائي عملي /' + c.f + '</th>' : '') + '<th>الإجمالي /' + c.t + '</th><th>ملاحظة</th></tr></thead><tbody>' + L.map(function (s) { var r = g[s.id] || {}, t = total(st.k, s.id); return '<tr><td>' + s.id + '</td><td>' + s.n + '</td><td>' + inp('w', c.w, s.id, r.w) + '</td><td>' + inp('m', c.m, s.id, r.m) + '</td>' + (c.f ? '<td>' + inp('f', c.f, s.id, r.f) + '</td>' : '') + '<td>' + (t === null ? (has(st.k, s.id) ? 'غير مكتملة' : '—') : t) + '</td><td><input class="cell" style="width:140px" data-g="n" data-id="' + s.id + '" value="' + esc(r.n || '') + '"></td></tr>'; }).join('') + '</tbody></table></div><button class="btn-p" data-act="saveGr">حفظ التعديلات</button>' : noR) + '<h3 class="sec">سجل التغييرات</h3><div class="panel">' + (S.log.filter(function (l) { return l.k === st.k; }).slice(-6).reverse().map(function (l) { return '<div class="nit"><p>' + esc(l.t) + '</p><time>' + tm(l.ts) + '</time></div>'; }).join('') || '<p class="empty">لا تغييرات</p>') + '</div>';
    },
    announcements: function () {
      var L = S.ann.filter(function (a) { return own(a.k); });
      return hd('الإعلانات') + '<div class="panel cd"><div class="fm">' + sel('k') + '<input data-f="at" placeholder="نص الإعلان أو التنبيه"></div><button class="btn-p" data-act="addAnn">نشر</button></div><div class="panel">' + (L.slice().reverse().map(function (a) { return '<div class="nit"><p>' + esc(a.t) + '<small>' + cn(a.k) + '</small></p><time>' + tm(a.ts) + '</time> <button class="btn-d" data-act="delAnn" data-id="' + a.id + '">حذف</button></div>'; }).join('') || '<p class="empty">لا إعلانات</p>') + '</div>';
    },
    assistant: function () {
      var c = cur();
      var T = ['لخّص محاضرة', 'اشرح موضوعاً', 'أسئلة اختيار من متعدد', 'أسئلة صح وخطأ', 'اختبار قصير', 'واجب من المحاضرة', 'استخرج المصطلحات'];
      return hd('المساعد الأكاديمي AI') + '<div id="aiStat" class="warn">جارٍ فحص اتصال النموذج…</div><div class="seg" style="margin-bottom:8px"><button data-act="newChat">محادثة جديدة</button>' + S.chats.map(function (x) { return '<button data-act="openChat" data-id="' + x.id + '" class="' + (x.id === c.id ? 'on' : '') + '">' + esc(x.title) + '</button>'; }).join('') + '</div><div class="seg" style="margin-bottom:8px">' + T.map(function (t) { return '<button data-act="tpl" data-t="' + t + '">' + t + '</button>'; }).join('') + '</div>' +
        '<div class="panel chat" id="chat">' + (c.msgs.map(function (m) { return '<div class="msg ' + m.r + '">' + esc(m.c) + '</div>'; }).join('') || '<p class="empty">ابدأ المحادثة. إرفاق المحاضرات غير مفعّل حتى يتوفر نموذج يدعمه.</p>') + '</div><div class="fm" style="margin-top:8px"><textarea data-f="ai" rows="2" placeholder="اكتب رسالتك…"></textarea><button class="btn-p" data-act="send" id="sendBtn">إرسال</button></div>';
    }
  };
  function cur() { var c = S.chats.filter(function (x) { return x.id === st.chat; })[0] || S.chats[S.chats.length - 1]; if (!c) { c = { id: 'c' + Date.now(), title: 'محادثة جديدة', msgs: [] }; S.chats.push(c); } st.chat = c.id; return c; }
  function render() {
    var r = (location.hash.replace('#/', '') || 'home').split('?')[0]; if (!V[r]) r = 'home';
    document.querySelectorAll('aside nav a[href^="#/"],.bn a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#/' + r); });
    view.innerHTML = MY.length ? V[r]() : empty();
    if (r === 'assistant') { var el = $('#aiStat'); window.DoctorAI.health().then(function (j) { el.className = 'panel'; el.textContent = 'متصل بالنموذج: ' + (j.model || 'غير مسمّى'); }).catch(function (e) { el.textContent = 'النموذج غير متصل (' + e.message + '). لا يوجد Backend لـ /api/ai في هذا المشروع، ولن تُعرض أي ردود وهمية.'; }); var ch = $('#chat'); if (ch) ch.scrollTop = ch.scrollHeight; }
  }
  function push(a) { S.log.push({ k: a.k, t: a.t, ts: Date.now() }); }
  function ask(text, task) {
    var c = cur(); if (!text.trim()) return; c.msgs.push({ r: 'u', c: text }); if (c.title === 'محادثة جديدة') c.title = text.slice(0, 18); save(); render();
    var b = $('#sendBtn'); if (b) { b.disabled = true; b.textContent = '…جارٍ التفكير'; }
    window.DoctorAI.send(c.msgs.filter(function (m) { return m.r !== 'e'; }).map(function (m) { return { role: m.r === 'u' ? 'user' : 'assistant', content: m.c }; }), task).then(function (rep) { c.msgs.push({ r: 'b', c: rep }); }).catch(function (e) { c.msgs.push({ r: 'e', c: 'فشل الطلب: ' + e.message }); }).then(function () { save(); render(); });
  }
  document.addEventListener('change', function (e) { var f = e.target.dataset.f, g = e.target.dataset.g; if (f === 'k') { st.k = e.target.value; render(); } else if (f === 'date') { st.date = e.target.value; render(); } else if (g && own(st.k)) { var d = (S.gr[st.k] = S.gr[st.k] || {}), o = (d[e.target.dataset.id] = d[e.target.dataset.id] || {}), val = e.target.value; if (g === 'n') o.n = val; else if (val === '') delete o[g]; else o[g] = Math.max(0, Math.min(+val, sc(st.k)[g])); } });
  document.addEventListener('input', function (e) { if (e.target.dataset.f === 'q') { st.q = e.target.value; var p = e.target.selectionStart; render(); var i = $('[data-f=q]'); i.focus(); i.setSelectionRange(p, p); } });
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]'); if (go) { location.hash = '#/' + go.dataset.go; return; }
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.dataset.act, id = b.dataset.id, v = function (n) { var x = $('[data-f=' + n + ']'); return x ? x.value.trim() : ''; };
    if (!own(st.k)) return;
    if (a === 'mark') { var key = st.k + '|' + st.date; (S.att[key] = S.att[key] || {})[id] = b.dataset.v; push({ k: st.k, t: 'تسجيل حضور ' + cn(st.k) }); }
    else if (a === 'addLec') { var f = $('[data-f=lf]').files[0], t = v('lt'); if (!t || !f) { alert('أدخل العنوان واختر ملفاً'); return; } var ext = f.name.split('.').pop().toLowerCase(); if (['pdf', 'ppt', 'pptx', 'docx'].indexOf(ext) < 0) { alert('الصيغة غير مدعومة'); return; } var lid = 'l' + Date.now(); files[lid] = URL.createObjectURL(f); S.lectures.push({ id: lid, k: st.k, t: t, d: v('ld'), x: ext.toUpperCase(), sz: (f.size / 1048576).toFixed(1) + ' MB', ts: Date.now(), pub: false }); }
    else if (a === 'prev') { window.open(files[id], '_blank'); return; }
    else if (a === 'pub') { S.lectures.forEach(function (l) { if (l.id === id && own(l.k)) l.pub = !l.pub; }); }
    else if (a === 'delLec') { S.lectures = S.lectures.filter(function (l) { return !(l.id === id && own(l.k)); }); }
    else if (a === 'addTask') { if (!v('tt')) { alert('أدخل العنوان'); return; } S.tasks.push({ id: 't' + Date.now(), k: st.k, kind: v('tk'), t: v('tt'), d: v('tdsc'), due: v('tdue'), dur: v('tdur'), max: v('tmax'), ts: Date.now() }); push({ k: st.k, t: 'إنشاء ' + v('tk') + ': ' + v('tt') }); }
    else if (a === 'delTask') { S.tasks = S.tasks.filter(function (t) { return !(t.id === id && own(t.k)); }); }
    else if (a === 'saveGr') { push({ k: st.k, t: 'تحديث درجات ' + cn(st.k) }); }
    else if (a === 'addAnn') { if (!v('at')) return; S.ann.push({ id: 'a' + Date.now(), k: st.k, t: v('at'), cn: cn(st.k), dr: u.name, ts: Date.now() }); }
    else if (a === 'delAnn') { S.ann = S.ann.filter(function (x) { return !(x.id === id && own(x.k)); }); }
    else if (a === 'csv') { var csv = '\ufeffالاسم,الرقم,الحضور,الدرجة\n' + R(st.k).map(function (s) { return [s.n, s.id, attPct(st.k, s.id) === null ? '' : attPct(st.k, s.id) + '%', total(st.k, s.id) === null ? '' : total(st.k, s.id)].join(','); }).join('\n'); var an = document.createElement('a'); an.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); an.download = 'students-' + st.k + '.csv'; an.click(); return; }
    else if (a === 'newChat') { st.chat = null; S.chats.push({ id: 'c' + Date.now(), title: 'محادثة جديدة', msgs: [] }); st.chat = S.chats[S.chats.length - 1].id; }
    else if (a === 'openChat') { st.chat = id; }
    else if (a === 'tpl') { $('[data-f=ai]').value = b.dataset.t + ': '; $('[data-f=ai]').focus(); return; }
    else if (a === 'send') { var tx = v('ai'); ask(tx, null); return; }
    save(); render();
  });
  window.addEventListener('hashchange', render);
  document.getElementById('logout').addEventListener('click', function (e) { e.preventDefault(); sessionStorage.removeItem('uniflow_user'); location.href = 'index.html'; });
  var lb = $('#langBtn'); lb.addEventListener('click', function () { var r = root.dir === 'rtl'; root.dir = r ? 'ltr' : 'rtl'; root.lang = r ? 'en' : 'ar'; lb.textContent = r ? 'ع' : 'EN'; });
  var nb = $('#nb'); var n = S.ann.filter(function (a) { return own(a.k); }).length; if (n) { nb.hidden = false; nb.textContent = n; }
  render();
})();
