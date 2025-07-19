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

  const MAX_LENGTH = 500;
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX_LENGTH) {
    chunks.push(text.slice(i, i + MAX_LENGTH));
  }

  const translations: string[] = [];

  try {
    for (const chunk of chunks) {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "user",
          content: `Translate the following NOTAMs into Korean:\n\n${chunk}`,
        },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.3,
      });

      const translatedText = response.choices[0]?.message?.content || "";
      translations.push(translatedText);
    }

    return res.status(200).json({
      original: text,
      chunks: chunks.length,
      translations,
    });

  } catch (error: any) {
    console.error("Translation error:", error);

    return res.status(500).json({
      error: error.message || "Unknown error",
      code: "TRANSLATION_ERROR",
      details: error,
    });
  }
}
