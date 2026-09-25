# ⚡ TaskMate — Hyperlocal Campus Student Marketplace

> **"Students helping students. Earn from your free time."**

TaskMate is a complete, mobile-first, neo-brutalist web application built for a campus-first startup concept. TaskMate connects students on the same university campus to exchange legitimate peer assistance—such as handwritten transcription, lab record writing where permitted, notes copying, engineering diagrams and charts, presentation slide design, printing, document formatting, and campus errands.

---

## 🎨 1. Neo-Brutalist Design System

TaskMate follows a strict **neo-brutalist visual style** designed to look like a modern Gen-Z student startup rather than a generic SaaS dashboard:

* **Primary Color Palette:**
  * **Warm Yellow:** `#FFD84D` (Hero areas, primary CTAs, active highlights)
  * **Light Blue:** `#8DD8FF` (Information cards, category badges)
  * **Pink:** `#FF8FB8` (Alerts, notifications, popular tags)
* **Supporting Colors:**
  * **Deep Black:** `#111111` (Borders, typography, hard shadows)
  * **Off-White:** `#FFFDF5` (Warm paper-like surface backgrounds)
  * **Muted Gray:** `#E8E5DD` (Borders and subtle dividers)
  * **Mint Green:** `#74E4A2` (Verified badges, delivery confirmed states)
* **Design Rules:**
  * Thick black borders (`3px` to `4px`)
  * Hard black offset box shadows (`shadow-[4px_4px_0px_#111111]`, `shadow-[6px_6px_0px_#111111]`)
  * **No soft blur shadows, no gradients, no glassmorphism, no generic purple AI aesthetic**
  * Chunky, tactile buttons that shift on hover (`translate-x-[2px] translate-y-[2px]`) and collapse shadow on click
  * Playful sticker/badge tags with subtle rotation (`-rotate-2`, `rotate-1`, `rotate-2`)
  * Responsive layout with mobile-first bottom navigation (`Home`, `Tasks`, `Post`, `Orders`, `Profile`)

---

## 🏛️ 2. Relational Location Hierarchy (Database-Driven)

TaskMate features a scalable, purely relational database-driven cascading location system:

```
COUNTRY (India)
   ↓
STATE (Telangana, Karnataka, Maharashtra)
   ↓
CITY (Hyderabad, Warangal, Karimnagar, Nizamabad, Bengaluru, Pune)
   ↓
COLLEGE (SNIST, CBIT, VNR VJIET, GRIET, Vasavi, NIT Warangal, RVCE, etc.)
   ↓
CAMPUS (Main Campus, Blocks, Cafeteria Zone, Hostels)
```

* **No Hardcoded College Lists:** The frontend queries `/api/locations?stateId=...&cityId=...` dynamically. Selecting a state filters cities; selecting a city queries only colleges in that city.
* **Student College Requests:** Students whose college is not yet listed can click `+ REQUEST TO ADD MY COLLEGE`. Admins review requests at `/admin`—approving a request automatically inserts the new college into the `colleges` table.
* **Campus-First Feed:** Tasks prioritize the user's selected campus first, followed by nearby campuses and city-wide tasks.

---

## 🔒 3. Handover OTP System & State Machine

TaskMate implements an end-to-end state machine with secret physical handover verification:

```
PAYMENT_PENDING
      ↓ (Requester locks payment into vault)
PAYMENT_HELD / WORK_IN_PROGRESS
      ↓ (Worker completes work & clicks "MARK AS READY")
READY_FOR_HANDOVER (4-digit OTP generated)
      ↓ (Worker inputs 4-digit code provided by requester on campus)
DELIVERED
      ↓ (24-Hour Review Window)
PAYMENT_RELEASED (Completed ✓)
      ↓ (Or if problem reported)
DISPUTE_OPEN → ADMIN_REVIEW → RESOLVED
```

### Handover OTP Security Rules:
1. When the worker marks a task ready, a **4-digit numeric code** (e.g. `5832`) is generated.
2. The OTP is **strictly confidential to the requester** and masked from the worker.
3. The requester inspects physical notes, records, or slides on campus before sharing the OTP.
4. The worker enters the OTP at `/orders/[id]` to trigger `DELIVERY_CONFIRMED ✓`.

---

## 🛡️ 4. Campus Trust, Safety & Academic Integrity

* **Academic Integrity Policy:** TaskMate explicitly positions itself for legitimate assistance (notes copying, record copying where permitted, diagrams, PPT formatting, errands). Cheating and ghost-writing graded assessments are prohibited and subject to account suspension.
* **Institutional Verification:** Students verify their campus affiliation via official institutional emails (e.g., `@sreenidhi.edu.in`, `@cbit.ac.in`). Verified students receive a verified badge.
* **Privacy Shield:** Personal emails, phone numbers, and physical residential addresses are never displayed publicly. All task communication occurs via protected task-specific chat.

---

## 👥 5. Testing & Evaluation Personas

The application includes a floating **Demo Persona Switcher** at the top of the interface:

| Persona | Role | College | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Rohit Sharma** | Student Requester | SNIST | Has active tasks, views secret handover OTPs, locks payments |
| **Priya Reddy** | Top Student Worker | SNIST | Can apply for tasks, mark tasks ready, enter handover OTPs |
| **Purii Rao** | Technical & Drawing Worker | CBIT | Top-rated worker for charts, video editing, and drawings |
| **Rahul Varma** | Newly Joined Student | SNIST | Unverified student account for testing verification flow |
| **Super Admin** | Campus Lead Admin | SNIST / Hyd | Full access to `/admin` (Metrics, Locations, Verifications, Disputes) |

> 💡 **Reset Demo Data:** Click "Reset Demo" in the top demo bar at any time to instantly restore all 15 tasks, colleges, and orders back to pristine seed state.

---

## 🚀 6. Application Pages & Routes

* `/` — High-impact neo-brutalist landing page with dynamic stats, 4-step workflow, and open task cards.
* `/tasks` — Search and filter marketplace with campus selector, category filter, and budget slider.
* `/tasks/create` — 5-step task posting flow with material uploads, deadline selector, and live review.
* `/tasks/[id]` — Task details, reference file attachments, requester rating, and "I CAN DO THIS" application modal.
* `/orders` — Active jobs and orders tracking dashboard.
* `/orders/[id]` — Order management engine: Mock payment lock, secret handover OTP, OTP verification, dispute filing, and reviews.
* `/dashboard` — Dual-mode dashboard: Worker view (Earnings: Total, Available, Pending) and Requester view (Tasks posted, active orders, money spent).
* `/messages` & `/messages/[orderId]` — Task-specific communication between requester and worker.
* `/profile` & `/profile/[id]` — Student public profile with ratings, completed jobs, skills, and reviews.
* `/settings` — Preferences, college affiliation changes, and privacy controls.
* `/trust` — Trust & safety page and campus academic integrity policy.
* `/admin` — Admin control center: Live KPI metrics, cascading location CRUD, student email verification, college request approvals, and dispute resolution.

---

## 🛠️ 7. Quickstart & Local Development

### Prerequisites:
* Node.js v18+ or v20+
* npm

### Running the App:
```bash
# 1. Install dependencies
npm install

# 2. Build production bundle
npm run build

# 3. Start local server
npm start
```

The application will be running at **`http://localhost:3000`**.
