import React, { useState } from "react";

import {
    Search,
    MessageCircle,
    BookOpen,
    ShoppingCart,
    Wallet,
    Package,
    Users,
    CreditCard,
    BarChart3,
    Mic,
    ChevronDown,
    ChevronUp,
    Send,
    HelpCircle,
    Mail,
    Headphones
} from "lucide-react";

import "./HelpSupport.css";

function HelpSupport() {
    const [search, setSearch] = useState("");
    const [openFAQ, setOpenFAQ] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const faqs = [
        {
            question: "How do I get started with BoloSaathi?",
            answer: "Start by updating your business information in Settings. Then you can manage sales, expenses, inventory, customers and payments from the dashboard."
        },
        {
            question: "How can I add a new sale?",
            answer: "Open the Sales section, enter the customer and sale details, select the payment method and save your transaction."
        },
        {
            question: "How can I record business expenses?",
            answer: "Go to Expenses, enter the expense amount, category and payment method, then save the expense."
        },
        {
            question: "How do I check my business profit?",
            answer: "Open the AI Assistant and ask questions such as 'What is my profit today?' or 'What is my total profit?' You can also check Reports."
        },
        {
            question: "How does the voice assistant work?",
            answer: "Select your preferred language, such as English, Telugu, Hindi or Tamil. Click Start Speaking and ask about your sales, expenses or profits."
        },
        {
            question: "How can I manage my inventory?",
            answer: "Open Inventory to manage products, available quantities and low-stock information."
        },
        {
            question: "Can I view my previous transactions?",
            answer: "Yes. You can check your previous sales and expenses in their respective sections and review available business information in Reports."
        },
        {
            question: "How can I change my language?",
            answer: "Use the language selector available in the application or the AI Assistant to choose your preferred language."
        }
    ];

    const modules = [
        { name: "Sales", icon: ShoppingCart, description: "Manage sales and transactions." },
        { name: "Expenses", icon: Wallet, description: "Record and track expenses." },
        { name: "Inventory", icon: Package, description: "Manage products and stock." },
        { name: "Customers", icon: Users, description: "Manage customer information." },
        { name: "Payments", icon: CreditCard, description: "Manage business payments." },
        { name: "Reports", icon: BarChart3, description: "Understand business performance." },
        { name: "AI Assistant", icon: Mic, description: "Ask questions using your voice." }
    ];

    const filteredFAQs = faqs.filter((faq) =>
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase())
    );

    // Submit support request to backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitted(false);
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/support", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to submit your request.");
            }

            setSubmitted(true);

            setForm({
                name: "",
                email: "",
                subject: "",
                message: ""
            });

        } catch (err) {
            console.error("Support submission error:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="help-page">

            {/* HEADER */}
            <div className="help-header">
                <div>
                    <span className="help-badge">
                        <HelpCircle size={15} /> HELP CENTRE
                    </span>

                    <h1>How can we help you?</h1>

                    <p>
                        Find answers, explore guides and get help using BoloSaathi.
                    </p>
                </div>

                <div className="help-header-icon">
                    <Headphones size={65} />
                </div>
            </div>

            {/* SEARCH */}
            <div className="help-search-box">
                <Search size={21} />

                <input
                    type="text"
                    placeholder="Search for help, questions or topics..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* QUICK SUPPORT CARDS */}
            <div className="help-section-title">
                <h2>Explore Help Topics</h2>
                <p>Get assistance with different business modules.</p>
            </div>

            <div className="help-module-grid">
                {modules.map((module, index) => {
                    const Icon = module.icon;

                    return (
                        <div className="help-module-card" key={index}>
                            <div className="help-module-icon">
                                <Icon size={23} />
                            </div>

                            <h3>{module.name}</h3>
                            <p>{module.description}</p>
                        </div>
                    );
                })}
            </div>

            {/* FAQ */}
            <div className="help-section-title faq-heading">
                <h2>
                    <BookOpen size={23} /> Frequently Asked Questions
                </h2>

                <p>Find quick answers to common questions.</p>
            </div>

            <div className="faq-container">

                {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                        <div className="faq-item" key={index}>

                            <button
                                type="button"
                                className="faq-question"
                                onClick={() =>
                                    setOpenFAQ(openFAQ === index ? null : index)
                                }
                            >
                                <span>{faq.question}</span>

                                {openFAQ === index
                                    ? <ChevronUp size={20} />
                                    : <ChevronDown size={20} />
                                }
                            </button>

                            {openFAQ === index && (
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <div className="no-faq">
                        No matching questions found. Try another search.
                    </div>
                )}

            </div>

            {/* CONTACT SUPPORT */}
            <div className="support-section">

                <div className="support-info">
                    <div className="support-icon">
                        <MessageCircle size={30} />
                    </div>

                    <h2>Still need help?</h2>

                    <p>
                        Tell us what you need help with. Submit your issue
                        and your request will be saved in BoloSaathi.
                    </p>

                    <div className="support-feature">
                        <Mail size={19} />
                        <span>Support request form</span>
                    </div>

                    <div className="support-feature">
                        <Headphones size={19} />
                        <span>Assistance with BoloSaathi modules</span>
                    </div>
                </div>

                <form className="support-form" onSubmit={handleSubmit}>

                    <h3>Submit a Support Request</h3>

                    {submitted && (
                        <div className="support-success">
                            Your support request has been submitted successfully!
                            Your request ID is saved in our database.
                        </div>
                    )}

                    {error && (
                        <div className="support-error">
                            {error}
                        </div>
                    )}

                    <label>Your Name</label>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                        required
                    />

                    <label>Email Address</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                        required
                    />

                    <label>Subject</label>

                    <input
                        type="text"
                        placeholder="What do you need help with?"
                        value={form.subject}
                        onChange={(e) =>
                            setForm({ ...form, subject: e.target.value })
                        }
                        required
                    />

                    <label>Describe Your Issue</label>

                    <textarea
                        placeholder="Explain your issue here..."
                        rows="4"
                        value={form.message}
                        onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="support-submit"
                        disabled={loading}
                    >
                        <Send size={17} />
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default HelpSupport;