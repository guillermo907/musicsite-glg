# Music Site

Premium musician website built with Next.js 16, TypeScript, SCSS modules, Auth.js/NextAuth, Prisma, Google SSO, and email magic-link login.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env values:

```bash
cp .env.example .env
```

3. Fill in `AUTH_SECRET`, Google OAuth credentials, SMTP credentials, and `ADMIN_EMAILS`.

4. Create the local auth database:

```bash
npx prisma migrate dev --name init
```

5. Run locally:

```bash
npm run dev
```

## Admin

The admin dashboard is available only at `/admin`. There is no public admin button or link on the homepage. Admin access is restricted to emails listed in `ADMIN_EMAILS`, and all content-saving server actions call the server-side admin guard.

Editable content is stored in Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured. Without that token, the project falls back to `data/site-content.json` for local development and simple inspection.

## Deploy

Recommended production deploy command:

```bash
npx vercel --prod --name music-site
```

Configure these environment variables in Vercel before deploying:

- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `EMAIL_SERVER`
- `EMAIL_FROM`
- `DATABASE_URL`
- `ADMIN_EMAILS`
- `BLOB_READ_WRITE_TOKEN`
