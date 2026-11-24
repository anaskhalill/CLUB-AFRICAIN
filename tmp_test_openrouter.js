import OpenAI from 'openai';

async function main() {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: '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',
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Club Africain Assistant',
    }
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello' }],
      temperature: 0.5,
      max_tokens: 800,
    });
    console.log('Success:', JSON.stringify(completion, null, 2));
  } catch (error) {
    console.error('API Error Name:', error.name);
    console.error('API Error Message:', error.message);
    console.error('API Error Code:', error.code);
    console.error('Raw Error:', error);
  }
}

main();
