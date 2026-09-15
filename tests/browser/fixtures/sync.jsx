import React from 'react';
import { createRoot } from 'react-dom/client';
import { GameDataProvider, useGameData } from '../../../src/data/GameDataContext.jsx';
import { I18nProvider, useI18n } from '../../../src/hooks/useI18n.jsx';

function Consumer() {
  const { refresh, tropas, hasData, loading, erro, dataSource, retryAttempt, lastUpdated } = useGameData();
  const { setLocale } = useI18n();
  window.syncTest = { refresh, setLocale };
  return <>
    <h1>Shell ready</h1>
    <pre id="state">{JSON.stringify({ tropas, hasData, loading, code:erro?.code || '', dataSource, retryAttempt, lastUpdated })}</pre>
    <button onClick={() => refresh().catch(() => {})}>Sync</button>
  </>;
}

createRoot(document.getElementById('root')).render(
  <I18nProvider><GameDataProvider><Consumer /></GameDataProvider></I18nProvider>
);
