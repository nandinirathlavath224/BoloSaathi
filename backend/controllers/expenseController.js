const db = require("../config/db");

// ==========================================
// GET ALL EXPENSES
// ==========================================

exports.getExpenses = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT *
            FROM expenses
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            count: result.rows.length,
            expenses: result.rows
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch expenses",
            error: err.message
        });
    }
};


// ==========================================
// ADD A NEW EXPENSE
// ==========================================

exports.addExpense = async (req, res) => {
    try {
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
            !expense_name.trim() ||
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

        const result = await db.query(
            `INSERT INTO expenses
             (expense_name, amount, category, description, payment_method)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING expense_id`,
            [
                expense_name.trim(),
                expenseAmount,
                category || "General",
                description || null,
                selectedPaymentMethod
            ]
        );

        res.status(201).json({
            success: true,
            message: "Expense recorded successfully!",
            expense_id: result.rows[0].expense_id,
            payment_method: selectedPaymentMethod
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to add expense",
            error: err.message
        });
    }
};


// ==========================================
// GET EXPENSE SUMMARY
// ==========================================

exports.getExpenseSummary = async (req, res) => {
    try {
        const sql = `
            SELECT
                COALESCE(SUM(amount), 0) AS total_expenses,
                COUNT(*) AS total_transactions,
                COALESCE(
                    SUM(
                        CASE
                            WHEN created_at::date = CURRENT_DATE
                            THEN amount
                            ELSE 0
                        END
                    ), 0
                ) AS today_expenses
            FROM expenses
        `;

        const result = await db.query(sql);

        res.json({
            success: true,
            summary: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to calculate expenses",
            error: err.message
        });
    }
};