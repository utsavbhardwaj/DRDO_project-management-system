# QRAMS (Quality Requirement Audit Management System)

QRAMS is a robust, production-ready full-stack web application designed for DRDO to manage projects, audits, members, and documents across multiple teams.



1. Start the Backend
Open a new terminal and run the following commands:

bash
# Navigate to the backend directory
cd /Users/utsav/Downloads/DRDO/backend
# Install the necessary dependencies (only need to run this once)
npm install
# Start the Node/Express backend server
node server.js
2. Start the Frontend
Open a second (separate) terminal and run these commands:

bash
# Navigate to the frontend directory
cd /Users/utsav/Downloads/DRDO/frontend
# Install the necessary dependencies (only need to run this once)
npm install
# Start the Next.js development server
npm run dev
3. Access the Web App
Once both servers are running, open your browser and go to: 
\\

http://localhost:3000



## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT & bcrypt
- **Email Service**: Nodemailer

## Setup Instructions

### 1. Backend Setup
1. Open a new terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   node server.js
   ```
*Ensure you have MongoDB running on `mongodb://localhost:27017` or configure it in `.env`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```

### 3. Usage
- Go to `http://localhost:3000`
- Access the landing page.
- Log in or Register! Use `Admin` role when registering to view the Admin portal, or `Member` role to view assigned projects.

## Architecture
- **Projects & Audits**: Admins create projects, assign members, and upload root documents.
- **Submissions**: Members review documents and submit percentage progress logs.
- **RBAC**: Handled dynamically using JWT and protected Next.js API Routes.
