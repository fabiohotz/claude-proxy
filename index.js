const express = require('express');
const app = express();
app.use(express.json());

app.post('/v1/chat/completions', async (req, res) => {
  try {
    const mensagem = req.body.mensagem || 
                     (req.body.messages && req.body.messages.filter(m => m.role === 'user').pop()?.content) || 
                     '';
    
    console.log('Mensagem recebida:', mensagem);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: process.env.SYSTEM_PROMPT || 'Você é um assistente da Arquitec Cursos.',
        messages: [{ role: 'user', content: mensagem }]
      })
    });

    const data = await response.json();
    console.log('Resposta Anthropic:', JSON.stringify(data));
    
    if (!data.content || !data.content[0]) {
      return res.status(500).json({ error: 'Anthropic error', detail: data });
    }
    
    const text = data.content[0].text;
    res.json({
      choices: [{ message: { role: 'assistant', content: text } }]
    });
  } catch (err) {
    console.log('Erro:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000);
