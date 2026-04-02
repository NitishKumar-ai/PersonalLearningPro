# Requirements Document

## Introduction

PersonalLearningPro is a school management platform built with React + Vite (client) and Express + MongoDB (server). Several features are currently incomplete — they either use hardcoded mock data instead of real API calls, have broken auth context wiring, or are missing backend persistence entirely. This document captures the requirements to complete all such features so the application functions end-to-end with real data.

The scope covers six areas:
1. Replacing mock data with real API calls on four frontend pages
2. Connecting dashboard pages to live backend data
3. Fixing MessagePal auth context (hardcoded user IDs)
4. Persisting focus sessions to the database
5. Implementing the individual student analytics view
6. Extracting reusable landing page components

---

## Glossary

- **API**: Application Programming Interface — the Express REST endpoints served under `/api/`
- **Auth_Context**: The Firebase authentication context (`useFirebaseAuth`) that provides the currently signed-in user's ID and profile
- **Dashboard**: A role-specific overview page (admin, principal, parent, school-admin, student)
- **Focus_Session**: A completed Pomodoro-style work or break interval recorded by a student
- **MessagePal**: The in-app direct-messaging feature backed by WebSockets and a REST API
- **Notification**: A system-generated event record (test assigned, result published, achievement, announcement, message, reminder) stored per user
- **Storage**: The `MongoStorage` class in `server/storage.ts` that wraps all MongoDB operations
- **Task**: A student study task with a status (backlog / todo / in-progress / review / done) and priority
- **TanStack_Query**: The React Query library used on the frontend for data fetching and caching
- **WebSocket_Hook**: The `useMessagePalWebSocket` hook in `use-messagepal-ws.ts`

---

## Requirements

### Requirement 1: Tasks API

**User Story:** As a student, I want my tasks to be saved and retrieved from the server, so that my study board persists across sessions and devices.

#### Acceptance Criteria

1. THE Storage SHALL expose `createTask`, `getTasksByUser`, `updateTask`, and `deleteTask` operations backed by a MongoDB collection.
2. WHEN a `POST /api/tasks` request is received with a valid task body and an authenticated session, THE API SHALL create the task in MongoDB and return the created task with HTTP 201.
3. WHEN a `GET /api/tasks` request is received with an authenticated session, THE API SHALL return all tasks belonging to the requesting user.
4. WHEN a `PATCH /api/tasks/:id` request is received with a valid partial task body and an authenticated session, THE API SHALL update the task and return the updated document.
5. IF a `PATCH /api/tasks/:id` request references a task that does not belong to the requesting user, THEN THE API SHALL return HTTP 403.
6. IF a request body fails schema validation, THEN THE API SHALL return HTTP 400 with a descriptive error message.
7. WHEN the Tasks page (`tasks.tsx`) mounts, THE Tasks_Page SHALL fetch tasks from `GET /api/tasks` using TanStack_Query and render them in the kanban board.
8. WHEN a user drags a task card to a new column, THE Tasks_Page SHALL send a `PATCH /api/tasks/:id` request to persist the new status.
9. WHEN a user clicks "New Issue", THE Tasks_Page SHALL send a `POST /api/tasks` request and optimistically update the board.

---

### Requirement 2: Notifications API

**User Story:** As a student, I want to receive and manage real notifications from the server, so that I am informed about tests, results, and announcements without relying on hardcoded data.

#### Acceptance Criteria

1. THE Storage SHALL expose `createNotification`, `getNotificationsByUser`, `markNotificationRead`, and `dismissNotification` operations backed by a MongoDB collection.
2. WHEN a `GET /api/notifications` request is received with an authenticated session, THE API SHALL return all notifications for the requesting user, ordered by creation time descending.
3. WHEN a `PATCH /api/notifications/:id/read` request is received with an authenticated session, THE API SHALL mark the notification as read and return the updated document.
4. WHEN a `DELETE /api/notifications/:id` request is received with an authenticated session, THE API SHALL soft-delete (or hard-delete) the notification and return HTTP 204.
5. IF a request targets a notification that does not belong to the requesting user, THEN THE API SHALL return HTTP 403.
6. WHEN the Notifications page (`notifications.tsx`) mounts, THE Notifications_Page SHALL fetch notifications from `GET /api/notifications` using TanStack_Query.
7. WHEN a user clicks a notification card, THE Notifications_Page SHALL send `PATCH /api/notifications/:id/read` and update the local unread count.
8. WHEN a user clicks the dismiss button on a notification, THE Notifications_Page SHALL send `DELETE /api/notifications/:id` and remove the card from the list.
9. WHEN a user clicks "Mark all read", THE Notifications_Page SHALL send `PATCH /api/notifications/read-all` and update all local notification states to read.

