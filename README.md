# EventHub – Event Ticket Booking System
**ITUE301 Advanced Web Development Frameworks Practical Examination Project**

---

## 📌 Project Overview
**EventHub** is a production-ready, full-stack event ticketing web application designed and built for the **ITUE301 Advanced Web Development Frameworks** practical examination. It demonstrates modern web development practices including component-based frontend architecture, secure JWT Bearer authentication, role-based access control, atomic database updates, schema validations, and RESTful API integration using pure MongoDB and Mongoose.

---

## 🚀 Technology Stack
- **Frontend Framework:** React.js (v19) bundled with **Vite**
- **Client Routing:** React Router DOM (v7) with nested routes, programmatic redirects, and code splitting
- **State Management:** React Context API (`AuthContext`) and local component state (`useState`, `useEffect`)
- **Backend Runtime:** Node.js (v22) + Express.js (v4)
- **Database:** MongoDB with **Mongoose** (Strictly MongoDB only; no SQL or alternative databases)
- **Authentication:** JSON Web Tokens (JWT) with standard `Bearer <token>` HTTP header
- **Password Security:** Salted hashing with `bcryptjs`
- **Styling:** Vanilla Responsive CSS (clean design, responsive flex/grid layouts, micro-animations, accessible color contrast)

---

## 📂 Project Directory Structure

```text
24IT020/
├── backend/
│   ├── middleware/
│   │   ├── authGuard.js          # Validates JWT Bearer tokens and handles role permissions
│   │   ├── errorHandler.js       # Global structured JSON error handler (LAST middleware)
│   │   └── requestLogger.js      # Global logger: [METHOD] [PATH] [TIMESTAMP]
│   ├── models/
│   │   ├── Attendee.js           # Mongoose Attendee model (name, email, phone, role, password)
│   │   ├── Event.js              # Mongoose Event model (title, category, date, venue, ticketsAvailable >= 0)
│   │   └── Ticket.js             # Mongoose Ticket model (references Attendee & Event, quantity, status)
│   ├── routes/
│   │   ├── authRoutes.js         # POST /api/v1/auth/login
│   │   ├── eventRoutes.js        # GET /api/v1/events, POST /api/v1/events (organizer)
│   │   └── ticketRoutes.js       # POST /tickets (booking), GET /tickets/my (populate), PATCH /:id/status
│   ├── .env                      # Environment credentials (excluded from git)
│   ├── .env.example              # Template environment configuration
│   ├── .gitignore                # Excludes node_modules and .env
│   ├── package.json              # Backend scripts and dependencies
│   ├── seed.js                   # Database seeding script with sample data
│   └── server.js                 # Main Express server entry point
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventCard.jsx     # Reusable event card with Sold Out logic & 5 required props
│   │   │   ├── Navbar.jsx        # Navigation links without full-page reload
│   │   │   └── ProtectedRoute.jsx# Token and role-based redirect protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Context managing { attendee, token, role }
│   │   ├── pages/
│   │   │   ├── EventsPage.jsx    # Public/Protected event listing & Task 2 booking form
│   │   │   ├── LoginPage.jsx     # Attendee & Organizer login interface
│   │   │   ├── MyTicketsPage.jsx # Populated booked ticket history & cancel action
│   │   │   └── OrganizerPanel.jsx# Lazy-loaded dashboard for organizer role
│   │   ├── services/
│   │   │   └── api.js            # Axios client with automatic Bearer token interceptor
│   │   ├── App.jsx               # Router configuration & Suspense lazy loading
│   │   ├── index.css             # Simple clean responsive CSS design system
│   │   └── main.jsx              # React DOM entry point
│   ├── index.html                # HTML5 shell with metadata
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite bundler configuration
├── .gitignore                    # Root repository ignore rules
└── README.md                     # Comprehensive documentation & viva guide
```

---

## 🛠️ Environment Variables Configuration

The backend relies on environment variables stored in `backend/.env`. A template file `backend/.env.example` is included:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventhub
JWT_SECRET=eventhub_super_secret_jwt_key_2026
```

> **Security Note:** The actual `.env` file is excluded from version control via `.gitignore` to prevent leaking sensitive secrets.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (Local Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas cloud connection URI)

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Verify or create the .env file
# (Copy from .env.example if not present)
cp .env.example .env

# Seed the database with sample attendees, events, and tickets
node seed.js
# or
npm run seed
```

