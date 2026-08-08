# 🔗 URL Shortener API

A backend URL shortening service built with **Node.js, Express.js, MongoDB, Redis, and BullMQ**.

The API allows authenticated users to create and manage short URLs, redirect users from short codes to their original URLs, and retrieve URL information and click statistics.

The backend follows a layered architecture with dedicated **routes, controllers, services, repositories, models, validators, middleware, queues, workers, and utilities**.

---

## 🚀 Project Links

| Resource                 | Link                           |
| ------------------------ | ------------------------------ |
| 💻 GitHub Repository     | Add repository link            |
| ⚙️ Live API              | Add deployed API link          |
| 🧪 Postman Collection    | Add Postman collection link    |
| 📚 Swagger Documentation | Add Swagger documentation link |

---

## 📌 Overview

Long URLs are difficult to share, remember, and manage.

This project provides a REST API for converting long URLs into short, unique URLs that can later be used to redirect users to the original destination.

Each shortened URL is associated with an authenticated user, allowing users to manage their own URLs through protected APIs.

The system also includes Redis caching, rate limiting, background email processing, structured logging, error monitoring, request validation, and API documentation support.

---

# ✨ Key Features

## 🔐 Authentication

The API provides a complete authentication workflow:

* User signup
* Email OTP verification
* OTP resend
* Login
* JWT authentication
* Access token and refresh token flow
* HTTP-only cookies
* Profile retrieval
* Profile update
* Password change
* Forgot password
* Password reset using OTP
* Logout
* Account deactivation
* Account deletion

Authentication routes are protected with dedicated validation and rate-limiting middleware.

---

## 🔗 URL Management

Authenticated users can:

* Create short URLs
* Generate unique short codes
* Retrieve all their URLs
* Retrieve a single URL
* Update URLs
* Delete URLs
* Search URLs
* Paginate URL results
* Sort URL results
* Configure URL expiration
* View click counts

The URL creation service generates a 7-character `nanoid` short code and checks for short-code collisions before storing the URL.

---

## ↪️ URL Redirection

The API provides a public redirect endpoint.

```text
Short URL
    ↓
Short Code
    ↓
Redis Cache
    ↓
Cache Hit ──────► Original URL
    │
    └── Cache Miss
            ↓
         MongoDB
            ↓
      Store in Redis
            ↓
       Original URL
            ↓
          302 Redirect
```

The redirect service checks Redis first and falls back to MongoDB when the short URL is not cached. Cached redirects use a one-hour TTL. Expired URLs return an appropriate error instead of redirecting.

---

## ⚡ Redis Caching

Redis is used for performance-sensitive operations.

### URL Detail Cache

Individual URL records use:

```text
url:<urlId>
```

The cached URL data has a **5-minute TTL**.

The implementation also checks ownership after reading from Redis so that caching does not bypass user authorization.

### Redirect Cache

Redirect lookups use:

```text
redirect:<shortCode>
```

The original URL is cached for **1 hour**.

```text
Request
   ↓
Check Redis
   ↓
 ┌───────────────┐
 │ Cache exists? │
 └───────┬───────┘
     Yes │ No
      ↓  │  ↓
   Return │ MongoDB
          │
          ↓
      Redis Cache
          │
          ↓
       Redirect
```

---

# 📊 URL Analytics

The API provides an analytics endpoint for individual URLs.

Currently, the implemented analytics response exposes:

* URL ID
* Short code
* Total clicks

The codebase also contains an analytics model and click repository, but the richer analytics service integration is not yet completed. Planned analytics include browser, device, country, and date-range statistics.

This README intentionally documents the **currently implemented behavior** rather than claiming those planned analytics are already finished.

---

# 📄 URL Listing

The URL listing API supports:

### Pagination

```text
page
limit
```

The service caps the maximum page size at **100 records**.

### Search

Users can search URLs using the original URL.

### Sorting

Results can be sorted using:

```text
sort
order
```

The default sorting is by `createdAt` in descending order.

The service uses `Promise.all()` to retrieve URL records and the total count concurrently.

---

# 🏗️ System Architecture

```text
                         Client
                           │
                           ▼
                    Express.js API
                           │
                           ▼
                  Global Middleware
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
      Helmet             CORS            Compression
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                       API Routes
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
             Auth Routes         URL Routes
                 │                   │
                 ▼                   ▼
             Controllers        Controllers
                 │                   │
                 ▼                   ▼
              Services            Services
                 │                   │
                 ▼                   ▼
             Repositories       Repositories
                 │                   │
                 └─────────┬─────────┘
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
              MongoDB              Redis
                                     │
                              ┌──────┴──────┐
                              ▼             ▼
                           Caching      Rate Limit

                           BullMQ
                              │
                              ▼
                         Email Worker
                              │
                              ▼
                           SMTP
```

