# 🐳 Orki — Your Intelligent Study Buddy for Board Exam Success

**Orki** is a modern, web-app-first platform designed to help board exam takers study smarter, stay consistent, and track their progress with clarity. Powered by a clean, Apple-inspired UI and a robust full-stack architecture, Orki acts as your personal **study companion** — guiding you from preparation to mastery.

---

## ✨ Vision

> *"Study with clarity. Track with purpose. Succeed with confidence."*

Orki is built to:

* 📚 Reinforce learning through flashcards & mock exams
* 📊 Provide meaningful analytics and performance insights
* 🔁 Encourage consistency with streaks and progress tracking
* 🧠 Simulate real board exam environments

---

## 🧱 Tech Stack

### 🔧 Backend

* Python (Django)
* Django REST Framework (API Layer)
* Firebase Admin SDK (Authentication & Firestore)

### 🎨 Frontend

* Next.js (App Router)
* Tailwind CSS v4
* Firebase JS SDK

---

## 🏗️ Project Structure

```
orki/
├── orki-backend/        # Django REST API
├── orki-frontend/       # Next.js App
└── README.md
```

---

# 🔙 Backend (Django API)

## 📁 Structure

```
orki-backend/
├── config/
│   ├── settings/
│   ├── urls.py
│   └── ...
│
├── apps/
│   ├── users/
│   ├── dashboard/
│   ├── analytics/
│   ├── exams/
│   ├── flashcards/
│   └── common/
│
├── api/
│   └── v1/
│       └── urls.py
│
├── services/
│   ├── firebase/
│   └── business logic modules
│
├── core/
│   └── shared configs
│
├── manage.py
├── requirements.txt
└── .env
```

---

## ⚙️ Backend Setup

### 1. Navigate to backend

```bash
cd orki-backend
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

If no `requirements.txt` yet:

```bash
pip install django djangorestframework django-cors-headers firebase-admin python-dotenv psycopg2-binary
```

---

### 4. Run Server

```bash
python manage.py migrate
python manage.py runserver
```

---

## 🔐 Environment Variables (`.env`)

```
SECRET_KEY=your_django_secret
DEBUG=True

FIREBASE_CREDENTIALS=path/to/serviceAccountKey.json
```

---

# 🎨 Frontend (Next.js)

## 📁 Structure

```
orki-frontend/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
│
├── lib/
│   ├── api.ts
│   └── firebase.ts
│
├── hooks/
├── styles/
├── public/
├── tailwind.config.ts
└── .env.local
```

---

## ⚙️ Frontend Setup

### 1. Navigate to frontend

```bash
cd orki-frontend
```

### 2. Install Dependencies

```bash
npm install
```

If setting up manually:

```bash
npm install axios firebase zustand @tanstack/react-query
```

---

### 3. Run Development Server

```bash
npm run dev
```

App will run on:

```
http://localhost:3000
```

---

## 🔐 Environment Variables (`.env.local`)

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1/
```

---

# 🎯 Core Features

* 🏠 **Dashboard** — Study streaks, resume sessions, quick insights
* 📊 **Analytics** — Visual performance tracking (charts & mastery)
* 📝 **Mock Exams** — Timed board exam simulations
* 🧠 **Flashcards** — Interactive, swipe-based study mode
* 👤 **Profile** — Settings, preferences, subscriptions

---

# 🎨 UI/UX Design System

* **Design Style:** Apple-inspired (clean, minimal, elegant)
* **Typography:**

  * Headers → Quicksand
  * Body → Inter
* **Colors:**

  * Primary → `#2FA2E2`
  * Text → `#1E293B`
  * Success → `#10B981`
  * Background → `#FFFFFF`
* **Components:**

  * Rounded corners (`rounded-2xl`, `rounded-3xl`)
  * Soft shadows
  * Glassmorphism (`backdrop-blur`)

---

# 🧭 Development Workflow

### 1. Run Backend

```bash
cd orki-backend
python manage.py runserver
```

### 2. Run Frontend

```bash
cd orki-frontend
npm run dev
```

---

# 🔗 API Communication

Frontend communicates with backend via:

```
/api/v1/
```

Example:

```
GET /api/v1/dashboard/
POST /api/v1/exams/start/
```

---

# 🚀 Future Enhancements

* 📱 Mobile App (React Native / PWA)
* 🤖 AI-powered study recommendations
* 🧾 Subscription & payment integration
* 🏆 Leaderboards & gamification
* 📡 Offline-first capabilities

---

# 🛡️ Security Notes

* Never commit `.env` files
* Never expose Firebase Admin credentials
* Always use environment variables for secrets

---

# 👨‍💻 Author

Built with precision and purpose by a Full Stack Engineer focused on scalable systems, modern UI/UX, and impactful digital products.

---

# 🐳 Orki Philosophy

> *“Small consistent steps beat last-minute cramming.”*

Stay focused. Stay consistent. Let Orki guide you. 🐋✨
