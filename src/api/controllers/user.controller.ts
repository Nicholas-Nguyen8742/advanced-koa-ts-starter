import { Context } from 'koa';
import { EmailService } from '../../services/email.service';

export class UserController {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  register = async (ctx: Context): Promise<void> => {
    try {
      const { email, name, password } = ctx.request.body as any;

      if (!email || !password) {
        ctx.throw(400, 'Email and password are required');
      }

      // In a real app, you would:
      // 1. Validate input
      // 2. Hash password
      // 3. Save user to database
      // 4. Generate verification token, etc.

      const user = {
        id: 'user-' + Date.now(), // Mock user ID
        email,
        name: name || email.split('@')[0],
        createdAt: new Date()
      };

      // Queue welcome email
      await this.emailService.queueTemplatedEmail({
        to: email,
        subject: 'Welcome to Our Service!',
        template: 'welcome',
        data: {
          user: {
            name: user.name,
            email: user.email
          },
          features: [
            'Create and manage your profile',
            'Access exclusive content',
            'Connect with other users',
            'Personalized recommendations'
          ],
          loginUrl: 'https://yourapp.com/login'
        }
      });

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        timestamp: user.createdAt
      };
    } catch (error) {
      ctx.throw(500, `Failed to register user: ${error}`);
    }
  };

  requestPasswordReset = async (ctx: Context): Promise<void> => {
    try {
      const { email } = ctx.request.body as any;

      if (!email) {
        ctx.throw(400, 'Email is required');
      }

      // In a real app, you would:
      // 1. Generate reset token
      // 2. Save token to database with expiration
      // 3. Send email with reset link

      const resetToken = 'reset-' + Math.random().toString(36).substr(2, 9);
      const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;

      await this.emailService.queueTemplatedEmail({
        to: email,
        subject: 'Password Reset Request',
        template: 'notification',
        data: {
          user: {
            name: 'User', // Would fetch from DB in real app
            email: email
          },
          notification: {
            type: 'password-reset',
            title: 'Password Reset',
            message: 'You requested to reset your password. Use the link below to set a new password.',
            actionUrl: resetUrl,
            actionText: 'Reset Password',
            important: 'This link will expire in 1 hour.'
          }
        }
      });

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Password reset email sent',
        to: email
      };
    } catch (error) {
      ctx.throw(500, `Failed to send password reset email: ${error}`);
    }
  };
}
