import { useEffect, useState } from 'react';

/**
 * Hook: lógica central do cronômetro de torneio.
 * Regra DOA: torneios iniciam/encerram às 21:00 hora LOCAL do servidor.
 * Dura 24h contínuas.
 *
 * @param {number} offset - UTC offset do servidor (ex: -3 para BRT)
 * @returns {{ horaLocal, countdown, isAtivo, isUrgente, faseTexto }}
 */
export function useTorneioTimer(offset = 0) {
  const [horaLocal, setHoraLocal]   = useState('--/-- - --:--:--');
  const [countdown, setCountdown]   = useState('00:00:00');
  const [isAtivo,   setIsAtivo]     = useState(false);
  const [isUrgente, setIsUrgente]   = useState(false);
  const [faseTexto, setFaseTexto]   = useState('');

  useEffect(() => {
    const tick = setInterval(() => {
      const agora      = new Date();
      const serverDate = new Date(agora.getTime() + offset * 3600000);

      const hh = serverDate.getUTCHours();
      const mm = serverDate.getUTCMinutes();
      const ss = serverDate.getUTCSeconds();

      // Hora formatada
      const dd     = serverDate.getUTCDate();
      const mo     = serverDate.getUTCMonth() + 1;
      const meses  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const moNome = meses[serverDate.getUTCMonth()];
      setHoraLocal(
        `${String(dd).padStart(2,'0')} de ${moNome} às ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
      );

      // Cálculo do tempo restante até a próxima virada (21:00)
      const totalSeg = hh * 3600 + mm * 60 + ss;
      const inicio   = 21 * 3600;
      const tempoRestante = totalSeg >= inicio
        ? (24 * 3600 - totalSeg) + inicio   // 21:00–23:59 → conta até 21:00 do dia seguinte
        : inicio - totalSeg;                 // 00:00–20:59 → conta até 21:00 de hoje

      setIsAtivo(true); // torneio é sempre ativo (24h contínuas)
      setIsUrgente(tempoRestante <= 300);
      setFaseTexto(
        hh >= 21
          ? '🔥 Torneio iniciado — encerra às 21:00 de amanhã'
          : '⚔️ Torneio em andamento — encerra às 21:00 de hoje'
      );

      const h = Math.floor(tempoRestante / 3600);
      const m = Math.floor((tempoRestante % 3600) / 60);
      const s = tempoRestante % 60;
      setCountdown(
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      );
    }, 1000);

    return () => clearInterval(tick);
  }, [offset]);

  return { horaLocal, countdown, isAtivo, isUrgente, faseTexto };
}
