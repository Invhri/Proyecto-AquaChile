const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ResendService {
  constructor(apiKey = process.env.RESEND_API_KEY) {
    this.apiKey = apiKey;
    this.from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  }

  async sendEmail({ to, subject, name, message }) {
    if (!this.apiKey) {
      throw new Error('RESEND_API_KEY no está configurada');
    }

    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);

    const templatePath = path.join(__dirname, '../templates/ConfirmacionPostulacion.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');

    htmlContent = htmlContent
      .replace('{{name}}', escapeHtml(name))
      .replace('{{message}}', escapeHtml(message));

    const { data, error } = await new Resend(this.apiKey).emails.send({
      from: this.from,
      to: [to],
      subject,
      html: htmlContent,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}

module.exports = new ResendService();