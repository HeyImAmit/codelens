const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectRabbitMQ } = require("./config/rabbitmq");
const problemRoutes = require("./routes/problemRoute");
const submissionRoutes = require("./routes/submissionRoutes");

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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Initialize RabbitMQ connection on server startup
        await connectRabbitMQ();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to initialize server startup:", error.message);
        // Allow Express server to start anyway if desired, or exit
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} (RabbitMQ disconnected)`);
        });
    }
};

startServer();