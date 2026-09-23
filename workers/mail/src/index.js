/**
 * Nowbi sends its own account emails (the FPL iQ way, on Supabase).
 *
 * Supabase Auth's "Send Email" hook POSTs here instead of mailing anything itself:
 *   { user: { email, user_metadata: { lang } … }, email_data: { token_hash, email_action_type, … } }
 * We verify the Standard Webhooks signature, put the token in OUR link
 * (CONFIRM_URL?token_hash=…&type=…, the page in docs/confirm), render the
 * Nowbi template and send through the Nowbi Gmail account over SMTP.
 * Nothing about Supabase reaches the inbox.
 *
 * Secrets: SEND_EMAIL_HOOK_SECRET, GMAIL_USER, GMAIL_APP_PASSWORD (wrangler.toml says how).
 */
import { verify } from './webhook.js';
import { render, LANGS, KINDS } from './template.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

/** The link the email carries: our page, with the same parameters Supabase's verify endpoint takes. */
export function ourLink(env, emailData) {
  const url = new URL(env.CONFIRM_URL || 'https://iheblaswd.github.io/nowbi/confirm/');
  url.searchParams.set('token_hash', emailData.token_hash);
  url.searchParams.set('type', emailData.email_action_type);
  if (emailData.redirect_to) url.searchParams.set('next', emailData.redirect_to);
  return url.toString();
}

/** signup / recovery / magiclink / email_change / invite / reauthentication → a template kind */
export function kindOf(actionType) {
  if (actionType === 'invite') return 'signup';
  return KINDS.includes(actionType) ? actionType : 'signup';
}

export function langOf(user) {
  const l = user && user.user_metadata && user.user_metadata.lang;
  return LANGS.includes(l) ? l : 'en';
}

async function sendMail(env, to, { subject, html, text }) {
  const { WorkerMailer } = await import('worker-mailer');
  const mailer = await WorkerMailer.connect({
    host: 'smtp.gmail.com', port: 465, secure: true, authType: 'plain',
    credentials: { username: env.GMAIL_USER, password: env.GMAIL_APP_PASSWORD },
  });
  try {
    await mailer.send({ from: { name: env.FROM_NAME || 'Nowbi', email: env.GMAIL_USER }, to: { email: to }, subject, text, html });
  } finally { try { await mailer.close(); } catch { /* done */ } }
}

export async function handleSend(req, env) {
  for (const k of ['SEND_EMAIL_HOOK_SECRET', 'GMAIL_USER', 'GMAIL_APP_PASSWORD']) {
    if (!env[k]) return reply(503, { error: 'mail not configured: ' + k });
  }
  const raw = await req.text();
  const headers = {
    'webhook-id': req.headers.get('webhook-id'),
    'webhook-timestamp': req.headers.get('webhook-timestamp'),
    'webhook-signature': req.headers.get('webhook-signature'),
  };
  if (!(await verify(env.SEND_EMAIL_HOOK_SECRET, headers, raw))) return reply(401, { error: 'bad signature' });

  let body;
  try { body = JSON.parse(raw); } catch { return reply(400, { error: 'bad json' }); }
  const user = body.user || {};
  const data = body.email_data || {};
  if (!user.email || !data.token_hash || !data.email_action_type) return reply(400, { error: 'missing user.email or email_data' });

  // Secure email change sends two emails: the new address gets token_hash_new.
  const targets = [{ to: user.email, tokenHash: data.token_hash }];
  if (data.email_action_type === 'email_change' && data.token_hash_new && user.new_email) {
    targets.push({ to: user.new_email, tokenHash: data.token_hash_new });
  }
  const lang = langOf(user);
  const kind = kindOf(data.email_action_type);
  for (const t of targets) {
    const link = ourLink(env, { ...data, token_hash: t.tokenHash });
    await sendMail(env, t.to, render(kind, { email: t.to, link, lang }));
  }
  return reply(200, {});
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'POST' && url.pathname === '/auth/send') {
      try { return await handleSend(req, env); }
      catch (e) { return reply(500, { error: (e && e.message) || 'send failed' }); }
    }
    if (req.method === 'GET' && url.pathname === '/') return new Response('nowbi-mail ok', { status: 200 });
    return reply(404, { error: 'not found' });
  },
};
