import { Router, type Request, type Response } from "express";

const router = Router();

const GEMINI_BASE = "https://generativelanguage.googleapis.com";
const OPENAI_BASE = "https://api.openai.com";
const TIMEOUT_MS = 30000;

router.post("/ai-proxy/gemini", async (req: Request, res: Response) => {
  try {
    const { model, apiKey, body } = req.body as {
      model: string;
      apiKey: string;
      body: Record<string, unknown>;
    };

    if (!model || !apiKey || !body) {
      res.status(400).json({ error: "Missing model, apiKey, or body" });
      return;
    }

    const url = `${GEMINI_BASE}/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });

    clearTimeout(timer);

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

router.post("/ai-proxy/openai", async (req: Request, res: Response) => {
  try {
    const { apiKey, body } = req.body as {
      apiKey: string;
      body: Record<string, unknown>;
    };

    if (!apiKey || !body) {
      res.status(400).json({ error: "Missing apiKey or body" });
      return;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const response = await fetch(`${OPENAI_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });

    clearTimeout(timer);

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    res.status(502).json({ error: msg });
  }
});

export default router;
