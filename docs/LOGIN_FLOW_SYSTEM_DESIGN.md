# 🔐 Login Flow System Design
## AI-Powered Personalized Learning App

---

## 👥 User Roles
| Role | Access Level |
|------|-------------|
| Student | Personal dashboard, tests, chatbot, leaderboard |
| Teacher | Classroom dashboard, test creation, analytics |
| Admin | Full system access, institution management |
| School Admin | School-wide reports, teacher management |

---

## 🗺️ Master Login Flow

```
[App Launch]
      │
      ▼
[Splash Screen / Onboarding]
      │
      ├──── New User? ────────────────────► [Register Flow]
      │
      └──── Returning User? ─────────────► [Login Screen]
```

---

## 1️⃣ Registration Flow

```
[Register Screen]
      │
      ├─ Select Role: [Student] [Teacher] [School Admin]
      │
      ▼
[Enter Basic Info]
  - Full Name
  - Email / Phone Number
  - Password + Confirm Password
      │
      ▼
[Role-Specific Info]
  ┌───────────────────────────────────────────────┐
  │ Student          │ Teacher       │ School Admin│
  │ - Class/Grade    │ - Subject(s)  │ - School    │
  │ - School Code    │ - School Code │   Name      │
  │ - Board (CBSE/   │ - Experience  │ - District  │
  │   ICSE/State)    │               │             │
  └───────────────────────────────────────────────┘
      │
      ▼
[Email / Phone OTP Verification]
      │
      ├── OTP Valid? ──YES──► [Account Created]
      │                              │
      └── OTP Invalid/Expired?       ▼
              │               [Profile Setup Screen]
              ▼                - Avatar / Photo Upload
         [Resend OTP]          - Notification Preferences
                               - Language Preference
                                      │
                                      ▼
                             [Redirect to Role Dashboard]
```

---

## 2️⃣ Login Flow

```
[Login Screen]
  - Email / Phone Number
  - Password
  - [Forgot Password?]
  - [Login with Google / Apple]
      │
      ▼
[Auth Validation]
      │
      ├── Invalid Credentials? ──► [Show Error Message]
      │                                    │
      │                                    ▼
      │                          [Retry or Forgot Password]
      │
      ├── Valid Credentials?
      │        │
      │        ▼
      │  [Is 2FA Enabled?]
      │        │
      │        ├── YES ──► [OTP sent to Email/Phone]
      │        │                  │
      │        │                  ├── OTP Valid? ──► [Proceed]
      │        │                  └── OTP Invalid? ─► [Resend / Block after 5 attempts]
      │        │
      │        └── NO ──► [Proceed]
      │
      ▼
[Check Account Status]
      │
      ├── Suspended? ──► [Show Suspension Notice + Support Link]
      │
      ├── Pending Approval? (Teacher) ──► [Awaiting School Admin Approval Screen]
      │
      └── Active? ──► [Detect Role]
                            │
                            ├── Student ──► [Student Dashboard]
                            ├── Teacher ──► [Teacher Dashboard]
                            └── Admin ───► [Admin Panel]
```

---

## 3️⃣ Forgot Password Flow

```
[Forgot Password Screen]
  - Enter registered Email / Phone
      │
      ▼
[Send Reset Link / OTP]
      │
      ▼
[OTP / Link Verification]
      │
      ├── Valid? ──► [Set New Password Screen]
      │                      │
      │                      ▼
      │              [Password Strength Check]
      │              - Min 8 characters
      │              - 1 Uppercase, 1 Number, 1 Special Char
      │                      │
      │                      ▼
      │              [Password Reset Success]
      │                      │
      │                      ▼
      │              [Redirect to Login]
      │
      └── Invalid / Expired? ──► [Resend Option]
```

---

## 4️⃣ Social Login Flow (Google / Apple)

```
[Click "Login with Google / Apple"]
      │
      ▼
[OAuth Consent Screen]
      │
      ├── Denied? ──► [Return to Login Screen]
      │
      └── Approved?
              │
              ▼
      [Check if Account Exists]
              │
              ├── YES ──► [Fetch Role & Redirect to Dashboard]
              │
              └── NO ──► [Role Selection Screen]
                                │
                                ▼
                        [Complete Profile Setup]
                        (School Code, Grade, etc.)
                                │
                                ▼
                        [Create Account & Redirect]
```

