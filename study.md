# QRAMS (Quality Requirement Audit Management System) - Study Guide

This document breaks down the QRAMS project from basic to advanced concepts, designed for interview preparation and deep understanding of the codebase.

---

## Part 1: The Whole Project Flow (How Frontend & Backend Connect)

Your project uses a **Client-Server Architecture**. Think of it like a restaurant:
* **The Frontend (Next.js/React)** is the dining room and the menu. It's what the user interacts with (buttons, forms, dashboards).
* **The Backend (Node.js/Express)** is the kitchen. It does the heavy lifting, processes data, and talks to the storage.
* **The Database (Neon PostgreSQL)** is the pantry where all your ingredients (data) are securely stored.

**How they connect:**
1. **User Action:** A user clicks a button on the frontend (e.g., "Create Project").
2. **HTTP Request:** The Next.js frontend sends a message (an HTTP Request) to the backend. It says: *"Hey Backend, I need you to create a project with this title and deadline."*
3. **Backend Processing:** The Express server receives the request. It checks if the user is allowed to do this (Authorization). If yes, it tells the **Prisma ORM** (a tool that translates Javascript to Database language) to save the data.
4. **Database Storage:** Prisma saves the data into your **Neon PostgreSQL database**.
5. **HTTP Response:** The backend replies to the frontend: *"Success! The project was created. Here is the new project data."*
6. **UI Update:** The frontend receives the data and updates the screen so the user sees their new project.

---

## Part 2: How Login and Authorization Work

Because QRAMS has sensitive DRDO data, it uses a very secure method called **JWT (JSON Web Tokens)** combined with **Role-Based Access Control (RBAC)**.

