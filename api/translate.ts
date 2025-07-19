// File: /api/translate.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Translate the following NOTAM text to Korean.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
      }),
    });

    const data = await openaiRes.json();
    const translation = data.choices?.[0]?.message?.content ?? 'No translation';

    return res.status(200).json({ translation });
  } catch (error) {
    return res.status(500).json({ error: 'Translation failed', detail: error });
  }
}
