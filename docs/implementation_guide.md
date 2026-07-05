# 📚 Implementation Guide & Documentation: Employee Dashboard

This document details the core design system tokens, layout dimensions, responsive variables, component specifications, and React architecture of the Employee Dashboard.

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
- **Form Fields (Vertical Gutters)**: `16px` (`space-y-4`).

### 3. Theme Colors (V4 Tailwind Utilities)
- **Primary Brand Color**: `#3B82F6` (`bg-blue-600`, `text-blue-600`) - representing links, headers, and actions.
- **Success indicator (Present/Approved)**: `#10B981` (`bg-emerald-500`, `text-emerald-500`)
- **Warning indicator (Late/Pending)**: `#F59E0B` (`bg-amber-500`, `text-amber-500`)
- **Danger indicator (Absent/Rejected)**: `#EF4444` (`bg-red-500`, `text-red-500`)
- **Neutral Light Mode**:
  - Background: `#FFFFFF` (`bg-white`) / `#F9FAFB` (`bg-gray-50`)
  - Surface borders: `#E5E7EB` (`border-gray-250`)
  - Text Primary: `#111827` (`text-gray-900`)
- **Neutral Dark Mode**:
  - Background: `#0F172A` (`dark:bg-slate-950`) / `#1E293B` (`dark:bg-slate-900`)
  - Surface borders: `#334155` (`dark:border-slate-800`)
  - Text Primary: `#F1F5F9` (`dark:text-slate-100`)

---

## 🖼️ Page Component Library Specs

### 1. Header & Navigation Panel (`Header.tsx`)
- **Dimensions**: Full width, height `64px` (`h-16`), sticky position at top.
- **Spacing**: Side gutters `24px` (`px-6`), inner item spacing `16px` (`gap-4`).
- **Interactions**: Toggles collapsible mobile sidebar; clicking notifications bell opens a dropdown menu containing active items. User dropdown menu opens on avatar click.

### 2. Sidebar Navigation (`Sidebar.tsx`)
- **Widths**: Expanded width `256px` (`w-64`), collapsed width `80px` (`w-20`).
- **Transitions**: Smooth slide-in on mobile using `translate-x` triggers. Desktop expands/collapses width with ease-in-out transitions.
- **Links**: NavLinks dynamically read layout contexts, highlighting active links in blue.

### 3. Dashboard View (`Dashboard.tsx`)
- **Punch Status Card**: Large hero card utilizing a blue-to-indigo gradient background (`from-blue-600 to-indigo-700`). Shows a live, ticking session clock calculating worked duration in real-time.
- **Leave Overview**: Circular rings and progress meters showing Casual/Sick/Earned allocations.

### 4. Attendance Detail (`AttendancePage.tsx`)
- **Recharts Bar Chart**: Dynamic vertical bars representing days present over the last six months. Uses a custom tooltip styled in dark slate.
- **Heatmap Calendar**: A grid representing the current month where each day tile acts as a badge. Green tiles represent present, yellow represent late, red represent absent, and gray represent weekends.

### 5. Leaves & Request Modal (`LeavesPage.tsx`)
- **Leave Pie Chart**: Renders a circular distribution of used days.
- **Date Checkers**: Modal validates that the end date is on or after the start date, bounds dates to the future, and compares requested days with available leave balance.

### 6. Team Directory (`DirectoryPage.tsx`)
- **Grid Layout**: Spaced cards displaying large profile pictures, employee names, emails, roles, and telephone coordinates. Hovering elevates shadows and scales cards by `1.01`.
- **Search & Filters**: Debounced filter selectors mapping matches against departments, roles, and offices.

### 7. Profile Detail (`ProfilePage.tsx`)
- **Editable view**: Clicking "Edit Profile" unlocks inputs for avatar URLs, display names, telephone numbers, and biographies. Saving syncs variables with context and pushes updates to `localStorage`.
- **Org chart**: Traces relationships (manager, peers, and direct reports) and displays them in card trees.

---

## 📦 Status Tracking Checklist

- [x] **Project Setup & Scaffolding** — Complete
- [x] **Theme Switcher & LocalStorage** — Complete
- [x] **Header & Sidebar Responsive Wrappers** — Complete
- [x] **Dashboard View** — Complete
- [x] **Attendance Statistics & Recharts Bar Chart** — Complete
- [x] **Leaves Pie Chart, Calendar Tile Highlighter, and Form Validation** — Complete
- [x] **Teammates Filter and Grid/List Directory** — Complete
- [x] **Edit Profile and Organigram Org-Chart Relationships** — Complete
- [x] **Announcements Feed & AI Summary collapsible** — Complete
- [x] **AI HR Chat Assistant bubble** — Complete
- [x] **TypeScript and Production builds** — Complete
