import { Context, Next } from 'koa';

export const loggerMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  const start = Date.now();
  
  await next();
  
  const duration = Date.now() - start;
  const logLevel = ctx.status >= 400 ? 'WARN' : 'INFO';
  
  console.log(`${logLevel}: ${ctx.method} ${ctx.url} - ${ctx.status} - ${duration}ms`);
};
