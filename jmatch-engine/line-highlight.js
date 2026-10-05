/* Screen-share marker: highlight a rendered line without changing the layout. */
(function () {
  'use strict';
  if (!window.Highlight || !window.CSS || !CSS.highlights) return;

  var ignored = 'a,button,input,textarea,select,summary,[role="button"],[contenteditable],nav,header:not(.cover),svg,[inert]';
  var marks = [];
  var highlight = new Highlight();
  CSS.highlights.set('jmatch-line', highlight);
  var style = document.createElement('style');
  style.textContent = '::highlight(jmatch-line){background-color:#ffe45c;color:#171717;text-shadow:none}' +
    '.jm-marker-tools{position:fixed;left:12px;bottom:12px;z-index:1000;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 24px);box-sizing:border-box;padding:7px 10px;border:1px solid #d8d8d8;border-radius:8px;background:#fffffff2;color:#333;font:12px/1.5 sans-serif;box-shadow:0 2px 8px #0001}' +
    '.jm-marker-tools button{flex-shrink:0;border:1px solid #ccc;border-radius:4px;background:#fff;color:#333;padding:3px 8px;font:inherit;cursor:pointer}' +
    '.jm-marker-tools button:disabled{opacity:.45;cursor:default}' +
    '@media print{.jm-marker-tools{display:none}::highlight(jmatch-line){background-color:transparent;color:inherit}}';
  document.head.appendChild(style);
  var tools = document.createElement('div');
  tools.className = 'jm-marker-tools';
  tools.setAttribute('aria-label', '説明用の行ハイライト');
  var hint = document.createElement('span');
  hint.textContent = '行をクリックで黄色に・再クリックで解除';
  var clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = '全解除';
  clear.disabled = true;
  tools.append(hint, clear);
  document.body.appendChild(tools);

  function paint() {
    highlight.clear();
    marks.forEach(function (mark) { mark.ranges.forEach(function (r) { highlight.add(r); }); });
    clear.disabled = marks.length === 0;
    clear.textContent = marks.length ? '全解除（' + marks.length + '行）' : '全解除';
  }
  clear.addEventListener('click', function () { marks = []; paint(); });

  function blockFor(el) {
    var block = el.closest('p,h1,h2,h3,h4,h5,h6,li,td,th,dt,dd,figcaption');
    if (block) return block;
    while (el && el !== document.body) {
      var display = getComputedStyle(el).display;
      if (display !== 'inline' && display !== 'contents' && display !== 'inline-block') return el;
      el = el.parentElement;
    }
    return null;
  }

  // Keep one range per text-node segment, including inline bold/emphasis spans.
  function lineAt(block, y) {
    var ranges = [];
    var walk = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      var node = walk.currentNode;
      if (node.parentElement.closest(ignored + ',script,style')) continue;
      var start = -1;
      for (var i = 0; i < node.length;) {
        var end = i + (node.textContent.codePointAt(i) > 0xffff ? 2 : 1);
        var char = document.createRange();
        char.setStart(node, i); char.setEnd(node, end);
        var onLine = Array.from(char.getClientRects()).some(function (rect) {
          return rect.width > 0 && rect.height > 0 && y >= rect.top && y < rect.bottom;
        });
        if (onLine && start < 0) start = i;
        if (!onLine && start >= 0) {
          var range = document.createRange();
          range.setStart(node, start); range.setEnd(node, i);
          ranges.push(range); start = -1;
        }
        i = end;
      }
      if (start >= 0) {
        var last = document.createRange();
        last.setStart(node, start); last.setEnd(node, node.length);
        ranges.push(last);
      }
    }
    return ranges;
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.detail > 1 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    var target = event.target;
    if (!(target instanceof Element) || target.closest(ignored + ',.jm-marker-tools')) return;
    var selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    var block = blockFor(target);
    if (!block || !block.closest('main,.hero,article,footer')) return;
    var ranges = lineAt(block, event.clientY);
    if (!ranges.length) return;
    // Clicking padding is allowed; the pointer's vertical position chooses the line.
    var match = marks.findIndex(function (mark) {
      return mark.block === block && mark.ranges.some(function (old) {
        return ranges.some(function (next) {
          return old.startContainer === next.startContainer && old.startOffset < next.endOffset && next.startOffset < old.endOffset;
        });
      });
    });
    if (match >= 0) marks.splice(match, 1);
    else marks.push({ block: block, ranges: ranges });
    paint();
  });
})();
