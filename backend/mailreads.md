### 📧 Mailing System Implementation Prompt (Node.js + Brevo SMTP)

#### 🎯 Objective

Build a complete mailing system in a Node.js (Express) web application using SMTP (Brevo for testing). The system must be modular so that SMTP credentials can be easily replaced with in-house SMTP in production.

---

## ⚙️ Core Requirements

### 1. SMTP Integration

* Use **Nodemailer** for sending emails
* Configure SMTP using environment variables:

  * SMTP_HOST
  * SMTP_PORT
  * SMTP_USER
  * SMTP_PASS
* For development/testing, use Brevo SMTP
* Ensure system is designed to easily switch to in-house SMTP later without changing business logic

---

## 🔐 Authentication Emails

### A. User Signup - Email Verification

* When a user signs up:

  1. Generate a secure verification token
  2. Store token in database (linked to user)
  3. Send verification email with a link:

     ```
     http://yourdomain.com/verify/<token>
     ```
* When user clicks link:

  * Verify token
  * Mark user as verified
  * Remove token from DB

---

### B. Forgot Password

* When user requests password reset:

  1. Generate reset token (with expiry)
  2. Store in DB
  3. Send email with reset link:

     ```
     http://yourdomain.com/reset-password/<token>
     ```
* Reset flow:

  * Validate token + expiry
  * Allow user to set new password

---

## 📢 Notification System

### A. Admin → Project Manager (Ping for Report)

* Admin dashboard should have:

  * List of projects
  * Each project has a "Ping" button
* On clicking "Ping":

  * Identify project manager of that project
  * Send email:

    * Subject: "Reminder: Submit Project Report"
    * Content includes:

      * Project Name
      * Message requesting report submission

---

### B. Project Manager → Admin (Report Submission Notification)

* When project manager uploads report:

  * Automatically send email to admin
  * Email content:

    * Subject: "Report Submitted"
    * Body:

      ```
      A report for project <Project Name> has been submitted by the project manager.
      ```

---

## 🧱 Architecture Requirements

### 1. Mail Service Layer

* Create a dedicated mail service module (e.g., `/services/mailService.js`)
* All email logic must go through this layer
* No direct SMTP usage in controllers

---

### 2. Reusable Email Functions

Implement reusable functions like:

* sendVerificationEmail(user, token)
* sendPasswordResetEmail(user, token)
* sendProjectPingEmail(project, manager)
* sendReportSubmissionEmail(project, admin)

---

### 3. Async Handling

* Email sending should not block request-response cycle
* Use async/await properly
* Handle failures with try/catch and logging

---

### 4. Environment-Based Config

* Use `.env` file
* Support multiple environments:

  * development (Brevo SMTP)
  * production (in-house SMTP)

---

## 📦 Bonus (Optional but Recommended)

* Add email templates (HTML)
* Add token expiry for security
* Add logging for email success/failure
* Queue system (optional advanced)

---

## ✅ Expected Outcome

* Fully working email system covering:

  * Signup verification
  * Forgot password
  * Admin notifications
  * Project workflow notifications
* Easily switchable SMTP configuration
* Clean, modular, production-ready structure

---

## ⚠️ Constraints

* Do NOT tightly couple SMTP config with business logic
* Do NOT hardcode credentials
* Code should be scalable and maintainable

---

## 🚀 Tech Stack

* Node.js
* Express.js
* Nodemailer
* Brevo SMTP (for testing)

here is the brevo credentials for testing 


SMTP Server : smtp-relay.brevo.com
Port : 587
Login : a92f5e001@smtp-brevo.com

---

Build the system in a clean and structured way so it can be directly used in production after replacing SMTP credentials.
