import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '.';

export const connection = new IORedis(config.redis.url);

export enum JobType {
  SEND_EMAIL = 'send-email',
  GENERATE_REPORT = 'generate-report',
  PROCESS_PAYMENT = 'process-payment'
}

export const emailQueue = new Queue(JobType.SEND_EMAIL, { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

export const reportQueue = new Queue(JobType.GENERATE_REPORT, { 
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000
    }
  }
});

export const queueEvents = new QueueEvents(JobType.SEND_EMAIL, { connection });
