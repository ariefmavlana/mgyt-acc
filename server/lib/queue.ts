import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

// Reuse Redis connection from CacheService if possible, but BullMQ needs its own connection or config
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

// Fix: Cast connection to any to avoid type mismatch between local ioredis and bullmq's bundled ioredis types
export const reportQueue = new Queue('reports', { connection: connection as any });

// Worker should be run in a separate process in production
// For simple deployment, we can init it here but it's not "Production Grade" scaling.
// However, the task is about logic setup.

export const initWorkers = () => {
    const reportWorker = new Worker('reports', async job => {
        console.log(`Processing job ${job.id} of type ${job.name}`);

        // Example: logic to pre-calculate report
        if (job.name === 'precalculate-balance-sheet') {
            const { perusahaanId } = job.data;
            // logic to calculating balance sheet...
            // In a real scenario, we would call the service logic here.
            console.log(`Pre-calculating for ${perusahaanId}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
        }
    }, { connection: connection as any });

    reportWorker.on('completed', job => {
        console.log(`${job.id} has completed!`);
    });

    reportWorker.on('failed', (job, err) => {
        console.log(`${job?.id} has failed with ${err.message}`);
    });
};
