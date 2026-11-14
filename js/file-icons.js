(function () {
  'use strict';
  var root = document.getElementById('view');
  if (!root) return;

  var TYPES = {
    PDF: { glyph: '<path d="M7 3.75h6.5L19 9.25v10.5A1.25 1.25 0 0 1 17.75 21h-11A1.25 1.25 0 0 1 5.5 19.75v-14A2 2 0 0 1 7.5 3.75Z"/><path d="M13 4v5.5h5.5M8.5 15.5h7M8.5 18h5"/>', cls: 'pdf' },
    PPT: { glyph: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M12 4v16M12 8h5M12 12h3M8 9h1.5a1.5 1.5 0 0 1 0 3H8z"/>', cls: 'ppt' },
    PPTX: { glyph: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M12 4v16M12 8h5M12 12h3M8 9h1.5a1.5 1.5 0 0 1 0 3H8z"/>', cls: 'ppt' },
    DOC: { glyph: '<path d="M7 3.75h6.5L19 9.25v10.5A1.25 1.25 0 0 1 17.75 21h-11A1.25 1.25 0 0 1 5.5 19.75v-14A2 2 0 0 1 7.5 3.75Z"/><path d="M13 4v5.5h5.5M8.5 14h7M8.5 17h7"/>', cls: 'doc' },
    DOCX: { glyph: '<path d="M7 3.75h6.5L19 9.25v10.5A1.25 1.25 0 0 1 17.75 21h-11A1.25 1.25 0 0 1 5.5 19.75v-14A2 2 0 0 1 7.5 3.75Z"/><path d="M13 4v5.5h5.5M8.5 14h7M8.5 17h7"/>', cls: 'doc' },
    XLS: { glyph: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 10h16M10 10v10M14 10v10M7 7h.01M10 7h.01M14 7h.01"/>', cls: 'xls' },
    XLSX: { glyph: '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M4 10h16M10 10v10M14 10v10M7 7h.01M10 7h.01M14 7h.01"/>', cls: 'xls' },
    ZIP: { glyph: '<path d="M7 3.75h6.5L19 9.25v10.5A1.25 1.25 0 0 1 17.75 21h-11A1.25 1.25 0 0 1 5.5 19.75v-14A2 2 0 0 1 7.5 3.75Z"/><path d="M13 4v5.5h5.5M12 10v2m0 2v2m-1 2h2"/>', cls: 'archive' },
    RAR: { glyph: '<path d="M7 3.75h6.5L19 9.25v10.5A1.25 1.25 0 0 1 17.75 21h-11A1.25 1.25 0 0 1 5.5 19.75v-14A2 2 0 0 1 7.5 3.75Z"/><path d="M13 4v5.5h5.5M12 10v2m0 2v2m-1 2h2"/>', cls: 'archive' },
    PNG: { glyph: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.5"/><path d="m5 17 4.5-4 3 2 2.5-2 4 4"/>', cls: 'image' },
    JPG: { glyph: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.5"/><path d="m5 17 4.5-4 3 2 2.5-2 4 4"/>', cls: 'image' },
    JPEG: { glyph: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.5"/><path d="m5 17 4.5-4 3 2 2.5-2 4 4"/>', cls: 'image' },
    TXT: { glyph: '<path d="M7 3.75h6.5L19 9.25v10.5A1.25 1.25 0 0 1 17.75 21h-11A1.25 1.25 0 0 1 5.5 19.75v-14A2 2 0 0 1 7.5 3.75Z"/><path d="M13 4v5.5h5.5M8.5 14h7M8.5 17h7"/>', cls: 'text' }
  };

  function decorate() {
    var heading = root.querySelector('.pg-head h1, h1');
    if (!heading || !heading.textContent.includes('الملفات')) return;
    var panels = root.querySelectorAll('.panel');
    if (!panels.length) return;
    panels[0].querySelectorAll('.nit').forEach(function (row) {
      var badge = row.querySelector('.ni');
      if (!badge || badge.dataset.fileIconReady) return;
      var ext = badge.textContent.trim().toUpperCase().replace(/^\./, '');
      var type = TYPES[ext] || { glyph: '<path d="M7 3.75h6.5L19 9.25v10.5A1.25 1.25 0 0 1 17.75 21h-11A1.25 1.25 0 0 1 5.5 19.75v-14A2 2 0 0 1 7.5 3.75Z"/><path d="M13 4v5.5h5.5M8.5 14h7M8.5 17h7"/>', cls: 'other' };
      badge.className = 'ni file-type-icon file-type-' + type.cls;
      badge.dataset.fileIconReady = '1';
      badge.setAttribute('role', 'img');
      badge.setAttribute('aria-label', 'ملف بصيغة ' + (ext || 'غير معروفة'));
      badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + type.glyph + '</svg><span>' + (ext || 'FILE') + '</span>';
    });
  }

  new MutationObserver(decorate).observe(root, { childList: true, subtree: true });
  decorate();
})();