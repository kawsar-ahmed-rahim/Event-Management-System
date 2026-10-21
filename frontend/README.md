# showup - Event Management Frontend

React (Vite) + React Router. Talks to the Event Management API.

## Run locally
```bash
npm install
cp .env.example .env     # set VITE_API_URL if your API isn't on localhost:5000
npm run dev              # http://localhost:5173
```
Start the backend first (`npm run dev` in the API project).

## Deploy to Vercel (as its own project)
1. Push this folder to its own GitHub repo.
2. Import it in Vercel. Framework preset: **Vite**.
3. Add env var `VITE_API_URL` = `https://<your-api>.vercel.app/api/v1`, then deploy.
4. In the **backend** project's env vars, set `CLIENT_URL` = `https://<your-frontend>.vercel.app` and redeploy it.

`vercel.json` rewrites every path to `index.html` so refreshing on `/events/123` works.
