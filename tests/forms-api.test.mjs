// End-to-end checks of /api/enquiries and /api/careers against a LOCAL server.
// Never point this at production: it submits test data.
//
//   FORMS_BASE_URL=http://localhost:3000 npm run test:forms              (MAIL_PROVIDER=log, expects delivery)
//   FORMS_BASE_URL=http://localhost:3001 FORMS_EXPECT=fail npm run test:forms
//      (server started with MAIL_PROVIDER=smtp, SMTP_HOST=127.0.0.1, SMTP_PORT=9, FORM_FROM_EMAIL=test@localhost:
//       the SMTP connection is refused locally, nothing leaves the machine)
//
// Each request uses its own X-Forwarded-For so the per-IP rate limit does not interfere.
import { test } from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.FORMS_BASE_URL;
const expectFail = process.env.FORMS_EXPECT === 'fail';
const skip = base ? false : 'set FORMS_BASE_URL to a local dev/prod server';
let ip = Math.floor(Math.random() * 200);

function enquiry(overrides = {}) {
  const fd = new FormData();
  const v = {
    locale: 'pl',
    startedAt: String(Date.now() - 60_000),
    website: '',
    person: 'Test Osoba',
    company: 'Test Sp. z o.o.',
    email: 'test@example.com',
    phone: '',
    country: 'Polska',
    topic: 'products',
    products: 'elementy',
    productForm: 'chilled',
    message: 'Automatyczny test lokalny.',
    consent: 'on',
    ...overrides,
  };
  for (const [k, val] of Object.entries(v)) if (val !== undefined) fd.append(k, val);
  return fd;
}

function careers(overrides = {}) {
  const fd = new FormData();
  const v = {
    locale: 'pl',
    startedAt: String(Date.now() - 60_000),
    website: '',
    name: 'Test Kandydat',
    phone: '+48 600 000 000',
    email: '',
    position: 'inne',
    message: '',
    consent: 'on',
    ...overrides,
  };
  for (const [k, val] of Object.entries(v)) if (val !== undefined) fd.append(k, val);
  return fd;
}

async function post(path, body, { origin = base } = {}) {
  ip += 1;
  const res = await fetch(new URL(path, base), {
    method: 'POST',
    body,
    headers: { Accept: 'application/json', Origin: origin, 'X-Forwarded-For': `198.51.100.${ip % 250}` },
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

for (const [path, make] of [
  ['/api/enquiries', enquiry],
  ['/api/careers', careers],
]) {
  test(`${path}: normal submission`, { skip }, async () => {
    const r = await post(path, make());
    if (expectFail) {
      assert.equal(r.status, 500);
      assert.equal(r.data.ok, false);
      assert.equal(r.data.outcome, 'error');
    } else {
      assert.equal(r.status, 200);
      assert.deepEqual([r.data.ok, r.data.outcome], [true, 'ok']);
    }
  });

  test(`${path}: 25 h old session is not a fake success`, { skip }, async () => {
    const r = await post(path, make({ startedAt: String(Date.now() - 25 * 3600_000) }));
    assert.equal(r.status, 409);
    assert.deepEqual([r.data.ok, r.data.outcome], [false, 'expired']);
    assert.equal(typeof r.data.startedAt, 'number');
    // Resend with the fresh stamp (as the client does) goes through to delivery.
    const again = await post(path, make({ startedAt: String(r.data.startedAt) }));
    assert.equal(again.data.outcome, expectFail ? 'error' : 'ok');
  });

  test(`${path}: very fast / autofill submission is recoverable`, { skip }, async () => {
    const r = await post(path, make({ startedAt: String(Date.now() - 500) }));
    assert.equal(r.status, 409);
    assert.deepEqual([r.data.ok, r.data.outcome], [false, 'tooFast']);
  });

  test(`${path}: honeypot gets the silent bot answer`, { skip }, async () => {
    const r = await post(path, make({ website: 'https://spam.example' }));
    assert.equal(r.status, 200);
    assert.equal(r.data.outcome, 'ok');
  });

  test(`${path}: validation failure returns field errors`, { skip }, async () => {
    const r = await post(path, make({ consent: undefined, phone: 'abc' }));
    assert.equal(r.status, 400);
    assert.equal(r.data.outcome, 'invalid');
    assert.equal(r.data.errors.consent, 'consent');
    assert.equal(r.data.errors.phone, 'phone');
  });

  test(`${path}: foreign origin is forbidden`, { skip }, async () => {
    const r = await post(path, make(), { origin: 'https://evil.example' });
    assert.equal(r.status, 403);
    assert.deepEqual([r.data.ok, r.data.outcome], [false, 'forbidden']);
  });
}
