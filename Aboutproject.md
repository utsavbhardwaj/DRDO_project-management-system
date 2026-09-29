# SQRMT — SSPL Quality Reliability Monitoring and Tracking
### A Full-Stack Web Portal Built for DRDO

---

## 🚀 Project Overview

### What the Project Does
SQRMT (SSPL Quality Reliability Monitoring and Tracking) is a full-stack, role-based web application built for **DRDO (Defence Research and Development Organisation)**. It provides a centralized digital platform to manage research projects, audit workflows, team assignments, document distribution, progress submissions, and internal notifications — all within a secure, access-controlled environment.

### Problem It Solves
Before SQRMT, DRDO's internal project audit and quality management processes were largely **manual and paper-based** — documents were shared via email, team assignments were tracked on spreadsheets, and there was no centralized system to monitor audit progress or notify members of updates. This caused:
- Delays in document distribution
- Lack of visibility into team responsibilities
- No audit trail for project activity
- Unauthorized access to sensitive project information

SQRMT eliminates all of these pain points by bringing the entire workflow into one secure, structured digital portal.

### Target Users
| Role | Description |
|---|---|
| **Admin** | DRDO administrators who create projects, assign members, upload documents, and monitor progress |
| **Project Member** | DRDO researchers/staff assigned to specific projects who can view documents, submit progress reports, and collaborate with their team |

### Why This Project Is Important
In a government defence organization like DRDO, project accountability and audit compliance are critical. SQRMT ensures:
- Every action is logged via an **Activity Log**
- Only authorized users can access sensitive project data
- Documents reach the right people instantly with **in-app + email notifications**
- Progress can be tracked and reviewed in a structured, reportable format

---

