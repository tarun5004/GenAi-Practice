# TypeTutor

A small TypeScript learning interface powered by LangChain and Mistral AI.

## Run locally

1. Copy `server/.env.example` to `server/.env` and add your Mistral API key.
2. Start the API in the first terminal:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

3. Start Vite in a second terminal:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

4. Open <http://127.0.0.1:5173>.

The browser calls `/api/chat`. During development, Vite proxies that path to
`http://localhost:3000`, so `MISTRAL_API_KEY` stays on the server and is never
included in the frontend bundle.

## Production checks

```powershell
cd server
npm run typecheck
npm run build

cd ../client
npm run build
```
