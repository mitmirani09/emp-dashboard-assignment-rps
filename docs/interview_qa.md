# 🎯 Interview Q&A Reference: Employee Dashboard

This guide captures architectural rationale, design decisions, code snippets, and expected interview Q&As for the Employee Dashboard.

---

## 🛠️ Architecture & Setup Questions

### Q1: Why did you choose Vite over Create React App (CRA)?
**Answer**:
Create React App is deprecated and relies on Webpack, which leads to slow build speeds and sluggish Hot Module Replacement (HMR). Vite uses **ESbuild** for pre-bundling dependencies (10-100x faster than Webpack) and leverages native browser ESM imports for code delivery. This reduces hot reload latency to under 50ms, improving developer experience.

### Q2: Why did you choose React Context API for state management rather than Redux?
**Answer**:
The dashboard requires moderate state tracking (session profiles, log updates, leave requests, themes) that does not undergo highly complex, high-frequency state updates. React's native **Context API** is lightweight, comes built-in (no extra package footprint), and avoids boilerplate code (actions, reducers, store setups). We grouped state into `ThemeContext` and `EmployeeContext` to keep state boundaries focused.

### Q3: What styling strategy is implemented? Why Tailwind CSS v4?
**Answer**:
We implemented Tailwind CSS v4 using its modern CSS-only configuration. Tailwind v4 uses `@import "tailwindcss";` directly in the stylesheet and ships with an integrated compiler inside the Vite pipeline (`@tailwindcss/vite`). It eliminates the need for separate `postcss.config.js` or `tailwind.config.js` files, resulting in faster builds and a clean configuration.

---

## ⚙️ Feature Implementation Questions

### Q4: How is the check-in punch card timer built in React without triggering memory leaks?
**Answer**:
When `isPunchedIn` is true, a `useEffect` hook triggers a 1-second `setInterval` loop to compute the duration worked since the `activePunchInTime` timestamp. It updates a state variable which formats the display. Crucially, the return callback of the `useEffect` handles clearing the interval (`clearInterval`) when the user punches out or the component unmounts, preventing memory leaks:

```tsx
useEffect(() => {
  if (!isPunchedIn || !activePunchInTime) return;
  const updateTimer = () => {
    const diff = new Date().getTime() - new Date(activePunchInTime).getTime();
    const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const secs = Math.floor((diff % 60005) / 1000).toString().padStart(2, '0');
    setElapsedTimeStr(`${hrs}h ${mins}m ${secs}s`);
  };
  updateTimer();
  const timer = setInterval(updateTimer, 1000);
  return () => clearInterval(timer);
}, [isPunchedIn, activePunchInTime]);
```

### Q5: How do you highlight approved leave blocks on the Calendar and prevent booking overrides?
**Answer**:
We iterate over the approved leave requests list, generating a map of day strings (`"YYYY-MM-DD"`) for every date spanning start and end bounds. We supply this map to the `tileClassName` prop in `react-calendar`, applying custom background classes (e.g. `bg-blue-500/20`) to highlight them. When a user tries to book a leave via the form, we compare the input start and end dates with existing leaves in the map, raising validation errors if there is a overlap.

---

## 🤖 AI Integration Questions

### Q6: How does the AI HR Chat Assistant answer contextually?
**Answer**:
We pass the global state (`currentUser`, `leaveBalances`, `attendanceRecords`) directly down to the `ChatAssistant`. When the user types, a matching script parses keywords (e.g., "sick leave", "manager", "attendance") and injects state values directly into the reply:

```tsx
const generateBotResponse = (text: string): string => {
  const query = text.toLowerCase();
  if (query.includes('leave balance')) {
    const casual = leaveBalances.find(b => b.type === 'casual')?.available || 0;
    const sick = leaveBalances.find(b => b.type === 'sick')?.available || 0;
    return `Your available balances are Casual: ${casual} and Sick: ${sick}.`;
  }
  // ... fallback response
};
```
For a production deployment, this local matcher acts as a fallback while the main interface calls a Vercel AI SDK route stream (`import { generateText } from 'ai'`) linked to a Groq model (`mixtral-8x7b-32768`).

### Q7: How did you implement the AI Announcement Summarizer?
**Answer**:
Each announcement card features an "AI Summary" toggle. When clicked, it displays a loading skeleton, waits for 1 second to simulate model inference delay, and displays a pre-calculated 1–2 sentence summary of that specific post. If the user overrides the mock data, the bot defaults to extracting the first two sentences programmatically. This ensures the demo functions smoothly in any environment.

---

## ⚡ Performance & Optimization Questions

### Q8: How did you optimize loading speeds and layout shifts?
**Answer**:
1. **Shimmer Skeletons**: We built animated shimmer skeleton components that match the exact aspect-ratio of directory cards, tables, and charts. These placeholders prevent Cumulative Layout Shift (CLS) as data loads.
2. **Debounced Filters**: When searching the coworker list, search query changes are processed via React `useMemo` hooks, keeping the re-rendering of cards extremely efficient.
3. **Data caching**: Global profiles and attendance logs are read from `localStorage` on init, avoiding data fetching delays.
