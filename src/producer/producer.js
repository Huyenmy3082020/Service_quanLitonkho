const amqp = require("amqplib");

const runProducer = async (stockAlertList) => {
  try {
    const connection = await amqp.connect("amqp://rabbimq");
    const channel = await connection.createChannel();
    const queueName = "sendMail";

    await channel.assertQueue(queueName, { durable: true });

    const message = JSON.stringify(stockAlertList);
    channel.sendToQueue(queueName, Buffer.from(message), { persistent: true });

    console.log(`📢 Đã gửi cảnh báo hết hàng: ${message}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error in producer:", error);
  }
};

module.exports = runProducer;
