# Project Plan: Fix Mobile White Page on Grading Tabs

## Overview
The user reported that the "My Score" (Điểm của tôi) and "Approval" (Cần duyệt) tabs in the Grading module return a blank/white page on mobile devices. This plan outlines the systematic investigation and resolution of this UI rendering issue.

## Project Type
WEB

## Success Criteria
- Opening the "My Score" tab on a mobile device (< 768px width) successfully displays the user's grading history.
- Opening the "Approval" tab on a mobile device successfully displays the list of employees awaiting approval.
- No React crashes or white pages occur upon tab navigation.
- The UI maintains the intended mobile responsive design.

## Tech Stack
- Frontend: React, Vite, Tailwind/Vanilla CSS
- Debugging: Chrome DevTools, React profiling

## File Structure
Relevant files for this debugging session:
- `src/pages/GradingPage.jsx`
- `src/components/EmployeeDetail.jsx`
- `src/pages/GradingPage.css`
- `src/components/EmployeeDetail.css`

## Task Breakdown

### Task 1: Debug Mobile View Crash
- **task_id:** T1
- **name:** Reproduce and Identify Error
- **agent:** `debugger`
- **skills:** `systematic-debugging`
- **priority:** P0
- **dependencies:** None
- **INPUT:** Mobile viewport, GradingPage, console logs.
- **OUTPUT:** Exact React stack trace or CSS issue causing the white page.
- **VERIFY:** Error is clearly identified with file and line number.

### Task 2: Fix Nested Rendering Logic
- **task_id:** T2
- **name:** Fix Component Rendering on Mobile
- **agent:** `frontend-specialist`
- **skills:** `frontend-design`, `clean-code`
- **priority:** P0
- **dependencies:** T1
- **INPUT:** React error stack trace, `EmployeeDetail.jsx`
- **OUTPUT:** Corrected JSX rendering logic that prevents nested structure crashes and safely unwraps elements.
- **VERIFY:** Component completes a full render cycle without throwing exceptions.

### Task 3: Adjust Responsive CSS
- **task_id:** T3
- **name:** Verify CSS Visibility Rules
- **agent:** `frontend-specialist`
- **skills:** `frontend-design`
- **priority:** P1
- **dependencies:** T2
- **INPUT:** Fixed DOM structure.
- **OUTPUT:** Updates to `GradingPage.css` or `EmployeeDetail.css` to ensure no overlapping or `.mobile-hidden` side effects.
- **VERIFY:** UI elements are visible and properly formatted as cards on small screens.

## Phase X: Verification
- [x] Code compiles without errors (`npm run build`).
- [x] No ESLint or typing errors introduced.
- [x] Manual test: Open the app on mobile viewport sizes and click both tabs; content must be visible.
