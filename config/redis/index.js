const redis = require("redis");

const redisClient = redis.createClient({
  
  socket : { host: "redis", port: 6379,},
});

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

redisClient.connect();

module.exports = redisClient;
