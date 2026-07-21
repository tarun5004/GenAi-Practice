import "dotenv/config";

import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

if (!process.env.MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY is missing from the .env file");
}

const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0.2,
  maxRetries: 2
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a beginner-friendly programming tutor. Explain concepts using simple language and one small example."
  ],
  ["human", "Teach me about {topic} in TypeScript."]
]);

const outputParser = new StringOutputParser();

const chain = prompt.pipe(model).pipe(outputParser);

async function main(): Promise<void> {
  const answer = await chain.invoke({
    topic: "async and await"
  });

  console.log(answer);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "An unknown error occurred";

  console.error("Application failed:", message);
  process.exitCode = 1;
});