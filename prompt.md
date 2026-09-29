You are a senior full-stack developer and system architect.

Build a complete production-ready web application for:

Project Name: SQRMT (SSPL Quality Reliability Monitoring and Tracking)

Design Reference:
- Use a clean, professional government-style UI similar to DRDO portals
- Blue gradient header, minimal layout, centered content
- Corporate + formal theme (no flashy colors)
- Responsive design (desktop + mobile)

-----------------------------------
TECH STACK (strictly follow):
-----------------------------------
Frontend:
- React (with Next.js preferred)
- Tailwind CSS for styling
- Component-based architecture

Backend:
- Node.js + Express (or Next.js API routes)
- REST APIs

Database:
- MongoDB (Mongoose ORM)

Authentication:
- JWT-based authentication
- Role-based access (Admin, Member)

Email Service:
- Nodemailer (or any SMTP service)

-----------------------------------
CORE FEATURES:
-----------------------------------

1. AUTH SYSTEM
- Sign Up / Login
- Roles: Admin & Member
- Secure password hashing (bcrypt)
- JWT session handling

-----------------------------------

2. DASHBOARD / HOME PAGE
- Overview of all projects
- Stats:
  - Total Projects
  - Active Projects
  - Pending Updates
- Clean card-based layout

-----------------------------------

3. PROJECT MANAGEMENT

Admin Features:
- Create Project
- Assign Members to Project
- Upload documents (PDF, DOCX, etc.)
- Set submission deadlines

Member Features:
- View assigned projects
- See project details
- See all team members (name + email)

-----------------------------------

4. PROJECT DETAILS PAGE
- Project title, description
- Assigned members list (with email)
- Uploaded documents by admin
- Submission form for updates

-----------------------------------

5. EMAIL NOTIFICATION SYSTEM

When Admin:
- Assigns a project
- Uploads a document
- Clicks "Send Notification"

Then:
- All assigned members receive email automatically
- Email includes:
  - Project name
  - Instructions
  - Submission deadline
  - Link to project page

-----------------------------------

6. DOCUMENT MANAGEMENT

Admin:
- Upload documents for specific project
- View all submissions from members

Members:
- Upload required documents
- Fill update form (progress, notes, status)

-----------------------------------

7. PROJECT UPDATE TRACKING

Admin Dashboard:
- View each member's submission
- Status indicators:
  - Submitted
  - Pending
  - Late

-----------------------------------

8. ROLE-BASED ACCESS CONTROL

Admin:
- Full control (projects, users, assignments)

Member:
- Limited to assigned projects

-----------------------------------

9. UI REQUIREMENTS

- DRDO-style header (logo left, title center, emblem right)
- Clean buttons:
  - "Login"
  - "Register"
  - "View Projects"
- Card-based layout for projects
- Professional typography
- Consistent spacing

-----------------------------------

10. EXTRA FEATURES (IMPORTANT)

Add these smart features:
- Search & filter projects
- File preview (PDF viewer)
- Activity logs (who uploaded what & when)
- Notifications panel
- Deadline reminders
- Dark mode toggle (optional)

-----------------------------------

11. FOLDER STRUCTURE

Provide clean structure:

/frontend
  /components
  /pages
  /hooks
  /services

/backend
  /controllers
  /routes
  /models
  /middleware

-----------------------------------

12. DELIVERABLES

- Full frontend + backend code
- API routes
- Database schema
- Sample data
- Environment setup instructions
- README.md

-----------------------------------

13. CODE QUALITY

- Use clean, modular code
- Follow best practices
- Use async/await
- Error handling everywhere
- Comments for clarity

-----------------------------------

14. UI BONUS (IMPORTANT)

Match this style:
- Blue gradient header
- Centered welcome text
- Minimal buttons
- Government portal aesthetic

-----------------------------------

Now generate:
1. Complete architecture
2. Database schema
3. API design
4. Frontend pages
5. Backend code
6. Email system implementation
7. Deployment steps

Make it production-ready.