const express = require("express");
const {
    testAICompletion,
    retrieveKnowledge,
    askTutor
} = require("../controllers/aiController");

const router = express.Router();

router.post("/test", testAICompletion);
router.post("/retrieve", retrieveKnowledge);
router.post("/ask", askTutor);

module.exports = router;
