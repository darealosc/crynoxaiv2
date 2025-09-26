"use client";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clipboard, Trash2, Plus, Upload, FileText, X, RotateCcw, ChevronLeft, ChevronRight, Settings, Save } from "lucide-react";
import "../app/globals.css";
import type { Chat, ChatMessage, PDFProcessingResponse, FlashCard } from "../types/pdf";

// 🔹 Settings interface
interface StudySettings {
  subjects: string[];
  customSubjects: string[];
  flashcardCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

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

// 🔹 Enhanced Flashcard Component
function Flashcard({ card }: { card: FlashCard }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-full max-w-lg mx-auto aspect-[3/2] bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-2xl shadow-2xl flex items-center justify-center text-center cursor-pointer transition-all duration-700 transform hover:scale-105 p-6 overflow-auto"
      onClick={() => setFlipped(!flipped)}
      style={{
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="text-sm font-medium opacity-75 uppercase tracking-wide">
          {!flipped ? "Question" : "Answer"}
        </div>
        <div className="text-lg font-semibold leading-relaxed">
          {!flipped ? card.question : card.answer}
        </div>
        <div className="text-xs opacity-60 flex items-center gap-2">
          <RotateCcw className="w-3 h-3" />
          Click to flip
        </div>
      </div>
    </div>
  );
}

// 🔹 Enhanced Multi-Card Viewer
function FlashcardViewer({ cards }: { cards: FlashCard[] }) {
  const [index, setIndex] = useState(0);
  const card = cards[index];

  const nextCard = () => setIndex((prev) => (prev + 1) % cards.length);
  const prevCard = () => setIndex((prev) => (prev - 1 + cards.length) % cards.length);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🧠 Flashcards
          </h3>
          <div className="bg-blue-600/20 px-3 py-1 rounded-full">
            <span className="text-blue-300 text-sm font-medium">
              {index + 1} of {cards.length}
            </span>
          </div>
        </div>

        <Flashcard card={card} />

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevCard}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-1">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? "bg-blue-500" : "bg-slate-600 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextCard}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 🔹 Settings Modal Component
function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}: { 
  isOpen: boolean;
  onClose: () => void;
  settings: StudySettings;
  onSettingsChange: (settings: StudySettings) => void;
}) {
  const [localSettings, setLocalSettings] = useState<StudySettings>(settings);
  const [newSubject, setNewSubject] = useState("");

  const defaultSubjects = [
    'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Computer Science',
    'History', 'Literature', 'Psychology', 'Economics', 'Geography',
    'Philosophy', 'Sociology', 'Political Science', 'Art History', 'Music Theory'
  ];

  const addCustomSubject = () => {
    if (newSubject.trim() && !localSettings.customSubjects.includes(newSubject.trim())) {
      setLocalSettings({
        ...localSettings,
        customSubjects: [...localSettings.customSubjects, newSubject.trim()]
      });
      setNewSubject("");
    }
  };

  const removeCustomSubject = (subject: string) => {
    setLocalSettings({
      ...localSettings,
      customSubjects: localSettings.customSubjects.filter(s => s !== subject)
    });
  };

  const toggleSubject = (subject: string) => {
    const isSelected = localSettings.subjects.includes(subject);
    setLocalSettings({
      ...localSettings,
      subjects: isSelected 
        ? localSettings.subjects.filter(s => s !== subject)
        : [...localSettings.subjects, subject]
    });
  };

  const saveSettings = () => {
    onSettingsChange(localSettings);
    localStorage.setItem('studySettings', JSON.stringify(localSettings));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Study Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Subject Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">📚 Preferred Subjects</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {defaultSubjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`p-3 rounded-lg text-sm font-medium transition ${
                    localSettings.subjects.includes(subject)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Custom Subjects */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Add custom subject..."
                  className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSubject()}
                />
                <button
                  onClick={addCustomSubject}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition"
                >
                  Add
                </button>
              </div>

              {localSettings.customSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {localSettings.customSubjects.map(subject => (
                    <div key={subject} className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                      {subject}
                      <button
                        onClick={() => removeCustomSubject(subject)}
                        className="hover:bg-purple-700 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Flashcard Count */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">🎯 Flashcard Count</h3>
            <select
              value={localSettings.flashcardCount}
              onChange={(e) => setLocalSettings({...localSettings, flashcardCount: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 Flashcards</option>
              <option value={8}>8 Flashcards</option>
              <option value={10}>10 Flashcards</option>
              <option value={15}>15 Flashcards</option>
              <option value={20}>20 Flashcards</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">⚡ Difficulty Level</h3>
            <div className="flex gap-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setLocalSettings({...localSettings, difficulty: level})}
                  className={`flex-1 p-3 rounded-lg font-medium capitalize transition ${
                    localSettings.difficulty === level
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
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
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<StudySettings>({
    subjects: ['Biology', 'Chemistry', 'Physics', 'Mathematics'],
    customSubjects: [],
    flashcardCount: 8,
    difficulty: 'intermediate'
  });
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

    const storedSettings = localStorage.getItem("studySettings");
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  // 🔹 Submit normal chat
  const handleSubmit = async () => {
    if (!prompt.trim() || activeChat === null) return;
    await runOllama(prompt, "chat");
  };

  // 🔹 Submit flashcards with settings
  const handleFlashcards = async () => {
    if (!prompt.trim() || activeChat === null) return;

    const subjectContext = settings.subjects.length > 0 
      ? `Focus on concepts from: ${[...settings.subjects, ...settings.customSubjects].join(', ')}`
      : '';

    const flashcardPrompt = `Create exactly ${settings.flashcardCount} study flashcards from the following content at ${settings.difficulty} difficulty level. ${subjectContext}

Format your response as a JSON array like this:
[
  {"question": "What is...", "answer": "The answer is..."}
]

Content: ${prompt}

Return ONLY the JSON array, no other text:`;

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
      const subjectContext = settings.subjects.length > 0 
        ? `Focus on concepts from: ${[...settings.subjects, ...settings.customSubjects].join(', ')}`
        : '';

      const formData = new FormData();
      formData.append('pdf', uploadedPDF);
      formData.append('question', `Create exactly ${settings.flashcardCount} comprehensive study flashcards from this document at ${settings.difficulty} difficulty level. ${subjectContext} Return only a JSON array: [{"question": "...", "answer": "..."}]. Make sure the flashcards are about the actual subject matter in the document.`);

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
          model: "llama3.2-vision:latest",
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

  const handlePDFUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (file.size > 10 * 1024 * 1024) {
        alert('PDF file is too large. Please select a file smaller than 10MB.');
        return;
      }
      setUploadedPDF(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const removePDF = () => {
    setUploadedPDF(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    <div className="flex items-center justify-center min-h-screen w-full p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex flex-row w-full max-w-7xl h-[92vh] mx-auto gap-4">
        {/* Sidebar */}
        <div className="w-80 flex flex-col bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 shadow-2xl border border-slate-700/50 h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Conversations</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSettings(true)} 
                className="p-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all duration-200 shadow-lg"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={newChat} 
                className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Current Settings Display */}
          <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="text-sm text-slate-300">
              <div className="flex justify-between items-center mb-1">
                <span>📚 Subjects:</span>
                <span className="text-blue-400">{settings.subjects.length + settings.customSubjects.length}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span>🎯 Cards:</span>
                <span className="text-green-400">{settings.flashcardCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>⚡ Level:</span>
                <span className="text-purple-400 capitalize">{settings.difficulty}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {chats.map((chat) => (
              <div key={chat.id} className="group">
                <button
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeChat === chat.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-slate-700/30 text-slate-200 hover:bg-slate-600/50"
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm">
                      {chat.history[0]?.content?.slice(0, 30) || "New chat"}...
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-300 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 h-full bg-slate-800/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50">
          {/* Messages */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            {activeHistory.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎓</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Welcome {firstName || "Student"}!
                  </h2>
                  <p className="text-slate-400 mb-4">
                    Upload a PDF to analyze or start a conversation
                  </p>
                  <p className="text-sm text-slate-500">
                    Current subjects: {[...settings.subjects, ...settings.customSubjects].join(', ')}
                  </p>
                </div>
              </div>
            )}

            {activeHistory.map((msg: ChatMessage, idx: number) => (
              <div key={idx} className="mb-6 w-full flex flex-col gap-2">
                <div
                  className={`max-w-[80%] px-5 py-4 rounded-xl ${
                    msg.role === "user" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white self-end" 
                      : "bg-slate-700/50 text-white self-start"
                  }`}
                >
                  {msg.type === "flashcards" && msg.role === "assistant" ? (
                    (() => {
                      try {
                        // Clean the JSON response
                        let cleanedContent = msg.content.trim();
                        
                        // Remove any markdown formatting
                        cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                        
                        // Find JSON array in the text
                        const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
                        if (jsonMatch) {
                          cleanedContent = jsonMatch[0];
                        }
                        
                        const flashcards: FlashCard[] = JSON.parse(cleanedContent);
                        
                        if (Array.isArray(flashcards) && flashcards.length > 0 && 
                            flashcards[0].question && flashcards[0].answer) {
                          return <FlashcardViewer cards={flashcards} />;
                        } else {
                          return (
                            <div className="text-red-400">
                              <p>Invalid flashcard format. Expected array with question/answer objects.</p>
                              <details className="mt-2">
                                <summary className="cursor-pointer">Show raw response</summary>
                                <pre className="text-xs mt-1 whitespace-pre-wrap">{msg.content}</pre>
                              </details>
                            </div>
                          );
                        }
                      } catch (error) {
                        return (
                          <div className="text-red-400">
                            <p>Error parsing flashcards: {error instanceof Error ? error.message : 'Unknown error'}</p>
                            <details className="mt-2">
                              <summary className="cursor-pointer">Show raw response</summary>
                              <pre className="text-xs mt-1 whitespace-pre-wrap">{msg.content}</pre>
                            </details>
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre: ({ children }) => (
                          <div className="relative">
                            <pre className="bg-neutral-900 p-4 rounded-lg overflow-x-auto text-sm">
                              {children}
                            </pre>
                            <CopyButton code={String(children)} />
                          </div>
                        ),
                        code: ({ node, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <div className="relative">
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                              <CopyButton code={String(children)} />
                            </div>
                          ) : (
                            <code className="bg-neutral-700 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => (
                          <p className="mb-2 leading-relaxed">{children}</p>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-6">
                <div className="bg-slate-700/50 px-5 py-4 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="animate-bounce w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="animate-bounce w-3 h-3 bg-blue-500 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                    <div className="animate-bounce w-3 h-3 bg-blue-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 p-6 rounded-b-2xl border-t border-slate-600/30 backdrop-blur-sm">
            {/* PDF Upload and Flashcards Row */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold flex items-center gap-2 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Upload className="w-5 h-5" />
                Upload PDF
              </button>

              <button
                onClick={handleFlashcards}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                disabled={loading || !prompt.trim()}
                title={`Create ${settings.flashcardCount} flashcards from text (${settings.difficulty} level)`}
              >
                📚 Text Flashcards ({settings.flashcardCount})
              </button>

              {uploadedPDF && (
                <button
                  onClick={handlePDFFlashcards}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                  disabled={pdfLoading}
                  title={`Create ${settings.flashcardCount} flashcards from PDF (${settings.difficulty} level)`}
                >
                  {pdfLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      📄 PDF Flashcards ({settings.flashcardCount})
                    </>
                  )}
                </button>
              )}

              <div className="flex-1"></div>

              {uploadedPDF && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 px-4 py-2 rounded-lg border border-slate-500/30 backdrop-blur-sm">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-medium text-sm max-w-[200px] truncate">{uploadedPDF.name}</span>
                  <button
                    onClick={removePDF}
                    className="p-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Main Input Row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600/50 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 backdrop-blur-sm"
                  rows={3}
                  placeholder={uploadedPDF ? "Ask about the PDF content or enter text for flashcards..." : "Ask a question or enter text for flashcards..."}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {prompt.length}/1000
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                  disabled={loading || pdfLoading || !prompt.trim()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      💬 Chat
                    </>
                  )}
                </button>

                {uploadedPDF && prompt.trim() && (
                  <button
                    onClick={handlePDFQuestion}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                    disabled={pdfLoading}
                    title="Ask a specific question about the PDF"
                  >
                    {pdfLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Asking...
                      </>
                    ) : (
                      <>
                        🔍 Ask PDF
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Helper text */}
            <div className="text-xs text-slate-400 bg-slate-800/30 rounded-lg p-3 border border-slate-600/30 backdrop-blur-sm">
              {uploadedPDF ? (
                <span>💡 <strong>PDF Mode:</strong> Create {settings.flashcardCount} flashcards from your text input, generate flashcards from the entire PDF content, or ask specific questions about the PDF document ({settings.difficulty} level)</span>
              ) : (
                <span>💡 <strong>Study Mode:</strong> Enter text to create {settings.flashcardCount} flashcards, or upload a PDF to analyze documents and create study materials. Current subjects: {[...settings.subjects, ...settings.customSubjects].slice(0, 3).join(', ')}{settings.subjects.length + settings.customSubjects.length > 3 ? '...' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
};

export default Dashboard;