# PLAN - Implementation of RBAC Hierarchy

This plan outlines the implementation of a 5-level Role-Based Access Control (RBAC) system for the Airport Management HR system, based on the provided organizational hierarchy.

## Overview
The goal is to ensure that users (Managers, Heads of Departments, Team Leaders, etc.) have visibility and editing rights limited to their specific area of responsibility.

## Project Type
**WEB** (Next.js/React + Supabase)

## Hierarchy Map
Based on the image provided:

| Level | Role Name | Vietnamese Title | Scope |
| :--- | :--- | :--- | :--- |
| **L1** | **Super Admin** | Quản trị hệ thống | Toàn hệ thống |
| **L2** | **Board of Directors** | Ban giám đốc | Toàn hệ thống |
| **L3** | **Department Head** | Trưởng/Phó phòng | Theo `department` |
| **L4** | **Team Leader** | Trưởng/Phó đội | Theo `team` hoặc `group_name` |
| **L5** | **Employee** | Nhân viên | Cá nhân |

## Success Criteria
- [ ] Users at L3 and L4 are automatically restricted to viewing only employees within their scope.
- [ ] L2 (Board) can view/edit all data across all departments.
- [ ] L1 (Super Admin) remains the master override.
- [ ] Grading permissions: Supervisors can only score employees they oversee.
- [ ] UI reflects these restrictions (hidden fields/actions for unauthorized levels).

## Tech Stack
- **Supabase RLS**: Primary enforcement layer.
- **React Context**: Frontend state management for current user role and scope.
- **Helper Utilities**: Centralized logic for permission checking.

## File Structure
- `src/utils/permissionManager.js` [NEW]: Centralized logic to check scopes.
- `src/hooks/useRBAC.js` [NEW]: Custom hook for components.
- `src/contexts/AuthContext.jsx` [MODIFY]: Update mock user to support these roles.
- `supabase/migrations/20260201_implement_rbac_rls.sql` [NEW]: Row Level Security policies.

## Task Breakdown

### Phase 1: Foundation (P0)
- **T-1.1**: Define RBAC Roles & Scopes in a centralized utility. [Agent: `backend-specialist`]
- **T-1.2**: Update `AuthContext` to support a more complex user profile (Role + Department/Team binding). [Agent: `frontend-specialist`]
- **T-1.3**: Implement Supabase RLS policies for `employee_profiles` and `performance_reviews`. [Agent: `database-architect`]

### Phase 2: Core Frontend Logic (P1)
- **T-2.1**: Create `useRBAC` hook to determine component visibility. [Agent: `frontend-specialist`]
- **T-2.2**: Update `EmployeeList` (or `Employees.jsx`) to filter rows based on user scope. [Agent: `frontend-specialist`]
- **T-2.3**: Update `EmployeeDetail` to restrict "Save" and "Grading" actions based on hierarchy. [Agent: `frontend-specialist`]

### Phase 3: Validation (P2)
- **T-3.1**: Verify data isolation (A Team Leader from "Maintenance" cannot see "Ground Services" employees). [Agent: `test-engineer`]
- **T-3.2**: Verify Grading hierarchy (Team Leader scores member -> Manager reviews). [Agent: `test-engineer`]

## Phase X: Verification
- [ ] Run `python .agent/scripts/verify_all.py`
- [ ] Manual check: Login as different roles and verify visibility.
- [ ] Socratic Gate check: Did we confirm multi-role support? (Pending)

## Socratic Gate (Phase 0)
> [!IMPORTANT]
> **Questions for User:**
> 1. **Multi-role**: Can a user be a "Head of Department" and also directly lead a "Team"?
> 2. **CBA Context**: In the image, some teams are marked "(CBA)". Is this a separate sub-organization that needs its own permission silo?
> 3. **Board Access**: Should "Ban giám đốc" have full "Super Admin" power across profiles, or only for non-sensitive data?
