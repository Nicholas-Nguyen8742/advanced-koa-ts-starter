import { Worker, Job } from 'bullmq';
import { connection } from '../config/queue.config';

export abstract class BaseWorker<T> {
  protected worker: Worker;

  constructor(queueName: string, concurrency: number = 1) {
    this.worker = new Worker(
      queueName,
      async (job: Job<T>) => {
        console.log(`🎯 Processing job ${job.id} of type ${job.name}`);
        try {
          const result = await this.process(job);
          console.log(`✅ Job ${job.id} completed successfully`);
          return result;
        } catch (error) {
          console.error(`❌ Job ${job.id} failed:`, error);
          await this.handleError(job, error as Error);
          throw error;
        }
      },
      { 
        connection,
        concurrency 
      }
    );

    this.setupEventListeners();
  }

  protected setupEventListeners(): void {
    this.worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('🚨 Worker error:', err);
    });
  }

  abstract process(job: Job<T>): Promise<any>;
  abstract handleError(job: Job<T>, error: Error): Promise<void>;

  public close(): Promise<void> {
    return this.worker.close();
  }
}
