import 'server-only';
import { randomUUID } from 'node:crypto';

type Level = 'info' | 'warn' | 'error';

/**
 * Structured JSON logs for the hosting log drain. Never pass personal data
 * (names, e-mails, phones, messages, file contents) into `meta`.
 */
export function logEvent(level: Level, event: string, meta: Record<string, unknown> = {}) {
  const line = JSON.stringify({ at: new Date().toISOString(), level, event, ...meta });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export const newId = () => randomUUID().slice(0, 8);
