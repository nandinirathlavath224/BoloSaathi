// ==========================================
// BOLOSAATHI - AI CONVERSATION ROUTES
// ==========================================

const express = require("express");

const router = express.Router();

// Import AI Conversation Controller
const {
    generateConversation
} = require("../controllers/AIConversationController");

// Generate AI conversation response
router.post("/chat", generateConversation);

// Export routes
module.exports = router;