"use strict";

const { connectToRabbitMq, consumerQueue } = require("../dbs/inits.rabbit");

const messagesService = {
  consumerQueue: async (queueName) => {
    try {
      const { channel } = await connectToRabbitMq();
      await consumerQueue(channel, queueName);
      console.log(
        `[x] Waiting for messages in ${queueName}. To exit press CTRL+C`
      );
    } catch (e) {
      console.error("Error while connecting to RabbitMQ", e);
    }
  },
};

module.exports = {
  messagesService,
};
