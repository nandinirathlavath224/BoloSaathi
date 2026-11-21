const express = require("express");
const router = express.Router();

const {
    getPayments,
    addPayment,
    getCustomerPayments,
    updatePaymentStatus
} = require("../controllers/paymentController");

router.get("/", getPayments);

router.post("/", addPayment);

router.get("/customer/:customerId", getCustomerPayments);

router.patch("/:id/status", updatePaymentStatus);

module.exports = router;