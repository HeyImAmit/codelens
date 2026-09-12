const express = require("express");

const {
    createSubmission,
    getSubmissionById
} = require("../controllers/submissionController");
const { submissionRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/", submissionRateLimiter, createSubmission);

router.get("/:id", getSubmissionById);

module.exports = router;