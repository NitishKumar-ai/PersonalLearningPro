t# Implementation Plan: Complete Incomplete Features

## Overview

Implement nine partially-complete features in PersonalLearningPro: three new backend collections with full CRUD APIs (Tasks, Notifications, Focus Sessions), four frontend pages wired to real APIs (Tests List, Student Directory, Dashboards, Analytics), one auth bug fix (MessagePal), and one refactor (Landing page component extraction).

All backend work follows the established pattern: Zod schema → Mongoose model → storage methods → Express routes → frontend wiring.

## Tasks

- [x] 1. Add Zod schemas and Mongoose models for new collections
  - Add `insertTaskSchema`, `Task`, `InsertTask` types to `shared/schema.ts`
  - Add `insertNotificationSchema`, `Notification`, `InsertNotification` types to `shared/schema.ts`
  - Add `insertFocusSessionSchema`, `FocusSession`, `InsertFocusSession` types to `shared/schema.ts`
  - Add `MongoTask` Mongoose model to `shared/mongo-schema.ts`
  - Add `MongoNotification` Mongoose model with compound index `{ userId: 1, createdAt: -1 }` to `shared/mongo-schema.ts`
  - Add `MongoFocusSession` Mongoose model with compound index `{ userId: 1, completedAt: -1 }` to `shared/mongo-schema.ts`
  - _Requirements: 1.1, 2.1, 7.1_

  - [ ]* 1.1 Write property test for invalid task body rejection (Property 3)
    - **Property 3: Invalid task body is rejected**
    - **Validates: Requirements 1.6**
    - Use `fc.string().filter(s => !validStatuses.includes(s))` to generate invalid status values
    - Assert `insertTaskSchema.safeParse(body).success === false`

- [x] 2. Implement Tasks storage methods and API routes
  - Add `createTask`, `getTasksByUser`, `updateTask`, `deleteTask` to `IStorage` interface in `server/storage.ts`
  - Implement all four methods in `MongoStorage` using `MongoTask`; `updateTask` and `deleteTask` must verify `userId` ownership and return `undefined` / `false` on mismatch
  - Add `POST /api/tasks`, `GET /api/tasks`, `PATCH /api/tasks/:id`, `DELETE /api/tasks/:id` routes in `server/routes.ts`
  - Parse request bodies with `insertTaskSchema`; return 400 on Zod failure, 403 on ownership mismatch, 404 on not found
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ]* 2.1 Write property test for task user isolation (Property 1)
    - **Property 1: Task user isolation**
    - **Validates: Requirements 1.3**
    - Generate two tasks with distinct `userId` values; create both; fetch for userA; assert no userB task appears

  - [ ]* 2.2 Write property test for task CRUD round-trip (Property 2)
    - **Property 2: Task CRUD round-trip**
    - **Validates: Requirements 1.2, 1.4**
    - Generate valid task payloads; create via storage; fetch; assert `title`, `status`, `priority`, `tags` match; update one field; re-fetch; assert updated value reflected

- [x] 3. Implement Notifications storage methods and API routes
  - Add `createNotification`, `getNotificationsByUser`, `markNotificationRead`, `dismissNotification`, `markAllNotificationsRead` to `IStorage` and implement in `MongoStorage`
  - `getNotificationsByUser` must sort by `createdAt` descending
  - Add `GET /api/notifications`, `PATCH /api/notifications/read-all`, `PATCH /api/notifications/:id/read`, `DELETE /api/notifications/:id` routes
  - Note: register `read-all` route before `/:id` to avoid param capture
  - Return 403 when notification `userId` does not match authenticated user; 204 on successful delete
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.1 Write property test for notification ordering and user isolation (Property 4)
    - **Property 4: Notification ordering and user isolation**
    - **Validates: Requirements 2.2**
    - Generate N notifications with random `createdAt` timestamps for a user; create all; fetch; assert returned array is strictly descending by `createdAt` and contains no other user's notifications

  - [ ]* 3.2 Write property test for notification read round-trip (Property 5)
    - **Property 5: Notification read round-trip**
    - **Validates: Requirements 2.3**
    - Create an unread notification; call `markNotificationRead`; assert returned doc has `isRead === true`; fetch list; assert same notification shows `isRead === true`

  - [ ]* 3.3 Write property test for notification delete removes from list (Property 6)
    - **Property 6: Notification delete removes from list**
    - **Validates: Requirements 2.4**
    - Create a notification; call `dismissNotification`; fetch list; assert the notification's ID is absent from the result

