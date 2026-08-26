// routes/SubscriptionRoutes.js
const express = require("express");
const SubscriptionController = require("../controllers/SubscriptionController");

const router = express.Router();

router.post("/subscribe", SubscriptionController.subscribe);
router.get("/all-subscriptions", SubscriptionController.getAllSubscriptions);
router.post("/unsubscribe", SubscriptionController.unsubscribe);
router.post("/resubscribe", SubscriptionController.resubscribe);
router.get("/subscription-count", SubscriptionController.getActiveCount);

module.exports = router;