## 🧠 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│              Next.js App (React 19 + Tailwind)          │
│         /login  /admin/dashboard  /member/dashboard     │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP REST API calls (fetch)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND SERVER                         │
│             Node.js + Express.js (REST API)             │
│  Routes → Middleware (JWT Auth + RBAC) → Controllers    │
│                  ↓              ↓                        │
│           Prisma ORM       Multer (File Upload)         │
│                  ↓                                       │
│         PostgreSQL (Neon Serverless DB)                 │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              NEON PostgreSQL (Cloud DB)                  │
│   Tables: User, Project, Document, Submission,          │
│           Notification, ActivityLog                      │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              NODEMAILER (Email Service)                  │
│    Sends email alerts on document uploads to members    │
└─────────────────────────────────────────────────────────┘
```

### Architecture Style
The system follows a **Layered MVC (Model-View-Controller)** architecture:

| Layer | Technology | Responsibility |
|---|---|---|
| **View (Presentation)** | Next.js + Tailwind CSS | UI rendering, routing, user interaction |
| **Controller** | Express.js Controllers | Business logic, request handling |
| **Model** | Prisma ORM + PostgreSQL | Data definition, queries, relationships |
| **Middleware** | JWT Auth + RBAC | Route protection, role enforcement |
| **Service Layer** | Nodemailer, Multer | Email service, file handling |

### Flow of Data Between Components
1. User interacts with the **Next.js frontend** (form submit, button click)
2. Frontend sends an **HTTP request** (GET/POST/PUT/DELETE) to the Express backend API
3. Request passes through **authentication middleware** (JWT token validation)
4. If route requires Admin role, the **RBAC middleware** checks user role
5. **Controller** processes the request: queries the database via Prisma, handles business logic
6. **Prisma ORM** translates the query to SQL and communicates with Neon PostgreSQL
7. Response data is sent back as **JSON** to the frontend
8. Frontend re-renders the relevant UI components with updated data

---

## ⚙️ Complete Workflow (Step-by-Step)

### 1. User Registration & Login
1. User visits `/login` or `/register` on the Next.js app
2. Upon registration, password is **hashed using bcryptjs** (10 salt rounds) before storing in DB
3. On login, the backend compares the submitted password with the stored hash using `bcrypt.compare()`
4. If valid, a **JWT token** is generated with the user's `id` and `role` (payload), signed with a secret key, and returned to the frontend
5. Frontend stores the JWT in `localStorage` and sends it in the `Authorization: Bearer <token>` header for all subsequent requests

### 2. Admin Creates a Project
1. Admin navigates to `/admin/dashboard` → clicks "Create Project"
2. Fills in title, description, purpose, deadline, and status
3. Frontend sends `POST /api/projects` with the project data
4. Backend's `protect` + `admin` middleware validates token and checks role
5. `createProject` controller creates a new record in the `Project` table via Prisma
6. Admin dashboard re-fetches and displays the updated project list

### 3. Admin Assigns Members to a Project
1. Admin visits a project's details page → opens "Assign Members" section
2. A list of all registered users is fetched via `GET /api/users`
3. Admin selects one or more users via a multi-select interface
4. Frontend sends `POST /api/projects/:id/add-members` with an array of user IDs
5. Backend's `addMembers` controller:
   - Validates each user exists
   - Prevents duplicate assignments
   - Updates the `Project`–`User` many-to-many relationship in PostgreSQL (the `_ProjectMembers` join table managed by Prisma)
6. Members now appear in the project's team section

### 4. Admin Uploads a Document
1. Admin selects a project → goes to the document upload section
2. Fills in title, description, and selects a file (PDF, DOCX, etc.)
3. Frontend sends a `multipart/form-data` POST request to `POST /api/documents/upload`
4. **Multer middleware** intercepts the request, saves the file to `/backend/uploads/` directory, and attaches file metadata to `req.file`
5. `uploadDocument` controller:
   - Saves document metadata (title, description, fileUrl, fileType, projectId, uploadedById) to the `Document` table
   - Creates an **ActivityLog** entry recording the upload action
   - Queries all `assignedMembers` for that project
   - Creates a **Notification** record for each member via `prisma.notification.createMany()`
   - Loops through members and sends an **email notification** via Nodemailer
6. Members see the notification bell update in real-time on their next API poll

### 5. Member Views Their Dashboard
1. Member logs in → redirected to `/member/dashboard`
2. Frontend calls `GET /api/projects` — backend returns only projects where the logged-in user is in `assignedMembers`
3. If user has **no assigned projects**, the dashboard shows: _"You are not assigned to any project yet"_ — no project data is exposed
4. Member clicks on a project → sees documents, team members, and can submit progress

### 6. Member Submits Progress
1. Member navigates to their project page → fills in progress percentage and notes
2. Frontend sends `POST /api/submissions` with `{ projectId, progress, notes, attachedFiles }`
3. Backend validates user is assigned to that project before creating a `Submission` record
4. Admin can view all submissions for a project from the admin panel

### 7. Notifications Flow
1. When a document is uploaded, `Notification` records are created for all project members in the DB
2. On any page load or navigation, frontend calls `GET /api/notifications`
3. Backend returns up to 50 most recent notifications for the logged-in user
4. Unread count is displayed on the notification bell icon
5. Member clicks "Mark as Read" → `PUT /api/notifications/:id/read` → sets `read: true` in DB
6. "Mark All Read" → `PUT /api/notifications/mark-all-read` → bulk updates all unread notifications

---

## 🛠️ Tech Stack & Why Chosen

### Frontend

| Technology | Why Chosen | How Used |
|---|---|---|
| **Next.js 16** | Production-grade React framework with App Router, server-side rendering, and file-based routing — ideal for a structured multi-page portal | All UI pages, routing (`/admin`, `/member`, `/login`), layout management |
| **React 19** | Latest stable React with improved rendering performance and hooks | Component state management, UI logic |
| **Tailwind CSS** | Utility-first CSS framework for rapid, consistent UI development without writing custom CSS files | All styling — responsive layouts, cards, forms, modals |
| **Heroicons** | Official icon library by the Tailwind CSS team — clean SVG icons that integrate seamlessly | Navigation icons, notification bell, status indicators |

### Backend

| Technology | Why Chosen | How Used |
|---|---|---|
| **Node.js** | Asynchronous, event-driven runtime — handles multiple concurrent API requests efficiently | Core server runtime |
| **Express.js v5** | Minimal, flexible web framework — chosen over alternatives like Fastify for its large ecosystem and simplicity | REST API routing, middleware chaining |
| **Prisma ORM** | Type-safe ORM with auto-generated client and schema-driven migrations — chosen over raw SQL for maintainability and safety | All database queries — CRUD for Users, Projects, Documents, etc. |
| **JWT (jsonwebtoken)** | Stateless, scalable authentication — no server-side session storage needed | Token generation on login, token validation on every protected route |
| **Bcryptjs** | Industry-standard password hashing — pure JavaScript implementation, no native dependencies | Password hashing on registration, comparison on login |
| **Multer** | Node.js middleware for handling `multipart/form-data` — simplest solution for file uploads in Express | Document file upload handling |
| **Nodemailer** | Well-established Node.js email library — reliable and easy to configure | Sending document upload email notifications to members |
| **dotenv** | Environment variable management — keeps secrets (DB URL, JWT secret) out of source code | Loading `.env` config variables |
| **CORS** | Cross-Origin Resource Sharing middleware — allows the Next.js frontend (port 3000) to communicate with the Express backend (port 5000) | Configured for frontend origin |

### Database

| Technology | Why Chosen | How Used |
|---|---|---|
| **PostgreSQL** | Relational DB — chosen for its strong support for complex relationships (many-to-many project-member assignments), ACID compliance, and reliability in production | Primary data store |
| **Neon (Serverless PostgreSQL)** | Cloud-hosted, serverless PostgreSQL — no infrastructure management, free tier available, scales automatically | Cloud database hosting — connection via `@neondatabase/serverless` driver |
| **Prisma** | Schema-first ORM — `schema.prisma` defines all models and relations, auto-generates type-safe client | Replaces raw SQL queries; handles migrations and relationships |

---

## 🔍 Core Features Breakdown

### Feature 1: Role-Based Access Control (RBAC)
- **How it works**: Every API route is protected by two middleware functions:
  - `protect`: Extracts and verifies the JWT from `Authorization: Bearer <token>` header. Decodes the user ID, fetches user from DB, attaches to `req.user`
  - `admin`: Checks if `req.user.role === 'Admin'`. If not, returns `403 Forbidden`
- **Example**: `router.post('/:id/add-members', protect, admin, addMembers)` — only admins can assign members
- **Frontend enforcement**: Next.js pages check the role from the decoded JWT stored in `localStorage` and redirect unauthorized users

### Feature 2: Member Assignment (Many-to-Many Relationship)
- **How it works**: Prisma manages a many-to-many relation between `User` and `Project` via the `_ProjectMembers` implicit join table in PostgreSQL
- **Schema**: `assignedMembers User[] @relation("ProjectMembers")` in Project model
- **Duplicate prevention**: The `addMembers` controller checks existing members before connecting new ones
- **Query used**: `prisma.project.update({ where: { id }, data: { assignedMembers: { connect: userIds.map(id => ({ id })) } } })`

### Feature 3: Document Upload & Notification Pipeline
- **How it works**: When a document is uploaded:
  1. Multer saves the file to `/uploads/` and returns the filename
  2. Document metadata is stored in the `Document` table
  3. An `ActivityLog` entry is created for auditing
  4. `prisma.notification.createMany()` creates one notification per assigned member — this is done in a **single batch query** to avoid N+1 problems
  5. Email notifications are sent in a `for...of` loop with individual try-catch blocks so one failed email doesn't crash the entire operation
- **Optimization**: Used `createMany` instead of individual `create` calls — reduces N database round trips to 1

### Feature 4: Access Restriction for Unassigned Users
- **How it works**: The `getProjects` backend controller fetches only projects where the requesting user appears in `assignedMembers`
- **Query**: `prisma.project.findMany({ where: { assignedMembers: { some: { id: userId } } } })`
- **Frontend**: If the returned projects array is empty, the member dashboard renders a friendly message instead of an empty shell

### Feature 5: Progress Submission System
- **How it works**: Members submit progress reports with a percentage (0-100), notes, and optional attached files (stored as JSON array)
- **Schema**: `Submission` model with `progress Int`, `notes String`, `attachedFiles Json`, `status String`
- **Use case**: Allows admins to track how far along each member is on their assigned project audit tasks

### Feature 6: Activity Logging
- **How it works**: Every significant action (document upload, member assignment, etc.) creates an `ActivityLog` record with `action`, `userId`, and `projectId`
- **Purpose**: Provides a full audit trail — critical for a government/defence organization like DRDO

---

## 🧩 Key Challenges & Solutions

### Challenge 1: Many-to-Many Relationship Without Duplication
**Problem**: When assigning members to a project, the same member could be added twice, causing data inconsistency.

**Solution**: Used Prisma's `connect` operation which links existing records without creating duplicates. Also added server-side validation to check if the user is already in `assignedMembers` before processing the request.

### Challenge 2: Batch Notifications Without N+1 Queries
**Problem**: Initial approach was to create notifications one-by-one using `prisma.notification.create()` inside a loop — this means N database calls for N members, which scales poorly.

**Solution**: Replaced with `prisma.notification.createMany()` which batches all notification inserts into a single SQL `INSERT` statement, regardless of how many members a project has.

### Challenge 3: Email Failures Shouldn't Break Document Upload
**Problem**: If one member's email address was invalid or the mail server was unreachable, the entire document upload operation would fail with an unhandled error.

**Solution**: Wrapped each `sendEmail()` call in an individual `try-catch` block inside a `for...of` loop. Email failures are logged to the console but don't throw — the main document upload and notification creation continues unaffected.

### Challenge 4: Secure File Storage
**Problem**: Uploaded files needed to be stored securely and served back to users correctly.

**Solution**: Multer was configured to save files to a local `/uploads/` directory with unique filenames. The `fileUrl` stored in the database is a relative path (`/uploads/filename`). The Express server serves this directory as a static folder, so files are accessible via `http://backend-url/uploads/filename`.

