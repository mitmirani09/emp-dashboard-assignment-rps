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
    const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
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

### Q6: How does the "Switch Profile" feature update the dashboard dynamically?
**Answer**:
We restructure the JSON databases using `employeeId` references. In `EmployeeContext.tsx`, we query these databases using React `useMemo` hooks filtered by `currentUser.id`. When `switchUser(employeeId)` is called, it triggers a state update on `currentUser`. The memoized lists automatically recompute, causing all page components (such as stats cards, Recharts plots, calendar highlights, and table logs) to re-render with the switched user's data.

---

## 🤖 AI & Theme Integration Questions

### Q7: How does the AI HR Chat Assistant answer contextually using Gemini REST API?
**Answer**:
We pass the active profile state down to the `ChatAssistant` component. We compile this context into a system prompt containing the worker's name, role, department, reporting manager, remaining leave categories, and attendance logs. We then make a direct `fetch` POST call to Google's Gemini 1.5 Flash REST API:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

This allows the model to answer HR queries based on actual user data.

### Q8: How did you fix class-based dark mode toggling in Tailwind v4?
**Answer**:
By default, Tailwind v4 compiles its dark variants matching media queries (`prefers-color-scheme: dark`). To enable class-based switches (`.dark` class on the `html` element), we added the custom variant selector to our main stylesheet:
```css
@variant dark (&:where(.dark, .dark *));
```
We also added CSS overrides for `react-calendar` text colors to guarantee high-contrast readability when the theme is toggled.
