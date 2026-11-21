const db = require("../config/db");

// Get all customers
exports.getCustomers = (req, res) => {
    const sql = "SELECT * FROM customers ORDER BY customer_id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch customers",
                error: err.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            customers: results
        });
    });
};

// Add a new customer
exports.addCustomer = (req, res) => {
    const { customer_name, phone, address } = req.body;

    if (!customer_name || !customer_name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Customer name is required."
        });
    }

    const sql = `
        INSERT INTO customers (customer_name, phone, address)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [customer_name.trim(), phone || null, address || null],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to add customer",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Customer added successfully!",
                customer_id: result.insertId
            });
        }
    );
};

// Search customers
exports.searchCustomers = (req, res) => {
    const search = req.query.q;

    if (!search || !search.trim()) {
        return res.status(400).json({
            success: false,
            message: "Please enter a customer name or phone number."
        });
    }

    const sql = `
        SELECT *
        FROM customers
        WHERE customer_name LIKE ? OR phone LIKE ?
        ORDER BY customer_id DESC
    `;

    const searchValue = `%${search.trim()}%`;

    db.query(sql, [searchValue, searchValue], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Customer search failed",
                error: err.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            customers: results
        });
    });
};

// Update customer
exports.updateCustomer = (req, res) => {
    const { id } = req.params;
    const { customer_name, phone, address } = req.body;

    if (!customer_name || !customer_name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Customer name is required."
        });
    }

    const sql = `
        UPDATE customers
        SET customer_name = ?, phone = ?, address = ?
        WHERE customer_id = ?
    `;

    db.query(
        sql,
        [customer_name.trim(), phone || null, address || null, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to update customer",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found."
                });
            }

            res.json({
                success: true,
                message: "Customer updated successfully!"
            });
        }
    );
};

// Delete customer
exports.deleteCustomer = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM customers WHERE customer_id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to delete customer",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        res.json({
            success: true,
            message: "Customer deleted successfully!"
        });
    });
};