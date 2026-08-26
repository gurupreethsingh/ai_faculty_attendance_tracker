// controllers/SubscriptionController.js
const Subscription = require("../models/SubscriptionModel");

exports.subscribe = async (req, res) => {
  const { email, subscriptionType } = req.body;
  try {
    let sub = await Subscription.findOne({ email });

    if (sub && sub.isActive) {
      return res.status(400).json({ message: "Email is already subscribed." });
    }

    if (sub && !sub.isActive) {
      sub.isActive = true;
      sub.subscriptionType = subscriptionType;
      sub.canceledAt = null;
      await sub.save();
    } else {
      sub = new Subscription({ email, subscriptionType });
      await sub.save();
    }

    res.status(201).json({ message: "Subscription successful!" });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSubscriptions = async (_req, res) => {
  try {
    const subs = await Subscription.find({});
    res.status(200).json(subs);
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.unsubscribe = async (req, res) => {
  const { email } = req.body;
  try {
    const sub = await Subscription.findOne({ email });
    if (!sub || !sub.isActive) {
      return res
        .status(404)
        .json({ message: "Subscription not found or already canceled." });
    }

    if (typeof sub.cancelSubscription === "function") {
      await sub.cancelSubscription();
    } else {
      sub.isActive = false;
      sub.canceledAt = new Date();
      await sub.save();
    }

    res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resubscribe = async (req, res) => {
  const { email } = req.body;
  try {
    let sub = await Subscription.findOne({ email });
    if (!sub)
      return res.status(404).json({ message: "Subscription not found." });

    sub.isActive = true;
    sub.canceledAt = null;
    await sub.save();

    res.status(200).json({ message: "Resubscribed successfully!" });
  } catch (error) {
    console.error("Resubscribe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getActiveCount = async (_req, res) => {
  try {
    const count = await Subscription.countDocuments({ isActive: true });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Subscription count error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
