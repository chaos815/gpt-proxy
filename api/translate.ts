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
      error: "Invalid text",
      code: "INVALID_TEXT",
    });
  }

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `Please translate the following aviation NOTAM text into Korean as clearly as possible:\n\n${text}`,
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
    });
  }
}
