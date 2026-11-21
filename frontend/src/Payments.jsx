import React, { useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  RefreshCw,
  IndianRupee,
  CheckCircle,
  Clock,
  CreditCard
} from "lucide-react";

import "./Payments.css";

const API_URL = "http://localhost:5000/api";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    amount: "",
    payment_status: "Paid"
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [paymentResponse, customerResponse] = await Promise.all([
        fetch(`${API_URL}/payments`),
        fetch(`${API_URL}/customers`)
      ]);

      const paymentData = await paymentResponse.json();
      const customerData = await customerResponse.json();

      if (!paymentResponse.ok) {
        throw new Error("Unable to load payments");
      }

      if (!customerResponse.ok) {
        throw new Error("Unable to load customers");
      }

      setPayments(
        Array.isArray(paymentData)
          ? paymentData
          : paymentData.payments || paymentData.data || []
      );

      setCustomers(
        Array.isArray(customerData)
          ? customerData
          : customerData.customers || customerData.data || []
      );

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addPayment = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.customer_id || !form.amount || Number(form.amount) <= 0) {
      setMessage("Please select a customer and enter a valid amount.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_id: Number(form.customer_id),
          amount: Number(form.amount),
          payment_status: form.payment_status
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add payment");
      }

      setMessage("Payment recorded successfully!");

      setForm({
        customer_id: "",
        amount: "",
        payment_status: "Paid"
      });

      await fetchData();

    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateStatus = async (paymentId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/payments/${paymentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            payment_status: status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update payment status");
      }

      setMessage("Payment status updated successfully!");
      await fetchData();

    } catch (error) {
      setMessage(error.message);
    }
  };

  const totalAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const paidAmount = payments
    .filter((payment) =>
      String(payment.payment_status).toLowerCase() === "paid"
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const pendingAmount = payments
    .filter((payment) =>
      String(payment.payment_status).toLowerCase() === "pending"
    )
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="payments-page">

      <div className="payments-header">
        <div>
          <h1>Payment Management</h1>
          <p>Track customer payments and outstanding amounts.</p>
        </div>

        <button className="payment-refresh" onClick={fetchData}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* SUMMARY */}

      <div className="payment-stats">

        <div className="payment-stat-card">
          <div className="payment-stat-icon">
            <Wallet />
          </div>
          <div>
            <p>Total Payments</p>
            <h2>₹{totalAmount.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon paid-icon">
            <CheckCircle />
          </div>
          <div>
            <p>Paid Amount</p>
            <h2>₹{paidAmount.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="payment-stat-icon pending-icon">
            <Clock />
          </div>
          <div>
            <p>Pending Amount</p>
            <h2>₹{pendingAmount.toLocaleString("en-IN")}</h2>
          </div>
        </div>

      </div>

      {message && (
        <div className="payment-message">
          {message}
        </div>
      )}

      <div className="payment-layout">

        {/* ADD PAYMENT */}

        <div className="payment-form-card">

          <h2>
            <Plus size={21} />
            Record Payment
          </h2>

          <form onSubmit={addPayment}>

            <label>Select Customer</label>

            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose customer</option>

              {customers.map((customer) => (
                <option
                  key={customer.customer_id}
                  value={customer.customer_id}
                >
                  {customer.customer_name}
                </option>
              ))}
            </select>

            <label>Payment Amount (₹)</label>

            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange}
              required
            />

            <label>Payment Status</label>

            <select
              name="payment_status"
              value={form.payment_status}
              onChange={handleChange}
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>

            <button type="submit" className="payment-submit">
              <CreditCard size={18} />
              Record Payment
            </button>

          </form>

          {customers.length === 0 && (
            <p className="payment-note">
              Add a customer in Customer Management before recording a payment.
            </p>
          )}

        </div>

        {/* PAYMENT HISTORY */}

        <div className="payment-history-card">

          <div className="payment-history-header">
            <h2>Payment History</h2>
            <span>{payments.length} Records</span>
          </div>

          {loading ? (
            <div className="payment-empty">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="payment-empty">
              <Wallet size={42} />
              <h3>No Payments Yet</h3>
              <p>Your payment records will appear here.</p>
            </div>
          ) : (

            <div className="payment-table-wrapper">
              <table className="payment-table">

                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Update</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.payment_id}>

                      <td>
                        {payment.customer_name || `Customer #${payment.customer_id}`}
                      </td>

                      <td className="payment-amount">
                        ₹{Number(payment.amount).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <span
                          className={`payment-status ${
                            String(payment.payment_status).toLowerCase()
                          }`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>

                      <td>
                        {formatDate(payment.payment_date)}
                      </td>

                      <td>
                        <select
                          className="payment-status-select"
                          value={payment.payment_status}
                          onChange={(e) =>
                            updateStatus(payment.payment_id, e.target.value)
                          }
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                        </select>
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

export default Payments;