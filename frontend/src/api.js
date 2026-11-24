// ==========================================
// BOLOSAATHI - API CONFIGURATION
// ==========================================

export const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");


// ==========================================
// FETCH DASHBOARD STATISTICS
// ==========================================

export const getDashboardStats = async () => {
    try {
        const response = await fetch(`${API_URL}/dashboard/stats`);

        if (!response.ok) {
            throw new Error("Failed to fetch dashboard statistics");
        }

        return await response.json();

    } catch (error) {
        console.error("Dashboard API Error:", error);
        throw error;
    }
};


// ==========================================
// FETCH RECENT TRANSACTIONS
// ==========================================

export const getRecentTransactions = async () => {
    try {
        const response = await fetch(
            `${API_URL}/dashboard/recent-transactions`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch recent transactions");
        }

        return await response.json();

    } catch (error) {
        console.error("Transactions API Error:", error);
        throw error;
    }
};


// ==========================================
// GET BUSINESS SUMMARY
// ==========================================

export const getBusinessSummary = async () => {
    try {
        const data = await getDashboardStats();

        const stats = data.dashboard || {};

        const totalSales = Number(stats.totalSales || 0);
        const totalExpenses = Number(stats.totalExpenses || 0);

        const todaySales = Number(stats.todaySales || 0);
        const todayExpenses = Number(stats.todayExpenses || 0);

        return {
            totalSales,
            totalExpenses,
            netProfit: totalSales - totalExpenses,

            todaySales,
            todayExpenses,
            todayProfit: todaySales - todayExpenses,

            totalProducts: Number(stats.totalProducts || 0),
            lowStockCount: Number(stats.lowStockCount || 0)
        };

    } catch (error) {
        console.error("Business Summary API Error:", error);
        throw error;
    }
};