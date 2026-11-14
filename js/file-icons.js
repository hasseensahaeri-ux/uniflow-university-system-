(function () {
  'use strict';
  var root = document.getElementById('view');
  if (!root) return;
  var TYPES = {
    PDF:'pdf', PPT:'ppt', PPTX:'ppt', DOC:'doc', DOCX:'doc',
    XLS:'xls', XLSX:'xls', CSV:'xls', ZIP:'archive', RAR:'archive',
    PNG:'image', JPG:'image', JPEG:'image', WEBP:'image', TXT:'text'
  };
  function iconMarkup(ext) {
    var label = (ext || 'FILE').slice(0, 5);
    return '<svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">' +
      '<rect x="1" y="1" width="54" height="54" rx="13" class="file-icon-bg"/>' +
      '<path d="M17 9h14l12 12v23a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4Z" class="file-icon-shadow"/>' +
      '<path d="M17 7h14l12 12v23a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4Z" class="file-icon-paper"/>' +
      '<path d="M31 7v9a3 3 0 0 0 3 3h9" class="file-icon-fold"/>' +
      '<rect x="15.5" y="23" width="27" height="12" rx="3" class="file-icon-label"/>' +
      '<text x="29" y="31.7" text-anchor="middle" class="file-icon-text">' + label + '</text>' +
      '<path d="M18 39h15M18 42.5h10" class="file-icon-lines"/>' +
      '</svg>';
  }
  function decorate() {
    var heading = root.querySelector('.pg-head h1, h1');
    if (!heading || !heading.textContent.includes('الملفات')) return;
    var panels = root.querySelectorAll('.panel');
    if (!panels.length) return;
    panels[0].querySelectorAll('.nit').forEach(function (row) {
      var badge = row.querySelector('.ni');
      if (!badge || badge.dataset.fileIconReady) return;
      var ext = badge.textContent.trim().toUpperCase().replace(/^\./, '');
      var cls = TYPES[ext] || 'other';
      badge.className = 'ni file-type-icon file-type-' + cls;
      badge.dataset.fileIconReady = '1';
      badge.setAttribute('role', 'img');
      badge.setAttribute('aria-label', 'ملف بصيغة ' + (ext || 'غير معروفة'));
      badge.innerHTML = iconMarkup(ext);
    });
  }
  new MutationObserver(decorate).observe(root, { childList:true, subtree:true });
  decorate();
})();