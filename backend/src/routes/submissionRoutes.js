const express = require("express");

const {
    createSubmission,
    getSubmissionById
} = require("../controllers/submissionController");

const router = express.Router();

router.post("/", createSubmission);

router.get("/:id", getSubmissionById);

module.exports = router;