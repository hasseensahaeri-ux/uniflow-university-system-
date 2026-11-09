(function () {
  // حسابات وهمية للتجربة فقط
  var ACCOUNTS = {
    student: { id: '202400123', pass: 'Student@123', name: 'حسين عادل', gender: 'male' },
    doctor:  { id: '100245',    pass: 'Doctor@123',  name: 'د. خالد' },
    admin:   { id: 'admin01',   pass: 'Admin@123',   name: 'مدير النظام' }
  };
  var ROLE_LABEL = { student: 'طالب', doctor: 'دكتور', admin: 'إدارة' };
  var ROLE_KEYS = ['student', 'doctor', 'admin'];
  // الأدوار المفعّلة حالياً (الدكتور والإدارة تُضاف لاحقاً)
  var ENABLED = { student: true };
  var SOON = {
    doctor: 'حساب الدكتور قريبًا، سيتوفر في إصدار لاحق.',
    admin:  'حساب الإدارة قريبًا، سيتوفر في إصدار لاحق.'
  };

  var form = document.getElementById('loginForm');
  var idInput = document.getElementById('academicId');
  var pw = document.getElementById('password');
  var remember = document.getElementById('remember');
  var toggle = document.getElementById('togglePw');
  var msg = document.getElementById('msg');
  var roleBtns = document.querySelectorAll('.role');
  var KEY = 'uniflow_demo_id';

  function show(text, isError) {
    if (!msg) { alert(text); return; }
    msg.textContent = text;
    msg.className = 'msg' + (isError ? ' err' : '');
    msg.hidden = false;
  }

  function currentRole() {
    var active = document.querySelector('.role.active');
    var index = Array.prototype.indexOf.call(roleBtns, active);
    return ROLE_KEYS[index] || 'student';
  }

  // تذكر الرقم الأكاديمي
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) idInput.value = saved;
  } catch (e) {}

  // تبديل الأدوار
  roleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      roleBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      var r = currentRole();
      if (!ENABLED[r]) show(SOON[r], false);
      else if (msg) msg.hidden = true;
    });
  });

  // إظهار وإخفاء كلمة المرور
  if (toggle) {
    toggle.addEventListener('click', function () {
      var visible = pw.type === 'text';
      pw.type = visible ? 'password' : 'text';
      toggle.setAttribute('aria-pressed', String(!visible));
      var use = toggle.querySelector('use');
      if (use) use.setAttribute('href', visible ? '#i-eye-off' : '#i-eye');
    });
  }

  // تسجيل الدخول التجريبي
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var role = currentRole();
    if (!ENABLED[role]) { show(SOON[role], false); return; }
    var id = idInput.value.trim();
    var pass = pw.value;

    if (!id || !pass) {
      show('أدخل الرقم الأكاديمي وكلمة المرور.', true);
      return;
    }

    var acc = ACCOUNTS[role];

    if (id === acc.id && pass === acc.pass) {
      try {
        if (remember.checked) localStorage.setItem(KEY, id);
        else localStorage.removeItem(KEY);
      } catch (err) {}
      try {
        sessionStorage.setItem('uniflow_user', JSON.stringify({ role: role, id: id, name: acc.name, gender: acc.gender || '' }));
      } catch (err) {}
      show('تم تسجيل الدخول، جارٍ تحويلك إلى لوحتك…', false);
      window.location.href = 'student.html';
    } else {
      show('بيانات غير صحيحة لحساب ' + ROLE_LABEL[role] + '.حاول لاحقاً .', true);
    }
  });

  var forgot = document.getElementById('forgot');
  if (forgot) {
    forgot.addEventListener('click', function (e) {
      e.preventDefault();
      show('نسخة تجريبية: استعادة كلمة المرور غير مفعّلة.', false);
    });
  }
})();