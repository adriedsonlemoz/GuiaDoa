import React, { useState } from 'react';
import { C } from './theme.js';
import { I18nProvider } from './hooks/useI18n.jsx';
import Modal from './ui/Modal.jsx';
import { DISPLAY_VERSION } from './version.js';
import useHashRouter from './app/useHashRouter.js';
import useAppSync from './app/useAppSync.js';
import { renderRoute, getRouteLabel } from './app/routes.jsx';
import OrnamentStripe from './app/OrnamentStripe.jsx';
import ErrorBoundary from './app/ErrorBoundary.jsx';
import SyncProgressBanner from './app/SyncProgressBanner.jsx';
import SyncStatusBar from './app/SyncStatusBar.jsx';
import StartupGate from './app/StartupGate.jsx';
import { GameDataProvider, useGameData } from './data/GameDataContext.jsx';

const GuiaApp = () => {
  const { route, setRoute, canGoBack } = useHashRouter();
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const { syncStatus, syncProgress, syncInfo, isOffline, sincronizarAgora } = useAppSync();
  const { dragoes } = useGameData();
  const currentRoute = getRouteLabel(route, dragoes);

  const handleGoHome = () => {
    if (window.temAlteracoesNaoSalvas) setExitDialogOpen(true);
    else setRoute('home');
  };

  const handleBack = () => {
    if (window.temAlteracoesNaoSalvas) return setExitDialogOpen(true);
    if (route === 'home') return;
    if (canGoBack) window.history.back();
    else setRoute('home', { replace: true });
  };

  return (
    <I18nProvider>
      <>
        <SyncProgressBanner status={syncStatus} progress={syncProgress} />

        <Modal open={exitDialogOpen} onClose={() => setExitDialogOpen(false)} maxWidth={320}>
          <div className="p-4 text-center">
            <p className="font-cinzel font-bold text-base tracking-wide text-aoe-dark mb-2 m-0">
              ⚠️ Aviso de Saída
            </p>
            <p className="font-nunito text-sm text-aoe-mid leading-relaxed mb-4 m-0">
              A tabela possui alterações não salvas.<br />
              Deseja sair e perder o progresso?
            </p>
            <div className="flex gap-2 justify-center">
              <button className="btn-ghost" onClick={() => setExitDialogOpen(false)}>Ficar</button>
              <button
                className="btn-danger"
                onClick={() => {
                  setExitDialogOpen(false);
                  window.temAlteracoesNaoSalvas = false;
                  setRoute('home');
                }}
              >
                Sair sem Salvar
              </button>
            </div>
          </div>
        </Modal>

        <header
          className="sticky top-0 z-40"
          style={{ backgroundColor: C.BG_HEADER, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          <OrnamentStripe />
          <div className="flex items-center justify-between px-3 gap-2" style={{ minHeight: 48 }}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-1.5 shrink-0 bg-transparent border-none cursor-pointer p-0"
              >
                <span className="text-xl" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>🛡️</span>
                <span
                  className="font-cinzel font-bold text-xs tracking-widest"
                  style={{ color: C.ACCENT, letterSpacing: '3px' }}
                >
                  GUIA DOA
                </span>
              </button>

              {currentRoute && route !== 'home' && (
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-aoe-gold4 text-xs opacity-60">›</span>
                  <div
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 min-w-0 overflow-hidden"
                    style={{ background: 'rgba(200,168,74,0.15)', border: '1px solid rgba(200,168,74,0.4)' }}
                  >
                    <span className="text-[0.65rem] leading-none shrink-0">{currentRoute.icon}</span>
                    <span
                      className="font-nunito font-bold text-[0.68rem] whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ color: C.ACCENT }}
                    >
                      {currentRoute.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {route !== 'home' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 shrink-0 rounded-md px-2 py-1 transition-all"
                style={{
                  border: '1px solid rgba(200,168,74,0.4)',
                  background: 'rgba(242,230,201,0.15)',
                  color: C.ACCENT,
                }}
              >
                <span className="text-xs">←</span>
                <span className="font-nunito font-bold text-xs" style={{ color: C.TEXT_HEADER }}>Voltar</span>
              </button>
            )}
          </div>
          <OrnamentStripe opacity={0.5} />
          <SyncStatusBar
            status={syncStatus}
            isOffline={isOffline}
            syncInfo={syncInfo}
            onSync={sincronizarAgora}
          />
        </header>

        <main className="max-w-2xl mx-auto px-2 py-3" style={{ minHeight: 'calc(100vh - 96px)' }}>
          <ErrorBoundary onReset={() => setRoute('home')}>
            {renderRoute(route, setRoute)}
          </ErrorBoundary>
        </main>

        <footer style={{ backgroundColor: C.BG_HEADER, borderTop: `2px solid ${C.BORDER_STRONG}` }}>
          <OrnamentStripe opacity={0.4} />
          <div className="py-2 text-center flex items-center justify-center gap-2 relative">
            <span style={{ color: C.ACCENT, fontSize: '0.7rem', opacity: 0.6 }}>◆</span>
            <span
              className="font-nunito text-[0.72rem] tracking-widest font-semibold"
              style={{ color: '#9A9080', letterSpacing: '2.5px' }}
            >
              GUIA DOA · {DISPLAY_VERSION}
            </span>
            <span style={{ color: C.ACCENT, fontSize: '0.7rem', opacity: 0.6 }}>◆</span>

          </div>
        </footer>
      </>
    </I18nProvider>
  );
};

const App = () => (
  <StartupGate>
    <GameDataProvider>
      <GuiaApp />
    </GameDataProvider>
  </StartupGate>
);

export default App;
