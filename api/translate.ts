// pages/api/translate.ts
import type { NextApiRequest, NextApiResponse } from 'next';

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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Translate the following NOTAMs into Korean:\n\n${text}`,
      }],
      temperature: 0.3,
    });

    const output = completion.choices[0].message.content || "";

    return res.status(200).json({ translation: output });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
      code: err.code || "UNKNOWN",
      full: err,
    });
  }
}
