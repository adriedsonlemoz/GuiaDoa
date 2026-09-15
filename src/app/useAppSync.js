import { useEffect, useMemo, useState } from 'react';
import { useGameData } from '../data/GameDataContext.jsx';

export default function useAppSync() {
  const { loading, erro, progress, lastUpdated, refresh, dataSource, hasData, retryAttempt } = useGameData();
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const syncStatus = loading
    ? 'syncing'
    : erro
      ? (hasData ? 'cached' : 'erro')
      : (dataSource === 'cache' ? 'cached' : 'ok');

  const syncInfo = useMemo(() => ({
    ts:lastUpdated,
    status:syncStatus,
    fonte:dataSource,
    hasData,
    retryAttempt,
  }), [lastUpdated, syncStatus, dataSource, hasData, retryAttempt]);

  const sincronizarAgora = async () => { try { await refresh(); } catch { /* exibido pelo provider/status */ } };

  return { syncStatus, syncProgress:progress, syncInfo, isOffline, sincronizarAgora };
}
