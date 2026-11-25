# QELVORA — Fashion E-Commerce Platform

QELVORA is a modern multi-vendor fashion e-commerce platform built using React and Django REST Framework. It provides a complete shopping experience for customers and dedicated management features for administrators and vendors.

## Project Overview

QELVORA allows customers to explore fashion products, manage their shopping cart, save wishlist items and place orders.

The platform supports three user roles:

- **Admin:** Manages users, products and vendor applications.
- **Vendor:** Adds and manages products, prices and stock.
- **Customer:** Browses products, manages their cart and places orders.

## Technology Stack

### Frontend
- React
- JavaScript
- Vite
- Redux Toolkit
- React Redux
- React Router DOM
- Axios
- CSS

### Backend
- Python
- Django
- Django REST Framework
- Django REST Framework Simple JWT
- DRF Spectacular

### Development Tools
- Visual Studio Code
- Postman
- Git and GitHub

## Features

### Customer Features
- Customer registration and login
- JWT authentication
- Browse product categories
- View product details
- Sort products by price and name
- Add and remove wishlist items
- Shopping cart management
- Update product quantities
- Checkout and order placement
- View order history

### Vendor Features
- Submit vendor applications
- Admin approval and rejection
- Vendor dashboard
- Add new products
- Edit product details
- Delete products
- Manage product stock
- View vendor-owned products

### Admin Features
- Admin dashboard
- View registered users
- Block and unblock users
- Manage vendor applications
- Approve and reject vendors
- View all products
- Add, edit and delete products
- Assign products to vendors

## State Management

QELVORA uses Redux Toolkit and React Context API.

- Redux Toolkit manages shared product data.
- createAsyncThunk handles asynchronous product API requests.
- React Redux connects the Redux store to React components.
- ShopContext manages cart and wishlist functionality.
- Local storage preserves guest cart and wishlist data.

## Role-Based Access Control

The platform uses frontend route protection and backend API permissions.

| Role | Access |
|---|---|
| Admin | Admin dashboard and product management |
| Approved Vendor | Vendor dashboard and own products |
| Customer | Shopping and order management |

Backend permissions independently validate access to protected API endpoints.

## API Documentation

API documentation is generated using DRF Spectacular.

After starting the Django backend, access:

- Swagger UI: http://127.0.0.1:8000/api/docs/
- ReDoc: http://127.0.0.1:8000/api/redoc/
- OpenAPI Schema: http://127.0.0.1:8000/api/schema/

## Project Structure

```text
QELVORA/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   ├── Auth/
│   │   │   ├── Home/
│   │   │   ├── Orders/
│   │   │   ├── Products/
│   │   │   └── Vendor/
│   │   ├── redux/
│   │   │   └── slices/
│   │   ├── sections/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── accounts/
│   ├── products/
│   ├── config/
│   ├── manage.py
│   ├── requirements.txt
│   └── schema.yml
│
└── README.md
```

## Installation and Setup

### Prerequisites
- Python
- Node.js and npm
- Git

### 1. Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the database and required environment variables in Django settings.

Apply migrations:

```bash
python manage.py migrate
```

Start the backend server:

```bash
python manage.py runserver
```

Backend URL:

http://127.0.0.1:8000/

### 2. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite displays the frontend URL in the terminal.

## Main API Endpoints

| Module | Method | Endpoint |
|---|---|---|
| Authentication | POST | /api/token/ |
| Registration | POST | /api/auth/register/ |
| Current User | GET | /api/auth/me/ |
| Categories | GET | /api/categories/ |
| Products | GET | /api/products/ |
| Product Details | GET | /api/products/{id}/ |
| Vendor Products | GET, POST | /api/vendor/products/ |
| Admin Products | GET, POST | /api/admin/products/ |
| Shopping Cart | GET, POST | /api/cart/ |
| Cart Item | PATCH, DELETE | /api/cart/items/{item_id}/ |
| Place Order | POST | /api/orders/ |
| Order History | GET | /api/orders/history/ |
| Vendor Application | POST | /api/accounts/vendor/apply/ |
| Admin Users | GET | /api/accounts/admin/users/ |

Refer to Swagger UI for detailed request parameters, response formats and available API operations.

## Testing

### Backend Automated Tests

Run all Django tests:

```bash
python manage.py test
```

The current test suite includes 12 automated tests covering account operations, vendor applications and product permissions.

### Frontend Linting

```bash
npm run lint
```

### Frontend Production Build

```bash
npm run build
```

## Security

- JWT-based authentication
- Role-based API permissions
- Protected frontend routes
- Vendor product ownership restrictions
- Product stock validation
- Django password validation
- Authenticated cart and order operations

## Project Status

QELVORA includes customer shopping functionality, vendor management, admin controls, Redux product state management, API documentation and automated backend tests.

---

**QELVORA — Discover Your Signature Style.**


