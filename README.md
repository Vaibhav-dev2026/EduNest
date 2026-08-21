# EduNest — Smart Coaching & Institute Management System

MongoDB-backed coaching/institute management app with Admin, Teacher, and Student panels.

- **Frontend:** React.js + React Router + Bootstrap 5
- **Backend:** Node.js + **Express.js** + MongoDB **native driver** (no Mongoose)
- **Auth:** Custom signed token (JWT-style, HMAC-SHA256) + scrypt-hashed passwords

---

## What changed in this pass

The project was already in solid shape (ID generation, "Not Available" fallbacks, and
course/batch/teacher name resolution were already implemented well). This pass focused on:

1. **Fixed the real root-cause bug behind "No teacher profile found" / "Profile not linked yet":**
   Self-service Signup and the Admin's "Add Teacher / Add Student" forms used to be two
   disconnected flows — Signup created a login (`users`) record but never a `teachers`/`students`
   profile document, and Admin's Add Teacher/Student created a profile but never a login. Both
   directions are now linked:
   - Signup (role = teacher/student) now also creates the matching `teachers`/`students` document.
   - Admin's Add Teacher / Add Student now also creates a `users` login account automatically
     (using the student/teacher's email). The generated temporary password is shown once in the
     success message so the admin can share it — e.g. `Login: jane@x.com / TCH004@123`
     (mobile number is used as the temp password when a valid 10-digit number was entered).
2. **Migrated the backend from raw `http` routing to Express.js** — clean routers per module,
   `express.json()` body parsing, centralized error handling middleware, consistent
   `{ success, message, ... }` JSON responses, and proper status codes (400/401/403/404/409/500).
3. **Added the missing `GET /students/profile` endpoint** (the teacher equivalent already
   existed) and fixed `StudentProfile.jsx`, which was displaying raw `courseId`/`batchId`
   instead of resolved course/batch names.
4. **Passwords are now hashed** with Node's built-in `crypto.scrypt` (no new dependency).
   Legacy plain-text passwords, if any exist in your DB from before this change, still log in
   and are transparently upgraded to a hash on next successful login.
5. Centralized error handling now returns clean 400s for malformed IDs / JSON instead of
   raw 500s, and a shared ID-generator utility (`nextSequentialId`) is now used consistently
   for every module and by both the self-signup and admin-add flows, so IDs never collide.

## Known limitation of this pass

This code was reviewed, syntax-checked, and boot/route-tested (auth middleware, error handling,
404s, and JSON envelopes were verified with the server running against mocked requests). The
frontend was built successfully with `npm run build`. **Full CRUD testing against a live
MongoDB instance was not possible in the environment this was built in** (no MongoDB available)
— please do a smoke test against your own database before deploying: log in as admin, add a
teacher/student and confirm the returned temp password logs in, and check the Teacher/Student
"My Profile" pages populate correctly.

---

## Setup

### Backend
```bash
cd backend
npm install
# Edit .env if needed (PORT, MONGODB_URI, DB_NAME)
npm start
```
Runs on `http://localhost:5000` by default.

### Frontend
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000` by default and expects the backend at `http://localhost:5000`
(see `frontend/src/services/api.js` / `authService.js` if you need to change this).

### First admin account
There's no seed script — the first account is created via the **Signup** page
(`/signup`), which lets you pick a role including **Admin**. Create your admin account there,
then use the Admin Panel to add Teachers/Students (which will auto-create their login accounts).

---

## Project structure

```
edunest/
├── backend/
│   ├── config/database.js        # MongoDB connection (native driver)
│   ├── controllers/              # One file per module (students, teachers, courses, ...)
│   ├── middleware/auth.js        # Express auth/role middleware
│   ├── middleware/errorHandler.js
│   ├── routes/                   # One Express router per module
│   ├── utils/                    # ID generation, password hashing, token signing, helpers
│   └── server.js                 # Express app entry point
└── frontend/
    └── src/
        ├── pages/                # Admin / Teacher / Student panel pages
        ├── services/             # Fetch wrappers per module
        ├── layouts/, components/, routes/
```
