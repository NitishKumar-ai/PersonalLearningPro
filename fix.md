# 🛠️ Implementation Plan: School Admin Role

## 🔍 Research Summary
The `school_admin` role is defined in the `LOGIN_FLOW_SYSTEM_DESIGN.md` documentation but is currently missing from the application's implementation (schemas, frontend routing, and sidebar). The system currently uses the `principal` role for similar administrative tasks.

## 📋 Requirements for Implementation
To fully integrate the `school_admin` role as a distinct entity, the following changes are required:

### 1. Database & Schema Updates
- **File:** `shared/schema.ts`
  - Update `insertUserSchema` to include `"school_admin"` in the `role` enum.
- **File:** `shared/mongo-schema.ts`
  - Update `MongoUser` and `MongoMessage` schemas to include `"school_admin"` in the `role` and `senderRole` enums.

### 2. Frontend Configuration & Type Safety
- **File:** `client/src/lib/firebase.ts`
  - Add `'school_admin'` to the `UserRole` type.
- **File:** `client/src/components/auth/firebase-auth-dialog.tsx`
  - Update the Zod validation schemas for registration to include the `school_admin` option.
  - Add a UI option for selecting the "School Admin" role.

### 3. Navigation & Routing
- **File:** `client/src/components/layout/sidebar.tsx`
  - Define `schoolAdminNavItems` (likely a hybrid of Principal and Admin views).
  - Update the role-based item selection logic.
- **File:** `client/src/App.tsx`
  - Add a case for `school_admin` in the `getDashboardComponent` function.
  - Create a protected route for `/school-admin-dashboard`.

### 4. Dashboards
- **File:** `client/src/pages/school-admin-dashboard.tsx` (New File)
  - Implement a dashboard focused on school-wide reports and teacher management as per the design document.

---
**Status:** Research Complete. Awaiting directive to begin implementation.