The application initializes Helmet, CORS, compression, Pino HTTP logging, i18next middleware, body parsing, cookie parsing, and then mounts both authentication and URL routes under `/api/v1`.

---

# 🔄 URL Creation Flow

```text
Authenticated User
       │
       ▼
POST /api/v1/
       │
       ▼
Authentication Middleware
       │
       ▼
Request Validation
       │
       ▼
URL Controller
       │
       ▼
URL Service
       │
       ▼
Generate nanoid(7)
       │
       ▼
Check Short-Code Collision
       │
       ▼
MongoDB Repository
       │
       ▼
Save URL
       │
       ▼
Return Short URL
```

The service generates the short code using `nanoid(7)` and checks whether the generated code already exists before creating the database record.

---

# ↪️ Redirect Flow

```text
User
 │
 ▼
GET /api/v1/redirect/:shortCode
 │
 ▼
Redirect Rate Limiter
 │
 ▼
Short-Code Validation
 │
 ▼
URL Service
 │
 ▼
Check Redis
 │
 ├──────── Cache Hit ────────► Original URL
 │
 └──────── Cache Miss
             │
             ▼
          MongoDB
             │
             ▼
        Check Expiry
             │
             ▼
        Store in Redis
             │
             ▼
        Original URL
             │
             ▼
          Redirect
```

The public redirect route is intentionally not protected by authentication, while it is protected by a dedicated redirect rate limiter and short-code validator.

---

# 🔐 Authentication Flow

```text
Signup
  │
  ▼
Validate Request
  │
  ▼
Create / Verify User
  │
  ▼
OTP Email
  │
  ▼
Verify OTP
  │
  ▼
Login
  │
  ├───────────────┐
  ▼               ▼
Access Token   Refresh Token
  │               │
  └───────┬───────┘
          ▼
    HTTP-only Cookies
          │
          ▼
   Protected Requests
```

### Token Refresh

```text
Access Token Expired
        │
        ▼
Refresh Token
        │
        ▼
Validate Refresh Token
        │
        ▼
Generate New Access Token
        │
        ▼
Continue Authenticated Session
```

---

# 📧 Background Email Processing

The project uses **BullMQ + Redis** for asynchronous email processing.

```text
API Request
    │
    ▼
Add Email Job
    │
    ▼
BullMQ Queue
    │
    ▼
Redis
    │
    ▼
Email Worker
    │
    ▼
SMTP / Nodemailer
    │
    ▼
Email Sent
```

The worker processes jobs for:

* OTP emails
* Password-reset OTP emails
* Welcome emails

The worker reports completed and failed jobs and uses the Redis connection for BullMQ.

---

# 🛡️ Security

The API implements several security layers.

### Authentication

* JWT access tokens
* JWT refresh tokens
* HTTP-only cookies
* Protected routes
* Password hashing with bcrypt

### Request Protection

* Express Validator
* Authentication middleware
* Rate limiting
* Helmet
* CORS
* Secure cookie handling

### Rate Limiting

Dedicated rate limiters exist for authentication operations such as:

* Signup
* Login
* OTP verification
* OTP resend
* Forgot password
* Reset password
* Refresh token
* Logout
* Password change

URL operations also use dedicated limiters for short URL creation and public redirects.

---

# 🚦 Rate Limiting

The application uses:

* `express-rate-limit`
* `rate-limit-redis`
* Redis

This provides distributed rate-limiting storage instead of relying only on in-memory application state.

The project has separate rate-limiting policies for different sensitive endpoints rather than using one global limit for every operation.

---

# 🧪 Request Validation

Validation is separated from controllers and services.

```text
Request
   │
   ▼
Route
   │
   ▼
Validator
   │
   ├── Invalid ──► Error Response
   │
   ▼
Controller
   │
   ▼
Service
```

Dedicated validator modules exist for:

* Authentication
* URLs
* Analytics

The middleware layer then executes validation before the controller is called.

---

# 🚨 Error Handling

The backend uses centralized error handling.

```text
Request
   │
   ▼
Route
   │
   ▼
Controller
   │
   ▼
Service
   │
   ├──── Success ────► ApiResponse
   │
   └──── Error
          │
          ▼
   Error Middleware
          │
          ▼
    Standard API Error
```

Controllers are wrapped using the `TryCatch` middleware/helper, allowing asynchronous service errors to flow into centralized error handling.

API responses are standardized using `ApiResponse`, while application errors use `ApiError`.

