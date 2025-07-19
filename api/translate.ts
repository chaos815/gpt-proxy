// pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionMessageParam,
  OpenAI,
} from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;

  // 디버깅 출력
  console.log("📤 수신한 text:", text);
  console.log("📏 text 길이:", text?.length);
  console.log("🔍 text 타입:", typeof text);

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "API Key is missing", code: "NO_API_KEY" });
  }

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Invalid text", code: "INVALID_TEXT", received: text });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Translate this NOTAM into natural Korean:\n\n${text}`,
        },
      ],
    });

    const translated = completion.choices[0]?.message?.content ?? "";
    return res.status(200).json({ translation: translated });
  } catch (error: any) {
    console.error("❌ GPT 요청 에러:", error?.message);
    return res.status(500).json({
      error: error?.message || "Translation failed",
      code: "GPT_ERROR",
    });
  }
}
