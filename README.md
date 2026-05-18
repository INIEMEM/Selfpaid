# Global Task Platform

A full-stack monorepo web platform for global tasks, built with Node.js/Express, MongoDB, Redis, React, and Vite.

## Running the backend

1. Navigate to the `/server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in necessary environment variables (especially `MONGO_URI`):
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Running the frontend

1. Navigate to the `/client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. The frontend expects the backend API at `http://localhost:5000/api`. If you change the backend port, update `client/.env`.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
