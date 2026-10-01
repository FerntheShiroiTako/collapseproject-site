// Loaded synchronously in <head>, before first paint:
// - applies the saved theme, so there's no flash of the wrong one;
// - records which page the URL asks for, so the CSS can show only that page until app.js takes over.
// Without JavaScript neither happens, and every page is simply visible one after another.
try { const t = localStorage.getItem('collapse-theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
const root = document.documentElement;
root.classList.add('js');
const wanted = (location.hash || '#home').slice(1).split('-')[0];
root.dataset.boot = ['home', 'docs', 'team', 'support', 'terms', 'privacy'].includes(wanted) ? wanted : 'home';
