
const db = require("../config/db");

// Get all sales
exports.getSales = async (req, res) => {
    try {
        const sql = `
            SELECT 
                s.sale_id,
                s.customer_id,
                s.total_amount,
                s.payment_method,
                s.created_at
            FROM sales s
            ORDER BY s.created_at DESC
        `;

        const result = await db.query(sql);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            sales: result.rows
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Unable to fetch sales",
            error: err.message
        });
    }
};


// Add a new sale
exports.addSale = async (req, res) => {
    const { customer_id, payment_method, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide at least one product."
        });
    }

    let client;

    try {
        // Get a PostgreSQL client for the transaction
        client = await db.connect();

        await client.query("BEGIN");

        let totalAmount = 0;
        const saleItems = [];

        for (const item of items) {
            const quantity = Number(item.quantity);
            const productId = Number(item.product_id);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error(
                    "Product quantity must be a positive whole number."
                );
            }

            if (!Number.isInteger(productId) || productId <= 0) {
                throw new Error("Invalid product ID.");
            }

            // Fetch product and lock its row
            const productResult = await client.query(
                `SELECT product_id, product_name, quantity, price
                 FROM products
                 WHERE product_id = $1
                 FOR UPDATE`,
                [productId]
            );

            if (productResult.rows.length === 0) {
                throw new Error(`Product ${productId} was not found.`);
            }

            const product = productResult.rows[0];

            if (Number(product.quantity) < quantity) {
                throw new Error(
                    `Insufficient stock for ${product.product_name}.`
                );
            }

            const price = Number(product.price);
            const subtotal = price * quantity;

            totalAmount += subtotal;

            saleItems.push({
                product_id: product.product_id,
                quantity,
                price
            });

            // Reduce product stock
            await client.query(
                `UPDATE products
                 SET quantity = quantity - $1
                 WHERE product_id = $2`,
                [quantity, product.product_id]
            );
        }

        // Insert sale and retrieve generated sale ID
        const saleResult = await client.query(
            `INSERT INTO sales
             (customer_id, total_amount, payment_method)
             VALUES ($1, $2, $3)
             RETURNING sale_id`,
            [
                customer_id || null,
                totalAmount,
                payment_method || "Cash"
            ]
        );

        const saleId = saleResult.rows[0].sale_id;

        // Insert individual sale items
        for (const item of saleItems) {
            await client.query(
                `INSERT INTO sale_items
                 (sale_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [
                    saleId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );
        }

        // Commit transaction
        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Sale recorded successfully!",
            sale_id: saleId,
            total_amount: totalAmount
        });

    } catch (error) {
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback Error:", rollbackError.message);
            }
        }

        res.status(400).json({
            success: false,
            message: error.message
        });

    } finally {
        if (client) {
            client.release();
        }
    }
};
