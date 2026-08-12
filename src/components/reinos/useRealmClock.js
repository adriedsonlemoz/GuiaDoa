import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { parseUtcOffset } from '../../utils/timezone.js';

function buildClock(offset, locale) {
  const shifted = new Date(Date.now() + offset * 3600000);
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZone: 'UTC',
  }).format(shifted);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC',
  }).format(shifted);
  return { time, date };
}

export default function useRealmClock(fuso) {
  const { locale } = useI18n();
  const offset = useMemo(() => parseUtcOffset(fuso), [fuso]);
  const [clock, setClock] = useState(() => buildClock(offset, locale));

  useEffect(() => {
    const tick = () => setClock(buildClock(offset, locale));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offset, locale]);

  return { ...clock, offset, fuso: fuso || 'UTC+0' };
}
