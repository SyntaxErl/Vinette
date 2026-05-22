// Email transport for team invites.
// Uses Resend when RESEND_API_KEY is set; otherwise falls back to a nodemailer
// Ethereal test account and logs a preview URL (no real delivery) so the invite
// flow is testable without configuring a provider.

const FROM = process.env.EMAIL_FROM || "TaskFlow <onboarding@resend.dev>";

function buildAcceptUrl({ to, token }) {
  const base = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
  return `${base}/invite/accept?token=${token}&email=${encodeURIComponent(to)}`;
}

// Shareable team invite link (not tied to a specific email).
function buildInviteUrl(token) {
  const base = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
  return `${base}/invite/accept?token=${token}`;
}

function inviteHtml({ inviterName, acceptUrl }) {
  const who = inviterName || "Someone";
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1f2937">
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827">You've been invited to a team 🎉</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6">
      <strong>${who}</strong> has invited you to collaborate on <strong>TaskFlow</strong>.
      Click below to accept the invitation and join the team.
    </p>
    <a href="${acceptUrl}"
       style="display:inline-block;background:#5b4fcf;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:12px">
      Accept invitation
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.6">
      Or paste this link into your browser:<br />
      <a href="${acceptUrl}" style="color:#5b4fcf;word-break:break-all">${acceptUrl}</a>
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af">This invitation expires in 7 days.</p>
  </div>`;
}

async function sendViaResend({ to, subject, html }) {
  const { Resend } = require("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message || "Resend send failed");
  return { id: data?.id, previewUrl: null };
}

let etherealTransport = null;
async function sendViaEthereal({ to, subject, html }) {
  const nodemailer = require("nodemailer");
  if (!etherealTransport) {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
  const info = await etherealTransport.sendMail({ from: FROM, to, subject, html });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log("[email] Ethereal preview URL:", previewUrl);
  return { id: info.messageId, previewUrl };
}

async function sendInviteEmail({ to, token, inviterName }) {
  const acceptUrl = buildAcceptUrl({ to, token });
  const subject = `${inviterName || "Someone"} invited you to their team on TaskFlow`;
  const html = inviteHtml({ inviterName, acceptUrl });

  if (process.env.RESEND_API_KEY) {
    return sendViaResend({ to, subject, html });
  }
  return sendViaEthereal({ to, subject, html });
}

module.exports = { sendInviteEmail, buildAcceptUrl, buildInviteUrl };
