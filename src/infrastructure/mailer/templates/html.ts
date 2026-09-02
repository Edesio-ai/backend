import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type RenderedEmail = {
  html: string;
  subject: string;
};

export const EMAIL_LOGO_CONTENT_ID = 'edesio-logo';
export const EMAIL_LOGO_FILENAME = 'edesio-logo-square.png';

export function getEmailLogoCid(): string {
  return `cid:${EMAIL_LOGO_CONTENT_ID}`;
}

export function getEmailLogoAttachment() {
  return {
    filename: EMAIL_LOGO_FILENAME,
    content: loadEmailLogoBuffer(),
    contentId: EMAIL_LOGO_CONTENT_ID,
    contentType: 'image/png',
  };
}

export function renderEmailLogo(logoUrl: string): string {
  return `<img src="${logoUrl}" alt="Edesio" width="72" height="72" style="display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; width: 72px; height: 72px;" />`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function loadEmailLogoBuffer(): Buffer {
  const candidates = [
    join(__dirname, '..', 'assets', EMAIL_LOGO_FILENAME),
    join(process.cwd(), 'src/infrastructure/mailer/assets', EMAIL_LOGO_FILENAME),
  ];
  const path = candidates.find((candidate) => existsSync(candidate));

  if (!path) {
    throw new Error(`Email logo not found: ${EMAIL_LOGO_FILENAME}`);
  }

  return readFileSync(path);
}
