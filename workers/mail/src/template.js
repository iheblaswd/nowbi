/**
 * Nowbi's account emails, in the app's own design (black ground, tilted sticker pills).
 * Table layout and inline styles only: Gmail, Outlook and the iOS Mail app all render it.
 */
const STR = {
  en: {
    signup: {
      subject: 'Confirm your Nowbi account',
      tag: 'One tap left',
      title: 'Confirm your email and Nowbi opens on your phone.',
      body: (email) => `You just created a Nowbi account with <strong style="color:#FFFFFF;">${email}</strong>. Tap the button, then go back to the app: it logs you in by itself.`,
      button: 'Confirm my email',
      footer: "If you didn't create this account, ignore this email and nothing happens.",
    },
    recovery: {
      subject: 'Reset your Nowbi password',
      tag: 'Password reset',
      title: 'Choose a new password.',
      body: (email) => `Someone asked to reset the password of <strong style="color:#FFFFFF;">${email}</strong>. If that was you, tap the button and pick a new one.`,
      button: 'Choose a new password',
      footer: "If you didn't ask for this, ignore this email: your password stays the same.",
    },
    magiclink: {
      subject: 'Your Nowbi sign-in link',
      tag: 'Sign in',
      title: 'Tap to sign in to Nowbi.',
      body: (email) => `A sign-in link was requested for <strong style="color:#FFFFFF;">${email}</strong>.`,
      button: 'Sign me in',
      footer: "If you didn't ask for this, ignore this email.",
    },
    email_change: {
      subject: 'Confirm your new Nowbi email',
      tag: 'New address',
      title: 'Confirm this is your new email.',
      body: (email) => `You asked to use <strong style="color:#FFFFFF;">${email}</strong> for your Nowbi account. Tap the button to confirm it.`,
      button: 'Confirm this email',
      footer: "If you didn't ask for this, ignore this email.",
    },
    fallback: 'Button not working? Copy this link into your browser:',
    tagline: 'No red, no overdue, nothing dies. Nowbi &middot; one thing at a time.',
  },
  fr: {
    signup: {
      subject: 'Confirme ton compte Nowbi',
      tag: 'Plus qu’un tap',
      title: 'Confirme ton email et Nowbi s’ouvre sur ton téléphone.',
      body: (email) => `Tu viens de créer un compte Nowbi avec <strong style="color:#FFFFFF;">${email}</strong>. Appuie sur le bouton, puis retourne dans l’app : elle te connecte toute seule.`,
      button: 'Confirmer mon email',
      footer: 'Si tu n’as pas créé ce compte, ignore cet email et il ne se passera rien.',
    },
    recovery: {
      subject: 'Réinitialise ton mot de passe Nowbi',
      tag: 'Mot de passe',
      title: 'Choisis un nouveau mot de passe.',
      body: (email) => `Quelqu’un a demandé à réinitialiser le mot de passe de <strong style="color:#FFFFFF;">${email}</strong>. Si c’est toi, appuie sur le bouton.`,
      button: 'Nouveau mot de passe',
      footer: 'Si ce n’est pas toi, ignore cet email : ton mot de passe ne change pas.',
    },
    magiclink: {
      subject: 'Ton lien de connexion Nowbi',
      tag: 'Connexion',
      title: 'Appuie pour te connecter à Nowbi.',
      body: (email) => `Un lien de connexion a été demandé pour <strong style="color:#FFFFFF;">${email}</strong>.`,
      button: 'Me connecter',
      footer: 'Si ce n’est pas toi, ignore cet email.',
    },
    email_change: {
      subject: 'Confirme ta nouvelle adresse Nowbi',
      tag: 'Nouvelle adresse',
      title: 'Confirme que c’est bien ta nouvelle adresse.',
      body: (email) => `Tu as demandé à utiliser <strong style="color:#FFFFFF;">${email}</strong> pour ton compte Nowbi. Appuie sur le bouton pour confirmer.`,
      button: 'Confirmer cette adresse',
      footer: 'Si ce n’est pas toi, ignore cet email.',
    },
    fallback: 'Le bouton ne marche pas ? Copie ce lien dans ton navigateur :',
    tagline: 'Pas de rouge, pas de retard, rien ne meurt. Nowbi &middot; une chose à la fois.',
  },
  ar: {
    signup: {
      subject: 'أكّد حسابك في Nowbi',
      tag: 'بقيت نقرة واحدة',
      title: 'أكّد بريدك ويفتح Nowbi على هاتفك.',
      body: (email) => `أنشأت للتو حساب Nowbi بالبريد <strong style="color:#FFFFFF;">${email}</strong>. اضغط الزر ثم عد إلى التطبيق: سيسجّل دخولك بنفسه.`,
      button: 'تأكيد بريدي',
      footer: 'إن لم تكن أنت من أنشأ هذا الحساب، تجاهل هذه الرسالة ولن يحدث شيء.',
    },
    recovery: {
      subject: 'إعادة تعيين كلمة مرور Nowbi',
      tag: 'كلمة المرور',
      title: 'اختر كلمة مرور جديدة.',
      body: (email) => `طلب أحدهم إعادة تعيين كلمة مرور <strong style="color:#FFFFFF;">${email}</strong>. إن كنت أنت، اضغط الزر.`,
      button: 'كلمة مرور جديدة',
      footer: 'إن لم تطلب ذلك، تجاهل هذه الرسالة: كلمة مرورك لا تتغير.',
    },
    magiclink: {
      subject: 'رابط الدخول إلى Nowbi',
      tag: 'تسجيل الدخول',
      title: 'اضغط لتسجيل الدخول إلى Nowbi.',
      body: (email) => `طُلب رابط دخول للبريد <strong style="color:#FFFFFF;">${email}</strong>.`,
      button: 'سجّل دخولي',
      footer: 'إن لم تطلب ذلك، تجاهل هذه الرسالة.',
    },
    email_change: {
      subject: 'أكّد بريدك الجديد في Nowbi',
      tag: 'عنوان جديد',
      title: 'أكّد أن هذا بريدك الجديد.',
      body: (email) => `طلبت استخدام <strong style="color:#FFFFFF;">${email}</strong> لحساب Nowbi. اضغط الزر للتأكيد.`,
      button: 'تأكيد هذا البريد',
      footer: 'إن لم تطلب ذلك، تجاهل هذه الرسالة.',
    },
    fallback: 'الزر لا يعمل؟ انسخ هذا الرابط في متصفحك:',
    tagline: 'لا أحمر، لا تأخير، لا شيء يموت. Nowbi &middot; شيء واحد في كل مرة.',
  },
};

