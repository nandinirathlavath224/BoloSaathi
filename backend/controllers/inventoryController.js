const db = require("../config/db");

// Get all products
exports.getProducts = (req, res) => {
    const sql = "SELECT * FROM products ORDER BY product_id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch products",
                error: err.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            products: results
        });
    });
};

// Add a new product
exports.addProduct = (req, res) => {
    const {
        product_name,
        category,
        quantity,
        price,
        low_stock_limit
    } = req.body;

    if (!product_name || price === undefined || quantity === undefined) {
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

    const sql = `
        INSERT INTO products
        (product_name, category, quantity, price, low_stock_limit)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            product_name.trim(),
            category || "General",
            productQuantity,
            productPrice,
            stockLimit
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to add product",
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Product added successfully!",
                product_id: result.insertId
            });
        }
    );
};

// Update product details
exports.updateProduct = (req, res) => {
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

    const sql = `
        UPDATE products
        SET product_name = ?,
            category = ?,
            quantity = ?,
            price = ?,
            low_stock_limit = ?
        WHERE product_id = ?
    `;

    db.query(
        sql,
        [
            product_name.trim(),
            category || "General",
            productQuantity,
            productPrice,
            stockLimit,
            id
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to update product",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });
            }

            res.json({
                success: true,
                message: "Product updated successfully!"
            });
        }
    );
};

// Get low-stock products
exports.getLowStockProducts = (req, res) => {
    const sql = `
        SELECT *
        FROM products
        WHERE quantity <= low_stock_limit
        ORDER BY quantity ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch low-stock products",
                error: err.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            products: results
        });
    });
};