const db = require("../config/db");

// ==========================================
// GET ALL CUSTOMERS
// ==========================================

exports.getCustomers = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM customers ORDER BY customer_id DESC"
        );

        res.json({
            success: true,
            count: result.rows.length,
            customers: result.rows
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch customers",
            error: err.message
        });
    }
};

// ==========================================
// ADD A NEW CUSTOMER
// ==========================================

exports.addCustomer = async (req, res) => {
    try {
        const { customer_name, phone, address } = req.body;

        if (!customer_name || !customer_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required."
            });
        }

        const result = await db.query(
            `INSERT INTO customers (customer_name, phone, address)
             VALUES ($1, $2, $3)
             RETURNING customer_id`,
            [
                customer_name.trim(),
                phone || null,
                address || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Customer added successfully!",
            customer_id: result.rows[0].customer_id
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to add customer",
            error: err.message
        });
    }
};

// ==========================================
// SEARCH CUSTOMERS
// ==========================================

exports.searchCustomers = async (req, res) => {
    try {
        const search = req.query.q;

        if (!search || !search.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a customer name or phone number."
            });
        }

        const searchValue = `%${search.trim()}%`;

        const result = await db.query(
            `SELECT *
             FROM customers
             WHERE customer_name ILIKE $1
                OR phone ILIKE $2
             ORDER BY customer_id DESC`,
            [searchValue, searchValue]
        );

        res.json({
            success: true,
            count: result.rows.length,
            customers: result.rows
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Customer search failed",
            error: err.message
        });
    }
};

// ==========================================
// UPDATE CUSTOMER
// ==========================================

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { customer_name, phone, address } = req.body;

        if (!customer_name || !customer_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required."
            });
        }

        const result = await db.query(
            `UPDATE customers
             SET customer_name = $1,
                 phone = $2,
                 address = $3
             WHERE customer_id = $4`,
            [
                customer_name.trim(),
                phone || null,
                address || null,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        res.json({
            success: true,
            message: "Customer updated successfully!"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to update customer",
            error: err.message
        });
    }
};

// ==========================================
// DELETE CUSTOMER
// ==========================================

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "DELETE FROM customers WHERE customer_id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        res.json({
            success: true,
            message: "Customer deleted successfully!"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to delete customer",
            error: err.message
        });
    }
};