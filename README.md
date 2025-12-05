

# 📦 Setup

## **Prerequisites**

* Node.js (LTS)
* npm
* SQLite (bundled with Prisma)
* **Ollama** installed locally
* Pull the model:

```bash
ollama pull llama3.2
```

---

## **1️⃣ Install dependencies**

```bash
npm install
```

---

## **2️⃣ Environment Variables**

Create a `.env` file in your project root:

```env
# Database (Prisma uses this)
DATABASE_URL="file:./dev.db"

# Ollama AI configuration
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
```

> If your template had other `.env` variables, keep those as well.

---

## **3️⃣ Database Setup (if using Prisma migrations)**

```bash
npx prisma migrate dev
npx prisma db seed
```

---

# ▶️ Running the App Locally

You must run **two terminals**.

---

## **Terminal 1 — Backend (API + AI)**

```bash
npm run server
```

Backend runs at:

```
http://localhost:3100/api
```

### Endpoints used:

```
GET /api/todos
GET /api/categories
POST /api/ai/help
```

---

## **Terminal 2 — Frontend (Vite)**

```bash
npm run dev
```

Visit the URL Vite prints (usually):

```
http://localhost:5173
```

---

# 🤖 AI Feature: “AI Help for a Task”

1. Click **“AI Help for a Task”**
2. Enter a task (e.g., “Study for my biology exam”)
3. Frontend sends:

```json
POST /api/ai/help
{
  "task": "Study for my biology exam"
}
```

4. Backend sends the prompt to **Ollama** using model `llama3.2`
5. AI responds with a friendly explanation
6. Modal displays the result

> This feature **does not change the database**.
> It only provides advice.

---

# 🛠 Troubleshooting

### **Ollama not running / model not found**

```bash
ollama pull llama3.2
```

Ensure the Ollama desktop app is open.

---

### **AI Error in modal**

Check:

* `.env` values
* That backend terminal prints logs for `/api/ai/help`
* That backend is running:

```bash
npm run server
```

---

### **ERR_CONNECTION_REFUSED**

Backend is not running or incorrect port.

Your backend must be running on **port 3100**.

---

