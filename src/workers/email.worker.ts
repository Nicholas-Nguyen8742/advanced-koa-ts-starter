import { Job } from 'bullmq';
import { BaseWorker } from './base.worker';
import { EmailService } from '../services/email.service';

export interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export class EmailWorker extends BaseWorker<EmailJobData> {
  private emailService: EmailService;

  constructor() {
    super('send-email', 5); // Process 5 emails concurrently
    this.emailService = new EmailService();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, template, data } = job.data;
    
    console.log(`📧 Sending ${template} email to ${to}`);
    
    await this.emailService.sendTemplatedEmail({
      to,
      subject,
      template,
      data
    });
  }

  async handleError(job: Job<EmailJobData>, error: Error): Promise<void> {
    console.error(`📧 Failed to send email for job ${job.id}:`, error);
    
    // Implement your error handling logic here
    // - Send to error tracking service
    // - Notify administrators
    // - Retry logic is handled by BullMQ
  }
}