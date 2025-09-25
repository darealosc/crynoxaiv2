"use client";
  import React, { useEffect, useRef, useState } from "react";
  import ReactMarkdown from "react-markdown";
  import remarkGfm from "remark-gfm";
  import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
  import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
  import { Clipboard, Trash2, Plus } from "lucide-react";
  import "../app/globals.css";

  const CopyButton = ({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700 transition"
      >
        <Clipboard className={`w-4 h-4 ${copied ? "text-green-400" : ""}`} />
      </button>
    );
  };

  // 🔹 Responsive Flashcard Component
  function Flashcard({ card }: { card: { question: string; answer: string } }) {
    const [flipped, setFlipped] = useState(false);

    return (
      <div
        className="w-full max-w-md aspect-[4/3] bg-[#222] text-white rounded-2xl shadow-xl flex items-center justify-center text-center text-lg font-semibold cursor-pointer transition-all duration-500 p-4 overflow-auto"
        onClick={() => setFlipped(!flipped)}
      >
        {!flipped ? `Q: ${card.question}` : `A: ${card.answer}`}
      </div>
    );
  }

  // 🔹 Multi-Card Viewer
  function FlashcardViewer({ cards }: { cards: { question: string; answer: string }[] }) {
    const [index, setIndex] = useState(0);
    const card = cards[index];

    const nextCard = () => setIndex((prev) => (prev + 1) % cards.length);
    const prevCard = () => setIndex((prev) => (prev - 1 + cards.length) % cards.length);

    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <Flashcard card={card} />
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={prevCard}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            ⬅ Prev
          </button>
          <button
            onClick={nextCard}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
          >
            Next ➡
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {index + 1} / {cards.length}
        </div>
      </div>
    );
  }

  const Dashboard = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState<
      { id: number; history: { role: "user" | "assistant"; content: string; type?: "chat" | "flashcards" }[] }[]
    >([]);
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const stored = localStorage.getItem("ai-chats");
      if (stored) {
        const parsed = JSON.parse(stored);
        setChats(parsed);
        if (parsed.length > 0) setActiveChat(parsed[0].id);
      }
    }, []);

    useEffect(() => {
      if (chats.length === 0) {
        const id = Date.now();
        setChats([{ id, history: [] }]);
        setActiveChat(id);
      }
    }, [chats.length]);

    useEffect(() => {
      localStorage.setItem("ai-chats", JSON.stringify(chats));
    }, [chats]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats, activeChat]);

    useEffect(() => {
      const storedFirstName = localStorage.getItem("firstName");
      if (storedFirstName) setFirstName(storedFirstName);
    }, []);

    // 🔹 Submit normal chat
    const handleSubmit = async () => {
      if (!prompt.trim() || activeChat === null) return;
      await runOllama(prompt, "chat");
    };

    // 🔹 Submit flashcards
    const handleFlashcards = async () => {
      if (!prompt.trim() || activeChat === null) return;

      const flashcardPrompt = `
      Create concise Q&A flashcards from the following text.
      Return only JSON in this format:
      [
        { "question": "Question text", "answer": "Answer text" }
      ]
      Text:
      ${prompt}
      `;

      await runOllama(flashcardPrompt, "flashcards");
    };

    // 🔹 Ollama runner
    const runOllama = async (input: string, type: "chat" | "flashcards") => {
      const userMessage = { role: "user" as const, content: prompt, type };
      const assistantMessage = { role: "assistant" as const, content: "", type };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? { ...chat, history: [...chat.history, userMessage, assistantMessage] }
            : chat
        )
      );

      setPrompt("");
      setLoading(true);

      try {
        const response = await fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            messages: [
              ...(chats.find((c) => c.id === activeChat)?.history || []),
              { role: "user", content: input },
            ],
            stream: true,
          }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(Boolean);

          for (const line of lines) {
            const data = JSON.parse(line);
            if (data.done) {
              setLoading(false);
              break;
            }
            const token = data.message?.content || "";
            fullText += token;

            setChats((prev) =>
              prev.map((chat) =>
                chat.id === activeChat
                  ? {
                      ...chat,
                      history: chat.history.map((msg, i) =>
                        msg.role === "assistant" &&
                        i === chat.history.length - 1
                          ? { ...msg, content: fullText, type }
                          : msg
                      ),
                    }
                  : chat
              )
            );
          }
        }
      } catch (err) {
        console.error("Ollama error:", err);
        setLoading(false);
      }
    };

    const newChat = () => {
      const id = Date.now();
      setChats([{ id, history: [] }, ...chats]);
      setActiveChat(id);
      setPrompt("");
    };

    const deleteChat = (id: number) => {
      const updated = chats.filter((c) => c.id !== id);
      setChats(updated);
      setActiveChat(updated.length > 0 ? updated[0].id : null);
    };

    const activeHistory =
      activeChat === null
        ? []
        : chats.find((c) => c.id === activeChat)?.history || [];

    return (
      <div className="flex items-center justify-center min-h-screen w-full p-4 bg-[#181818]">
        <div className="flex flex-row w-full max-w-6xl h-[90vh] mx-auto gap-4">
          {/* Sidebar */}
          <div className="w-[320px] flex flex-col bg-[#181818] rounded-xl p-4 shadow border border-[#333] h-full">
            <div className="flex items-center justify-between mb-2">
              <button onClick={newChat} className="p-2 rounded bg-[#222] text-white text-lg">
                <Plus />
              </button>
              {activeChat !== null && (
                <button
                  onClick={() => deleteChat(activeChat)}
                  className="p-2 rounded bg-[#222] text-red-400"
                >
                  <Trash2 />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <div key={chat.id} className="mb-2">
                  <button
                    className={`w-full text-left px-3 py-2 rounded bg-[#222] text-white text-sm ${
                      activeChat === chat.id
                        ? "border border-blue-500"
                        : "border border-transparent"
                    }`}
                    onClick={() => setActiveChat(chat.id)}
                  >
                    {chat.history[0]?.content || "New chat"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chat / Flashcards Area */}
          <div className="flex flex-col flex-1 h-full bg-[#222] rounded-xl shadow border border-[#333]">
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              {activeHistory.length === 0 && (
                <div className="flex items-center justify-center h-full text-white/60 text-lg font-medium">
                  Hey {firstName || "User"}, Start a new chat!
                </div>
              )}
              {activeHistory.map((msg, idx) => (
                <div key={idx} className="mb-6 w-full flex flex-col gap-2">
                  <div
                    className={`max-w-[80%] px-5 py-4 rounded-xl ${
                      msg.role === "user" ? "bg-[#181818]" : "bg-[#333]"
                    } text-white self-start`}
                  >
                    <div className="text-xs font-semibold mb-1">
                      {msg.role === "user" ? "You:" : "AI:"}
                    </div>

                    {/* 🔹 Flashcard Renderer */}
                    {msg.type === "flashcards" && msg.role === "assistant" ? (
                      (() => {
                        // Try to extract JSON array from the message content
                        try {
                          // Find the first '[' and last ']' to extract the JSON array
                          const start = msg.content.indexOf("[");
                          const end = msg.content.lastIndexOf("]");
                          if (start !== -1 && end !== -1) {
                            const jsonStr = msg.content.slice(start, end + 1);
                            const cards = JSON.parse(jsonStr);
                            return (
                              <div>
                                <div className="mb-4 text-base text-blue-300 font-semibold">
                                  Flashcards
                                </div>
                                <FlashcardViewer cards={cards} />
                              </div>
                            );
                          }
                          // fallback if JSON not found
                          return <pre>{msg.content}</pre>;
                        } catch {
                          return <pre>{msg.content}</pre>;
                        }
                      })()
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-[#333] bg-[#181818] flex gap-2 rounded-b-2xl rounded-t-3xl flex-wrap">
              <input
                type="text"
                className="flex-1 min-w-[150px] h-12 px-4 rounded-md bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask something or paste study text..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) handleSubmit();
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {loading ? "..." : "Send"}
              </button>
              <button
                onClick={handleFlashcards}
                disabled={loading}
                className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-500 disabled:opacity-50"
              >
                {loading ? "..." : "Flashcards"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default function AIPage() {
    return <Dashboard />;
  }
