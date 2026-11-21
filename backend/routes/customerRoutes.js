const express = require("express");

const router = express.Router();

const {
    getCustomers,
    addCustomer,
    searchCustomers,
    updateCustomer,
    deleteCustomer
} = require("../controllers/customerController");

router.get("/", getCustomers);

router.get("/search", searchCustomers);

router.post("/", addCustomer);

router.put("/:id", updateCustomer);

router.delete("/:id", deleteCustomer);

module.exports = router;