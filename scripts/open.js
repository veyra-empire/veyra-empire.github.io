(function() {
  'use strict';

  // Must match PROXY_URL in app.js / install.js / submit.js.
  var PROXY_URL = 'https://script.google.com/macros/s/AKfycbzUHg1z18WmWFSyEsZStaK2kmax2JXnPzK4LrTyEitSFVBQ2u2vfFeO6wZhjWx58EJZ7w/exec';

  // ─── JSONP helper (matches app.js / install.js) ──────────────────────────
  function jsonp(url) {
    return new Promise(function(resolve, reject) {
      var cb = '__veyra_cb_' + Math.random().toString(36).slice(2) + '_' + Date.now();
      var script = document.createElement('script');
      var timer = setTimeout(function() { cleanup(); reject(new Error('timeout')); }, 30000);
      function cleanup() {
        clearTimeout(timer);
        try { delete window[cb]; } catch (_) { window[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      window[cb] = function(data) { cleanup(); resolve(data); };
      script.onerror = function() { cleanup(); reject(new Error('network')); };
      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + encodeURIComponent(cb);
      document.head.appendChild(script);
    });
  }

  function show(id) {
    ['state-opening', 'state-error'].forEach(function(s) {
      var el = document.getElementById(s);
      if (el) el.hidden = (s !== id);
    });
  }

  function fail(message) {
    var el = document.getElementById('error-msg');
    if (el) el.textContent = message;
    show('state-error');
  }

  function getQuery() {
    var q = location.search.replace(/^\?/, '');
    var out = {};
    if (!q) return out;
    q.split('&').forEach(function(kv) {
      var i = kv.indexOf('=');
      if (i >= 0) out[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
    });
    return out;
  }

  // ─── Error code → user-facing message ────────────────────────────────────
  // Codes mirror apiOpen's response shape in Code.gs.
  var ERROR_MESSAGES = {
    'invalid-kind':       'Invalid link.',
    'expired':            'This link has expired. Return to the archive and click Open again.',
    'mismatch':           'Link does not match the requested item.',
    'no-member':          'Access revoked or sign-in lost. Return to the archive and sign in again.',
    'unknown':            'This item is no longer available.',
    'tier-insufficient':  'Your tier no longer grants access to this item.',
    'misconfigured':      'Destination is misconfigured. Ping lmv in Discord.',
    'server-error':       'Something went wrong on the server. Try again in a moment.'
  };

  function init() {
    var q = getQuery();
    var kind = q.kind || '';
    var id   = q.id   || '';
    var tok  = q.t    || '';

    if (!kind || !id || !tok) { fail('Invalid link.'); return; }

    var status = document.getElementById('status');
    if (status) status.textContent = 'Resolving destination\u2026';

    jsonp(PROXY_URL +
          '?api=open' +
          '&kind=' + encodeURIComponent(kind) +
          '&id='   + encodeURIComponent(id) +
          '&t='    + encodeURIComponent(tok))
      .then(function(body) {
        if (body && body.url && /^https?:\/\//i.test(body.url)) {
          // Top-level navigation - we ARE the top window of the new tab.
          // No iframe sandbox in the way.
          location.replace(body.url);
          return;
        }
        var err = (body && body.error) || 'server-error';
        fail(ERROR_MESSAGES[err] || ERROR_MESSAGES['server-error']);
      })
      .catch(function() {
        fail('Network error resolving the link. Try again in a moment.');
      });
  }

  init();
})();
