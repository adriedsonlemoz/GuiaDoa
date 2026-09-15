import { useCallback, useEffect, useState } from 'react';

export const lerRotaDaUrl = () => {
  if (typeof window === 'undefined') return 'home';
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return 'home';
  try { return decodeURIComponent(raw); } catch { return raw; }
};

export const hashDaRota = (route) => route === 'home' ? '#/' : `#/${encodeURIComponent(route)}`;

export default function useHashRouter() {
  const [route, setRouteState] = useState(() => lerRotaDaUrl());

  const setRoute = useCallback((nextRoute, options = {}) => {
    const destino = typeof nextRoute === 'string' && nextRoute ? nextRoute : 'home';
    const hash = hashDaRota(destino);
    const atual = window.history.state || {};
    const baseIndex = Number.isFinite(atual.doaIndex) ? atual.doaIndex : 0;
    const state = { doa: true, doaIndex: options.replace ? baseIndex : baseIndex + 1, route: destino };

    if (window.location.hash !== hash || options.replace) {
      if (options.replace) window.history.replaceState(state, '', hash);
      else window.history.pushState(state, '', hash);
    }
    setRouteState(destino);
  }, []);

  useEffect(() => {
    const rotaInicial = lerRotaDaUrl();
    if (!window.history.state?.doa) {
      window.history.replaceState({ doa: true, doaIndex: 0, route: rotaInicial }, '', hashDaRota(rotaInicial));
    }
    const atualizarPelaUrl = () => setRouteState(lerRotaDaUrl());
    window.addEventListener('popstate', atualizarPelaUrl);
    window.addEventListener('hashchange', atualizarPelaUrl);
    return () => {
      window.removeEventListener('popstate', atualizarPelaUrl);
      window.removeEventListener('hashchange', atualizarPelaUrl);
    };
  }, []);

  useEffect(() => {
    window.__setRoute = setRoute;
    return () => { delete window.__setRoute; };
  }, [setRoute]);

  const canGoBack = (window.history.state?.doaIndex || 0) > 0;

  return { route, setRoute, canGoBack };
}
