const db = require("../config/db");

// ==========================================
// GET ALL PRODUCTS
// ==========================================

exports.getProducts = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM products ORDER BY product_id DESC"
        );

        res.json({
            success: true,
            count: result.rows.length,
            products: result.rows
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch products",
            error: err.message
        });
    }
};


// ==========================================
// ADD A NEW PRODUCT
// ==========================================

exports.addProduct = async (req, res) => {
    try {
        const {
            product_name,
            category,
            quantity,
            price,
            low_stock_limit
        } = req.body;

        if (
            !product_name ||
            !product_name.trim() ||
            price === undefined ||
            quantity === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Product name, quantity and price are required."
            });
        }

        const productQuantity = Number(quantity);
        const productPrice = Number(price);
        const stockLimit = Number(low_stock_limit ?? 5);

        if (
            !Number.isInteger(productQuantity) ||
            productQuantity < 0 ||
            !Number.isFinite(productPrice) ||
            productPrice < 0 ||
            !Number.isInteger(stockLimit) ||
            stockLimit < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter valid quantity, price and stock limit."
            });
        }

        const result = await db.query(
            `INSERT INTO products
             (product_name, category, quantity, price, low_stock_limit)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING product_id`,
            [
                product_name.trim(),
                category || "General",
                productQuantity,
                productPrice,
                stockLimit
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product added successfully!",
            product_id: result.rows[0].product_id
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to add product",
            error: err.message
        });
    }
};


// ==========================================
// UPDATE PRODUCT DETAILS
// ==========================================

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            product_name,
            category,
            quantity,
            price,
            low_stock_limit
        } = req.body;

        if (
            !product_name ||
            !product_name.trim() ||
            quantity === undefined ||
            price === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Product name, quantity and price are required."
            });
        }

        const productQuantity = Number(quantity);
        const productPrice = Number(price);
        const stockLimit = Number(low_stock_limit ?? 5);

        if (
            !Number.isInteger(productQuantity) ||
            productQuantity < 0 ||
            !Number.isFinite(productPrice) ||
            productPrice < 0 ||
            !Number.isInteger(stockLimit) ||
            stockLimit < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter valid product details."
            });
        }

        const result = await db.query(
            `UPDATE products
             SET product_name = $1,
                 category = $2,
                 quantity = $3,
                 price = $4,
                 low_stock_limit = $5
             WHERE product_id = $6`,
            [
                product_name.trim(),
                category || "General",
                productQuantity,
                productPrice,
                stockLimit,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully!"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to update product",
            error: err.message
        });
    }
};


// ==========================================
// GET LOW-STOCK PRODUCTS
// ==========================================

exports.getLowStockProducts = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT *
             FROM products
             WHERE quantity <= low_stock_limit
             ORDER BY quantity ASC`
        );

        res.json({
            success: true,
            count: result.rows.length,
            products: result.rows
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch low-stock products",
            error: err.message
        });
    }
};