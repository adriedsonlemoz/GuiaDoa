(function () {
  'use strict';

  const CONTENT_ID = 'content';
  const escapeHtml = value => window.DOAAdminCore?.escapeHtml ? window.DOAAdminCore.escapeHtml(value) : String(value);
  const FOLD_PREFIX = 'doa_admin_fold_';

  const slugify = value => String(value || 'secao')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'secao';

  const getStoredFold = key => {
    try { return localStorage.getItem(FOLD_PREFIX + key) === '1'; }
    catch { return false; }
  };

  const setStoredFold = (key, collapsed) => {
    try { localStorage.setItem(FOLD_PREFIX + key, collapsed ? '1' : '0'); }
    catch { /* armazenamento local é opcional */ }
  };

  function setToggleState(button, target, collapsed) {
    target.hidden = collapsed;
    button.setAttribute('aria-expanded', String(!collapsed));
    button.classList.toggle('is-collapsed', collapsed);
    const icon = button.querySelector('.admin-fold-icon');
    if (icon) icon.textContent = collapsed ? '⌄' : '⌃';
    button.title = collapsed ? 'Mostrar seção' : 'Ocultar seção';
  }

  function enhanceStats(root) {
    root.querySelectorAll('.stats-row:not([data-admin-fold-ready])').forEach((row, index) => {
      row.dataset.adminFoldReady = '1';
      const content = document.getElementById(CONTENT_ID);
      const crumb = document.querySelector('.breadcrumb-current')?.textContent || 'inicio';
      const key = `stats-${slugify(crumb)}-${index}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'admin-summary-toggle';
      button.innerHTML = '<span>Resumo</span><span class="admin-fold-icon">⌃</span>';
      button.setAttribute('aria-label', 'Mostrar ou ocultar resumo');
      row.parentNode.insertBefore(button, row);
      const collapsed = getStoredFold(key);
      setToggleState(button, row, collapsed);
      button.addEventListener('click', () => {
        const next = !row.hidden;
        setToggleState(button, row, next);
        setStoredFold(key, next);
      });
      if (content) content.dataset.hasSummaryToggle = '1';
    });
  }

  function enhanceCards(root) {
    root.querySelectorAll('.card:not([data-admin-fold-ready])').forEach((card, index) => {
      const header = card.querySelector(':scope > .card-header');
      const body = card.querySelector(':scope > .card-body');
      const heading = header?.querySelector('h2');
      if (!header || !body || !heading) return;

      card.dataset.adminFoldReady = '1';
      const key = `card-${slugify(heading.textContent)}-${index}`;
      let titleWrap = header.querySelector('.admin-card-title-wrap');
      if (!titleWrap) {
        titleWrap = document.createElement('div');
        titleWrap.className = 'admin-card-title-wrap';
        header.insertBefore(titleWrap, header.firstChild);
        titleWrap.appendChild(heading);
      }

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'admin-card-toggle';
      toggle.innerHTML = '<span class="admin-fold-icon">⌃</span>';
      toggle.setAttribute('aria-label', `Mostrar ou ocultar ${heading.textContent.trim()}`);
      titleWrap.insertBefore(toggle, heading);

      const collapsed = getStoredFold(key);
      setToggleState(toggle, body, collapsed);
      card.classList.toggle('is-collapsed', collapsed);
      toggle.addEventListener('click', () => {
        const next = !body.hidden;
        setToggleState(toggle, body, next);
        card.classList.toggle('is-collapsed', next);
        setStoredFold(key, next);
      });
    });
  }

  function headerLabel(th) {
    return String(th?.textContent || '').replace(/[▲▼]/g, '').trim();
  }

  function primaryColumnIndex(headers) {
    const exact = /^(nome|drag[aã]o|edif[ií]cio|item|pesquisa|reino)$/i;
    const direct = headers.findIndex(h => exact.test(headerLabel(h)));
    if (direct >= 0) return direct;
    return headers.findIndex(h => /nome|drag[aã]o/i.test(headerLabel(h)));
  }

  function actionColumnIndex(headers) {
    return headers.findIndex(h => /a[cç][oõ]es|editar/i.test(headerLabel(h)));
  }

  function cloneMedia(cell) {
    if (!cell) return '';
    const image = cell.querySelector('img');
    if (image) {
      const clone = image.cloneNode(true);
      clone.removeAttribute('style');
      clone.className = 'admin-mobile-thumb';
      return clone.outerHTML;
    }
    const text = cell.textContent.trim();
    return text ? `<span class="admin-mobile-emoji">${cell.innerHTML}</span>` : '';
  }

  function compactAction(button) {
    const clone = button.cloneNode(true);
    const full = clone.textContent.replace(/\s+/g, ' ').trim();
    const lower = full.toLowerCase();
    clone.classList.add('admin-mobile-action');
    clone.title = full;
    clone.setAttribute('aria-label', full);

    if (/editar/.test(lower)) clone.innerHTML = '✏ <span>Editar</span>';
    else if (/excluir|apagar|remover/.test(lower)) clone.innerHTML = '🗑 <span>Apagar</span>';
    return { clone, primary: /editar|excluir|apagar|remover/.test(lower) };
  }

  function enhanceTables(root) {
    root.querySelectorAll('.tabela-wrap > table:not([data-admin-mobile-ready])').forEach(table => {
      if (table.classList.contains('tabela-niveis') || table.classList.contains('admin-no-mobile-list')) return;
      const headers = [...table.querySelectorAll('thead th')];
      const primary = primaryColumnIndex(headers);
      const actions = actionColumnIndex(headers);
      if (primary < 0 || actions < 0) return;

      table.dataset.adminMobileReady = '1';
      const list = document.createElement('div');
      list.className = 'admin-mobile-list';

      [...table.querySelectorAll('tbody tr')].forEach((tr, rowIndex) => {
        const cells = [...tr.children].filter(el => el.tagName === 'TD');
        if (!cells.length || !cells[primary]) return;
        if (cells.length === 1 && cells[0].hasAttribute('colspan')) return;

        const row = document.createElement('article');
        row.className = 'admin-mobile-row';
        const detailsId = `admin-mobile-details-${Math.random().toString(36).slice(2)}-${rowIndex}`;

        let media = '';
        for (let i = 0; i < primary; i++) {
          if (cells[i]?.querySelector('img') || cells[i]?.textContent.trim()) {
            media = cloneMedia(cells[i]);
            if (media) break;
          }
        }

        const strong = cells[primary].querySelector('strong');
        const primaryText = strong ? strong.textContent.trim() : cells[primary].textContent.trim();
        const actionButtons = [...cells[actions].querySelectorAll('button')].map(compactAction);
        const mainActions = actionButtons.filter(x => x.primary).map(x => x.clone.outerHTML).join('');
        const extraActions = actionButtons.filter(x => !x.primary).map(x => x.clone.outerHTML).join('');

        const detailParts = [];
        headers.forEach((th, i) => {
          if (i === primary || i === actions || !cells[i]) return;
          const label = headerLabel(th);
          if (!label) return;
          const value = cells[i].innerHTML.trim();
          if (!value) return;
          detailParts.push(`<div class="admin-mobile-detail"><span>${label}</span><strong>${value}</strong></div>`);
        });
        if (extraActions) {
          detailParts.push(`<div class="admin-mobile-tools"><span>Ferramentas</span><div>${extraActions}</div></div>`);
        }
        const hasDetails = detailParts.length > 0;

        row.innerHTML = `
          <div class="admin-mobile-row-main">
            ${media ? `<div class="admin-mobile-media">${media}</div>` : ''}
            <div class="admin-mobile-name" title="${escapeHtml(primaryText)}">${escapeHtml(primaryText)}</div>
            <div class="admin-mobile-main-actions">${mainActions}</div>
            ${hasDetails ? `<button class="admin-mobile-detail-toggle" type="button" aria-expanded="false" aria-controls="${detailsId}" title="Mostrar detalhes">⌄</button>` : ''}
          </div>
          ${hasDetails ? `<div class="admin-mobile-details" id="${detailsId}" hidden>${detailParts.join('')}</div>` : ''}
        `;

        const toggle = row.querySelector('.admin-mobile-detail-toggle');
        const details = row.querySelector('.admin-mobile-details');
        if (toggle && details) {
          toggle.addEventListener('click', () => {
            const opening = details.hidden;
            details.hidden = !opening;
            toggle.textContent = opening ? '⌃' : '⌄';
            toggle.setAttribute('aria-expanded', String(opening));
            toggle.title = opening ? 'Ocultar detalhes' : 'Mostrar detalhes';
          });
        }
        list.appendChild(row);
      });

      if (list.children.length) {
        table.classList.add('admin-desktop-table');
        table.parentNode.appendChild(list);
      }
    });
  }

  function enhance(root = document) {
    const content = root.id === CONTENT_ID ? root : root.querySelector?.(`#${CONTENT_ID}`) || document.getElementById(CONTENT_ID);
    if (!content) return;
    enhanceStats(content);
    enhanceCards(content);
    enhanceTables(content);
  }

  function scheduleEnhance() {
    if (scheduleEnhance.pending) return;
    scheduleEnhance.pending = true;
    requestAnimationFrame(() => {
      scheduleEnhance.pending = false;
      enhance();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById(CONTENT_ID);
    if (!content) return;
    enhance(content);
    const observer = new MutationObserver(scheduleEnhance);
    observer.observe(content, { childList: true, subtree: true });
  });

  window.enhanceAdminLayout = enhance;
})();
