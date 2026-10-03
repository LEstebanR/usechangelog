/*
 * UseChangelog "What's new" widget (#8).
 * <script src="https://<origin>/widget.js" data-key="<widget_key>" defer></script>
 * Optional: lang="es" (en, es, pt, fr, de) and data-trigger="<CSS selector>".
 * Vanilla on purpose, and drawn in a Shadow DOM so the host page and the widget never
 * restyle each other. Words come from the API (lib/widget/copy.ts); post bodies arrive
 * already rendered and sanitized (lib/markdown.ts).
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var key = script.getAttribute("data-key");
  var lang = script.getAttribute("lang");
  var selector = script.getAttribute("data-trigger");
  var origin = new URL(script.src).origin;
  if (!key) return console.warn("UseChangelog widget: missing data-key.");

  var url = origin + "/api/widget/" + encodeURIComponent(key) + (lang ? "?lang=" + encodeURIComponent(lang) : "");
  fetch(url)
    .then(function (res) {
      if (!res.ok) throw new Error(res.status === 404 ? "unknown data-key" : "HTTP " + res.status);
      return res.json();
    })
    .then(mount)
    .catch(function (err) {
      console.warn("UseChangelog widget: " + err.message + ". Nothing will show.");
    });

  // Same palette as the app (app/tag.tsx), as plain values.
  var CSS =
    ".root{all:initial;font:15px/1.5 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#0e1116;-webkit-font-smoothing:antialiased}" +
    ".root *,.root *::before,.root *::after{box-sizing:border-box}" +
    ".fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:10px 16px;border:1px solid #0e1116;background:#0e1116;color:#fff;font-family:inherit;font-size:14px;font-weight:500;line-height:1.2;cursor:pointer;box-shadow:0 8px 24px -8px rgb(14 17 22/.35)}" +
    ".fab:hover{background:#1d3a8f;border-color:#1d3a8f}" +
    ".fab i{width:8px;height:8px;background:#a5b0d2}" +
    "button:focus-visible,a:focus-visible,.panel:focus-visible{outline:2px solid #1d3a8f;outline-offset:2px}" +
    ".panel{position:fixed;z-index:2147483001;display:flex;flex-direction:column;width:min(420px,calc(100vw - 32px));border:1px solid #e4e7ec;background:#fff;box-shadow:0 16px 48px -12px rgb(14 17 22/.28);outline:none}" +
    ".panel[hidden]{display:none}" +
    ".head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 24px 16px}" +
    ".title{margin:0;font-size:20px;font-weight:600;letter-spacing:-.01em;line-height:1.25}" +
    ".name{margin:2px 0 0;font-size:14px;color:#5a6170}" +
    ".close{display:grid;place-items:center;width:32px;height:32px;margin-right:-8px;border:0;background:none;color:#5a6170;cursor:pointer}" +
    ".close:hover{color:#0e1116}" +
    ".list{flex:1;overflow-y:auto;border-top:1px solid #e4e7ec}" +
    ".empty{margin:0;padding:48px 24px;text-align:center;color:#5a6170}" +
    "h3{position:sticky;top:0;margin:0;padding:16px 24px 8px;border-bottom:1px solid #e4e7ec;background:rgb(255 255 255/.95);font-size:12px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:#5a6170}" +
    "ol{margin:0;padding:0;list-style:none}" +
    "ol>li{padding:20px 24px;border-top:1px solid #e4e7ec}" +
    "ol>li:first-child{border-top:0}" +
    ".meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0;font-size:13px}" +
    ".tag{padding:2px 8px;font-weight:500}" +
    ".new{background:#edf1fa;color:#1d3a8f}.improved{background:#f1edfa;color:#5b3fa8}.fixed{background:#eaf5ef;color:#17694a}" +
    ".coming{border:1px dashed rgb(90 97 112/.6);color:#0e1116}" +
    "time{margin-left:auto;color:#5a6170;font-variant-numeric:tabular-nums}" +
    ".post-title{margin:10px 0 0;font-size:17px;font-weight:600;line-height:1.35}" +
    ".body{margin-top:6px;color:rgb(14 17 22/.75);line-height:1.6;overflow-wrap:anywhere}" +
    ".body p,.body ul,.body ol{margin:0 0 8px}.body>:last-child{margin-bottom:0}" +
    ".body ul{list-style:disc;padding-left:20px}.body ol{list-style:decimal;padding-left:20px}" +
    ".body li{padding:0;border:0}" +
    ".body a{color:#1d3a8f;text-decoration:underline;text-underline-offset:3px}" +
    ".body strong{font-weight:600;color:#0e1116}.body em{font-style:italic}" +
    ".body code{padding:1px 4px;background:#f6f7f9;font:.875em ui-monospace,SFMono-Regular,Menlo,monospace}" +
    ".foot{padding:12px;border-top:1px solid #e4e7ec}" +
    ".all{display:block;padding:10px 16px;background:#f6f7f9;color:#0e1116;font-size:14px;font-weight:500;text-align:center;text-decoration:none}" +
    ".all:hover{background:#1d3a8f;color:#fff}";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function day(d, locale) {
    try {
      return new Date(d + "T00:00:00Z").toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    } catch {
      return d;
    }
  }

  function section(label, posts, data) {
    if (!posts.length) return "";
    return (
      "<section><h3>" + esc(label) + "</h3><ol>" +
      posts
        .map(function (p) {
          return (
            "<li><p class=meta><span class='tag " + esc(p.category) + "'>" + esc(data.copy.tags[p.category]) + "</span>" +
            (p.type === "coming" ? "<span class='tag coming'>" + esc(data.copy.tags.coming) + "</span>" : "") +
            (p.publishedOn ? "<time datetime='" + esc(p.publishedOn) + "'>" + esc(day(p.publishedOn, data.lang)) + "</time>" : "") +
            "</p><p class=post-title>" + esc(p.title) + "</p>" +
            (p.html ? "<div class=body>" + p.html + "</div>" : "") +
            "</li>"
          );
        })
        .join("") +
      "</ol></section>"
    );
  }

  function mount(data) {
    var t = data.copy;
    var host = document.createElement("div");
    host.setAttribute("data-usechangelog", "");
    // Inline and !important, so the page's CSS can't give the host a transform or
    // containment that would break the fixed-position panel.
    host.style.cssText = "all:initial !important";
    document.body.appendChild(host);
    var shadow = host.attachShadow({ mode: "open" });
    var coming = data.posts.filter(function (p) { return p.type === "coming"; });
    var shipped = data.posts.filter(function (p) { return p.type !== "coming"; });

    shadow.innerHTML =
      "<style>" + CSS + "</style><div class=root>" +
      (selector ? "" : "<button type=button class=fab aria-haspopup=dialog aria-expanded=false><i aria-hidden=true></i>" + esc(t.button) + "</button>") +
      "<div class=panel role=dialog tabindex=-1 aria-label='" + esc(t.title) + "' hidden>" +
      "<div class=head><div><p class=title>" + esc(t.title) + "</p><p class=name>" + esc(data.name) + "</p></div>" +
      "<button type=button class=close aria-label='" + esc(t.close) + "'><svg viewBox='0 0 10 10' width=12 height=12 aria-hidden=true><path d='M1 1l8 8M9 1l-8 8' stroke=currentColor stroke-width=1.4 /></svg></button></div>" +
      "<div class=list>" +
      (data.posts.length ? section(t.tags.coming, coming, data) + section(t.latest, shipped, data) : "<p class=empty>" + esc(t.empty) + "</p>") +
      "</div><div class=foot><a class=all target=_blank rel=noopener href='" + esc(data.url) + "'>" + esc(t.all) + " →</a></div></div></div>";

    var panel = shadow.querySelector(".panel");
    var fab = shadow.querySelector(".fab");
    var opener = null;

    function isTrigger(el) {
      return selector && el && el.closest && el.closest(selector);
    }

    // Anchored under the opener, or above it when there's no room below.
    function place() {
      var r = opener.getBoundingClientRect();
      var vw = document.documentElement.clientWidth;
      var vh = window.innerHeight;
      var w = panel.offsetWidth;
      var below = vh - r.bottom - 24;
      var above = r.top - 24;
      var s = panel.style;
      s.left = Math.max(16, Math.min(r.right - w, vw - w - 16)) + "px";
      if (below >= 320 || below >= above) {
        s.top = r.bottom + 8 + "px";
        s.bottom = "auto";
        s.maxHeight = Math.min(640, below) + "px";
      } else {
        s.top = "auto";
        s.bottom = vh - r.top + 8 + "px";
        s.maxHeight = Math.min(640, above) + "px";
      }
    }

    function open(from) {
      opener = from;
      panel.hidden = false;
      place();
      if (opener.setAttribute) opener.setAttribute("aria-expanded", "true");
      panel.focus();
    }

    function close() {
      if (panel.hidden) return;
      panel.hidden = true;
      if (opener.setAttribute) opener.setAttribute("aria-expanded", "false");
      if (opener.focus) opener.focus();
    }

    if (fab) {
      fab.addEventListener("click", function () {
        if (panel.hidden) open(fab);
        else close();
      });
    } else {
      // Delegated, so a trigger rendered later (an SPA route) works too.
      document.addEventListener("click", function (e) {
        var el = isTrigger(e.target);
        if (!el) return;
        e.preventDefault();
        if (panel.hidden) open(el);
        else close();
      });
    }

    shadow.querySelector(".close").addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    document.addEventListener("mousedown", function (e) {
      if (panel.hidden) return;
      var path = e.composedPath ? e.composedPath() : [];
      if (path.indexOf(host) !== -1 || isTrigger(e.target)) return;
      close();
    });
    window.addEventListener("resize", function () {
      if (!panel.hidden) place();
    });
    window.addEventListener("scroll", function () {
      if (!panel.hidden) place();
    }, { passive: true });
  }
})();
