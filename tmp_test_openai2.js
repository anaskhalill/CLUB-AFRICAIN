const https = require('https');

const data = JSON.stringify({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Say hello' }]
});

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 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',
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
