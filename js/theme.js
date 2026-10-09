// Loaded synchronously in <head>, before first paint:
// - sends old one-page links like /#terms or /#docs-setup to their own page (/terms/, /docs/#docs-setup);
// - applies the saved theme, so there's no flash of the wrong one.
(function () {
  const hash = location.hash.slice(1), page = hash.split('-')[0];
  if (location.pathname === '/' && ['docs', 'team', 'support', 'terms', 'privacy'].includes(page))
    location.replace('/' + page + '/' + (hash.includes('-') ? '#' + hash : ''));
})();
try { const t = localStorage.getItem('collapse-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
document.documentElement.classList.add('js');
