import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import { config } from './config';
import { errorHandler } from './api/middleware/error.handler';
import { loggerMiddleware } from './api/middleware/logger';
import { authMiddleware } from './api/middleware/auth';
import { EmailWorker } from './workers/email.worker';
import { ReportWorker } from './workers/report.worker';
import { initializeRoutes } from './api/routes';

export class App {
  public koa: Koa;

  constructor() {
    this.koa = new Koa();
    this.setupMiddleware();
    this.setupRoutes();
    this.initializeWorkers();
  }

  private setupMiddleware(): void {
    // Error handling should be first
    this.koa.use(errorHandler);

    // Logger
    this.koa.use(loggerMiddleware);

    // Compression
    this.koa.use(compress());

    // Body parser
    this.koa.use(bodyParser());

    // Authentication
    this.koa.use(authMiddleware);
  }

  private setupRoutes(): void {
    const router = new Router();

    // Health check
    router.get('/health', (ctx) => {
      ctx.body = { status: 'OK', timestamp: new Date().toISOString() };
    });

    // Initialize API routes
    initializeRoutes(router);

    this.koa.use(router.routes());
    this.koa.use(router.allowedMethods());
  }

  private initializeWorkers(): void {
    if (process.env.NODE_ENV !== 'test') {
      new EmailWorker();
      new ReportWorker();
      console.log('🎯 Background workers initialized');
    }
  }

  public start(port: number = config.port): void {
    this.koa.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📊 Environment: ${config.env}`);
      console.log(`👷 Workers: ${config.redis.url ? 'Enabled' : 'Disabled'}`);
    });
  }
}
