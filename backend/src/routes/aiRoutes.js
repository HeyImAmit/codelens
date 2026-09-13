const express = require("express");
const {
    testAICompletion,
    retrieveKnowledge,
    askTutor,
    reviewCodeSubmission
} = require("../controllers/aiController");

const router = express.Router();

router.post("/test", testAICompletion);
router.post("/retrieve", retrieveKnowledge);
router.post("/ask", askTutor);
router.post("/review", reviewCodeSubmission);

module.exports = router;
