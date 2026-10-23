# Arcana Backend

REST API for [Arcana](https://arcana-frontend-two.vercel.app) — a limited-drop fashion storefront built on Node.js and Express.

The frontend lives at [ITSYABOINEUTRAL/arcana-frontend](https://github.com/ITSYABOINEUTRAL/arcana-frontend).  
Live API base: `https://arcana-backend-master.onrender.com/api`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File uploads | express-fileupload → Cloudinary |
| Payments | Paystack |
| Email | Resend |
| Scheduling | node-cron |
| Dev server | nodemon |

---

## Project Structure

```
arcana-backend-master/
├── server.js                   Entry point — wires up middleware, routes, cron jobs
├── newsletterJob.js            Scheduled newsletter email (node-cron)
├── updateProductImages.js      One-off migration script to patch Cloudinary image URLs
├── config/
│   └── db.js                  Mongoose connection
├── controllers/
│   ├── authController.js      Register, login, profile, password reset, profile pic upload
│   ├── adminController.js     Dashboard stats, order/user management, send email/newsletter
│   ├── cartController.js      Cart CRUD
│   ├── contactController.js   Contact-form submission → email
│   ├── orderController.js     Update delivery stage (+ exchange logic)
│   ├── paystackController.js  Initialize payment, handle Paystack webhook
│   ├── productController.js   Product CRUD
│   ├── userController.js      Get profile, orders, addresses
│   └── user/
│       └── uploadProfilePicture.js  (unused — see Known Limitations)
├── middlewares/
│   ├── authMiddleware.js      JWT protect + admin guard
│   └── cloudinaryUpload.js   Multer + CloudinaryStorage (unused — see Known Limitations)
├── models/
│   ├── Address.js             Address (user, location)
│   ├── Cart.js                Cart with embedded items
│   ├── Newsletter.js          Newsletter send log
│   ├── Order.js               Order with embedded product snapshots
│   ├── Product.js             Product catalogue
│   ├── Subscriber.js          Newsletter subscriber list
│   └── User.js                User with embedded addresses, bcrypt password
├── routes/
│   ├── addressRoutes.js       /api/address
│   ├── adminRoutes.js         /api/admin
│   ├── authRoutes.js          /api/auth
│   ├── cartRoutes.js          /api/cart
│   ├── contactRoutes.js       /api/contact
│   ├── newsletterRoutes.js    /api/newsletter
│   ├── orderRoutes.js         /api/orders
│   ├── paystackRoutes.js      /api/paystack
│   ├── productRoutes.js       /api/products
│   ├── returnRoutes.js        /api/returns
│   └── userRoutes.js          /api/user
└── utils/
    ├── cleanPendingOrders.js       Cron — deletes unpaid orders older than 10 min
    ├── cloudinary.js               Cloudinary v2 client
    ├── emailService.js             Resend client + branded HTML template
    ├── generateToken.js            JWT sign (30-day expiry)
    ├── mailer.js                   Thin wrapper — backward compat
    ├── sendDeliveryUpdateEmail.js  Delivery stage email (Shipped / Delivered / Exchanged)
    ├── sendOrderEmail.js           Order-confirmed email to customer + admin
    └── sendReturnRequestEmail.js   Return/exchange confirmation email
```

---

## Prerequisites

- Node.js 18+
- A MongoDB instance — local (`mongodb://localhost:27017/arcana`) or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A free [Cloudinary](https://cloudinary.com) account
- A free [Resend](https://resend.com) account
- A [Paystack](https://paystack.com) account — **use test keys only for local development**

---

## Getting Started

```bash
git clone https://github.com/ITSYABOINEUTRAL/arcana-backend-master.git
cd arcana-backend-master
npm install
cp .env.example .env   # fill in your values (see table below)
node server.js         # or: npx nodemon server.js
```

The server starts on port 5000 by default (`http://localhost:5000`).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in each value. **Never commit `.env`.**

| Variable | Purpose | Where to get it |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | Local: `mongodb://localhost:27017/arcana` · Cloud: Atlas free tier |
| `JWT_SECRET` | Signs and verifies JWTs | Any long random string (e.g. `openssl rand -hex 32`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | [cloudinary.com](https://cloudinary.com) dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary dashboard |
| `RESEND_API_KEY` | Resend API key for email | [resend.com](https://resend.com) → API Keys |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | [paystack.com](https://paystack.com) → Settings → API Keys & Webhooks — use **test** key (`sk_test_...`) |
| `EMAIL_FROM` | `From` address in emails | Optional. Defaults to `Arcana <support@mail.shop-arcana.store>`. Use your own verified Resend domain for local testing. |
| `PORT` | HTTP port | Optional. Defaults to `5000`. |

---

## API Overview

All paths are prefixed with `/api`.  
`[auth]` = requires `Authorization: Bearer <token>` header.  
`[admin]` = requires `[auth]` + `isAdmin: true` on the user.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account, returns JWT |
| POST | `/login` | — | Login with email + password, returns JWT |
| POST | `/forgot-password` | — | Send password-reset email |
| POST | `/reset-password/:token` | — | Reset password with token from email |
| GET | `/profile` | [auth] | Get own user profile |
| POST | `/upload-profile-pic` | [auth] | Upload profile picture to Cloudinary (express-fileupload) |
| PUT | `/profile` | [auth] | Update name, phone, address |
| PUT | `/change-password` | [auth] | Change password (requires old password) |

### Products — `/api/products`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all products |
| GET | `/:id` | — | Get product by MongoDB ID |
| POST | `/` | [admin] | Create product |
| PUT | `/:id` | [admin] | Update product |
| DELETE | `/:id` | [admin] | Delete product |

### Cart — `/api/cart`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | [auth] | Get own cart |
| POST | `/` | [auth] | Add item (productId, quantity, size) |
| PUT | `/:id` | [auth] | Update item quantity |
| DELETE | `/:id` | [auth] | Remove cart item by item `_id` |
| DELETE | `/clear` | [auth] | Clear entire cart |

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | [auth] | Create order (pending, awaiting payment) |
| GET | `/:orderId` | optional [auth] | Public: returns status, items, dates, totals. Owner or admin: also returns address, phone, email. |
| PUT | `/by-number/:orderNumber/stage` | [admin] | Update delivery stage (Reviewing / Shipped / Delivered / Returned / Exchanged) |

### Paystack — `/api/paystack`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/initialize` | — | Initialize a Paystack transaction; amount is computed server-side from the stored order |
| POST | `/webhook` | — | Paystack webhook — verifies HMAC signature and paid amount before confirming order |

### Contact — `/api/contact`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | — | Submit contact form, sends email to admin and confirmation to sender |

### User — `/api/user`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/profile` | [auth] | Get own profile |
| GET | `/orders` | [auth] | List own orders |
| GET | `/addresses` | [auth] | List own saved addresses |

### Returns — `/api/returns`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/return-request` | — | Submit a return or exchange request. Requires `email` in the request body matching the order's registered email. |

### Newsletter — `/api/newsletter`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/subscribe` | — | Subscribe email address |
| GET | `/` | [admin] | List all subscribers |
| POST | `/send` | [admin] | Send newsletter to all subscribers + log in DB |

### Admin — `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | [admin] | Revenue, order count, product count, user count, subscriber count |
| GET | `/orders` | [admin] | All orders (sorted newest first) |
| GET | `/users` | [admin] | All users (passwords excluded) |
| PUT | `/users/:id/role` | [admin] | Toggle user admin status |
| POST | `/email/send` | [admin] | Send a custom email to any address |
| POST | `/newsletter/send` | [admin] | Send newsletter to all subscribers + log in DB |

### Address — `/api/address`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | [auth] | Returns addresses (currently returns stub data — see Known Limitations) |

---

## Auth Flow

1. Client calls `POST /api/auth/register` or `POST /api/auth/login`.
2. Server returns a signed JWT valid for 30 days.
3. Client includes the token in the `Authorization: Bearer <token>` header on protected requests.
4. `protect` middleware in [middlewares/authMiddleware.js](middlewares/authMiddleware.js) verifies the token and attaches `req.user`.
5. `admin` middleware checks `req.user.isAdmin`.
6. Password reset uses a crypto token stored on the User document, valid for 1 hour.

---

## Payment Flow

1. Frontend calls `POST /api/paystack/initialize` with `{ email, reference }`.
2. Server looks up the order by `reference`, computes the amount in kobo server-side (`order.totalPrice × 1547.30 × 100`), and forwards to the Paystack API. Returns an authorization URL.
3. User completes payment on Paystack's hosted page.
4. Paystack POSTs a `charge.success` event to `POST /api/paystack/webhook`.
5. Webhook verifies the HMAC-SHA512 signature against `PAYSTACK_SECRET_KEY`.
6. Webhook compares the paid amount and currency (`NGN`) against the expected amount derived from the order. A mismatch is logged and the order is left unconfirmed.
7. On a valid match, the order is set to `Confirmed`, order-confirmation emails are sent to the customer and admins, and the user's cart is cleared.
8. Repeated `charge.success` events for an already-confirmed order are acknowledged and silently ignored (idempotency guard).

---

## Newsletter Cron Job

[`newsletterJob.js`](newsletterJob.js) schedules a single newsletter broadcast using `node-cron`.  
The current schedule is hardcoded to **13 September at 12:00 WAT** (`"0 12 13 9 *"`).  
It fetches all `Subscriber` documents, sends the branded HTML email via Resend, and logs the send in the `Newsletter` collection.

A second cron in [`utils/cleanPendingOrders.js`](utils/cleanPendingOrders.js) runs every minute. It finds orders whose `status` is `Pending` and whose `createdAt` is older than 30 minutes, deletes them, and sends expiry notification emails to the affected customers and to admins.

---

## `updateProductImages.js`

A one-off Node.js migration script. Run it locally to patch Cloudinary image URLs for a named list of products:

```bash
node updateProductImages.js
```

The script connects to MongoDB using `MONGO_URI`, iterates a hardcoded list of `{ name, image }` pairs, and calls `Product.findOneAndUpdate`. It disconnects automatically on completion.

---

## Deployment (Render)

The API is deployed on Render as a web service.

- Set all environment variables in the Render dashboard under **Environment**.
- The service starts with `node server.js` (add a `start` script to `package.json` to use `npm start`).
- Render automatically restarts on deploy.
- Configure the Paystack webhook URL in your Paystack dashboard to point to `https://arcana-backend-master.onrender.com/api/paystack/webhook`.

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Known Limitations

- **`GET /api/address`** returns hardcoded stub data and is not connected to the `Address` model or the `User.addresses` array. See [issue tracker](https://github.com/ITSYABOINEUTRAL/arcana-backend-master/issues) for the open issue.
- **`package.json` `"main"` field** points to `index.js`, which does not exist. The actual entry point is `server.js`.
- **No `start` / `dev` scripts** in `package.json`. Use `node server.js` or `npx nodemon server.js` directly.
- **`cloudinaryUpload.js` middleware** and **`controllers/user/uploadProfilePicture.js`** are not wired into any route. The active profile-picture upload path in `authController.js` uses `express-fileupload` directly.
- **Newsletter cron schedule** is hardcoded to a single calendar date and requires a code change to reschedule.
- **`package.json` license field** reads `ISC`; the repo LICENSE file is MIT.
- **No request-body validation** on auth endpoints — email format and password length are not enforced server-side.
- **No automated tests** are present.
