const express = require("express");
const { testAICompletion } = require("../controllers/aiController");

const router = express.Router();

router.post("/test", testAICompletion);

module.exports = router;
