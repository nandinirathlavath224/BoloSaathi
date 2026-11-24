import React, { useState } from "react";
import "./VoiceAssistant.css";
import { API_URL, getBusinessSummary } from "./api";

function VoiceAssistant() {

    const [language, setLanguage] = useState("en-IN");
    const [listening, setListening] = useState(false);
    const [loading, setLoading] = useState(false);

    const [userQuestion, setUserQuestion] = useState("");

    const [message, setMessage] = useState(
        "Hello! I am BoloSaathi. How can I help you today?"
    );

    // Store recent conversation
    const [history, setHistory] = useState([]);

    // ==========================================
    // TEXT TO SPEECH
    // ==========================================

    const speak = (text) => {

        if (!("speechSynthesis" in window)) return;

        window.speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(text);

        speech.lang = language;
        speech.rate = 0.95;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);
    };


    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    const formatAmount = (amount) => {

        return Number(amount || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });

    };


    // ==========================================
    // GET BUSINESS OWNER NAME
    // ==========================================

    const getOwnerName = () => {

        try {

            const profile = JSON.parse(
                localStorage.getItem("boloBusinessProfile") || "{}"
            );

            return profile.ownerName?.trim() || "Business Owner";

        } catch (error) {

            return "Business Owner";

        }

    };


    // ==========================================
    // DETECT BUSINESS QUESTIONS
    // ==========================================

    const detectBusinessIntent = (text) => {

        const command = text.toLowerCase();

        const isProfit =
            /profit|profits|लाभ|मुनाफा|मुनाफे|प्रॉफिट|कमाई|లాభం|లాభాలు|labham|labhalu|laabham/i.test(command);

        const isSales =
            /sales|sale|बिक्री|विक्रय|అమ్మకాలు|విక్రయాలు|ammakalu/i.test(command);

        const isExpense =
            /expenses|expense|खर्च|व्यय|ఖర్చులు|వ్యయాలు|kharchulu|kharche/i.test(command);

        const isInventory =
            /inventory|stock|स्टॉक|भंडार|ఇన్వెంటరీ|స్టాక్|సరుకులు/i.test(command);

        const isToday =
            /today|आज|आजका|आजकी|आजके|ఈరోజు|ఈ రోజు|నేడు|iroju|eeroju|eroju|irojuna|aaj|இன்று/i.test(command);

        return {
            isProfit,
            isSales,
            isExpense,
            isInventory,
            isToday,

            isBusinessQuestion:
                isProfit || isSales || isExpense || isInventory
        };

    };


    // ==========================================
    // GENERATE BUSINESS RESPONSE
    // ==========================================

    const generateBusinessResponse = async (text) => {

        const intent = detectBusinessIntent(text);

        const result = await getBusinessSummary();

        const summary = result?.data || result || {};

        const totalSales = Number(summary.totalSales || 0);

        const totalExpenses = Number(summary.totalExpenses || 0);

        const totalProfit = Number(
            summary.netProfit ??
            (totalSales - totalExpenses)
        );

        const todaySales = Number(summary.todaySales || 0);

        const todayExpenses = Number(summary.todayExpenses || 0);

        const todayProfit = Number(
            summary.todayProfit ??
            (todaySales - todayExpenses)
        );

        const totalProducts = Number(summary.totalProducts || 0);

        const lowStockCount = Number(summary.lowStockCount || 0);

        const ownerName = getOwnerName();

        // ======================================
        // PROFIT
        // ======================================

        if (intent.isProfit) {

            const profit = intent.isToday
                ? todayProfit
                : totalProfit;

            if (language === "te-IN") {

                return intent.isToday
                    ? `ఈరోజు మీ వ్యాపారం యొక్క లాభం ₹${formatAmount(profit)}.`
                    : `మీ మొత్తం వ్యాపార లాభం ₹${formatAmount(profit)}.`;

            }

            if (language === "hi-IN") {

                return intent.isToday
                    ? `आज आपके बिज़नेस का कुल मुनाफ़ा ₹${formatAmount(profit)} है।`
                    : `आपके बिज़नेस का कुल मुनाफ़ा ₹${formatAmount(profit)} है।`;

            }

            return intent.isToday
                ? `Your profit today is ₹${formatAmount(profit)}.`
                : `Your total business profit is ₹${formatAmount(profit)}.`;

        }


        // ======================================
        // SALES
        // ======================================

        if (intent.isSales) {

            const sales = intent.isToday
                ? todaySales
                : totalSales;

            if (language === "te-IN") {

                return intent.isToday
                    ? `ఈరోజు మీ మొత్తం అమ్మకాలు ₹${formatAmount(sales)}.`
                    : `మీ మొత్తం అమ్మకాలు ₹${formatAmount(sales)}.`;

            }

            if (language === "hi-IN") {

                return intent.isToday
                    ? `आज आपकी कुल बिक्री ₹${formatAmount(sales)} है।`
                    : `आपकी कुल बिक्री ₹${formatAmount(sales)} है।`;

            }

            return intent.isToday
                ? `Your total sales today are ₹${formatAmount(sales)}.`
                : `Your total business sales are ₹${formatAmount(sales)}.`;

        }


        // ======================================
        // EXPENSES
        // ======================================

        if (intent.isExpense) {

            const expenses = intent.isToday
                ? todayExpenses
                : totalExpenses;

            if (language === "te-IN") {

                return intent.isToday
                    ? `ఈరోజు మీ మొత్తం ఖర్చులు ₹${formatAmount(expenses)}.`
                    : `మీ మొత్తం వ్యాపార ఖర్చులు ₹${formatAmount(expenses)}.`;

            }

            if (language === "hi-IN") {

                return intent.isToday
                    ? `आज आपके कुल खर्चे ₹${formatAmount(expenses)} हैं।`
                    : `आपके कुल बिज़नेस खर्चे ₹${formatAmount(expenses)} हैं।`;

            }

            return intent.isToday
                ? `Your total expenses today are ₹${formatAmount(expenses)}.`
                : `Your total business expenses are ₹${formatAmount(expenses)}.`;

        }


        // ======================================
        // INVENTORY
        // ======================================

        if (intent.isInventory) {

            if (language === "te-IN") {

                return `మీ దగ్గర మొత్తం ${totalProducts} ఉత్పత్తులు ఉన్నాయి. వాటిలో ${lowStockCount} ఉత్పత్తుల స్టాక్ తక్కువగా ఉంది.`;

            }

            if (language === "hi-IN") {

                return `आपके पास कुल ${totalProducts} प्रोडक्ट हैं। इनमें से ${lowStockCount} प्रोडक्ट का स्टॉक कम है।`;

            }

            return `You currently have ${totalProducts} products in your inventory. ${lowStockCount} products are running low on stock.`;

        }

        return `Hello ${ownerName}! I couldn't identify that business request. Could you explain what business information you need?`;

    };


    // ==========================================
    // SEND MESSAGE TO GEMINI AI
    // ==========================================

    const generateAIResponse = async (text) => {

        const response = await fetch(
    `${API_URL}/ai/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    message: text,

                    language: language,

                    history: history.slice(-10)

                })

            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Unable to generate AI response."
            );

        }

        return data.reply;

    };


    // ==========================================
    // PROCESS USER MESSAGE
    // ==========================================

    const processCommand = async (text) => {

        if (!text || !text.trim()) return;

        const userText = text.trim();

        console.log("USER MESSAGE:", userText);

        setUserQuestion(userText);

        setLoading(true);

        try {

            let reply = "";

            const intent = detectBusinessIntent(userText);

            // ======================================
            // BUSINESS QUESTIONS
            // ======================================

            if (intent.isBusinessQuestion) {

                reply = await generateBusinessResponse(userText);

            }

            // ======================================
            // GENERAL AI CONVERSATIONS
            // ======================================

            else {

                reply = await generateAIResponse(userText);

            }

            console.log("BOLOSAATHI RESPONSE:", reply);

            // Save conversation history
            setHistory(previous => [

                ...previous,

                {
                    role: "user",
                    text: userText
                },

                {
                    role: "model",
                    text: reply
                }

            ].slice(-20));

            setMessage(reply);

            speak(reply);

        } catch (error) {

            console.error("BoloSaathi Error:", error);

            let errorMessage = "";

            if (language === "te-IN") {

                errorMessage = "క్షమించండి, ప్రస్తుతం సమాధానం ఇవ్వలేకపోతున్నాను. దయచేసి మళ్లీ ప్రయత్నించండి.";

            } else if (language === "hi-IN") {

                errorMessage = "माफ़ कीजिए, अभी जवाब देने में समस्या हो रही है। कृपया दोबारा कोशिश करें।";

            } else {

                errorMessage = "Sorry, I am having trouble responding right now. Please try again.";

            }

            setMessage(errorMessage);

            speak(errorMessage);

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // START VOICE RECOGNITION
    // ==========================================

    const startListening = () => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            setMessage(
                "Please use Google Chrome or Microsoft Edge."
            );

            return;

        }

        const recognition = new SpeechRecognition();

        recognition.lang = language;

        recognition.continuous = false;

        recognition.interimResults = false;

        recognition.onstart = () => {

            setListening(true);

            setUserQuestion("");

            setMessage("Listening... Speak now!");

        };

        recognition.onresult = (event) => {

            const transcript = event.results[0][0].transcript;

            console.log("VOICE RECOGNIZED:", transcript);

            processCommand(transcript);

        };

        recognition.onerror = (event) => {

            console.error("Speech recognition error:", event.error);

            setMessage(
                "Sorry, I couldn't hear you. Please try again."
            );

            setListening(false);

        };

        recognition.onend = () => {

            setListening(false);

        };

        try {

            window.speechSynthesis.cancel();

            recognition.start();

        } catch (error) {

            console.error("Recognition start error:", error);

            setListening(false);

        }

    };


    // ==========================================
    // USER INTERFACE
    // ==========================================

    return (

        <div className="voice-container">

            <h2>🎤 BoloSaathi AI Assistant</h2>

            <p>Select your conversation language</p>

            <select
                value={language}
                onChange={(e) => {

                    setLanguage(e.target.value);

                    window.speechSynthesis?.cancel();

                }}
                disabled={listening || loading}
            >

                <option value="en-IN">English</option>

                <option value="te-IN">Telugu</option>

                <option value="hi-IN">Hindi</option>

            </select>


            {userQuestion && (

                <div className="voice-message">

                    <strong>You:</strong>

                    <p>{userQuestion}</p>

                </div>

            )}


            <div className="voice-message">

                <strong>BoloSaathi:</strong>

                <p>{message}</p>

            </div>


            {loading && (

                <p>✨ BoloSaathi is thinking...</p>

            )}


            <button
                className="mic-button"
                onClick={startListening}
                disabled={listening || loading}
            >

                {listening

                    ? "🎙️ Listening..."

                    : loading

                        ? "⏳ Thinking..."

                        : "🎤 Start Speaking"

                }

            </button>

        </div>

    );

}

export default VoiceAssistant;