# QRAMS — Update 2 Implementation Notes

## 1. DRDO Quality Format Reports (Phase 1)

### What was built
Four official DRDO SSPL quality management format reports have been integrated into QRAMS, accessible per-project by administrators.

### New Pages
| Route | Description |
|---|---|
| `/admin/quality/[projectId]` | Quality Hub — overview of all 4 formats with entry counts |
| `/admin/quality/[projectId]/objectives` | Quality Objectives (QF/QPG/QUALITY OBJECTIVES) |
| `/admin/quality/[projectId]/opportunities` | Opportunity Register (QF/QPG/OPP) |
| `/admin/quality/[projectId]/fracas` | FRACAS — Failure Reporting, Analysis & Corrective Actions |
| `/admin/quality/[projectId]/risks` | Risk Assessment Table (QF/QPG/RAT) |

### Access
From any project's detail page, click the **"📋 Quality Formats (DRDO)"** button.

### Backend
- 4 new Prisma models: `QualityObjective`, `OpportunityRegister`, `FracasReport`, `RiskAssessment`
- New controller: `backend/controllers/qualityController.js`
- New routes: `backend/routes/qualityRoutes.js` → mounted at `/api/quality`
- All write operations require `Admin` role

---

## 2. Forgot Password / Reset Password Flow

### What was built
A complete, secure password reset flow accessible from the login page.

### Flow
```
Login Page
  └── Click "Forgot Password?"
        └── /forgot-password page
              ├── Enter registered email
              └── Click "Send Reset Link"
                    └── Backend sends branded HTML email with reset link
                          └── User clicks link in email
                                └── /reset-password/[token] page
                                      ├── Enter new password (strength meter)
                                      ├── Confirm password (match indicator)
                                      └── Submit → password updated → redirect to login
```

### Backend (already existed, now wired to frontend)
- `POST /api/auth/forgot-password` — generates token, saves to DB, sends email
- `POST /api/auth/reset-password/:token` — validates token (1 hour expiry), hashes and saves new password

### New Frontend Pages
| File | Description |
|---|---|
| `frontend/src/app/forgot-password/page.js` | Email entry + success confirmation screen |
| `frontend/src/app/reset-password/[token]/page.js` | New password form with strength meter |

### UI Features
- **Forgot Password page**: 2-state UI (form → success), spinner during request, security tips
- **Reset Password page**: live password strength bar (4 levels), show/hide toggle for both fields, real-time match indicator, auto-redirect to login on success, "link expired" fallback
- **Email template**: professional DRDO-branded HTML email with blue gradient header, gold SSPL text, security warning box, 1-hour expiry notice

### Works for both Admin and Member accounts
The backend is role-agnostic — any verified user can reset their password.