### 2. Frontend Setup
```bash
# Open a second terminal and navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install
```

---

## 🏃‍♂️ How to Run the Application

### 1. Start the Backend Server
From the `backend` directory, run:
```bash
node server.js
# or
npm start
```
The server will start at `http://localhost:5000` and display:
```text
[METHOD] [PATH] [TIMESTAMP]
MongoDB database connected successfully.
EventHub Backend Server running on port 5000
API Base URL: http://localhost:5000/api/v1
```

### 2. Start the Frontend Development Server
From the `frontend` directory, run:
```bash
npm run dev
```
Open your browser and visit `http://localhost:5173`.

---

## 👥 Seed Accounts for Viva Demonstration

When `node seed.js` is executed, the following pre-configured accounts are created:

| Name | Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Sharma** | `attendee` | `rahul@eventhub.com` | `password123` | Can view events, book tickets, view & cancel own tickets |
| **Priya Patel** | `organizer` | `priya@eventhub.com` | `password123` | Can access `/organizer`, view all tickets, create events, update statuses |
| **Amit Verma** | `attendee` | `amit@eventhub.com` | `password123` | Second attendee account for testing multi-user isolation |

*Quick-click demo buttons are provided on the Login page to instantly autofill these credentials without manual typing.*

---

## 🌐 API Endpoint Documentation

All backend endpoints are prefixed with `/api/v1`.

### 1. Authentication
#### `POST /api/v1/auth/login`
- **Access:** Public
- **Description:** Authenticates an attendee or organizer, returning a signed JWT token and user profile.
- **Request Body:**
  ```json
  {
    "email": "rahul@eventhub.com",
    "password": "password123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "attendee",
    "attendee": {
      "id": "67b931a29f...",
      "name": "Rahul Sharma",
      "email": "rahul@eventhub.com",
      "phone": "+91 9876543210",
      "role": "attendee"
    }
  }
  ```

---

### 2. Events
#### `GET /api/v1/events`
- **Access:** Public (No token required)
- **Description:** Fetches all available events sorted by upcoming date.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 4,
    "data": [
      {
        "_id": "67b931a29f01...",
        "title": "TechCon 2026: AI & Web Frameworks",
        "category": "Technology",
        "date": "2026-11-15T09:00:00.000Z",
        "venue": "Auditorium Hall A, Silicon Valley Campus",
        "ticketsAvailable": 45
      },
      {
        "_id": "67b931a29f03...",
        "title": "Acoustic Sunset Music Festival",
        "category": "Music",
        "date": "2026-12-05T18:00:00.000Z",
        "venue": "City Amphitheatre, Riverfront",
        "ticketsAvailable": 0
      }
    ]
  }
  ```

---

### 3. Tickets
#### `POST /api/v1/tickets`
- **Access:** Protected (`authGuard`, requires `Authorization: Bearer <token>`)
- **Description:** Books tickets for an event. Performs atomic checks to ensure `ticketsAvailable >= requested quantity`. Never permits `ticketsAvailable` to become negative.
- **Request Body:**
  ```json
  {
    "eventId": "67b931a29f01...",
    "quantity": 2
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "message": "Tickets booked successfully!",
    "data": {
      "_id": "67b933f7c4...",
      "attendeeId": {
        "_id": "67b931a29f...",
        "name": "Rahul Sharma",
        "email": "rahul@eventhub.com"
      },
      "eventId": {
        "_id": "67b931a29f01...",
        "title": "TechCon 2026: AI & Web Frameworks",
        "date": "2026-11-15T09:00:00.000Z",
        "venue": "Auditorium Hall A, Silicon Valley Campus"
      },
      "quantity": 2,
      "bookingDate": "2026-10-22T04:25:00.000Z",
      "status": "booked"
    }
  }
  ```

#### `GET /api/v1/tickets/my`
- **Access:** Protected (`authGuard`)
- **Description:** Returns only tickets belonging to the logged-in attendee using Mongoose `.populate()`.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "_id": "67b933f7c4...",
        "attendeeId": {
          "_id": "67b931a29f...",
          "name": "Rahul Sharma",
          "email": "rahul@eventhub.com"
        },
        "eventId": {
          "_id": "67b931a29f01...",
          "title": "TechCon 2026: AI & Web Frameworks",
          "date": "2026-11-15T09:00:00.000Z",
          "venue": "Auditorium Hall A, Silicon Valley Campus"
        },
        "quantity": 2,
        "bookingDate": "2026-10-22T04:25:00.000Z",
        "status": "booked"
      }
    ]
  }
  ```