- [-] 4. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Wire Tasks page to real API
  - In `client/src/pages/tasks.tsx`, replace `useState<Task[]>(MOCK_TASKS)` with `useQuery({ queryKey: ["/api/tasks"] })`
  - Add `useMutation` for task creation (`POST /api/tasks`) with optimistic cache update; roll back on error
  - Add `useMutation` for status update (`PATCH /api/tasks/:id`) triggered on kanban drag-and-drop; optimistic update
  - Add `useMutation` for delete (`DELETE /api/tasks/:id`) with cache invalidation
  - Remove the `MOCK_TASKS` constant
  - _Requirements: 1.7, 1.8, 1.9_

- [x] 6. Wire Notifications page to real API
  - In `client/src/pages/notifications.tsx`, replace `useState<Notification[]>(MOCK_NOTIFICATIONS)` with `useQuery({ queryKey: ["/api/notifications"] })`
  - Add `useMutation` for mark-read (`PATCH /api/notifications/:id/read`) with `invalidateQueries` on success
  - Add `useMutation` for dismiss (`DELETE /api/notifications/:id`) with `invalidateQueries` on success
  - Add `useMutation` for mark-all-read (`PATCH /api/notifications/read-all`) with `invalidateQueries` on success
  - Remove the `MOCK_NOTIFICATIONS` constant
  - _Requirements: 2.6, 2.7, 2.8, 2.9_

- [x] 7. Wire Tests List page to real API
  - In `client/src/pages/tests-list.tsx`, remove `MOCK_TESTS` constant
  - Add `useQuery<Test[]>({ queryKey: ["/api/tests"] })`
  - Extract a pure `mapServerTest(t: Test): StudentTest` helper function that maps server fields to the existing card UI shape
  - Extract a pure `computeStats(tests: StudentTest[])` helper that derives available/upcoming/completed counts and average score from the live array
  - Add loading skeleton using `Skeleton` from shadcn/ui while fetch is in progress
  - Add error state with a retry button (`refetch`) when fetch fails
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 7.1 Write property test for tests summary stats computed from real data (Property 7)
    - **Property 7: Tests summary stats computed from real data**
    - **Validates: Requirements 3.4**
    - Generate arbitrary arrays of test objects with random statuses; call `computeStats`; assert counts equal manual filter/reduce of the same array

- [x] 8. Wire Student Directory page to real API
  - In `client/src/pages/student-directory.tsx`, change query key to `["/api/users", { role: "student" }]`
  - Remove `enabled: false` from the `useQuery` call
  - Remove `mockStudents` fallback; replace with skeleton grid while loading and error message on failure
  - Ensure existing search/filter logic reads from the API response instead of the mock array
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 8.1 Write property test for student directory filter correctness (Property 8)
    - **Property 8: Student directory filter correctness**
    - **Validates: Requirements 4.4**
    - Extract `applyFilters` as a pure function; generate arbitrary student arrays and search terms; assert every result satisfies all active predicates and no matching student is excluded

- [x] 9. Wire Dashboard pages to real API data
  - In `admin-dashboard.tsx`: add `useQuery` calls for `GET /api/users?role=principal`, `GET /api/users?role=teacher`, `GET /api/users?role=student`, `GET /api/users?role=parent`, and `GET /api/users` (user table); replace hardcoded stat values with API counts
  - In `principal-dashboard.tsx`: add `useQuery` for `GET /api/tests` and `GET /api/users?role=student`; populate KPI cards from response lengths
  - In `parent-dashboard.tsx`: add `useQuery` for `GET /api/users/children`; populate children overview cards from response
  - In `school-admin-dashboard.tsx`: ensure activity feed and performance chart sections use real data queries alongside the existing `GET /api/school/teachers` call
  - Wrap each stat card in `Skeleton` while its query is loading; show inline error badge on failure without crashing the page
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 10. Fix MessagePal auth context
  - In `client/src/components/message/use-messagepal-ws.ts`, add optional `currentUserId?: number` parameter to `useMessagePalWebSocket`; replace all internal hardcoded `1` / `2` references with `currentUserId`; defer `connect()` when `currentUserId` is undefined
  - In `client/src/components/message/messagepal-panel.tsx`, read `currentUser` from `useFirebaseAuth`; resolve `userId = currentUser?.profile?.id`; render a loading state when `userId` is undefined; pass `userId` to `useMessagePalWebSocket(userId)`
  - Replace `p.id !== 1` with `p.id !== userId` in `MessageSidebar` participant identification
  - Replace `msg.senderId === 1` / `msg.recipientId === 1` with `msg.senderId === userId` / `msg.recipientId === userId` in `MessageChatWindow`
  - Resolve recipient via `activeConversation.participants.find(p => p.id !== userId)` instead of hardcoded `2`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 10.1 Write property test for MessagePal uses authenticated user ID (Property 9)
    - **Property 9: MessagePal uses authenticated user ID**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
    - Generate arbitrary `userId` and participant arrays; assert `participants.find(p => p.id !== userId)` never returns the current user; assert `isSent = msg.senderId === userId` is never a hardcoded constant

