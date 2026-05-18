const Redis = require("ioredis");

const client = new Redis(process.env.REDIS_URL);

client.on("connect", () => {
  console.log("Redis connected");
});

client.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = client;
