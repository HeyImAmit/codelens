const amqp = require("amqplib");
require("dotenv").config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const DEFAULT_QUEUE = "code-execution";

let connection = null;
let channel = null;

/**
 * Connects to RabbitMQ and initializes default durable queue
 */
const connectRabbitMQ = async () => {
    if (channel) return channel;

    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        // Ensure default queue is durable
        await channel.assertQueue(DEFAULT_QUEUE, { durable: true });

        console.log("Connected to RabbitMQ");

        connection.on("error", (err) => {
            console.error("RabbitMQ connection error:", err.message);
        });

        connection.on("close", () => {
            console.warn("RabbitMQ connection closed. Resetting connection reference.");
            connection = null;
            channel = null;
        });

        return channel;
    } catch (error) {
        console.error("Failed to connect to RabbitMQ:", error.message);
        throw error;
    }
};

/**
 * Publishes a JSON payload to a specified durable RabbitMQ queue
 * @param {string} queueName - Name of queue (e.g. 'code-execution')
 * @param {Object} data - Payload object (e.g. { submissionId })
 */
const publishToQueue = async (queueName, data) => {
    if (!channel) {
        await connectRabbitMQ();
    }

    try {
        await channel.assertQueue(queueName, { durable: true });
        const buffer = Buffer.from(JSON.stringify(data));
        
        // Publish message with persistent: true for basic message durability
        const sent = channel.sendToQueue(queueName, buffer, { persistent: true });
        
        if (!sent) {
            throw new Error(`Failed to send message to queue: ${queueName}`);
        }
        
        return sent;
    } catch (error) {
        console.error(`Error publishing to queue [${queueName}]:`, error.message);
        throw error;
    }
};

const getChannel = () => channel;

module.exports = {
    connectRabbitMQ,
    publishToQueue,
    getChannel
};
