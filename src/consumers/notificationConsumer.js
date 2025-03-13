const { connectToRabbitMq } = require("../dbs/inits.rabbit");
const { saveNotification } = require("../service/NotificationService");

const consumeNotifications = async () => {
  const { channel } = await connectToRabbitMq();
  const queueName = "sendMail";

  await channel.assertQueue(queueName, { durable: true });
  console.log(`[*] Waiting for messages in queue: ${queueName}`);

  channel.consume(
    queueName,
    async (msg) => {
      if (msg !== null) {
        const messageContent = JSON.parse(msg.content.toString());
        console.log("📩 Received message:", messageContent);

        if (Array.isArray(messageContent)) {
          for (let item of messageContent) {
            if (item.remainingStock <= 5) {
              const notificationMessage = `Sản phẩm: ${item.ingredientName}, Số lượng tồn kho: ${item.remainingStock} sắp hết, vui lòng nhập hàng`;

              await saveNotification({
                ingredientName: item.ingredientName,
                remainingStock: item.remainingStock,
                message: notificationMessage,
              });

              console.log("✅ Notification saved for:", item.ingredientName);
            }
          }
        }

        channel.ack(msg);
      }
    },
    { noAck: false }
  );
};

module.exports = consumeNotifications;
