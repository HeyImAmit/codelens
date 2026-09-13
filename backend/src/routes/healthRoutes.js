const express = require("express");
const { getLiveness, getReadiness, getHealth } = require("../controllers/healthController");

const router = express.Router();

router.get("/", getHealth);
router.get("/live", getLiveness);
router.get("/ready", getReadiness);

module.exports = router;
