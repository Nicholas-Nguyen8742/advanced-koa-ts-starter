import nodemailer from 'nodemailer';
import { TemplateEngine } from '../utils/template.engine';
import { config } from '../config';
import { emailQueue } from '../config/queue.config';

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface EmailWithAttachment {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export class EmailService {
  private templateEngine: TemplateEngine;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.templateEngine = new TemplateEngine('./src/templates/emails');
    this.initializeTemplates();

    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: false,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass
      }
    } as nodemailer.TransportOptions);
  }

  private async initializeTemplates(): Promise<void> {
    await this.templateEngine.initialize();
  }

  async sendTemplatedEmail(emailData: EmailData): Promise<void> {
    const html = await this.templateEngine.render(
      emailData.template, 
      emailData.data
    );

    await this.sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      html
    });
  }

  async sendEmailWithAttachment(options: EmailWithAttachment): Promise<void> {
    await this.sendEmail(options);
  }

  async queueTemplatedEmail(emailData: EmailData): Promise<void> {
    await emailQueue.add('send-email', emailData, {
      delay: 5000, // optional delay
      attempts: 3,
    });
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    attachments?: any[];
  }): Promise<void> {
    try {
      const mailOptions = {
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${options.to}: ${info.messageId}`);
    } catch (error) {
      console.error('📧 Failed to send email:', error);
      throw error;
    }
  }

  verifyConnection(): Promise<boolean> {
    return this.transporter.verify()
      .then(() => true)
      .catch(() => false);
  }
}
