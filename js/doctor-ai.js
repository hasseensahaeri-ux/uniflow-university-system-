// طبقة تكامل المساعد الأكاديمي. لا يوجد نموذج ولا خادم في المشروع الحالي،
// لذلك تتصل الواجهة بـ /api/ai/chat الذي يجب أن يوفره Backend (يحمل المفتاح سرّاً على الخادم).
// العقد: POST {messages:[{role,content}], task?} -> {reply:"..."}   |   GET /api/ai/health -> {model:"..."}
window.DoctorAI = {
  base: '/api/ai',
  health: function () {
    return fetch(this.base + '/health').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  },
  send: function (messages, task) {
    return fetch(this.base + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messages, task: task || null }) })
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = JSON.parse(t); } catch (e) {} if (!r.ok) throw new Error('HTTP ' + r.status + (j && j.error ? ' — ' + j.error : '')); if (!j || typeof j.reply !== 'string') throw new Error('رد غير متوقع من الخادم'); return j.reply; }); });
  }
};
