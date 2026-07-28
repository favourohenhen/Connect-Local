# Connect Local - MVP Implementation Plan

This plan details the implementation steps for the approved features from the MVP review, taking into account the typo corrections. Work proceeds **phase by phase** — each phase must be approved before the next begins.

## Decisions Made

> [!IMPORTANT]
> **Authentication Flow Change (Approved)**: We are switching from Email to **Phone + Password** for both User and Worker authentication. Since Supabase's native SMS OTP is a paid feature, we will implement this by using a placeholder email format under the hood (e.g., `[phonenumber]@connectlocal.app`) so we can still use Supabase's built-in authentication without incurring SMS costs, while the user only ever sees and interacts with the Phone Number field.

> [!NOTE]
> **Admin Dashboard (Approved)**: The Admin Dashboard will be placed at the `/admin` route. For this MVP, we will use a hardcoded admin credential (e.g., a specific admin phone number and password) and a simple Admin login check to keep it secure but straightforward without complex role-based access.

---

## Phase 1 — Data & Content Fixes
**Status**: ✅ Complete

Quick wins: fix typos in dummy data and street names across the app.

#### [MODIFY] [WorkerSearch.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/WorkerSearch.tsx)
- Fix typos in the dummy data:
  - Change `"Urhumwon"` → `"Urumwon"`
  - Change `"Opppostie"` → `"Opposite"`
- Ensure `street` options in the datalist match the corrected dummy data.

#### [MODIFY] [Landing.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/Landing.tsx)
- Update the images in the `popularServices` array to accurately represent each service category (e.g., Plumber, Barber, etc.).
- Update the datalist for streets to match the corrected names.

### Phase 1 Verification
- Search for workers in "Urumwon" and confirm the filter works correctly.
- Confirm street datalist options are consistent across Landing and WorkerSearch.

---

## Phase 2 — Authentication Updates (Phone + Password)
**Status**: ✅ Complete

Replace email-based auth with phone number for both workers and community users.

#### [MODIFY] [Signup.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/Signup.tsx)
- Remove the `Email Address` field.
- Ensure `Phone Number` acts as the primary identifier.
- Map phone to placeholder email (`[phonenumber]@connectlocal.app`) before calling Supabase auth.
- Rename "Cover Image" label → "Images of Previous Work" in Step 2.
- Ensure a "Back" arrow is clearly visible.

#### [MODIFY] [Login.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/Login.tsx)
- Remove `Email Address` field; replace with `Phone Number`.
- Update login logic to construct the placeholder email and authenticate via Supabase.
- Ensure a "Back" arrow is clearly visible.

#### [NEW] [UserSignup.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/UserSignup.tsx)
- Create a signup page for community users.
- Fields: Full Name, Phone Number, Street, Password.
- Apply the same phone → placeholder email pattern for Supabase auth.
- Include a "Back" arrow to the home page.

#### [NEW] [UserLogin.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/UserLogin.tsx)
- Create a login page for community users (Phone Number + Password).
- Apply the phone → placeholder email pattern.

#### [MODIFY] [App.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/App.tsx)
- Register the new routes: `/user/login`, `/user/signup`.

### Phase 2 Verification
- Register a new worker using a phone number; confirm Supabase auth entry uses placeholder email format.
- Register a new community user; log out and log back in to confirm the full auth flow.

---

## Phase 3 — Navigation & Dashboard Updates
**Status**: ✅ Complete

Add conditional logout/login UI to the nav, update the WorkerDashboard, and create the UserDashboard.

#### [MODIFY] [Landing.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/Landing.tsx)
- Add a "Logout" button to desktop and mobile navigation (conditionally rendered when a user is logged in).
- Add a "Login" link to the mobile navigation menu.

#### [MODIFY] [WorkerDashboard.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/WorkerDashboard.tsx)
- Add a "Pending Approval" banner for workers whose status is `unverified`.
- Ensure the edit profile feature is prominent.
- Ensure a "Back" arrow (or clear navigation) is present.

#### [NEW] [UserDashboard.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/UserDashboard.tsx)
- Create a minimal dashboard for community users.
- Include: Welcome message, quick link/search bar to `/search`, and a Logout button.

#### [MODIFY] [App.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/App.tsx)
- Register the `/user/dashboard` route.

