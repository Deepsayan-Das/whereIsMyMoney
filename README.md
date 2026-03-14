# 💰 Where Is My Money (WIMM)

**Where Is My Money** is a high-performance, full-stack personal finance tracker designed with a "Neo-Brutalist" aesthetic. It features **Finn 🤖**, an integrated AI advisor powered by Google Gemini, providing live financial insights and proactive spending advice.

---

## 🚀 Features

- **Finn AI Advisor**: Live financial context-aware chat and proactive insights (Spending warnings, savings praise, etc.).
- **Smart Dashboard**: Real-time balance tracking across multiple accounts (Savings, Digital Wallets, Cash, etc.).
- **Neo-Brutalist UI**: Bold, high-contrast design using Tailwind CSS (NativeWind).
- **Auto-Auth Routing**: Intelligent session management—never see a login screen twice.
- **Transaction History**: Seamlessly add and track income/expenses with categorized accounts.
- **Secure by Design**: JWT-based authentication with Redis-backed token blacklisting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: Expo Router (File-based)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **AI**: Google Gemini AI (@google/generative-ai)
- **Networking**: Axios with centralized API intercepts
- **Storage**: Expo Secure Store for encrypted token persistence

### Backend
- **Runtime**: Node.js
- **Framework**: Express (v5)
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis (ioredis) for high-speed token management and session handling
- **Security**: JWT (jsonwebtoken), Bcrypt for password hashing

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB & Redis instances running
- Expo Go app on your physical device or an emulator

### 1. Clone & Install
```bash
git clone <repository-url>
cd money
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_key
SALT_ROUNDS=10
```
Run the server:
```bash
npx nodemon
```

### 3. Frontend Setup
```bash
cd ../frontend/whereIsMyMoney
npm install
```
Create a `.env` file in the `frontend/whereIsMyMoney` folder:
```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:3000/api
EXPO_PUBLIC_GEMINI_KEY=your_gemini_api_key
```
Start the app:
```bash
npx expo start -c
```

---

## 🤖 Meet Finn
Finn isn't just a chatbot. He has **LIVE snapshots** of your finances. You can ask him:
- *"How much did I spend on groceries this week?"*
- *"Can I afford a new laptop right now?"*
- *"Give me a summary of my digital wallet balance."*

---

## 🎨 Design System
The app uses a unique **Neo-Brutalist** style:
- **Primary Color**: `#2718fe` (Digital Blue)
- **Shadows**: Hard, offset shadows with high contrast.
- **Typography**: Bold, thick weights and sans-serif fonts.
