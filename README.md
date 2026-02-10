# CreaseFuel

Production-ready nutrition and calorie tracking web app built with Next.js 14, TypeScript, Tailwind CSS, Supabase, USDA FoodData Central, and OpenAI Vision.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth, Storage)
- **USDA FoodData Central API** (nutrition data)
- **OpenAI Vision API** (food image calorie estimation)
- **Vercel** (deployment)

## Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `USDA_API_KEY` | [USDA API key](https://fdc.nal.usda.gov/api-key-signup.html) (manual food search) |
| `OPENAI_API_KEY` | [OpenAI API key](https://platform.openai.com/api-keys) (image estimation) |

## Database setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/migrations/001_schema.sql` in the Supabase SQL editor.
3. In Supabase Dashboard → Storage, create a public bucket named `food-images` if it was not created by the migration. Ensure authenticated users can upload (policy in migration).
4. Enable Email and Google auth in Authentication → Providers.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push to GitHub and import the repo in Vercel.
2. Add the same environment variables in Vercel project settings.
3. Deploy. No build changes required.

## Features

- Email + Google sign-in (Supabase Auth)
- User profile: age, gender, height, weight, activity level, goal, athlete mode
- BMI, BMR (Mifflin-St Jeor), maintenance and goal calories, macro targets
- Manual food log: search USDA, enter quantity, store entry
- Image food log: upload photo → OpenAI Vision estimate → store as estimated entry
- Daily and weekly tracking with adherence score
- Dashboard with calories vs target, protein, weekly adherence
