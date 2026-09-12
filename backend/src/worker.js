const amqp = require("amqplib");
require("dotenv").config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const QUEUE_NAME = "code-execution";

const startWorker = async () => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        console.log("Connected to RabbitMQ");

        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        // Ensure fair dispatch: process 1 job at a time per worker
        channel.prefetch(1);

        console.log("Execution worker started");

        channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) return;

            try {
                const content = msg.content.toString();
                const data = JSON.parse(content);

                if (!data || !data.submissionId) {
                    console.error("Malformed message received:", content);
                    // Reject without requeueing malformed job
                    channel.nack(msg, false, false);
                    return;
                }

                console.log(`Received submission: ${data.submissionId}`);

                // Acknowledge successful processing
                channel.ack(msg);
            } catch (err) {
                console.error("Error processing message:", err.message);
                // Reject malformed payload
                channel.nack(msg, false, false);
            }
        }, {
            noAck: false // Require explicit acknowledgements
        });

        connection.on("error", (err) => {
            console.error("RabbitMQ Worker connection error:", err.message);
        });

        connection.on("close", () => {
            console.warn("RabbitMQ Worker connection closed.");
        });

    } catch (error) {
        console.error("Failed to start RabbitMQ worker:", error.message);
        process.exit(1);
    }
};

startWorker();
