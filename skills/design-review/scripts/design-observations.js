// Original design-system extraction DOM expressions, bundled for the browser adapter.
// Observation only: no storage/cookies, network calls, handlers, or application mutation.
// Browser-context IIFE, not a Playwright runner script. Inspect it, then embed its
// expression as the return value of a reviewed browser eval function or inside an
// approved runner's page.evaluate callback. eval --filename saves the result; it
// does not read this as a code file. Do not pass this raw file to run-code --filename
// (that interface expects a reviewed runner function accepting page).
(() => ({
  fonts: [...new Set([...document.querySelectorAll('*')].slice(0,500).map(e => getComputedStyle(e).fontFamily))],
  colors: [...new Set([...document.querySelectorAll('*')].slice(0,500).flatMap(e => [getComputedStyle(e).color, getComputedStyle(e).backgroundColor]).filter(c => c !== 'rgba(0, 0, 0, 0)'))],
  headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({tag:h.tagName, text:h.textContent.trim().slice(0,50), size:getComputedStyle(h).fontSize, weight:getComputedStyle(h).fontWeight})),
  touchTargets: [...document.querySelectorAll('a,button,input,[role=button]')].filter(e => {const r=e.getBoundingClientRect(); return r.width>0 && (r.width<44||r.height<44)}).map(e => ({tag:e.tagName, text:(e.textContent||'').trim().slice(0,30), w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height)})).slice(0,20)
}))()
