# VentureX Project Guide

This guide describes the application as it is implemented in this repository. “Implemented” means the screen and its code/API path exist; it does not mean the feature has been tested in a deployed environment.

## 1. What VentureX is

VentureX is a platform for connecting startup founders with potential investors and mentors. Founders can publish startup profiles and manage funding requests; investors can discover startups and express investment interest; mentors can receive session requests and meet with founders.

There are three account roles:

- **Founder** — creates and manages startup profiles, reviews investment requests, and connects with investors or mentors.
- **Investor** — discovers and saves startups, sends investment requests, tracks their status, and contacts a startup founder.
- **Mentor** — shares a profile, receives mentorship requests, manages sessions, and can join an accepted video meeting.

## 2. Pages and features

The status labels below describe the repository, not the readiness of a production deployment:

- **Implemented in source** — the page/feature is routed and has working UI-to-API code.
- **Partially implemented** — a visible control or part of the data flow is not connected, or the interface collects more data than the backend stores.
- **Unverified** — the code exists, but relies on external configuration or needs an end-to-end test.

### Public and account pages

| Route | What it does / who uses it | Data flow and status |
|---|---|---|
| `/` | Public marketing page for visitors. When a signed-in user with a known role opens it, it becomes a role-specific home/workspace summary. | Public sections are mostly static. Personalized sections load role-specific data from the API. **Implemented in source; live API behavior unverified.** |
| `/register` | Creates a Founder, Investor, or Mentor account; also offers Google sign-in. | Form sends account details to `/api/auth/register`; the email flow continues to OTP verification. Google sign-in sends a credential to `/api/auth/google-login`. **Implemented in source; email/Google delivery and verification unverified.** |
| `/verify-otp` | Confirms the email address after registration and can request another code. | Calls the email verification and resend endpoints; on success, stores the returned session and routes by role. **Implemented in source; email delivery unverified.** |
| `/login` | Signs in with an email/password or Google credential. | Calls `/api/auth/login` or `/api/auth/google-login`, then stores the returned token and user in browser local storage. **Implemented in source; Google configuration unverified.** |
| `/forgot-password` and `/reset-password/:token` | Requests a password reset and submits a replacement password. | Calls the forgot/reset auth endpoints. **Implemented in source; email delivery and reset flow unverified.** |
| `/profile` | Lets a signed-in user view/edit profile data, change a password, upload a photo, or request account deletion. | Reads and writes `/api/profile/me`; photo uses multipart upload. Account deletion asks for password or Google re-authentication and removes associated records. **Implemented in source; photo storage and deletion behavior need end-to-end testing.** |
| `/notifications` | Shows a user’s notifications and lets them mark one or all as read. | Loads and updates records through `/api/notifications` using the signed-in user’s token. **Implemented in source.** |
| `/messages` | Shows conversations and messages between founders and investors, and sends messages. | Uses `/api/messages`; the page refreshes conversations about every 15 seconds and messages about every 10 seconds (polling, not live socket delivery). **Implemented in source; multi-user flow needs testing.** |
| `/discover-startups` | Lists startups for discovery. | Loads startup records from `/api/startups`; saving is supported for signed-in users. The route itself is public. **Implemented in source.** |
| `/startup/:id` | Displays a startup profile. Investors can save it, submit an investment request, or contact its founder; the owning founder can edit it. | Reads `/api/startups/:id`; save, investment, and messaging actions use their respective APIs. **Implemented in source; role/ownership paths need testing.** |

### Founder pages

| Route | What it does / who uses it | Data flow and status |
|---|---|---|
| `/dashboard` | Founder overview with startup/funding metrics, investment requests, investor/mentor connections, and session activity. | Uses founder dashboard, startup, investor, mentor, and session APIs. **Implemented in source; verify metrics against real records.** |
| `/create-startup` | Collects a startup profile and submits it. | Sends the form to `POST /api/startups`; the server only saves fields in the `Startup` model. Several extra form fields (such as valuation, equity, revenue/traction, problem/solution, country, and official email) are not in the model’s allowed field list and therefore are not saved. Image and gallery selections are previews; the form does not upload those files. **Partially implemented.** |
| `/edit-startup/:id` | Loads and edits an existing startup profile. | Reads and updates `/api/startups/:id`; the server checks that the signed-in founder owns the record. **Implemented in source.** |
| `/my-startups` | Lists the founder’s startups and links to create/manage them. | Uses `/api/dashboard/founder/stats`, which includes the founder’s startups. **Implemented in source.** |
| `/funding-analytics` | Shows founder funding totals and investment-request analytics. | Loads `/api/dashboard/founder/funding-analytics`. **Implemented in source; verify calculations with representative data.** |

### Investor pages

