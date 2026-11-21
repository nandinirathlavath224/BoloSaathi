
const db = require("../config/db");

// Get all expenses
exports.getExpenses = (req, res) => {
    const sql = `
        SELECT *
        FROM expenses
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch expenses",
                error: err.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            expenses: results
        });
    });
};

// Add a new expense
exports.addExpense = (req, res) => {
    const {
        expense_name,
        amount,
        category,
        description,
        payment_method
    } = req.body;

    const expenseAmount = Number(amount);

    const allowedPaymentMethods = [
        "Cash",
        "UPI",
        "Card",
        "Bank Transfer"
    ];

    const selectedPaymentMethod = payment_method || "Cash";

    if (
        !expense_name ||
        amount === undefined ||
        amount === null ||
        !Number.isFinite(expenseAmount) ||
        expenseAmount <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid expense name and amount."
        });
    }

    if (!allowedPaymentMethods.includes(selectedPaymentMethod)) {
        return res.status(400).json({
            success: false,
            message: "Please select a valid payment method."
        });
    }

    const sql = `
        INSERT INTO expenses
        (expense_name, amount, category, description, payment_method)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            expense_name.trim(),
            expenseAmount,
            category || "General",
            description || null,
            selectedPaymentMethod
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to add expense",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Expense recorded successfully!",
                expense_id: result.insertId,
                payment_method: selectedPaymentMethod
            });
        }
    );
};

// Get total expenses
exports.getExpenseSummary = (req, res) => {
    const sql = `
        SELECT
            COALESCE(SUM(amount), 0) AS total_expenses,
            COUNT(*) AS total_transactions,
            COALESCE(
                SUM(
                    CASE
                        WHEN DATE(created_at) = CURDATE()
                        THEN amount
                        ELSE 0
                    END
                ), 0
            ) AS today_expenses
        FROM expenses
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to calculate expenses",
                error: err.message
            });
        }

        res.json({
            success: true,
            summary: results[0]
        });
    });
};
