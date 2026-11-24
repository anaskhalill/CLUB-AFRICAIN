import fetch from 'node-fetch';

async function main() {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello' }]
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
main();
