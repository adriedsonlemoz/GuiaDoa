import { useEffect, useState } from 'react';

const utcTime = () => {
  const now = new Date();
  return [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()].map(value => String(value).padStart(2, '0')).join(':');
};

export default function useServerClock() {
  const [hora, setHora] = useState(utcTime);
  useEffect(() => {
    const id = setInterval(() => setHora(utcTime()), 1000);
    return () => clearInterval(id);
  }, []);
  return hora;
}
