/**
 * Form-session classification (honeypot + fill time). Pure and dependency-free so it can
 * be unit-tested with `node --test` (see src/lib/forms/session.test.ts).
 *
 * Only a filled honeypot is treated as a bot and answered with a fake success.
 * Timing problems are recoverable: the client keeps the entered data, receives a fresh
 * `startedAt` and can send again. A real enquiry is never acknowledged without delivery.
 */
export const MIN_FILL_MS = 3000;
export const MAX_FILL_MS = 24 * 60 * 60 * 1000;

export type SessionCheck =
  | { kind: 'bot' }
  | { kind: 'expired'; startedAt: number }
  | { kind: 'tooFast'; startedAt?: number }
  | { kind: 'ok' };

export function checkFormSession(input: { honeypot: unknown; startedAt: unknown; now: number }): SessionCheck {
  const { honeypot, now } = input;
  if (typeof honeypot === 'string' && honeypot.length > 0) return { kind: 'bot' };

  const startedAt = Number(input.startedAt);
  // Missing, malformed or older than 24 h: the session expired. The new stamp is pre-aged by
  // MIN_FILL_MS so an immediate resend with the kept data is accepted.
  if (!input.startedAt || !Number.isFinite(startedAt) || startedAt <= 0 || now - startedAt > MAX_FILL_MS) {
    return { kind: 'expired', startedAt: now - MIN_FILL_MS };
  }
  const elapsed = now - startedAt;
  if (elapsed < 0) return { kind: 'tooFast', startedAt: now }; // stamp from the future: replace it
  if (elapsed < MIN_FILL_MS) return { kind: 'tooFast' }; // the original stamp ages on its own
  return { kind: 'ok' };
}
