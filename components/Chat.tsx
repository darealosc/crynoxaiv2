"use client";
import React, { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chat-messages");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("chat-messages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    let aiMessage: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, aiMessage]);

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      aiMessage.content += chunk;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...aiMessage };
        return newMessages;
      });
    }

    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-white">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-xl whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-blue-600 ml-auto"
                : "bg-gray-700 mr-auto"
            }`}
          >
            {m.content}
          </div>
        ))}

        {isTyping && (
          <div className="p-3 bg-gray-700 rounded-xl max-w-xs flex items-center space-x-2">
            <span className="animate-pulse">AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 flex border-t border-gray-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
