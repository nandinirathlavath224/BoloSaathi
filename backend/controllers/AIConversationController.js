// ==========================================
// BOLOSAATHI - AI CONVERSATION CONTROLLER
// Powered by Gemini AI
// ==========================================

let ai;

const getGeminiAI = async () => {
    if (!ai) {
        const { GoogleGenAI } = await import("@google/genai");

        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }

    return ai;
};

// ==========================================
// GENERATE AI CONVERSATION
// ==========================================

const generateConversation = async (req, res) => {

    try {

        // Check API key
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Gemini API key is missing."
            });
        }
        const gemini = await getGeminiAI();

        // Get frontend data
        const { message, language, history } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a message."
            });
        }

        // Supported languages
        const languages = {
            "en-IN": "English",
            "te-IN": "Telugu",
            "hi-IN": "Hindi"
        };

        const selectedLanguage =
            languages[language] || "English";

        // ======================================
        // BOLOSAATHI SYSTEM INSTRUCTIONS
        // ======================================

        const systemPrompt = `
You are BoloSaathi, an intelligent, friendly,
helpful and fast AI assistant.

Your capabilities should be similar to modern
AI assistants such as ChatGPT and Gemini.

YOUR MAIN RESPONSIBILITIES:

1. Answer general knowledge questions.
2. Have natural everyday conversations.
3. Help with education and learning.
4. Explain programming and technology.
5. Help with career guidance.
6. Discuss hobbies and interests.
7. Help users with writing and creativity.
8. Understand emotions and provide empathetic
   responses.
9. Help users discuss family and friendship.
10. Answer business-related questions when
    reliable business information is available.

LANGUAGE:

The user's selected language is ${selectedLanguage}.

Always respond in ${selectedLanguage}.

Understand:
- English
- Telugu
- Hindi
- Telugu written using English letters.
- Hindi written using English letters.

Understand natural speech, informal expressions,
different sentence structures and spelling mistakes.

CONVERSATION:

- Remember the recent conversation context.
- Understand follow-up questions.
- Answer the actual question.
- Do not restrict conversations to predefined
  questions.
- Do not repeatedly introduce yourself.
- Do not give robotic responses.
- Ask relevant follow-up questions when useful.

EMOTIONAL SUPPORT:

- Respond with kindness and empathy.
- Never judge the user's feelings.
- Give practical suggestions when appropriate.
- Encourage communication with trusted people.
- Never pretend to be human.

BUSINESS SAFETY:

You do not automatically have access to live
business database information.

Never invent sales, expenses, profit, inventory
or customer figures.

If actual business data is required, explain
that the relevant business information needs
to be retrieved from BoloSaathi's backend.

RESPONSE STYLE:

- Be friendly and natural.
- Use simple language.
- Keep answers concise by default.
- Give detailed explanations when requested.
- Avoid unnecessary headings.
- Be accurate and helpful.

You are BoloSaathi, a complete AI assistant.
`;

        // ======================================
        // PREPARE CONVERSATION HISTORY
        // ======================================

        const conversationHistory = Array.isArray(history)
            ? history.slice(-10).map(item => {

                if (
                    !item ||
                    !["user", "model"].includes(item.role) ||
                    typeof item.text !== "string"
                ) {
                    return null;
                }

                return {
                    role: item.role,
                    parts: [
                        {
                            text: item.text.slice(0, 3000)
                        }
                    ]
                };

            }).filter(Boolean)
            : [];

        // ======================================
        // SEND REQUEST TO GEMINI
        // ======================================

        const response = await gemini.models.generateContent({

            model: "gemini-3.5-flash-lite",

            contents: [
                ...conversationHistory,
                {
                    role: "user",
                    parts: [
                        {
                            text: message.trim()
                        }
                    ]
                }
            ],

            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
                maxOutputTokens: 600
            }

        });

        // ======================================
        // EXTRACT AI RESPONSE
        // ======================================

        const reply =
            typeof response.text === "function"
                ? response.text()
                : response.text;

        if (!reply || !reply.trim()) {
            throw new Error("Empty response received from Gemini.");
        }

        // ======================================
        // SEND RESPONSE TO FRONTEND
        // ======================================

        return res.status(200).json({

            success: true,
            reply: reply.trim(),
            language: selectedLanguage

        });

    } catch (error) {

        console.error(
            "BoloSaathi Conversation Error:",
            error
        );

        return res.status(500).json({

            success: false,
            message: "Unable to generate a response. Please try again."

        });

    }

};

// ==========================================
// EXPORT CONTROLLER
// ==========================================

module.exports = {
    generateConversation
};