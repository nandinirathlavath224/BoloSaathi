// ==========================================
// BOLOSAATHI - SUPPORT REQUEST ROUTES
// COMPLETE SUPPORT MANAGEMENT
// ==========================================

const express = require("express");

const router = express.Router();

const db = require("../config/db");

// ==========================================
// SUPPORT CONTROLLER
// ==========================================

const {

    createSupportRequest,

    getSupportRequests,

    updateSupportStatus,

    updateSupportSolution,

    deleteSupportRequest

} = require("../controllers/supportController");

// ==========================================
// AI SUPPORT CONTROLLER
// ==========================================

const {

    regenerateSolutionForRequest

} = require("../controllers/aiSupportController");

// ==========================================
// EMAIL SERVICE
// ==========================================

const {

    sendSupportSolutionEmail

} = require("../config/email");

// ==========================================
// DATABASE PROMISE HELPER
// ==========================================

const queryDatabase = (sql, values = []) => {

    return new Promise((resolve, reject) => {

        db.query(sql, values, (error, results) => {

            if (error) {

                return reject(error);

            }

            resolve(results);

        });

    });

};

// ==========================================
// 1. CREATE SUPPORT REQUEST
// ==========================================

router.post("/", createSupportRequest);

// ==========================================
// 2. GET ALL SUPPORT REQUESTS
// ==========================================

router.get("/", getSupportRequests);

// ==========================================
// 3. UPDATE SUPPORT REQUEST STATUS
// ==========================================

router.put("/:request_id", updateSupportStatus);

// ==========================================
// 4. UPDATE SUPPORT REQUEST SOLUTION
// ==========================================

router.put("/:request_id/solution", updateSupportSolution);

// ==========================================
// 5. DELETE ENTIRE SUPPORT REQUEST
// ==========================================

router.delete("/:request_id", deleteSupportRequest);

// ==========================================
// 6. REGENERATE AI SOLUTION + EMAIL CUSTOMER
// ==========================================

router.post("/:request_id/regenerate", async (req, res) => {

    try {

        const requestId = Number(req.params.request_id);

        if (
            !Number.isInteger(requestId) ||
            requestId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid support request ID."

            });

        }

        console.log(
            `Regenerating AI solution for Request #${requestId}`
        );

        // CHECK WHETHER REQUEST EXISTS

        const existingRequests = await queryDatabase(
            `SELECT request_id
             FROM support_requests
             WHERE request_id = ?`,
            [requestId]
        );

        if (!existingRequests.length) {

            return res.status(404).json({

                success: false,

                message: "Support request not found."

            });

        }

        // GENERATE AND SAVE NEW AI SOLUTION

        const solution =
            await regenerateSolutionForRequest(requestId);

        // FETCH CUSTOMER INFORMATION

        const customers = await queryDatabase(
            `SELECT name, email, subject, message
             FROM support_requests
             WHERE request_id = ?`,
            [requestId]
        );

        if (!customers.length) {

            return res.status(404).json({

                success: false,

                message: "Support request not found."

            });

        }

        const customer = customers[0];

        // UPDATE STATUS TO RESOLVED

        await queryDatabase(
            `UPDATE support_requests
             SET status = 'Resolved'
             WHERE request_id = ?`,
            [requestId]
        );

        console.log(
            `Support Request #${requestId} status changed to Resolved.`
        );

        // SEND UPDATED SOLUTION THROUGH EMAIL

        let emailSent = false;

        try {

            await sendSupportSolutionEmail({

                to: customer.email,

                name: customer.name,

                requestId: requestId,

                subject: customer.subject,

                message: customer.message,

                solution: solution

            });

            emailSent = true;

            console.log(
                `Updated solution email sent to ${customer.email}`
            );

        } catch (emailError) {

            console.error(
                "Regenerated Solution Email Error:",
                emailError.message
            );

        }

        // SUCCESS RESPONSE

        return res.status(200).json({

            success: true,

            message: emailSent
                ? "AI solution regenerated and customer notified by email!"
                : "AI solution regenerated, but email could not be delivered.",

            solution: solution,

            status: "Resolved",

            email_sent: emailSent

        });

    } catch (error) {

        console.error(
            "Regenerate Support Solution Error:",
            error.message
        );

        return res.status(500).json({

            success: false,

            message: "Unable to regenerate AI solution.",

            error: error.message

        });

    }

});

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;