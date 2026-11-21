// ==========================================
// BOLOSAATHI MUSIC ROUTES
// ==========================================

const express = require("express");

const router = express.Router();

const {
    searchSongs
} = require("../controllers/MusicController");

// Search songs
router.get("/search", searchSongs);

module.exports = router;