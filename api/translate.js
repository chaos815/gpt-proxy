export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Invalid request body. "text" is required and must be a string.' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '너는 항공 노탐(NOTAM)을 전문적으로 해석해서 한국어로 번역해주는 전문가야. 번역 결과는 명확하고 군더더기 없이 전달해.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      })
    });

    const json = await openaiRes.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    const translated = json.choices?.[0]?.message?.content || '번역 결과 없음';
    res.status(200).json({ translated });

  } catch (err) {
    res.status(500).json({ error: 'Translation failed', detail: err.message });
  }
}