#### `PATCH /api/v1/tickets/:id/status`
- **Access:** Protected (`authGuard`)
- **Description:** Updates ticket status (`booked`, `cancelled`, or `used`). Restores event tickets if cancelled.
- **Request Body:**
  ```json
  {
    "status": "cancelled"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Ticket status successfully updated to cancelled.",
    "data": {
      "_id": "67b933f7c4...",
      "status": "cancelled"
    }
  }
  ```

---

## 🧪 Postman & Thunder Client Testing Guide

### Scenario 1: Attendee Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "email": "rahul@eventhub.com",
    "password": "password123"
  }
  ```
- **Expected Status:** `200 OK`
- **Copy:** Copy the returned `token` for subsequent requests.

### Scenario 2: Public GET Events
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/events`
- **Headers:** None required
- **Expected Status:** `200 OK` (Notice "Acoustic Sunset Music Festival" has `ticketsAvailable: 0`).

### Scenario 3: Valid Ticket Booking (HTTP 201)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/tickets`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <PASTE_TOKEN_HERE>`
- **Body:**
  ```json
  {
    "eventId": "<VALID_EVENT_ID_FROM_GET_EVENTS>",
    "quantity": 2
  }
  ```
- **Expected Status:** `201 Created`

### Scenario 4: Invalid Booking (HTTP 400 Insufficient Tickets)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/v1/tickets`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <PASTE_TOKEN_HERE>`
- **Body:**
  ```json
  {
    "eventId": "<SOLD_OUT_EVENT_ID_OR_REQUEST_9999_TICKETS>",
    "quantity": 9999
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response Message:**
  ```json
  {
    "success": false,
    "message": "Insufficient tickets available. Only 43 ticket(s) remaining for \"TechCon 2026: AI & Web Frameworks\"."
  }
  ```

### Scenario 5: Retrieve Logged-In Attendee Tickets
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/v1/tickets/my`
- **Headers:** `Authorization: Bearer <PASTE_TOKEN_HERE>`
- **Expected Status:** `200 OK`
- **Verification:** Both `attendeeId` and `eventId` are populated with their respective projected fields.

