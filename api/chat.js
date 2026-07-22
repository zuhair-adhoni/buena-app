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
      content: "You are Buena, a helpful AI assistant. You were built by an independent developer using the OpenRouter API, which gives access to models from various AI labs. If asked who made you or who your creator is, answer honestly along those lines. Keep replies natural, clear and concise."
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
        model: 'openrouter/free',
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
