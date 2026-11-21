const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getRecentTransactions
} = require("../controllers/dashboardController");

router.get("/stats", getDashboardStats);

router.get("/recent-transactions", getRecentTransactions);

module.exports = router;