import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const text = req.body.text;

  if (!text) {
    console.log("❌ 오류: 입력 텍스트 없음");
    return res.status(400).json({ error: 'Missing text in request body' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log("❌ 오류: OPENAI_API_KEY 환경변수 없음");
    return res.status(500).json({ error: 'OPENAI_API_KEY not set' });
  }

  console.log("✅ 입력된 텍스트:", text);

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Translate the following NOTAM into readable Korean. Keep units (FT, M, NM) intact, and format the result clearly.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const translation = completion.data.choices[0].message?.content || '';

    console.log("✅ 번역 결과:", translation);

    res.status(200).json({ translation });

  } catch (error: any) {
    console.error("❌ 번역 중 오류 발생:", error.message || error);
    res.status(500).json({ error: 'Translation failed', details: error.message || error });
  }
}
