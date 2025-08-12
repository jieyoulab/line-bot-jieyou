// queue.js 範例
//const path = require('path');
require('dotenv').config();

const { Queue, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');

if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL missing. Expect something like rediss://:PASSWORD@...:PORT');
    process.exit(1);
  }

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {}
});
const eventsConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {}
});

const QUEUE_NAME = 'crawl';
const crawlQueue = new Queue(QUEUE_NAME, { connection });
const crawlEvents = new QueueEvents(QUEUE_NAME, { connection: eventsConnection });

async function closeAll() {
  await Promise.allSettled([
    crawlQueue.close(),
    crawlEvents.close(),
    connection.quit(),
    eventsConnection.quit(),
  ]);
}

module.exports = { crawlQueue, crawlEvents, connection, eventsConnection, QUEUE_NAME, closeAll };
