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
}