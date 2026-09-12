const express = require("express");

const {
    getAllProblems,
    getProblemById
} = require("../controllers/problemController");

const router = express.Router();

router.get("/", getAllProblems);

router.get("/:id", getProblemById);

module.exports = router;