const express = require("express");

const router = express.Router();

const {
    getExpenses,
    addExpense,
    getExpenseSummary
} = require("../controllers/expenseController");

// Get all expenses
router.get("/", getExpenses);

// Add expense
router.post("/", addExpense);

// Get expense summary
router.get("/summary", getExpenseSummary);

module.exports = router;