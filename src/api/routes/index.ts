import Router from 'koa-router';
import { ReportController } from '../controllers/report.controller';
import { EmailController } from '../controllers/email.controller';
import { UserController } from '../controllers/user.controller';

const reportController = new ReportController();
const emailController = new EmailController();
const userController = new UserController();

export function initializeRoutes(router: Router): void {
  // Health check
  router.get('/health', (ctx) => {
    ctx.body = { 
      status: 'OK', 
      service: 'Koa TypeScript API',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  });

  // Report routes
  router.get('/api/reports/invoice/:userId', reportController.generateInvoice);
  router.post('/api/reports/queue', reportController.queueReport);
  
  // Email routes
  router.post('/api/emails/welcome', emailController.sendWelcomeEmail);
  router.post('/api/emails/welcome/queue', emailController.queueWelcomeEmail);
  router.post('/api/emails/notification', emailController.sendNotificationEmail);
  router.get('/api/emails/status', emailController.getEmailStatus);

  // User routes
  router.post('/api/users/register', userController.register);
  router.post('/api/users/forgot-password', userController.requestPasswordReset);
}