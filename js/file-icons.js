(function () {
  'use strict';
  var root = document.getElementById('view');
  if (!root) return;

  var TYPES = {
    PDF:'pdf', PPT:'ppt', PPTX:'ppt', DOC:'doc', DOCX:'doc',
    XLS:'xls', XLSX:'xls', CSV:'xls', ZIP:'archive', RAR:'archive',
    '7Z':'archive', TAR:'archive', GZ:'archive',
    PNG:'image', JPG:'image', JPEG:'image', WEBP:'image', GIF:'image', SVG:'image',
    TXT:'text', MD:'text', LOG:'text'
  };

  function iconMarkup(ext) {
    var label = (ext || 'FILE').slice(0, 4);
    return '<svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">' +
      '<path d="M16 5h16l14 14v29a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z" class="file-icon-paper"/>' +
      '<path d="M32 5v11a3 3 0 0 0 3 3h11" class="file-icon-fold"/>' +
      '<text x="28" y="35" text-anchor="middle" class="file-icon-text">' + label + '</text>' +
      '</svg>';
  }

  function decorate() {
    var heading = root.querySelector('.pg-head h1, h1');
    if (!heading || !heading.textContent.includes('الملفات')) return;
    var panels = root.querySelectorAll('.panel');
    if (!panels.length) return;

    panels.forEach(function (panel) {
      panel.querySelectorAll('.nit').forEach(function (row) {
        var badge = row.querySelector('.ni');
        if (!badge || badge.dataset.fileIconReady) return;
        var ext = badge.textContent.trim().toUpperCase().replace(/^\./, '');
        if (!ext) return;
        var cls = TYPES[ext] || 'other';
        badge.className = 'ni file-type-icon file-type-' + cls;
        badge.dataset.fileIconReady = '1';
        badge.setAttribute('role', 'img');
        badge.setAttribute('aria-label', 'ملف بصيغة ' + ext);
        badge.innerHTML = iconMarkup(ext);
      });
    });
  }

  new MutationObserver(decorate).observe(root, { childList:true, subtree:true });
  decorate();
})();