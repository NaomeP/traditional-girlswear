# Deploy to Render

1. Push this repository to GitHub, then create a Render Blueprint from `render.yaml`.
2. In the API service, provide the required secret values marked `sync: false`: `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD`.
3. If Render changes any generated service URL, update all of these values before deploying:
   - API: `FRONTEND_URL` and `ADMIN_URL`
   - Web and Admin static sites: `VITE_API_BASE_URL`
4. Deploy. Render runs database migrations, builds the API, and publishes both Vite sites.

The API health check is `https://traditional-girlswear-api.onrender.com/api/v1/health`.

## Local development

Copy each `.env.example` file to `.env` (or `.env.local` in a Vite app) and use the local API URL. Do not commit real credentials.
