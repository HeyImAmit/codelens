const amqp = require("amqplib");
const { config } = require("./env");
const { logger } = require("../utils/logger");

const RABBITMQ_URL = config.rabbitmq.url;
const DEFAULT_QUEUE = config.rabbitmq.queueName;

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

        logger.info("Connected to RabbitMQ", {
            url: RABBITMQ_URL.replace(/:\/\/.*@/, "://***@"), // sanitize auth if present
            defaultQueue: DEFAULT_QUEUE
        });

        connection.on("error", (err) => {
            logger.error("RabbitMQ connection error", { error: err.message });
        });

        connection.on("close", () => {
            logger.warn("RabbitMQ connection closed. Resetting connection reference.");
            connection = null;
            channel = null;
        });

        channel.on("error", (err) => {
            logger.error("RabbitMQ channel error", { error: err.message });
        });

        channel.on("close", () => {
            logger.warn("RabbitMQ channel closed.");
            channel = null;
        });

        return channel;
    } catch (error) {
        logger.error("Failed to connect to RabbitMQ", { error: error.message });
        throw error;
    }
};

/**
 * Publishes a JSON payload to a specified durable RabbitMQ queue
 * @param {string} queueName - Name of queue (e.g. 'code-execution')
 * @param {Object} data - Payload object (e.g. { submissionId, requestId })
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
            throw new Error(`Failed to send message to queue buffer: ${queueName}`);
        }
        
        return sent;
    } catch (error) {
        logger.error(`Error publishing to queue [${queueName}]`, {
            queueName,
            submissionId: data?.submissionId,
            requestId: data?.requestId,
            error: error.message
        });
        throw error;
    }
};

/**
 * Inspects a queue for readiness status and active consumer count
 */
const getQueueInfo = async (queueName = DEFAULT_QUEUE) => {
    if (!channel) {
        try {
            await connectRabbitMQ();
        } catch {
            return null;
        }
    }

    try {
        // checkQueue returns { queue, messageCount, consumerCount } without modifying the queue
        const info = await channel.checkQueue(queueName);
        return info;
    } catch (err) {
        logger.warn("Failed to inspect RabbitMQ queue", { queueName, error: err.message });
        return null;
    }
};

const isRabbitMQConnected = () => {
    return Boolean(connection && channel);
};

const getChannel = () => channel;

const closeRabbitMQ = async () => {
    try {
        if (channel) {
            await channel.close();
            channel = null;
        }
        if (connection) {
            await connection.close();
            connection = null;
        }
        logger.info("RabbitMQ connections closed cleanly");
    } catch (err) {
        logger.error("Error closing RabbitMQ connection", { error: err.message });
    }
};

module.exports = {
    connectRabbitMQ,
    publishToQueue,
    getChannel,
    getQueueInfo,
    isRabbitMQConnected,
    closeRabbitMQ
};
