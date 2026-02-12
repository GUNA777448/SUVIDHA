const express = require("express");
const connectionController = require("../controllers/connection.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticate, connectionController.getConnections);
router.get(
  "/:connectionId",
  authenticate,
  connectionController.getConnectionById,
);
router.post("/", authenticate, connectionController.createConnection);
router.patch(
  "/:connectionId",
  authenticate,
  connectionController.updateConnection,
);

module.exports = router;
