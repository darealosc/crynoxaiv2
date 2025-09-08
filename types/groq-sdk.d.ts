declare module "groq-sdk" {
  // Minimal type support so TS stops yelling
  interface ChatCompletionMessage {
    role: "user" | "assistant" | "system";
    content: string;
  }

  interface ChatCompletionRequest {
    model: string;
    messages: ChatCompletionMessage[];
    stream?: boolean;
  }

  interface ChatCompletionResponse {
    choices: { message?: ChatCompletionMessage; delta?: { content?: string } }[];
  }

  class Groq {
    constructor(config: { apiKey: string });
    chat: {
      completions: {
        create(req: ChatCompletionRequest): Promise<ChatCompletionResponse> | AsyncGenerator<ChatCompletionResponse>;
      };
    };
  }

  export = Groq;
}
