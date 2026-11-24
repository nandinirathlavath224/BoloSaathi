
import React, { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  RefreshCw,
  Receipt,
  TrendingDown,
  AlertCircle
} from "lucide-react";
import { API_URL } from "./api";

import "./Expenses.css";



function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    expense_name: "",
    amount: "",
    category: "Other",
    description: "",
    payment_method: "Cash"
  });

  const categories = [
    "Rent",
    "Electricity",
    "Transport",
    "Stock Purchase",
    "Salary",
    "Maintenance",
    "Marketing",
    "Other"
  ];

  const paymentMethods = [
    "Cash",
    "UPI",
    "Card",
    "Bank Transfer"
  ];

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load expenses");
      }

      setExpenses(
        Array.isArray(data)
          ? data
          : data.expenses || data.data || []
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/summary`);
      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary || data.data || data);
      }
    } catch (error) {
      console.error("Summary error:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchSummary();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !form.expense_name.trim() ||
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setMessage("Please enter a valid expense name and amount.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add expense");
      }

      setMessage("Expense added successfully!");

      setForm({
        expense_name: "",
        amount: "",
        category: "Other",
        description: "",
        payment_method: "Cash"
      });

      await fetchExpenses();
      await fetchSummary();

    } catch (error) {
      setMessage(error.message);
    }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="expenses-page">

      <div className="expenses-header">
        <div>
          <h1>Expense Management</h1>
          <p>Track and manage your business expenses.</p>
        </div>

        <button
          className="expense-refresh"
          onClick={() => {
            fetchExpenses();
            fetchSummary();
          }}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="expense-stats">

        <div className="expense-stat-card">
          <div className="expense-stat-icon">
            <Wallet />
          </div>
          <div>
            <p>Total Expenses</p>
            <h2>₹{totalExpenses.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="expense-stat-card">
          <div className="expense-stat-icon">
            <Receipt />
          </div>
          <div>
            <p>Total Transactions</p>
            <h2>{expenses.length}</h2>
          </div>
        </div>

        <div className="expense-stat-card">
          <div className="expense-stat-icon">
            <TrendingDown />
          </div>
          <div>
            <p>Monthly Expenses</p>
            <h2>
              ₹{Number(
                summary.monthly_expenses ??
                summary.monthlyExpenses ??
                0
              ).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

      </div>

      {/* ADD EXPENSE FORM */}

      <div className="expense-content">

        <div className="expense-form-card">

          <h2>
            <Plus size={21} />
            Add New Expense
          </h2>

          {message && (
            <div className="expense-message">
              <AlertCircle size={17} />
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label>Expense Name</label>
            <input
              type="text"
              name="expense_name"
              placeholder="Example: Electricity Bill"
              value={form.expense_name}
              onChange={handleChange}
              required
            />

            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />

            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* PAYMENT METHOD */}

            <label>Payment Method</label>
            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
              required
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>

            <label>Description</label>
            <textarea
              name="description"
              placeholder="Enter expense details..."
              value={form.description}
              onChange={handleChange}
              rows="3"
            />

            <button type="submit" className="expense-submit">
              <Plus size={18} />
              Add Expense
            </button>

          </form>
        </div>

        {/* EXPENSE HISTORY */}

        <div className="expense-history-card">

          <div className="expense-history-header">
            <h2>
              <Receipt size={21} />
              Expense History
            </h2>
            <span>{expenses.length} Records</span>
          </div>

          {loading ? (
            <p className="expense-empty">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <div className="expense-empty">
              <Wallet size={40} />
              <h3>No Expenses Yet</h3>
              <p>Your recorded expenses will appear here.</p>
            </div>
          ) : (

            <div className="expense-table-wrapper">

              <table className="expense-table">

                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Category</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.expense_id}>

                      <td>
                        <strong>{expense.expense_name}</strong>

                        {expense.description && (
                          <small>{expense.description}</small>
                        )}
                      </td>

                      <td>
                        <span className="expense-category">
                          {expense.category || "Other"}
                        </span>
                      </td>

                      <td>
                        <span className="expense-category">
                          {expense.payment_method || "Cash"}
                        </span>
                      </td>

                      <td className="expense-amount">
                        ₹{Number(expense.amount).toLocaleString("en-IN")}
                      </td>

                      <td>
                        {formatDate(expense.created_at)}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Expenses;
