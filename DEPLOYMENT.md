# Deployment to Vercel

This project is ready to be deployed on Vercel (recommended). This document lists the minimal steps and environment variables required to run DocuCraft in production.

1. Create a new project on Vercel and connect the GitHub repository: `prpriyaranjan/docuraft`.

2. Set environment variables in the Vercel project (Production + Preview as needed):

- `DATABASE_URL` — Prisma database connection (e.g. a managed Postgres URL). If using SQLite for quick demos, use a writable file path, but prefer Postgres in production.
- `AUTH_SECRET` — a long random string for signing JWTs used by `src/lib/auth.ts`.
- `RAZORPAY_KEY_ID` — your Razorpay Key ID for creating orders.
- `RAZORPAY_KEY_SECRET` — your Razorpay Key Secret used for API calls and webhook signature verification.
- `NEXT_PUBLIC_PAYEE_UPI` — optional public UPI id used in UPI payment flows.

3. Razorpay webhook configuration

- In the Razorpay dashboard, add a webhook URL pointing to: `https://<your-vercel-domain>/api/payments/webhook`.
- Use the same secret you set in `RAZORPAY_KEY_SECRET` when configuring the webhook in Razorpay so signatures validate.

4. CI and Playwright

- The repository includes a GitHub Actions CI workflow `.github/workflows/ci.yml` that runs unit tests, builds the Next.js app, and runs Playwright e2e tests.
- If your Vercel deployments need environment variables for preview builds, ensure they are set in Vercel for Preview environments.

5. Post-deploy checks

- Visit `https://<your-vercel-domain>/api/health` to ensure the app responds.
- Run a manual payment/order flow in a staging environment to verify order creation and webhook handling.

6. Notes and security

- Never commit secrets to the repository. Use Vercel's Environment Variables UI.
- For webhook security, rotate `RAZORPAY_KEY_SECRET` if compromise is suspected and update the Razorpay dashboard accordingly.

If you want, I can help connect the repository to Vercel, configure environment variables, and run a smoke test.
