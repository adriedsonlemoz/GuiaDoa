import { SERVER_BASE_TIMEZONE, SERVER_DAILY_RESET_UTC } from '../utils/timezone.js';

export const GAME_CLOCK = Object.freeze({
  serverBase: SERVER_BASE_TIMEZONE,
  dailyReset: SERVER_DAILY_RESET_UTC,
  // Horários canônicos só entram aqui quando confirmados em UTC+0.
  zyrvorthian: '19:00',
  tournamentsEnd: '',
  dragonBattle: '',
});

export function canonicalTimeFor(key) {
  return GAME_CLOCK[key] || '';
}
