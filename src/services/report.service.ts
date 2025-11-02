import puppeteer from 'puppeteer';
import { TemplateEngine } from '../utils/template.engine';
import { reportQueue } from '../config/queue.config';

export interface ReportData {
  title: string;
  generatedAt: Date;
  data: any;
  user: {
    name: string;
    email: string;
  };
}

export class ReportService {
  private templateEngine: TemplateEngine;

  constructor() {
    this.templateEngine = new TemplateEngine('./src/templates/reports');
  }

  async generatePDFReport(templateName: string, data: ReportData): Promise<Buffer> {
    const html = await this.templateEngine.render(templateName, data);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }

  async queuePDFReportGeneration(
    templateName: string, 
    data: ReportData, 
    emailTo?: string,
    subject?: string
  ): Promise<void> {
    await reportQueue.add('generate-report', {
      templateName,
      data,
      emailTo,
      subject: subject || `${templateName} Report`
    }, {
      priority: 1 // High priority
    });
  }
}
