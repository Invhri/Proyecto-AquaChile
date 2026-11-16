const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ResendService {
  constructor(apiKey = process.env.RESEND_API_KEY) {
    this.resend = new Resend(apiKey);
    this.from = 'onboarding@resend.dev';
  }

  async sendEmail({ to, subject, name, message }) {
    // 1. Leer la plantilla HTML desde la carpeta templates
    const templatePath = path.join(__dirname, '../templates/ConfirmacionPostulacion.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');

    // 2. Reemplazar los marcadores con los datos reales del candidato
    htmlContent = htmlContent
      .replace('{{name}}', name)
      .replace('{{message}}', message);

    // 3. Enviar el correo
    const { data, error } = await this.resend.emails.send({
      from: this.from,
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}

module.exports = new ResendService();