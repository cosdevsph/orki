orki-backend/
├── config/                     # Main Django project
│   ├── __init__.py
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   ├── users/                 # Firebase user sync / profile
│   ├── dashboard/
│   ├── analytics/
│   ├── exams/
│   ├── flashcards/
│   └── common/               # shared utilities, base models
│
├── api/                      # API routing layer
│   ├── __init__.py
│   └── v1/
│       ├── urls.py
│       └── routers.py
│
├── services/                 # Business logic layer
│   ├── firebase/
│   ├── analytics/
│   └── exams/
│
├── core/                     # Core configs/utilities
│   ├── permissions.py
│   ├── pagination.py
│   └── middleware.py
│
├── manage.py
├── requirements.txt
└── .env