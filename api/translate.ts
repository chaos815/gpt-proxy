import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import OpenAI from 'openai';

config(); // .env 로부터 환경 변수 불러오기

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/translate', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Translate the following NOTAM into Korean. Keep it formal and aviation-style.'
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    const translated = completion.choices?.[0]?.message?.content || "(no response)";
    res.json({ translation: translated });

  } catch (err) {
    console.error('[TRANSLATE ERROR]', err);
    res.status(500).json({
      error: 'Translation failed',
      detail: err instanceof Error ? err.message : String(err)
    });
  }
});

export default app;
