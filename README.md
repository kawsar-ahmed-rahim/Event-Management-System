# 🎟️ Event Management System

A full-stack **Event Management System** built with the **MERN stack** where visitors can browse and search events, attendees can reserve seats and manage their registrations, and organizers can create events and see who is coming, while an admin oversees users and platform stats from a separate dashboard.

---

## 🚀 Features

### 👤 Attendee Side

* 🔐 Register, login, and logout
* 🏠 Home page with a searchable list of upcoming events
* 🔍 Filter by category, city, and price (free or paid), and sort by date or price
* 🎫 Event cards designed as tickets, with a live **seats left** bar
* 📄 Event details page with date, venue, price, organizer, and availability
* ✅ Register for an event and cancel the registration later
* 📦 "My registrations" page with all your booked events
* 📱 Responsive and clean user interface

### 🛠️ Organizer Side

* ➕ Create events with title, description, category, venue, city, dates, price, capacity, and an optional cover image
* ✏️ Edit or delete your own events
* 📝 Save events as **drafts** and publish them when ready
* 👥 View the attendee list for each event
* 📥 Download the attendee list as a **CSV file**

### 🔑 Admin Side

* 📊 Dashboard with total users, events, upcoming events, and registrations
* 📈 Events by category overview
* 👥 View all users and filter them by role
* 🔄 Change a user's role (user, organizer, admin)

---

## 🛠️ Built With

* **Frontend:** React, React Router, Vite, plain CSS, Fetch API
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas with Mongoose
* **Validation:** Zod
* **Authentication:** JWT, bcryptjs for password hashing
* **Security:** Helmet, CORS allow-list, HPP, NoSQL injection sanitizing, rate limiting
* **Deployment:** Vercel (frontend and backend as two projects)

---

## 📂 Project Structure

```text
Event-Management-System/
│
├── backend/
│   ├── api/                  # Vercel serverless entry point
│   ├── scripts/              # createAdmin.js (seed script)
│   ├── src/
│   │   ├── config/           # database connection, env helpers
│   │   ├── controllers/      # auth, events, registrations, admin
│   │   ├── middleware/       # auth, validation, rate limits, errors
│   │   ├── models/           # User, Event, Registration
│   │   ├── routes/           # api.js
│   │   ├── utils/
│   │   └── validators/       # Zod schemas
│   ├── app.js
│   ├── index.js              # local development server
│   └── vercel.json
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── api.js
│       ├── auth.jsx
│       └── App.jsx
│
└── README.md
```

---

## ⚙️ How It Works

1. A user registers (as an attendee or an organizer) or logs in.
2. The server validates the details and returns a **JWT**, which the frontend sends in the `Authorization` header on later requests.
3. Anyone can browse and filter published events.
4. A logged-in attendee registers for an event. The server reserves a seat **atomically**, so two people can never take the last seat at the same time.
5. Organizers create, edit, and publish events, and view or export their attendee lists.
6. The admin manages users and roles from the admin dashboard.
7. Protected routes use middleware (`protect` and `restrictTo`) to check the token and the role, and return **401** or **403** when access is not allowed.

---

## 🔑 Admin Access

Admin accounts cannot be created from the sign-up form. Create the first admin from the backend folder with the seed script:

```bash
cd backend
npm run seed:admin
```

It reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`, then creates the admin (or promotes the account if that email already exists). Log in with those credentials on the normal login page, and an **Admin** link appears in the navbar.

> Use a strong password, especially in production, and remove `ADMIN_PASSWORD` from `.env` once the admin exists.

---

## 🔌 API Endpoints

All routes are prefixed with `/api/v1`.

| Method | Path | Access |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | Public |
| GET | `/auth/me` | Logged in |
| GET | `/events` (search, category, city, from, to, free, past, sort, page, limit) | Public |
| GET | `/events/:id` | Public (drafts: owner or admin) |
| POST | `/events` | Organizer, admin |
| PATCH / DELETE | `/events/:id` | Owner, admin |
| GET | `/events/mine`, `/events/:id/attendees` | Organizer, admin |
| POST / DELETE | `/events/:id/register` | Logged in |
| GET | `/registrations/me` | Logged in |
| GET | `/admin/stats`, `/admin/users` | Admin |
| PATCH | `/admin/users/:id/role` | Admin |

---

## 🔧 Environment Variables

**Backend** (`backend/.env`):

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7
CLIENT_URL=http://localhost:5173
PORT=5000

# Local only: fixes "querySrv ECONNREFUSED" with mongodb+srv:// URLs
USE_PUBLIC_DNS=true

# Used only by: npm run seed:admin
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_strong_password
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## ▶️ Run Locally

```bash
# clone the repository
git clone https://github.com/your-username/your-repo-name.git

# backend
cd backend
npm install
npm run dev

# frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

The API runs on `http://localhost:5000` and the website on `http://localhost:5173`.

---

## ☁️ Deploy to Vercel

Deploy the backend and the frontend as **two separate Vercel projects**. If they share one repo, set the **Root Directory** to `backend` or `frontend` when importing each one.

1. **Backend:** add `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_EXPIRES_DAYS`, and `CLIENT_URL` (your frontend URL) as environment variables.
2. In MongoDB Atlas, open **Network Access** and allow `0.0.0.0/0`, because Vercel's IP addresses change.
3. **Frontend:** use the **Vite** preset and set `VITE_API_URL` to `https://your-backend.vercel.app/api/v1`.
4. Redeploy the backend after setting `CLIENT_URL` so CORS allows the frontend.

---

## 💡 Challenges Faced

### Moving the backend to ES modules

The project mixed `require` and `import`, which caused `require is not defined` errors. I converted every file to ES modules, added `"type": "module"`, and used `.js` extensions on local imports.

### MongoDB connection errors

The `mongodb+srv://` connection failed locally with `querySrv ECONNREFUSED` because my network's DNS refused SRV lookups. Using public DNS servers in local development fixed it.

### Running Express on Vercel

Vercel runs the API as serverless functions, so there is no long-running server. I exported the Express app from `api/index.js`, cached the Mongoose connection between invocations, and trusted the proxy so rate limiting sees the real client IP.

### Preventing overbooking

Checking "are there seats left?" and then saving a registration can let two users take the last seat at once. I used a single atomic MongoDB update that only increases the registered count while it is below capacity, and a unique index to block double registrations.

### Authentication across two domains

With the frontend and backend on different Vercel domains, browsers often block third-party cookies. The frontend stores the JWT and sends it as a `Bearer` token, and the backend also supports the `HttpOnly` cookie.

---

## 📚 What I Learned

* Building a full-stack app with the MERN stack
* JWT authentication and role-based access control (user, organizer, admin)
* Validating requests with Zod and handling errors in one place
* Writing atomic database updates to avoid race conditions
* Deploying an Express API as a serverless function on Vercel
* Handling CORS, environment variables, and ES modules
* Structuring a React app with routing, context, and reusable components

---

## 🔮 Future Improvements

* 💳 Online payment integration for paid events
* 📧 Email confirmations and reminders
* 🖼️ Cover image upload with Cloudinary
* 🧾 QR code tickets and check-in at the door
* ⏳ Waitlist for full events
* ⭐ Event reviews and ratings
* 📊 Charts and analytics for organizers
* 🌙 Dark mode
* 🧪 Automated tests

---

## 🔗 Live Demo

👉 **Live Website:** **https://your-frontend.vercel.app/**

👉 **API Health Check:** **https://your-backend.vercel.app/api/v1/health**

---

## 👨‍💻 Author

**Rahim**

If you found this project helpful or interesting, feel free to ⭐ the repository and share your feedback. Contributions, suggestions, and improvements are always welcome!
