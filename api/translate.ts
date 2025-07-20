// translate.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/translate", async (req, res) => {
  const text = req.body.text;
  console.log("🚀 수신된 텍스트:", text);

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Invalid input text" });
  }

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Translate this NOTAM text to natural Korean.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const translatedText = response.data.choices[0]?.message?.content;

    if (!translatedText) {
      return res.status(500).json({
        error: "OpenAI 응답 오류: content 누락",
        debug: response.data,
      });
    }

    res.json({ translated: translatedText });
  } catch (err: any) {
    console.error("🔥 OpenAI 요청 실패:", err);

    const errorMessage =
      err?.response?.data?.error?.message ||
      err?.message ||
      "Unknown error from OpenAI";

    res.status(500).json({
      error: "OpenAI API 요청 실패",
      detail: errorMessage,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ GPT Translate API is running on port ${PORT}`);
});
