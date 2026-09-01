# DocuCraft

DocuCraft is a small Next.js app for creating, previewing, and exporting templated documents (resumes, biodata, cover letters) with a simple pay-per-download flow.

Prerequisites
- Node.js 18+ and npm
- Git

Quick start (local)

1. Install dependencies

```bash
npm install
```

2. Set environment variables (create a `.env` file)

```
AUTH_SECRET="docucraft-local-secret-change-me"
DATABASE_URL="file:./dev.db"
```

3. Initialize the database (SQLite)

```bash
npx prisma db push
```

4. Run the dev server

```bash
npm run dev
```

Tests

```bash
npm run test
```

Build

```bash
npm run build
npm run start
```

CI

This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that runs install, tests, and build on pushes and pull requests.

Project structure
- `src/app` — Next.js app routes and pages
- `src/components` — React components (editor, preview, payment)
- `src/lib` — server and client helpers (auth, payment, validation)
- `src/data` — template definitions
- `prisma` — Prisma schema

Environment
- `AUTH_SECRET` — JWT signing secret
- `DATABASE_URL` — Prisma datasource (defaults to SQLite in examples)

Next steps
- Add more tests for API routes and components
- Connect a real payment gateway (Razorpay) for production
- Add CI badges and deployment configs

Deployment
- Vercel: connect the repository to Vercel, set environment variables (`AUTH_SECRET`, `DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) in the project settings, and Vercel will build and deploy automatically.

Razorpay integration
- A server-side scaffold is provided at `src/lib/razorpay.ts` and an API route at `src/app/api/payments/razorpay/route.ts` that creates an order using your Razorpay keys. You must set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the environment for it to work.

Webhooks
- A webhook endpoint scaffold is available at `src/app/api/payments/webhook/route.ts` that verifies the `x-razorpay-signature` header and creates a simple order record. Configure your Razorpay webhook URL to point to `/api/payments/webhook` and set `RAZORPAY_KEY_SECRET` in environment variables (the same secret used for API requests).

End-to-end tests
- Playwright tests live in the `e2e/` folder. Run them locally after starting the dev server:

```bash
npm run dev
npm run e2e
```

License
MIT
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
