import { Context } from 'koa';
import { ReportService } from '../../services/report.service';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  generateInvoice = async (ctx: Context): Promise<void> => {
    try {
      const { userId } = ctx.params;
      
      const reportData = {
        title: 'Monthly Invoice',
        generatedAt: new Date(),
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          items: [
            { description: 'Product A', quantity: 2, unitPrice: 50, total: 100 },
            { description: 'Product B', quantity: 1, unitPrice: 75, total: 75 },
            { description: 'Service Fee', quantity: 1, unitPrice: 25, total: 25 }
          ],
          grandTotal: 200,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        user: await this.getUserData(userId)
      };

      const pdfBuffer = await this.reportService.generatePDFReport('invoice', reportData);
      
      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `attachment; filename="invoice-${reportData.data.invoiceNumber}.pdf"`);
      ctx.body = pdfBuffer;
    } catch (error) {
      ctx.throw(500, `Failed to generate invoice: ${error}`);
    }
  };

  queueReport = async (ctx: Context): Promise<void> => {
    try {
      const { userId, email, reportType } = ctx.request.body as any;
      
      const reportData = {
        title: `${reportType} Report`,
        generatedAt: new Date(),
        data: await this.getReportData(userId, reportType),
        user: await this.getUserData(userId)
      };

      await this.reportService.queuePDFReportGeneration(
        reportType,
        reportData,
        email,
        `Your ${reportType} Report`
      );
      
      ctx.status = 202;
      ctx.body = { 
        success: true,
        message: 'Report generation queued successfully',
        reportType,
        queuedAt: new Date().toISOString()
      };
    } catch (error) {
      ctx.throw(500, `Failed to queue report: ${error}`);
    }
  };

  private async getUserData(userId: string): Promise<any> {
    // In a real application, fetch from database
    return { 
      name: 'John Doe', 
      email: 'john.doe@example.com' 
    };
  }

  private async getReportData(userId: string, reportType: string): Promise<any> {
    // In a real application, fetch relevant data based on report type
    return {
      metrics: {
        revenue: 15000,
        growth: 15.5,
        customers: 1247
      },
      period: 'January 2024'
    };
  }
}
