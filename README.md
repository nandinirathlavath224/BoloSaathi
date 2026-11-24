# BoloSaathi – AI-Powered Business Assistant

An intelligent, voice-enabled business management application designed to help small businesses manage their daily operations efficiently using AI-powered assistance.

## 🌐 Live Application

**Frontend:** https://bolosaathi-frontend.onrender.com

**Backend:** https://bolosaathi-backend-utig.onrender.com

**Backend Health Check:** https://bolosaathi-backend-utig.onrender.com/api/health

## 📌 About the Project

BoloSaathi is an AI-powered business assistant that simplifies business management by bringing essential business operations together in one platform.

It helps business owners manage inventory, sales, customers, expenses, payments, reports, and customer support.

The application also includes a voice-based AI assistant and a music player to provide an interactive user experience.

## ✨ Key Features

### 1. AI Voice Assistant
- Voice-based interaction.
- AI-powered business assistance.
- Business-related queries and responses.

### 2. Dashboard
- Business overview.
- Sales and expense statistics.
- Recent business activity.

### 3. Inventory Management
- Add and manage products.
- Update product information.
- Monitor stock levels.
- Identify low-stock products.

### 4. Customer Management
- Add and manage customers.
- Search customer information.
- Update customer details.

### 5. Sales Management
- Record sales transactions.
- Manage sales items.
- Track sales information.

### 6. Expense Management
- Record business expenses.
- View expense information.
- Track expense summaries.

### 7. Payment Management
- Manage payment records.
- Track payment status.
- View customer payment information.

### 8. Reports
- Business performance reports.
- Sales and expense analysis.
- Product and category reports.

### 9. AI Support
- AI-powered support assistance.
- Support request management.

### 10. Music Player
- Integrated music player.
- Music playback functionality.

### 11. Settings and Appearance
- Application settings.
- Appearance customization.

## 🛠️ Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- PostgreSQL
- PostgreSQL Node.js driver (`pg`)

### Artificial Intelligence and Integrations
- Google Gemini API
- YouTube Data API
- Web Speech API
- Nodemailer

### Development and Deployment
- Visual Studio Code
- Git and GitHub
- Render
- PostgreSQL

## 🏗️ Project Architecture

```text
             USER
              |
              v
      REACT FRONTEND
              |
              v
       EXPRESS BACKEND
              |
       +------+------+
       |      |      |
       v      v      v
   PostgreSQL Gemini  External
   Database   API    APIs
                    (Music)
```

## 📂 Project Structure

```text
BoloSaathi/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── index.html
│
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following:

- Node.js
- npm
- PostgreSQL
- Visual Studio Code
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/nandinirathlavath224/BoloSaathi.git
```

```bash
cd BoloSaathi
```

### 2. Backend Setup

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure the required environment variables in the backend `.env` file.

At minimum, configure your PostgreSQL connection using:

```env
DATABASE_URL=your_postgresql_connection_string
```

Also configure the required AI, music and email service credentials used by your backend.

Start the backend:

```bash
npm run dev
```

Backend runs locally on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend API URL in its environment file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## ☁️ Deployment

BoloSaathi is deployed using Render.

| Component | Deployment |
|---|---|
| Frontend | Render |
| Backend | Render |
| Database | Render PostgreSQL |

### Production URLs

Frontend:

https://bolosaathi-frontend.onrender.com

Backend:

https://bolosaathi-backend-utig.onrender.com

## 🔐 Security

- Database credentials are stored in environment variables.
- API keys should never be committed to GitHub.
- The `.env` file should be excluded using `.gitignore`.
- Production database connection details must remain private.

## 🎯 Project Objective

The main objective of BoloSaathi is to make business management simpler, smarter, and more accessible through AI-powered assistance, voice interaction, and centralized business operations.

## 🚀 Future Enhancements

- Advanced AI business predictions.
- Automated business recommendations.
- Multilingual voice assistance.
- Advanced sales analytics.
- Enhanced business performance insights.

## 👩‍💻 Developer

**Rathlavath Nandini**

GitHub: https://github.com/nandinirathlavath224

## 📄 License

This project is developed as an academic and portfolio project.