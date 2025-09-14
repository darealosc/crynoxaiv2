"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { SidebarDemo1 } from "./tools";
import { Clipboard, X, Plus, Trash2 } from "lucide-react";
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
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<{ id: number; history: { prompt: string; response: string }[] }[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ai-chats");
    if (stored) {
      const parsed = JSON.parse(stored);
      setChats(parsed);
      if (parsed.length > 0) setActiveChat(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ai-chats", JSON.stringify(chats));
  }, [chats]);

  const handleSubmit = async () => {
    if (!prompt.trim() || activeChat === null) return;
    setLoading(true);
    try {
      const systemPrompt = "Just a helpful AI!";
      const fullPrompt = systemPrompt + prompt;
      const res = await axios.post("http://127.0.0.1:11434/v1/completions", {
        model: "mistral",
        prompt: fullPrompt,
      });
      if (res.data.choices && res.data.choices[0]?.text) {
        const aiResponse = res.data.choices[0].text;
        setResponse(aiResponse);
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat
              ? { ...chat, history: [{ prompt, response: aiResponse }, ...chat.history] }
              : chat
          )
        );
        setPrompt("");
      } else {
        setResponse("Error: Unexpected response structure.");
      }
    } catch {
      setResponse("Error: Could not get a response.");
    }
    setLoading(false);
  };

  const deletePrompt = (chatId: number, idx: number) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, history: chat.history.filter((_, i) => i !== idx) }
          : chat
      )
    );
  };

  const newChat = () => {
    const id = Date.now();
    setChats([{ id, history: [] }, ...chats]);
    setActiveChat(id);
    setPrompt("");
    setResponse("");
  };

  const deleteChat = (id: number) => {
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    if (updated.length > 0) {
      setActiveChat(updated[0].id);
      setResponse(updated[0].history[0]?.response || "");
    } else {
      setActiveChat(null);
      setResponse("");
    }
  };

  const activeHistory = chats.find((c) => c.id === activeChat)?.history || [];

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-6">
      <div className="flex flex-row w-full max-w-6xl gap-6">
        <div className="w-1/3 flex flex-col bg-neutral-900/50 backdrop-blur-md rounded-md p-4 shadow-md border border-white/10 max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <button onClick={newChat} className="p-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="w-4 h-4" />
            </button>
            {activeChat !== null && (
              <button
                onClick={() => deleteChat(activeChat)}
                className="p-2 rounded-md bg-red-600 hover:bg-red-500 text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <ul className="space-y-2 text-sm text-white/80">
            {activeHistory.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-start gap-2 p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-all duration-300 ease-in-out transform"
              >
                <div
                  className="flex-1 cursor-pointer max-w-[90%] break-words"
                  onClick={() => {
                    setPrompt(item.prompt);
                    setResponse(item.response);
                  }}
                >
                  <p className="font-medium text-white">{item.prompt}</p>
                  <p className="text-xs text-gray-400 truncate">{item.response}</p>
                </div>
                <button
                  onClick={() => deletePrompt(activeChat, idx)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col w-2/3 gap-4">
          <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-md p-6 shadow-lg border border-white/20 min-h-[300px] max-h-[400px] overflow-y-auto text-white space-y-3 custom-scrollbar animate-fadeIn">
            <div className="prose prose-invert max-w-none space-y-3">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  strong: ({ node, ...props }) => (
                    <strong {...props} className="text-white font-bold" />
                  ),
                  code: ({ inline, className, children, ...props }: any) => {
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
                    <p {...props} className="m-0 leading-relaxed max-w-[90%] break-words" />
                  ),
                }}
              >
                {response || "Responses will appear here..."}
              </ReactMarkdown>
            </div>
          </div>
          <textarea
            className="w-full h-24 resize-none p-4 rounded-xl bg-white/10 backdrop-blur-md border text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something..."
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-500/80 backdrop-blur-md text-white font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Loading...
              </span>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AIPage() {
  return (
    <SidebarDemo1>
      <Dashboard />
    </SidebarDemo1>
  );
}