- [x] 11. Implement Focus Sessions persistence
  - Add `createFocusSession` and `getFocusSessionsByUser` to `IStorage` and implement in `MongoStorage` using `MongoFocusSession`
  - Add `POST /api/focus-sessions` (returns 201) and `GET /api/focus-sessions` (sorted by `completedAt` desc) routes in `server/routes.ts`
  - In `client/src/pages/focus.tsx`, add `useQuery({ queryKey: ["/api/focus-sessions"] })` on mount to populate session log and today's stats
  - Add `useMutation` for `POST /api/focus-sessions`; call it when the timer reaches zero with `{ subject, mode, durationSeconds }`
  - On mutation failure, retain the session in local `logs` state and show a toast error
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 11.1 Write property test for focus session round-trip (Property 10)
    - **Property 10: Focus session round-trip**
    - **Validates: Requirements 7.7, 7.2, 7.3**
    - Generate valid `{ subject, mode, durationSeconds }` payloads; create via storage; fetch; assert `subject`, `mode`, `durationSeconds` are identical to submitted values

- [~] 12. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement Individual Student Analytics tab
  - Add `GET /api/analytics/students` route in `server/routes.ts` that aggregates `TestAttempt` and `Analytics` documents into `StudentAnalyticsSummary[]`; return `[]` when no data exists
  - In `client/src/pages/analytics.tsx`, replace the "Coming Soon" content in `TabsContent value="individuals"` with `useQuery({ queryKey: ["/api/analytics/students"] })`
  - Create `client/src/components/dashboard/student-analytics-card.tsx` — a new sub-component that renders a student's name, average score, completion rate, and subject breakdown; expandable on click to show `recentAttempts` table
  - Render skeleton cards while loading; render "No student data available" empty state when result is an empty array
  - Remove the "Coming Soon" badge and placeholder content once real data renders
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ]* 13.1 Write property test for student analytics card renders required fields (Property 11)
    - **Property 11: Student analytics card renders required fields**
    - **Validates: Requirements 8.2**
    - Generate arbitrary `StudentAnalyticsSummary` objects with non-empty `subjectBreakdown`; render `StudentAnalyticsCard`; assert rendered output contains the student's name, rounded average score, and at least one subject

- [x] 14. Extract Landing page components
  - Create `client/src/components/landing/hero.tsx` — `Hero` component with props `heroImage?: string` and `onCta?: () => void`; use existing hero content as defaults
  - Create `client/src/components/landing/features.tsx` — `Features` component with prop `features?: FeatureCard[]`; define `FeatureCard` interface in the same file
  - Create `client/src/components/landing/testimonials.tsx` — `Testimonials` component with prop `testimonials?: Testimonial[]`; define `Testimonial` interface in the same file
  - Create `client/src/components/landing/cta.tsx` — `CallToAction` component with props `headline?: string`, `ctaLabel?: string`, `onCta?: () => void`
  - Create `client/src/components/landing/index.ts` — barrel export for all four components
  - Refactor `client/src/pages/landing.tsx` to import and compose the four extracted components; the visible UI must remain identical
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 14.1 Write snapshot test for landing page render equivalence (Property 12)
    - **Property 12: Landing page render equivalence**
    - **Validates: Requirements 9.2**
    - Render `landing.tsx` before and after refactoring; assert snapshots match (or render the composed page and assert all four section components are present in the output)

- [~] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 runs per property
- Each property test must include the comment: `// Feature: complete-incomplete-features, Property N: <property_text>`
- Register `PATCH /api/notifications/read-all` before `PATCH /api/notifications/:id/read` in routes to avoid Express param capture
- All new routes follow the existing pattern: Zod parse → 400 on failure → try/catch DB call → 500 on unexpected error
