const https = require('https');

const data = JSON.stringify({
  model: 'openai/gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Say hello' }]
});

const options = {
  hostname: 'openrouter.ai',
  port: 443,
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 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',
    'HTTP-Referer': 'http://localhost:3000',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let responseData = '';
  res.on('data', d => {
    responseData += d;
  });
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