| Route | What it does / who uses it | Data flow and status |
|---|---|---|
| `/investor-dashboard` | Investor overview for startup discovery, saved startups, request activity, and portfolio totals. | Loads saved startups and investment requests from the API; profile details are taken from the browser’s stored user data. **Implemented in source; verify totals/status changes.** |
| `/investor/:id` | Shows an investor profile. | Finds the investor from the investor listing returned by `/api/investors`. **Implemented in source.** |
| `/saved-startups` | Lists saved startups and lets the investor remove them. | Uses `/api/saved-startups`. **Implemented in source.** |
| `/investments` | Shows sent investment requests, statuses, and the total of accepted requests. | Loads `/api/investments`; accepted amounts are added in the browser for the displayed portfolio value. **Implemented in source; the displayed total is a request total, not evidence of completed transfers.** |

### Mentor pages

| Route | What it does / who uses it | Data flow and status |
|---|---|---|
| `/mentor-dashboard` | Lets a mentor review session requests and manage session status. | Loads and updates `/api/mentor-sessions`. **Implemented in source.** |
| `/mentors` | Lists available mentor profiles. | Loads `/api/mentors`. The page requires a signed-in user in the frontend route configuration. **Implemented in source.** |
| `/mentor/:id` | Shows a mentor profile and lets a signed-in user request a session. | Loads the mentor and submits the requested time/topic through mentor and session APIs. **Implemented in source; complete requester/mentor role paths need testing.** |
| `/my-mentorship` | Shows sessions requested by the current user and allows cancellation/status actions available in the UI. | Loads and updates `/api/mentor-sessions`. **Implemented in source.** |
| `/mentor-sessions/:sessionId/meeting` | Opens the meeting UI for an eligible session. | Requests a short-lived meeting token from the server, which checks participation, accepted status, and schedule before returning ZEGOCLOUD credentials. **Unverified; requires valid ZEGOCLOUD settings and two-party testing.** |

### Visible but incomplete landing-page controls

- The navbar’s **Search** field has no search handler or API call. **Partially implemented (visual control only).**
- The public Explore section’s cards describe startup discovery, investors, mentors, co-founders, and events, but the arrow buttons do not navigate or load those features. Co-founder matching and events are not represented by API models/routes. **Partially implemented / promotional content.**
- The Contact section displays contact details and a form, but the form has no submit handler or backend route. **Partially implemented (visual form only).**

## 3. Typical user workflows

1. **Join VentureX:** register with a role → verify the email with an OTP (or use Google sign-in) → sign in → arrive at the role’s dashboard.
2. **Founder publishes a startup:** create a startup profile → edit it from the founder tools → the startup appears in discovery → review incoming investment requests and accept or reject them.
3. **Investor considers a startup:** discover startups → open a startup page → save it and/or send an investment request → see pending/accepted/rejected status in the portfolio. The request is not an actual payment flow.
4. **Founder and investor communicate:** start a conversation from a startup profile → send messages → the other participant’s inbox refreshes by polling.
5. **Founder requests mentoring:** browse mentors → request a time/topic → mentor reviews the request → if accepted, the participants can attempt to join the scheduled video meeting.
6. **Manage an account:** edit profile details/photo, change password, read notifications, or request account deletion from profile settings.

## 4. Architecture and data flow

```text
Browser (React + Vite)
  └─ React Router pages and components
       └─ Axios API modules (src/api)
            └─ HTTP / JSON + Bearer token
                 └─ Express server (server/server.js)
                      ├─ routes → controllers → Mongoose models
                      └─ MongoDB
```

- **Frontend:** React, React Router, Vite, Axios, and CSS. Page components live in `src/Pages`; shared UI is in `src/Components`; endpoint wrappers are in `src/api`.
- **Backend:** Express route modules in `server/routes` call controller modules in `server/controllers`. Middleware checks authentication and role access.
- **Database:** MongoDB, accessed through Mongoose. `server/config/db.js` connects using `MONGO_URI`.
- **Request flow:** a page calls an API helper; the helper sends an HTTP request to Express (most protected calls attach the saved JWT as a Bearer token); route middleware checks the token/role; a controller reads/writes MongoDB and returns JSON; React updates the screen.

## 5. Important API routes

All paths below are mounted by `server/server.js`; protected routes require a valid Bearer token unless noted.

| API prefix | Important endpoints and purpose |
|---|---|
| `/api/auth` | `POST /register`, `/verify-email-otp`, `/resend-email-otp`, `/login`, `/google-login`, `/forgot-password`, `/reset-password/:token` |
| `/api/startups` | `GET /`, `GET /:id` (startup discovery/details); Founder-only `POST /`, `PUT /:id`, `DELETE /:id` |
| `/api/saved-startups` (also mounted as `/api/saved`) | `GET /`, `GET /user/:userId`, `GET /check/:userId/:startupId`, `POST /`, and delete routes for removing a saved startup |
| `/api/investments` | `POST /` creates a request; `GET /` and `/investor/:investorId` list an investor’s requests; `/startup/:startupId` and `/founder/:founderId` list founder requests; `PUT /:investmentId/status` changes request status |
| `/api/mentors` and `/api/investors` | `GET /` lists profiles; mentors also have `GET /:id` |
| `/api/mentor-sessions` | `GET /mentor/:mentorId`, `GET /requester/:requesterId`, `POST /`, `PUT /:id/status`, and `POST /:id/meeting-token` |
| `/api/dashboard` | Founder-only `GET /founder/stats` and `GET /founder/funding-analytics` |
| `/api/messages` | `GET /` lists conversations; `POST /` creates/gets one; `GET` and `POST /:conversationId/messages`; `PUT /:conversationId/read`; `GET /unread-count` |
| `/api/notifications` | `GET /:userId`, `PUT /:id/read`, `PUT /:userId/read-all`; `POST /` creates supported investment notifications |
| `/api/profile` | `GET /me`, `PUT /me`, `POST /me/photo`, `PUT /me/password`, `DELETE /me` |

