# Greenify Backend

## Project Structure

```
├── src/
│   ├── controllers/         # Route controllers for user and waste
│   ├── db/
│   │   ├── models/          # Mongoose models (Users, Waste)
│   │   └── utils/           # Database connection utility
│   ├── routes/              # Express route definitions
│   ├── services/            # Business logic for users and waste
│   └── utils/               # Utility functions (e.g., environmental impact)
│   └── index.js             # Main Express app entry point
├── .env                     # Environment variables
├── package.json             # Project metadata and dependencies
├── nodemon.json             # Nodemon config for development
├── vercel.json              # Vercel deployment config
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB Atlas or local MongoDB instance
- Auth0 account for authentication

### Installation
1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd knowcode_protobuf_backend
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values (see `.env` in the repo for reference).

4. **Run the server:**
   ```sh
   npm run dev
   ```
   The server will start on `http://localhost:5000` by default.

### Deployment
- The project is ready for deployment on [Vercel](https://vercel.com/) using the provided `vercel.json`.

## API Endpoints

### User Routes (`/api/v1/users`)
- `POST /verify` — Verify if a user exists
- `POST /register/complete` — Register a user after Auth0 authentication
- `GET /profile` — Get user profile
- `GET /data/:auth0Id` — Get user data by Auth0 ID

## Environment Variables

- `DB_URI` — MongoDB connection string
- `AUTH0_DOMAIN` — Auth0 domain
- `CLIENT_SECRET` — Auth0 client secret
- `AUTH0_AUDIENCE` — Auth0 API audience

## Technologies Used
- Node.js, Express.js
- MongoDB, Mongoose
- Auth0 (authentication)
- Vercel (deployment)
