import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';
import { Configuration, OpenAIApi } from 'openai';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/translate', async (req, res) => {
  const text: string = req.body.text || '';
  console.log('✅ STEP 1: 요청 도착');
  console.log('📦 입력 텍스트:', text);

  if (!text.trim()) {
    console.log('❌ 입력 없음');
    return res.status(400).json({ error: 'No input text' });
  }

  const messages = [
    {
      role: 'user',
      content: `Translate the following aviation NOTAM to Korean in a readable format:\n\n${text}`,
    },
  ];

  console.log('✅ STEP 2: messages 생성 완료');
  console.log(JSON.stringify(messages, null, 2));

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.3,
    });

    console.log('✅ STEP 3: OpenAI 응답 도착');

    const result = completion.data.choices?.[0]?.message?.content;

    if (!result) {
      console.log('❌ STEP 4: 응답 없음 또는 파싱 실패');
      return res.status(500).json({ error: 'No translation content returned from OpenAI' });
    }

    console.log('✅ STEP 4: 번역 완료');
    return res.json({ translated: result });

  } catch (err: any) {
    console.error('❌ STEP 5: OpenAI 오류 발생');
    const errorMessage =
      err?.response?.data?.error?.message ||
      err?.message ||
      'Unknown OpenAI API error';
    console.error(errorMessage);
    return res.status(500).json({ error: 'OpenAI API request failed', detail: errorMessage });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ GPT Translate API is running on port ${PORT}`);
});
