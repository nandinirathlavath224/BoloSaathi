
// ==========================================
// BOLOSAATHI BACKEND SERVER
// ==========================================

// Load environment variables
require("dotenv").config();

// Import packages
const express = require("express");
const cors = require("cors");

// Import database connection
const db = require("./config/db");

// Import routes
const inventoryRoutes = require("./routes/inventoryRoutes");
const salesRoutes = require("./routes/salesRoutes");
const expensesRoutes = require("./routes/expenseRoutes");
const customersRoutes = require("./routes/customerRoutes");
const aiConversationRoutes = require("./routes/aiConversationRoutes");
const paymentsRoutes = require("./routes/paymentRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const supportRoutes = require("./routes/supportRoutes");
const musicRoutes = require("./routes/musicRoutes");

// Initialize Express
const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to BoloSaathi Backend!",
        status: "Server is running"
    });
});

// ==========================================
// HEALTH CHECK ROUTE
// ==========================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BoloSaathi Backend is running successfully!"
    });
});

// ==========================================
// INVENTORY ROUTES
// ==========================================

app.use("/api/inventory", inventoryRoutes);

// ==========================================
// SALES ROUTES
// ==========================================

app.use("/api/sales", salesRoutes);

// ==========================================
// EXPENSES ROUTES
// ==========================================

app.use("/api/expenses", expensesRoutes);

// ==========================================
// CUSTOMERS ROUTES
// ==========================================

app.use("/api/customers", customersRoutes);
app.use("/api/ai", aiConversationRoutes);
app.use("/api/music", musicRoutes);


// ==========================================
// PAYMENTS ROUTES
// ==========================================

app.use("/api/payments", paymentsRoutes);

// ==========================================
// DASHBOARD ROUTES
// ==========================================

app.use("/api/dashboard", dashboardRoutes);

// ==========================================
// REPORTS ROUTES
// ==========================================

app.use("/api/reports", reportsRoutes);
// ==========================================
// HELP & SUPPORT ROUTES
// ==========================================

app.use("/api/support", supportRoutes);


// ==========================================
// INVALID API ROUTE
// ==========================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
        requested_url: req.originalUrl
    });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
    });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("------------------------------------");
    console.log(" BoloSaathi Backend Started");
    console.log("------------------------------------");
    console.log(` Server running on port ${PORT}`);
    console.log(` Home: http://localhost:${PORT}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(` Reports: http://localhost:${PORT}/api/reports?days=30`);
    console.log("------------------------------------");
});
