# Mille Lacs Life

Your complete guide to Mille Lacs Lake - fishing reports, local businesses, events, and everything you need for lake living.

## Tech Stack
- **Framework**: Astro
- **Hosting**: Vercel
- **Database**: Supabase
- **Email**: Resend

## Features
- Weekly fishing reports
- Business directory (resorts, restaurants, bait shops, etc.)
- Events calendar
- Visitor guides
- Newsletter signup

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start dev server at localhost:4321
npm run build    # Build for production
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
