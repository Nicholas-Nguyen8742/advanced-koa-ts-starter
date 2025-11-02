import { Context } from 'koa';
import { EmailService } from '../../services/email.service';

export class EmailController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  sendWelcomeEmail = async (ctx: Context): Promise<void> => {
    try {
      const { email, name } = ctx.request.body as any;

      if (!email) {
        ctx.throw(400, 'Email is required');
      }

      const emailData = {
        to: email,
        subject: 'Welcome to Our Service!',
        template: 'welcome',
        data: {
          user: {
            name: name || 'Valued Customer',
            email: email
          },
          features: [
            'Access to all premium features',
            '24/7 customer support',
            'Regular product updates',
            'Exclusive community access'
          ],
          loginUrl: 'https://yourapp.com/login'
        }
      };

      // Send email immediately
      await this.emailService.sendTemplatedEmail(emailData);

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Welcome email sent successfully',
        to: email
      };
    } catch (error) {
      ctx.throw(500, `Failed to send welcome email: ${error}`);
    }
  };

  queueWelcomeEmail = async (ctx: Context): Promise<void> => {
    try {
      const { email, name, delay } = ctx.request.body as any;

      if (!email) {
        ctx.throw(400, 'Email is required');
      }

      const emailData = {
        to: email,
        subject: 'Welcome to Our Service!',
        template: 'welcome',
        data: {
          user: {
            name: name || 'Valued Customer',
            email: email
          },
          features: [
            'Access to all premium features',
            '24/7 customer support',
            'Regular product updates',
            'Exclusive community access'
          ],
          loginUrl: 'https://yourapp.com/login'
        }
      };

      // Queue email for background processing
      await this.emailService.queueTemplatedEmail(emailData);

      ctx.status = 202;
      ctx.body = {
        success: true,
        message: 'Welcome email queued for delivery',
        to: email,
        queuedAt: new Date().toISOString()
      };
    } catch (error) {
      ctx.throw(500, `Failed to queue welcome email: ${error}`);
    }
  };

  sendNotificationEmail = async (ctx: Context): Promise<void> => {
    try {
      const { email, name, notificationType, data } = ctx.request.body as any;

      if (!email || !notificationType) {
        ctx.throw(400, 'Email and notificationType are required');
      }

      const emailData = {
        to: email,
        subject: this.getNotificationSubject(notificationType),
        template: 'notification',
        data: {
          user: {
            name: name || 'Valued Customer',
            email: email
          },
          notification: {
            type: notificationType,
            title: this.getNotificationTitle(notificationType),
            message: this.getNotificationMessage(notificationType, data),
            actionUrl: data?.actionUrl || 'https://yourapp.com/dashboard',
            actionText: 'View Details'
          }
        }
      };

      await this.emailService.queueTemplatedEmail(emailData);

      ctx.status = 202;
      ctx.body = {
        success: true,
        message: 'Notification email queued successfully',
        to: email,
        notificationType
      };
    } catch (error) {
      ctx.throw(500, `Failed to send notification email: ${error}`);
    }
  };

  getEmailStatus = async (ctx: Context): Promise<void> => {
    try {
      // This would typically check the status of an email job
      // For now, we'll return a mock response
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Email service is operational',
        smtp: await this.emailService.verifyConnection(),
        queue: 'redis', // This would check Redis connection
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.throw(500, `Failed to get email status: ${error}`);
    }
  };

  private getNotificationSubject(type: string): string {
    const subjects: { [key: string]: string } = {
      'welcome': 'Welcome to Our Service!',
      'password-reset': 'Password Reset Request',
      'order-confirmation': 'Order Confirmation',
      'payment-receipt': 'Payment Receipt',
      'account-verified': 'Account Verified',
      'security-alert': 'Security Alert'
    };
    return subjects[type] || 'Notification from Our Service';
  }

  private getNotificationTitle(type: string): string {
    const titles: { [key: string]: string } = {
      'welcome': 'Welcome Aboard!',
      'password-reset': 'Password Reset',
      'order-confirmation': 'Order Confirmed',
      'payment-receipt': 'Payment Received',
      'account-verified': 'Account Verified',
      'security-alert': 'Security Notice'
    };
    return titles[type] || 'Notification';
  }

  private getNotificationMessage(type: string, data: any): string {
    const messages: { [key: string]: string } = {
      'welcome': 'Thank you for joining our service. We\'re excited to have you on board!',
      'password-reset': 'We received a request to reset your password. If this was you, please use the link below.',
      'order-confirmation': `Your order #${data?.orderId} has been confirmed and is being processed.`,
      'payment-receipt': `We've received your payment of $${data?.amount}. Thank you for your business!`,
      'account-verified': 'Your account has been successfully verified. You now have full access to all features.',
      'security-alert': 'We noticed a new login to your account. If this wasn\'t you, please secure your account immediately.'
    };
    return messages[type] || 'You have a new notification from our service.';
  }
}
