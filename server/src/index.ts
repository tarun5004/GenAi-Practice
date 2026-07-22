import "dotenv/config";

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const PORT = Number(process.env.PORT ?? 3000);
const MAX_BODY_BYTES = 10_000;
const MAX_QUESTION_LENGTH = 1_000;

if (!process.env.MISTRAL_API_KEY) {
  throw new Error("MISTRAL_API_KEY is missing from server/.env");
}

const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0.2,
  maxRetries: 2,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are TypeTutor, a beginner-friendly TypeScript mentor.
Explain the concept in simple language, then show one small practical example.
Use Markdown. Keep the answer focused and under 500 words.
Only answer TypeScript and closely related JavaScript programming questions.`,
  ],
  ["human", "{question}"],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
): void {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;

    if (totalBytes > MAX_BODY_BYTES) {
      throw new Error("REQUEST_TOO_LARGE");
    }

    chunks.push(buffer);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("INVALID_JSON");
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/chat") {
    sendJson(response, 404, { error: "Route not found" });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const question =
      typeof body === "object" && body !== null && "question" in body
        ? (body as { question?: unknown }).question
        : undefined;

    if (typeof question !== "string" || question.trim().length < 3) {
      sendJson(response, 400, { error: "Please enter a question of at least 3 characters." });
      return;
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      sendJson(response, 400, {
        error: `Question must be ${MAX_QUESTION_LENGTH} characters or fewer.`,
      });
      return;
    }

    const answer = await chain.invoke({ question: question.trim() });
    sendJson(response, 200, { answer });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") {
      sendJson(response, 413, { error: "Request is too large." });
      return;
    }

    if (error instanceof Error && error.message === "INVALID_JSON") {
      sendJson(response, 400, { error: "Request body must be valid JSON." });
      return;
    }

    console.error("Mistral request failed", error);
    sendJson(response, 502, {
      error: "Mistral could not answer right now. Please try again.",
    });
  }
});

server.listen(PORT, () => {
  console.info(`TypeTutor API listening on http://localhost:${PORT}`);
});
