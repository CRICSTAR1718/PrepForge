<div align="center">

<h1>⚒️ PrepForge</h1>

<p><strong>AI-powered placement preparation system — Plan, Execute, Evaluate, Improve.</strong></p>

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-68A063?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

<p>
  <a href="#-demo">Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Environment Variables</a> •
  <a href="#-api-reference">API Reference</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

</div>

---

## 📌 Overview

Most students preparing for campus placements study inconsistently and have no feedback loop. **PrepForge** closes that gap.

It tells you exactly what to study each day, evaluates how well you did using AI, and helps you course-correct through a conversational mentor — all in one place.

```
User signs up
    → picks domain (DSA / Full Stack / Aptitude) + duration (15–90 days)
    → system generates a personalised day-wise plan
    → user follows daily tasks and logs: tasks done, time spent, notes
    → AI evaluator scores the log (0–100) with written feedback
    → dashboard tracks streaks, score trends, and progress
    → AI mentor is available anytime for guidance and doubts
```

---

## 🎬 Demo

> _Live link will be added after deployment._

| Screen | Description |
|--------|-------------|
| Onboarding | Select domain, duration, and study hours per day |
| Smart Planner | Auto-generated day-wise study roadmap |
| Daily Tracker | Checklist of tasks, time logger, notes field |
| Evaluation Result | AI score (0–100), feedback, and improvement suggestions |
| AI Mentor Chat | Contextual chat mentor personalised to your plan and scores |
| Dashboard | Score trend chart, streak counter, plan progress |

---

## ✨ Features

- **Smart Planner** — AI-generated day-wise study plans for DSA, Full Stack, or Aptitude preparation, customised by duration and your available study hours.

- **Daily Execution Tracker** — Check off today's tasks, log time spent, and add notes. Auto-saves as a draft; one submit per day.

- **AI Evaluator** — Every daily log is scored 0–100 by GPT-4o across four dimensions: task completion (40%), time invested (20%), note quality (25%), and self-assessment accuracy (15%). You get a score, a feedback paragraph, and specific suggestions for tomorrow.

- **AI Mentor Chat** — A conversational mentor that knows your domain, current day in the plan, and recent scores. Ask anything — strategy, doubts, approach to a problem.

- **Progress Dashboard** — Score trend line chart (last 14 days), current streak, plan progress bar (Day N of M), and recent evaluator feedback summary.

- **JWT Authentication** — Short-lived access tokens (15 min) with refresh tokens (7 days) for a smooth, secure session experience.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| AI | OpenAI API (GPT-4o) |
| Auth | JWT (access + refresh tokens) |
| Charts | Recharts |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 📁 Project Structure

```
prepforge/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (email, password, domain, planId)
│   │   ├── Plan.js          # Plan schema (userId, domain, days[])
│   │   └── DailyLog.js      # Log schema (tasks, time, notes, evaluation)
│   ├── routes/
│   │   ├── auth.js          # POST /signup, /login, /refresh
│   │   ├── plans.js         # POST / (generate), GET /:id
│   │   ├── logs.js          # GET /today, PUT /:id, POST /:id/submit
│   │   └── mentor.js        # POST /chat
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── .env                 # Environment variables (never commit this)
│   └── index.js             # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Plan.jsx
│   │   │   ├── Tracker.jsx
│   │   │   ├── Result.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Mentor.jsx
│   │   ├── components/      # Reusable UI components
│   │   ├── App.jsx          # Routes
│   │   └── main.jsx
│   ├── .env                 # VITE_API_URL
│   └── vite.config.js
│
└── README.md
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'add: your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with focus by a student, for students.</p>
  <p><strong>PrepForge</strong> — because placement prep deserves a system.</p>
</div>
