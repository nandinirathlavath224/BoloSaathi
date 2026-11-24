
// ==========================================
// BOLOSAATHI - SUPPORT REQUEST CONTROLLER
// AI SOLUTIONS + AUTOMATIC EMAIL NOTIFICATIONS
// POSTGRESQL VERSION
// ==========================================

const db = require("../config/db");

const {
    generateSolutionForRequest
} = require("./aiSupportController");

const {
    sendSupportSolutionEmail
} = require("../config/email");

// ==========================================
// SEND CUSTOMER EMAIL SAFELY
// ==========================================

const notifyCustomer = async (details) => {
    try {
        await sendSupportSolutionEmail(details);

        console.log(
            `Support notification email sent to ${details.to}`
        );

        return true;

    } catch (error) {
        console.error(
            "Support Email Notification Error:",
            error.message
        );

        return false;
    }
};


// ==========================================
// 1. CREATE SUPPORT REQUEST
// ==========================================

const createSupportRequest = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !subject?.trim() ||
            !message?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields."
            });
        }

        const sql = `
            INSERT INTO support_requests
            (name, email, subject, message, status)
            VALUES ($1, $2, $3, $4, 'Pending')
            RETURNING request_id
        `;

        const result = await db.query(sql, [
            name.trim(),
            email.trim(),
            subject.trim(),
            message.trim()
        ]);

        const requestId = result.rows[0].request_id;

        console.log(
            `Support Request #${requestId} submitted.`
        );

        // GENERATE AI SOLUTION
        try {
            const solution =
                await generateSolutionForRequest(requestId);

            console.log(
                `Gemini AI solution generated for Request #${requestId}.`
            );

            // UPDATE REQUEST STATUS
            await db.query(
                `UPDATE support_requests
                 SET status = 'Resolved'
                 WHERE request_id = $1`,
                [requestId]
            );

            // SEND CUSTOMER EMAIL
            const emailSent = await notifyCustomer({
                to: email.trim(),
                name: name.trim(),
                requestId: requestId,
                subject: subject.trim(),
                message: message.trim(),
                solution: solution
            });

            console.log(
                `Support Request #${requestId} status changed to Resolved.`
            );

            return res.status(201).json({
                success: true,
                message: "Support request successfully processed!",
                request_id: requestId,
                solution: solution,
                ai_generated: true,
                email_sent: emailSent,
                status: "Resolved"
            });

        } catch (aiError) {
            console.error(
                "Automatic AI Solution Error:",
                aiError.message
            );

            return res.status(201).json({
                success: true,
                message: "Support request submitted, but AI solution generation failed.",
                request_id: requestId,
                solution: null,
                ai_generated: false,
                email_sent: false,
                status: "Pending"
            });
        }

    } catch (error) {
        console.error(
            "Create Support Request Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to submit support request.",
            error: error.message
        });
    }
};


// ==========================================
// 2. GET ALL SUPPORT REQUESTS
// ==========================================

const getSupportRequests = async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM support_requests
            ORDER BY created_at DESC
        `;

        const result = await db.query(sql);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            requests: result.rows
        });

    } catch (error) {
        console.error(
            "Get Support Requests Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve support requests.",
            error: error.message
        });
    }
};


// ==========================================
// 3. UPDATE SUPPORT REQUEST STATUS
// ==========================================

const updateSupportStatus = async (req, res) => {
    try {
        const requestId = Number(req.params.request_id);
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Resolved"
        ];

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid support request ID."
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid support request status."
            });
        }

        const sql = `
            UPDATE support_requests
            SET status = $1
            WHERE request_id = $2
        `;

        const result = await db.query(sql, [
            status,
            requestId
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Support request not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Support request status updated successfully!",
            status: status
        });

    } catch (error) {
        console.error(
            "Update Support Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update support request status.",
            error: error.message
        });
    }
};


// ==========================================
// 4. UPDATE SUPPORT REQUEST SOLUTION
// ==========================================

const updateSupportSolution = async (req, res) => {
    try {
        const requestId = Number(req.params.request_id);
        const { solution } = req.body;

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid support request ID."
            });
        }

        if (!solution || !solution.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a solution."
            });
        }

        const updateResult = await db.query(
            `UPDATE support_requests
             SET solution = $1
             WHERE request_id = $2`,
            [solution.trim(), requestId]
        );

        if (updateResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Support request not found."
            });
        }

        // GET CUSTOMER DETAILS FOR EMAIL
        const customerResult = await db.query(
            `SELECT name, email, subject, message
             FROM support_requests
             WHERE request_id = $1`,
            [requestId]
        );

        if (customerResult.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Solution saved, but customer email could not be prepared.",
                email_sent: false
            });
        }

        const customer = customerResult.rows[0];

        // SEND UPDATED SOLUTION EMAIL
        const emailSent = await notifyCustomer({
            to: customer.email,
            name: customer.name,
            requestId: requestId,
            subject: customer.subject,
            message: customer.message,
            solution: solution.trim()
        });

        return res.status(200).json({
            success: true,
            message: emailSent
                ? "Solution saved and customer notified by email!"
                : "Solution saved, but email could not be delivered.",
            email_sent: emailSent
        });

    } catch (error) {
        console.error(
            "Update Support Solution Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to save solution.",
            error: error.message
        });
    }
};


// ==========================================
// 5. DELETE ENTIRE SUPPORT REQUEST
// ==========================================

const deleteSupportRequest = async (req, res) => {
    try {
        const requestId = Number(req.params.request_id);

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid support request ID."
            });
        }

        const result = await db.query(
            `DELETE FROM support_requests
             WHERE request_id = $1`,
            [requestId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Support request not found."
            });
        }

        console.log(
            `Entire Support Request #${requestId} deleted successfully.`
        );

        return res.status(200).json({
            success: true,
            message: "Entire support request deleted successfully.",
            request_id: requestId
        });

    } catch (error) {
        console.error(
            "Delete Support Request Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete support request.",
            error: error.message
        });
    }
};


// ==========================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
    createSupportRequest,
    getSupportRequests,
    updateSupportStatus,
    updateSupportSolution,
    deleteSupportRequest
};