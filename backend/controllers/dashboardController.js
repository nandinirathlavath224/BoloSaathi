const db = require("../config/db");

const getDashboardStats = (req, res) => {

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
             WHERE DATE(created_at) = CURDATE()) AS today_sales,

            (SELECT COALESCE(SUM(amount), 0)
             FROM expenses
             WHERE DATE(created_at) = CURDATE()) AS today_expenses
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch dashboard statistics",
                error: err.message
            });
        }

        const stats = results[0];

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
    });
};


// Get recent business transactions
const getRecentTransactions = (req, res) => {

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

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch recent transactions",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            transactions: results
        });
    });
};


module.exports = {
    getDashboardStats,
    getRecentTransactions
};