### Challenge 5: Role-Based Routing on the Frontend
**Problem**: Next.js doesn't natively block route access based on user roles — any URL can be manually typed.

**Solution**: Each protected page reads the JWT from `localStorage`, decodes it client-side, checks the role, and redirects to `/login` or shows an unauthorized message if the role doesn't match. This is enforced on every page's `useEffect` on mount.

---

## 📊 Data Handling

### Database Schema Design
The schema was designed with normalization and clear relationships in mind:

```
User ──< Submission
User ──< Document (uploadedBy)
User >──< Project (assignedMembers - Many-to-Many)
Project ──< Document
Project ──< Submission
Project ──< Notification
Project ──< ActivityLog
User ──< Notification
User ──< ActivityLog
```

### Data Flow for Document Upload
```
Client (multipart/form-data)
  → Multer middleware (saves file, adds req.file)
  → Controller extracts: title, description, projectId from req.body
  → Prisma: Document.create() + ActivityLog.create() + Notification.createMany()
  → Nodemailer: sends emails (non-blocking, errors caught)
  → Response: 201 Created with document data
```

### Key Data Validations
- User must exist before being assigned to a project
- Project must exist before document upload
- Notification ownership verified before marking as read (prevents users from marking others' notifications)
- JWT expiry handled — expired tokens return `401 Unauthorized`

---

## 🔐 Security & Optimization

### Authentication & Authorization
- **JWT-based stateless auth**: No server-side sessions. Each request carries a self-contained JWT
- **Password hashing**: `bcryptjs` with 10 salt rounds — resistant to brute force and rainbow table attacks
- **Role-based middleware**: Every admin-only route has `protect` + `admin` middleware chained — no admin action can be performed without both passing
- **Notification ownership check**: Before marking a notification as read, the controller verifies `notif.userId === req.user._id` — preventing horizontal privilege escalation

### Performance Optimizations
- **Batch DB operations**: `createMany` for bulk notification creation — single SQL statement
- **Selective field fetching**: Prisma `select` used to fetch only needed fields (e.g., `{ select: { id: true, name: true } }`) — avoids over-fetching sensitive data like password hashes
- **Pagination on notifications**: `take: 50` limit on notification queries — prevents unbounded queries
- **Cascade deletes**: Defined in Prisma schema (`onDelete: Cascade`) — deleting a project automatically cleans up all related documents, submissions, notifications, and logs

### Scalability Considerations
- **Neon Serverless PostgreSQL**: Auto-scales compute based on load — no manual instance management
- **Stateless backend**: Any number of Express server instances can run behind a load balancer since auth state lives in JWT, not server memory
- **Environment-based config**: All secrets (DB URL, JWT secret, email credentials) are in `.env` — easy to swap between dev/staging/production environments

---

## 🌍 Real-World Use Cases

| Use Case | Description |
|---|---|
| **DRDO Internal Audit Portal** | Primary use case — manage audit documents, track compliance progress across research teams |
| **Government Project Management** | Any government department needing role-based project and document management |
| **Corporate Compliance Systems** | Companies needing structured document distribution with notification trails |
| **Research Institution Portals** | Universities or R&D labs managing multi-team research projects and document sharing |
| **Defence Procurement Tracking** | Track quality requirements and audit submissions across procurement projects |

---

## 💡 Future Improvements

### Short-Term
- **Real-time notifications with WebSockets**: The `ws` package is already installed — replacing the current poll-based notification system with WebSocket push notifications for instant updates
- **File preview in browser**: Embed a PDF/DOCX viewer directly in the portal so members can preview documents without downloading
- **Pagination for project and member lists**: Add cursor-based pagination for large datasets

### Medium-Term
- **Email digest**: Daily/weekly email summaries of pending submissions and unread notifications
- **Advanced search & filters**: Filter projects by status, deadline, assigned members — critical for admins managing large numbers of projects
- **Admin analytics dashboard**: Charts showing submission progress rates, document upload frequency, active vs. inactive projects

### Long-Term
- **Microservices decomposition**: Split notification service, document service, and auth service into independent microservices for independent scaling
- **File storage migration to cloud**: Move from local `/uploads/` to AWS S3 or Google Cloud Storage for reliable, scalable, and redundant file storage
- **Audit report generation**: Auto-generate PDF audit reports for any project, summarizing documents uploaded, member submissions, and activity logs
- **Two-Factor Authentication (2FA)**: Add TOTP-based 2FA for admin accounts — critical for a security-sensitive environment like DRDO
- **Mobile App**: A React Native companion app so members can receive notifications and submit progress from mobile devices

---

*Built with Next.js · Node.js · Express.js · PostgreSQL (Neon) · Prisma ORM · JWT · Tailwind CSS*
