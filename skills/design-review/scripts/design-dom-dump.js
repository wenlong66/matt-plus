// Adapted from gstack lib/dom-dump-script.ts at 92cfd07a (see package notices).
// Browser-context FUNCTION expression: read/review, then evaluate in the page.
// Only the newly created document clone is edited; the live page is untouched.
() => {
  const root = document.documentElement.cloneNode(true);
  const head = root.querySelector('head') || root;
  const liveLinks = Array.from(document.querySelectorAll('link'));
  const cloneLinks = Array.from(root.querySelectorAll('link'));
  const sheets = liveLinks.reduce((result, link, index) => {
    const sheet = link.sheet;
    const clone = cloneLinks[index];
    if (link.disabled || (link.getAttribute('rel') || '').includes('alternate')) {
      if (clone) clone.remove();
      return result;
    }
    if (!sheet) {
      if ((link.getAttribute('rel') || '').includes('stylesheet')) {
        if (clone) clone.remove();
        return { ...result, unresolved: result.unresolved + 1 };
      }
      return result;
    }
    if (clone) clone.remove();
    try {
      const text = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
      const media = sheet.media && sheet.media.mediaText;
      const css = media && media !== 'all' ? '@media ' + media + ' {\n' + text + '\n}' : text;
      // Ordinals retain provenance without copying signed stylesheet URLs.
      return { ...result, css: [...result.css, '/* linked stylesheet ' + index + ' */\n' + css] };
    } catch {
      return { ...result, unresolved: result.unresolved + 1 };
    }
  }, { css: [], unresolved: 0 });
  const dataUrl = /url\(\s*(["']?)data:[^)]{1024,}\)/g;
  const cssQuery = /url\(\s*(["']?)([^'"\)?#]*)[?#][^'"\)]*\1\s*\)/g;
  const cleanCss = text => text.replace(dataUrl, 'url(data:,design-stripped)').replace(cssQuery, 'url($1$2$1)');
  if (sheets.css.length) {
    const style = document.createElement('style');
    style.setAttribute('data-design-dom-css', '');
    const hex = number => Number(number).toString(16).padStart(2, '0');
    style.textContent = cleanCss(sheets.css.join('\n')).replace(/rgb\((\d+), (\d+), (\d+)\)/g,
      (match, red, green, blue) => '#' + hex(red) + hex(green) + hex(blue));
    head.appendChild(style);
  }
  for (const element of Array.from(root.querySelectorAll('style'))) {
    if (element.getAttribute('data-design-dom-css') === null && element.textContent) element.textContent = cleanCss(element.textContent);
  }
  const urlAttributes = ['href', 'src', 'poster', 'action', 'formaction', 'data', 'ping', 'cite', 'background', 'xlink:href'];
  const cutQuery = value => value.split('?')[0].split('#')[0];
  const scripts = Array.from(root.querySelectorAll('script'));
  const strippedScripts = scripts.filter(element => element.textContent).length;
  for (const element of scripts) element.textContent = '';
  for (const element of Array.from(root.querySelectorAll('textarea'))) element.textContent = '';
  for (const element of Array.from(root.querySelectorAll('template, noscript'))) element.remove();
  for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;
      if (name.startsWith('on')) element.removeAttribute(attribute.name);
      else if (name === 'srcdoc') element.setAttribute(name, '');
      else if (name === 'style') element.setAttribute(name, cleanCss(value));
      else if (name === 'value' && ['INPUT', 'TEXTAREA'].includes(element.nodeName)) element.setAttribute(name, '');
      else if ((name === 'value' || name.startsWith('data-')) && value.length > 32) element.setAttribute(name, '');
      else if (name === 'content' && element.nodeName === 'META' && element.getAttribute('name') !== 'viewport') element.setAttribute(name, '');
      else if (value.startsWith('data:') && value.length > 1024) element.setAttribute(name, 'data:,design-stripped');
      else if (name === 'srcset') element.setAttribute(name, value.split(',').map(candidate => {
        const [url = '', ...descriptors] = candidate.trim().split(/\s+/);
        return [cutQuery(url), ...descriptors].join(' ');
      }).join(', '));
      else if (urlAttributes.includes(name) && /[?#]/.test(value) && !value.startsWith('data:')) element.setAttribute(name, cutQuery(value));
    }
  }
  const notes = [
    'shadow DOM and constructed stylesheets not captured',
    'cross-origin CSS not resolved; inaccessible or unloaded sheets: ' + sheets.unresolved,
    'scripts stripped: ' + strippedScripts + '; runtime-injected styles not guaranteed captured'
  ];
  return '<!DOCTYPE html>\n' + root.outerHTML + '\n<!-- design-dom-dump: ' + notes.join('; ') + ' -->\n';
}
