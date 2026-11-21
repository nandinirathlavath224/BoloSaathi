// ==========================================
// BOLOSAATHI - SUPPORT REQUEST CONTROLLER
// AI SOLUTIONS + AUTOMATIC EMAIL NOTIFICATIONS
// COMPLETE SUPPORT MANAGEMENT
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

const createSupportRequest = (req, res) => {

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
        VALUES (?, ?, ?, ?, 'Pending')
    `;

    db.query(
        sql,
        [
            name.trim(),
            email.trim(),
            subject.trim(),
            message.trim()
        ],
        async (err, result) => {

            if (err) {

                console.error(
                    "Create Support Request Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to submit support request."
                });

            }

            const requestId = result.insertId;

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

                const updateSql = `
                    UPDATE support_requests
                    SET status = 'Resolved'
                    WHERE request_id = ?
                `;

                db.query(
                    updateSql,
                    [requestId],
                    async (statusError) => {

                        // SEND CUSTOMER EMAIL

                        const emailSent = await notifyCustomer({

                            to: email.trim(),

                            name: name.trim(),

                            requestId: requestId,

                            subject: subject.trim(),

                            message: message.trim(),

                            solution: solution

                        });

                        if (statusError) {

                            console.error(
                                "Automatic Status Update Error:",
                                statusError
                            );

                            return res.status(201).json({

                                success: true,

                                message: "AI solution generated, but status update failed.",

                                request_id: requestId,

                                solution: solution,

                                ai_generated: true,

                                email_sent: emailSent,

                                status: "Pending"

                            });

                        }

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

                    }
                );

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

        }
    );

};

// ==========================================
// 2. GET ALL SUPPORT REQUESTS
// ==========================================

const getSupportRequests = (req, res) => {

    const sql = `
        SELECT *
        FROM support_requests
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Get Support Requests Error:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to retrieve support requests."
            });

        }

        return res.status(200).json({

            success: true,

            count: results.length,

            requests: results

        });

    });

};

// ==========================================
// 3. UPDATE SUPPORT REQUEST STATUS
// ==========================================

const updateSupportStatus = (req, res) => {

    const { request_id } = req.params;

    const { status } = req.body;

    const allowedStatuses = [
        "Pending",
        "In Progress",
        "Resolved"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            success: false,
            message: "Invalid support request status."
        });

    }

    const sql = `
        UPDATE support_requests
        SET status = ?
        WHERE request_id = ?
    `;

    db.query(
        sql,
        [status, request_id],
        (err, result) => {

            if (err) {

                console.error(
                    "Update Support Status Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to update support request status."
                });

            }

            if (result.affectedRows === 0) {

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

        }
    );

};

// ==========================================
// 4. UPDATE SUPPORT REQUEST SOLUTION
// ==========================================

const updateSupportSolution = (req, res) => {

    const { request_id } = req.params;

    const { solution } = req.body;

    if (!solution || !solution.trim()) {

        return res.status(400).json({
            success: false,
            message: "Please enter a solution."
        });

    }

    const sql = `
        UPDATE support_requests
        SET solution = ?
        WHERE request_id = ?
    `;

    db.query(
        sql,
        [solution.trim(), request_id],
        (err, result) => {

            if (err) {

                console.error(
                    "Update Support Solution Error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to save solution."
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Support request not found."
                });

            }

            // GET CUSTOMER DETAILS FOR EMAIL

            const customerSql = `
                SELECT name, email, subject, message
                FROM support_requests
                WHERE request_id = ?
            `;

            db.query(
                customerSql,
                [request_id],
                async (customerError, customers) => {

                    if (customerError || !customers.length) {

                        console.error(
                            "Customer Details Fetch Error:",
                            customerError
                        );

                        return res.status(200).json({

                            success: true,

                            message: "Solution saved, but customer email could not be prepared.",

                            email_sent: false

                        });

                    }

                    const customer = customers[0];

                    // SEND UPDATED SOLUTION EMAIL

                    const emailSent = await notifyCustomer({

                        to: customer.email,

                        name: customer.name,

                        requestId: request_id,

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

                }
            );

        }
    );

};

// ==========================================
// 5. DELETE ENTIRE SUPPORT REQUEST
// ==========================================

const deleteSupportRequest = (req, res) => {

    const { request_id } = req.params;

    // VALIDATE REQUEST ID

    if (
        !request_id ||
        !Number.isInteger(Number(request_id)) ||
        Number(request_id) <= 0
    ) {

        return res.status(400).json({

            success: false,

            message: "Invalid support request ID."

        });

    }

    // DELETE COMPLETE SUPPORT REQUEST

    const sql = `
        DELETE FROM support_requests
        WHERE request_id = ?
    `;

    db.query(
        sql,
        [request_id],
        (err, result) => {

            if (err) {

                console.error(
                    "Delete Support Request Error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message: "Failed to delete support request."

                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Support request not found."

                });

            }

            console.log(
                `Entire Support Request #${request_id} deleted successfully.`
            );

            return res.status(200).json({

                success: true,

                message: "Entire support request deleted successfully.",

                request_id: Number(request_id)

            });

        }
    );

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