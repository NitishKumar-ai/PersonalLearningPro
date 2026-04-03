# 🎓 Master Plan — AI-Powered Personalized Learning Platform

> 🚀 An open-source, AI-powered learning platform built for schools — featuring intelligent test creation, real-time messaging, OCR scanning, adaptive AI tutoring, and role-based dashboards for students, teachers, principals, admins, and parents. 📚✨

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](docs/CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](Dockerfile)

---

## ✨ Features

### 🤖 AI-Powered Capabilities
| Feature | Description |
|---|---|
| **🤖 AI Tutor** | Interactive chat-based tutor with markdown & math rendering |
| **📝 AI Test Generation** | Automatically generate questions from any topic |
| **✅ Answer Evaluation** | AI grades subjective answers with feedback |
| **📊 Performance Analysis** | AI insights into student progress patterns |
| **📅 Study Plan Generator** | Personalized study schedules |

### 💬 Real-Time Messaging (MessagePal)
- 🔌 WebSocket-based live chat with typing indicators
- ⚡ Message history persistence via **Apache Cassandra**
- 📁 File/image attachments with `multer`
- 🔥 Firebase Auth token verification per message
- 🌐 REST fallback API for history and uploads

### 🏫 Core Platform Features
- **⚖️ Role-Based Access Control** — Student, Teacher, Principal, Admin, Parent
- **🖥️ Multi-Dashboard System** — Tailored UI for every role
- **📝 Test Management** — Create, distribute, and evaluate tests
- **🔍 OCR Test Scanning** — Convert physical test papers via Tesseract.js
- **📂 Student Directory** — Browse by grade (Nursery → 12th)
- **📈 Analytics Dashboard** — Charts and performance metrics via Recharts
- **📉 Learning Progress Tracking** — Monitor improvement over time
- **🔥 Firebase Authentication** — Google and email/password sign-in
- **🌓 Dark Mode** — Full dark/light theme support

---

## 🚀 Quick Start

### 🐳 Option 1: Docker (Recommended)

No Node.js install required — just [Docker](https://docs.docker.com/get-docker/).

```bash
git clone https://github.com/StarkNitish/PersonalLearningPro.git
cd PersonalLearningPro
docker compose up
```

### 💻 Option 2: Local Development

Requires [Node.js](https://nodejs.org/) v18+.

```bash
npm install
npm run dev
```

---

## 📂 Project Structure

- `client/` — 🎨 **React + Vite Frontend** | Modern UI built with Tailwind CSS, shadcn/ui, and Framer Motion. 🖥️✨
- `server/` — 🖥️ **Node.js + Express Backend** | Robust API, WebSockets (MessagePal), and AI integration layer. ⚙️🚀
- `shared/` — 🧩 **Shared Schema & Types** | Zod schemas and TypeScript interfaces shared across the stack. 🤝💎
- `docs/` — 📖 **Project Documentation** | System designs, changelogs, and contributor guides. 📜📚
- `.agent/` — 🤖 **AI Agent Workspace** | Modular context, rules, and workflows for AI-driven development. 🧠🛠️
- `assets/` — 🖼️ **Static Assets** | High-quality illustrations and brand assets used throughout the app. 🎨📸
- `config/` — ⚙️ **Platform Config** | Secure connection certificates and database environment setup. 🔒📂
- `scripts/` — 🛠️ **Utility Scripts** | Tools for seeding test data, setting up OpenMAIC, and CI/CD. 📜⚡
- `terraform/` — ☁️ **Infrastructure (IaC)** | Terraform modules for automated cloud deployment. 🏗️🌍
- `k8s/` — ☸️ **Orchestration** | Kubernetes manifests for scaling and observability in production. 🚢🔭
- `signatures/` — ✍️ **CLA Signatures** | Repository of signed Contributor License Agreements. ⚖️📝
- `tests/` — 🧪 **End-to-End Testing** | Automated test suites for auth, AI, and real-time features. 🤖✅

---

## 🤝 Contributing

We welcome contributions from both humans and AI! 🌍🧠 See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

**🤖 Using an AI Agent?** 
Please initialize your local `.agent` workspace and refer to our `AGENTS.md` format (detailed in `CONTRIBUTING.md`) for specialized workflows, prompts, and architectural rules. 📜✨

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Sign the CLA on your first PR (one-time)
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. ⚖️
