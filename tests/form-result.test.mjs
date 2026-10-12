// Unit tests for the signed form result (GAP-14, SECURITY-001) and the language switch context
// (UXA-02). Run: npm test   (Node 24 strips the TypeScript types of the imported modules)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isUsableResultSecret, MIN_SECRET_LENGTH, RESULT_MAX_AGE_S, signFormResult, verifyFormResult } from '../src/lib/forms/result.ts';
import { languageSwitchSuffix } from '../src/i18n/language-switch.ts';

const secret = 'unit-test-secret-not-used-anywhere-0123456789';
const now = 1_800_000_000;
const signed = (form, status, at = now) => ({ form, status, ...signFormResult(secret, form, status, at) });
const src = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
/** A signature computed outside the module, as an attacker who knows a key would compute it. */
const forge = (key, form, status, t) => {
  const k = createHmac('sha256', key).update('mckeen-beef:form-result:v1').digest();
  return { form, status, t: String(t), sig: createHmac('sha256', k).update(`${form}|${status}|${t}`).digest('base64url').slice(0, 22) };
};

test('without a usable secret nothing is signed or confirmed (fail closed)', () => {
  for (const weak of [undefined, null, '', '   ', 'short', 'x'.repeat(MIN_SECRET_LENGTH - 1), ` ${'x'.repeat(MIN_SECRET_LENGTH - 1)} `]) {
    assert.equal(isUsableResultSecret(weak), false, `unusable: ${JSON.stringify(weak)}`);
    assert.equal(signFormResult(weak, 'enquiry', 'ok', now), null, `no signature with ${JSON.stringify(weak)}`);
    if (typeof weak === 'string') assert.equal(verifyFormResult(weak, forge(weak, 'enquiry', 'ok', now), now), false, `a signature made with ${JSON.stringify(weak)} is never accepted`);
    assert.equal(verifyFormResult(weak, signed('enquiry', 'ok'), now), false, 'nothing verifies without a usable secret');
  }
  assert.equal(isUsableResultSecret('x'.repeat(MIN_SECRET_LENGTH)), true, 'the minimum length is usable');
});

test('the public development salt never signs or confirms a result (SECURITY-001 regression)', () => {
  // The fallback the rate limiter uses when RATE_LIMIT_SALT is missing is in the public source.
  const fallback = src('src/lib/env.ts').match(/RATE_LIMIT_SALT\)\s*\?\?\s*'([^']*)'/)?.[1];
  assert.ok(fallback !== undefined, 'the rate-limit fallback is where this test expects it');
  assert.equal(isUsableResultSecret(fallback), false, 'the public fallback is not a usable secret');
  assert.equal(signFormResult(fallback, 'enquiry', 'ok', now), null);
  const forged = forge(fallback, 'enquiry', 'ok', now);
  assert.equal(verifyFormResult(fallback, forged, now), false, 'forged with the fallback, checked with the fallback');
  assert.equal(verifyFormResult(secret, forged, now), false, 'forged with the fallback, checked with a real secret');
  // The result secret is RATE_LIMIT_SALT as configured, with no fallback, and both ends use it.
  const resultSecretLine = src('src/lib/env.ts').match(/resultSecret:[^\r\n]*/)?.[0] ?? '';
  assert.match(resultSecretLine, /^resultSecret: str\(process\.env\.RATE_LIMIT_SALT\),$/, 'resultSecret has no fallback');
  for (const file of ['src/lib/forms/pipeline.ts', 'src/lib/forms/context.ts']) {
    const code = src(file);
    assert.match(code, /(sign|verify)FormResult\(env\.forms\.resultSecret,/, `${file} keys results with env.forms.resultSecret`);
    assert.doesNotMatch(code, /FormResult\(env\.rateLimit\.salt/, `${file} must not key results with the rate-limit salt`);
  }
});

test('a fresh signed result verifies, for success and for errors', () => {
  assert.equal(verifyFormResult(secret, signed('enquiry', 'ok'), now + 5), true);
  assert.equal(verifyFormResult(secret, signed('careers', 'unavailable'), now + 5), true);
});

test('a bare or altered result does not verify', () => {
  assert.equal(verifyFormResult(secret, { form: 'enquiry', status: 'ok' }, now), false, 'no signature');
  assert.equal(verifyFormResult(secret, {}, now), false, 'no parameters');
  const s = signed('enquiry', 'error');
  assert.equal(verifyFormResult(secret, { ...s, status: 'ok' }, now), false, 'error turned into ok');
  assert.equal(verifyFormResult(secret, { ...s, form: 'careers' }, now), false, 'other form');
  assert.equal(verifyFormResult(secret, { ...s, t: String(now + 1) }, now), false, 'other time');
  assert.equal(verifyFormResult('other-secret', s, now), false, 'other secret');
  assert.equal(verifyFormResult(secret, { ...s, sig: s.sig.slice(0, -1) + (s.sig.endsWith('A') ? 'B' : 'A') }, now), false, 'altered signature');
  assert.equal(verifyFormResult(secret, { ...s, sig: [s.sig] }, now), false, 'repeated parameter');
});

test('an old or future result does not verify', () => {
  const s = signed('enquiry', 'ok');
  assert.equal(verifyFormResult(secret, s, now + RESULT_MAX_AGE_S), true, 'at the limit');
  assert.equal(verifyFormResult(secret, s, now + RESULT_MAX_AGE_S + 1), false, 'too old');
  assert.equal(verifyFormResult(secret, s, now - 120), false, 'from the future');
});

test('the language switch keeps only the listed, well-formed parameters of the page', () => {
  const s = signFormResult(secret, 'enquiry', 'ok', now);
  const sent = `form=enquiry&status=ok&t=${s.t}&sig=${s.sig}&utm_source=x`;
  assert.equal(languageSwitchSuffix('sent', sent, ''), `?form=enquiry&status=ok&t=${s.t}&sig=${s.sig}`);
  assert.equal(languageSwitchSuffix('contact', 'temat=quality&x=1', '#pomoc'), '?temat=quality#pomoc');
  assert.equal(languageSwitchSuffix('contact', 'temat=quality', ''), '?temat=quality#pomoc', 'topic opens at the router');
  assert.equal(languageSwitchSuffix('contact', '', '#dzialy'), '#dzialy');
  assert.equal(languageSwitchSuffix('enquiry', 'produkt=elementy', ''), '?produkt=elementy');
  assert.equal(languageSwitchSuffix('products', 'temat=quality&produkt=elementy', '#elementy'), '#elementy', 'other pages carry no parameters');
  assert.equal(languageSwitchSuffix('home', 'form=enquiry&status=ok', ''), '', 'result parameters only on the result page');
});

test('the language switch drops malformed values and anchors', () => {
  assert.equal(languageSwitchSuffix('contact', 'temat=%3Cscript%3E', ''), '');
  assert.equal(languageSwitchSuffix('contact', 'temat=https://evil.example', ''), '');
  assert.equal(languageSwitchSuffix('sent', 'form=other&status=ok', ''), '?status=ok');
  assert.equal(languageSwitchSuffix('products', '', '#"><img>'), '');
  assert.equal(languageSwitchSuffix('products', '', '#'), '');
});
