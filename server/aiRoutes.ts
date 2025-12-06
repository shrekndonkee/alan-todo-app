// server/aiRoutes.ts
import { Router } from "express";
import "dotenv/config";

const router = Router();

const BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
const MODEL = process.env.OLLAMA_MODEL || "llama3.2";

// POST /api/ai/help
router.post("/help", async (req, res) => {
  const task: string = (req.body?.task || "").trim();

  if (!task) {
    return res.status(400).json({ error: "task is required" });
  }

  try {
    const body = {
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `
You are a task-breaking assistant.

Respond ONLY with numbered steps in this format:

Step 1. ...
Step 2. ...
Step 3. ...

No introductions, no conclusions, no headings, no markdown.
3–7 steps max, one step per line.
`.trim(),
        },
        {
          role: "user",
          content: `Task: ${task}`,
        },
      ],
      stream: false,
    };

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Ollama AI error:", errText);
      return res.status(500).json({ error: "AI request failed" });
    }

    const data = await response.json();
    const raw: string =
      data?.choices?.[0]?.message?.content || "No explanation available.";

    // Split into lines and clean them
    const lines = raw
      .split(/\n+/)
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    // Prefer only lines that look like steps (start with step/number/bullet)
    const stepLike = lines.filter((line) =>
      /^(Step\s*\d+|[0-9]+\s*[\.\)]|\-|\•)/i.test(line)
    );

    const source = stepLike.length > 0 ? stepLike : lines;

    const formatted = source
      .map((line, index) => {
        // strip markdown ** and leading numbering/bullets
        const cleaned = line
          .replace(/\*{1,3}/g, "") // remove **bold**
          .replace(
            /^(Step\s*\d+\s*[\.:)]|[0-9]+\s*[\.\)]|\-|\•)\s*/i,
            ""
          );

        return `Step ${index + 1}. ${cleaned}`;
      })
      .join("\n");

    res.json({
      explanation: formatted || "Sorry, I couldn't generate steps for that task.",
    });
  } catch (err) {
    console.error("AI help route error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
