const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});