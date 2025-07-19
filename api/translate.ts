import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post('/gpt-proxy-green', async (req, res) => {
  const text = req.body.text;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'API_KEY_MISSING',
      message: 'OpenAI API Key is not set in environment variables.',
    });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Translate the following NOTAM to Korean in a clear and understandable format:\n\n${text}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const translatedText = response.data.choices?.[0]?.message?.content ?? 'No translation result.';
    res.json({ translation: translatedText });

  } catch (error: any) {
    console.error('Translation Error:', error.message);
    const status = error?.response?.status;
    if (status === 401) {
      return res.status(500).json({
        error: 'API_KEY_INVALID',
        message: 'Unauthorized - OpenAI API key may be incorrect or expired.',
      });
    } else if (status === 429) {
      return res.status(500).json({
        error: 'API_RATE_LIMIT',
        message: 'Rate limit exceeded - Too many requests to OpenAI.',
      });
    }

    return res.status(500).json({
      error: 'TRANSLATION_FAILED',
      message: 'Unknown error occurred during translation.',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GPT proxy server running on port ${PORT}`);
});
