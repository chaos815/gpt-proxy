// 경로: /api/translate.ts
export default async function handler(req: any, res: any) {
  try {
    const { text } = req.body;

    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Translate the following NOTAM text into Korean.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const translation = data.choices?.[0]?.message?.content || 'Translation failed';
    return res.status(200).json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
