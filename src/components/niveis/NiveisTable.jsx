import React from 'react';
import { C } from '../../theme.js';
import { formatNumber } from './niveisUtils.js';

export default function NiveisTable({ carregando, todosNiveis, currentPowerNum, nivelExato, proximaMeta, tabelaRef, nivelAtualRef }) {
  return (
    <div className="tw-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${C.BORDER_SOFT}` }}>
        <p className="font-cinzel font-bold text-xs uppercase tracking-wide m-0" style={{ color: C.TEXT_SECONDARY }}>Tabela de Níveis</p>
        <span className="font-nunito font-bold text-[0.65rem] px-2 py-0.5 rounded-full" style={{ background: `${C.ACCENT}20`, color: C.ACCENT_DEEP, border: `1px solid ${C.BORDER_SOFT}` }}>
          {carregando ? '…' : `${todosNiveis.length} níveis`}
        </span>
      </div>
      {carregando ? (
        <div className="flex items-center justify-center py-12"><p className="font-nunito font-semibold text-sm m-0" style={{ color: C.TEXT_MUTED }}>⏳ Carregando níveis…</p></div>
      ) : (
        <div ref={tabelaRef} className="overflow-auto" style={{ maxHeight: 460 }}>
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10"><tr><th className="tw-th text-center">Nível</th><th className="tw-th text-center">Poder Necessário</th><th className="tw-th text-center">Status</th></tr></thead>
            <tbody>
              {todosNiveis.map(([nivel, xpNivel]) => {
                const isUnknown = xpNivel === null;
                const concluido = !isUnknown && currentPowerNum >= xpNivel;
                const isAtual = nivel === nivelExato && nivelExato > 0;
                const isProxima = proximaMeta && proximaMeta[0] === nivel;
                const isMarco = nivel % 5 === 0;
                const isMarco10 = nivel % 10 === 0;
                const rowBg = isAtual ? `${C.BG_HEADER}18` : concluido ? `${C.SUCCESS}0D` : isProxima ? `${C.WARNING}12` : undefined;
                const borderLeft = isAtual ? `3px solid ${C.ACCENT}` : isProxima ? `3px solid ${C.WARNING}` : '3px solid transparent';
                const statusText = isAtual ? '📍 Nível Atual' : concluido ? '✓ Concluído' : isProxima ? '🎯 Próximo' : isUnknown ? 'Em breve' : 'Pendente';
                const statusColor = isAtual ? C.ACCENT_DEEP : concluido ? C.SUCCESS : isProxima ? C.WARNING : isUnknown ? C.TEXT_FAINT : C.TEXT_MUTED;
                return (
                  <tr key={nivel} ref={isAtual ? nivelAtualRef : null} style={{ background: rowBg, borderLeft }}>
                    <td className="tw-td text-center" style={{ paddingLeft: 6 }}><span className="font-nunito font-black text-sm" style={{ color: isAtual ? C.ACCENT_DEEP : isMarco10 ? C.BLUE : isMarco ? C.ACCENT_DEEP : C.TEXT_PRIMARY }}>{isMarco10 ? `⭐ ${nivel}` : isMarco ? `◆ ${nivel}` : nivel}</span></td>
                    <td className="tw-td text-center font-mono text-sm" style={{ color: isUnknown ? C.TEXT_FAINT : C.TEXT_SECONDARY }}>{formatNumber(xpNivel)}</td>
                    <td className="tw-td text-center"><span className="font-nunito font-bold text-[0.68rem] px-1.5 py-0.5 rounded" style={{ color: statusColor, background: isAtual ? `${C.ACCENT}15` : isProxima ? `${C.WARNING}15` : 'transparent' }}>{statusText}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
