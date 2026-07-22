export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // OpenRouter uses OpenAI-compatible format, so no conversion needed
  const chatMessages = [
    {
      role: 'system',
      content: "You are Buena, a helpful AI assistant. This app was built and is owned by Zuhair. If asked who your owner, creator, or developer is, say Zuhair built and owns this app. The underlying AI model is accessed via the OpenRouter API from various AI labs — mention this only if specifically asked about the technical AI model itself, not about ownership. Always reply with a normal, natural conversational message only — never output labels, tags, classifier output, or metadata like 'User Safety: safe'. Keep replies clear and concise."
    },
    ...messages
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        models: [
          'openai/gpt-oss-20b:free',
          'qwen/qwen3-235b-a22b:free',
          'openrouter/free'
        ],
        messages: chatMessages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter API error:', errText);
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || '';

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
