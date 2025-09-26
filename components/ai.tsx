"use client";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Clipboard, Trash2, Plus, Upload, FileText, X } from "lucide-react";
import "../app/globals.css";
import type { Chat, ChatMessage, PDFProcessingResponse, FlashCard } from "../types/pdf";

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
function Flashcard({ card }: { card: FlashCard }) {
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
function FlashcardViewer({ cards }: { cards: FlashCard[] }) {
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

const Dashboard: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [uploadedPDF, setUploadedPDF] = useState<File | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 🔹 Create flashcards from PDF content
  const handlePDFFlashcards = async () => {
    if (!uploadedPDF || activeChat === null) return;

    const userMessage: ChatMessage = { 
      role: "user", 
      content: `📄 Create flashcards from: ${uploadedPDF.name}`, 
      type: "flashcards" 
    };
    const assistantMessage: ChatMessage = { 
      role: "assistant", 
      content: "", 
      type: "flashcards" 
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? { ...chat, history: [...chat.history, userMessage, assistantMessage] }
          : chat
      )
    );

    setPdfLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', uploadedPDF);
      formData.append('question', 'Create comprehensive flashcards from this document. Return only a JSON array with question and answer fields.');

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      const data: PDFProcessingResponse = await response.json();

      if (response.ok && data.answer) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat
              ? {
                  ...chat,
                  history: chat.history.map((msg: ChatMessage, i: number) =>
                    msg.role === "assistant" && i === chat.history.length - 1
                      ? { ...msg, content: data.answer || "No flashcards created" }
                      : msg
                  ),
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('PDF flashcard error:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  // 🔹 Ollama runner
  const runOllama = async (input: string, type: "chat" | "flashcards") => {
    const userMessage: ChatMessage = { role: "user", content: prompt, type };
    const assistantMessage: ChatMessage = { role: "assistant", content: "", type };

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
                    history: chat.history.map((msg: ChatMessage, i: number) =>
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

  // 🔹 Handle PDF upload
  const handlePDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        alert('PDF file is too large. Please select a file smaller than 10MB.');
        return;
      }
      setUploadedPDF(file);
      console.log('PDF selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    } else {
      alert('Please select a valid PDF file');
    }
  };

  // 🔹 Remove uploaded PDF
  const removePDF = () => {
    setUploadedPDF(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 🔹 Ask question about PDF
  const handlePDFQuestion = async () => {
    if (!uploadedPDF || !prompt.trim() || activeChat === null) return;

    const userMessage: ChatMessage = { 
      role: "user", 
      content: `📄 ${uploadedPDF.name}: ${prompt}`, 
      type: "pdf" 
    };
    const assistantMessage: ChatMessage = { 
      role: "assistant", 
      content: "", 
      type: "pdf" 
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? { ...chat, history: [...chat.history, userMessage, assistantMessage] }
          : chat
      )
    );

    const currentPrompt = prompt;
    setPrompt("");
    setPdfLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', uploadedPDF);
      formData.append('question', currentPrompt);

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      const data: PDFProcessingResponse = await response.json();

      if (response.ok && data.answer) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat
              ? {
                  ...chat,
                  history: chat.history.map((msg: ChatMessage, i: number) =>
                    msg.role === "assistant" && i === chat.history.length - 1
                      ? { ...msg, content: data.answer || "No response received" }
                      : msg
                  ),
                }
              : chat
          )
        );
      } else {
        throw new Error(data.error || 'Failed to process PDF');
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat
            ? {
                ...chat,
                history: chat.history.map((msg: ChatMessage, i: number) =>
                  msg.role === "assistant" && i === chat.history.length - 1
                    ? { ...msg, content: `Sorry, I couldn't process the PDF: ${errorMessage}` }
                    : msg
                ),
              }
            : chat
        )
      );
    } finally {
      setPdfLoading(false);
    }
  };

  const activeHistory = activeChat === null ? [] : chats.find((c) => c.id === activeChat)?.history || [];

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
                Hey {firstName || "User"}, Start a new chat or upload a PDF to analyze!
              </div>
            )}
            {activeHistory.map((msg: ChatMessage, idx: number) => (
              <div key={idx} className="mb-6 w-full flex flex-col gap-2">
                <div
                  className={`max-w-[80%] px-5 py-4 rounded-xl ${
                    msg.role === "user" ? "bg-[#181818]" : "bg-[#333]"
                  } text-white self-start`}
                >
                  <div className="text-xs font-semibold mb-1 flex items-center gap-2">
                    {msg.role === "user" ? "You:" : "AI:"}
                    {msg.type === "pdf" && <FileText className="w-3 h-3 text-orange-400" />}
                    {msg.type === "flashcards" && <span className="text-green-400">🧠</span>}
                  </div>

                  {/* 🔹 Flashcard Renderer */}
                  {msg.type === "flashcards" && msg.role === "assistant" ? (
                    (() => {
                      try {
                        const start = msg.content.indexOf("[")
                        const end = msg.content.lastIndexOf("]") + 1;
                        const json = msg.content.substring(start, end);
                        const parsed = JSON.parse(json);
                        return <FlashcardViewer cards={parsed} />;
                      } catch (error) {
                        console.error("Error parsing flashcards JSON:", error);
                        return <div>Error displaying flashcards</div>;
                      }
                    })()
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre: ({ children }) => {
                          let code = "";
                          let language = "";
                          if (
                            Array.isArray(children) &&
                            children[0] &&
                            typeof children[0] === "object" &&
                            "props" in children[0]
                          ) {
                            const childProps = (children[0] as any).props;
                            const codeChild = childProps?.children;
                            if (typeof codeChild === "string") {
                              code = codeChild;
                            } else if (Array.isArray(codeChild)) {
                              code = codeChild.join("");
                            }
                            language = childProps?.className?.split("-")[1] || "";
                          }
                          return (
                            <div className="relative max-h-[500px] overflow-auto rounded-lg bg-[#1e1e1e] p-4">
                              <CopyButton code={code} />
                              <SyntaxHighlighter
                                language={language}
                                style={oneDark}
                                showLineNumbers
                                className="!rounded-lg"
                              >
                                {code}
                              </SyntaxHighlighter>
                            </div>
                          );
                        },
                        // Add 'p' and 'div' to apply className for prose styling
                        p: ({ children }) => (
                          <p className="prose prose-invert max-w-full">{children}</p>
                        ),
                        div: ({ children }) => (
                          <div className="prose prose-invert max-w-full">{children}</div>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} className="h-4"></div>
          </div>

          {/* Input area */}
          <div className="bg-[#181818] p-4 rounded-b-xl border-t border-[#333]">
            {/* PDF Upload Row */}
            <div className="flex gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload PDF
              </button>
              {uploadedPDF && (
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span className="text-white truncate text-sm">{uploadedPDF.name}</span>
                  <button
                    onClick={removePDF}
                    className="p-2 rounded bg-red-600 hover:bg-red-500 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Main Input Row */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 px-4 py-2 rounded bg-[#333] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder={uploadedPDF ? "Ask about the PDF or enter text for flashcards..." : "Ask a question or enter text for flashcards..."}
              />
              <button
                onClick={uploadedPDF && prompt.trim() ? handlePDFQuestion : handleSubmit}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
                disabled={loading || pdfLoading || !prompt.trim()}
              >
                {loading || pdfLoading ? "Processing..." : uploadedPDF ? "Ask PDF" : "Send"}
              </button>
            </div>

            {/* Action Buttons Row - Always Available */}
            <div className="flex flex-wrap gap-2">
              {/* Text Flashcards - Always available when there's text input */}
              <button
                onClick={handleFlashcards}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !prompt.trim()}
                title="Create flashcards from the text you've entered"
              >
                📚 Text Flashcards
              </button>

              {/* PDF Flashcards - Only when PDF is uploaded */}
              {uploadedPDF && (
                <button
                  onClick={handlePDFFlashcards}
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pdfLoading}
                  title="Create flashcards from the entire PDF content"
                >
                  {pdfLoading ? "Processing..." : "📄 PDF Flashcards"}
                </button>
              )}

              {/* PDF Question - Only when PDF is uploaded and text is entered */}
              {uploadedPDF && prompt.trim() && (
                <button
                  onClick={handlePDFQuestion}
                  className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={pdfLoading}
                  title="Ask a specific question about the PDF"
                >
                  {pdfLoading ? "Asking..." : "🔍 Ask PDF"}
                </button>
              )}
            </div>

            {/* Helper text */}
            <div className="mt-2 text-xs text-gray-400">
              {uploadedPDF ? (
                <span>💡 You can create flashcards from text input, generate flashcards from the entire PDF, or ask specific questions about the PDF</span>
              ) : (
                <span>💡 Enter text to create flashcards, or upload a PDF to analyze documents</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;