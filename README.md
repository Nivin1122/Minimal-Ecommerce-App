
---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/nivin1122/minimal-ecommerce-app.git
cd minimal-ecommerce-app
```

### 2. Backend Setup (Django)

#### a. Create and activate a virtual environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On Mac/Linux
```

#### b. Install dependencies

```bash
pip install -r requirements.txt
```

#### c. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_email_password

STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

GOOGLE_CLIENT_ID=your_google_client_id
CURRENT_DOMAIN=http://localhost:5173
```

#### d. Run migrations and create a superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

#### e. Start the backend server

```bash
python manage.py runserver
```

---

### 3. Frontend Setup (React + Vite)

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run at [http://localhost:5173](http://localhost:5173).

---

## 💳 Payments

- **Stripe** is integrated for secure payments.
- Test card: `4242 4242 4242 4242` (any future expiry, any CVC)

---

## 🛡️ Security & Environment

- All sensitive keys and credentials are stored in `.env` (never commit this file).
- CORS and JWT authentication are enabled.
- Production deployment should set `DEBUG=False` and configure `ALLOWED_HOSTS` properly.

---

## 🙏 Credits

- [Django](https://www.djangoproject.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)
- [Vite](https://vitejs.dev/)

---


## ✨ Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📬 Contact

For questions or support, contact [bnivin71@gmail.com](mailto:bnivn71@gmail.com)
