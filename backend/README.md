# 💰 Where Is My Money — Backend

A RESTful API for personal finance tracking. Manage accounts, record transactions, set budgets, and keep tabs on where your money goes.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express v5 |
| Database | MongoDB via Mongoose v9 |
| Cache / Token Store | Redis via ioredis |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| Testing | Jest |

## Project Structure

```
backend/
├── server.js                  # HTTP server bootstrap
├── app.js                     # Express app setup & route mounting
├── db/
│   └── db.js                  # Mongoose connection helper
├── models/
│   ├── user.model.js          # User schema (email, password, JWT helper)
│   ├── account.model.js       # Account schema (kind, currency, balance, budget)
│   └── transaction.model.js   # Transaction schema (amount, type, purpose, note)
├── routes/
│   ├── user.routes.js         # /api/users/*
│   ├── accounts.routes.js     # /api/accounts/*
│   └── transaction.routes.js  # /api/transactions/*
├── controller/
│   ├── user.controller.js
│   ├── accounts.controller.js
│   └── transaction.controller.js
├── services/
│   ├── user.services.js
│   ├── accounts.services.js
│   ├── transaction.services.js
│   └── redis.services.js      # Redis client singleton
├── middleware/
│   └── auth.middleware.js      # JWT verification + Redis token blacklist
├── tests/
│   ├── setup.js
│   ├── helpers.js
│   ├── auth.test.js
│   ├── accounts.test.js
│   └── transactions.test.js
└── jest.config.js
```

## Data Models

### User
| Field | Type | Constraints |
|---|---|---|
| `email` | String | Required, unique, 6-100 chars, validated regex |
| `password` | String | Required, 6-100 chars, stored as bcrypt hash |

**Methods:** `hashPassword()` (static), `isValidPassword()`, `generateJWT()` (3 h expiry)

### Account
| Field | Type | Details |
|---|---|---|
| `userId` | ObjectId → User | Owner reference |
| `kind` | Enum | `saving` · `current` · `digitalWallet` · `cash` |
| `currency` | Enum | `INR` · `USD` · `EUR` · `GBP` · `AUD` · `CAD` · `NZD` · `JPY` · `CNY` · `RMB` |
| `balance` | Number | Default `0` |
| `budget` | Number | Optional spending limit |
| `budgetReached` | Boolean | Auto-flagged when `balance ≥ budget` |

### Transaction
| Field | Type | Details |
|---|---|---|
| `userId` | ObjectId → User | Owner reference |
| `accountId` | ObjectId → Account | Target account |
| `amount` | Number | Min `0` |
| `type` | Enum | `credit` (income) · `debit` (expense) |
| `purpose` | String | Required label |
| `note` | String | Optional |
| `createdAt` | Date | Auto-generated |
| `balanceAfterTransaction` | Number | Snapshot of account balance post-txn |

## API Reference

All protected routes require a `Bearer` token in the `Authorization` header.

### Auth & User — `/api/users`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/register` | ✗ | `{ email, password }` | Register & receive JWT |
| `POST` | `/login` | ✗ | `{ email, password }` | Login & receive JWT |
| `GET` | `/profile` | ✓ | — | Get current user info |
| `POST` | `/logout` | ✓ | — | Blacklist token in Redis (24 h TTL) |
| `GET` | `/get-all-accounts` | ✓ | — | List all accounts for user |
| `GET` | `/get-all-transactions` | ✓ | — | List all transactions for user |

### Accounts — `/api/accounts`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/create-account` | ✓ | `{ kind, balance }` | Create a new account |
| `GET` | `/get-info/:accountId` | ✓ | — | Get account details |
| `PUT` | `/update-budget/:accountId` | ✓ | `{ budget }` | Set/update spending budget |
| `GET` | `/check-budget/:accountId` | ✓ | — | Budget status (% used, remaining) |
| `PUT` | `/reset-budget-flag/:accountId` | ✓ | — | Reset `budgetReached` flag |
| `DELETE` | `/delete-account/:accountId` | ✓ | — | Delete (only if balance = 0) |
| `GET` | `/get-all-transactions/:accountId` | ✓ | — | Transactions for a specific account |

### Transactions — `/api/transactions`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| `POST` | `/create-transaction` | ✓ | `{ accountId, amount, type, purpose, note? }` | Create txn & update balance |
| `GET` | `/get-transaction/:transactionId` | ✓ | — | Get single transaction |
| `PUT` | `/update-transaction/:transactionId` | ✓ | `{ transactionId, amount, type, purpose, note? }` | Edit transaction details |
| `DELETE` | `/delete-transaction/:transactionId` | ✓ | — | Delete transaction |

## Key Business Logic

- **Balance management** — credits add to the account balance; debits subtract (with insufficient-funds check).
- **Budget tracking** — when a debit causes `balance ≥ budget`, the `budgetReached` flag is set automatically.
- **Token blacklisting** — on logout the JWT is persisted in Redis with a 24-hour TTL to prevent reuse.
- **Account deletion guard** — accounts can only be deleted when their balance is exactly `0`.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (see .env.example)
cp .env.example .env
# Fill in: PORT, MONGODB_URI, SALT_ROUNDS, JWT_SECRET,
#          REDIS_HOST, REDIS_PORT, REDIS_PASSWORD

# 3. Start the server
node server.js          # or: npx nodemon server.js

# 4. Run tests
npx jest --coverage
```

### Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3000`) |
| `MONGODB_URI` | MongoDB connection string |
| `SALT_ROUNDS` | bcrypt salt rounds |
| `JWT_SECRET` | Secret for signing JWTs |
| `REDIS_HOST` | Redis host address |
| `REDIS_PORT` | Redis port |
| `REDIS_PASSWORD` | Redis password |

## License

ISC