---

### Requirement 3: Wire Tests List to Real API

**User Story:** As a student, I want the Tests & Assessments page to show my actual assigned tests from the server, so that I can see real due dates, statuses, and scores.

#### Acceptance Criteria

1. WHEN the Tests List page (`tests-list.tsx`) mounts, THE Tests_List_Page SHALL fetch tests from `GET /api/tests` using TanStack_Query instead of rendering `MOCK_TESTS`.
2. WHILE the fetch is in progress, THE Tests_List_Page SHALL render a loading skeleton in place of the test cards.
3. IF the fetch returns an error, THEN THE Tests_List_Page SHALL display an error state with a retry button.
4. WHEN test data is received, THE Tests_List_Page SHALL compute summary stats (available, upcoming, completed, average score) from the real data.
5. THE Tests_List_Page SHALL map the server `Test` schema fields (`status`, `dueDate`, `totalMarks`, `subject`, `teacherId`) to the existing card UI without changing the visual design.

---

### Requirement 4: Wire Student Directory to Real API

**User Story:** As a school admin or teacher, I want the Student Directory to show real student records from the database, so that I can search and filter actual enrolled students.

#### Acceptance Criteria

1. WHEN the Student Directory page (`student-directory.tsx`) mounts, THE Student_Directory_Page SHALL fetch students from `GET /api/users?role=student` using TanStack_Query with the query key `["/api/users", { role: "student" }]`.
2. WHILE the fetch is in progress, THE Student_Directory_Page SHALL render a loading skeleton grid.
3. IF the fetch returns an error, THEN THE Student_Directory_Page SHALL display an error message.
4. WHEN student data is received, THE Student_Directory_Page SHALL replace `mockStudents` with the API response and apply the existing search and filter logic.
5. THE Student_Directory_Page SHALL enable the `useQuery` call (remove `enabled: false`) so it executes on mount.

---

### Requirement 5: Dashboard Real Data

**User Story:** As an admin, principal, parent, or school admin, I want my dashboard to display live statistics from the database, so that I can make informed decisions based on current data.

#### Acceptance Criteria

1. WHEN the Admin Dashboard (`admin-dashboard.tsx`) mounts, THE Admin_Dashboard SHALL fetch user counts by role from `GET /api/users?role=<role>` and display real totals for principals, teachers, students, and parents.
2. WHEN the Admin Dashboard user table is rendered, THE Admin_Dashboard SHALL fetch and display real user records from `GET /api/users`.
3. WHEN the Principal Dashboard (`principal-dashboard.tsx`) mounts, THE Principal_Dashboard SHALL fetch test counts from `GET /api/tests` and student counts from `GET /api/users?role=student` to populate KPI cards.
4. WHEN the Parent Dashboard (`parent-dashboard.tsx`) mounts, THE Parent_Dashboard SHALL fetch the authenticated parent's linked student records from `GET /api/users/children` (or equivalent) to populate the children overview cards.
5. WHEN the School Admin Dashboard (`school-admin-dashboard.tsx`) mounts, THE School_Admin_Dashboard SHALL fetch teacher records from `GET /api/school/teachers` and display them in the teachers list (this endpoint already works; the requirement is to ensure the activity feed and performance chart also use real data where available).
6. IF any dashboard data fetch fails, THEN THE Dashboard SHALL display a graceful error state for the affected section without crashing the entire page.
7. WHILE any dashboard data fetch is in progress, THE Dashboard SHALL render skeleton placeholders for the affected stat cards.

---

### Requirement 6: MessagePal Auth Context Fix

**User Story:** As a logged-in user, I want MessagePal to use my real user ID from the auth context, so that messages are sent and received under my actual identity rather than a hardcoded placeholder.

#### Acceptance Criteria

