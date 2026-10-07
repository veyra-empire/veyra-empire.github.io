// This host only forwards to the site. Every path goes to the same page on
// veyraempire.com, the old /scripts/ prefix dropped, query and hash kept.
(function () {
  var path = location.pathname.replace(/^\/scripts\/?/, '/');
  location.replace('https://veyraempire.com' + path + location.search + location.hash);
})();
