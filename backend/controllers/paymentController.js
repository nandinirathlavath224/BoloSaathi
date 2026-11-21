const db = require("../config/db");

// 1. Get all payments
const getPayments = (req, res) => {
    const sql = `
        SELECT 
            p.payment_id,
            p.customer_id,
            c.customer_name,
            c.phone,
            p.amount,
            p.payment_status,
            p.payment_date
        FROM payments p
        JOIN customers c ON p.customer_id = c.customer_id
        ORDER BY p.payment_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch payments",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            payments: results
        });
    });
};


// 2. Add a payment record
const addPayment = (req, res) => {
    const { customer_id, amount, payment_status } = req.body;

    const validStatuses = ["Pending", "Paid", "Partial"];
    const status = payment_status || "Pending";

    if (
        !customer_id ||
        !Number.isInteger(Number(customer_id)) ||
        Number(customer_id) <= 0 ||
        amount === undefined ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0 ||
        !validStatuses.includes(status)
    ) {
        return res.status(400).json({
            success: false,
            message: "Enter a valid customer ID, amount, and payment status."
        });
    }

    const sql = `
        INSERT INTO payments
        (customer_id, amount, payment_status)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [Number(customer_id), Number(amount), status],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to add payment",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Payment record added successfully!",
                payment_id: result.insertId
            });
        }
    );
};


// 3. Get payments for a particular customer
const getCustomerPayments = (req, res) => {
    const customerId = Number(req.params.customerId);

    if (!Number.isInteger(customerId) || customerId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid customer ID"
        });
    }

    const sql = `
        SELECT *
        FROM payments
        WHERE customer_id = ?
        ORDER BY payment_date DESC
    `;

    db.query(sql, [customerId], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch customer payments",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            payments: results
        });
    });
};


// 4. Update payment status
const updatePaymentStatus = (req, res) => {
    const paymentId = Number(req.params.id);
    const { payment_status } = req.body;

    const validStatuses = ["Pending", "Paid", "Partial"];

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment ID"
        });
    }

    if (!validStatuses.includes(payment_status)) {
        return res.status(400).json({
            success: false,
            message: "Status must be Pending, Paid, or Partial"
        });
    }

    const sql = `
        UPDATE payments
        SET payment_status = ?
        WHERE payment_id = ?
    `;

    db.query(sql, [payment_status, paymentId], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to update payment status",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment status updated successfully!"
        });
    });
};


module.exports = {
    getPayments,
    addPayment,
    getCustomerPayments,
    updatePaymentStatus
};