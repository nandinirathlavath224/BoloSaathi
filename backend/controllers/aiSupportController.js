// ==========================================
// BOLOSAATHI - GEMINI AI SUPPORT CONTROLLER
// PostgreSQL Version
// ==========================================

const db = require("../config/db");

// ==========================================
// DATABASE QUERY HELPER
// ==========================================

const queryDatabase = async (sql, values = []) => {
    const result = await db.query(sql, values);
    return result.rows;
};

// ==========================================
// WAIT FUNCTION FOR RETRIES
// ==========================================

const wait = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

// ==========================================
// GENERATE AI SOLUTION
// ==========================================

const generateSolutionForRequest = async (requestId) => {
    try {
        console.log(
            `Generating Gemini AI solution for Request #${requestId}`
        );

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key is missing.");
        }

        const { GoogleGenAI } = await import("@google/genai");

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        // Fetch support request
        const requests = await queryDatabase(
            `SELECT request_id, name, email, subject, message
             FROM support_requests
             WHERE request_id = $1`,
            [requestId]
        );

        if (requests.length === 0) {
            throw new Error("Support request not found.");
        }

        const request = requests[0];

        // ==========================================
        // AI PROMPT
        // ==========================================

        const prompt = `
You are BoloSaathi AI, a friendly and helpful customer support assistant.

ABOUT BOLOSAATHI:
BoloSaathi is a business management application designed
to help small business owners manage their businesses.

AVAILABLE MODULES:
- Dashboard
- AI Voice Assistant
- Sales
- Expenses
- Inventory
- Customers
- Payments
- Reports
- Settings
- Help & Support

IMPORTANT LANGUAGE INFORMATION:
- The language selector is available ONLY in the AI Voice Assistant.
- Users can select English, Telugu, Hindi, or Tamil for voice interactions.
- The language selector does NOT translate the entire application interface.
- Never tell users that the complete application interface can be translated.
- Never invent settings, buttons, or features.

YOUR RESPONSE RULES:
1. Keep the solution very short and sweet.
2. Use simple, friendly English.
3. Write only 2 to 3 short sentences.
4. Give the most useful solution directly.
5. Avoid lengthy explanations and technical words.
6. Never invent features or buttons.
7. Only suggest actions available in BoloSaathi.
8. Make the customer feel happy and supported.

SUPPORT REQUEST:

Customer Name: ${request.name}
Subject: ${request.subject}
Problem: ${request.message}

Write a short, practical, friendly solution that directly addresses
the customer's problem.
`;

        // ==========================================
        // GEMINI API WITH AUTOMATIC RETRIES
        // ==========================================

        let response;
        let lastError;

        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(
                    `Gemini AI attempt ${attempt} of ${maxAttempts}`
                );

                response = await ai.models.generateContent({
                    model: "gemini-3.5-flash-lite",
                    contents: prompt,
                    config: {
                        temperature: 0.4,
                        maxOutputTokens: 500
                    }
                });

                break;

            } catch (error) {
                lastError = error;

                const status = Number(
                    error.status ||
                    error.statusCode ||
                    error.code
                );

                const retryableStatuses = [429, 500, 502, 503, 504];

                console.error(
                    `Gemini attempt ${attempt} failed:`,
                    error.message
                );

                if (
                    attempt === maxAttempts ||
                    !retryableStatuses.includes(status)
                ) {
                    throw error;
                }

                console.log("Retrying Gemini AI in 3 seconds...");

                await wait(3000);
            }
        }

        if (!response && lastError) {
            throw lastError;
        }

        // ==========================================
        // EXTRACT AI RESPONSE
        // ==========================================

        const solution =
            typeof response.text === "function"
                ? response.text()
                : response.text;

        if (!solution || !solution.trim()) {
            throw new Error("Gemini returned an empty solution.");
        }

        const finalSolution = solution.trim();

        // ==========================================
        // SAVE SOLUTION IN POSTGRESQL
        // ==========================================

        await queryDatabase(
            `UPDATE support_requests
             SET solution = $1
             WHERE request_id = $2`,
            [finalSolution, requestId]
        );

        console.log(
            `Gemini AI solution successfully saved for Request #${requestId}`
        );

        return finalSolution;

    } catch (error) {
        console.error(
            "Gemini AI Solution Generation Error:",
            error.message
        );

        throw error;
    }
};

// ==========================================
// REGENERATE AI SOLUTION
// ==========================================

const regenerateSolutionForRequest = async (requestId) => {
    try {
        const requests = await queryDatabase(
            `SELECT request_id
             FROM support_requests
             WHERE request_id = $1`,
            [requestId]
        );

        if (requests.length === 0) {
            throw new Error("Support request not found.");
        }

        console.log(
            `Regenerating AI solution for Request #${requestId}`
        );

        return await generateSolutionForRequest(requestId);

    } catch (error) {
        console.error(
            "AI Solution Regeneration Error:",
            error.message
        );

        throw error;
    }
};

// ==========================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
    generateSolutionForRequest,
    regenerateSolutionForRequest
};