---

# 📝 Logging & Monitoring

## Structured Logging

The application uses:

* Pino
* Pino HTTP
* Request IDs using UUID

Pino HTTP is registered globally so HTTP requests can be logged consistently.

## Error Monitoring

The project integrates:

* Sentry
* `@sentry/node`

Sentry is configured for monitoring application errors and production failures.

---

# 🌍 Internationalization

The API supports internationalized responses using:

* i18next
* i18next filesystem backend
* i18next HTTP middleware

Locale files are organized under:

```text
src/locales/
├── en/
└── h1/
```

This allows response messages to be managed separately from business logic.

---

# 📦 Compression

The Express application uses the `compression` middleware to compress HTTP responses and reduce response payload size.

---

# 📚 API Documentation

The project includes support for interactive API documentation using:

* Swagger UI Express
* YAMLJS

The API documentation can be exposed through the application's Swagger configuration.

**Swagger URL:** Add deployed Swagger URL here.

---

# 🛠️ Tech Stack

## Backend

| Technology         | Purpose                                |
| ------------------ | -------------------------------------- |
| Node.js            | JavaScript runtime                     |
| Express.js         | REST API framework                     |
| MongoDB            | Primary database                       |
| Mongoose           | MongoDB ODM                            |
| Redis              | Caching, rate limiting, BullMQ backend |
| ioredis            | Redis client                           |
| JWT                | Authentication                         |
| bcrypt             | Password hashing                       |
| nanoid             | Short-code generation                  |
| Nodemailer         | Email delivery                         |
| BullMQ             | Background job processing              |
| Helmet             | HTTP security headers                  |
| CORS               | Cross-origin configuration             |
| express-rate-limit | Rate limiting                          |
| rate-limit-redis   | Redis-backed rate limiting             |
| express-validator  | Request validation                     |
| Pino               | Structured logging                     |
| Pino HTTP          | HTTP request logging                   |
| Sentry             | Error monitoring                       |
| i18next            | Internationalization                   |
| compression        | Response compression                   |
| Swagger UI Express | API documentation                      |
| YAMLJS             | Swagger configuration                  |
| Day.js             | Date/time handling                     |
| UUID               | Request identifiers                    |

The dependency configuration in the repository confirms these major libraries and development tools.

---

# 📂 Project Structure

```text
URL-shortner/
│
├── Backend/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   ├── DB.js
│   │   │   ├── env.js
│   │   │   ├── i18n.js
│   │   │   ├── logger.js
│   │   │   ├── mail.js
│   │   │   ├── redis.js
│   │   │   └── sentry.js
│   │   │
│   │   ├── controller/
│   │   │   ├── authController/
│   │   │   └── urlController/
│   │   │
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   └── h1/
│   │   │
│   │   ├── middleware/
│   │   │   ├── TryCatch.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── rateLimiter.middleware.js
│   │   │   └── validator.js
│   │   │
│   │   ├── model/
│   │   │   ├── analyticsModel/
│   │   │   │   └── click.model.js
│   │   │   ├── authModel/
│   │   │   └── urlModel/
│   │   │
│   │   ├── queues/
│   │   │   └── email.queue.js
│   │   │
│   │   ├── repository/
│   │   │   ├── authRepository/
│   │   │   ├── clickRepository/
│   │   │   └── urlRepository/
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes/
│   │   │   └── urlRoutes/
│   │   │
│   │   ├── service/
│   │   │   ├── authService/
│   │   │   └── urlService/
│   │   │
│   │   ├── templates/
│   │   │   ├── otp.template.js
│   │   │   ├── resetPassword.template.js
│   │   │   └── welcome.template.js
│   │   │
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   └── ...
│   │   │
│   │   ├── validators/
│   │   │   ├── analytics.validators.js
│   │   │   ├── auth.validators.js
│   │   │   └── url.validators.js
│   │   │
│   │   ├── worker/
│   │   │   └── email.worker.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── test.http
│
└── README.md
```

The repository currently uses dedicated modules for configuration, controllers, middleware, models, queues, repositories, routes, services, templates, validators, and workers.

---

# 🗄️ Database Design

The primary database is MongoDB.

## URL Entity

The URL model contains information including:

```text
Url
├── userId
├── originalUrl
├── shortUrl
├── clicks
├── expiryAt
├── createdAt
└── updatedAt
```

The `userId` and short URL fields are indexed, while the short URL is unique.

## Authentication Data

Authentication models are separated under:

```text
src/model/authModel/
```

## Analytics Data

Click analytics are represented through:

```text
src/model/analyticsModel/click.model.js
```

