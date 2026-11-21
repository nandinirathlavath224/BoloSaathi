const express = require("express");

const router = express.Router();

const {
    getProducts,
    addProduct,
    updateProduct,
    getLowStockProducts
} = require("../controllers/inventoryController");

// View all products
router.get("/", getProducts);

// View low-stock products
router.get("/low-stock", getLowStockProducts);

// Add product
router.post("/", addProduct);

// Update product
router.put("/:id", updateProduct);

module.exports = router;