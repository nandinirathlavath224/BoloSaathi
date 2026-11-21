
const db = require("../config/db");

// GET REPORTS
exports.getReports = async (req, res) => {
    try {
        // Get selected date range
        const days = Number(req.query.days) || 30;

        // Validate date range
        if (![7, 30, 90].includes(days)) {
            return res.status(400).json({
                success: false,
                message: "Please select 7, 30 or 90 days."
            });
        }

        const connection = db.promise();

        // 1. SALES SUMMARY
        const [salesResult] = await connection.query(`
            SELECT
                COALESCE(SUM(total_amount), 0) AS total_sales,
                COUNT(*) AS total_orders
            FROM sales
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        `);

        // 2. EXPENSE SUMMARY
        const [expenseResult] = await connection.query(`
            SELECT
                COALESCE(SUM(amount), 0) AS total_expenses
            FROM expenses
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        `);

        const totalSales = Number(salesResult[0].total_sales);
        const totalExpenses = Number(expenseResult[0].total_expenses);

        // 3. DAILY SALES REPORT
        const [dailySales] = await connection.query(`
            SELECT
                DATE(created_at) AS report_date,
                SUM(total_amount) AS total
            FROM sales
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
            GROUP BY DATE(created_at)
            ORDER BY report_date ASC
        `);

        // 4. DAILY EXPENSE REPORT
        const [dailyExpenses] = await connection.query(`
            SELECT
                DATE(created_at) AS report_date,
                SUM(amount) AS total
            FROM expenses
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
            GROUP BY DATE(created_at)
            ORDER BY report_date ASC
        `);

        // 5. EXPENSES BY CATEGORY
        const [expenseCategories] = await connection.query(`
            SELECT
                COALESCE(category, 'Other') AS category,
                SUM(amount) AS total_amount
            FROM expenses
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
            GROUP BY category
            ORDER BY total_amount DESC
        `);

        // 6. TOP SELLING PRODUCTS
        const [topProducts] = await connection.query(`
            SELECT
                p.product_name,
                SUM(si.quantity) AS quantity_sold,
                SUM(si.quantity * si.price) AS total_revenue
            FROM sale_items si
            INNER JOIN sales s
                ON si.sale_id = s.sale_id
            INNER JOIN products p
                ON si.product_id = p.product_id
            WHERE s.created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
            GROUP BY p.product_id, p.product_name
            ORDER BY quantity_sold DESC
            LIMIT 5
        `);

        // FINAL RESPONSE
        res.status(200).json({
            success: true,

            period_days: days,

            summary: {
                total_sales: totalSales,
                total_expenses: totalExpenses,
                net_profit: totalSales - totalExpenses,
                total_orders: Number(salesResult[0].total_orders)
            },

            daily_sales: dailySales,
            daily_expenses: dailyExpenses,

            expense_categories: expenseCategories,

            top_products: topProducts
        });

    } catch (error) {
        console.error("Reports Controller Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate reports.",
            error: error.message
        });
    }
};
