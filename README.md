# 💻 Employee Dashboard & HR Intranet

Welcome to **TeamPulse Portal**, a premium-grade Employee Dashboard and Internal HR Intranet built using **React 19, TypeScript, and Tailwind CSS v4**.

This application provides employees with a responsive platform to track shifts, request time off, find coworker contact coordinates, read corporate announcements with AI summaries, and converse with a context-aware AI HR chatbot.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [https://github.com/mitmirani09/emp-dashboard-assignment-rps.git](https://github.com/mitmirani09/emp-dashboard-assignment-rps.git)
- **Local Workspace**: [c:/emp-dashboard-assignment-rps](file:///c:/emp-dashboard-assignment-rps)

---

## 🛠️ Tech Stack & Library Choices

- **Vite + React 19 (TypeScript)**: Scaffolded for instant Hot Module Replacement (HMR) and optimized build times using ESbuild.
- **Tailwind CSS v4**: Utility-first CSS framework configured using the modern CSS-only directive (`@import "tailwindcss";` and `@tailwindcss/vite` plugin), resulting in a minimal file size footprint.
- **State Management**: Built on top of native React `Context` APIs (`ThemeContext` and `EmployeeContext`) coupled with automated `localStorage` cache synchronization to keep states persistent across page reloads.
- **Charts & Graphs**: **Recharts** was used to render responsive bar charts (attendance trends) and pie charts (leave usage allocations).
- **Calendar & Heatmaps**: **React Calendar** was integrated to allow day blocking, date validations, and hover logs.
- **Toast Alerts**: **Sonner** was selected for micro-feedback transitions and success messages.
- **Animations**: **Framer Motion** was used to drive layout fade-ins and page navigation slides.

---

## 🤖 AI Integrations

### 1. AI Announcement Summarizer
Each announcement card features a **"AI Summary"** sparkle button. Clicking this triggers a collapsible widget that displays a loading shimmer loader for 1 second, simulating AI inference latency, and displays a polished 1–2 sentence summary of that specific post. 
- *Design Strategy*: Pre-generated, high-fidelity summaries are matched to default announcements, ensuring the feature operates offline. A programmatic fallback summarizer handles user-supplied datasets by automatically extracting key contextual bounds from the body.

### 2. HR Chat Assistant
The bottom right corner features a floating chat widget containing a pulsing online status. It acts as an interactive assistant to help workers verify their leave balances, find coworker emails, lookup managers, and check on check-in shift logs.
- *Context-Aware Matcher*: The bot reads the active worker session context in real-time. If you ask *"What is my leave balance?"*, it calculates your exact remaining Casual, Sick, and Earned limits. If you ask *"Who is my manager?"*, it fetches their name directly from the context.
- *Micro-interactions*: Pulsing three-dot typing indicators simulate bot processing, and suggestion pills let users trigger common queries with a single tap.

---

## 🗂️ Folder Structure

```
c:/emp-dashboard-assignment-rps/
├── public/               # Static assets & SVG icons
├── docs/                 # Guides & Documentation
│   ├── implementation_guide.md
│   └── interview_qa.md
├── src/
│   ├── components/
│   │   ├── common/       # Header, Sidebar, Layout, ChatAssistant, ThemeToggle
│   │   └── ui/           # Custom Reusable widgets (confetti, custom loaders)
│   ├── pages/            # Home Dashboard, Attendance, Leaves, Directory, Profile, 404
│   ├── context/          # ThemeContext, EmployeeContext
│   ├── data/             # JSON databases (mockEmployees, mockLeaves, mockAttendance, mockAnnouncements)
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Shared formatter helpers
│   ├── App.tsx           # Router Config & Providers wrapper
│   ├── index.css         # Tailwind directives & Calendar theme overrides
│   └── main.tsx          # React application entrypoint
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite plugins configuration
└── package.json          # Dependency locks & scripts
```

---

## 🏃 Setup & Run Instructions

Follow these commands to configure the workspace and spin up the development environment:

### 1. Install Node Dependencies
Run the package installer from the repository root:
```bash
npm install
```

### 2. Launch Development Server
Launch the local server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 3. Build Production Target
Compile and minify the project to `dist/`:
```bash
npm run build
```

### 4. Verify Code Validity
Run the Oxlint linter and type-checks:
```bash
npm run lint
# Or execute typescript check directly:
npx tsc --noEmit
```

---

## 🤖 AI Tools Used

This project was built and refined using state-of-the-art AI development utilities:
- **Claude Code**: Used for project planning, detailed task breakdowns, and scoping implementation steps to guide the development workflow.
- **Antigravity IDE**: Used for generating boilerplate code, initial workspace scaffolding, directory structuring, and UI skeleton code to get a head start.

---

## 🛡️ Rationale, Assumptions & Trade-offs


1. **LocalStorage Caching**: We assumed that the dashboard should persist session updates (punching in/out, leave requests, profile modifications) without requiring a backend database. We implemented standard JSON storage syncing on every state transition.
2. **Mockaroo JSON Loading**: The application reads directly from JSON mock datasets inside `src/data/`. This makes it simple to replace the files with your own export profiles later.
3. **No-Interactive Scaffolding**: We scaffolded using standard Vite templates, cleanly moving the outputs to the repository root to preserve the workspace's Git remote logs and gitignore instructions.