---

# 🔗 API Reference

All APIs are mounted under:

```text
/api/v1
```

The application mounts both authentication and URL routes under this prefix.

---

## 🔐 Authentication APIs

| Method | Endpoint                     | Authentication | Description                |
| ------ | ---------------------------- | -------------- | -------------------------- |
| POST   | `/api/v1/signup`             | Public         | Register a user            |
| POST   | `/api/v1/verify-otp`         | Public         | Verify signup OTP          |
| POST   | `/api/v1/resend-otp`         | Public         | Resend OTP                 |
| POST   | `/api/v1/login`              | Public         | Login user                 |
| POST   | `/api/v1/forgot-password`    | Public         | Request password-reset OTP |
| POST   | `/api/v1/reset-password`     | Public         | Reset password             |
| GET    | `/api/v1/profile`            | Required       | Get user profile           |
| POST   | `/api/v1/logout`             | Required       | Logout                     |
| PATCH  | `/api/v1/update-profile`     | Required       | Update profile             |
| PATCH  | `/api/v1/change-password`    | Required       | Change password            |
| PATCH  | `/api/v1/deactivate-account` | Required       | Deactivate account         |
| DELETE | `/api/v1/delete-account`     | Required       | Delete account             |
| POST   | `/api/v1/refresh-token`      | Refresh token  | Generate new access token  |

These routes are defined in the authentication router.

---

## 🔗 URL APIs

| Method | Endpoint                      | Authentication | Description                           |
| ------ | ----------------------------- | -------------- | ------------------------------------- |
| POST   | `/api/v1/`                    | Required       | Create short URL                      |
| POST   | `/api/v1/`                    | Required       | Get user's URLs with query parameters |
| GET    | `/api/v1/:id`                 | Required       | Get URL by ID                         |
| PATCH  | `/api/v1/:id`                 | Required       | Update URL                            |
| DELETE | `/api/v1/:id`                 | Required       | Delete URL                            |
| GET    | `/api/v1/:id/analytics`       | Required       | Get URL analytics                     |
| GET    | `/api/v1/redirect/:shortCode` | Public         | Redirect to original URL              |

The URL router currently defines the protected CRUD/analytics routes and the public redirect route.

> **Implementation note:** The repository currently defines both URL creation and URL listing with `POST "/"`; the listing operation reads pagination/search/sort values from the query string. If you later change listing to `GET "/"`, update this README accordingly.

---

# 🧪 API Testing

The repository includes:

```text
Backend/test.http
```

for HTTP-based API testing.

A Postman collection can also be added here:

**Postman Collection:** Add link.

Recommended Postman folders:

```text
Authentication
├── Signup
├── Verify OTP
├── Resend OTP
├── Login
├── Refresh Token
├── Logout
├── Forgot Password
└── Reset Password

URL Management
├── Create URL
├── Get URLs
├── Get URL
├── Update URL
└── Delete URL

Redirect
└── Redirect Short URL

Analytics
└── Get Analytics
```

---

# ⚙️ Environment Variables

The backend validates its environment configuration using `envalid`.

The current configuration expects:

```env
NODE_ENV=development

PORT=8000

CLIENT_URL=your_client_url

MongoDB_URL=your_mongodb_connection_string

REDIS_URL=your_redis_connection_string

JWT_ACCESS_SECRET=your_access_token_secret

JWT_REFRESH_SECRET=your_refresh_token_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=your_sender_email

SENTRY_DSN=your_sentry_dsn
```

The repository's environment configuration defines these variables and validates the allowed `NODE_ENV` values and port.

### Security

Never commit:

```text
.env
```

to a public repository.

Use:

```text
.env.example
```

with placeholder values instead.

---

# 💻 Local Development

## 1. Clone the Repository

```bash
git clone <repository-url>
cd URL-shortner
```

## 2. Enter Backend

```bash
cd Backend
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Environment

Create:

```text
Backend/.env
```

and add the required environment variables.

## 5. Start Development Server

```bash
npm run dev
```

The project uses:

```text
nodemon src/server.js
```

for development.

## 6. Start Production Server

```bash
npm start
```

---

# 🧹 Code Quality

ESLint is configured for maintaining consistent JavaScript code quality.

Run:

```bash
npm run lint
```

The repository defines ESLint as its linting tool and exposes the `lint` script through `package.json`.

---

# 🧠 Technical Design Decisions

## Why Redis?

Redis is used for operations where repeated database access can be avoided:

* URL detail caching
* Redirect caching
* Rate-limiting storage
* BullMQ infrastructure

This allows frequently accessed short URLs to be served without querying MongoDB on every request.

---

## Why BullMQ?

Email delivery is separated from the main HTTP request through a queue and worker architecture.

Instead of making the API request responsible for the entire email-delivery operation:

```text
API
 ↓
