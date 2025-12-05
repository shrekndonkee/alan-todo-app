📦 Setup

Prerequisites

Node.js (LTS)

npm

SQLite (bundled with Prisma)

Ollama
 installed and running

Model llama3.2 pulled in Ollama:

ollama pull llama3.2


1. Install dependencies

npm install


2. Environment variables

Create a .env file in the project root (same folder as package.json) with:

# Database (Prisma uses this)
DATABASE_URL="file:./dev.db"

# Ollama AI configuration
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2


If your class template already had other env values, keep those too.

3. Database

If you’re using Prisma migrations/seed (adjust to whatever you already have):

npx prisma migrate dev
npx prisma db seed

▶️ Running the app locally

Open two terminals in the project folder:

Terminal 1 – Backend (API + AI endpoint)

npm run server


This starts the Express server on:

http://localhost:3100/api

Endpoints used:

GET /api/todos

GET /api/categories

POST /api/ai/help → talks to Ollama

Terminal 2 – Frontend (Vite dev server)

npm run dev


Then open the URL Vite prints (usually http://localhost:5173).

🤖 AI Feature: “AI Help for a Task”

The AI feature is the purple button in the Actions panel:

Click “AI Help for a Task”

A modal asks you to describe a task (e.g. “Study for my biology exam”)

When you submit:

Frontend calls: POST http://localhost:3100/api/ai/help with { task }

Backend calls the local Ollama model llama3.2

The AI returns a step-by-step explanation of how to accomplish the task

The explanation is shown in a modal using the existing modal system

This AI feature is read-only and does not modify todos or the database; it just gives guidance.

🛠 Troubleshooting

Ollama not running / model missing

Make sure the Ollama app is open

Run:

ollama pull llama3.2


AI modal says “AI Error”

Check that OLLAMA_BASE_URL and OLLAMA_MODEL in .env match your local Ollama setup

Check the backend terminal for errors when calling /api/ai/help

API ERR_CONNECTION_REFUSED

Ensure npm run server is running

Ensure nothing else is using port 3100
