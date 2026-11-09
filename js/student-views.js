(function () {
  var D = window.UFDATA, st = { ann: 'الكل', files: 'all' }, C = D.courses;
  var DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  var demo = '<span class="demo-badge">بيانات تجريبية</span>';
  var hd = function (t, x) { return '<div class="pg-head"><h1>' + t + ' ' + demo + '</h1>' + (x || '') + '</div>'; };
  var n = function (v) { return v.toLocaleString('ar'); };
  var date = function (d) { return new Date(Date.now() - d * 864e5).toLocaleDateString('ar', { day: 'numeric', month: 'long' }); };
  var col = function (p) { return p >= 90 ? '#22a559' : p >= 75 ? '#f59e2b' : '#e0364f'; };
  var bar = function (p, c) { return '<div class="bar"><i style="width:' + p + '%;background:' + c + '"></i></div>'; };
  var pct = function (c) { return Math.round(c.att[0] / c.att[1] * 100); };
  var card = function (h, b) { return '<div class="panel cd">' + h + b + '</div>'; };
  var chips = function (k, L, cur) { return '<div class="chips">' + L.map(function (l) { return '<button data-vf="' + k + '" data-val="' + l[0] + '"' + (l[0] === cur ? ' class="on"' : '') + '>' + l[1] + '</button>'; }).join('') + '</div>'; };
  var day = new Date().getDay();

  var V = {
    schedule: function () {
      return hd('الجدول الدراسي') + '<p class="meta">جدولك الأسبوعي للفصل الحالي</p><div class="gr w5">' + DAYS.map(function (nm, i) {
        var L = []; C.forEach(function (c) { c.slots.forEach(function (s) { if (s[0] === i) L.push([s, c]); }); });
        L.sort(function (a, b) { return a[0][1] < b[0][1] ? -1 : 1; });
        return '<div class="panel cd' + (i === day ? ' today' : '') + '"><h3>' + nm + (i === day ? ' <em>اليوم</em>' : '') + '</h3>' + (L.map(function (x) {
          return '<div class="ev"><b>' + x[1].n + '</b><span dir="ltr">' + x[0][1] + ' - ' + x[0][2] + '</span><span>' + x[1].room + '</span></div>';
        }).join('') || '<p class="empty">لا محاضرات</p>') + '</div>';
      }).join('') + '</div>';
    },
    courses: function () {
      var h = 0; C.forEach(function (c) { h += c.h || 3; });
      return hd('المقررات') + '<p class="meta">' + C.length + ' مقررات مسجلة هذا الفصل</p><div class="gr">' + C.map(function (c) {
        return card('<h3>' + c.n + '</h3>', '<p>' + c.dr + '</p><p>' + c.room + ' · ' + c.slots.map(function (s) { return DAYS[s[0]]; }).join('، ') + '</p><p>درجاتك حتى الآن: <b>' + (c.w[0] + c.w[1]) + ' / 50</b></p><p>الحضور: <b style="color:' + col(pct(c)) + '">' + pct(c) + '%</b></p>');
      }).join('') + '</div>';
    },
    attendance: function () {
      return hd('الحضور والغياب') + '<p class="meta">نسبة حضورك في كل مقرر</p><div class="gr">' + C.map(function (c) {
        var p = pct(c), s = p >= 90 ? 'ممتاز' : p >= 75 ? 'جيد، انتبه للغياب' : 'خطر الحرمان';
        return card('<h3>' + c.n + '</h3>', '<div class="big" style="color:' + col(p) + '">' + p + '%</div>' + bar(p, col(p)) + '<p>حضرت ' + c.att[0] + ' من ' + c.att[1] + ' · غياب ' + (c.att[1] - c.att[0]) + ' · <b>' + s + '</b></p>');
      }).join('') + '</div><p class="meta">تنبيه: الحد الأدنى للحضور 75% (قيمة تجريبية).</p>';
    },
    grades: function () {
      var avg = Math.round(C.reduce(function (s, c) { return s + (c.w[0] + c.w[1]) / 50; }, 0) / C.length * 100);
      return hd('الدرجات والمعدل') + '<div class="gr w3"><div class="panel cd"><span class="meta">المعدل التراكمي</span><div class="big">' + D.gpa + ' / 4.00</div></div><div class="panel cd"><span class="meta">متوسط ما رُصد حتى الآن</span><div class="big">' + avg + '%</div></div><div class="panel cd"><span class="meta">الساعات المنجزة</span><div class="big">' + D.done + ' / ' + D.totalCr + '</div></div></div>' +
        '<div class="panel wrapx"><table><thead><tr><th>المقرر</th><th>أعمال الفصل /20</th><th>النصفي /30</th><th>النهائي /50</th><th>المجموع حتى الآن</th><th>المطلوب في النهائي للنجاح (60)</th></tr></thead><tbody>' + C.map(function (c) {
          var s = c.w[0] + c.w[1], need = Math.max(0, 60 - s); return '<tr><td>' + c.n + '</td><td>' + c.w[0] + '</td><td>' + c.w[1] + '</td><td>—</td><td><b>' + s + ' / 50</b></td><td>' + (need > 50 ? 'غير ممكن' : need + ' / 50') + '</td></tr>';
        }).join('') + '</tbody></table></div><p class="meta">النهائي لم يُرصد بعد. النتائج والمعدل بيانات تجريبية.</p>';
    },
    announcements: function () {
      var L = D.ann.filter(function (a) { return st.ann === 'الكل' || a.c === st.ann; });
      return hd('الإعلانات الجامعية') + chips('ann', [['الكل', 'الكل'], ['أكاديمي', 'أكاديمي'], ['تسجيل', 'تسجيل'], ['عام', 'عام']], st.ann) +
        '<div class="panel">' + (L.map(function (a) { return '<div class="nit"><span class="ni" style="background:#e4eeff;color:#1d6be0"><svg><use href="#mega"/></svg></span><p>' + a.t + '<small>' + a.c + ' · ' + a.s + '</small></p><time>' + date(a.d) + '</time></div>'; }).join('') || '<p class="empty">لا إعلانات</p>') + '</div>';
    },
    files: function () {
      var L = D.files.filter(function (f) { return st.files === 'all' || f.k === st.files; });
      return hd('الملفات والمستندات') + chips('files', [['all', 'الكل']].concat(C.map(function (c) { return [c.k, c.n]; })), st.files) +
        '<div class="panel">' + L.map(function (f) { var c = C.filter(function (x) { return x.k === f.k; })[0]; return '<div class="nit"><span class="ni" style="background:#efe7ff;color:#8b5cf6;font-size:11px;font-weight:800">' + f.x + '</span><p dir="ltr" style="text-align:right">' + f.t + '<small>' + c.n + ' · ' + f.s + ' · ' + date(f.d) + '</small></p><button class="btn-s" data-act="dl">تحميل</button></div>'; }).join('') + '</div>' +
        '<h3 class="sec">مستندات جامعية</h3><div class="panel">' + D.docs.map(function (t) { return '<div class="nit"><span class="ni" style="background:#e1f6e9;color:#22a559"><svg><use href="#file"/></svg></span><p>' + t + '</p><button class="btn-s" data-act="dl">طلب</button></div>'; }).join('') + '</div>';
    },
    instructors: function () {
      return hd('الدكاترة') + '<div class="gr">' + C.map(function (c) { return card('<h3>' + c.dr + '</h3>', '<p>المقرر: ' + c.n + '</p><p>المكتب والساعات المكتبية: ' + c.office + '</p>'); }).join('') + '</div>';
    },
    fees: function () {
      var f = D.fees, bal = 0, rem = f.total - f.paid, p = Math.round(f.paid / f.total * 100), S = { paid: 'مدفوع', next: 'القسط القادم', later: 'قادم' };
      return hd('كشف الحساب', '<button class="btn-s" data-act="print">طباعة</button>') + '<div class="gr w3"><div class="panel cd"><span class="meta">إجمالي الرسوم</span><div class="big">' + n(f.total) + ' <small>' + f.cur + '</small></div></div><div class="panel cd"><span class="meta">المدفوع</span><div class="big" style="color:#22a559">' + n(f.paid) + '</div></div><div class="panel cd"><span class="meta">المتبقي</span><div class="big" style="color:#e0364f">' + n(rem) + '</div></div></div>' +
        '<div class="panel">' + bar(p, '#22a559') + '<p class="meta">تم سداد ' + p + '% من الرسوم</p></div><h3 class="sec">الأقساط</h3><div class="panel">' + f.inst.map(function (i) {
          return '<div class="nit"><span class="ni" style="background:' + (i.st === 'paid' ? '#e1f6e9;color:#22a559' : '#fff4d6;color:#8a5a00') + '"><svg><use href="#wallet"/></svg></span><p>' + i.n + ' · ' + n(i.a) + ' ' + f.cur + '<small>' + S[i.st] + (i.due ? ' · الاستحقاق بعد ' + i.due + ' يوماً' : '') + '</small></p></div>';
        }).join('') + '</div><h3 class="sec">سجل العمليات</h3><div class="panel wrapx"><table><thead><tr><th>التاريخ</th><th>البيان</th><th>مدين</th><th>دائن</th><th>الرصيد</th></tr></thead><tbody>' + D.tx.map(function (t) {
          bal += t.db - t.cr; return '<tr><td>' + date(t.d) + '</td><td>' + t.t + '</td><td>' + (t.db ? n(t.db) : '—') + '</td><td>' + (t.cr ? n(t.cr) : '—') + '</td><td><b>' + n(bal) + '</b></td></tr>';
        }).join('') + '</tbody></table></div>';
    },
    settings: function () {
      var u = {}; try { u = JSON.parse(sessionStorage.getItem('uniflow_user')) || {}; } catch (e) {}
      var th = document.documentElement.dataset.theme, g = (function () { try { return localStorage.getItem('uniflow_gender') || u.gender || ''; } catch (e) { return u.gender || ''; } })();
      var b = function (k, v, t, cur) { return '<button data-' + k + '="' + v + '"' + (cur === v ? ' class="on"' : '') + '>' + t + '</button>'; };
      return hd('الإعدادات والملف الشخصي') + '<div class="panel"><h3>الملف الشخصي والمعلومات الأكاديمية</h3><div class="kv"><span>الاسم</span><b>' + (u.name || 'حسين عادل') + '</b><span>الرقم الأكاديمي</span><b>' + (u.id || '202400123') + '</b><span>الكلية</span><b>كلية الحاسبات وتقنية المعلومات</b><span>التخصص</span><b>الأمن السيبراني</b><span>المستوى</span><b>الثاني</b><span>الساعات المنجزة</span><b>' + D.done + ' من ' + D.totalCr + '</b><span>المعدل التراكمي</span><b>' + D.gpa + '</b></div></div>' +
        '<div class="panel cd2"><h3>الصورة الشخصية</h3><p class="meta">تُحفظ على جهازك فقط.</p><label class="btn-s up">اختيار صورة<input type="file" id="photo" accept="image/*" hidden></label> <button class="btn-s alt" data-act="rmphoto">إزالة الصورة</button><div class="chips">' + b('ge', 'male', 'ذكر', g) + b('ge', 'female', 'أنثى', g) + b('ge', '', 'غير محدد', g) + '</div></div>' +
        '<div class="panel cd2"><h3>المظهر</h3><div class="chips">' + b('th', 'light', '☀️ نهاري', th) + b('th', 'dark', '🌙 ليلي', th) + '</div></div>' +
        '<div class="panel cd2"><h3>الحساب</h3><button class="btn-s" data-act="logout">تسجيل الخروج</button> <button class="btn-s alt" data-act="reset">إعادة ضبط البيانات التجريبية</button></div>';
    },
    more: function () {
      var L = [['schedule', 'الجدول'], ['courses', 'المقررات'], ['grades', 'الدرجات'], ['attendance', 'الحضور'], ['instructors', 'الدكاترة'], ['announcements', 'الإعلانات'], ['notifications', 'الإشعارات'], ['assistant', 'المساعد الذكي'], ['files', 'الملفات'], ['fees', 'كشف الحساب'], ['settings', 'الإعدادات']];
      return hd('المزيد') + '<div class="gr w3">' + L.map(function (l) { return '<button class="panel cd mo" data-go="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div>';
    }
  };
  V.profile = V.settings;
  window.UFViews = V;

  function toast(t) { var e = document.getElementById('toast'); if (!e) { e = document.createElement('div'); e.id = 'toast'; document.body.appendChild(e); } e.textContent = t; e.className = 'show'; clearTimeout(toast.t); toast.t = setTimeout(function () { e.className = ''; }, 2400); }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  document.addEventListener('click', function (e) {
    var b, r = window.UFPages && window.UFPages.render;
    if ((b = e.target.closest('[data-vf]'))) { st[b.dataset.vf] = b.dataset.val; r(); }
    else if (e.target.closest('[data-act="dl"]')) toast('ملف تجريبي: سيُفعَّل التحميل عند ربط النظام.');
    else if (e.target.closest('[data-act="print"]')) window.print();
    else if (e.target.closest('[data-act="logout"]')) { try { sessionStorage.clear(); } catch (x) {} location.href = 'index.html'; }
    else if (e.target.closest('[data-act="reset"]')) { ['uniflow_read', 'uniflow_avatar', 'uniflow_gender', 'uniflow_quote', 'uniflow_wx'].forEach(lsDel); try { sessionStorage.removeItem('uniflow_chat'); } catch (x) {} location.reload(); }
    else if (e.target.closest('[data-act="rmphoto"]')) { lsDel('uniflow_avatar'); location.reload(); }
    else if ((b = e.target.closest('[data-ge]'))) { try { localStorage.setItem('uniflow_gender', b.dataset.ge); } catch (x) {} location.reload(); }
    else if ((b = e.target.closest('[data-th]'))) { document.documentElement.dataset.theme = b.dataset.th; try { localStorage.setItem('uniflow_theme', b.dataset.th); } catch (x) {} r(); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'photo' || !e.target.files[0]) return;
    var fr = new FileReader(); fr.onload = function () {
      var im = new Image(); im.onload = function () {
        var c = document.createElement('canvas'), s = Math.min(im.width, im.height); c.width = c.height = 256;
        c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 256, 256);
        try { localStorage.setItem('uniflow_avatar', c.toDataURL('image/jpeg', 0.85)); } catch (x) { toast('تعذّر حفظ الصورة'); return; } location.reload();
      }; im.src = fr.result;
    }; fr.readAsDataURL(e.target.files[0]);
  });
})();
