import nodemailer from 'nodemailer';
import { env } from '../config/env';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const link = `${env.frontendUrls[0]}/verify-email?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.emailUser, pass: env.emailPass },
  });
  await transporter.sendMail({
    from: `"FocusFlow" <${env.emailUser}>`,
    to,
    subject: 'Confirme seu e-mail - FocusFlow',
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2>🎓 FocusFlow</h2>
      <p>Olá, ${escapeHtml(name)}! Clique no botão abaixo para confirmar seu e-mail.</p>
      <p><a href="${link}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Verificar e-mail</a></p>
      <p style="color:#6b7280;font-size:12px">O link expira em 24 horas. Se não foi você, ignore esta mensagem.</p>
    </div>`,
  });
}
