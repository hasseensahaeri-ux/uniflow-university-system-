(function () {
  // حسابات وهمية للتجربة فقط
  var ACCOUNTS = {
    student: { id: '202400123', pass: 'Student@123', name: 'حسين عادل', gender: 'male' },
    doctor:  { id: '100245',    pass: 'Doctor@123',  name: 'د. خالد' },
    admin:   { id: 'admin01',   pass: 'Admin@123',   name: 'مدير النظام' }
  };
  var DOCTORS = [{ id: '100001', name: 'أ. لبيب القباطي' },{ id: '100002', name: 'أ. نايف الوتاري' },{ id: '100003', name: 'أ. صادق الحليلي' },{ id: '100004', name: 'صلاح السلامي' },{ id: '100005', name: 'أ. علياء زيارة' },{ id: '100006', name: 'محمد الصبري' },{ id: '100007', name: 'أ. صدام قحطان' },{ id: '100008', name: 'محمد غيلان' },{ id: '100009', name: 'أ. سهام الجعشاني' },{ id: '100010', name: 'أ. ريداء ردمان' }]; // حسابات تجريبية، كلمة المرور Doctor@123
  // حسابات الطلاب من كشف الدفعة. الرقم الأكاديمي هنا مؤقت (2025 + رقم م)، وكلمة المرور التجريبية Student@123
  var FEM = [6, 12, 30, 36, 38, 41]; // م الطالبات (حسب الأسماء): تظهر لهن صورة الفتاة
  var STUDENTS = ((window.UFROSTER && window.UFROSTER.DBP) || []).map(function (s) { var m = +s.id; return { id: m === 10 ? '251109015' : '2025' + ('00000' + m).slice(-5), name: s.n, gender: FEM.indexOf(m) > -1 ? 'female' : 'male' }; });
  var ROLE_LABEL = { student: 'طالب', doctor: 'دكتور', admin: 'إدارة' };
  var ROLE_KEYS = ['student', 'doctor', 'admin'];
  // الأدوار المفعّلة حالياً (الدكتور والإدارة تُضاف لاحقاً)
  var ENABLED = { student: true, doctor: true };
  var SOON = {
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
    if (role === 'student') { var sd = STUDENTS.filter(function (x) { return x.id === id; })[0]; if (sd) acc = { id: sd.id, pass: 'Student@123', name: sd.name, gender: sd.gender, locked: true }; }
    if (role === 'doctor') { var dd = DOCTORS.filter(function (x) { return x.id === id; })[0]; acc = dd ? { id: dd.id, pass: 'Doctor@123', name: dd.name } : { id: '', pass: '', name: '' }; }

    if (id === acc.id && pass === acc.pass) {
      try {
        if (remember.checked) localStorage.setItem(KEY, id);
        else localStorage.removeItem(KEY);
      } catch (err) {}
      try {
        sessionStorage.setItem('uniflow_user', JSON.stringify({ role: role, id: id, name: acc.name, gender: acc.gender || '', locked: !!acc.locked }));
      } catch (err) {}
      show('تم تسجيل الدخول، جارٍ تحويلك إلى لوحتك…', false);
      window.location.href = role === 'doctor' ? 'doctor.html' : 'student.html';
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