**The Login Flow:**
1. A user enters their email and password on the frontend.
2. The frontend sends this to the backend.
3. The backend looks up the email in the database. It compares the password using **bcrypt** (which mathematically scrambles the password so hackers can't read it).
4. If the password matches, the backend creates a **JWT (JSON Web Token)**. Think of this token as a secure, digital VIP ID card. It contains the user's ID and their role (`Admin` or `Member`).
5. The backend sends this VIP card (Token) back to the frontend.
6. The frontend saves this token in `localStorage` (the browser's memory).

**The Authorization Flow (How we protect data):**
Every time the frontend wants to fetch protected data (like reading documents), it attaches that VIP card (Token) to the request header. 
* **Middleware check:** The backend stops the request at the door. It reads the token.
* **Authentication (`protect`):** "Is this a real, unexpired VIP card?" If no, it kicks the user out (401 Unauthorized).
* **Authorization (`admin`):** "Does this user have the `Admin` role to do this specific action?" If no, it blocks them (403 Forbidden).

---

## Part 3: Code Dissection - Starting with the Backend Root

Let's dissect the very foundation of your backend: the root files (`.env` and `server.js`).

### 1. `backend/.env` (Environment Variables)
This file is the "secret vault" of your app. It holds sensitive keys that you **never** want to share publicly on GitHub.

```env
DATABASE_URL="postgresql://neondb_owner:.../neondb?sslmode=require..."
PORT=5005
JWT_SECRET="supersecret_drdo_qrams"
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=a92f5e001@smtp-brevo.com
SMTP_PASS=xsmtpsib-...
SMTP_FROM_EMAIL=zahid147web@gmail.com
FRONTEND_URL=http://localhost:3000
```
**Why you wrote this:**
* `DATABASE_URL`: Tells Prisma exactly where your cloud Neon database lives and how to securely log into it.
* `PORT`: Tells your server to listen for traffic on port 5005.
* `JWT_SECRET`: The cryptographic key used to "sign" your VIP ID cards (Tokens). If a hacker doesn't know this secret, they cannot forge a fake token.
* `SMTP_*`: Your Brevo email server credentials. Used by Nodemailer to send email notifications to members when documents are uploaded.

### 2. `backend/server.js` (The Server Entry Point)
This is the main brain of your backend. When you type `node server.js`, this is the file that runs. Let's look line-by-line:

```javascript
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const seedAdmin = require('./seed');
const fs = require('fs');
```
* **Why you wrote this:** You are importing external libraries. `express` creates the server, `dotenv` reads the `.env` file, `cors` allows your frontend to talk to your backend, and `fs`/`path` are used to interact with your computer's file system. `seedAdmin` is a script that creates a default Admin account when the server starts.

```javascript
// Load environment variables
dotenv.config();
const app = express();
```
* **Why you wrote this:** `dotenv.config()` takes everything in your `.env` file and loads it into Node.js memory (`process.env`). `const app = express();` initializes your actual web server object.

```javascript
// Middleware
app.use(cors());
app.use(express.json());
```
* **Why you wrote this:** Middlewares run *before* requests hit your routes. `cors()` prevents browser security errors when Next.js (port 3000) tries to talk to Node.js (port 5005). `express.json()` tells your server how to read JSON data sent from the frontend.

```javascript
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));
```
* **Why you wrote this:** This is where document uploads live. The server checks if a folder named `uploads` exists. If it doesn't, `fs.mkdirSync` creates it. `express.static` makes this folder public, meaning if someone goes to `http://localhost:5005/uploads/file.pdf`, they can download the file.

```javascript
// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
```
* **Why you wrote this:** This is the traffic cop. It routes incoming requests to the correct files. For example, if the frontend asks for `http://localhost:5005/api/auth/login`, this tells the server to hand that request over to the `authRoutes` file to handle it.

```javascript
// Start server
const startServer = async () => {
  await seedAdmin(); // Prisma connection managed implicitly

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
```
* **Why you wrote this:** This wraps everything up. Before starting to listen for frontend requests, it runs `seedAdmin()` to guarantee there is always at least one Admin user in the database. Finally, `app.listen()` turns on the server on Port 5005 and prints a success message to your terminal.

---

## Part 4: Code Dissection - Prisma Database Schema (`backend/prisma/schema.prisma`)

Prisma is the ORM (Object-Relational Mapping) layer. It translates your JavaScript database requests into raw SQL commands that PostgreSQL can understand. The `schema.prisma` file defines your entire database model.

Let's dissect `schema.prisma` block by block:

### 1. Database & Client Configuration (Lines 1-8)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}
```
* **Why you wrote this:**
  * `generator client`: Tells Prisma to automatically generate a tailored JavaScript SDK (`@prisma/client`) based on the models you write below. This allows you to type things like `prisma.user.findMany()` in your controllers with full auto-complete.
  * `datasource db`: Configures Prisma to connect to a **PostgreSQL** database. The `url = env("DATABASE_URL")` dynamic function retrieves your cloud Neon connection string from the `.env` file.

---

### 2. User & Authentication Models (Lines 10-43)

#### `PendingRegistration` (Unverified Sign-ups)
```prisma
model PendingRegistration {
  id                String   @id @default(uuid())
  name              String
  email             String   @unique
  password          String
  role              String   @default("Member")
  verificationToken String   @unique
  expiresAt         DateTime
  createdAt         DateTime @default(now())
}
```
* **Why you wrote this:** When users register, they shouldn't immediately gain access to the system. This model holds their registration details temporarily. If they verify their email by clicking the link sent to them before `expiresAt`, they are moved to the main `User` table. This keeps the main `User` database clean and secure from fake sign-ups.

#### `User` (Main User Table)
```prisma
model User {
  id                     String   @id @default(uuid())
  name                   String
  email                  String   @unique
  password               String
  role                   String   @default("Member")
  isVerified             Boolean  @default(false)
  verificationToken      String?
  resetPasswordToken     String?
  resetPasswordExpiresAt DateTime?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  assignedProjects     Project[]            @relation("ProjectMembers")
  documents            Document[]
  submissions          Submission[]
  activityLogs         ActivityLog[]
  notifications        Notification[]
  qualityObjectives    QualityObjective[]
  opportunityRegisters OpportunityRegister[]
  fracasReports        FracasReport[]
  riskAssessments      RiskAssessment[]
}
```
* **Why you wrote this:**
  * `id String @id @default(uuid())`: Generates a unique, non-guessable string ID for every user (e.g., `b17a02c3-982d-48f1...`).
  * `@unique` on email: Guarantees no two users can register with the same email.
  * `role`: Determines permissions (`Admin` or `Member`).
  * `@default(false)` on `isVerified`: Ensures users cannot log in unless their email verification is fully processed.
  * `assignedProjects Project[] @relation("ProjectMembers")`: This is the user-side of a **Many-to-Many** relationship. A user can be assigned to multiple projects, and a project can have multiple users assigned.
  * The rest of the lists (like `documents Document[]`, `submissions Submission[]`, etc.) define **One-to-Many** relations, linking users to the items they uploaded, submitted, or logged.

---

### 3. Core Project & Audit Tracking Models (Lines 45-123)

#### `Project` (The Audited Unit)
```prisma
model Project {
  id              String   @id @default(uuid())
  title           String
  description     String
  purpose         String   @default("")
  status          String   @default("Active")
  deadline        DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  assignedMembers      User[]                @relation("ProjectMembers")
  documents            Document[]
  submissions          Submission[]
  activityLogs         ActivityLog[]
  notifications        Notification[]
  qualityObjectives    QualityObjective[]
  opportunityRegisters OpportunityRegister[]
  fracasReports        FracasReport[]
  riskAssessments      RiskAssessment[]
}
```
* **Why you wrote this:** Represents projects within DRDO. The relation `assignedMembers User[]` maps back to the `User` model, completing the many-to-many relationship. All documents, logs, and quality forms uploaded for an audit are tied to a specific `Project` record.

#### `Document` (Uploaded Project Files)
```prisma
model Document {
  id          String   @id @default(uuid())
  title       String   @default("")
  description String   @default("")
  fileName    String
  fileUrl     String
  fileType    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  projectId    String
  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  uploadedById String
  uploadedBy   User     @relation(fields: [uploadedById], references: [id], onDelete: Cascade)
}
```
* **Why you wrote this:**
  * Stores details about audit files. `fileUrl` holds the path to where the file is stored.
  * `@relation` connects a document to its parent `Project` and the `User` who uploaded it.
  * `onDelete: Cascade`: Crucial for data integrity. If a project is deleted, all documents associated with it are automatically deleted from the database.

#### `Submission` (Progress Reports)
```prisma
model Submission {
  id            String   @id @default(uuid())
  progress      Int      @default(0)
  notes         String?
  attachedFiles Json     @default("[]")
  status        String   @default("Pending")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  memberId      String
  member        User     @relation(fields: [memberId], references: [id], onDelete: Cascade)
}
```
* **Why you wrote this:** Allows assigned members to log their audit progress percentage (0-100%) and notes. `attachedFiles Json` stores an array of file links (stored as text JSON) in case they upload proof documents with their submission.

#### `ActivityLog` (Security Audit Trail)
```prisma
model ActivityLog {
  id        String   @id @default(uuid())
  action    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
}
```
* **Why you wrote this:** DRDO audits require tracking who performed what action. Whenever a document is uploaded or progress is made, a log is saved.
* `onDelete: SetNull`: If a user account or a project is deleted, we **do not** want to lose the log of past actions. Setting the relation to `SetNull` keeps the logs in the database for compliance.

#### `Notification` (Internal Alerts)
```prisma
model Notification {
  id        String   @id @default(uuid())
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  projectId String?
  project   Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```
* **Why you wrote this:** Powers the bell icon alerts in your frontend. Tracks which notification belongs to which user (`userId`) and what project it is related to.

---

### 4. Advanced DRDO Audit Modules (Lines 125-212)

These models represent specialized templates required for DRDO audits and quality logs:

* **`QualityObjective`**: Targets, activities, responsibilities, and status logs to measure quality.
* **`OpportunityRegister`**: Opportunities for improvement, implementation plans, and expected benefits.
* **`FracasReport`**: (Failure Reporting, Analysis, and Corrective Action System) - Logs equipment or software failure details, descriptions, manufacturers, and corrective action statuses.
* **`RiskAssessment`**: Identifies risks, calculates risk scores (`likelihoodRating * impactRating`), assigns significance grades (Low, Medium, High), and identifies dealing officers.

---

## Part 5: Code Dissection - Backend Mail Service (`backend/services/mailService.js`)

QRAMS relies on emails for user security workflows (registration and password resets) and project alerts. Let's see how this is implemented.

### 1. Transporter Setup (Lines 5-14)
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```
* **Why you wrote this:**
  * Uses the **Nodemailer** library to connect to an external email-sending server (SMTP server).
  * It pulls credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) from the `.env` configuration file.
  * Your implementation is preconfigured to use **Brevo (formerly Sendinblue)** as the SMTP relay service, running securely over port `587`.

### 2. Available Mail Functions

#### `sendVerificationEmail(user, token)`
* **What it does:** Sends an onboarding email containing a verification URL: `http://localhost:3000/verify/<token>`.
* **Use Case:** Sent immediately when a user creates an account. The account remains locked (`isVerified: false` in the database) until they click this link.

#### `sendPasswordResetEmail(user, token)`
* **What it does:** Sends a custom-styled, secure email with a reset link: `http://localhost:3000/reset-password/<token>`.
* **Design Detail:** Designed with a professional blue theme labeled *DRDO Solid State Physics Laboratory (SSPL)*. It contains explicit warning notices (e.g. "This link expires in 1 hour", "Never share this link") for government security protocols.

#### `sendProjectPingEmail(project, manager, remarks)`
* **What it does:** Sends a prompt from an Administrator requesting that a Project Manager submit their project progress updates.
* **Feature:** Accepts an optional `remarks` string that embeds direct feedback/instructions written by the administrator into the email body.

#### `sendReportSubmissionEmail(project, admin)`
* **What it does:** Alerts the administrator when a team member submits their monthly progress report or audit files.

#### `sendQualitySubmissionEmail(admin, member, project, reportType, entryId, formatKey)`
* **What it does:** Notifies the administrator that a user has submitted a specialized quality audit document (e.g., Fracas Report, Risk Assessment, or Opportunity Register).
* **HTML Styling:** Formats a clean, readable review table within the email body showing the submitter, project title, and report type, along with a direct button linking to `/admin/quality/:projectId/:formatKey` to review and add remarks.

---

## Part 6: Database Design and Entity Relationship (ER) Architecture

The database is built on **Neon PostgreSQL**, a modern relational cloud engine. Using a relational DB allows the application to cleanly manage the connections between users, projects, and auditing templates.

Here is the structured architecture of the relationships between the database entities.

### 1. Many-to-Many (`N:M`) Relationships
* **`User` <===> `Project`**:
  * **How it is modeled:** A project has multiple assigned members, and a member can be assigned to multiple projects.
  * **Prisma details:** Prisma creates an implicit join table named `_ProjectMembers` containing `A` (User ID) and `B` (Project ID) with foreign key restraints mapping to both tables.

### 2. One-to-Many (`1:N`) Relationships
These define ownership structures inside QRAMS.

* **`User` (Admin) ===> `Document`**:
  * An Admin can upload many audit documents (`1:N`). Each document records its specific uploader (`uploadedById`).
* **`Project` ===> `Document`**:
  * A single project has many audit documents (`1:N`).
* **`User` (Member) ===> `Submission`**:
  * A member submits progress updates over time. A user owns multiple progress submissions.
* **`Project` ===> `Submission`**:
  * A project collects progress updates from all assigned members.
* **`User` ===> `Notification`**:
  * A user receives alerts when actions happen (e.g., a document is uploaded to their project).
* **`Project` ===> `Notification`**:
  * Notifications are bound to their respective projects so the user knows where the action took place.

### 3. Cascade Delete and Data Security Rules
* **Cascade Deletes (`onDelete: Cascade`)**:
  * Applied to `Document`, `Submission`, and `Notification` in relation to their `Project` and `User`.
  * **Why:** If an admin deletes a project, all its attached documents, progress logs, and notifications are immediately deleted, freeing space and avoiding corrupt relational links.
* **Retaining History (`onDelete: SetNull`)**:
  * Applied to the `ActivityLog` links (`userId` and `projectId`).
  * **Why:** If a user account is deleted, we **must not** erase the record of audit logs they created. By setting the ID to `Null`, the log entry (e.g., "Document uploaded") is kept for auditing compliance.
