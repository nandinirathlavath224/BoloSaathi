const nodemailer = require("nodemailer");

// Gmail email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Send support solution email
const sendSupportSolutionEmail = async ({
    to,
    name,
    requestId,
    subject,
    message,
    solution
}) => {

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error("Gmail credentials are missing in .env");
    }

    if (!to || !solution) {
        throw new Error("Customer email or support solution is missing.");
    }

    const safe = (value) =>
        String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    await transporter.sendMail({

        from: `"BoloSaathi Support" <${process.env.GMAIL_USER}>`,

        to,

        subject: `BoloSaathi Support Update - Request #${requestId}`,

        text: `
Hello ${name},

Thank you for contacting BoloSaathi Support.

Your issue:
${message}

Our suggested solution:
${solution}

We hope this helps!

Regards,
BoloSaathi Support Team
        `,

        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;color:#333;">

                <h2 style="color:#7255d9;">BoloSaathi Support</h2>

                <p>Hello ${safe(name)},</p>

                <p>
                    Thank you for contacting BoloSaathi Support.
                    We have prepared a solution for your request.
                </p>

                <div style="background:#f5f3ff;padding:18px;border-radius:10px;">
                    <h3>Request #${safe(requestId)}</h3>

                    <strong>Your Issue</strong>
                    <p>${safe(message).replace(/\n/g, "<br>")}</p>

                    <strong>Suggested Solution</strong>
                    <p>${safe(solution).replace(/\n/g, "<br>")}</p>
                </div>

                <p>We hope this helps!</p>

                <p>
                    Regards,<br>
                    <strong>BoloSaathi Support Team</strong>
                </p>

            </div>
        `

    });

    console.log(`Support solution email sent to ${to}`);
};

module.exports = {
    sendSupportSolutionEmail
};