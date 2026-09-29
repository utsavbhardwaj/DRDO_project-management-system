You are a senior full-stack developer. I already have a working web application called SQRMT (SSPL Quality Reliability Monitoring and Tracking). The current system supports authentication, project creation, and basic dashboard functionality.

Now extend the system by implementing the following features with clean architecture, scalable design, and proper role-based access control.

-----------------------------------
🔐 ROLES:
- Admin
- Project Member (User)

-----------------------------------
🧩 FEATURE 1: Project Members Info
-----------------------------------
- Each project should store and display:
  - Member Name
  - Email ID
- Update the Project schema/model:
  - Add a "members" field (array of user references)
- On the Project Details page:
  - Show list of assigned members with name + email

-----------------------------------
🧩 FEATURE 2: Admin Assign Members to Project
-----------------------------------
- Admin should be able to:
  - View all registered users (who signed up in SQRMT)
  - Select multiple users and assign them to a project

- UI:
  - Multi-select dropdown or modal
  - Search users by name/email

- Backend:
  - API: POST /projects/:id/add-members
  - Validate:
    - Only Admin can assign members
    - User must exist
    - Avoid duplicates

-----------------------------------
🧩 FEATURE 3: Document Upload + Notifications
-----------------------------------
- Admin can upload documents for a project:
  - File types: PDF, DOCX, etc.
  - Stored in cloud/local storage

- Each document should include:
  - Title
  - Description (e.g., "Submit your project report")
  - Uploaded file
  - Project reference
  - Timestamp

- UI:
  - Admin dashboard → Upload section
  - Members → View documents under their project

- Notification System:
  - When a document is uploaded:
    - Notify all project members of that project
    - Notification types:
      - In-app notification (required)
      - Optional: Email notification

- Backend:
  - Notification schema:
    - userId
    - message
    - projectId
    - read/unread

-----------------------------------
🧩 FEATURE 4: Restrict Unassigned Users
-----------------------------------
- If a user is NOT assigned to any project:
  - Do NOT show project dashboard
  - Show message:
    "You are not assigned to any project yet"

- Backend:
  - Check user's assigned projects before allowing access

-----------------------------------
🧩 FEATURE 5: Members Can View Fellow Members
-----------------------------------
- Each project member should be able to:
  - View all other members in the same project

- UI:
  - "Team Members" section inside project dashboard

-----------------------------------
⚙️ TECH IMPLEMENTATION GUIDELINES:
-----------------------------------
- Use proper MVC / modular architecture
- Use role-based middleware for Admin routes
- Optimize queries (avoid N+1 problems)
- Maintain clean API structure
- Ensure secure file upload handling
- Use reusable components for UI

-----------------------------------
📦 OPTIONAL ENHANCEMENTS (if possible):
-----------------------------------
- Real-time notifications (WebSockets)
- Email alerts using Nodemailer
- File preview option
- Pagination for users list

-----------------------------------
📌 OUTPUT REQUIRED:
-----------------------------------
- Updated database schema/models
- API endpoints (with request/response)
- Frontend components structure
- Flow explanation for each feature
- Any middleware required

Ensure the code is clean, production-ready, and scalable.