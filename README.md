# Master Plan - AI-Powered Personalized Learning Platform

An AI-powered personalized learning platform designed to enhance educational experiences through intelligent test creation, comprehensive performance analytics, and adaptive learning tools for both students and teachers.

## ✨ Features

### AI-Powered Capabilities
- **AI Tutor** — Interactive learning assistant with chat-based help
- **Test Creation** — AI-assisted question generation
- **Answer Evaluation** — Automatic evaluation of subjective answers
- **Performance Analysis** — AI insights into student performance patterns

### Core Functionality
- **User Management** — Role-based access control (Teacher, Student, Principal, Admin, Parent)
- **Test Management** — Create, distribute, and evaluate tests
- **OCR Test Scanning** — Convert physical test papers to digital format
- **Student Directory** — Browse students organized by standards (nursery to 12th grade)
- **Analytics Dashboard** — Visual representation of performance metrics
- **Learning Progress Tracking** — Monitor improvement over time

## 🚀 Quick Start

### Option 1: Docker (Recommended)

No Node.js install required — just [Docker](https://docs.docker.com/get-docker/).

```bash
git clone https://github.com/StarkNitish/PersonalLearningPro.git
cd PersonalLearningPro
cp .env.example .env       # edit with your credentials
docker compose build
docker compose up
```

Open **[http://localhost:5001](http://localhost:5001)** in your browser.

### Option 2: Manual Setup

Requires **Node.js v18+** and **npm**.

```bash
git clone https://github.com/StarkNitish/PersonalLearningPro.git
cd PersonalLearningPro
cp .env.example .env       # edit with your credentials
npm install
npm run dev
```

Open **[http://localhost:5001](http://localhost:5001)** in your browser.

> See [LOCAL_SETUP.md](LOCAL_SETUP.md) for detailed manual setup instructions.

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values. All variables are **optional** — the app runs without them but with reduced functionality:

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_FIREBASE_API_KEY` | Optional | Firebase authentication |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Firebase project identifier |
| `VITE_FIREBASE_APP_ID` | Optional | Firebase app identifier |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Optional | Firebase Cloud Messaging |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional | Firebase Analytics |
| `OPENAI_API_KEY` | Optional | AI tutor, test generation, answer evaluation |
| `SESSION_SECRET` | Optional | Session cookie signing (auto-generated in dev) |

> **Without Firebase:** The app loads but auth features are disabled.
> **Without OpenAI:** The app loads but AI features won't work.

## 📁 Project Structure

```
├── client/                # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context providers (auth, theme)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions & libraries
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Entry point
│   └── index.html         # HTML template
├── server/                # Express backend
│   ├── lib/               # Server utilities (OpenAI integration)
│   ├── index.ts           # Server entry point (port 5001)
│   ├── routes.ts          # API routes
│   ├── storage.ts         # In-memory data storage
│   └── vite.ts            # Vite dev middleware setup
├── shared/                # Shared code (client ↔ server)
│   └── schema.ts          # Database schema (Drizzle ORM)
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Docker Compose services
└── .env.example           # Environment variable template
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the full app in development mode (port 5001) |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run check` | Type-check TypeScript |
| `npm run db:push` | Push Drizzle schema to database |

## 🐳 Docker Reference

```bash
docker compose build              # Build the image
docker compose up                 # Start the container
docker compose up -d              # Start in background
docker compose down               # Stop the container
docker compose build --no-cache   # Rebuild after dependency changes
```

Source files (`client/`, `server/`, `shared/`) are bind-mounted for **hot reload** — no rebuild needed for code changes.

## 📝 Contributor License Agreement (CLA)

We use a CLA to ensure contributions can be safely included in the project. When you open your first Pull Request, the CLA Assistant bot will ask you to sign by commenting:

> I have read the CLA Document and I hereby sign the CLA

You only need to do this once. See [CLA.md](CLA.md) for the full agreement.

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Sign the CLA on your first PR (one-time)
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
