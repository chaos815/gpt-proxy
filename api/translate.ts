import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'No text provided or invalid format' });
    }

    const messages: ChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: 'You are an assistant that translates aviation NOTAMs into natural, accurate Korean.',
      },
      {
        role: 'user',
        content: `Translate the following NOTAMs into Korean:\n\n${text}`,
      },
    ];

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 0.2,
      messages,
    });

    const translation = completion.data.choices[0]?.message?.content || '';
    return res.status(200).json({ translation });
  } catch (error: any) {
    console.error('🔥 GPT API 요청 중 에러:', error);

    return res.status(500).json({
      error: error.message || 'Unknown error',
      code: error.code || null,
      full: error,
    });
  }
}
