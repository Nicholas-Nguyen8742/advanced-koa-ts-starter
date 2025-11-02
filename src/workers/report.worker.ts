import { Job } from 'bullmq';
import { BaseWorker } from './base.worker';
import { ReportService } from '../services/report.service';
import { EmailService } from '../services/email.service';

export interface ReportJobData {
  templateName: string;
  data: any;
  emailTo?: string;
  subject?: string;
}

export class ReportWorker extends BaseWorker<ReportJobData> {
  private reportService: ReportService;
  private emailService: EmailService;

  constructor() {
    super('generate-report', 2); // Process 2 reports concurrently (PDF generation is CPU intensive)
    this.reportService = new ReportService();
    this.emailService = new EmailService();
  }

  async process(job: Job<ReportJobData>): Promise<void> {
    const { templateName, data, emailTo, subject } = job.data;
    
    console.log(`📊 Generating ${templateName} report`);
    
    const pdfBuffer = await this.reportService.generatePDFReport(templateName, data);

    if (emailTo) {
      console.log(`📧 Emailing report to ${emailTo}`);
      await this.emailService.sendEmailWithAttachment({
        to: emailTo,
        subject: subject || `Your ${templateName} Report`,
        html: `<p>Please find your ${templateName} report attached.</p>`,
        attachments: [{
          filename: `${templateName}-${new Date().toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      });
    }

    return { generated: true, emailed: !!emailTo, size: pdfBuffer.length };
  }

  async handleError(job: Job<ReportJobData>, error: Error): Promise<void> {
    console.error(`📊 Failed to generate report for job ${job.id}:`, error);
    
    if (job.data.emailTo) {
      // Notify user that report generation failed
      await this.emailService.sendTemplatedEmail({
        to: job.data.emailTo,
        subject: 'Report Generation Failed',
        template: 'error',
        data: {
          error: error.message,
          reportType: job.data.templateName
        }
      });
    }
  }
}
