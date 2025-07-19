import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({
        error: 'API KEY 없음',
        detail: '환경 변수에 OPENAI_API_KEY가 없습니다.'
      }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    if (!text) {
      return NextResponse.json({
        error: '입력 텍스트 없음',
        detail: '번역할 텍스트가 요청에 포함되지 않았습니다.'
      }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '다음 항공 NOTAM 문장을 한국어로 정확하고 자연스럽게 번역해 주세요. 결과에는 원문을 반복하지 마세요.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.2
    });

    const translated = completion.choices[0].message.content;

    return NextResponse.json({ translation: translated });

  } catch (err: any) {
    const errorMessage = err?.message || String(err);
    const isAuthError = errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized');

    return NextResponse.json({
      error: '번역 실패',
      message: errorMessage,
      hint: isAuthError
        ? '❌ API Key가 유효하지 않거나 잘못된 형식입니다.'
        : '❗️기타 에러가 발생했습니다. 로그 확인 필요.'
    }, { status: 500 });
  }
}
