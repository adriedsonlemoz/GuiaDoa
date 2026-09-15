import { useEffect, useState } from 'react';
import { useI18n } from './useI18n.jsx';
import {
  SERVER_BASE_TIMEZONE,
  SERVER_DAILY_RESET_UTC,
  countdownTo,
  convertBaseUtcTimeToRealm,
  formatRealmClock,
  nextDailyBaseUtcOccurrence,
} from '../utils/timezone.js';

/**
 * Cronômetro central da virada diária.
 * A referência canônica é sempre UTC+0; o relógio mostrado ao usuário é convertido
 * para o fuso do realm selecionado, incluindo a mudança de data.
 */
export function useTorneioTimer(fuso = SERVER_BASE_TIMEZONE) {
  const { locale, t } = useI18n();
  const realmFuso = typeof fuso === 'string' ? fuso : `UTC${Number(fuso) >= 0 ? '+' : ''}${Number(fuso) || 0}`;
  const [state, setState] = useState({
    horaLocal:'--/-- - --:--:--',
    horaSomente:'--:--:--',
    countdown:'00:00:00',
    isAtivo:true,
    isUrgente:false,
    faseTexto:'',
    resetLocal:'--:--',
    resetDayDelta:0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const clock = formatRealmClock(realmFuso, now, locale, { seconds:true });
      const target = nextDailyBaseUtcOccurrence(SERVER_DAILY_RESET_UTC, now);
      const remaining = countdownTo(target, now) || { totalSeconds:0, hours:0, minutes:0, seconds:0 };
      const localReset = convertBaseUtcTimeToRealm(SERVER_DAILY_RESET_UTC, realmFuso) || { time:'00:00', dayDelta:0 };
      setState({
        horaLocal:`${clock.date} · ${clock.time}`,
        horaSomente:clock.time,
        countdown:`${String(remaining.hours).padStart(2,'0')}:${String(remaining.minutes).padStart(2,'0')}:${String(remaining.seconds).padStart(2,'0')}`,
        isAtivo:true,
        isUrgente:remaining.totalSeconds <= 300,
        faseTexto:t('torneio.status.next_reset'),
        resetLocal:localReset.time,
        resetDayDelta:localReset.dayDelta,
      });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [realmFuso, locale, t, fuso]);

  return state;
}