The server also exposes `/` and `/test` health-check responses.

## 6. Main MongoDB models

- **User** — name, email, password hash (when password-based), role, verification state, profile and role-specific details.
- **Startup** — founder reference, name, tagline, description, industry, stage, funding goal, website, location, team size, founded year, status, and logo path.
- **Investment** — investor, startup, amount, message, and Pending/Accepted/Rejected status.
- **SavedStartup** — user/investor and startup references; unique indexes prevent duplicate saves.
- **MentorSession** — mentor, requester, optional startup, topic, message, requested date/time, and session status.
- **Conversation** — founder, investor, startup, latest-message summary, and unread counters.
- **Message** — conversation, sender, text, read time, and optional client message ID.
- **Notification** — recipient, event type, text, read state, and references to related records.

## 7. Authentication and security notes

- Password-based accounts use `bcryptjs`; signed-in API requests are checked with JWT verification on the server.
- Registration, OTP, and resend endpoints have in-memory per-IP rate limits. API middleware checks roles and record ownership for protected operations; frontend route guards are an additional UI check, not a substitute for backend checks.
- The browser stores the session token and user object in `localStorage`. This is easy to use but means any successful script injection could access the token; production deployments should carefully review browser-side security and token handling.
- Profile photo uploads are limited to PNG/JPEG/WebP and 2 MB. The server sets several security headers and applies a hard-coded CORS origin allowlist.
- Never publish `server/.env` or expose `JWT_SECRET`, `MONGO_URI`, email credentials, or the ZEGOCLOUD server secret. The repository has `server/.env.example` with placeholders.
- This guide is not a security audit. Review deployment settings, CORS origins, secret rotation, email delivery, and account recovery before production use.

## 8. Local setup

Prerequisites: Node.js/npm and a MongoDB instance. Run the frontend and backend in separate terminals.

1. Install frontend dependencies from the project root:
   ```powershell
   npm install
   ```
2. Install backend dependencies:
   ```powershell
   cd server
   npm install
   ```
3. Create `server/.env` from `server/.env.example` and set at least:
   - `MONGO_URI` — MongoDB connection string
   - `JWT_SECRET` — long, random signing secret
   - `EMAIL_USER` and `EMAIL_PASS` — email account/app credentials for email workflows
   - `ZEGO_APP_ID` and `ZEGO_SERVER_SECRET` — only required for video meetings
4. In one terminal at the project root, run `npm run dev` (Vite, usually port 5173).
5. In another terminal inside `server`, run `npm run dev` (Express, default port 5000).
6. Optional frontend environment values can be set in a root Vite env file: `VITE_API_BASE_URL`, `VITE_STARTUP_API_URL`, and `VITE_GOOGLE_CLIENT_ID`. The frontend defaults to localhost API URLs; the server CORS allowlist must also include any non-local frontend origin. URL handling differs between API modules: `VITE_STARTUP_API_URL` is a full startups endpoint, most `VITE_API_BASE_URL` clients expect an API origin, while saved-startup and investor clients use that value directly as their route base; the auth client does not use `VITE_API_BASE_URL`. Check the resulting request URLs when configuring a non-local backend.

The frontend package provides `npm run build` and `npm run lint`. There is no test script or checked-in test suite for the app’s end-to-end flows.

## 9. Incomplete or important to test

- **Partially implemented:** navbar search, Explore card actions, and Contact form submission are visual only.
- **Partially implemented:** startup creation accepts more details than the server persists; selected cover/gallery files are previews, not uploads. Confirm which fields the presentation promises before demonstrating them.
- **Unverified external services:** email OTP/password reset, Google OAuth, and ZEGOCLOUD meetings depend on valid environment credentials and provider-side configuration.
- **Needs end-to-end testing:** registration/login by each role; founder ownership checks; creating/editing startups; investor save/request/status flows; notifications; two-account messaging and read state; mentorship request/acceptance/cancellation; profile-photo upload; password change and account deletion.
- **Repository testing:** no test suite was found. A successful frontend build only checks compilation/bundling; it does not verify MongoDB, email, OAuth, or video behavior.
- Extra files under `src/Pages/CreateStartup11` and `src/Pages/StartupDetails/StartupDetails.jsx` are not registered in `src/App.jsx`; they should not be presented as live routes without wiring them into the router.
