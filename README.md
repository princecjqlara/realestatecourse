# Facebook Ads Funnel Course

This project is a lead generation funnel for a free Facebook Ads course.

## What is included

- simple landing page with one CTA and one lead form
- gated course page unlocked immediately after form submission
- resume page that reopens the course with the same email
- optional Supabase magic-link resume flow
- `/admin` login route with dashboard and content controls
- watch tracking, resume-login tracking, and retention analytics
- direct Cloudinary uploads for lesson videos and other media in admin

## Local development

1. Copy `.env.example` into `.env.local`.
2. Set `APP_SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` if you want admin media uploads.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

Without Supabase credentials, the app uses a local JSON datastore at `.data/funnel-db.json` and local resume mode.

Without Cloudinary credentials, the Cloudinary admin uploader will return a configuration error instead of uploading media.

## Supabase setup

If you want secure magic-link resume access, set these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

The starter production schema is in `supabase/schema.sql`.

When `SUPABASE_SERVICE_ROLE_KEY` is set, the app uses Supabase as the primary datastore. Without it, the app falls back to the local `.data/funnel-db.json` store for development.

## Cloudinary media

Admin uploads now go through a signed Cloudinary flow at `/admin/content`.

- lesson videos can be uploaded directly in the subtopic form
- a general uploader is available for images, videos, and other files
- uploaded lesson videos save the Cloudinary secure URL into the lesson record

## Admin route

- login page: `/admin`
- dashboard: `/admin/dashboard`
- content manager: `/admin/content`

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`
