const express = require("express");
const { testAICompletion, retrieveKnowledge } = require("../controllers/aiController");

const router = express.Router();

router.post("/test", testAICompletion);
router.post("/retrieve", retrieveKnowledge);

module.exports = router;
