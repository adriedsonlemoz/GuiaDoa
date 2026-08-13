import React, { useState } from 'react';
import { I18nProvider, useI18n } from './hooks/useI18n.jsx';
import Modal from './ui/Modal.jsx';
import { DISPLAY_VERSION } from './version.js';
import useHashRouter from './app/useHashRouter.js';
import useAppSync from './app/useAppSync.js';
import { renderRoute, getRouteLabel } from './app/routes.jsx';
import ErrorBoundary from './app/ErrorBoundary.jsx';
import SyncProgressBanner from './app/SyncProgressBanner.jsx';
import StartupGate from './app/StartupGate.jsx';
import { GameDataProvider, useGameData } from './data/GameDataContext.jsx';

const GuiaApp = () => {
  const { route, setRoute, canGoBack } = useHashRouter();
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const { syncStatus, syncProgress } = useAppSync();
  const { dragoes } = useGameData();
  const { t, content } = useI18n();
  const currentRoute = getRouteLabel(route, dragoes, t, content);
  const isHome = route === 'home';

  const handleGoHome = () => {
    if (window.temAlteracoesNaoSalvas) setExitDialogOpen(true);
    else setRoute('home');
  };

  const handleBack = () => {
    if (window.temAlteracoesNaoSalvas) return setExitDialogOpen(true);
    if (isHome) return;
    if (canGoBack) window.history.back();
    else setRoute('home', { replace: true });
  };

  const title = isHome ? 'GUIA DOA' : (currentRoute?.label || 'GUIA DOA');
  const rightIcon = isHome ? '🛡️' : (currentRoute?.icon || '◆');

  return (
    <>
      <SyncProgressBanner status={syncStatus} progress={syncProgress} />

      <Modal open={exitDialogOpen} onClose={() => setExitDialogOpen(false)} maxWidth={320}>
        <div className="p-4 text-center">
          <p className="font-cinzel font-bold text-base tracking-wide text-aoe-dark mb-2 m-0">⚠️ {t('app.exit.title')}</p>
          <p className="font-nunito text-sm text-aoe-mid leading-relaxed mb-4 m-0">{t('app.exit.message')}</p>
          <div className="flex gap-2 justify-center">
            <button className="btn-ghost" onClick={() => setExitDialogOpen(false)}>{t('app.exit.stay')}</button>
            <button
              className="btn-danger"
              onClick={() => {
                setExitDialogOpen(false);
                window.temAlteracoesNaoSalvas = false;
                setRoute('home');
              }}
            >
              {t('app.exit.leave')}
            </button>
          </div>
        </div>
      </Modal>

      <header className="game-topbar">
        <button
          type="button"
          className="game-topbar-side"
          onClick={isHome ? handleGoHome : handleBack}
          aria-label={isHome ? 'GUIA DOA' : t('common.back')}
        >
          {isHome ? '🏰' : '‹'}
        </button>
        <div className="game-topbar-title">{title}</div>
        <div className="game-topbar-side" aria-hidden="true">{rightIcon}</div>
      </header>

      <main className="game-page">
        <ErrorBoundary onReset={() => setRoute('home')}>
          {renderRoute(route, setRoute)}
        </ErrorBoundary>
      </main>

      <footer style={{ width:'min(100%,760px)', margin:'0 auto', background:'linear-gradient(180deg,#3A5754,#304946)', borderTop:'1px solid #806033' }}>
        <div className="py-2 text-center" style={{ color:'rgba(255,247,223,.72)', fontSize:'.62rem', letterSpacing:'2px', fontWeight:800 }}>
          GUIA DOA · {DISPLAY_VERSION}
        </div>
      </footer>
    </>
  );
};

const App = () => (
  <I18nProvider>
    <StartupGate>
      <GameDataProvider>
        <GuiaApp />
      </GameDataProvider>
    </StartupGate>
  </I18nProvider>
);

export default App;
