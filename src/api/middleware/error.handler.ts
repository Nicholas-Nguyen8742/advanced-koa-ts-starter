import { Context, Next } from 'koa';

export const errorHandler = async (ctx: Context, next: Next): Promise<void> => {
  try {
    await next();
  } catch (error: any) {
    ctx.status = error.statusCode || error.status || 500;
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    ctx.body = {
      error: {
        message: error.message,
        ...(isDevelopment && { stack: error.stack, details: error })
      },
      timestamp: new Date().toISOString(),
      path: ctx.path
    };

    // Log error
    console.error('🚨 Error:', {
      path: ctx.path,
      method: ctx.method,
      status: ctx.status,
      message: error.message,
      stack: error.stack
    });

    // Emit error for centralized logging
    ctx.app.emit('error', error, ctx);
  }
};
