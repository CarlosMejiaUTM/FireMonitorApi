import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendUserWelcomeEmail(user: { nombre: string; correo: string }) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: user.correo,
      subject: '¡Bienvenido a FireMonitor!',
      html: `
        <h1>¡Hola, ${user.nombre}!</h1>
        <p>Tu cuenta en FireMonitor ha sido creada exitosamente.</p>
        <p>Ya puedes iniciar sesión y monitorear tus nodos.</p>
      `,
    });
    console.log(`✅ Correo de bienvenida enviado a ${user.correo}`);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    // En producción, la URL del frontend debería venir de una variable de entorno
    const resetUrl = `https://carlosmejiautm.github.io/firemonitor/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Recuperación de Contraseña - FireMonitor',
      html: `
        <h1>Recuperación de Contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetUrl}" target="_blank">Restablecer mi contraseña</a>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
        <p>Este enlace expirará en 1 hora.</p>
      `,
    });
    console.log(`✅ Correo de recuperación enviado a ${email}`);
  }
}
