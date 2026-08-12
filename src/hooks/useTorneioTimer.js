import { useEffect, useState } from 'react';
import { useI18n } from './useI18n.jsx';

/**
 * Hook: lógica central do cronômetro de torneio.
 * Regra DOA: torneios iniciam/encerram às 21:00 hora LOCAL do servidor.
 * Dura 24h contínuas.
 *
 * @param {number} offset - UTC offset do servidor (ex: -3 para BRT)
 * @returns {{ horaLocal, countdown, isAtivo, isUrgente, faseTexto }}
 */
export function useTorneioTimer(offset = 0) {
  const { t, locale } = useI18n();
  const [horaLocal, setHoraLocal]   = useState('--/-- - --:--:--');
  const [horaSomente, setHoraSomente] = useState('--:--:--');
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

      // Hora formatada conforme o idioma escolhido. A data já foi deslocada
      // pelo fuso do realm e é formatada em UTC para não aplicar o fuso do aparelho.
      const formatDate = new Intl.DateTimeFormat(locale, {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'UTC',
      });
      const formatTime = new Intl.DateTimeFormat(locale, {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC',
      });
      setHoraLocal(formatDate.format(serverDate));
      setHoraSomente(formatTime.format(serverDate));

      // Cálculo do tempo restante até a próxima virada (21:00)
      const totalSeg = hh * 3600 + mm * 60 + ss;
      const inicio   = 21 * 3600;
      const tempoRestante = totalSeg >= inicio
        ? (24 * 3600 - totalSeg) + inicio   // 21:00–23:59 → conta até 21:00 do dia seguinte
        : inicio - totalSeg;                 // 00:00–20:59 → conta até 21:00 de hoje

      setIsAtivo(true); // torneio é sempre ativo (24h contínuas)
      setIsUrgente(tempoRestante <= 300);
      setFaseTexto(hh >= 21 ? t('torneio.status.ends_tomorrow') : t('torneio.status.ends_today'));

      const h = Math.floor(tempoRestante / 3600);
      const m = Math.floor((tempoRestante % 3600) / 60);
      const s = tempoRestante % 60;
      setCountdown(
        `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      );
    }, 1000);

    return () => clearInterval(tick);
  }, [offset, locale, t]);

  return { horaLocal, horaSomente, countdown, isAtivo, isUrgente, faseTexto };
}