export const LANGS = Object.keys(STR);
export const KINDS = ['signup', 'recovery', 'magiclink', 'email_change'];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/**
 * @param {'signup'|'recovery'|'magiclink'|'email_change'} kind
 * @param {{ email: string, link: string, lang?: string }} v
 * @returns {{ subject: string, html: string, text: string }}
 */
export function render(kind, { email, link, lang = 'en' }) {
  const L = STR[LANGS.includes(lang) ? lang : 'en'];
  const s = L[KINDS.includes(kind) ? kind : 'signup'];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const e = esc(email);
  const href = esc(link);
  const html = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="${dir}" style="background-color:#0B0B0F;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;">
      <tr><td style="padding:0 0 20px 0;">
        <span style="display:inline-block;background-color:#FFD23F;color:#0B0B0F;font-weight:900;font-size:28px;letter-spacing:1px;padding:6px 14px;border-radius:999px;">NOW</span>
        <span style="display:inline-block;background-color:#FF5DA2;color:#0B0B0F;font-weight:900;font-size:28px;letter-spacing:1px;padding:6px 14px;border-radius:999px;margin-left:4px;">BI</span>
      </td></tr>
      <tr><td style="border:3px solid #FFFFFF;border-radius:22px;padding:28px 24px;background-color:#0B0B0F;">
        <p style="margin:0 0 8px 0;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#B3B3C0;">${s.tag}</p>
        <h1 style="margin:0 0 14px 0;font-size:26px;line-height:1.15;font-weight:900;color:#FFFFFF;">${s.title}</h1>
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.5;color:#B3B3C0;">${s.body(e)}</p>
        <table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="background-color:#FFD23F;border-radius:999px;">
          <a href="${href}" style="display:inline-block;padding:16px 28px;font-size:15px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#0B0B0F;text-decoration:none;">${s.button}</a>
        </td></tr></table>
        <p style="margin:24px 0 0 0;font-size:13px;line-height:1.5;color:#7C7C8A;">${L.fallback}<br>
          <a href="${href}" style="color:#3DA5FF;word-break:break-all;">${href}</a></p>
      </td></tr>
      <tr><td style="padding:20px 8px 0 8px;font-size:12px;line-height:1.5;color:#7C7C8A;">${s.footer}<br>${L.tagline}</td></tr>
    </table>
  </td></tr>
</table>`;
  const text = `${s.title}\n\n${s.body(email).replace(/<[^>]+>/g, '')}\n\n${s.button}: ${link}\n\n${s.footer}`;
  return { subject: s.subject, html, text };
}
