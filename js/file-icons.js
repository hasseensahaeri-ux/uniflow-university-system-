(function () {
  'use strict';
  var root = document.getElementById('view');
  if (!root) return;

  var TYPES = {
    PDF: { icon: '📕', label: 'PDF', cls: 'pdf' },
    PPT: { icon: '📊', label: 'PPT', cls: 'ppt' },
    PPTX: { icon: '📊', label: 'PPTX', cls: 'ppt' },
    DOC: { icon: '📘', label: 'DOC', cls: 'doc' },
    DOCX: { icon: '📘', label: 'DOCX', cls: 'doc' },
    XLS: { icon: '📗', label: 'XLS', cls: 'xls' },
    XLSX: { icon: '📗', label: 'XLSX', cls: 'xls' },
    ZIP: { icon: '🗜️', label: 'ZIP', cls: 'archive' },
    RAR: { icon: '🗜️', label: 'RAR', cls: 'archive' },
    PNG: { icon: '🖼️', label: 'PNG', cls: 'image' },
    JPG: { icon: '🖼️', label: 'JPG', cls: 'image' },
    JPEG: { icon: '🖼️', label: 'JPEG', cls: 'image' },
    TXT: { icon: '📄', label: 'TXT', cls: 'text' }
  };

  function decorate() {
    if (!root.querySelector('.pg-head h1') || !root.querySelector('.pg-head h1').textContent.includes('الملفات')) return;
    var panels = root.querySelectorAll('.panel');
    if (!panels.length) return;
    panels[0].querySelectorAll('.nit').forEach(function (row) {
      var badge = row.querySelector('.ni');
      if (!badge || badge.dataset.fileIconReady) return;
      var ext = badge.textContent.trim().toUpperCase().replace(/^\\./, '');
      var type = TYPES[ext] || { icon: '📄', label: ext || 'FILE', cls: 'other' };
      badge.className = 'ni file-type-icon file-type-' + type.cls;
      badge.dataset.fileIconReady = '1';
      badge.setAttribute('role', 'img');
      badge.setAttribute('aria-label', 'ملف بصيغة ' + type.label);
      badge.innerHTML = '<span class="file-type-emoji" aria-hidden="true">' + type.icon + '</span><span class="file-type-label">' + type.label + '</span>';
    });
  }

  new MutationObserver(decorate).observe(root, { childList: true, subtree: true });
  decorate();
})();