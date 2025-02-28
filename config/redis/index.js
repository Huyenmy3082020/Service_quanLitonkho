const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: "redis",
    port: 6379,
  },
});

redisClient.on("error", (err) => console.error("❌ Redis error:", err));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("✅ Redis connected!");
  }
}

module.exports = { redisClient, connectRedis };
