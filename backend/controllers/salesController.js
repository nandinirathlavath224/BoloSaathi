const db = require("../config/db");

// Get all sales
exports.getSales = (req, res) => {
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

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch sales",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            sales: results
        });
    });
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

    const connection = db.promise();

    try {
        await connection.beginTransaction();

        let totalAmount = 0;
        const saleItems = [];

        for (const item of items) {
            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error("Product quantity must be a positive whole number.");
            }

            const [products] = await connection.execute(
                "SELECT product_id, product_name, quantity, price FROM products WHERE product_id = ? FOR UPDATE",
                [item.product_id]
            );

            if (products.length === 0) {
                throw new Error(`Product ${item.product_id} was not found.`);
            }

            const product = products[0];

            if (product.quantity < quantity) {
                throw new Error(`Insufficient stock for ${product.product_name}.`);
            }

            const price = Number(product.price);
            const subtotal = price * quantity;

            totalAmount += subtotal;

            saleItems.push({
                product_id: product.product_id,
                quantity,
                price
            });

            await connection.execute(
                "UPDATE products SET quantity = quantity - ? WHERE product_id = ?",
                [quantity, product.product_id]
            );
        }

        const [saleResult] = await connection.execute(
            "INSERT INTO sales (customer_id, total_amount, payment_method) VALUES (?, ?, ?)",
            [customer_id || null, totalAmount, payment_method || "Cash"]
        );

        const saleId = saleResult.insertId;

        for (const item of saleItems) {
            await connection.execute(
                "INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
                [saleId, item.product_id, item.quantity, item.price]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Sale recorded successfully!",
            sale_id: saleId,
            total_amount: totalAmount
        });

    } catch (error) {
        await connection.rollback();

        res.status(400).json({
            success: false,
            message: error.message
        });

    } finally {
       
    }
};