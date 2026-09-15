import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { formatRealmClock, parseUtcOffset, SERVER_BASE_TIMEZONE } from '../../utils/timezone.js';

export default function useRealmClock(fuso) {
  const { locale } = useI18n();
  const realmFuso = fuso || SERVER_BASE_TIMEZONE;
  const offset = useMemo(() => parseUtcOffset(realmFuso), [realmFuso]);
  const [clock, setClock] = useState(() => formatRealmClock(realmFuso, new Date(), locale));

  useEffect(() => {
    const tick = () => setClock(formatRealmClock(realmFuso, new Date(), locale));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [realmFuso, locale]);

  return { ...clock, offset, fuso:realmFuso };
}