Queue
 ↓
Worker
 ↓
SMTP
```

This separates asynchronous work from the request-response cycle.

---

## Why Repository Layer?

Database access is isolated inside repository modules.

```text
Service
   ↓
Repository
   ↓
MongoDB
```

This prevents database queries from being scattered throughout controllers and keeps business logic separated from persistence logic.

---

## Why Service Layer?

The service layer contains application/business logic.

For example:

```text
Controller
   ↓
createUrlService()
   ↓
Generate short code
   ↓
Check collision
   ↓
Repository
   ↓
MongoDB
```

This keeps controllers focused on HTTP handling.

---

## Why Middleware-Based Validation?

Validation occurs before controller execution.

This prevents invalid requests from reaching business logic and keeps validation rules reusable across routes.

---

# 📈 Performance Considerations

The project includes several performance-oriented techniques:

* Redis caching
* Redirect caching
* Redis-backed rate limiting
* Pagination
* Search filtering
* Sorting
* Concurrent database operations using `Promise.all()`
* Response compression
* Asynchronous email processing

The URL listing service uses pagination limits and executes the data query and count query concurrently.

---

# 🔒 Ownership & Authorization

URL management operations are tied to the authenticated user.

For example:

```text
Authenticated User
        │
        ▼
      userId
        │
        ▼
Repository Query
        │
        ▼
Find URL belonging to user
```

The Redis URL cache also checks the cached record's `userId` before returning it, preventing cached data from bypassing ownership checks.

---

# 🧭 Complete Request Flow

```text
                    HTTP Request
                         │
                         ▼
                  Express Application
                         │
                         ▼
              Global Middleware Layer
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
    Security          Logging         Compression
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                       Route
                         │
                         ▼
                    Validation
                         │
                         ▼
                 Authentication
                    (if required)
                         │
                         ▼
                    Controller
                         │
                         ▼
                      Service
                         │
                         ▼
                    Repository
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
            MongoDB              Redis
                                   │
                                   ▼
                              Cache / Queue
```

---

# 🚀 Deployment

The application can be deployed as a Node.js backend with:

* Node.js runtime
* MongoDB
* Redis
* SMTP provider
* Sentry

For production deployments, the API and email worker should be configured with the required environment variables and Redis connection.

### Production Components

```text
API Server
   │
   ├── MongoDB
   │
   ├── Redis
   │
   ├── SMTP
   │
   └── Sentry

Email Worker
   │
   └── Redis / BullMQ
```

---

# 🗺️ Future Improvements

The current repository provides a strong base for extending the service.

Potential improvements:

* Complete detailed click analytics
* Browser analytics
* Device analytics
* Country analytics
* Date-range analytics
* Analytics aggregation endpoints
* Swagger/OpenAPI examples
* Automated unit tests
* Integration tests
* Docker support
* CI/CD pipeline
* Health-check endpoint
* Redis-based redirect invalidation on URL updates/deletion
* Better URL expiration handling
* Custom aliases
* QR-code generation
* Custom domains
* Advanced analytics dashboard

The code itself already identifies browser, device, country, and date-range analytics as planned additions.

---

# ⚠️ Current Implementation Notes

This README intentionally documents the repository as it currently exists.

A few areas should be cleaned up in the codebase before calling the project fully production-ready:

1. **Analytics** — the richer analytics repository integration is still incomplete.
2. **URL expiration naming** — the service uses `expiresAt`, while the URL model currently defines `expiryAt`; these should be made consistent.
3. **Public `.env` file** — the repository currently exposes a `Backend/.env` file in GitHub. Remove it from version control and rotate any real credentials immediately.
4. **URL listing route** — both URL creation and URL listing currently use `POST "/"`; consider changing listing to `GET "/"` for a more conventional REST API design.
5. **Swagger** — add the deployed Swagger URL once the documentation endpoint is exposed publicly.

These are not README problems. They are actual repository-level cleanup items worth fixing before presenting the project as production-ready. The current code confirms the route overlap, analytics status, and environment/model inconsistencies.

---

# 📄 License

No license is currently specified in the repository.

Add an open-source license if you want others to legally use, modify, and distribute the project.

---

# 👨‍💻 Author

**Nikhil Singh**

Backend Developer
Node.js • Express.js • MongoDB • Redis • REST APIs

**GitHub Repository:** Add link

**Live API:** Add link

**Postman Collection:** Add link

**Swagger Documentation:** Add link