### Scenario 6: Update Ticket Status (PATCH)
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/api/v1/tickets/<TICKET_ID>/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <PASTE_TOKEN_HERE>`
- **Body:**
  ```json
  {
    "status": "cancelled"
  }
  ```
- **Expected Status:** `200 OK`

---

## 🎓 Task-by-Task Viva Explanation Guide

This section is prepared specifically to help a B.Tech student explain the codebase during the practical viva:

### Task 1: Environment Setup, Express Server & Middleware Pipeline
- **What was done:** Initialized a Node.js Express server using standard modular architecture.
- **Key Concepts to explain:**
  1. `requestLogger` middleware: Registered globally using `app.use(requestLogger)`. Intercepts every incoming HTTP request and prints `[METHOD] [PATH] [TIMESTAMP]` to stdout.
  2. `authGuard` middleware: Reads the HTTP `Authorization` header, splits `Bearer <token>`, verifies the JWT signature using `jwt.verify(token, secret)`, and extracts the payload. If missing or invalid, immediately responds with `HTTP 401 Unauthorized`.
  3. `errorHandler` middleware: Registered as the very LAST middleware in `server.js` with signature `(err, req, res, next)`. Formats Mongoose ValidationErrors, CastErrors, and JWT errors into structured JSON responses (`{ success: false, statusCode, message }`) so raw stack traces are never exposed.

### Task 2: Data Modeling, Booking Validation & Task 2 Booking Form
- **What was done:** Designed 3 Mongoose models (`Attendee`, `Event`, `Ticket`) and implemented safe inventory decrementing.
- **Key Concepts to explain:**
  1. **Schema Design:** `Attendee` holds user details and role. `Event` has `ticketsAvailable` with `min: 0`. `Ticket` stores `ObjectId` references to `Attendee` and `Event`.
  2. **Booking Logic:** When `POST /api/v1/tickets` is called:
     - Find the target `Event`.
     - Check `if (event.ticketsAvailable < requestedQty)` -> return `HTTP 400 Bad Request`.
     - Otherwise, create `Ticket` with `status: 'booked'`.
     - Decrement `event.ticketsAvailable = Math.max(0, event.ticketsAvailable - requestedQty)`.
     - Save and return `HTTP 201 Created`.
  3. **Task 2 Booking Form on EventsPage:** Uses two distinct React `useState` hooks (`selectedEventId` and `quantity`). When an event is selected, users can change the quantity and submit the booking directly.

### Task 3: Client-Side Routing & Protected Access Control
- **What was done:** Configured React Router DOM with protected routing.
- **Key Concepts to explain:**
  1. `BrowserRouter` with routes: `/` (Login), `/events` (Events), `/my-tickets` (My Tickets), and `/organizer` (Organizer Panel).
  2. `ProtectedRoute` component:
     - If `!token`: Redirects to `/` using `<Navigate to="/" replace />`.
     - If `requiredRole && role !== requiredRole`: Redirects to `/events` using `<Navigate to="/events" replace />`.
     - **Important Exam Detail:** A non-organizer is redirected to `/events` without being logged out. Missing-token and wrong-role redirects are isolated into clear if-statements.
  3. `Navbar`: Uses `NavLink` to enable client-side single-page transitions without full page reloads.

### Task 4: State Management, Reusable Components & Performance
- **What was done:** Centralized authentication state and modularized UI elements.
- **Key Concepts to explain:**
  1. `AuthContext`: Provides `{ attendee, token, role, login, logout }` across the component tree. Synchronizes with `localStorage` for session persistence.
  2. `EventCard` component: Accepts 5 props (`title`, `category`, `date`, `venue`, `ticketsAvailable`). If `ticketsAvailable === 0`, it displays the `"Sold Out"` badge and completely hides the Book button.
  3. **Client-side Search:** Implemented via `events.filter(ev => ev.title.toLowerCase().includes(searchTerm.toLowerCase()))`. Filters in-memory state without making redundant API calls.
  4. **Code Splitting (Lazy Loading):** `OrganizerPanel` is lazy loaded with `React.lazy(() => import('./pages/OrganizerPanel'))` and wrapped in `<Suspense fallback={<LoadingSpinner />}>`. The bundle for the organizer panel is only loaded when an authorized user visits `/organizer`.

### Task 5: End-to-End API Integration & Testing
- **What was done:** Connected the React frontend with the Express backend using Axios and demonstrated full CRUD operations.
- **Key Concepts to explain:**
  1. Axios request interceptor dynamically injects `Authorization: Bearer <token>` into outgoing requests.
  2. `GET /api/v1/tickets/my` executes `.populate('attendeeId', 'name email').populate('eventId', 'title date venue')` to assemble comprehensive ticket records in a single database query.
  3. Status updates via `PATCH /api/v1/tickets/:id/status` allow attendees to cancel bookings, immediately restoring ticket inventory in the database.

---

## 📋 Examination Verification Checklist

- [x] LoginPage works and authenticates users
- [x] EventsPage displays events dynamically from API
- [x] MyTicketsPage shows populated attendee & event details
- [x] OrganizerPanel provides administrative stats & controls
- [x] EventCard receives all 5 required props
- [x] Sold Out badge displays and hides Book button when ticketsAvailable === 0
- [x] React Router works without full page refresh
- [x] ProtectedRoute checks token existence and role
- [x] AuthContext provides login/logout & global auth state
- [x] Organizer role check redirects unauthorized users to /events without logout
- [x] OrganizerPanel is lazy loaded using React.lazy and Suspense
- [x] Five required APIs implemented and tested
- [x] Global requestLogger records [METHOD] [PATH] [TIMESTAMP]
- [x] authGuard checks Bearer token and returns HTTP 401
- [x] Global errorHandler handles Mongoose and server errors as last middleware
- [x] MongoDB + Mongoose schema validation prevents negative ticket counts
- [x] Mongoose .populate() joins attendee and event data
- [x] Ticket booking decrements ticketsAvailable and returns HTTP 201
- [x] Booking with excessive quantity returns HTTP 400
- [x] Client-side search filters events using .filter() without extra network calls
- [x] .env is excluded from git and .env.example is provided
- [x] Clean, responsive CSS styling applied
