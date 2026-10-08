// Unit tests for the honeypot / fill-time classification (no server needed).
// Run: npm test   (Node 24 strips the TypeScript types of the imported module)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFormSession, MAX_FILL_MS, MIN_FILL_MS } from '../src/lib/forms/session.ts';

const now = 1_800_000_000_000;
const check = (startedAt, honeypot = '') => checkFormSession({ honeypot, startedAt, now });

test('normal submission passes', () => {
  assert.deepEqual(check(String(now - 60_000)), { kind: 'ok' });
});

test('filled honeypot is the only bot condition', () => {
  assert.deepEqual(check(String(now - 60_000), 'https://spam.example'), { kind: 'bot' });
  // A bot that also sends a stale stamp is still answered as a bot.
  assert.deepEqual(check(String(now - 25 * 3600_000), 'x'), { kind: 'bot' });
});

test('25 hour old session is expired and recoverable, never a fake success', () => {
  const r = check(String(now - 25 * 3600_000));
  assert.equal(r.kind, 'expired');
  // Fresh stamp is pre-aged so an immediate resend of the kept data is accepted.
  assert.equal(r.startedAt, now - MIN_FILL_MS);
  assert.deepEqual(checkFormSession({ honeypot: '', startedAt: String(r.startedAt), now }), { kind: 'ok' });
});

test('exactly 24 h is still accepted', () => {
  assert.deepEqual(check(String(now - MAX_FILL_MS)), { kind: 'ok' });
});

test('missing or malformed stamp is treated as expired', () => {
  for (const v of [null, '', 'abc', '0', '-5']) assert.equal(check(v).kind, 'expired', String(v));
});

test('very fast (autofill) submission is recoverable, keeps the original stamp', () => {
  const r = check(String(now - 800));
  assert.deepEqual(r, { kind: 'tooFast' });
  // The same stamp sent again a few seconds later passes.
  assert.deepEqual(checkFormSession({ honeypot: '', startedAt: String(now - 800), now: now + MIN_FILL_MS }), { kind: 'ok' });
});

test('stamp from the future (clock skew) is replaced', () => {
  assert.deepEqual(check(String(now + 120_000)), { kind: 'tooFast', startedAt: now });
});