1. THE MessagePal_Panel SHALL read the current user's numeric ID from Auth_Context (via `useFirebaseAuth` or the `/api/users/me` endpoint) instead of using the hardcoded literal `1`.
2. WHEN the MessageSidebar renders conversation items, THE MessageSidebar SHALL use the authenticated user's ID to identify the "other" participant in each conversation.
3. WHEN the MessageChatWindow renders messages, THE MessageChatWindow SHALL use the authenticated user's ID to determine message alignment (sent vs. received).
4. WHEN the MessageChatWindow marks messages as read, THE MessageChatWindow SHALL pass the authenticated user's ID instead of the hardcoded literal `1`.
5. WHEN the MessageChatWindow sends a message, THE MessageChatWindow SHALL resolve the recipient ID from the active conversation's participant list rather than using the hardcoded literal `2`.
6. IF the authenticated user's ID cannot be resolved, THEN THE MessagePal_Panel SHALL display a loading state and defer WebSocket connection until the ID is available.
7. THE WebSocket_Hook SHALL accept an optional `currentUserId` parameter so callers can pass the resolved ID without internal hardcoding.

---

### Requirement 7: Focus Sessions Persistence

**User Story:** As a student, I want my completed focus sessions to be saved to the database, so that my study history and streaks are accurate across sessions and devices.

#### Acceptance Criteria

1. THE Storage SHALL expose `createFocusSession` and `getFocusSessionsByUser` operations backed by a MongoDB collection with fields: `userId`, `subject`, `mode` (work/short/long), `durationSeconds`, `completedAt`.
2. WHEN a `POST /api/focus-sessions` request is received with a valid body and an authenticated session, THE API SHALL persist the focus session and return the created document with HTTP 201.
3. WHEN a `GET /api/focus-sessions` request is received with an authenticated session, THE API SHALL return all focus sessions for the requesting user, ordered by `completedAt` descending.
4. WHEN a focus session timer reaches zero in the Focus page (`focus.tsx`), THE Focus_Page SHALL send a `POST /api/focus-sessions` request with the session details.
5. WHEN the Focus page mounts, THE Focus_Page SHALL fetch today's sessions from `GET /api/focus-sessions` using TanStack_Query and use them to populate the session log and today's stats.
6. IF the `POST /api/focus-sessions` request fails, THEN THE Focus_Page SHALL retain the session in local state so the user's in-session progress is not lost.
7. FOR ALL focus sessions created and then retrieved, THE API SHALL return the same `userId`, `subject`, `mode`, and `durationSeconds` values that were submitted (round-trip property).

---

### Requirement 8: Individual Student Analytics

**User Story:** As a teacher, I want to view per-student performance breakdowns in the Analytics page, so that I can identify students who need additional support.

#### Acceptance Criteria

1. WHEN a teacher selects the "Individual Students" tab in the Analytics page (`analytics.tsx`), THE Analytics_Page SHALL fetch per-student analytics from `GET /api/analytics/students` using TanStack_Query.
2. WHEN student analytics data is received, THE Analytics_Page SHALL render a list of student cards showing each student's name, average score, test completion rate, and subject breakdown.
3. WHILE the fetch is in progress, THE Analytics_Page SHALL render skeleton cards in place of the "Coming Soon" placeholder.
4. IF the fetch returns an empty result, THEN THE Analytics_Page SHALL display a "No student data available" empty state.
5. WHEN a teacher clicks a student card, THE Analytics_Page SHALL expand or navigate to a detail view showing that student's test-by-test score history.
6. THE Analytics_Page SHALL remove the "Coming Soon" badge and placeholder content from the "Individual Students" tab once real data is available.

---

### Requirement 9: Landing Page Component Extraction

**User Story:** As a developer, I want the landing page's UI sections extracted into reusable components, so that the codebase is maintainable and individual sections can be tested or reused independently.

#### Acceptance Criteria

1. THE Landing_Page SHALL be refactored so that each major section (hero, features, testimonials, call-to-action) is implemented as a separate component file under `client/src/components/landing/`.
2. WHEN the landing page (`landing.tsx`) renders, THE Landing_Page SHALL import and compose the extracted components without any change to the visible UI.
3. THE Landing_Components SHALL accept props for any text or data that varies between uses, rather than hardcoding content inside the component.
4. WHERE a landing section contains an image or illustration, THE Landing_Component SHALL accept the image source as a prop with a sensible default.
5. THE `client/src/components/landing/` directory SHALL contain at least one index file or barrel export so components can be imported from a single path.
