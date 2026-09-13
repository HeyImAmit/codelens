const express = require("express");
const {
    testAICompletion,
    retrieveKnowledge,
    askTutor,
    reviewCodeSubmission,
    generateHint
} = require("../controllers/aiController");

const router = express.Router();

router.post("/test", testAICompletion);
router.post("/retrieve", retrieveKnowledge);
router.post("/ask", askTutor);
router.post("/review", reviewCodeSubmission);
router.post("/hint", generateHint);

module.exports = router;
