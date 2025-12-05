📦 Setup
Prerequisites

Node.js (LTS)

npm

SQLite (bundled with Prisma)

Ollama installed and running

Model llama3.2 pulled in Ollama:

ollama pull llama3.2

1️⃣ Install dependencies
npm install

2️⃣ Environment Variables

Create a .env file in the project root (same folder as package.json) with:

# Database (Prisma uses this)
DATABASE_URL="file:./dev.db"

# Ollama AI configuration
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2


If your class template already had other env values, keep those too.

3️⃣ Database Setup

If your project is using Prisma migrations/seed:

npx prisma migrate dev
npx prisma db seed

▶️ Running the App Locally

Open two terminals in the project folder.

Terminal 1 – Backend (API + AI Endpoint)
npm run server


This starts the Express server on:

http://localhost:3100/api

Backend endpoints used:

GET /api/todos

GET /api/categories

POST /api/ai/help → talks to Ollama

Terminal 2 – Frontend (Vite Dev Server)
npm run dev


Then open the URL Vite prints (usually):

http://localhost:5173

🤖 AI Feature: “AI Help for a Task”

This feature appears as the purple button in the Actions panel.

How it works:

Click “AI Help for a Task”

A modal asks: “What task do you want help with?”

You enter something like:
“Study for my biology exam”

When you submit:

Frontend sends:

POST /api/ai/help
{ "task": "Study for my biology exam" }


Backend calls your local Ollama model (llama3.2)

Ollama returns a step-by-step helpful explanation

The modal displays the guidance

The AI does NOT modify todos or the database.
It only provides helpful advice.

🛠 Troubleshooting
Ollama not running / model missing

Make sure Ollama is open.
Run:

ollama pull llama3.2

AI modal says “AI Error”

Check:

OLLAMA_BASE_URL and OLLAMA_MODEL in .env

That the backend terminal prints the request when calling /api/ai/help

That npm run server is running

API ERR_CONNECTION_REFUSED

This means the backend isn’t running.

✔️ Ensure:

npm run server


is active.

✔️ Make sure nothing else is using port 3100.
