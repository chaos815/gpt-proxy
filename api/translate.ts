import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config } from "dotenv";
import { OpenAI } from "openai";

config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/translate", async (req, res) => {
  const text = req.body.text;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid input text" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional aviation translator. Translate each NOTAM into natural Korean. Keep the format aligned with the original.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const translated = completion.choices?.[0]?.message?.content;

    if (!translated) {
      return res.status(500).json({ error: "No translation returned from OpenAI" });
    }

    return res.json({ translation: translated });
  } catch (err: any) {
    console.error("🔴 OpenAI 요청 실패:", err);

    const errorMessage =
      err?.message ||
      err?.response?.data?.error?.message ||
      "Unknown error from OpenAI";

    return res.status(500).json({
      error: "OpenAI API request failed",
      detail: errorMessage,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ GPT Translate API is running on port ${PORT}`);
});
