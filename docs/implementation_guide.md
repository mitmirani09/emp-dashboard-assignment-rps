# 📚 Implementation Guide & Documentation: Employee Dashboard

This document details the core design system tokens, relational database linking, responsive sidebars, theme configuration, and real client-side Gemini API integrations.

---

## 🎨 Design System

### 1. Typography Hierarchy
All text layout properties are based on the **Inter** font:
- **Heading 1 (Page Title)**: Font Size `32px` (`text-3xl`), Weight `700` (`font-bold`), Line Height `1.2`
- **Heading 2 (Section Title)**: Font Size `24px` (`text-2xl`), Weight `600` (`font-semibold`), Line Height `1.3`
- **Heading 3 (Card Title)**: Font Size `18px` (`text-lg`), Weight `600` (`font-semibold`), Line Height `1.4`
- **Body Large**: Font Size `16px` (`text-base`), Weight `500` (`font-medium`), Line Height `1.5`
- **Body Regular (Default)**: Font Size `14px` (`text-sm`), Weight `400` (`font-normal`), Line Height `1.6`
- **Body Small (Metadata)**: Font Size `12px` (`text-xs`), Weight `400` (`font-normal`), Line Height `1.5`
- **Caption**: Font Size `11px` (`text-[11px]`), Weight `400`, Color Gray-400 / Slate-500

### 2. Spacing Parameters
Margins and paddings are mapped in increments of `4px` (Tailwind standard):
- **Gutters & Page Margins**: `24px` (`p-6` or `m-6`) on desktop, `16px` (`p-4`) on mobile.
- **Between Major Sections**: `48px` (`space-y-12` or `my-12`).
- **Between Subsections/Cards**: `16px` (`gap-4` or `space-y-4`).
- **Inside Card Padding**: `16px` or `20px` (`p-4` or `p-5`).

### 3. Theme Colors (Tailwind v4 class-selector configuration)
Vite utilizes Tailwind CSS v4 compiled with selector-based dark variant:
```css
@variant dark (&:where(.dark, .dark *));
```
This forces compilation of `dark:` utilities using CSS parent classes rather than system media queries:
- **Neutral Light Mode**:
  - Background: `#FFFFFF` (`bg-white`) / `#F9FAFB` (`bg-gray-50`)
  - Border surfaces: `#E5E7EB` (`border-gray-200`)
  - Text: `#111827` (`text-gray-900`)
- **Neutral Dark Mode (Sleek Slate Contrast)**:
  - Background: `#0F172A` (`dark:bg-slate-950`) / `#1E293B` (`dark:bg-slate-900`)
  - Card Surfaces: `#1E293B` (`dark:bg-slate-800`)
  - Border surfaces: `#334155` (`dark:border-slate-700`)
  - Text Primary: `#F8FAFC` (`dark:text-white`)
  - Text Secondary: `#CBD5E1` (`dark:text-slate-300`)

---

## 🗃️ Linked Relational Database Layout
Data tables inside `src/data/` establish relationships using a `employeeId` foreign key reference:
1. **Employees** (`mockEmployees.json`): Base table containing profile details.
2. **Attendance** (`mockAttendance.json`): Linked via `employeeId`. Includes **30 check-in/out logs** per employee.
3. **Leaves** (`mockLeaves.json`): Splits into `balances` and `requests` containing `employeeId` columns.
4. **Announcements** (`mockAnnouncements.json`): Stores **10 detailed announcements** with categories.

In `EmployeeContext.tsx`, `useMemo` hooks fetch the active user subsets on context load:
```typescript
const userAttendanceRecords = useMemo(() => {
  return attendanceRecords.filter(r => r.employeeId === currentUser.id);
}, [attendanceRecords, currentUser.id]);
```

---

## 👤 Switch Profile Sub-menu
The top navigation header dropdown menu exposes a **"Switch Profile"** selector. Selecting a peer swaps context parameters, updating graphs, request validation checkers, and chatbot greetings.

---

## 🤖 Direct Gemini REST Client
Client-side AI uses REST fetch requests pointing to Google's Gemini 1.5 Flash endpoint:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

- **System Context Injection**: The chat helper system prompt contains the employee's name, role, department, reporting manager, remaining leave categories, and attendance summaries, forcing the model to answer contextually.
- **Offline Fallback**: If the key is not defined, widgets revert to local keyword-matching engines and mock summary delays.

---

## 📱 Mobile Sidebar Header
Mobile sidebar displays a layout starting at `top-0` and spanning `h-full` with a backdrop overlay. The top of the menu contains a header displaying logomarks and an `X` button, allowing mobile users to close the sidebar.
