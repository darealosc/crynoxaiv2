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

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<
    { id: number; history: { role: "user" | "assistant"; content: string }[] }[]
  >([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
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

  const handleSubmit = async () => {
    if (!prompt.trim() || activeChat === null) return;

    const userMessage = { role: "user" as const, content: prompt };
    const assistantMessage = { role: "assistant" as const, content: "" };

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
            userMessage,
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

          // live streaming update
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === activeChat
                ? {
                    ...chat,
                    history: chat.history.map((msg, i) =>
                      msg.role === "assistant" &&
                      i === chat.history.length - 1
                        ? { ...msg, content: fullText }
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
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                history: chat.history.map((msg) =>
                  msg.role === "assistant" && msg.content === ""
                    ? { ...msg, content: "Error: could not reach Ollama" }
                    : msg
                ),
              }
            : chat
        )
      );
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
        {/* Chat list */}
        <div className="w-[320px] flex flex-col bg-[#181818] rounded-xl p-4 shadow border border-[#333] h-full">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={newChat}
              className="p-2 rounded bg-[#222] text-white text-lg"
              title="New Chat"
            >
              <Plus />
            </button>
            {activeChat !== null && (
              <button
                onClick={() => deleteChat(activeChat)}
                className="p-2 rounded bg-[#222] text-red-400"
                title="Delete Chat"
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
        {/* Main chat area */}
        <div className="flex flex-col flex-1 h-full bg-[#222] rounded-xl shadow border border-[#333]">
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            {activeHistory.length === 0 && (
              <div className="flex items-center justify-center h-full text-white/60 text-lg font-medium">
                No messages yet. Start the conversation!
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
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      strong: ({ node, ...props }) => (
                        <strong {...props} className="text-white font-bold" />
                      ),
                      code: ({
                        inline,
                        className,
                        children,
                        ...props
                      }: any) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");
                        return !inline && match ? (
                          <div className="relative max-w-[90%] break-words">
                            <CopyButton code={codeString} />
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                borderRadius: "0.5rem",
                                padding: "1rem",
                                margin: 0,
                                maxWidth: "100%",
                                wordWrap: "break-word",
                              }}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code
                            {...props}
                            className="bg-transparent px-1 py-0.5 rounded-md font-mono text-sm text-yellow-300 break-words max-w-[90%]"
                          >
                            {children}
                          </code>
                        );
                      },
                      p: ({ node, ...props }) => (
                        <p
                          {...props}
                          className="m-0 leading-relaxed max-w-[90%] break-words"
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-6 py-4 border-t border-[#333] bg-[#181818] flex gap-2 rounded-b-2xl rounded-t-3xl">
            <input
              type="text"
              className="flex-1 h-12 px-4 rounded-md bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Send"}
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
