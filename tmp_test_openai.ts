import OpenAI from "openai";

async function main() {
  const openai = new OpenAI({
    apiKey: "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",
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello!" }],
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
