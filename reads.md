Act as a senior full-stack developer and system architect.

Build a complete production-ready web application for a government-level internship project called:

"QRAMS – Quality Requirement Audit Management System"

🎯 Objective:
The system is designed for DRDO to manage, monitor, and audit ongoing projects, track updates, assign members, and collect structured reports.

---

🖥️ UI/UX Requirements:
- Follow a clean, professional government dashboard style UI similar to DRDO portals
- Use a blue + white theme (inspired by the attached UI)
- Include:
  - Top header with organization name/logo
  - Clean centered layout
  - Card-based sections
  - Minimalistic buttons with shadows
- Fully responsive design (desktop-first)

---

🔐 AUTHENTICATION SYSTEM:
- Signup/Login system (JWT or session-based)
- Roles:
  1. Admin
  2. Project Member

---

🏠 USER FLOW:

1. Landing Page
   - Options: Login / Register

2. After Login → Home Dashboard
   - Overview of all projects
   - Stats:
     - Total projects
     - Active projects
     - Pending submissions
     - Completed audits

---

📁 PROJECT MANAGEMENT:

- Show all ongoing projects
- Each project contains:
  - Project Name
  - Description
  - Assigned Members
  - Status (Active / Pending / Completed)

👉 On clicking a project:
- Show:
  - List of members
  - Email IDs
  - Assigned tasks
  - Submission status

---

👨‍💼 ADMIN FEATURES:

Create a separate Admin Dashboard with:

1. Create / Edit / Delete Projects
2. Assign members to projects
3. Upload Documents (PDF, DOC, etc.)
4. Define submission forms (custom fields)
5. Track:
   - Who submitted
   - Who is pending
6. Send notification emails to all assigned members

---

📩 EMAIL AUTOMATION SYSTEM:

- When admin uploads a document or clicks "Notify Members":
  - Automatically send email to all assigned members
  - Email includes:
    - Project details
    - Submission deadline
    - Link to submit form

---

📤 DOCUMENT & FORM SYSTEM:

Admin:
- Upload documents
- Define required fields (dynamic form builder)

Members:
- View assigned documents
- Fill form with:
  - Progress updates
  - Comments
  - Attach files
- Submit responses

---

📊 TRACKING & MONITORING:

Admin Dashboard should include:
- Submission progress bars
- Member-wise performance
- Project status tracking
- Recent activities log

---

🔍 ADDITIONAL FEATURES (Important):

- Search + filter projects
- Role-based access control
- Notification system (in-app + email)
- File upload handling
- Audit logs
- Deadline reminders
- Clean error handling

---

⚙️ TECH STACK (Preferred):

Frontend:
- React.js (with Tailwind CSS)

Backend:
- Node.js + Express

Database:
- MongoDB

Authentication:
- JWT

Email:
- Nodemailer / SMTP integration

---

📁 STRUCTURE REQUIRED:

- Full folder structure
- Clean modular code
- API routes
- Database schema (Mongoose models)
- Reusable components

---

📌 BONUS (if possible):
- Add charts using Chart.js or Recharts
- Add role-based dashboard views
- Add export reports (PDF/CSV)

---

🎯 OUTPUT FORMAT:

1. System Architecture
2. Database Schema
3. Backend APIs
4. Frontend Components
5. Key Features Implementation
6. Folder Structure
7. Sample UI Code (React + Tailwind)

Make the system scalable, secure, and cleanly structured.