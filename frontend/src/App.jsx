import React, { useState, useEffect } from "react";

import {
    LayoutDashboard,
    Mic,
    Music,
    ShoppingCart,
    Wallet,
    Package,
    Users,
    BarChart3,
    Settings as SettingsIcon,
    Bell,
    Search,
    TrendingUp,
    TrendingDown,
    Menu,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    CircleHelp,
    MessageCircle,
    Clock,
    CheckCircle2
} from "lucide-react";

import "./App.css";

import {
    getDashboardStats,
    getRecentTransactions
} from "./api";

import VoiceAssistant from "./VoiceAssistant";
import MusicPlayer from "./MusicPlayer";
import Inventory from "./Inventory";
import Sales from "./Sales";
import Expenses from "./Expenses";
import Customers from "./Customers";
import Payments from "./Payments";
import Reports from "./Reports";
import SettingsPage from "./Settings";
import HelpSupport from "./HelpSupport";
import SupportRequests from "./SupportRequests";


function App() {

    // ==========================================
    // MAIN APPLICATION STATES
    // ==========================================

    const [activePage, setActivePage] = useState("Dashboard");

    // ==========================================
    // BUSINESS PROFILE STATE
    // ==========================================

    const [businessProfile, setBusinessProfile] = useState(() => {

        try {

            return JSON.parse(
                localStorage.getItem("boloBusinessProfile")
            ) || {
                businessName: "My Business",
                ownerName: "Business Owner",
                phone: "",
                email: "",
                address: ""
            };

        } catch {

            return {
                businessName: "My Business",
                ownerName: "Business Owner",
                phone: "",
                email: "",
                address: ""
            };

        }

    });


    // ==========================================
    // BUSINESS PROFILE UPDATE LISTENER
    // ==========================================

    useEffect(() => {

        const updateBusinessProfile = () => {

            try {

                const savedProfile = JSON.parse(
                    localStorage.getItem("boloBusinessProfile")
                );

                if (savedProfile) {
                    setBusinessProfile(savedProfile);
                }

            } catch (error) {

                console.error(
                    "Business Profile Loading Error:",
                    error
                );

            }

        };

        // Listen for changes from Settings
        window.addEventListener(
            "businessProfileUpdated",
            updateBusinessProfile
        );

        // Listen for changes from another browser tab
        window.addEventListener(
            "storage",
            updateBusinessProfile
        );

        // Load the latest saved profile
        updateBusinessProfile();

        return () => {

            window.removeEventListener(
                "businessProfileUpdated",
                updateBusinessProfile
            );

            window.removeEventListener(
                "storage",
                updateBusinessProfile
            );

        };

    }, []);


    // ==========================================
    // BUSINESS PROFILE DISPLAY VALUES
    // ==========================================

    const ownerName =
        businessProfile.ownerName?.trim() || "Business Owner";

    const businessName =
        businessProfile.businessName?.trim() || "My Business";

    const ownerInitial =
        ownerName.charAt(0).toUpperCase();


    // ==========================================
    // DASHBOARD STATES
    // ==========================================

    const [dashboardData, setDashboardData] = useState({
        totalSales: 0,
        totalExpenses: 0,
        netProfit: 0,
        totalProducts: 0,
        lowStockCount: 0
    });

    const [transactions, setTransactions] = useState([]);

    const [dashboardLoading, setDashboardLoading] = useState(false);

    const [dashboardError, setDashboardError] = useState("");


    // ==========================================
    // MENU ITEMS
    // ==========================================

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard },
        { name: "AI Assistant", icon: Mic },
        { name: "Music Player", icon: Music },
        { name: "Sales", icon: ShoppingCart },
        { name: "Expenses", icon: Wallet },
        { name: "Inventory", icon: Package },
        { name: "Customers", icon: Users },
        { name: "Payments", icon: Wallet },
        { name: "Reports", icon: BarChart3 }
    ];


    // ==========================================
    // CURRENCY FORMATTER
    // ==========================================

    const formatCurrency = (value) => {

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(Number(value) || 0);

    };


    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    useEffect(() => {

        if (activePage !== "Dashboard") {
            return;
        }

        let isMounted = true;

        const fetchDashboardData = async () => {

            try {

                setDashboardLoading(true);
                setDashboardError("");

                const [
                    statsResponse,
                    transactionsResponse
                ] = await Promise.all([
                    getDashboardStats(),
                    getRecentTransactions()
                ]);


                // PROCESS DASHBOARD STATISTICS

                const statsSource =
                    statsResponse?.dashboard ||
                    statsResponse?.stats ||
                    statsResponse?.data ||
                    statsResponse ||
                    {};

                const totalSales = Number(
                    statsSource.totalSales ??
                    statsSource.total_sales ??
                    statsSource.sales ??
                    0
                );

                const totalExpenses = Number(
                    statsSource.totalExpenses ??
                    statsSource.total_expenses ??
                    statsSource.expenses ??
                    0
                );

                const netProfit = Number(
                    statsSource.netProfit ??
                    statsSource.net_profit ??
                    (totalSales - totalExpenses)
                );

                const totalProducts = Number(
                    statsSource.totalProducts ??
                    statsSource.total_products ??
                    statsSource.product_count ??
                    0
                );

                const lowStockCount = Number(
                    statsSource.lowStockCount ??
                    statsSource.low_stock_count ??
                    statsSource.low_stock ??
                    0
                );

                if (!isMounted) return;

                setDashboardData({
                    totalSales,
                    totalExpenses,
                    netProfit,
                    totalProducts,
                    lowStockCount
                });


                // PROCESS RECENT TRANSACTIONS

                const transactionList =
                    Array.isArray(transactionsResponse)
                        ? transactionsResponse
                        : (
                            transactionsResponse?.transactions ||
                            transactionsResponse?.data ||
                            []
                        );

                if (!isMounted) return;

                setTransactions(
                    Array.isArray(transactionList)
                        ? transactionList
                        : []
                );

            } catch (error) {

                console.error(
                    "Dashboard Loading Error:",
                    error
                );

                if (isMounted) {

                    setDashboardError(
                        "Unable to load dashboard data. Please check your backend connection."
                    );

                }

            } finally {

                if (isMounted) {
                    setDashboardLoading(false);
                }

            }

        };

        fetchDashboardData();

        return () => {
            isMounted = false;
        };

    }, [activePage]);


    // ==========================================
    // DASHBOARD STATISTICS
    // ==========================================

    const stats = [

        {
            title: "Total Sales",
            amount: formatCurrency(dashboardData.totalSales),
            change: "Recorded sales",
            icon: ShoppingCart,
            type: "purple",
            trend: "up"
        },

        {
            title: "Total Expenses",
            amount: formatCurrency(dashboardData.totalExpenses),
            change: "Recorded expenses",
            icon: Wallet,
            type: "orange",
            trend: "down"
        },

        {
            title: "Net Profit",
            amount: formatCurrency(dashboardData.netProfit),
            change: "Sales - Expenses",
            icon: TrendingUp,
            type: "green",
            trend: "up"
        },

        {
            title: "Total Products",
            amount: dashboardData.totalProducts,
            change: `${dashboardData.lowStockCount} low stock`,
            icon: Package,
            type: "blue",
            trend: "up"
        }

    ];


    // ==========================================
    // FORMAT RECENT TRANSACTIONS
    // ==========================================

    const formattedTransactions = transactions.map(
        (item, index) => {

            const transactionType = String(
                item.transaction_type ||
                item.type ||
                item.category ||
                ""
            ).toLowerCase();

            const isExpense =
                transactionType.includes("expense");

            const amount = Number(
                item.amount ??
                item.total_amount ??
                item.total ??
                0
            );

            const transactionDate =
                item.created_at ||
                item.transaction_date ||
                item.date;

            const formattedDate = transactionDate
                ? new Date(transactionDate).toLocaleString("en-IN")
                : "Date unavailable";

            const transactionName =
                item.name ||
                item.description ||
                item.product_name ||
                item.transaction_name ||
                `${isExpense ? "Expense" : "Sale"} #${item.transaction_id || item.sale_id || index + 1}`;

            return {

                id: item.transaction_id || item.sale_id || index,

                name: transactionName,

                category: isExpense
                    ? "Expense"
                    : "Product Sale",

                date: formattedDate,

                amount: `${isExpense ? "-" : "+"}${formatCurrency(
                    Math.abs(amount)
                )}`,

                type: isExpense
                    ? "expense"
                    : "income"

            };

        }
    );


    // ==========================================
    // MAIN APPLICATION UI
    // ==========================================

    return (

        <div className="app-container">


            {/* ==================================
                SIDEBAR
            ================================== */}

            <aside className="sidebar">

                <div className="brand">

                    <div className="brand-icon">
                        <Mic size={25} />
                    </div>

                    <div>
                        <h2>BoloSaathi</h2>
                        <span>SMART BUSINESS AI</span>
                    </div>

                </div>


                <div className="sidebar-label">
                    MAIN MENU
                </div>


                <nav className="navigation">

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        return (

                            <button
                                key={item.name}
                                className={`nav-item ${
                                    activePage === item.name
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => setActivePage(item.name)}
                            >

                                <Icon size={20} />

                                <span>{item.name}</span>

                            </button>

                        );

                    })}

                </nav>


                <div className="sidebar-bottom">

                    <button
                        className={`nav-item ${
                            activePage === "Help & Support" ? "active" : ""
                        }`}
                        onClick={() => setActivePage("Help & Support")}
                    >

                        <CircleHelp size={20} />

                        <span>Help & Support</span>

                    </button>


                    <button
                        className={`nav-item ${
                            activePage === "Support Requests" ? "active" : ""
                        }`}
                        onClick={() => setActivePage("Support Requests")}
                    >

                        <MessageCircle size={20} />

                        <span>Support Requests</span>

                    </button>


                    <button
                        className={`nav-item ${
                            activePage === "Settings" ? "active" : ""
                        }`}
                        onClick={() => setActivePage("Settings")}
                    >

                        <SettingsIcon size={20} />

                        <span>Settings</span>

                    </button>


                    {/* DYNAMIC BUSINESS PROFILE */}

                    <div className="user-profile">

                        <div className="avatar">
                            {ownerInitial}
                        </div>

                        <div>
                            <h4>{ownerName}</h4>
                            <p>{businessName}</p>
                        </div>

                    </div>

                </div>

            </aside>


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <main className="main-content">


                {/* ==================================
                    TOP NAVBAR
                ================================== */}

                <header className="topbar">

                    <div className="topbar-left">

                        <button className="mobile-menu">
                            <Menu size={23} />
                        </button>

                        <div>
                            <h3>{activePage}</h3>
                            <p>Manage your business smartly</p>
                        </div>

                    </div>


                    <div className="topbar-right">

                        <div className="search-box">

                            <Search size={18} />

                            <input
                                placeholder="Search anything..."
                            />

                        </div>


                        <button className="notification-button">

                            <Bell size={21} />

                            <span></span>

                        </button>

                    </div>

                </header>


                {/* ==================================
                    DASHBOARD PAGE
                ================================== */}

                {activePage === "Dashboard" && (

                    <div className="dashboard-content">


                        {/* WELCOME SECTION */}

                        <section className="welcome-section">

                            <div>

                                <h1>
                                    Welcome back, {ownerName}! 👋
                                </h1>

                                <p>
                                    Here's what's happening with {businessName} today.
                                </p>

                            </div>


                            <div className="date-label">

                                <Clock size={17} />

                                Today's Overview

                            </div>

                        </section>


                        {/* ENTERTAINMENT NAVIGATION - DASHBOARD SHORTCUT */}

                        <section style={{ margin: "0 0 24px 0" }}>

                            <button
                                type="button"
                                onClick={() => setActivePage("Music Player")}
                                aria-label="Open Entertainment and Music Player"
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "18px",
                                    padding: "20px 24px",
                                    border: "1px solid rgba(167, 139, 250, 0.35)",
                                    borderRadius: "18px",
                                    background: "linear-gradient(110deg, #39216c 0%, #6540b5 58%, #805ad5 100%)",
                                    color: "#ffffff",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    boxShadow: "0 10px 26px rgba(76, 45, 145, 0.20)"
                                }}
                            >

                                <span style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <span style={{
                                        width: "52px",
                                        height: "52px",
                                        flexShrink: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "15px",
                                        background: "rgba(255,255,255,0.16)"
                                    }}>
                                        <Music size={27} />
                                    </span>

                                    <span style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                        <strong style={{ fontSize: "17px", fontWeight: 800 }}>Entertainment & Music</strong>
                                        <span style={{ fontSize: "13px", color: "#e8ddff" }}>Discover trending songs, explore playlists and enjoy your favourite music.</span>
                                    </span>
                                </span>

                                <ArrowUpRight size={23} style={{ flexShrink: 0 }} />

                            </button>

                        </section>


                        {/* VOICE ASSISTANT */}

                        <section className="voice-card">

                            <div className="voice-content">

                                <div className="voice-badge">

                                    <Sparkles size={15} />

                                    YOUR AI BUSINESS ASSISTANT

                                </div>


                                <h2>
                                    Hi! I'm BoloSaathi 🤖
                                </h2>


                                <p>
                                    Your smart business companion. Speak naturally
                                    and let me manage your business activities.
                                </p>


                                <div className="voice-message">

                                    <MessageCircle size={18} />

                                    <span>
                                        Your friendly AI assistant is ready.
                                        Click below to start speaking!
                                    </span>

                                </div>


                                <button
                                    className="mic-button"
                                    onClick={() => setActivePage("AI Assistant")}
                                >

                                    <Mic size={25} />

                                    Talk to BoloSaathi

                                </button>


                                <small>
                                    Supports Telugu, Hindi, Tamil and English
                                </small>

                            </div>


                            <div className="voice-decoration">

                                <div className="voice-circle">

                                    <Mic size={65} />

                                </div>

                                <span>AI POWERED</span>

                            </div>

                        </section>


                        {/* BUSINESS STATISTICS */}

                        <section className="stats-section">

                            <div className="section-heading">

                                <div>
                                    <h2>Business Overview</h2>

                                    <p>
                                        Your business performance at a glance
                                    </p>
                                </div>


                                <button
                                    className="period-button"
                                    onClick={() => setActivePage("Reports")}
                                >
                                    This Month
                                </button>

                            </div>


                            {dashboardError && (

                                <div className="dashboard-error">

                                    {dashboardError}

                                    <button
                                        onClick={() => setActivePage("Reports")}
                                    >
                                        View Reports
                                    </button>

                                </div>

                            )}


                            <div className="stats-grid">

                                {stats.map((item) => {

                                    const Icon = item.icon;

                                    return (

                                        <div
                                            className="stat-card"
                                            key={item.title}
                                        >

                                            <div
                                                className={`stat-icon ${item.type}`}
                                            >

                                                <Icon size={23} />

                                            </div>


                                            <p>{item.title}</p>


                                            <h2>
                                                {dashboardLoading
                                                    ? "Loading..."
                                                    : item.amount
                                                }
                                            </h2>


                                            <div className="stat-change">

                                                {item.trend === "up" ? (

                                                    <ArrowUpRight size={16} />

                                                ) : (

                                                    <ArrowDownRight size={16} />

                                                )}

                                                <span>{item.change}</span>

                                            </div>

                                        </div>

                                    );

                                })}

                            </div>

                        </section>


                        {/* RECENT TRANSACTIONS AND QUICK ACTIONS */}

                        <section className="bottom-grid">


                            {/* RECENT TRANSACTIONS */}

                            <div className="transactions-card">

                                <div className="section-heading">

                                    <div>

                                        <h2>Recent Transactions</h2>

                                        <p>
                                            Your latest business activities
                                        </p>

                                    </div>


                                    <button
                                        className="view-button"
                                        onClick={() => setActivePage("Sales")}
                                    >
                                        View All
                                    </button>

                                </div>


                                <div className="transaction-list">

                                    {dashboardLoading ? (

                                        <p>
                                            Loading transactions...
                                        </p>

                                    ) : dashboardError ? (

                                        <p>
                                            Unable to load transactions.
                                        </p>

                                    ) : formattedTransactions.length === 0 ? (

                                        <p>
                                            No transactions available yet.
                                        </p>

                                    ) : (

                                        formattedTransactions.map((item, index) => (

                                            <div
                                                className="transaction-item"
                                                key={`${item.type}-${item.id}-${index}`}
                                            >

                                                <div
                                                    className={`transaction-icon ${item.type}`}
                                                >

                                                    {item.type === "income" ? (

                                                        <TrendingUp size={20} />

                                                    ) : (

                                                        <TrendingDown size={20} />

                                                    )}

                                                </div>


                                                <div className="transaction-details">

                                                    <h4>{item.name}</h4>

                                                    <p>
                                                        {item.category} · {item.date}
                                                    </p>

                                                </div>


                                                <strong className={item.type}>
                                                    {item.amount}
                                                </strong>

                                            </div>

                                        ))

                                    )}

                                </div>

                            </div>


                            {/* QUICK ACTIONS */}

                            <div className="quick-actions-card">

                                <h2>Quick Actions</h2>

                                <p>
                                    Manage your business easily
                                </p>


                                <button
                                    onClick={() => setActivePage("Sales")}
                                >

                                    <ShoppingCart size={19} />

                                    <span>Add New Sale</span>

                                    <ArrowUpRight size={17} />

                                </button>


                                <button
                                    onClick={() => setActivePage("Expenses")}
                                >

                                    <Wallet size={19} />

                                    <span>Record Expense</span>

                                    <ArrowUpRight size={17} />

                                </button>


                                <button
                                    onClick={() => setActivePage("Inventory")}
                                >

                                    <Package size={19} />

                                    <span>Manage Inventory</span>

                                    <ArrowUpRight size={17} />

                                </button>


                                <button
                                    onClick={() => setActivePage("Customers")}
                                >

                                    <Users size={19} />

                                    <span>View Customers</span>

                                    <ArrowUpRight size={17} />

                                </button>


                                <button
                                    onClick={() => setActivePage("Reports")}
                                >

                                    <BarChart3 size={19} />

                                    <span>View Reports</span>

                                    <ArrowUpRight size={17} />

                                </button>


                                {/* ENTERTAINMENT AND MUSIC */}

                                <button
                                    onClick={() => setActivePage("Music Player")}
                                >

                                    <Music size={19} />

                                    <span>Entertainment & Music</span>

                                    <ArrowUpRight size={17} />

                                </button>


                                <div className="success-note">

                                    <CheckCircle2 size={17} />

                                    Your business assistant is ready!

                                </div>

                            </div>

                        </section>


                        {/* FOOTER */}

                        <footer className="footer">

                            © 2026 BoloSaathi. Smart Business Management Powered by AI.

                        </footer>

                    </div>

                )}


                {/* ==================================
                    INDIVIDUAL MODULE PAGES
                ================================== */}


                {activePage === "AI Assistant" && (
                    <VoiceAssistant />
                )}


                {activePage === "Music Player" && (
                    <MusicPlayer onClose={() => setActivePage("Dashboard")} />
                )}


                {activePage === "Inventory" && (
                    <Inventory />
                )}


                {activePage === "Sales" && (
                    <Sales />
                )}


                {activePage === "Expenses" && (
                    <Expenses />
                )}


                {activePage === "Customers" && (
                    <Customers />
                )}


                {activePage === "Payments" && (
                    <Payments />
                )}


                {activePage === "Reports" && (
                    <Reports />
                )}


                {/* SETTINGS PAGE */}

                {activePage === "Settings" && (
                    <SettingsPage />
                )}


                {/* HELP & SUPPORT PAGE */}

                {activePage === "Help & Support" && (
                    <HelpSupport />
                )}


                {/* SUPPORT REQUESTS MANAGEMENT PAGE */}

                {activePage === "Support Requests" && (
                    <SupportRequests />
                )}

            </main>

        </div>

    );

}

export default App;