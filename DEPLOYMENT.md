# DRDO Project Management System - Deployment Guide

This guide details how to deploy the **Next.js Frontend on Vercel** and the **Express + Prisma Backend on Render** (or Railway).

---

## Architecture Overview

- **Frontend**: Next.js 16 (Turbopack, React 19) hosted on **Vercel**.
- **Backend**: Express + Prisma ORM + Neon PostgreSQL hosted on **Render** (as a persistent Node.js Web Service).
- **Communication**: Frontend makes API calls to backend via `NEXT_PUBLIC_API_URL`. Backend sends email links pointing to `FRONTEND_URL`.

---

## Step 1: Commit and Push Changes to GitHub

All hardcoded `localhost:5005` endpoints have been centralized to use `NEXT_PUBLIC_API_URL`, and the backend has been configured with `npm start` and `postinstall: prisma generate`.

Push these changes to your GitHub repository:

```bash
git add .
git commit -m "Configure project for Vercel and Render deployment"
git push origin main
```

---

## Step 2: Deploy Backend to Render (Free Web Service)

Since the backend handles file uploads (`uploads/`) and runs an Express server, deploying it as a Node.js Web Service on [Render](https://render.com) is recommended.

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Select **Build and deploy from a Git repository** and choose `utsavbhardwaj/DRDO_project-management-system`.
3. Configure the service settings:
   - **Name**: `drdo-backend` (or your preferred name)
   - **Region**: Singapore or closest to your database (Neon is in `ap-southeast-1`)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
     *(This automatically triggers `prisma generate` via the `postinstall` script)*
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   | Variable | Value | Notes |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://...` | Your Neon connection string from `backend/.env` |
   | `JWT_SECRET` | `supersecret_drdo_qrams` | Your JWT secret |
   | `PORT` | `5005` | Render also assigns dynamic PORT automatically |
   | `SMTP_HOST` | `smtp-relay.brevo.com` | Brevo SMTP host |
   | `SMTP_PORT` | `587` | Brevo SMTP port |
   | `SMTP_USER` | `...` | Your Brevo user from `backend/.env` |
   | `SMTP_PASS` | `...` | Your Brevo key from `backend/.env` |
   | `SMTP_FROM_EMAIL` | `...` | Your verified sender email |
   | `FRONTEND_URL` | `http://localhost:3000` | Temporarily set to localhost or leave blank; update in Step 4 with your Vercel URL |

5. Click **Deploy Web Service**.
6. Once deployment finishes, copy your Render Web Service URL:
   `https://drdo-backend.onrender.com` (example)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
2. Connect your GitHub account and import `utsavbhardwaj/DRDO_project-management-system`.
3. In the **Configure Project** screen:
   - **Project Name**: `drdo-frontend` (or any preferred name)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `frontend`, then click **Continue**.
4. Expand **Environment Variables**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://drdo-backend.onrender.com` *(Use your actual Render backend URL from Step 2, without trailing slash)*
5. Click **Deploy**.
6. Vercel will build and deploy your Next.js application.
7. Once completed, your app will be live at:
   `https://drdo-frontend.vercel.app` (or similar Vercel domain).

---

## Step 4: Final Link — Update FRONTEND_URL on Backend

Now that your frontend has a live Vercel URL:

1. Return to your [Render Dashboard](https://dashboard.render.com/) → Select your `drdo-backend` service.
2. Go to **Environment** tab.
3. Update `FRONTEND_URL`:
   - Value: `https://your-project.vercel.app` *(your actual Vercel domain)*
4. Click **Save Changes** (Render will automatically redeploy with the new setting).

This ensures that email verification links and password reset links sent to users direct them to your live Vercel deployment.

---

## Testing & Verifying Deployment

1. **User Registration & Email Verification**:
   - Open your Vercel app URL (`https://your-project.vercel.app/register`).
   - Register a test account and verify the email link received from Brevo.
2. **Admin Login**:
   - Default seeded admin: email `admin`, password `123`.
   - Access `/admin/dashboard` and verify project creation and member assignments.
3. **Quality Module**:
   - Verify Objectives, Opportunities, FRACAS, and Risks tables load and update correctly.
   - Verify PDF export functions (`Export PDF`).
