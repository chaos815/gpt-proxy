export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST allowed" }), {
      status: 405
    });
  }

  try {
    const { text } = await req.json();

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Translate the following NOTAM into natural Korean." },
          { role: "user", content: text }
        ],
        temperature: 0.3
      })
    });

    const json = await openaiRes.json();

    if (!openaiRes.ok) {
      return new Response(JSON.stringify({ error: json.error.message }), { status: 500 });
    }

    const translated = json.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ result: translated }));
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500
    });
  }
}
