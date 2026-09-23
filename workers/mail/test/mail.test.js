import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sign, verify } from '../src/webhook.js';
import { render } from '../src/template.js';
import { ourLink, kindOf, langOf } from '../src/index.js';

const SECRET = 'v1,whsec_' + Buffer.from('a-very-secret-key-of-32-bytes!!!').toString('base64');

test('accepts a correctly signed request and rejects a tampered one', async () => {
  const body = JSON.stringify({ user: { email: 'a@b.c' } });
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = await sign(SECRET, 'msg_1', ts, body);
  const headers = { 'webhook-id': 'msg_1', 'webhook-timestamp': ts, 'webhook-signature': 'v1,' + sig };
  assert.equal(await verify(SECRET, headers, body), true);
  assert.equal(await verify(SECRET, headers, body + ' '), false);
  assert.equal(await verify(SECRET, { ...headers, 'webhook-signature': 'v1,AAAA' }, body), false);
});

test('rejects a stale timestamp', async () => {
  const body = '{}';
  const ts = String(Math.floor(Date.now() / 1000) - 3600);
  const sig = await sign(SECRET, 'id', ts, body);
  assert.equal(await verify(SECRET, { 'webhook-id': 'id', 'webhook-timestamp': ts, 'webhook-signature': 'v1,' + sig }, body), false);
});

test('the link points at our page, not supabase', () => {
  const link = ourLink({ CONFIRM_URL: 'https://iheblaswd.github.io/nowbi/confirm/' }, { token_hash: 'pkce_abc', email_action_type: 'signup', redirect_to: 'nowbi://auth/callback' });
  const u = new URL(link);
  assert.equal(u.host, 'iheblaswd.github.io');
  assert.equal(u.searchParams.get('token_hash'), 'pkce_abc');
  assert.equal(u.searchParams.get('type'), 'signup');
  assert.equal(u.searchParams.get('next'), 'nowbi://auth/callback');
  assert.ok(!link.includes('supabase'));
});

test('template renders the three languages and escapes html', () => {
  for (const lang of ['en', 'fr', 'ar']) {
    const m = render('signup', { email: 'x<y@nowbi.app', link: 'https://example.test/?a=1&b=2', lang });
    assert.ok(m.subject.includes('Nowbi'));
    assert.ok(m.html.includes('x&lt;y@nowbi.app'));
    assert.ok(m.html.includes('https://example.test/?a=1&amp;b=2'));
    assert.ok(m.text.includes('https://example.test/?a=1&b=2'));
  }
  assert.ok(render('signup', { email: 'a@b.c', link: 'l', lang: 'ar' }).html.includes('dir="rtl"'));
  assert.equal(render('recovery', { email: 'a@b.c', link: 'l', lang: 'fr' }).subject, 'Réinitialise ton mot de passe Nowbi');
});

test('kinds and languages fall back sensibly', () => {
  assert.equal(kindOf('invite'), 'signup');
  assert.equal(kindOf('recovery'), 'recovery');
  assert.equal(kindOf('weird'), 'signup');
  assert.equal(langOf({ user_metadata: { lang: 'fr' } }), 'fr');
  assert.equal(langOf({ user_metadata: { lang: 'de' } }), 'en');
  assert.equal(langOf({}), 'en');
});
