import React, { useEffect, useState } from "react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";

import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ShoppingBag,
    RefreshCw,
    BarChart3
} from "lucide-react";

import "./Reports.css";

const API_URL = "http://localhost:5000/api";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(amount) || 0);
};

function Reports() {

    const [days, setDays] = useState(30);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReports = async () => {

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/reports?days=${days}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to load reports");
            }

            setReport(data);

        } catch (err) {

            console.error("Reports Error:", err);
            setError(err.message || "Unable to load reports");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [days]);

    const chartData = report
        ? report.daily_sales.map((sale) => {

            const expense = report.daily_expenses.find(
                (item) =>
                    new Date(item.report_date).toDateString() ===
                    new Date(sale.report_date).toDateString()
            );

            return {
                date: new Date(sale.report_date).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short" }
                ),
                sales: Number(sale.total),
                expenses: expense ? Number(expense.total) : 0
            };
        })
        : [];

    const expenseData = report
        ? report.expense_categories.map((item) => ({
            name: item.category || "Other",
            value: Number(item.total_amount)
        }))
        : [];

    const COLORS = [
        "#6366f1",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4"
    ];

    if (loading) {
        return (
            <div className="reports-loading">
                <RefreshCw className="loading-icon" size={28} />
                <p>Generating your business reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reports-error">
                <h2>Unable to Load Reports</h2>
                <p>{error}</p>
                <button onClick={fetchReports}>
                    Try Again
                </button>
            </div>
        );
    }

    if (!report) return null;

    const summary = report.summary;

    return (

        <div className="reports-container">

            {/* HEADER */}

            <div className="reports-header">

                <div>
                    <h1>Business Reports</h1>
                    <p>Understand your business performance and growth.</p>
                </div>

                <div className="reports-actions">

                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                    </select>

                    <button onClick={fetchReports}>
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                </div>

            </div>


            {/* SUMMARY CARDS */}

            <div className="reports-summary">

                <div className="report-card sales-card">

                    <div className="report-card-top">
                        <span>Total Sales</span>
                        <div className="report-icon sales-icon">
                            <TrendingUp size={22} />
                        </div>
                    </div>

                    <h2>{formatCurrency(summary.total_sales)}</h2>
                    <p>Sales during selected period</p>

                </div>


                <div className="report-card expenses-card">

                    <div className="report-card-top">
                        <span>Total Expenses</span>
                        <div className="report-icon expenses-icon">
                            <TrendingDown size={22} />
                        </div>
                    </div>

                    <h2>{formatCurrency(summary.total_expenses)}</h2>
                    <p>Recorded business expenses</p>

                </div>


                <div className="report-card profit-card">

                    <div className="report-card-top">
                        <span>Net Profit</span>
                        <div className="report-icon profit-icon">
                            <Wallet size={22} />
                        </div>
                    </div>

                    <h2>{formatCurrency(summary.net_profit)}</h2>
                    <p>Sales minus recorded expenses</p>

                </div>


                <div className="report-card orders-card">

                    <div className="report-card-top">
                        <span>Total Orders</span>
                        <div className="report-icon orders-icon">
                            <ShoppingBag size={22} />
                        </div>
                    </div>

                    <h2>{summary.total_orders}</h2>
                    <p>Orders recorded during this period</p>

                </div>

            </div>


            {/* SALES AND EXPENSES CHART */}

            <div className="reports-chart-card">

                <div className="reports-section-heading">
                    <div>
                        <h2>Sales vs Expenses</h2>
                        <p>Daily business performance</p>
                    </div>

                    <BarChart3 size={24} />
                </div>

                {chartData.length === 0 ? (

                    <div className="reports-empty">
                        No daily sales data available for this period.
                    </div>

                ) : (

                    <ResponsiveContainer width="100%" height={320}>

                        <BarChart data={chartData}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="date" />

                            <YAxis />

                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                            />

                            <Legend />

                            <Bar
                                dataKey="sales"
                                name="Sales"
                                fill="#6366f1"
                                radius={[5, 5, 0, 0]}
                            />

                            <Bar
                                dataKey="expenses"
                                name="Expenses"
                                fill="#f59e0b"
                                radius={[5, 5, 0, 0]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                )}

            </div>


            {/* BOTTOM SECTION */}

            <div className="reports-bottom-grid">


                {/* EXPENSE CATEGORIES */}

                <div className="reports-chart-card">

                    <h2>Expense Breakdown</h2>
                    <p className="reports-subtitle">
                        Expenses by category
                    </p>

                    {expenseData.length === 0 ? (

                        <div className="reports-empty">
                            No expense category data available.
                        </div>

                    ) : (

                        <ResponsiveContainer width="100%" height={280}>

                            <PieChart>

                                <Pie
                                    data={expenseData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={95}
                                    label
                                >

                                    {expenseData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}

                                </Pie>

                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                />

                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    )}

                </div>


                {/* TOP PRODUCTS */}

                <div className="reports-chart-card">

                    <h2>Top Selling Products</h2>
                    <p className="reports-subtitle">
                        Your best-performing products
                    </p>

                    {report.top_products.length === 0 ? (

                        <div className="reports-empty">
                            No product sales available.
                        </div>

                    ) : (

                        <div className="top-products-list">

                            {report.top_products.map((product, index) => (

                                <div
                                    className="top-product-item"
                                    key={index}
                                >

                                    <div className="product-rank">
                                        {index + 1}
                                    </div>

                                    <div className="product-details">

                                        <h4>{product.product_name}</h4>

                                        <p>
                                            {product.quantity_sold} units sold
                                        </p>

                                    </div>

                                    <strong>
                                        {formatCurrency(product.total_revenue)}
                                    </strong>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

            <p className="reports-note">
                Note: Net profit here is calculated as total sales minus
                recorded expenses. It does not yet include product purchase
                costs, taxes or other unrecorded costs.
            </p>

        </div>
    );
}

export default Reports;