import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Invalid input: text must be a string.' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a professional aviation NOTAM translator. Translate from English to Korean. Keep it accurate and natural." },
          { role: "user", content: text }
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return res.status(500).json({ error: data.error.message || "OpenAI API error" });
    }

    const translation = data.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({ translation });

  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({ error: "Server error during translation" });
  }
}
