// /pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionMessageParam, OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "API Key is missing",
      code: "NO_API_KEY",
    });
  }

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      error: "Invalid text format",
      code: "INVALID_TEXT",
    });
  }

  // ✅ 전처리: 컨트롤 문자 제거 및 공백 정리
  const cleaned = text
    .replace(/[^\x20-\x7E\n\r]/g, "") // 제어 문자 제거
    .replace(/\n{3,}/g, "\n\n")       // 줄바꿈이 3줄 이상이면 2줄로 정리
    .trim();

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `Please translate the following NOTAM text into clear Korean:\n\n${cleaned}`,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const translated = completion.choices[0]?.message?.content || "";
    res.status(200).json({ translation: translated });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Unknown error",
      code: error.code || "UNKNOWN",
      full: JSON.stringify(error, null, 2),
      debugSentText: cleaned.slice(0, 1000), // 🔍 실제 전송된 일부 텍스트 디버깅
    });
  }
}
