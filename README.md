# Learn With AI — React Admin (Tailwind v3)

This is a lightweight React + Tailwind v3 admin UI (light mode only).

## Setup

1. Copy `.env.example` to `.env` and update the API URLs.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173

## Default API mappings

- Login: POST `${VITE_API_V1_URL}/login` (expects `{ email, password }`)
- Admin counts: GET `${VITE_API_V1_URL}/user-counts`
- Admin users: GET `${VITE_API_URL}/admin/users?role=teacher` or `?role=student`
- Teacher lessons: GET `${VITE_API_URL}/teacher/lessons`

Push to your GitHub:
```
git init
git add .
git commit -m "Initial React Admin UI (Tailwind)"
git remote add origin https://github.com/ilanthirayan-singaram/learn_with_ai_web.git
git branch -M main
git push -u origin main
```