---

## 5️⃣ Session & Token Management Flow

```
[Successful Login]
      │
      ▼
[Generate JWT Access Token (15 min TTL)]
[Generate Refresh Token (7 days TTL)]
      │
      ▼
[Store in Secure HTTP-Only Cookie / Secure Storage (Mobile)]
      │
      ▼
[User Active in App]
      │
      ├── Access Token Valid? ──► [Allow API Requests]
      │
      └── Access Token Expired?
              │
              ▼
      [Auto-Refresh using Refresh Token]
              │
              ├── Refresh Token Valid? ──► [Issue New Access Token]
              │
              └── Refresh Token Expired? ──► [Force Logout → Login Screen]
```

---

## 6️⃣ Auto-Login / Remember Me Flow

```
[App Relaunch]
      │
      ▼
[Check Local Secure Storage for Refresh Token]
      │
      ├── Token Found & Valid? ──► [Silently Refresh Access Token]
      │                                       │
      │                                       ▼
      │                             [Redirect to Last Dashboard]
      │
      └── Token Not Found / Expired? ──► [Show Login Screen]
```

---

## 7️⃣ Multi-Device & Logout Flow

```
[User Requests Logout]
      │
      ├── Logout This Device ──► [Invalidate Current Session Token]
      │                                    │
      │                                    ▼
      │                          [Clear Local Storage]
      │                                    │
      │                                    ▼
      │                          [Redirect to Login Screen]
      │
      └── Logout All Devices ──► [Invalidate All Refresh Tokens in DB]
                                          │
                                          ▼
                                 [All sessions terminated]
```

---

## 8️⃣ Teacher Account Approval Flow

```
[Teacher Registers]
      │
      ▼
[Account Created with "Pending" Status]
      │
      ▼
[Email sent to School Admin for Approval]
      │
      ▼
[School Admin Reviews in Admin Panel]
      │
      ├── Approved? ──► [Teacher Account Activated]
      │                          │
      │                          ▼
      │                 [Teacher receives Email/SMS Notification]
      │                          │
      │                          ▼
      │                 [Teacher can now Login]
      │
      └── Rejected? ──► [Teacher notified with Reason]
```

---

## 🔐 Security Rules Summary

| Rule | Detail |
|------|--------|
| Max Login Attempts | 5 attempts → 15-min lockout |
| OTP Validity | 5 minutes, max 3 resends |
| Password Policy | Min 8 chars, uppercase, number, special char |
| JWT Access Token TTL | 15 minutes |
| Refresh Token TTL | 7 days (sliding window) |
| 2FA | Optional for Students, Recommended for Teachers/Admins |
| RBAC Enforcement | Every API call validates role from JWT payload |
| Data Encryption | Passwords hashed with bcrypt (salt rounds: 12) |

---

## 🗃️ Database Entities (Auth-Related)

```
Users Table
├── user_id (UUID)
├── name
├── email
├── phone
├── password_hash
├── role (student | teacher | school_admin | admin)
├── status (active | pending | suspended)
├── school_code (FK)
├── created_at
└── last_login_at

Sessions Table
├── session_id (UUID)
├── user_id (FK)
├── refresh_token_hash
├── device_info
├── ip_address
├── expires_at
└── created_at

OTP Table
├── otp_id (UUID)
├── user_id (FK)
├── otp_hash
├── type (registration | password_reset | 2fa)
├── expires_at
└── used (boolean)
```

---

## 🔄 API Endpoints (Auth Service)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | New user registration |
| POST | `/auth/verify-otp` | OTP verification |
| POST | `/auth/login` | Email/Phone + Password login |
| POST | `/auth/social-login` | Google / Apple OAuth |
| POST | `/auth/refresh-token` | Refresh access token |
| POST | `/auth/forgot-password` | Trigger reset OTP/link |
| POST | `/auth/reset-password` | Set new password |
| POST | `/auth/logout` | Logout current device |
| POST | `/auth/logout-all` | Logout all devices |
| GET  | `/auth/me` | Get current user profile |

---

*This login flow supports the RBAC model defined in the Master Plan with scalability in mind for multi-school deployments.*
