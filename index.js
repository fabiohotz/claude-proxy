const express = require('express');
const app = express();
app.use(express.json());

app.post('/v1/chat/completions', async (req, res) => {
  try {
    const mensagem = req.body.mensagem || 
                     (req.body.messages && req.body.messages.filter(m => m.role === 'user').pop()?.content) || 
                     '';
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: process.env.SYSTEM_PROMPT || 'Você é um assistente da Arquitec Cursos.',
        messages: [{ role: 'user', content: mensagem }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;

    res.json({
      choices: [{ message: { role: 'assistant', content: text } }]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000);
