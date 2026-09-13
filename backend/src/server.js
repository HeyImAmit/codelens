const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectRedis } = require("./config/redis");
const { connectRabbitMQ } = require("./config/rabbitmq");
const problemRoutes = require("./routes/problemRoute");
const submissionRoutes = require("./routes/submissionRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "CodeLens API is running"
    });
});

app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // 1. Initialize Redis connection
        await connectRedis();

        // 2. Initialize RabbitMQ connection
        await connectRabbitMQ();

        // 3. Start Express HTTP Server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to initialize server startup:", error.message);
        // Fallback startup with graceful service warnings
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (Degraded mode: check Redis / RabbitMQ connectivity)`);
        });
    }
};

startServer();