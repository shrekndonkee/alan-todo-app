// server/aiRoutes.ts
import { Router } from "express";
import "dotenv/config";

const router = Router();

const BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
const MODEL = process.env.OLLAMA_MODEL || "llama3.2";

// POST /api/ai/help
// body: { "task": "Clean my room" }
router.post("/help", async (req, res) => {
  const task: string = req.body?.task || "";

  if (!task.trim()) {
    return res.status(400).json({ error: "task is required" });
  }

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a friendly productivity coach. Given a task, explain step-by-step how a student can accomplish it. Keep it clear and practical, 4–7 short steps.",
          },
          {
            role: "user",
            content: `Help me accomplish this task: "${task}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Ollama AI error:", errText);
      return res.status(500).json({ error: "AI request failed" });
    }

    const data = await response.json();
    const content: string =
      data?.choices?.[0]?.message?.content || "No explanation available.";

    res.json({ explanation: content });
  } catch (err) {
    console.error("AI help route error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
