
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

        // 1. SALES SUMMARY
        const salesResult = await db.query(`
            SELECT
                COALESCE(SUM(total_amount), 0) AS total_sales,
                COUNT(*) AS total_orders
            FROM sales
            WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
        `, [days]);

        // 2. EXPENSE SUMMARY
        const expenseResult = await db.query(`
            SELECT
                COALESCE(SUM(amount), 0) AS total_expenses
            FROM expenses
            WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
        `, [days]);

        const totalSales = Number(salesResult.rows[0].total_sales);
        const totalExpenses = Number(expenseResult.rows[0].total_expenses);

        // 3. DAILY SALES REPORT
        const dailySalesResult = await db.query(`
            SELECT
                DATE(created_at) AS report_date,
                SUM(total_amount) AS total
            FROM sales
            WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
            GROUP BY DATE(created_at)
            ORDER BY report_date ASC
        `, [days]);

        // 4. DAILY EXPENSE REPORT
        const dailyExpensesResult = await db.query(`
            SELECT
                DATE(created_at) AS report_date,
                SUM(amount) AS total
            FROM expenses
            WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
            GROUP BY DATE(created_at)
            ORDER BY report_date ASC
        `, [days]);

        // 5. EXPENSES BY CATEGORY
        const expenseCategoriesResult = await db.query(`
            SELECT
                COALESCE(category, 'Other') AS category,
                SUM(amount) AS total_amount
            FROM expenses
            WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
            GROUP BY category
            ORDER BY total_amount DESC
        `, [days]);

        // 6. TOP SELLING PRODUCTS
        const topProductsResult = await db.query(`
            SELECT
                p.product_name,
                SUM(si.quantity) AS quantity_sold,
                SUM(si.quantity * si.price) AS total_revenue
            FROM sale_items si
            INNER JOIN sales s
                ON si.sale_id = s.sale_id
            INNER JOIN products p
                ON si.product_id = p.product_id
            WHERE s.created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
            GROUP BY p.product_id, p.product_name
            ORDER BY quantity_sold DESC
            LIMIT 5
        `, [days]);

        // FINAL RESPONSE
        res.status(200).json({
            success: true,

            period_days: days,

            summary: {
                total_sales: totalSales,
                total_expenses: totalExpenses,
                net_profit: totalSales - totalExpenses,
                total_orders: Number(salesResult.rows[0].total_orders)
            },

            daily_sales: dailySalesResult.rows,
            daily_expenses: dailyExpensesResult.rows,

            expense_categories: expenseCategoriesResult.rows,

            top_products: topProductsResult.rows
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
