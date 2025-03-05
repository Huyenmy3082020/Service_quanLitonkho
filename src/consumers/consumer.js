const amqp = require("amqplib");
const { createClient } = require("redis");
const runProducer = require("../../src/producer/producer");
const redisClient = require("../../config/redis");

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("✅ Redis connected!");
  }
}

async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://rabbitmq");
  const channel = await connection.createChannel();
  return { connection, channel };
}

async function processOrder(msg, channel) {
  try {
    const { userId, items, totalPrice } = JSON.parse(msg.content.toString());

    if (!items || items.length === 0) {
      console.log("⚠️ Không có sản phẩm nào trong đơn hàng.");
      return channel.ack(msg);
    }

    let allSuccess = true;
    const lowStockThreshold = 70;
    let stockAlerts = [];

    for (const item of items) {
      const { ingredientsId, ingredientNameAtPurchase, quantity } = item;

      if (!ingredientsId || !quantity) {
        console.log(`⚠️ Thiếu dữ liệu sản phẩm: ${JSON.stringify(item)}`);
        allSuccess = false;
        continue;
      }

      let stockData = await redisClient.get(`stock:product_${ingredientsId}`);
      let stock = stockData ? parseInt(stockData, 10) : 0;

      if (stock >= quantity) {
        await redisClient.decrBy(`stock:product_${ingredientsId}`, quantity);
        console.log(
          `✅ Đơn hàng ${ingredientNameAtPurchase} xử lý thành công!`
        );

        let newStock = stock - quantity;
        if (newStock <= lowStockThreshold) {
          console.log(
            `⚠️ Sắp hết hàng: ${ingredientNameAtPurchase} (còn ${newStock})`
          );

          stockAlerts.push({
            ingredientsId,
            ingredientNameAtPurchase,
            remainingStock: newStock,
          });
        }
      } else {
        console.log(
          `❌ Không đủ hàng cho sản phẩm ${ingredientNameAtPurchase}`
        );
        allSuccess = false;
      }
    }

    if (stockAlerts.length > 0) {
      await runProducer(stockAlerts);
    }

    // 🔹 Kiểm tra xem channel còn mở không trước khi gọi `ack`
    if (!channel.connection.stream.destroyed) {
      try {
        channel.ack(msg);
      } catch (ackError) {
        console.error("❌ Lỗi khi gửi ack:", ackError.message);
      }
    } else {
      console.error("❌ Channel đã bị đóng, không thể gửi ack.");
    }
  } catch (error) {
    console.error("❌ Lỗi xử lý đơn hàng:", error.message);
  }
}

async function startConsumer() {
  try {
    await connectRedis();
    const { connection, channel } = await connectRabbitMQ();
    const queue = "shipment_queue";

    await channel.assertQueue(queue, { durable: true });
    console.log(`📦 Consumer lắng nghe: ${queue}...`);

    channel.consume(
      queue,
      (msg) => {
        if (msg) {
          console.log(`📥 Nhận tin nhắn: ${msg.content.toString()}`);
          processOrder(msg, channel);
        }
      },
      {
        noAck: false, // 🔹 Tắt `noAck` để tự quản lý `ack`
      }
    );
  } catch (error) {
    console.error("❌ Lỗi kết nối RabbitMQ:", error.message);
    setTimeout(startConsumer, 5000);
  }
}

module.exports = { startConsumer };