### Phase 3 Verification
- Log in as a worker with `unverified` status; confirm the "Pending Approval" banner appears.
- Log in as a community user; confirm the UserDashboard loads and the Logout button works.
- Confirm mobile nav shows Login (logged out) and Logout (logged in) correctly.

---

## Phase 4 — Admin Dashboard & Recommendation Gating
**Status**: ✅ Complete

Build the admin dashboard for worker verification and gate recommendations behind login.

#### [NEW] [AdminDashboard.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/AdminDashboard.tsx)
- Create an admin page protected by hardcoded admin credentials.
- List all workers with `status: 'unverified'`.
- Display worker details: Name, Service, Street, Phone, Bio, Images.
- "Approve" button → sets status to `'verified'`.
- "Reject" button → removes or flags the worker.

#### [MODIFY] [WorkerSearch.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/WorkerSearch.tsx)
- Gate the "Add Recommendation" action behind login.
- Non-logged-in users clicking it are prompted to log in or sign up.
- Recommendation counts remain visible to everyone.

#### [MODIFY] [App.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/App.tsx)
- Register the `/admin` route.

### Phase 4 Verification
- Register a new worker → log into `/admin` → approve the worker → confirm they appear as `'verified'` in the public search.
- Attempt to add a recommendation as a guest (should prompt login).
- Log in as a user and successfully add a recommendation.

---

## Phase 5 — Job-Based Trust Rating System
**Status**: 🏗️ In Progress

Build a simple, trustworthy, job-based review system. A user can only review a worker if they have confirmed a completed job. The UX will be entirely tap-based.

### Core Data Structure (MVP via `localStorage`)
To keep the MVP fast without complex backend rules, we will emulate the required relational structure in `localStorage`:
- **`local_jobs`**: `[{ id, user_id, worker_id, status: 'pending'|'completed'|'failed', created_at }]`
- **`local_reviews`**: `[{ id, job_id, user_id, worker_id, rating: 5|3|1, tags: string[], would_rehire: boolean, created_at }]`

### Proposed Changes

#### [MODIFY] [WorkerSearch.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/WorkerSearch.tsx)
- **1. Contact Action:** Update the "Call" button to automatically generate a `pending` job record (if one doesn't exist) linking the `user_id` and `worker_id`.
- **2. Job Confirmation State:** Inside the worker modal, if a job is `pending`, display: *"Did this person do the job? [Yes] [No]"*. 
  - Yes → Job = `completed` (unlocks review).
  - No → Job = `failed` (blocks review).
- **3. Review Flow (Tap-Only Modal):** For a `completed` job without a review, show a "Leave Review" button that opens a simple 3-step tap modal:
  1. **Rating:** 👍 Good (5), 😐 Okay (3), 👎 Bad (1)
  2. **Tags:** 🛠️ Good work, 😊 Respectful, ⏱️ Fast, 💰 Fair price
  3. **Final:** "Would you call this worker again? [Yes] [No]"
- **4. Profile Display Redesign:** Update the worker modal to aggregate and display reviews dynamically:
  - Overall star rating (average of 5/3/1).
  - Recommendation count ("X people recommend this worker").
  - Tag summary (counts of each tag received).
  - Breakdown counts of 👍, 😐, and 👎.

#### [MODIFY] [UserDashboard.tsx](file:///c:/Users/USER/Desktop/Connect%20local/src/pages/UserDashboard.tsx)
- Add a **"My Recent Jobs"** section. This allows users to easily confirm jobs and leave reviews without having to search for the worker again.

#### [MODIFY] Fraud Control (App-Wide)
- **Job Gate:** Enforce 1 review per job.
- **Rate Limit:** Prevent users from creating more than 3 jobs per hour (to stop spam).
- **Admin Flag:** (Optional for Admin Dashboard) Flag workers who receive an unusually high number of "Good" reviews in 24 hours.

> [!NOTE]
> **Delay Decision:** For MVP testing, the easiest approach is **0 delay**. As soon as you click "Call", the job becomes pending and the "Did they do the job?" prompt will appear immediately. This allows you to test the entire flow end-to-end without waiting or clicking extra dev buttons.

### Verification Plan
- Click "Call" on a worker and verify a `pending` job is created.
- Confirm the job as "Yes" and verify the tap-only review modal appears.
- Submit a review (Good, tags, Yes to rehire) and verify the worker's profile stats update correctly.
- Ensure the user cannot submit a second review for the same job.
