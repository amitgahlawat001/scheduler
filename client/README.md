# Scheduler Client

## Setup

```
npm install
cp .env.example .env   # set VITE_API_BASE_URL to the running server's /api URL
npm run dev             # Vite, port 5173 by default
```

Requires the `server` app running (see `../server/README.md`).

## Stack

React + Vite + React Router, Tailwind CSS for styling, axios for API calls with an interceptor that auto-refreshes the access token on a 401.
