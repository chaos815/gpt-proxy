export default async function handler(req, res) {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Translate the following NOTAM into Korean. Keep it accurate and use aviation terminology.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content || 'Translation failed';

    res.status(200).json({ result: translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Failed to fetch from OpenAI' });
  }
}
