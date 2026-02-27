# Master Plan — AI-Powered Personalized Learning Platform

> An open-source, AI-powered learning platform built for schools — featuring intelligent test creation, real-time messaging, OCR scanning, adaptive AI tutoring, and role-based dashboards for students, teachers, principals, admins, and parents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](docs/CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](Dockerfile)

---

## ✨ Features

### 🤖 AI-Powered Capabilities
| Feature | Description |
|---|---|
| **AI Tutor** | Interactive chat-based tutor with markdown & math rendering |
| **AI Test Generation** | Automatically generate questions from any topic |
| **Answer Evaluation** | AI grades subjective answers with feedback |
| **Performance Analysis** | AI insights into student progress patterns |
| **Study Plan Generator** | Personalized study schedules |

### 💬 Real-Time Messaging (MessagePal)
- WebSocket-based live chat with typing indicators
- Message history persistence via **Apache Cassandra**
- File/image attachments with `multer`
- Firebase Auth token verification per message
- REST fallback API for history and uploads

### 🏫 Core Platform Features
- **Role-Based Access Control** — Student, Teacher, Principal, Admin, Parent
- **Multi-Dashboard System** — Tailored UI for every role
- **Test Management** — Create, distribute, and evaluate tests
- **OCR Test Scanning** — Convert physical test papers via Tesseract.js
- **Student Directory** — Browse by grade (Nursery → 12th)
- **Analytics Dashboard** — Charts and performance metrics via Recharts
- **Learning Progress Tracking** — Monitor improvement over time
- **Firebase Authentication** — Google and email/password sign-in
- **Dark Mode** — Full dark/light theme support

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

No Node.js install required — just [Docker](https://docs.docker.com/get-docker/).

```bash
git clone https://github.com/StarkNitish/PersonalLearningPro.git
cd PersonalLearningPro
cp .env.example .env       # fill in your credentials
docker compose build
docker compose up
```

Open **[http://localhost:5001](http://localhost:5001)** in your browser.

### Option 2: Manual Setup

Requires **Node.js v18+** and **npm**.

```bash
git clone https://github.com/StarkNitish/PersonalLearningPro.git
cd PersonalLearningPro
cp .env.example .env       # fill in your credentials
npm install
npm run dev
```

Open **[http://localhost:5001](http://localhost:5001)** in your browser.

> See [LOCAL_SETUP.md](docs/LOCAL_SETUP.md) for detailed setup instructions including database configuration.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`. All variables are **optional** — the app runs without them but with reduced functionality:

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase authentication |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project identifier |
| `VITE_FIREBASE_APP_ID` | Firebase app identifier |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics |
| `OPENAI_API_KEY` | AI tutor, test generation, and answer evaluation |
| `MONGODB_URI` | MongoDB Atlas connection string (session + user storage) |
| `CASSANDRA_*` | Cassandra cluster config for message persistence |
| `SESSION_SECRET` | Session cookie signing (auto-generated in dev) |

> **Without Firebase:** Auth features are disabled.  
> **Without OpenAI:** AI features are unavailable.  
> **Without MongoDB/Cassandra:** Falls back to in-memory storage.

---

## 📁 Project Structure

```
PersonalLearningPro/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── auth/          # Firebase auth dialogs
│       │   ├── chat/          # Real-time messaging UI
│       │   ├── dashboard/     # Role-specific dashboard widgets
│       │   └── ui/            # shadcn/ui component library
│       ├── contexts/          # Auth & theme context providers
│       ├── hooks/             # Custom React hooks (WebSocket, auth, query)
│       ├── lib/               # API clients, Firebase config, utilities
│       ├── pages/             # Page-level components (one per route)
│       ├── App.tsx            # Root router & layout
│       └── main.tsx           # Vite entry point
│
├── server/                    # Express + Node.js backend
│   ├── lib/                   # Integrations: OpenAI, Firebase Admin, Tesseract, Cassandra
│   ├── message/               # Real-time messaging module
│   │   ├── index.ts           # Message route handlers
│   │   ├── routes.ts          # Express routes for messages
│   │   ├── message-store.ts   # Abstract message storage interface
│   │   └── cassandra-*.ts     # Cassandra-backed message persistence
│   ├── messagepal/            # MessagePal feature module
│   ├── chat-ws.ts             # WebSocket server (ws library)
│   ├── routes.ts              # Main API routes
│   ├── storage.ts             # MongoDB + in-memory storage layer
│   ├── db.ts                  # MongoDB/Mongoose connection
│   ├── middleware.ts          # Auth & session middleware
│   └── index.ts               # Server entry point (port 5001)
│
├── shared/                    # Shared types & Zod validation schemas
├── docs/                      # Project documentation
│   ├── CHANGELOG.md
│   ├── CONTRIBUTING.md
│   ├── LOCAL_SETUP.md
│   ├── CLA.md
│   └── CODE_OF_CONDUCT.md
├── Dockerfile                 # Docker image definition
├── docker-compose.yml         # Multi-service Docker Compose
└── .env.example               # Environment variable template
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the full app in development mode (port 5001) |
| `npm run build` | Build for production (Vite + esbuild) |
| `npm run start` | Run the production build |
| `npm run check` | Type-check TypeScript |

---

## 🐳 Docker Reference

```bash
docker compose build              # Build the image
docker compose up                 # Start the container
docker compose up -d              # Start in background (detached)
docker compose down               # Stop the container
docker compose build --no-cache   # Rebuild after dependency changes
```

Source files (`client/`, `server/`, `shared/`) are bind-mounted for **hot reload** — no rebuild needed for code changes.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend** | Node.js, Express, TypeScript, Passport.js |
| **Database** | MongoDB (users/sessions), Apache Cassandra (messages) |
| **Auth** | Firebase Auth, Firebase Admin SDK, express-session |
| **AI** | OpenAI API (GPT-4), Tesseract.js (OCR) |
| **Real-time** | WebSocket (`ws`), custom chat gateway |
| **State** | TanStack Query (React Query) |
| **Charts** | Recharts |
| **File Upload** | Multer |

---

## 📝 Contributor License Agreement (CLA)

We use a CLA to ensure contributions can be safely included in the project. When you open your first Pull Request, the CLA Assistant bot will ask you to sign by commenting:

> I have read the CLA Document and I hereby sign the CLA

You only need to do this once. See [CLA.md](docs/CLA.md) for the full agreement.

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Sign the CLA on your first PR (one-time)
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
