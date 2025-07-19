import express from "express";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();
const app = express();
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/api/translate", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid input", code: "INVALID_INPUT" });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an aviation expert who translates NOTAMs into natural Korean. Translate clearly.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const output = completion.data.choices?.[0]?.message?.content;
    if (!output) {
      return res.status(500).json({
        error: "No content returned from GPT",
        code: "EMPTY_RESPONSE",
      });
    }

    return res.json({ translation: output });
  } catch (err: any) {
    const errorMessage =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown error from OpenAI";

    return res.status(500).json({
      error: "OpenAI API request failed",
      detail: errorMessage,
      code: "GPT_API_ERROR",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ GPT Translate API running on port ${PORT}`);
});
