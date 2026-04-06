import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport = require('nodemailer/lib/smtp-transport');

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.MAIL_HOST!;
    const port = parseInt(process.env.MAIL_PORT ?? '587', 10);
    const user = process.env.MAIL_USER!;
    const pass = process.env.MAIL_PASS!;
    const smtpOptions: SMTPTransport.Options = { host, port, secure: port === 465, auth: { user, pass } };
    this.transporter = nodemailer.createTransport(smtpOptions);
    this.transporter.verify((error) => { if (error) { throw new Error(error.message || 'Error verifying SMTP connection'); } });
  }
  private fromAddress(): string { return process.env.MAIL_FROM ?? process.env.MAIL_USER ?? 'no-reply@example.com'; }
  /**
   * Build an image-free, modern HTML email with a robust plain-text fallback.
   *
   * options.otp: optional one-time code (displayed prominently).
   *
   * Environment options:
   *  - EMAIL_PRIMARY_COLOR (hex), default: #2563EB (blue)
   *  - EMAIL_BG (hex), default: #F5F7FA
   *  - SUPPORT_EMAIL (string) for footer contact
   */
  private buildHtmlTemplate(options: { preheader?: string; title: string; introLines: string[]; cta?: { text: string; url: string }; outroLines?: string[]; company: string; otp?: string; }) {
    const preheader = (options.preheader ?? '').replace(/[\r\n]+/g, ' ').slice(0, 140);
    const primary = process.env.EMAIL_PRIMARY_COLOR ?? '#2563EB';
    const bg = process.env.EMAIL_BG ?? '#F5F7FA';
    const inputtext = '#0F172A';
    const muted = '#6B7280';
    const white = '#ffffff';
    const supportEmail = process.env.SUPPORT_EMAIL ?? '';
    const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!doctype html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>${esc(options.title)}</title>
        <style>
          body { margin:0; padding:0; background:${bg}; -webkit-font-smoothing:antialiased; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color:${inputtext}; }
          a { color: inherit; text-decoration: none; }
          .preheader { display:none !important; visibility:hidden; opacity:0; height:0; width:0; max-height:0; overflow:hidden; }
          @media only screen and (max-width:600px) {
            .container { width:100% !important; padding:12px !important; }
            .content { padding:18px !important; }
            .btn-td { padding:12px 10px !important; }
          }
        </style>
      </head>
      <body>
        <span class="preheader">${esc(preheader)}</span>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${bg}; padding:28px 12px;">
          <tr>
            <td align="center">
              <!-- Card -->
              <table width="620" cellpadding="0" cellspacing="0" role="presentation" class="container" style="max-width:620px; width:100%; background:${white}; border-radius:12px; border:1px solid rgba(15,23,42,0.06); overflow:hidden;">
                
                <!-- Header bar -->
                <tr>
                  <td style="background:${primary}; padding:18px 22px; color:#ffffff; font-weight:700; font-size:16px; letter-spacing:0.2px;">
                    ${esc(options.company)}
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:28px 24px;" class="content">
                    <h1 style="margin:0 0 12px 0; font-size:20px; line-height:1.25; color:${inputtext};">${esc(options.title)}</h1>

                    ${options.introLines.map(line => `<p style="margin:0 0 12px 0; color:${muted}; font-size:15px; line-height:1.45;">${esc(line)}</p>`).join('')}

                    ${options.otp ? `
                      <div style="margin:18px 0 6px 0;">
                        <div style="display:inline-block; padding:14px 18px; border-radius:10px; background:#F3F4F6; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace; font-size:20px; letter-spacing:2px; color:${inputtext}; font-weight:700;">
                          ${esc(options.otp)}
                        </div>
                      </div>
                    ` : ''}

                    ${options.cta ? `
                      <!-- Bulletproof button (table-based) -->
                      <div style="margin:18px 0;">
                        <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate !important;">
                          <tr>
                            <td align="center" class="btn-td" style="background:${primary}; border-radius:999px; padding:12px 18px;">
                              <a href="${esc(options.cta.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block; color:#ffffff; font-weight:700; font-size:15px; text-decoration:none;">
                                ${esc(options.cta.text)}
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>
                    ` : ''}

                    ${options.cta ? `<p style="margin:10px 0 0 0; color:${muted}; font-size:13px;">Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur:<br /><span style="display:inline-block; background:#F8FAFC; padding:8px 10px; border-radius:6px; font-family:ui-monospace,monospace; font-size:13px; color:${inputtext};">${esc(options.cta.url)}</span></p>` : ''}

                    <div style="height:1px; background:linear-gradient(90deg, rgba(15,23,42,0.04), rgba(15,23,42,0.02)); margin:22px 0; border-radius:1px;"></div>

                    ${options.outroLines?.map(line => `<p style="margin:0 0 8px 0; color:${muted}; font-size:13px;">${esc(line)}</p>`).join('') ?? ''}

                    <p style="margin:12px 0 0 0; color:${muted}; font-size:13px;">Merci,<br/><strong style="color:${inputtext}">${esc(options.company)}</strong></p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:14px 20px; background:transparent; text-align:center; font-size:13px; color:${muted};">
                    ${supportEmail ? `<div style="margin-top:6px;">Support: <a href="mailto:${esc(supportEmail)}" style="color:${primary}; text-decoration:underline;">${esc(supportEmail)}</a></div>` : ''}
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    const txtLines: string[] = [];
    txtLines.push(options.title);
    txtLines.push(...options.introLines);
    if (options.otp) { txtLines.push(`Code: ${options.otp}`); }
    if (options.cta) { txtLines.push(`${options.cta.text}: ${options.cta.url}`); }
    if (options.outroLines) txtLines.push(...options.outroLines);
    txtLines.push('');
    txtLines.push(`Merci,\n${options.company}`);
    if (supportEmail) txtLines.push(`Support: ${supportEmail}`);
    const text = txtLines.filter(Boolean).join('\n\n');
    return { html, text };
  }
  private buildFrontendUrl(path: string) {
    const base = (process.env.FRONTEND_URL ?? '').replace(/\/$/, '');
    return base ? `${base}${path}` : path;
  }
  async sendEmailVerification(email: string, token: string, company: string) {
    const url = this.buildFrontendUrl(`/verify-email?token=${encodeURIComponent(token)}`);
    const built = this.buildHtmlTemplate({
      preheader: 'Vérifiez votre adresse e-mail pour activer votre compte',
      title: `Bienvenue sur ${company} — vérifiez votre email`,
      introLines: [`Merci de vous être inscrit(e) sur ${company}. Pour activer votre compte, veuillez confirmer votre adresse e-mail.`,],
      cta: { text: 'Confirmer mon e-mail', url },
      outroLines: ['Le lien expirera pour des raisons de sécurité. Si vous n’avez pas demandé cela, ignorez ce message.'],
      company
    });
    const mailOptions: SMTPTransport.Options = { from: this.fromAddress(), to: email, subject: `Vérification d'email — ${company}`, html: built.html, text: built.text };
    await this.transporter.sendMail(mailOptions);
  }

  async sendEmailVerifier(email: string, company: string) {
    const built = this.buildHtmlTemplate({
      preheader: 'Votre adresse e-mail a été vérifiée',
      title: `Adresse e-mail vérifiée`,
      introLines: [`Votre adresse e-mail a été vérifiée avec succès. Bienvenue sur ${company} !`],
      outroLines: ['Si vous n’avez pas effectué cette action, contactez notre support.'],
      company
    });
    const mailOptions: SMTPTransport.Options = { from: this.fromAddress(), to: email, subject: `Email vérifié — ${company}`, html: built.html, text: built.text };
    await this.transporter.sendMail(mailOptions);
  }

  async sendResetPassword(email: string, token: string, company: string, otp?: string) {
    const url = this.buildFrontendUrl(`/new-password?token=${encodeURIComponent(token)}`);
    const built = this.buildHtmlTemplate({
      preheader: 'Instructions sécurisées pour réinitialiser votre mot de passe',
      title: `Réinitialiser votre mot de passe`,
      introLines: [`Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte ${company}.`, `Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.`],
      cta: { text: 'Réinitialiser mon mot de passe', url },
      outroLines: ['Si vous n’avez pas demandé cette réinitialisation, ignorez ce message ou contactez le support.'],
      company,
      otp
    });
    const mailOptions: SMTPTransport.Options = { from: this.fromAddress(), to: email, subject: `Réinitialisation de mot de passe — ${company}`, html: built.html, text: built.text };
    await this.transporter.sendMail(mailOptions);
  }
  async sendPasswordChange(email: string, company: string) {
    const built = this.buildHtmlTemplate({
      preheader: 'Confirmation de changement de mot de passe',
      title: `Votre mot de passe a été modifié`,
      introLines: [`Votre mot de passe pour ${company} a été modifié avec succès.`, `Si vous n’avez pas effectué cette modification, contactez notre support immédiatement.`],
      company,
      outroLines: []
    });
    const mailOptions: SMTPTransport.Options = { from: this.fromAddress(), to: email, subject: `Mot de passe modifié — ${company}`, html: built.html, text: built.text };
    await this.transporter.sendMail(mailOptions);
  }
}