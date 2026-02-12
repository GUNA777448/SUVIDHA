const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// All profile routes require authentication
router.use(verifyToken);

// ── Profile Routes (Protected) ──
router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.get("/consumer/:consumerId", profileController.getProfileByConsumerId);

module.exports = router;
