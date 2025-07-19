// pages/api/translate.ts
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
      role: "system",
      content: "Translate the following aviation NOTAM into natural Korean for a pilot.",
    },
    {
      role: "user",
      content: text,
    },
  ];

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const response = chat.choices?.[0]?.message?.content || "";

    if (!response) {
      return res.status(500).json({
        error: "Empty response from OpenAI",
        code: "EMPTY_RESPONSE",
        raw: JSON.stringify(chat),
      });
    }

    res.status(200).json({ translation: response });
  } catch (error: any) {
    res.status(500).json({
      error: error?.message || "Unknown error",
      code: "OPENAI_ERROR",
      raw: JSON.stringify(error),
    });
  }
}
