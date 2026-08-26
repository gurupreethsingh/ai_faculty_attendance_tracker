const mongoose = require("mongoose");
const Contact = require("../models/ContactModel");

function normalizeTrim(value = "") {
  return String(value).trim();
}

function splitName(name = "") {
  const cleaned = normalizeTrim(name);
  if (!cleaned) {
    return { firstName: "", lastName: "" };
  }

  const parts = cleaned.split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

function serializeContact(contactDoc) {
  if (!contactDoc) return null;

  const raw =
    typeof contactDoc.toObject === "function"
      ? contactDoc.toObject()
      : { ...contactDoc };

  const { firstName, lastName } = splitName(raw.name);

  return {
    ...raw,
    firstName,
    lastName,
    message_text: raw.message || "",
    replies: Array.isArray(raw.replies) ? raw.replies : [],
  };
}

const createContactMessage = async (req, res) => {
  try {
    const incomingName = req.body?.name ?? req.body?.fullName ?? "";
    const incomingEmail = req.body?.email ?? "";
    const incomingPhone = req.body?.phone ?? "";
    const incomingMessage = req.body?.message ?? req.body?.message_text ?? "";

    const name = normalizeTrim(incomingName);
    const email = normalizeTrim(incomingEmail).toLowerCase();
    const phone = normalizeTrim(incomingPhone);
    const message = normalizeTrim(incomingMessage);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const contactMessage = await Contact.create({
      name,
      email,
      phone,
      message,
      replies: [],
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contactMessage: serializeContact(contactMessage),
    });
  } catch (error) {
    console.log("Error in createContactMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send contact message.",
      error: error.message,
    });
  }
};

const getAllContactMessages = async (_req, res) => {
  try {
    const messages = await Contact.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages.map(serializeContact),
    });
  } catch (error) {
    console.log("Error in getAllContactMessages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages.",
      error: error.message,
    });
  }
};

const getSingleContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message id.",
      });
    }

    const message = await Contact.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }

    return res.status(200).json({
      success: true,
      message: serializeContact(message),
    });
  } catch (error) {
    console.log("Error in getSingleContactMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact message.",
      error: error.message,
    });
  }
};

const markContactMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message id.",
      });
    }

    const updatedMessage = await Contact.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message marked as read.",
      contactMessage: serializeContact(updatedMessage),
    });
  } catch (error) {
    console.log("Error in markContactMessageAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update contact message.",
      error: error.message,
    });
  }
};

const addReplyToContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const incomingName =
      req.body?.name ?? req.user?.name ?? req.user?.fullName ?? "Super Admin";
    const incomingEmail = req.body?.email ?? req.user?.email ?? "";
    const incomingMessage = req.body?.message ?? req.body?.reply ?? "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message id.",
      });
    }

    const name = normalizeTrim(incomingName);
    const email = normalizeTrim(incomingEmail).toLowerCase();
    const message = normalizeTrim(incomingMessage);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Reply name is required.",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Reply email is required.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required.",
      });
    }

    const existingContact = await Contact.findById(id);

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    existingContact.replies.push({
      name,
      email,
      message,
      timestamp: new Date(),
    });
    existingContact.isRead = true;

    await existingContact.save();

    return res.status(200).json({
      success: true,
      message: "Reply added successfully.",
      contactMessage: serializeContact(existingContact),
    });
  } catch (error) {
    console.log("Error in addReplyToContactMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add reply.",
      error: error.message,
    });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message id.",
      });
    }

    const deletedMessage = await Contact.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message and all replies deleted successfully.",
      deletedContactMessage: serializeContact(deletedMessage),
    });
  } catch (error) {
    console.log("Error in deleteContactMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message.",
      error: error.message,
    });
  }
};

const bulkDeleteContactMessages = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one contact message id.",
      });
    }

    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more contact message ids are invalid.",
        invalidIds,
      });
    }

    const result = await Contact.deleteMany({
      _id: { $in: ids },
    });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} contact message(s) and their replies deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.log("Error in bulkDeleteContactMessages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to bulk delete contact messages.",
      error: error.message,
    });
  }
};

module.exports = {
  createContactMessage,
  getAllContactMessages,
  getSingleContactMessage,
  markContactMessageAsRead,
  addReplyToContactMessage,
  deleteContactMessage,
  bulkDeleteContactMessages,
};
