const db = require("../config/db");

// ==========================================
// GET DASHBOARD STATISTICS
// ==========================================

const getDashboardStats = async (req, res) => {
    try {
        const sql = `
            SELECT
                (SELECT COALESCE(SUM(total_amount), 0)
                 FROM sales) AS total_sales,

                (SELECT COALESCE(SUM(amount), 0)
                 FROM expenses) AS total_expenses,

                (SELECT COUNT(*)
                 FROM products) AS total_products,

                (SELECT COUNT(*)
                 FROM products
                 WHERE quantity <= low_stock_limit) AS low_stock_count,

                (SELECT COALESCE(SUM(total_amount), 0)
                 FROM sales
                 WHERE created_at::date = CURRENT_DATE) AS today_sales,

                (SELECT COALESCE(SUM(amount), 0)
                 FROM expenses
                 WHERE created_at::date = CURRENT_DATE) AS today_expenses
        `;

        const result = await db.query(sql);

        const stats = result.rows[0];

        const totalSales = Number(stats.total_sales);
        const totalExpenses = Number(stats.total_expenses);

        res.status(200).json({
            success: true,

            dashboard: {
                totalSales,
                totalExpenses,
                netProfit: totalSales - totalExpenses,
                totalProducts: Number(stats.total_products),
                lowStockCount: Number(stats.low_stock_count),
                todaySales: Number(stats.today_sales),
                todayExpenses: Number(stats.today_expenses)
            }
        });

    } catch (err) {
        console.error("Dashboard Statistics Error:", err.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: err.message
        });
    }
};


// ==========================================
// GET RECENT BUSINESS TRANSACTIONS
// ==========================================

const getRecentTransactions = async (req, res) => {
    try {
        const sql = `
            SELECT
                'Sale' AS transaction_type,
                sale_id AS transaction_id,
                total_amount AS amount,
                created_at
            FROM sales

            UNION ALL

            SELECT
                'Expense' AS transaction_type,
                expense_id AS transaction_id,
                amount,
                created_at
            FROM expenses

            ORDER BY created_at DESC
            LIMIT 10
        `;

        const result = await db.query(sql);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            transactions: result.rows
        });

    } catch (err) {
        console.error("Recent Transactions Error:", err.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent transactions",
            error: err.message
        });
    }
};


// ==========================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
    getDashboardStats,
    getRecentTransactions
};