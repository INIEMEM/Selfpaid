const Redis = require("ioredis");

const client = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      console.error("Redis connection failed after 3 retries. Check REDIS_URL in server/.env.");
      return null;
    }

    return Math.min(times * 200, 1000);
  },
});

client.on("connect", () => {
  console.log("Redis connected");
});

client.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

module.exports = client;
