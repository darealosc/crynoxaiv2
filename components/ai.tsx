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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [infiniteTokens, setInfiniteTokens] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState("");

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

  const handleSubmit = async () => {
    if (!prompt.trim() || activeChat === null) return;
    setLoading(true);
    try {
      const systemPrompt = "Just a helpful AI!";
      const fullPrompt = systemPrompt + prompt;
      const formData = new FormData();
      formData.append("prompt", fullPrompt);
      formData.append("infiniteTokens", String(infiniteTokens));
      if (imageFile) formData.append("image", imageFile);
      if (pdfFile) formData.append("pdf", pdfFile);
      const res = await axios.post("http://localhost:3001/generate", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data && res.data.response) {
        const aiResponse = typeof res.data.response === 'string' ? res.data.response : JSON.stringify(res.data.response);
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

  const activeHistory = activeChat === null ? [] : (chats.find((c) => c.id === activeChat)?.history || []);

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-black">
      <div className="flex flex-row w-full max-w-6xl h-[90vh] mx-auto gap-4">
  <div className="w-[320px] flex flex-col bg-[#181818] rounded-xl p-4 shadow border border-[#333] h-full">
          <div className="flex items-center justify-between mb-2">
            <button onClick={newChat} className="p-2 rounded bg-[#222] text-white text-lg"><Plus /></button>
            {activeChat !== null && (
              <button onClick={() => deleteChat(activeChat)} className="p-2 rounded bg-[#222] text-red-400"><Trash2 /></button>
            )}
          </div>
          <div className="flex-1">
            {chats.map((chat) => (
              <div key={chat.id} className={`mb-2`}>
                <button
                  className={`w-full text-left px-3 py-2 rounded bg-[#222] text-white text-sm ${activeChat === chat.id ? 'border border-blue-500' : 'border border-transparent'}`}
                  onClick={() => { setActiveChat(chat.id); setResponse(chat.history[0]?.response || ""); }}
                >
                  {chat.history[0]?.prompt || "New chat"}
                </button>
              </div>
            ))}
          </div>
        </div>
  <div className="flex flex-col flex-1 h-full bg-[#222] rounded-xl shadow border border-[#333]">
          <div className="flex-1 px-6 py-6" style={{ minHeight: 0 }}>
            {activeHistory.length === 0 && (
              <div className="flex items-center justify-center h-full text-white/60 text-lg font-medium">No messages yet. Start the conversation!</div>
            )}
            {activeHistory.map((item, idx) => (
              <div key={idx} className={`mb-6 w-full flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}> 
                <div className={`max-w-[80%] px-5 py-4 rounded-xl ${idx % 2 === 0 ? 'bg-[#181818] text-white' : 'bg-[#333] text-white'}`}
                  style={{ wordBreak: 'break-word' }}>
                  <div className="text-xs font-semibold mb-1">{idx % 2 === 0 ? 'You:' : 'AI:'}</div>
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
                    {idx % 2 === 0 ? item.prompt : item.response}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-[#333] bg-[#181818]">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="flex-1 h-12 px-4 rounded bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask something..."
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="image-upload" className="px-4 py-2 rounded bg-[#222] text-white cursor-pointer border border-[#333]">Image</label>
              <input
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                id="pdf-upload"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="pdf-upload" className="px-4 py-2 rounded bg-[#222] text-white cursor-pointer border border-[#333]">File</label>
              <input
                type="text"
                className="px-4 py-2 rounded bg-[#222] text-white border border-[#333] w-32"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste URL"
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minWidth: '100px' }}
              >
                Send
              </button>
            </div>
            {(imageFile || pdfFile) && (
              <div className="mt-2 flex gap-2 items-center">
                {imageFile && <span className="text-xs text-white bg-blue-700 px-2 py-1 rounded">{imageFile.name}</span>}
                {pdfFile && <span className="text-xs text-white bg-blue-700 px-2 py-1 rounded">{pdfFile.name}</span>}
                <button onClick={() => { setImageFile(null); setPdfFile(null); }} className="text-xs px-3 py-1 rounded bg-[#333] text-white">Clear</button>
              </div>
            )}
          </div>
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
