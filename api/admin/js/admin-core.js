(function () {
  'use strict';

  const TOKEN_KEY = 'doa_admin_token';

  function escapeHtml(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }


  function dataArg(value) {
    return encodeURIComponent(JSON.stringify(value)).replace(/'/g, '%27');
  }

  function fromDataArg(value) {
    return JSON.parse(decodeURIComponent(value));
  }

  function strArg(value) {
    return encodeURIComponent(String(value ?? '')).replace(/'/g, '%27');
  }

  function fromStrArg(value) {
    return decodeURIComponent(value);
  }

  function safeColor(value, fallback = '#C8A84A') {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback;
  }

  function getToken() {
    const sessionToken = sessionStorage.getItem(TOKEN_KEY) || '';
    const legado = localStorage.getItem(TOKEN_KEY) || '';
    if (!sessionToken && legado) {
      sessionStorage.setItem(TOKEN_KEY, legado);
      localStorage.removeItem(TOKEN_KEY);
      return legado;
    }
    return sessionToken;
  }

  function setToken(token) {
    if (!token) return clearToken();
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  async function lerResposta(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: response.ok, status: response.status, data: null };
    }
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  }

  function mensagemErro(data, fallback = 'Falha na requisição.') {
    return data?.mensagem || data?.erro || fallback;
  }

  async function request(url, options = {}) {
    const { auth = true, timeout = 10000, headers = {}, ...rest } = options;
    const finalHeaders = { ...headers };
    const token = getToken();
    if (auth && token && !finalHeaders.Authorization) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      signal: rest.signal || AbortSignal.timeout(timeout),
    });
    return response;
  }

  window.DOAAdminCore = Object.freeze({
    escapeHtml,
    dataArg,
    fromDataArg,
    strArg,
    fromStrArg,
    safeColor,
    getToken,
    setToken,
    clearToken,
    lerResposta,
    mensagemErro,
    request,
  });
})();
